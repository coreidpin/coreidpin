import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { createClient } from "npm:@supabase/supabase-js";

// Import route handlers
import { projects } from "./routes/projects.tsx";
import { endorsements } from "./routes/endorsements.tsx";
import { stats } from "./routes/stats.tsx";
import { matching } from "./routes/matching.tsx";
import { ai } from "./routes/ai.tsx";
import { professionals } from "./routes/professionals.tsx";
import { profile } from "./routes/profile.tsx";
import { pin } from "./routes/pin.tsx";

import { getAuthUser } from "./lib/supabaseClient.tsx";
import { issuePinToUser } from "../_shared/pinService.ts";
import { logInfo, logError, logOTPRequest, logDebug, generateRequestId, hashForLog } from "../_shared/logger.ts";

const app = new Hono();

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? 'https://evcqpapvcvmljgqiuzsq.supabase.co',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? ''
);

app.use("/*", cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization", "X-CSRF-Token", "apikey", "x-client-info", "x-idempotency-key"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: false,
}));

// Auth Middleware
app.use("/*", async (c, next) => {
  // Skip for public endpoints
  if (c.req.path.includes('/auth/') || c.req.path.includes('/registration/') || c.req.path.includes('/health')) {
    return next();
  }
  
  const { user } = await getAuthUser(c);
  if (user) {
    c.set('userId', user.id);
    c.set('user', user);
  }
  await next();
});

app.options("/*", (c) => c.text("", 204));

app.get("/server/health", (c) => c.json({ status: "ok" }));

// Mount sub-apps (Double mapped for safety)
app.route("/projects", projects);
app.route("/server/projects", projects);

app.route("/endorsements", endorsements);
app.route("/server/endorsements", endorsements);

app.route("/stats", stats);
app.route("/server/stats", stats);

app.route("/ai", ai);
app.route("/server/ai", ai);

app.route("/professionals", professionals);
app.route("/server/professionals", professionals);

app.route("/profile", profile);
app.route("/server/profile", profile);

app.route("/pin", pin);
app.route("/server/pin", pin);

app.route("/", matching);
app.route("/server", matching);

// Auth endpoints
app.get('/auth/csrf', (c) => {
  const csrf = crypto.randomUUID();
  return c.json({ csrf });
});

app.post('/auth/session-cookie', async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const { token } = body;
    
    if (!token) {
      return c.json({ error: 'Token required' }, 400);
    }
    
    const csrf = crypto.randomUUID();
    return c.json({ success: true, csrf });
  } catch (error) {
    return c.json({ error: 'Session validation failed' }, 500);
  }
});

app.post('/auth/logout', (c) => {
  return c.json({ success: true });
});

// Registration OTP endpoints
app.post('/registration/send-otp', async (c) => {
  const requestId = generateRequestId();
  
  try {
    const body = await c.req.json().catch(() => ({}));
    const { phone, name, email } = body;
    
    if (!phone || !name) {
      return c.json({ success: false, error: 'Phone and name are required' }, 400);
    }
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const regToken = crypto.randomUUID();
    
    // Store OTP in database for verification
    const { error: otpError } = await supabase
      .from('otp_verifications')
      .insert({
        phone_number: phone,
        otp_code: otp,
        reg_token: regToken,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
        verified: false
      });
    
    if (otpError) {
      logError('OTP storage failed', otpError, { request_id: requestId });
    }
    
    // Send SMS via Termii
    const termiiApiKey = Deno.env.get('TERMII_API_KEY');
    const smsOtpPaused = Deno.env.get('SMS_OTP_PAUSED') === 'true';
    
    if (termiiApiKey && !smsOtpPaused) {
      try {
        const smsResponse = await fetch('https://api.ng.termii.com/api/sms/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            to: phone,
            from: 'CoreID',
            sms: `Your CoreID verification code is: ${otp}. Valid for 10 minutes.`,
            type: 'plain',
            api_key: termiiApiKey,
            channel: 'generic'
          })
        });
        
        const smsResult = await smsResponse.json();
        logInfo('SMS sent via Termii', { request_id: requestId, status: smsResult.message_id ? 'success' : 'unknown' });
      } catch (smsError) {
        logError('SMS sending failed', smsError, { request_id: requestId });
      }
    } else {
      // Safe logging: Only log in dev, sanitized in prod
      await logOTPRequest('phone', phone, requestId);
      logDebug('TEST MODE - OTP generated', { request_id: requestId, phone, otp });
    }
    
    return c.json({ 
      success: true, 
      reg_token: regToken,
      expires_in: 600
    });
  } catch (error) {
    logError('Registration OTP failed', error, { request_id: requestId });
    return c.json({ success: false, error: 'Failed to send OTP' }, 500);
  }
});

app.post('/registration/verify-otp', async (c) => {
  const requestId = generateRequestId();
  
  try {
    const body = await c.req.json().catch(() => ({}));
    const { phone, otp, reg_token } = body;
    
    if (!phone || !otp || !reg_token) {
      return c.json({ success: false, error: 'Phone, OTP, and token required' }, 400);
    }
    
    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      return c.json({ success: false, error: 'Invalid OTP' }, 400);
    }
    
    const phoneHash = await hashForLog(phone);
    logInfo('OTP verification attempt', { request_id: requestId, contact_hash: phoneHash });

    // Verify OTP from database
    const { data: otpData, error: otpError } = await supabase
      .from('otp_verifications')
      .select('*')
      .eq('phone_number', phone)
      .eq('reg_token', reg_token)
      .eq('verified', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (otpError) {
      logError('OTP verification - database error', otpError, { request_id: requestId, contact_hash: phoneHash });
    }

    if (!otpData) {
      logError('OTP verification - no record found', null, { request_id: requestId, contact_hash: phoneHash });
      logDebug('OTP verification failed (dev only)', { request_id: requestId, phone, reg_token, provided_otp: otp });
      
      return c.json({ success: false, error: 'Invalid or expired OTP' }, 400);
    }
    
    logDebug('OTP verification - record found (dev only)', { 
      request_id: requestId, 
      expected: otpData.otp_code, 
      received: otp, 
      match: otpData.otp_code === otp 
    });

    if (otpData.otp_code !== otp) {
      logError('OTP verification - mismatch', null, { request_id: requestId, contact_hash: phoneHash });
      return c.json({ success: false, error: 'Incorrect OTP' }, 400);
    }
    
    // Mark OTP as verified
    await supabase
      .from('otp_verifications')
      .update({ verified: true, verified_at: new Date().toISOString() })
      .eq('id', otpData.id);
    
    logInfo('OTP verification successful', { request_id: requestId, contact_hash: phoneHash });
    
    return c.json({ 
      success: true,
      phone_verified: true,
      reg_token
    });
  } catch (error) {
    logError('OTP verification exception', error, { request_id: requestId });
    return c.json({ success: false, error: 'Verification failed' }, 500);
  }
});

app.post('/register', async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const { email, password, name, userType, phoneNumber, title, location } = body;
    
    if (!email || !password || !name || !userType) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        name,
        userType,
        title: title || null,
        phoneNumber: phoneNumber || null,
        location: location || null
      },
      email_confirm: true,
      phone: phoneNumber || undefined,
      phone_confirm: true
    });
    
    if (authError || !authData.user) {
      return c.json({ error: authError?.message || 'Failed to create user' }, 400);
    }
    
    const userId = authData.user.id;
    
    // Create profile in database
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: userId,
        email,
        name,
        user_type: userType,
        profile_complete: false,
        onboarding_complete: false
      });
    


// ... (existing code)

    if (profileError) {
      console.error('Profile creation error:', profileError);
    }

    // Auto-generate PIN for email registration
    try {
      await issuePinToUser(userId);
      console.log('Auto-generated PIN for email user:', userId);
    } catch (pinError) {
      console.error('Failed to auto-generate PIN:', pinError);
      // Non-blocking, user can generate later
    }
    
    // Generate session tokens
    const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    return c.json({ 
      success: true, 
      userId,
      userType,
      accessToken: sessionData?.session?.access_token,
      refreshToken: sessionData?.session?.refresh_token,
      user: {
        id: userId,
        email,
        user_metadata: {
          userType,
          name,
          hasCompletedOnboarding: false
        }
      },
      message: 'Registration successful'
    });
  } catch (error) {
    console.error('Registration error:', error);
    return c.json({ error: 'Registration failed' }, 500);
  }
});

export default app;