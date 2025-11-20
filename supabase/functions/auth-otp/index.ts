import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { createClient } from "npm:@supabase/supabase-js";

const app = new Hono();

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

app.use("/*", cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization", "X-CSRF-Token", "apikey"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: false,
}));

// Helper to hash data
async function hashData(data: string, salt: string = ''): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Helper to generate OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const handleRequest = async (c: any) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    let { contact, contact_type } = body; // contact_type: 'phone' | 'email'

    if (!contact || !contact_type) {
      return c.json({ error: 'Contact and contact_type required' }, 400);
    }

    // Normalize contact
    contact = contact.trim().toLowerCase();

    // 1. Hash contact for lookup
    const contactHash = await hashData(contact, Deno.env.get('SERVER_SALT') ?? 'default-salt');

    // 2. Generate OTP
    const otp = generateOTP();
    const otpHash = await hashData(otp); // Hash OTP before storing

    // 3. Store in otps table
    const insertData = {
      contact_hash: contactHash,
      otp_hash: otpHash,
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      attempts: 0,
      used: false
    };
    
    console.log('Inserting OTP record:', { 
      contact_hash_preview: contactHash.substring(0, 10),
      otp_hash_preview: otpHash.substring(0, 10),
      expires_at: insertData.expires_at
    });
    
    const { data: insertedData, error: dbError } = await supabase
      .from('otps')
      .insert(insertData)
      .select()
      .single();

    if (dbError) {
      console.error('OTP storage error:', dbError);
      return c.json({ error: 'Failed to generate OTP' }, 500);
    }
    
    console.log('OTP record inserted successfully:', { id: insertedData?.id });

    // 4. Send OTP
    if (contact_type === 'email') {
      const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
      const FROM_EMAIL = Deno.env.get('FROM_EMAIL');

      if (!RESEND_API_KEY || !FROM_EMAIL) {
        console.error('Resend configuration missing');
        return c.json({ error: 'Server configuration error' }, 500);
      }

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: `CoreID <${FROM_EMAIL}>`,
          to: contact,
          subject: 'Your CoreID Verification Code',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Verification Code</h2>
              <p>Your verification code is:</p>
              <h1 style="font-size: 32px; letter-spacing: 5px; background: #f4f4f5; padding: 20px; text-align: center; border-radius: 8px;">${otp}</h1>
              <p>This code will expire in 10 minutes.</p>
              <p>If you didn't request this code, you can safely ignore this email.</p>
            </div>
          `
        })
      });

      if (!res.ok) {
        const errorData = await res.text();
        console.error('Resend API error:', errorData);
        return c.json({ error: 'Failed to send email' }, 500);
      }
    } else {
      // Send SMS via Termii
      const TERMII_API_KEY = Deno.env.get('TERMII_API_KEY');
      const SENDER_ID = Deno.env.get('TERMII_SENDER_ID') || 'N-Alert';

      if (!TERMII_API_KEY) {
        console.error('Termii API key missing');
        return c.json({ error: 'Server configuration error' }, 500);
      }

      const smsPayload = {
        to: contact,
        from: SENDER_ID,
        sms: `Your CoreID verification code is: ${otp}. Valid for 10 minutes.`,
        type: 'plain',
        channel: 'dnd',
        api_key: TERMII_API_KEY,
      };

      console.log('Sending SMS via Termii:', { to: contact, from: SENDER_ID });

      const res = await fetch('https://api.ng.termii.com/api/sms/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(smsPayload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Termii API error status:', res.status);
        console.error('Termii API error body:', errorText);
        
        let errorDetail = errorText;
        try {
          const errorJson = JSON.parse(errorText);
          errorDetail = errorJson.message || errorJson.error || errorText;
        } catch (e) {
          // errorText is not JSON, use as is
        }
        
        return c.json({ 
          error: 'Failed to send SMS', 
          details: errorDetail,
          status: res.status 
        }, 500);
      }

      const responseData = await res.json();
      console.log('Termii response:', responseData);
    }
    
    // Log audit event
    await supabase.from('audit_events').insert({
      event_type: 'otp_sent',
      meta: { contact_type, contact_masked: contact.replace(/.(?=.{4})/g, '*') }
    });

    return c.json({ 
      status: 'ok', 
      message: 'OTP sent', 
      expires_in: 600,
      debug_contact_hash: contactHash // For debugging
    });

  } catch (error) {
    console.error('OTP request error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
};

const handleVerify = async (c: any) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    let { contact, otp } = body;

    if (!contact || !otp) {
      return c.json({ error: 'Contact and OTP required' }, 400);
    }

    // Normalize contact
    contact = contact.trim().toLowerCase();

    const contactHash = await hashData(contact, Deno.env.get('SERVER_SALT') ?? 'default-salt');
    const otpHash = await hashData(otp);
    
    const currentTime = new Date().toISOString();
    
    console.log('Verifying OTP:', {
      contact,
      contact_hash_preview: contactHash.substring(0, 10),
      otp_hash_preview: otpHash.substring(0, 10),
      current_time: currentTime
    });

    // 1. Find valid OTP
    const { data: otpRecord, error: fetchError } = await supabase
      .from('otps')
      .select('*')
      .eq('contact_hash', contactHash)
      .eq('used', false)
      .gt('expires_at', currentTime)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
      
    console.log('OTP query result:', {
      found: !!otpRecord,
      error: fetchError,
      record_id: otpRecord?.id,
      record_expires_at: otpRecord?.expires_at,
      current_time_used_in_query: currentTime,
      time_comparison: otpRecord?.expires_at ? `${otpRecord.expires_at} > ${currentTime}` : 'N/A'
    });

    if (fetchError || !otpRecord) {
      console.error('OTP Verification Failed:', {
        contact,
        contactHash,
        fetchError,
        otpRecord
      });
      return c.json({ 
        error: 'Invalid or expired OTP',
        debug: {
          received_contact: contact,
          contact_hash_preview: contactHash.substring(0, 10),
          record_found: !!otpRecord,
          fetch_error: fetchError
        }
      }, 400);
    }

    // 2. Check attempts
    if (otpRecord.attempts >= 5) {
      return c.json({ error: 'Too many attempts. Please request a new OTP.' }, 429);
    }

    // 3. Verify Hash
    if (otpRecord.otp_hash !== otpHash) {
      // Increment attempts
      await supabase.from('otps').update({ attempts: otpRecord.attempts + 1 }).eq('id', otpRecord.id);
      return c.json({ 
        error: 'Invalid OTP',
        debug: {
          otp_mismatch: true,
          received_otp_hash_preview: otpHash.substring(0, 10),
          stored_otp_hash_preview: otpRecord.otp_hash.substring(0, 10)
        }
      }, 400);
    }

    // 4. Mark used
    await supabase.from('otps').update({ used: true }).eq('id', otpRecord.id);

    // 5. Check if user exists
    const { data: user } = await supabase
      .from('identity_users')
      .select('user_id, pin_hash')
      .eq('phone_hash', contactHash) 
      .single();

    // 6. Issue Registration Token (Session)
    const regToken = crypto.randomUUID();
    const scope = user?.pin_hash ? 'pin_required' : 'pin_setup';
    
    const { error: sessionError } = await supabase
      .from('sessions')
      .insert({
        token: regToken,
        user_id: user?.user_id || null, 
        scope: scope,
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 mins
      });

    if (sessionError) {
      console.error('Session creation error:', sessionError);
      return c.json({ error: 'Failed to create session' }, 500);
    }

    // Log audit
    await supabase.from('audit_events').insert({
      event_type: 'otp_verified',
      user_id: user?.user_id,
      meta: { contact_masked: contact.replace(/.(?=.{4})/g, '*') }
    });

    return c.json({
      status: 'ok',
      reg_token: regToken,
      next: scope,
      user_exists: !!user
    });

  } catch (error) {
    console.error('OTP verify error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
};

// Register routes with multiple path variations to handle Supabase routing quirks
app.post('/request', handleRequest);
app.post('/auth-otp/request', handleRequest);
app.post('/functions/v1/auth-otp/request', handleRequest);

app.post('/verify', handleVerify);
app.post('/auth-otp/verify', handleVerify);
app.post('/functions/v1/auth-otp/verify', handleVerify);

// Debug catch-all
app.all('*', (c) => {
  console.log('Catch-all hit. Path:', c.req.path);
  return c.json({ 
    error: 'Route not found', 
    path: c.req.path,
    method: c.req.method 
  }, 404);
});

Deno.serve(app.fetch);
