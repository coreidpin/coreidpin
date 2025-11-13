import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'no-reply@usepin.xyz';
const SITE_URL = Deno.env.get('SITE_URL') || 'https://usepin.xyz';
const ALLOW_CODE_ECHO = (Deno.env.get('ALLOW_CODE_ECHO') || '').toLowerCase() === 'true';

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

  let payload: { email?: string; name?: string };
  try {
    payload = await req.json();
  } catch {
    return json({ success: false, error_code: 'ERR_BAD_REQUEST', message: 'Invalid JSON body' }, 400);
  }

  const { email, name } = payload;
  if (!email) {
    return json({ success: false, error_code: 'ERR_BAD_REQUEST', message: 'Email is required' }, 400);
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
  try { await supabase.rpc('refresh_postgrest'); } catch { /* ignore */ }

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

  // Rate limit: 1 per minute per user
  const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString();
  const { data: recent, error: rateErr } = await supabase
    .from('email_verifications')
    .select('sent_at')
    .eq('user_id', userId)
    .gte('sent_at', oneMinuteAgo)
    .order('sent_at', { ascending: false })
    .limit(1);
  if (!rateErr && recent && recent.length > 0) {
    const lastSent = new Date(recent[0].sent_at as string).getTime();
    const remainingMs = 60_000 - (Date.now() - lastSent);
    if (remainingMs > 0) {
      const remainingSeconds = Math.ceil(remainingMs / 1000);
      return json({ success: false, error_code: 'ERR_RATE_LIMIT', message: 'Rate limit exceeded', remainingSeconds }, 429);
    }
  }

  // Generate code and insert
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 15 * 60_000).toISOString();
  const { error: insertErr } = await supabase
    .from('email_verifications')
    .insert({ user_id: userId, token: verificationCode, expires_at: expiresAt, method: 'code' });
  if (insertErr) {
    console.error('db_insert_error', { message: insertErr.message });
    return json({ success: false, error_code: 'ERR_DB_INSERT', message: 'Failed to store verification code' }, 500);
  }

  const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #bfa5ff 0%, #7bb8ff 100%); padding: 40px 20px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 28px; }
            .content { padding: 40px 30px; }
            .code-box { background: #f8f9fa; border: 2px solid #bfa5ff; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0; }
            .code { font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #bfa5ff; font-family: 'Courier New', monospace; }
            .verify-btn { display: inline-block; background: linear-gradient(135deg, #bfa5ff 0%, #7bb8ff 100%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 20px; }
            .verify-btn:hover { opacity: 0.9; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; background: #f8f9fa; }
            .note { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .divider { margin: 20px 0; border-top: 1px solid #e0e0e0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔒 Verify Your Identity</h1>
            </div>
            <div class="content">
              <p>Hi${name ? ` ${name}` : ''},</p>
              <p>Thank you for registering with <strong>usepin</strong>! To complete your Professional Identity Number (PIN) registration, click the button below:</p>
              <div style="text-align: center;">
                <a href="${SITE_URL}/auth/verify-email?code=${verificationCode}&email=${encodeURIComponent(normalizedEmail)}" class="verify-btn">Verify Email Address</a>
              </div>
              <div class="divider"></div>
              <p style="text-align: center; color: #666; font-size: 14px;">Or use this code:</p>
              <div class="code-box">
                <div class="code">${verificationCode}</div>
              </div>
              <div class="note">
                <strong>⏱️ This code expires in 15 minutes</strong>
              </div>
              <p>If you didn't request this code, please ignore this email or contact our support team.</p>
              <p style="margin-top: 30px;">
                Best regards,<br>
                <strong>The usepin Team</strong><br>
                🇳🇬 Built with pride in Nigeria
              </p>
            </div>
            <div class="footer">
              <p>© 2025 usepin. All rights reserved.</p>
              <p>Professional Identity Network | Blockchain-Secured | AI-Verified</p>
            </div>
          </div>
        </body>
      </html>
    `;

  const resendResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM_EMAIL, to: email, subject: 'Your usepin Verification Code', html: emailHtml }),
  });
  const resendData = await resendResponse.json();
  if (!resendResponse.ok) {
    console.error('email_send_error', { data: resendData });
    
    // Record failed send event
    await supabase.from('email_send_events').insert({
      user_id: userId,
      email: normalizedEmail,
      code: verificationCode,
      provider: 'resend',
      status: 'failed',
      response_message: String((resendData as Record<string, unknown>).message || 'Unknown error'),
      response_status: resendResponse.status,
    }).catch((err: unknown) => console.error('failed_to_log_send_event', err));
    
    const body: Record<string, unknown> = { success: false, error_code: 'ERR_EMAIL_SEND', message: 'Failed to send email', details: resendData };
    if (ALLOW_CODE_ECHO) body.debug_code = verificationCode;
    return json(body, 500);
  }

  console.log('verification_email_sent', { user_id: userId, email: normalizedEmail });
  
  // Record successful send event
  await supabase.from('email_send_events').insert({
    user_id: userId,
    email: normalizedEmail,
    code: verificationCode,
    provider: 'resend',
    status: 'sent',
    response_message: 'Email queued for delivery',
    response_status: 200,
    resend_id: String((resendData as Record<string, unknown>).id || ''),
  }).catch((err: unknown) => console.error('failed_to_log_send_event', err));
  
  const successBody: Record<string, unknown> = { success: true, message: 'Verification code sent', emailId: resendData.id };
  if (ALLOW_CODE_ECHO) successBody.debug_code = verificationCode;
  return json(successBody, 200);
});
