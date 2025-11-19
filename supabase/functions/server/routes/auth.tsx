import { Hono } from "npm:hono";
import { getSupabaseClient } from "../lib/supabaseClient.tsx";
// Lazy load argon2-browser to avoid startup issues in Edge runtime
let argonModPromise: Promise<any> | null = null;
function getArgon() {
  if (!argonModPromise) argonModPromise = import("npm:argon2-browser");
  return argonModPromise;
}
import * as kv from "../kv_store.tsx";
import { maybeEncryptKVValue } from "../lib/crypto.tsx";
import { verifyVerificationToken } from "../lib/token.ts";
import { sendEmail } from "../lib/email.ts";
import { buildVerificationEmail } from "../templates/verification.ts";
import { sendSMS } from "../lib/sms.ts";

const auth = new Hono();

// Supabase client singleton
const supabase = getSupabaseClient();

// Helpers
const getClientIp = (c: any) => {
  return (
    c.req.header('x-forwarded-for') ||
    c.req.header('x-real-ip') ||
    c.req.header('cf-connecting-ip') ||
    'unknown'
  );
};

const requireCsrf = (c: any) => {
  const token = c.req.header('x-csrf-token') || c.req.header('X-CSRF-Token');
  if (!token) return false;
  // Simple double-submit style: header must exist. In production, compare cookie vs header.
  return true;
};
const disabled = Deno.env.get('DISABLE_AUTH_ENDPOINTS') === 'true';
// Allow disabling CSRF requirement for login in dev/test environments
const disableLoginCsrf = Deno.env.get('DISABLE_CSRF_FOR_LOGIN') === 'true';
// Allow disabling CSRF for registration in dev/test environments
const disableRegisterCsrf = (Deno.env.get('DISABLE_CSRF_FOR_REGISTER') ?? 'true') === 'true';

// User Registration Endpoint
auth.post("/register", async (c) => {
  if (disabled) { return c.json({ error: 'Endpoint disabled' }, 410); }
  try {
    if (!disableRegisterCsrf && !requireCsrf(c)) {
      // CSRF disabled by default for registration to streamline onboarding
    }
    const body = await c.req.json();
    const { 
      email, password, name, userType, title, companyName, role, institution, gender, phoneNumber,
      location, yearsOfExperience, currentCompany, seniority, topSkills, highestEducation, resumeFileName
    } = body;
    const ip = getClientIp(c);
    const emailStr = (email || '').toString().trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const errors: string[] = [];
    if (!emailStr || !emailRegex.test(emailStr)) errors.push('Email must be valid');
    if (!password || typeof password !== 'string') errors.push('Password is required');
    if (!name || !name.toString().trim()) errors.push('Full name is required');
    if (!userType) errors.push('User type is required');
    if (password) {
      const strong = [password.length >= 8, /[A-Z]/.test(password), /[a-z]/.test(password), /[0-9]/.test(password), /[!@#$%^&*(),.?":{}|<>]/.test(password)].every(Boolean);
      if (!strong) errors.push('Password must be 8+ chars with upper, lower, number, symbol');
    }
    if (errors.length) {
      try { await supabase.from('auth_audit_log').insert({ user_id: null, action: 'register_validation_failed', outcome: 'failure', ip, user_agent: c.req.header('user-agent') || 'unknown', details: { errors } }); } catch (_) {}
      return c.json({ error: errors[0], errors }, 400);
    }
    // Rate limit per IP
    const rlWindowMs = 60 * 60 * 1000; const rlMax = 20; const now = Date.now();
    const rlKey = `rate:register:${ip}`;
    const rl = (await kv.get(rlKey)) || { count: 0, resetAt: new Date(now + rlWindowMs).toISOString() };
    const rlResetAt = new Date(rl.resetAt).getTime(); let rlCount = rl.count || 0; if (now > rlResetAt) rlCount = 0;
    if (rlCount >= rlMax) { await kv.set(rlKey, { count: rlCount, resetAt: new Date(rlResetAt).toISOString() }); return c.json({ error: 'Too many registrations. Try again later.' }, 429); }
    // Unique email check
    try { const { data: existing } = await supabase.schema('auth').from('users').select('id').eq('email', emailStr).maybeSingle(); if (existing?.id) { return c.json({ error: 'Email already registered' }, 409); } } catch (_) {}
    if (!emailStr || !password || !name || !userType) { return c.json({ error: 'Missing required fields: email, password, name, userType' }, 400); }
    const serviceKeyRaw = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SERVICE_KEY') || Deno.env.get('SERVICE_ROLE_KEY') || Deno.env.get('SERVICE_KEY') || '';
    const anonKeyRaw = Deno.env.get('SUPABASE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('ANON_KEY') || Deno.env.get('PUBLIC_ANON_KEY') || '';
    const hasServiceKey = !!serviceKeyRaw && !/anon-key-placeholder/.test(serviceKeyRaw);
    const hasAnonKey = !!anonKeyRaw && !/anon-key-placeholder/.test(anonKeyRaw);
    let authData: any = null; let authError: any = null; let usedFallback = false; let fallbackError: any = null; let rawAdminJson: any = null;
    if (hasServiceKey) {
      const res = await supabase.auth.admin.createUser({ email: emailStr, password, user_metadata: { name, userType, title: title || null, companyName: companyName || null, role: role || null, institution: institution || null, gender: gender || null, location: location || null, yearsOfExperience: yearsOfExperience || null, currentCompany: currentCompany || null, seniority: seniority || null, topSkills: topSkills || null, highestEducation: highestEducation || null, resumeFileName: resumeFileName || null }, email_confirm: false });
      authData = res.data; authError = res.error;
      // Attempt raw admin endpoint fetch for deeper diagnostics if error and debug requested
      if (authError && c.req.header('X-Debug-Register') === 'true') {
        try {
          const adminUrl = `${(Deno.env.get('SUPABASE_URL')||'').replace(/\/$/,'')}/auth/v1/admin/users`;
          // Include both Authorization (service role) and apikey (anon) headers as required by GoTrue
          const fetchRes = await fetch(adminUrl, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${serviceKeyRaw}`, 'apikey': anonKeyRaw }, body: JSON.stringify({ email: emailStr, password, user_metadata: { name, userType }, email_confirm: false }) });
          rawAdminJson = { status: fetchRes.status, body: await fetchRes.text() };
        } catch (e: any) {
          rawAdminJson = { status: null, body: e?.message || 'raw fetch failed' };
        }
      }
    }
    
    if ((authError || fallbackError) || !authData?.user) {
      let reason = (authError || fallbackError)?.message || 'Unknown error';
      if (!hasServiceKey) reason = 'Service role key missing (set SUPABASE_SERVICE_ROLE_KEY)';
      if (!hasAnonKey) reason += '; anon key missing (set SUPABASE_ANON_KEY)';
      const debug = c.req.header('X-Debug-Register') === 'true';
      if (debug) {
        return c.json({
          error: `Registration failed: ${reason}`,
          diagnostics: {
            hasServiceKey,
            hasAnonKey,
            usedFallback,
            serviceKeyLength: serviceKeyRaw.length,
            anonKeyLength: anonKeyRaw.length,
            authError: authError ? { name: authError.name, message: authError.message, status: authError.status || null } : null,
            fallbackError: fallbackError ? { name: fallbackError.name, message: fallbackError.message, status: fallbackError.status || null } : null,
            rawAdminJson
          }
        }, 400);
      }
      return c.json({ error: `Registration failed: ${reason}` }, 400);
    }
    const userId = authData.user.id;
    if (userId) {
      try {
        await supabase.from('registration_step_events').update({ user_id: userId }).eq('email', emailStr).is('user_id', null);
      } catch (_) {}
      try { await supabase.from('auth_audit_log').insert({ user_id: userId, action: 'register_auth_user_created', outcome: 'success', ip, user_agent: c.req.header('user-agent') || 'unknown', details: { email: emailStr, userType } }); } catch (_) {}
      const profileValue = {
        id: userId,
        email: emailStr,
        name,
        userType,
        title: title || null,
        companyName: companyName || null,
        role: role || null,
        institution: institution || null,
        gender: gender || null,
        phoneNumber: phoneNumber || null,
        location: location || null,
        yearsOfExperience: yearsOfExperience || null,
        currentCompany: currentCompany || null,
        seniority: seniority || null,
        topSkills: topSkills || [],
        highestEducation: highestEducation || null,
        resumeFileName: resumeFileName || null,
        createdAt: new Date().toISOString(),
        verificationStatus: "pending"
      };
      await kv.set(`user:${userId}`, profileValue);
      // Store sensitive details separately with optional encryption
      try {
        const sensitive = await maybeEncryptKVValue({
          userId,
          phoneNumber: phoneNumber || null,
          gender: gender || null,
        });
        await kv.set(`user_sensitive:${userId}`, sensitive);
      } catch (_) {}
      // Backup copy for recovery
      try {
        const backupVal = await maybeEncryptKVValue(profileValue);
      await kv.set(`backup:user:${userId}:${Date.now()}`, backupVal);
      } catch (_) {}

      // Create user profile entry
      await kv.set(`profile:${userType}:${userId}`, {
        userId,
        profileComplete: false,
        onboardingComplete: false,
        createdAt: new Date().toISOString()
      });

      // Sync to public.app_users via RPC for canonical onboarding
      try {
        const firstName = typeof name === 'string' ? name.split(' ')[0] : null;
        const lastName = typeof name === 'string' ? name.split(' ').slice(1).join(' ') || null : null;
        const username = (typeof name === 'string' && name)
          ? name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '')
          : (email?.split('@')[0] || null);

        const rpcRes = await supabase.rpc('register_app_user', {
          user_id: userId,
          email,
          username,
          password_plain: password,
          first_name: firstName,
          last_name: lastName,
          phone_number: phoneNumber || null,
        });

        if (rpcRes.error) {
          console.log('register_app_user RPC error:', rpcRes.error);
        }
      } catch (rpcErr) {
        console.log('RPC call failed for register_app_user:', rpcErr);
      }

      try {
        const salt = crypto.getRandomValues(new Uint8Array(16));
        let encodedHash = '';
        try {
          const { hash, argon2id } = await getArgon();
          const h = await hash({ pass: password, salt, type: argon2id });
          encodedHash = h.encoded || '';
        } catch (_) {}
        await supabase.from('credentials').upsert({
          user_id: userId,
          password_hash: encodedHash || `argon2id:${btoa(String.fromCharCode(...salt))}`,
          password_require_reset: false,
          password_updated_at: new Date().toISOString()
        });
      } catch (_) {}

      // Initialize public.profiles row (mirrors core identity fields)
      try {
        const { error: upsertErr } = await supabase
          .from('profiles')
          .upsert({
            user_id: userId,
            email,
            name,
            user_type: userType,
            profile_complete: false,
            onboarding_complete: false,
          }, { onConflict: 'user_id' });
        if (upsertErr) {
          console.log('profiles upsert error during registration:', upsertErr);
        } else {
          try { await supabase.from('auth_audit_log').insert({ user_id: userId, action: 'register_profile_upserted', outcome: 'success', ip, user_agent: c.req.header('user-agent') || 'unknown', details: {} }); } catch (_) {}
        }
      } catch (profilesErr) {
        console.log('profiles sync failed during registration:', profilesErr);
      }

      // Send verification email via Resend immediately after registration
      try {
        const tokenBytes = crypto.getRandomValues(new Uint8Array(32));
        const token = btoa(String.fromCharCode(...tokenBytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
        const rawToken = new TextEncoder().encode(token);
        const digestToken = await crypto.subtle.digest('SHA-256', rawToken);
        const tokenHash = btoa(String.fromCharCode(...new Uint8Array(digestToken))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
        await supabase.from('auth_tokens').insert({ user_id: userId, token_hash: tokenHash, purpose: 'email_verify', expires_at: new Date(Date.now() + 24*60*60*1000).toISOString(), used_at: null });
        const siteUrl = (Deno.env.get('SITE_URL') || '').replace(/\/$/, '') || '';
        const link = `${siteUrl}/auth/verify-email?token=${encodeURIComponent(token)}`;
        const t = buildVerificationEmail(name || undefined, email, link, siteUrl);
        const sendRes = await sendEmail(email, t.subject, t.html.replace('This link will expire.', 'This link will expire in 24 hours.'), t.text);
        if (sendRes?.success) {
          try { await supabase.from('auth_audit_log').insert({ user_id: userId, action: 'email_verify_send', outcome: 'success', ip, user_agent: c.req.header('user-agent') || 'unknown', details: { email, linkExpiresInHours: 24 } }); } catch (_) {}
          try { await supabase.from('email_send_events').insert({ user_id: userId, email, provider: 'resend', status: 'sent', response_message: 'ok', response_status: 200 }); } catch (_) {}
        } else {
          try { await supabase.from('auth_audit_log').insert({ user_id: userId, action: 'email_verify_send_failed', outcome: 'failure', ip, user_agent: c.req.header('user-agent') || 'unknown', details: { error: sendRes?.error || 'unknown' } }); } catch (_) {}
        }
      } catch (genErr) {
        console.log('Failed to send verification email via Resend:', genErr);
      }

      const userAgent = c.req.header('user-agent') || 'unknown';
      try { await supabase.from('auth_audit_log').insert({ user_id: userId, action: 'register_completed', outcome: 'success', ip, user_agent: userAgent, details: {} }); } catch (_) {}
    }

    // Increment registration rate limit counter for this IP
    try {
      await kv.set(rlKey, { count: rlCount + 1, resetAt: now > rlResetAt ? new Date(now + rlWindowMs).toISOString() : new Date(rlResetAt).toISOString() });
    } catch (_) {}

    // Auto-authenticate: sign in to return tokens
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: emailStr, password });
      if (!error && data?.session) {
        const userAgent = c.req.header('user-agent') || 'unknown';
        const rt = data.session?.refresh_token || '';
        let rh = '';
        if (rt) {
          const raw = new TextEncoder().encode(rt);
          const digest = await crypto.subtle.digest('SHA-256', raw);
          rh = btoa(String.fromCharCode(...new Uint8Array(digest))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
        }
        const deviceRaw = new TextEncoder().encode(`${userAgent}|${ip}`);
        const deviceDigest = await crypto.subtle.digest('SHA-256', deviceRaw);
        const deviceId = btoa(String.fromCharCode(...new Uint8Array(deviceDigest))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
        try {
          await supabase.from('sessions').insert({
            user_id: userId,
            device_id: deviceId,
            ip,
            user_agent: userAgent,
            refresh_token_hash: rh || null,
            expires_at: data.session?.expires_at ? new Date(data.session.expires_at * 1000).toISOString() : null,
            revoked_at: null
          });
        } catch (_) {}
        return c.json({ success: true, userId, userType, accessToken: data.session?.access_token, refreshToken: data.session?.refresh_token, expiresIn: data.session?.expires_in });
      }
    } catch (_) {}
    return c.json({ success: true, message: 'Registration successful', userId, userType });
  } catch (error) {
    console.log("Registration error:", error);
    try { await supabase.from('auth_audit_log').insert({ user_id: null, action: 'register_error', outcome: 'failure', ip: getClientIp(c), user_agent: c.req.header('user-agent') || 'unknown', details: { error: error?.message || 'unknown' } }); } catch (_) {}
    return c.json({ error: `Registration failed: ${error.message}` }, 500);
  }
});

// Sign Up Endpoint (Alternative for OAuth)
auth.post("/signup", async (c) => {
  if (disabled) { return c.json({ error: 'Endpoint disabled' }, 410); }
  try {
    const body = await c.req.json();
    const { email, password, name, userType } = body;

    if (!email || !password || !name || !userType) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, userType },
      email_confirm: false
    });

    if (error) {
      return c.json({ error: error.message }, 400);
    }

    return c.json({ 
      success: true, 
      user: data.user 
    });
  } catch (error) {
    console.log("Signup error:", error);
    return c.json({ error: error.message }, 500);
  }
});

// Secure Login Endpoint with rate limiting and login history
auth.post('/login', async (c) => {
  if (disabled) { return c.json({ error: 'Endpoint disabled' }, 410); }
  try {
    if (!requireCsrf(c)) {
      return c.json({ error: 'CSRF token missing' }, 403);
    }

    const body = await c.req.json();
    const { email, password } = body;
    const emailStr = (email || '').toString().trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailStr || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }
    if (!emailRegex.test(emailStr)) {
      return c.json({ error: 'Email must be valid' }, 400);
    }

    const ip = getClientIp(c);
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxAttempts = 5;
    const now = Date.now();
    const bucketKey = `rate:login:${ip}`;
    const bucket = (await kv.get(bucketKey)) || { count: 0, resetAt: new Date(now + windowMs).toISOString() };
    const resetAt = new Date(bucket.resetAt).getTime();
    let count = bucket.count || 0;

    // Reset window if expired
    if (now > resetAt) {
      count = 0;
    }

    if (count >= maxAttempts) {
      await kv.set(bucketKey, { count, resetAt: new Date(resetAt).toISOString() });
      return c.json({ error: 'Too many login attempts. Try again later.' }, 429);
    }

    const flag = c.get('newAuthEnabled');
    if (flag) {
      const { data: userRow } = await supabase.schema('auth').from('users').select('id').eq('email', emailStr).maybeSingle();
      const userIdAuth = userRow?.id || null;
      if (userIdAuth) {
        const { data: lock } = await supabase.from('account_lockouts').select('locked_until').eq('user_id', userIdAuth).gt('locked_until', new Date().toISOString()).maybeSingle();
        if (lock?.locked_until) {
          return c.json({ error: 'Account locked. Try later.' }, 423);
        }
        const { data: cred } = await supabase.from('credentials').select('password_hash').eq('user_id', userIdAuth).maybeSingle();
        if (cred?.password_hash) {
          const { verify } = await getArgon();
          const ok = await verify({ pass: password, encoded: cred.password_hash });
          if (!ok) {
            const failedCountRow = await supabase.from('login_rate_limits').select('id,count').eq('user_id', userIdAuth).eq('ip', ip).gt('window_end', new Date().toISOString()).maybeSingle();
            const failCount = failedCountRow?.data?.count || 0;
            if (failCount + 1 >= 10) {
              await supabase.from('account_lockouts').upsert({ user_id: userIdAuth, ip, locked_until: new Date(Date.now() + 15*60*1000).toISOString(), reason: 'too_many_attempts' });
            }
            return c.json({ error: 'Invalid credentials' }, 401);
          }
        }
      }
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email: emailStr, password });
    const userAgent = c.req.header('user-agent') || 'unknown';

    // Update rate bucket
    await kv.set(bucketKey, { count: count + 1, resetAt: now > resetAt ? new Date(now + windowMs).toISOString() : new Date(resetAt).toISOString() });
    // Persist rate limit to DB
    try {
      const windowEndIso = (now > resetAt ? new Date(now + windowMs) : new Date(resetAt)).toISOString();
      const windowStartIso = new Date(now).toISOString();
      const { data: existingRow } = await supabase
        .from('login_rate_limits')
        .select('id,count')
        .eq('user_id', data?.user?.id || null)
        .eq('ip', ip)
        .gt('window_end', new Date().toISOString())
        .maybeSingle();
      if (existingRow?.id) {
        await supabase.from('login_rate_limits').update({ count: (existingRow.count || 0) + 1 }).eq('id', existingRow.id);
      } else {
        await supabase.from('login_rate_limits').insert({ user_id: data?.user?.id || null, ip, window_start: windowStartIso, window_end: windowEndIso, count: 1 });
      }
    } catch (_) {}

    if (error) {
      console.log('Login error:', error);
      // Log failed attempt
      const logKey = `login_history:${emailStr}:${Date.now()}`;
      const failPayload = {
        email: emailStr,
        ip,
        userAgent,
        success: false,
        reason: error.message,
        timestamp: new Date().toISOString(),
      };
      try {
        const enc = await maybeEncryptKVValue(failPayload);
        await kv.set(logKey, enc);
      } catch (_) {}
      return c.json({ error: `Login failed: ${error.message}` }, 401);
    }

    const userId = data.user?.id;
    const userData = userId ? await kv.get(`user:${userId}`) : null;

    // If the user's email is confirmed, reflect verification in KV profile
    try {
      if (userId && data.user?.email_confirmed_at) {
        const current = userData || {};
        await kv.set(`user:${userId}`, {
          ...current,
          id: userId,
          email: emailStr,
          verificationStatus: 'verified',
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (kvErr) {
      console.log('Failed to update verificationStatus in KV on login:', kvErr);
    }

    // Log success attempt
    const logKey = `login_history:${userId || emailStr}:${Date.now()}`;
    const successPayload = {
      userId: userId || null,
      email: emailStr,
      ip,
      userAgent,
      success: true,
      timestamp: new Date().toISOString(),
    };
    try {
      const enc = await maybeEncryptKVValue(successPayload);
      await kv.set(logKey, enc);
      } catch (_) {}

    try {
      const rt = data.session?.refresh_token || '';
      let rh = '';
      if (rt) {
        const raw = new TextEncoder().encode(rt);
        const digest = await crypto.subtle.digest('SHA-256', raw);
        rh = btoa(String.fromCharCode(...new Uint8Array(digest))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
      }
      const deviceRaw = new TextEncoder().encode(`${userAgent}|${ip}`);
      const deviceDigest = await crypto.subtle.digest('SHA-256', deviceRaw);
      const deviceId = btoa(String.fromCharCode(...new Uint8Array(deviceDigest))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
      await supabase.from('sessions').insert({
        user_id: userId,
        device_id: deviceId,
        ip,
        user_agent: userAgent,
        refresh_token_hash: rh || null,
        expires_at: data.session?.expires_at ? new Date(data.session.expires_at * 1000).toISOString() : null,
        revoked_at: null
      });
    } catch (_) {}

    try {
      const deviceRaw = new TextEncoder().encode(`${userAgent}|${ip}`);
      const deviceDigest = await crypto.subtle.digest('SHA-256', deviceRaw);
      const deviceIdNew = btoa(String.fromCharCode(...new Uint8Array(deviceDigest))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
      const { data: seen } = await supabase.from('sessions').select('id').eq('user_id', userId).eq('device_id', deviceIdNew).maybeSingle();
      if (!seen?.id) {
        await supabase.from('auth_audit_log').insert({ user_id: userId, action: 'anomaly_new_device_login', outcome: 'info', ip, user_agent: userAgent, details: { device_id: deviceIdNew } });
      }
    } catch (_) {}

    try {
      await supabase.from('auth_audit_log').insert({
        user_id: userId,
        action: 'login',
        outcome: 'success',
        ip,
        user_agent: userAgent,
        details: { method: 'password' }
      });
    } catch (_) {}

    return c.json({
      success: true,
      accessToken: data.session?.access_token,
      refreshToken: data.session?.refresh_token,
      expiresIn: data.session?.expires_in,
      user: data.user,
      userData,
    });
  } catch (error: any) {
    console.log('Login error:', error);
    return c.json({ error: `Login failed: ${error?.message || 'Unknown error'}` }, 500);
  }
});

// Additional routes: send/resend email verification
auth.post('/send-verification', async (c) => {
  return c.json({ error: 'Deprecated. Use code-based email verification.' }, 410);
});

auth.post('/resend-verification', async (c) => {
  return c.json({ error: 'Deprecated. Use code-based email verification.' }, 410);
});

// Signed link verification (public GET)
auth.get('/auth/verify-link', async (c) => {
  return c.json({ success: false, error: 'Deprecated verification link. Use code-based email verification.' }, 410);
});

auth.post('/auth/dev/sign-token', async (c) => {
  try {
    const allow = Deno.env.get('ALLOW_TEST_SIGNING') === 'true';
    if (!allow) return c.json({ success: false, error: 'Not allowed' }, 403);
    const body = await c.req.json().catch(() => ({}));
    const email = (body?.email || '').toString().trim().toLowerCase();
    const minutes = Number(body?.minutes || 60);
    if (!email) return c.json({ success: false, error: 'Email required' }, 400);
    const token = await (await import('../lib/token.ts')).signVerificationToken(email, minutes);
  return c.json({ success: true, token });
  } catch (e: any) {
    return c.json({ success: false, error: e?.message || 'Error' }, 500);
  }
});

auth.post('/auth/dev/generate-email-token', async (c) => {
  try {
    const allow = Deno.env.get('ALLOW_TEST_SIGNING') === 'true';
    if (!allow) return c.json({ success: false, error: 'Not allowed' }, 403);
    const body = await c.req.json().catch(() => ({}));
    const email = (body?.email || '').toString().trim().toLowerCase();
    if (!email) return c.json({ success: false, error: 'Email required' }, 400);
    const tokenBytes = crypto.getRandomValues(new Uint8Array(32));
    const token = btoa(String.fromCharCode(...tokenBytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
    const raw = new TextEncoder().encode(token);
    const digest = await crypto.subtle.digest('SHA-256', raw);
    const tokenHash = btoa(String.fromCharCode(...new Uint8Array(digest))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
    const { data: existing } = await supabase.schema('auth').from('users').select('id').eq('email', email).maybeSingle();
    const userId = existing?.id || null;
    await supabase.from('auth_tokens').insert({ user_id: userId, token_hash: tokenHash, purpose: 'email_verify', expires_at: new Date(Date.now() + 24*60*60*1000).toISOString(), used_at: null });
    return c.json({ success: true, token });
  } catch (e: any) {
    return c.json({ success: false, error: e?.message || 'Error' }, 500);
  }
});

auth.post('/auth/dev/generate-reset-token', async (c) => {
  try {
    const allow = Deno.env.get('ALLOW_TEST_SIGNING') === 'true';
    if (!allow) return c.json({ success: false, error: 'Not allowed' }, 403);
    const body = await c.req.json().catch(() => ({}));
    const email = (body?.email || '').toString().trim().toLowerCase();
    if (!email) return c.json({ success: false, error: 'Email required' }, 400);
    const tokenBytes = crypto.getRandomValues(new Uint8Array(32));
    const token = btoa(String.fromCharCode(...tokenBytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
    const raw = new TextEncoder().encode(token);
    const digest = await crypto.subtle.digest('SHA-256', raw);
    const tokenHash = btoa(String.fromCharCode(...new Uint8Array(digest))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
    const { data: existing } = await supabase.schema('auth').from('users').select('id').eq('email', email).maybeSingle();
    const userId = existing?.id || null;
    await supabase.from('auth_tokens').insert({ user_id: userId, token_hash: tokenHash, purpose: 'password_reset', expires_at: new Date(Date.now() + 24*60*60*1000).toISOString(), used_at: null });
    return c.json({ success: true, token });
  } catch (e: any) {
    return c.json({ success: false, error: e?.message || 'Error' }, 500);
  }
});

auth.post('/auth/email/verify/send', async (c) => {
  try {
    if (disabled) { return c.json({ success: false, error: 'Endpoint disabled' }, 410); }
    if (!requireCsrf(c)) { return c.json({ success: false, error: 'CSRF token missing' }, 403); }
    const body = await c.req.json().catch(() => ({}));
    const email = (body?.email || '').toString().trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const name = (body?.name || '').toString();
    if (!email) return c.json({ success: false, error: 'Email required' }, 400);
    if (!emailRegex.test(email)) return c.json({ success: false, error: 'Invalid email format' }, 400);
    const ip = (c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || c.req.header('cf-connecting-ip') || 'unknown').toString();
    const windowMs = 60 * 1000;
    const maxRequests = 5;
    const now = Date.now();
    const key = `rate:verify-email:${email}:${ip}`;
    const bucket = (await kv.get(key)) || { count: 0, resetAt: new Date(now + windowMs).toISOString() };
    const resetAt = new Date(bucket.resetAt).getTime();
    let count = bucket.count || 0;
    if (now > resetAt) count = 0;
    if (count >= maxRequests) {
      await kv.set(key, { count, resetAt: new Date(resetAt).toISOString() });
      const remainingMs = Math.max(0, resetAt - now);
      const remainingSeconds = Math.ceil(remainingMs / 1000);
      return c.json({ success: false, error: `Too many requests. Please wait ${remainingSeconds} seconds` }, 429);
    }
    const tokenBytes = crypto.getRandomValues(new Uint8Array(32));
    const token = btoa(String.fromCharCode(...tokenBytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
    const raw = new TextEncoder().encode(token);
    const digest = await crypto.subtle.digest('SHA-256', raw);
    const tokenHash = btoa(String.fromCharCode(...new Uint8Array(digest))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
    const { data: existing } = await supabase.schema('auth').from('users').select('id').eq('email', email).maybeSingle();
    const userId = existing?.id || null;
    await supabase.from('auth_tokens').insert({ user_id: userId, token_hash: tokenHash, purpose: 'email_verify', expires_at: new Date(Date.now() + 24*60*60*1000).toISOString(), used_at: null });
    const siteUrl = (Deno.env.get('SITE_URL') || '').replace(/\/$/, '') || '';
    const link = `${siteUrl}/auth/verify-email?token=${encodeURIComponent(token)}`;
    const t = buildVerificationEmail(name || undefined, email, link, siteUrl);
    const sendRes = await sendEmail(email, t.subject, t.html.replace('This link will expire.', 'This link will expire in 24 hours.'), t.text);
    if (!sendRes.success) {
      await supabase.from('auth_audit_log').insert({ user_id: userId, action: 'email_verify_send_failed', outcome: 'failure', ip, user_agent: c.req.header('user-agent') || 'unknown', details: { error: sendRes.error || 'unknown' } });
      return c.json({ success: false, error: 'Failed to send verification email' }, 502);
    }
    await supabase.from('auth_audit_log').insert({ user_id: userId, action: 'email_verify_send', outcome: 'success', ip, user_agent: c.req.header('user-agent') || 'unknown', details: { email, linkExpiresInHours: 24 } });
    await supabase.from('email_send_events').insert({ user_id: userId, email, provider: 'resend', status: 'sent', response_message: 'ok', response_status: 200 });
    await kv.set(key, { count: count + 1, resetAt: now > resetAt ? new Date(now + windowMs).toISOString() : new Date(resetAt).toISOString() });
    return c.json({ success: true });
  } catch (e: any) {
    return c.json({ success: false, error: e?.message || 'Error' }, 500);
  }
});

auth.post('/auth/email/verify/confirm', async (c) => {
  try {
    if (disabled) { return c.json({ success: false, error: 'Endpoint disabled' }, 410); }
    if (!requireCsrf(c)) { return c.json({ success: false, error: 'CSRF token missing' }, 403); }
    const body = await c.req.json().catch(() => ({}));
    const token = (body?.token || '').toString().trim();
    if (!token) return c.json({ success: false, error: 'Token required' }, 400);
    const raw = new TextEncoder().encode(token);
    const digest = await crypto.subtle.digest('SHA-256', raw);
    const tokenHash = btoa(String.fromCharCode(...new Uint8Array(digest))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
    const { data: tok } = await supabase.from('auth_tokens').select('id,user_id,expires_at,used_at').eq('token_hash', tokenHash).eq('purpose', 'email_verify').maybeSingle();
    if (!tok || tok.used_at || (tok.expires_at && new Date(tok.expires_at).getTime() < Date.now())) {
      return c.json({ success: false, error: 'Invalid or expired token' }, 400);
    }
    const userId = tok.user_id || null;
    if (userId) {
      const { data: userRec } = await supabase.schema('auth').from('users').select('email').eq('id', userId).maybeSingle();
      const email = userRec?.email || '';
      const key = `email_verified:${email}:${Date.now()}`;
      await kv.set(key, { email, userId, timestamp: new Date().toISOString() });
      const current = (await kv.get(`user:${userId}`)) || {};
      await kv.set(`user:${userId}`, { ...current, id: userId, email, verificationStatus: 'verified', updatedAt: new Date().toISOString() });
      await supabase.from('auth_tokens').update({ used_at: new Date().toISOString() }).eq('id', tok.id);
      await supabase.from('sessions').update({ revoked_at: new Date().toISOString() }).eq('user_id', userId).is('revoked_at', null);
      try { await supabase.from('profiles').update({ email_verified: true }).eq('user_id', userId); } catch (_) {}
      try { await supabase.from('users').update({ status: 'verified', email_verified_at: new Date().toISOString() }).eq('id', userId); } catch (_) {}
    }
    return c.json({ success: true });
  } catch (e: any) {
    return c.json({ success: false, error: e?.message || 'Error' }, 500);
  }
});

auth.get('/auth/email/verify/confirm', async (c) => {
  try {
    if (disabled) { return c.json({ success: false, error: 'Endpoint disabled' }, 410); }
    const url = new URL(c.req.url);
    const token = (url.searchParams.get('token') || '').toString().trim();
    if (!token) return c.json({ success: false, error: 'Token required' }, 400);
    const raw = new TextEncoder().encode(token);
    const digest = await crypto.subtle.digest('SHA-256', raw);
    const tokenHash = btoa(String.fromCharCode(...new Uint8Array(digest))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
    const { data: tok } = await supabase.from('auth_tokens').select('id,user_id,expires_at,used_at').eq('token_hash', tokenHash).eq('purpose', 'email_verify').maybeSingle();
    if (!tok || tok.used_at || (tok.expires_at && new Date(tok.expires_at).getTime() < Date.now())) {
      return c.json({ success: false, error: 'Invalid or expired token' }, 400);
    }
    const userId = tok.user_id || null;
    if (userId) {
      const { data: userRec } = await supabase.schema('auth').from('users').select('email').eq('id', userId).maybeSingle();
      const email = userRec?.email || '';
      const key = `email_verified:${email}:${Date.now()}`;
      await kv.set(key, { email, userId, timestamp: new Date().toISOString() });
      const current = (await kv.get(`user:${userId}`)) || {};
      await kv.set(`user:${userId}`, { ...current, id: userId, email, verificationStatus: 'verified', updatedAt: new Date().toISOString() });
      await supabase.from('auth_tokens').update({ used_at: new Date().toISOString() }).eq('id', tok.id);
      await supabase.from('sessions').update({ revoked_at: new Date().toISOString() }).eq('user_id', userId).is('revoked_at', null);
      try { await supabase.from('profiles').update({ email_verified: true }).eq('user_id', userId); } catch (_) {}
      try { await supabase.from('users').update({ status: 'verified', email_verified_at: new Date().toISOString() }).eq('id', userId); } catch (_) {}
    }
    return c.json({ success: true });
  } catch (e: any) {
    return c.json({ success: false, error: e?.message || 'Error' }, 500);
  }
});

auth.post('/auth/password-reset/send', async (c) => {
  try {
    if (disabled) { return c.json({ success: false, error: 'Endpoint disabled' }, 410); }
    if (!requireCsrf(c)) { return c.json({ success: false, error: 'CSRF token missing' }, 403); }
    const body = await c.req.json().catch(() => ({}));
    const email = (body?.email || '').toString().trim().toLowerCase();
    if (!email) return c.json({ success: false, error: 'Email required' }, 400);
    const { data, error } = await supabase.auth.admin.generateLink({ type: 'recovery', email, options: { redirect_to: 'http://localhost:3001/' } });
    if (error) return c.json({ success: false, error: 'Failed to send reset link' }, 500);
    await kv.set(`password_reset:${email}:${Date.now()}`, { email, actionLink: data?.action_link, createdAt: new Date().toISOString() });
    try {
      const link = (data?.action_link || '').toString();
      if (link) {
        const raw = new TextEncoder().encode(link);
        const digest = await crypto.subtle.digest('SHA-256', raw);
        const tokenHash = btoa(String.fromCharCode(...new Uint8Array(digest))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
        const { data: existing } = await supabase.schema('auth').from('users').select('id').eq('email', email).maybeSingle();
        const userId = existing?.id || null;
        await supabase.from('auth_tokens').insert({ user_id: userId, token_hash: tokenHash, purpose: 'password_reset', expires_at: new Date(Date.now() + 24*60*60*1000).toISOString(), used_at: null });
      }
    } catch (_) {}
    return c.json({ success: true });
  } catch (e: any) {
    return c.json({ success: false, error: e?.message || 'Error' }, 500);
  }
});
auth.post('/auth/password-reset/confirm', async (c) => {
  try {
    if (!requireCsrf(c)) { return c.json({ success: false, error: 'CSRF token missing' }, 403); }
    const body = await c.req.json().catch(() => ({}));
    const email = (body?.email || '').toString().trim().toLowerCase();
    const newPassword = (body?.newPassword || '').toString();
    const token = (body?.token || '').toString();
    if (!email || !newPassword || !token) return c.json({ success: false, error: 'Missing fields' }, 400);
    const raw = new TextEncoder().encode(token);
    const digest = await crypto.subtle.digest('SHA-256', raw);
    const tokenHash = btoa(String.fromCharCode(...new Uint8Array(digest))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
    const { data: existing } = await supabase.schema('auth').from('users').select('id').eq('email', email).maybeSingle();
    const userId = existing?.id || null;
    if (!userId) return c.json({ success: false, error: 'User not found' }, 404);
    const { data: tok } = await supabase.from('auth_tokens').select('id,used_at,expires_at').eq('user_id', userId).eq('purpose', 'password_reset').eq('token_hash', tokenHash).maybeSingle();
    if (!tok || tok.used_at || (tok.expires_at && new Date(tok.expires_at).getTime() < Date.now())) {
      return c.json({ success: false, error: 'Invalid or expired token' }, 400);
    }
    const salt = crypto.getRandomValues(new Uint8Array(16));
    let encodedHash = '';
    try {
      const { hash, argon2id } = await getArgon();
      const h = await hash({ pass: newPassword, salt, type: argon2id });
      encodedHash = h.encoded || '';
    } catch (_) {}
    try {
      await supabase.auth.admin.updateUserById(userId, { password: newPassword });
    } catch (_) {}
    try {
      await supabase.from('credentials').upsert({ user_id: userId, password_hash: encodedHash || `argon2id:${btoa(String.fromCharCode(...salt))}`, password_require_reset: false, password_updated_at: new Date().toISOString() });
    } catch (_) {}
    try {
      await supabase.from('auth_tokens').update({ used_at: new Date().toISOString() }).eq('user_id', userId).eq('purpose', 'password_reset').eq('token_hash', tokenHash);
    } catch (_) {}
    try {
      await supabase.from('sessions').update({ revoked_at: new Date().toISOString() }).eq('user_id', userId).is('revoked_at', null);
    } catch (_) {}
    return c.json({ success: true });
  } catch (e: any) {
    return c.json({ success: false, error: e?.message || 'Error' }, 500);
  }
});

auth.post('/register/step', async (c) => {
  try {
    if (!requireCsrf(c)) { return c.json({ success: false, error: 'CSRF token missing' }, 403); }
    const body = await c.req.json().catch(() => ({}));
    const step = Number(body?.step);
    const status = (body?.status || '').toString();
    const email = (body?.email || '').toString().trim().toLowerCase();
    const data = body?.data || {};
    if (!(step >= 1 && step <= 4)) return c.json({ success: false, error: 'Invalid step' }, 400);
    if (!['started','completed'].includes(status)) return c.json({ success: false, error: 'Invalid status' }, 400);
    if (!email) return c.json({ success: false, error: 'Email required' }, 400);
    await supabase.from('registration_step_events').insert({ email, step, status, data });
    return c.json({ success: true });
  } catch (e: any) {
    return c.json({ success: false, error: e?.message || 'Error' }, 500);
  }
});

// Phone Registration Start Endpoint
auth.post('/api/register/start', async (c) => {
  if (disabled) { return c.json({ error: 'Endpoint disabled' }, 410); }
  try {
    const body = await c.req.json().catch(() => ({}));
    const { full_name, phone, email, idempotency_key } = body;
    const ip = getClientIp(c);
    
    // Validation
    if (!full_name?.trim()) return c.json({ error: 'Full name is required' }, 400);
    if (!phone?.trim()) return c.json({ error: 'Phone number is required for SMS verification' }, 400);
    
    const phoneRegex = /^\+?[1-9]\d{7,14}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return c.json({ error: 'Invalid phone number format' }, 400);
    }
    
    // Rate limiting
    const rlKey = `rate:phone-reg:${ip}`;
    const windowMs = 60 * 60 * 1000; // 1 hour
    const maxAttempts = 10;
    const now = Date.now();
    const rl = (await kv.get(rlKey)) || { count: 0, resetAt: new Date(now + windowMs).toISOString() };
    const resetAt = new Date(rl.resetAt).getTime();
    let count = rl.count || 0;
    if (now > resetAt) count = 0;
    if (count >= maxAttempts) {
      return c.json({ error: 'Too many registration attempts. Try again later.' }, 429);
    }
    
    // Generate OTP and registration token
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const regTokenBytes = crypto.getRandomValues(new Uint8Array(32));
    const regToken = btoa(String.fromCharCode(...regTokenBytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
    
    // Store registration data temporarily
    const regData = {
      full_name: full_name.trim(),
      phone: phone.trim(),
      email: email?.trim() || null,
      otp,
      ip,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
      verified: false
    };
    
    await kv.set(`phone_reg:${regToken}`, regData);
    
    // Send SMS OTP
    const smsResult = await sendSMS(phone, `Your CoreID verification code: ${otp}`);
    if (!smsResult.success) {
      return c.json({ error: 'Failed to send SMS. Please try email registration instead.' }, 502);
    }
    
    // Update rate limit
    await kv.set(rlKey, { count: count + 1, resetAt: now > resetAt ? new Date(now + windowMs).toISOString() : new Date(resetAt).toISOString() });
    
    return c.json({ 
      success: true, 
      reg_token: regToken,
      otp_expires_in: 600 // 10 minutes
    });
  } catch (error: any) {
    console.error('Phone registration start error:', error);
    return c.json({ error: 'Registration failed' }, 500);
  }
});

// Registration Phone Verification Endpoints (separate from PIN phone verification)
auth.post('/registration/send-otp', async (c) => {
  if (disabled) { return c.json({ success: false, error: 'Endpoint disabled' }, 410); }
  try {
    const body = await c.req.json().catch(() => ({}));
    const { phone, name, email } = body;
    const ip = getClientIp(c);
    
    // Validation
    if (!phone?.trim()) return c.json({ success: false, error: 'Phone number is required' }, 400);
    if (!name?.trim()) return c.json({ success: false, error: 'Name is required' }, 400);
    
    const phoneRegex = /^\+?[1-9]\d{7,14}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return c.json({ success: false, error: 'Invalid phone number format' }, 400);
    }
    
    // Rate limiting per phone number
    const rlKey = `rate:reg-phone:${phone}`;
    const windowMs = 60 * 60 * 1000; // 1 hour
    const maxAttempts = 5;
    const now = Date.now();
    const rl = (await kv.get(rlKey)) || { count: 0, resetAt: new Date(now + windowMs).toISOString() };
    const resetAt = new Date(rl.resetAt).getTime();
    let count = rl.count || 0;
    if (now > resetAt) count = 0;
    if (count >= maxAttempts) {
      return c.json({ success: false, error: 'Too many OTP requests for this phone number' }, 429);
    }
    
    // Generate OTP and registration token
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const regTokenBytes = crypto.getRandomValues(new Uint8Array(32));
    const regToken = btoa(String.fromCharCode(...regTokenBytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
    
    // Store registration verification data
    const verificationData = {
      phone: phone.trim(),
      name: name.trim(),
      email: email?.trim() || null,
      otp,
      ip,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
      verified: false,
      type: 'registration_verification'
    };
    
    await kv.set(`reg_verify:${regToken}`, verificationData);
    
    // Send SMS OTP
    const smsResult = await sendSMS(phone, `Your CoreID registration code: ${otp}. Valid for 10 minutes.`);
    if (!smsResult.success) {
      return c.json({ success: false, error: 'Failed to send SMS verification code' }, 502);
    }
    
    // Update rate limit
    await kv.set(rlKey, { count: count + 1, resetAt: now > resetAt ? new Date(now + windowMs).toISOString() : new Date(resetAt).toISOString() });
    
    // Audit log
    try {
      await supabase.from('auth_audit_log').insert({
        user_id: null,
        action: 'registration_otp_sent',
        outcome: 'success',
        ip,
        user_agent: c.req.header('user-agent') || 'unknown',
        details: { phone, name }
      });
    } catch (_) {}
    
    return c.json({ 
      success: true, 
      reg_token: regToken,
      expires_in: 600 // 10 minutes
    });
  } catch (error: any) {
    console.error('Registration OTP send error:', error);
    return c.json({ success: false, error: 'Failed to send verification code' }, 500);
  }
});

auth.post('/registration/verify-otp', async (c) => {
  if (disabled) { return c.json({ success: false, error: 'Endpoint disabled' }, 410); }
  try {
    const body = await c.req.json().catch(() => ({}));
    const { phone, otp, reg_token } = body;
    const ip = getClientIp(c);
    
    if (!reg_token) return c.json({ success: false, error: 'Registration token required' }, 400);
    if (!otp) return c.json({ success: false, error: 'OTP required' }, 400);
    if (!phone) return c.json({ success: false, error: 'Phone number required' }, 400);
    
    // Get verification data
    const verificationData = await kv.get(`reg_verify:${reg_token}`);
    if (!verificationData) {
      return c.json({ success: false, error: 'Invalid or expired verification token' }, 400);
    }
    
    // Check expiration
    if (new Date() > new Date(verificationData.expires_at)) {
      await kv.delete(`reg_verify:${reg_token}`);
      return c.json({ success: false, error: 'Verification code expired' }, 400);
    }
    
    // Verify phone number matches
    if (verificationData.phone !== phone.trim()) {
      return c.json({ success: false, error: 'Phone number mismatch' }, 400);
    }
    
    // Verify OTP
    if (verificationData.otp !== otp.trim()) {
      return c.json({ success: false, error: 'Invalid verification code' }, 400);
    }
    
    // Check if already verified
    if (verificationData.verified) {
      return c.json({ success: false, error: 'Verification code already used' }, 400);
    }
    
    // Mark as verified
    await kv.set(`reg_verify:${reg_token}`, { 
      ...verificationData, 
      verified: true, 
      verified_at: new Date().toISOString() 
    });
    
    // Store verified phone for registration completion
    const verifiedKey = `phone_verified:${phone}:${Date.now()}`;
    await kv.set(verifiedKey, {
      phone,
      name: verificationData.name,
      email: verificationData.email,
      reg_token,
      verified_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes to complete registration
    });
    
    // Audit log
    try {
      await supabase.from('auth_audit_log').insert({
        user_id: null,
        action: 'registration_phone_verified',
        outcome: 'success',
        ip,
        user_agent: c.req.header('user-agent') || 'unknown',
        details: { phone, name: verificationData.name }
      });
    } catch (_) {}
    
    return c.json({ 
      success: true,
      phone_verified: true,
      reg_token
    });
  } catch (error: any) {
    console.error('Registration OTP verify error:', error);
    return c.json({ success: false, error: 'Verification failed' }, 500);
  }
});

auth.get('/registration/status', async (c) => {
  try {
    const url = new URL(c.req.url);
    const token = url.searchParams.get('token');
    
    if (!token) return c.json({ success: false, status: 'unknown' }, 400);
    
    const verificationData = await kv.get(`reg_verify:${token}`);
    if (!verificationData) {
      return c.json({ success: false, status: 'not_found' });
    }
    
    const isExpired = new Date() > new Date(verificationData.expires_at);
    const status = isExpired ? 'expired' : (verificationData.verified ? 'verified' : 'pending');
    
    return c.json({ 
      success: true, 
      status,
      phone: verificationData.phone,
      name: verificationData.name,
      expires_at: verificationData.expires_at
    });
  } catch (error: any) {
    return c.json({ success: false, status: 'error' }, 500);
  }
});

// Phone Registration OTP Verification Endpoint
auth.post('/api/register/verify-otp', async (c) => {
  if (disabled) { return c.json({ error: 'Endpoint disabled' }, 410); }
  try {
    const body = await c.req.json().catch(() => ({}));
    const { reg_token, otp } = body;
    const ip = getClientIp(c);
    
    if (!reg_token) return c.json({ error: 'Registration token required' }, 400);
    if (!otp) return c.json({ error: 'OTP required' }, 400);
    
    // Get registration data
    const regData = await kv.get(`phone_reg:${reg_token}`);
    if (!regData) {
      return c.json({ error: 'Invalid or expired registration token' }, 400);
    }
    
    // Check expiration
    if (new Date() > new Date(regData.expires_at)) {
      await kv.delete(`phone_reg:${reg_token}`);
      return c.json({ error: 'Registration session expired' }, 400);
    }
    
    // Verify OTP
    if (regData.otp !== otp.trim()) {
      return c.json({ error: 'Invalid OTP' }, 400);
    }
    
    // Check if already verified
    if (regData.verified) {
      return c.json({ error: 'OTP already used' }, 400);
    }
    
    // Check if this is a verified phone registration
    const phoneVerified = await kv.get(`phone_verified:${regData.phone}:*`);
    
    // Create Supabase Auth user
    const tempPassword = crypto.randomUUID();
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      phone: regData.phone,
      password: tempPassword,
      user_metadata: {
        name: regData.full_name,
        userType: 'professional',
        phoneVerified: true,
        registrationMethod: 'phone'
      },
      phone_confirm: true
    });
    
    if (authError || !authData.user) {
      return c.json({ error: 'Failed to create user account' }, 500);
    }
    
    const userId = authData.user.id;
    
    // Generate PIN
    const pinChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const generatePinSegment = (length: number) => {
      let result = '';
      for (let i = 0; i < length; i++) {
        result += pinChars.charAt(Math.floor(Math.random() * pinChars.length));
      }
      return result;
    };
    const pin = `${generatePinSegment(3)}-${generatePinSegment(3)}-${generatePinSegment(6)}`;
    
    // Create user profile in KV store
    const profileValue = {
      id: userId,
      name: regData.full_name,
      phone: regData.phone,
      email: regData.email,
      userType: 'professional',
      pin,
      createdAt: new Date().toISOString(),
      verificationStatus: 'verified',
      phoneVerified: true
    };
    
    await kv.set(`user:${userId}`, profileValue);
    await kv.set(`pin:${pin}`, { userId, createdAt: new Date().toISOString() });
    
    // Create session tokens
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: regData.email || `${userId}@phone.coreid.com`,
      options: { redirect_to: '/dashboard' }
    });
    
    let accessToken = null;
    let refreshToken = null;
    
    if (!sessionError && sessionData) {
      // Extract tokens from the magic link response
      accessToken = sessionData.properties?.access_token;
      refreshToken = sessionData.properties?.refresh_token;
    }
    
    // Mark registration as verified and clean up
    await kv.set(`phone_reg:${reg_token}`, { ...regData, verified: true });
    
    // Audit log
    try {
      await supabase.from('auth_audit_log').insert({
        user_id: userId,
        action: 'phone_registration_completed',
        outcome: 'success',
        ip,
        user_agent: c.req.header('user-agent') || 'unknown',
        details: { phone: regData.phone, pin }
      });
    } catch (_) {}
    
    return c.json({ 
      success: true,
      pin,
      user_id: userId,
      accessToken,
      refreshToken
    });
  } catch (error: any) {
    console.error('Phone registration verify error:', error);
    return c.json({ error: 'Verification failed' }, 500);
  }
});

export { auth };
// Debug-only user count endpoint (requires header and env flag)
auth.get('/debug/auth-user-count', async (c) => {
  const allow = Deno.env.get('ALLOW_DEBUG_AUTH') === 'true';
  if (!allow) return c.json({ error: 'Not allowed' }, 403);
  if (c.req.header('X-Debug-Register') !== 'true') return c.json({ error: 'Missing debug header' }, 400);
  try {
    const { data, error } = await supabase.schema('auth').from('users').select('id', { count: 'exact', head: true });
    if (error) return c.json({ error: 'List users failed', details: error.message }, 500);
    return c.json({ success: true, userCount: data?.length ?? null });
  } catch (e: any) {
    return c.json({ error: 'Exception listing users', details: e?.message || 'unknown' }, 500);
  }
});
auth.post('/auth/refresh', async (c) => {
  try {
    if (!requireCsrf(c)) { return c.json({ success: false, error: 'CSRF token missing' }, 403); }
    const body = await c.req.json().catch(() => ({}));
    const rt = (body?.refreshToken || '').toString();
    if (!rt) return c.json({ success: false, error: 'Missing refresh token' }, 400);
    const { data, error } = await supabase.auth.refreshSession({ refresh_token: rt });
    if (error || !data?.session) return c.json({ success: false, error: 'Invalid refresh token' }, 401);
    const userId = data.session.user?.id || null;
    const raw = new TextEncoder().encode(rt);
    const digest = await crypto.subtle.digest('SHA-256', raw);
    const oldHash = btoa(String.fromCharCode(...new Uint8Array(digest))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
    try {
      await supabase.from('sessions').update({ revoked_at: new Date().toISOString() }).eq('user_id', userId).eq('refresh_token_hash', oldHash);
    } catch (_) {}
    let newHash = '';
    try {
      const rawNew = new TextEncoder().encode(data.session.refresh_token || '');
      const dNew = await crypto.subtle.digest('SHA-256', rawNew);
      newHash = btoa(String.fromCharCode(...new Uint8Array(dNew))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
    } catch (_) {}
    const ip = (c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || c.req.header('cf-connecting-ip') || 'unknown').toString();
    const userAgent = c.req.header('user-agent') || 'unknown';
    const deviceRaw = new TextEncoder().encode(`${userAgent}|${ip}`);
    const deviceDigest = await crypto.subtle.digest('SHA-256', deviceRaw);
    const deviceId = btoa(String.fromCharCode(...new Uint8Array(deviceDigest))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
    try {
      await supabase.from('sessions').insert({
        user_id: userId,
        device_id: deviceId,
        ip,
        user_agent: userAgent,
        refresh_token_hash: newHash || null,
        expires_at: data.session.expires_at ? new Date(data.session.expires_at * 1000).toISOString() : null,
        revoked_at: null
      });
    } catch (_) {}
    return c.json({ success: true, accessToken: data.session.access_token, refreshToken: data.session.refresh_token });
  } catch (e: any) {
    return c.json({ success: false, error: e?.message || 'Error' }, 500);
  }
});
