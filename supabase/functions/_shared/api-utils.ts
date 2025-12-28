import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

export interface APIKeyValidationResult {
  valid: boolean;
  businessId?: string;
  error?: string;
}

export async function validateAPIKey(
  supabase: SupabaseClient,
  authHeader: string | null
): Promise<APIKeyValidationResult> {
  if (!authHeader) {
    return { valid: false, error: 'Missing Authorization header' };
  }

  const match = authHeader.match(/^Bearer (.+)$/);
  if (!match) {
    return { valid: false, error: 'Invalid Authorization format. Use: Bearer YOUR_API_KEY' };
  }

  const apiKey = match[1];

  // Validate API key
  const { data, error } = await supabase
    .from('api_keys')
    .select('business_id, is_active, expires_at')
    .eq('key_hash', apiKey) // Note: In production, hash the key before comparison
    .single();

  if (error || !data) {
    return { valid: false, error: 'Invalid API key' };
  }

  if (!data.is_active) {
    return { valid: false, error: 'API key is inactive' };
  }

  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return { valid: false, error: 'API key has expired' };
  }

  return { valid: true, businessId: data.business_id };
}

export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

export function errorResponse(message: string, status: number = 400) {
  return new Response(
    JSON.stringify({ error: message }),
    {
      status,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    }
  );
}

export function successResponse(data: any, status: number = 200) {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    }
  );
}
