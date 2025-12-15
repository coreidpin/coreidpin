import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { corsHeaders } from '../_shared/cors.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface CreateSessionRequest {
  userId: string;
  refreshToken: string;
  deviceInfo?: {
    userAgent?: string;
    platform?: string;
    deviceName?: string;
  };
}

interface CreateSessionResponse {
  success: boolean;
  sessionId: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userId, refreshToken, deviceInfo }: CreateSessionRequest = await req.json();

    if (!userId || !refreshToken) {
      return new Response(
        JSON.stringify({ error: 'userId and refreshToken required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('📝 Creating session for user:', userId);

    // Get IP address from request
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                      req.headers.get('x-real-ip') ||
                      'unknown';

    // Create session in database
    const { data, error } = await supabase
      .from('user_sessions')
      .insert({
        user_id: userId,
        refresh_token: refreshToken,
        device_info: deviceInfo || {},
        ip_address: ipAddress,
        is_active: true,
        last_refreshed_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (error) {
      console.error('❌ Error creating session:', error);
      throw error;
    }

    console.log('✅ Session created:', data.id);

    const response: CreateSessionResponse = {
      success: true,
      sessionId: data.id
    };

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('❌ Error in auth-create-session:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
