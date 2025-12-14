import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { corsHeaders } from '../_shared/cors.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface RefreshRequest {
  refreshToken: string;
}

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  userId: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { refreshToken }: RefreshRequest = await req.json();

    if (!refreshToken) {
      return new Response(
        JSON.stringify({ error: 'Refresh token required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('🔄 Processing token refresh request...');

    // 1. Validate refresh token exists and is active
    const { data: session, error: sessionError } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('refresh_token', refreshToken)
      .eq('is_active', true)
      .maybeSingle();

    if (sessionError || !session) {
      console.error('❌ Invalid refresh token:', sessionError);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid refresh token',
          code: 'INVALID_REFRESH_TOKEN'
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // 2. Check if refresh token expired
    const expiresAt = new Date(session.refresh_token_expires_at);
    if (expiresAt < new Date()) {
      console.log('⚠️ Refresh token expired');
      
      // Mark session as inactive
      await supabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('id', session.id);

      return new Response(
        JSON.stringify({ 
          error: 'Refresh token expired. Please log in again.',
          code: 'REFRESH_TOKEN_EXPIRED'
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('✅ Refresh token valid for user:', session.user_id);

    // 3. Generate new access token (JWT)
    const newAccessToken = await generateAccessToken(session.user_id);
    const newExpiresAt = Date.now() + (60 * 60 * 1000); // 1 hour

    // 4. Optionally rotate refresh token (10% of the time for security)
    const shouldRotate = Math.random() < 0.1;
    let newRefreshToken = refreshToken;

    if (shouldRotate) {
      console.log('🔄 Rotating refresh token...');
      newRefreshToken = generateRefreshToken();
      
      await supabase
        .from('user_sessions')
        .update({
          refresh_token: newRefreshToken,
          last_refreshed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', session.id);
    } else {
      await supabase
        .from('user_sessions')
        .update({
          last_refreshed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', session.id);
    }

    console.log('✅ Token refresh successful');

    // 5. Return new tokens
    const response: RefreshResponse = {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresAt: newExpiresAt,
      userId: session.user_id
    };

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('❌ Error in auth-refresh:', error);
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

// Helper: Generate access token
async function generateAccessToken(userId: string): Promise<string> {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: userId,
    iat: now,
    exp: now + (60 * 60), // 1 hour
    aud: 'authenticated',
    role: 'authenticated'
  };

  const secret = Deno.env.get('SUPABASE_JWT_SECRET');
  if (!secret) {
    throw new Error('SUPABASE_JWT_SECRET not configured');
  }

  const encoder = new TextEncoder();
  
  // Encode header and payload
  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '');
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, '');
  const data = `${headerB64}.${payloadB64}`;
  
  // Sign with HMAC-SHA256
  const keyData = encoder.encode(secret);
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(data));
  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  
  return `${data}.${signatureB64}`;
}

// Helper: Generate refresh token
function generateRefreshToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}
