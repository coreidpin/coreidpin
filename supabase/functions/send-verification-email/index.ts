import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'no-reply@useswipe.xyz';

serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: { 
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      } 
    });
  }

  try {
    const { email, name } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Rate limiting: 1 request per minute per email
    const rateLimitKey = `rate_limit:verification:${email}`;
    const kv = await Deno.openKv();
    
    const rateLimitEntry = await kv.get([rateLimitKey]);
    if (rateLimitEntry.value) {
      const lastSent = rateLimitEntry.value as number;
      const now = Date.now();
      const timeSinceLastSent = now - lastSent;
      const oneMinute = 60 * 1000;
      
      if (timeSinceLastSent < oneMinute) {
        const remainingSeconds = Math.ceil((oneMinute - timeSinceLastSent) / 1000);
        return new Response(
          JSON.stringify({ 
            error: `Rate limit exceeded. Please wait ${remainingSeconds} seconds before requesting another code.`,
            remainingSeconds 
          }),
          { status: 429, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
        );
      }
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Store verification code in Supabase (expires in 15 minutes)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    const { error: dbError } = await supabase
      .from('email_verifications')
      .insert({
        email,
        code: verificationCode,
        expires_at: expiresAt.toISOString(),
        verified: false,
      });

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ error: 'Failed to store verification code' }),
        { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // Update rate limit after successful code generation
    await kv.set([rateLimitKey], Date.now(), { expireIn: 60 * 1000 }); // Expires in 60 seconds

    // Send email via Resend
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
            .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; background: #f8f9fa; }
            .note { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔒 Verify Your Identity</h1>
            </div>
            <div class="content">
              <p>Hi${name ? ` ${name}` : ''},</p>
              <p>Thank you for registering with <strong>swipe</strong>! To complete your Professional Identity Number (PIN) registration, please use the verification code below:</p>
              
              <div class="code-box">
                <div class="code">${verificationCode}</div>
              </div>

              <div class="note">
                <strong>⏱️ This code expires in 15 minutes</strong>
              </div>

              <p>If you didn't request this code, please ignore this email or contact our support team.</p>
              
              <p style="margin-top: 30px;">
                Best regards,<br>
                <strong>The swipe Team</strong><br>
                🇳🇬 Built with pride in Nigeria
              </p>
            </div>
            <div class="footer">
              <p>© 2025 swipe. All rights reserved.</p>
              <p>Professional Identity Network | Blockchain-Secured | AI-Verified</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: email,
        subject: 'Your swipe Verification Code',
        html: emailHtml,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error('Resend error:', resendData);
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: resendData }),
        { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Verification code sent successfully',
        emailId: resendData.id 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }
});
