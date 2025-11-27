import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const json = (body: Record<string, unknown>, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  if (req.method !== 'POST') {
    return json({ success: false, error_code: 'ERR_METHOD', message: 'Method not allowed' }, 405);
  }

  let payload: { email?: string; code?: string };
  try {
    payload = await req.json();
  } catch {
    return json({ success: false, error_code: 'ERR_BAD_REQUEST', message: 'Invalid JSON body' }, 400);
  }

  const { email, code } = payload;
  if (!email || !code) {
    return json({ success: false, error_code: 'ERR_BAD_REQUEST', message: 'Email and code are required' }, 400);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseKey =
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ||
    Deno.env.get('SUPABASE_SERVICE_KEY') ||
    Deno.env.get('SERVICE_ROLE_KEY') ||
    Deno.env.get('SERVICE_KEY') ||
    '';
  if (!supabaseUrl || !supabaseKey) {
    console.error('config_error', { missing: ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'] });
    return json({ success: false, error_code: 'ERR_SERVER_CONFIG', message: 'Server not configured' }, 500);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const normalizedEmail = String(email).trim().toLowerCase();
  const { data: profileRow, error: profileErr } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('email', normalizedEmail)
    .limit(1)
    .maybeSingle();
  if (profileErr) {
    console.error('profile_lookup_error', { message: profileErr.message });
    return json({ success: false, error_code: 'ERR_PROFILE_LOOKUP', message: 'Profile lookup failed' }, 500);
  }
  if (!profileRow?.user_id) {
    return json({ success: false, error_code: 'ERR_NOT_FOUND', message: 'User not found for email' }, 404);
  }
  
  const userId = profileRow.user_id as string;

  const nowIso = new Date().toISOString();
  const { data: verRows, error: selErr } = await supabase
    .from('email_verifications')
    .select('id, token, expires_at, used_at')
    .eq('user_id', userId)
    .eq('token', String(code))
    .is('used_at', null)
    .gt('expires_at', nowIso)
    .limit(1);
  if (selErr) {
    console.error('verification_lookup_error', { message: selErr.message });
    return json({ success: false, error_code: 'ERR_VERIFICATION_LOOKUP', message: 'Verification lookup failed' }, 500);
  }
  if (!verRows || verRows.length === 0) {
    return json({ success: false, error_code: 'ERR_INVALID_CODE', message: 'Invalid or expired code' }, 400);
  }

  const row = verRows[0];
  const { error: updErr } = await supabase
    .from('email_verifications')
    .update({ used_at: new Date().toISOString(), status: 'verified' })
    .eq('id', row.id);
  if (updErr) {
    console.error('verification_update_error', { message: updErr.message });
    return json({ success: false, error_code: 'ERR_DB_UPDATE', message: 'Failed to mark code as used' }, 500);
  }

  // Update user's email_verified status in profiles
  const { error: updateProfileErr } = await supabase
    .from('profiles')
    .update({ email_verified: true })
    .eq('user_id', userId);

  if (updateProfileErr) {
    console.error('profile_update_error', { message: updateProfileErr.message });
    return json({ success: false, error_code: 'ERR_PROFILE_UPDATE', message: 'Failed to update profile' }, 500);
  }

  console.log('email_verified_success', { user_id: userId });
  return json({ success: true, message: 'Email verified successfully', user_id: userId, email: normalizedEmail }, 200);
});
