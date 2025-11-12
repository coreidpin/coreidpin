import { Hono } from "npm:hono";
import { getSupabaseClient } from "../lib/supabaseClient.tsx";
import * as kv from "../kv_store.tsx";
import { maybeEncryptKVValue } from "../lib/crypto.tsx";
import { verifyVerificationToken } from "../lib/token.ts";

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

// User Registration Endpoint
auth.post("/register", async (c) => {
  try {
    // CSRF protection (double-submit header presence)
    if (!requireCsrf(c)) {
      return c.json({ error: 'CSRF token missing' }, 403);
    }

    const body = await c.req.json();
    const { 
      email, 
      password, 
      name, 
      userType, 
      title, 
      companyName, 
      role, 
      institution, 
      gender, 
      phoneNumber,
      location,
      yearsOfExperience,
      currentCompany,
      seniority,
      topSkills,
      highestEducation,
      resumeFileName
    } = body;

    // Basic field validation
    const errors: string[] = [];
    const emailStr = (email || '').toString().trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailStr || !emailRegex.test(emailStr)) errors.push('Email must be valid');
    if (!password || typeof password !== 'string') errors.push('Password is required');
    if (!name || !name.toString().trim()) errors.push('Full name is required');
    if (!userType) errors.push('User type is required');
    // Strong password rules
    if (password) {
      const strong = [
        password.length >= 8,
        /[A-Z]/.test(password),
        /[a-z]/.test(password),
        /[0-9]/.test(password),
        /[!@#$%^&*(),.?":{}|<>]/.test(password)
      ].every(Boolean);
      if (!strong) errors.push('Password must be 8+ chars with upper, lower, number, symbol');
    }
    if (errors.length) {
      return c.json({ error: errors[0], errors }, 400);
    }

    // Registration rate limiting per IP
    const ip = getClientIp(c);
    const rlWindowMs = 60 * 60 * 1000; // 1 hour
    const rlMax = 20; // max 20 registrations/hour/ip
    const now = Date.now();
    const rlKey = `rate:register:${ip}`;
    const rl = (await kv.get(rlKey)) || { count: 0, resetAt: new Date(now + rlWindowMs).toISOString() };
    const rlResetAt = new Date(rl.resetAt).getTime();
    let rlCount = rl.count || 0;
    if (now > rlResetAt) rlCount = 0;
    if (rlCount >= rlMax) {
      await kv.set(rlKey, { count: rlCount, resetAt: new Date(rlResetAt).toISOString() });
      return c.json({ error: 'Too many registrations. Try again later.' }, 429);
    }

    // Unique email check (service role)
    try {
      const { data: existing } = await supabase.schema('auth').from('users').select('id').eq('email', emailStr).maybeSingle();
      if (existing?.id) {
        return c.json({ error: 'Email already registered' }, 409);
      }
    } catch (_) {
      // If auth.users not accessible, proceed and rely on createUser error handling
    }

    // Validate required fields
    if (!emailStr || !password || !name || !userType) {
      return c.json({ error: "Missing required fields: email, password, name, userType" }, 400);
    }

    // Create user in Supabase Auth (do NOT auto-confirm; require email verification)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: emailStr,
      password,
      user_metadata: { 
        name, 
        userType,
        title: title || null,
        companyName: companyName || null,
        role: role || null,
        institution: institution || null,
        gender: gender || null,
        location: location || null,
        yearsOfExperience: yearsOfExperience || null,
        currentCompany: currentCompany || null,
        seniority: seniority || null,
        topSkills: topSkills || null,
        highestEducation: highestEducation || null,
        resumeFileName: resumeFileName || null
      },
      email_confirm: false
    });

    if (authError) {
      console.log("Registration error during auth creation:", authError);
      return c.json({ error: `Registration failed: ${authError.message}` }, 400);
    }

    // Store additional user data in KV store
    const userId = authData.user?.id;
    if (userId) {
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
        }
      } catch (profilesErr) {
        console.log('profiles sync failed during registration:', profilesErr);
      }

      // Send verification magic link (24h expiry configured in Supabase project settings)
      try {
        const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
          type: 'magiclink',
          email,
          options: {
            redirect_to: 'http://localhost:3001/'
          }
        });
        if (linkErr) {
          console.log('generateLink error:', linkErr);
        } else if (linkData?.action_link) {
          await kv.set(`verification_link:${userId}:${Date.now()}`, {
            userId,
            email,
            actionLink: linkData.action_link,
            redirectTo: 'http://localhost:3001/',
            createdAt: new Date().toISOString()
          });
        }
      } catch (genErr) {
        console.log('Failed to generate verification link:', genErr);
      }

      // Lightweight audit trail for registration
      // (Encrypted when ENCRYPTION_KEY_BASE64 is set)
      const userAgent = c.req.header('user-agent') || 'unknown';
      const auditPayload = {
        userId,
        email: emailStr,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
        action: 'register',
      };
      try {
        const enc = await maybeEncryptKVValue(auditPayload);
        await kv.set(`audit:registration:${userId}:${Date.now()}`, enc);
      } catch (_) {}
    }

    // Increment registration rate limit counter for this IP
    try {
      await kv.set(rlKey, { count: rlCount + 1, resetAt: now > rlResetAt ? new Date(now + rlWindowMs).toISOString() : new Date(rlResetAt).toISOString() });
    } catch (_) {}

    return c.json({ 
      success: true, 
      message: "Registration successful",
      userId,
      userType
    });
  } catch (error) {
    console.log("Registration error:", error);
    return c.json({ error: `Registration failed: ${error.message}` }, 500);
  }
});

// Sign Up Endpoint (Alternative for OAuth)
auth.post("/signup", async (c) => {
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

    // Attempt login
    const { data, error } = await supabase.auth.signInWithPassword({ email: emailStr, password });
    const userAgent = c.req.header('user-agent') || 'unknown';

    // Update rate bucket
    await kv.set(bucketKey, { count: count + 1, resetAt: now > resetAt ? new Date(now + windowMs).toISOString() : new Date(resetAt).toISOString() });

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
  try {
    if (!requireCsrf(c)) {
      return c.json({ error: 'CSRF token missing' }, 403);
    }
    const body = await c.req.json();
    const email = (body?.email || '').toString().trim().toLowerCase();
    if (!email) return c.json({ error: 'Email is required' }, 400);

    const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: { redirect_to: 'http://localhost:3001/' }
    });
    if (linkErr) {
      console.log('send-verification generateLink error:', linkErr);
      return c.json({ error: 'Failed to send verification link' }, 500);
    }

    await kv.set(`verification_link:${email}:${Date.now()}`, {
      email,
      actionLink: linkData?.action_link,
      redirectTo: 'http://localhost:3001/',
      createdAt: new Date().toISOString()
    });

    return c.json({ success: true });
  } catch (err: any) {
    console.log('send-verification error:', err);
    return c.json({ error: err?.message || 'Unknown error' }, 500);
  }
});

auth.post('/resend-verification', async (c) => {
  try {
    if (!requireCsrf(c)) {
      return c.json({ error: 'CSRF token missing' }, 403);
    }
    const body = await c.req.json();
    const email = (body?.email || '').toString().trim().toLowerCase();
    if (!email) return c.json({ error: 'Email is required' }, 400);

    const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: { redirect_to: 'http://localhost:3001/' }
    });
    if (linkErr) {
      console.log('resend-verification generateLink error:', linkErr);
      return c.json({ error: 'Failed to resend verification link' }, 500);
    }

    await kv.set(`verification_link_resend:${email}:${Date.now()}`, {
      email,
      actionLink: linkData?.action_link,
      redirectTo: 'http://localhost:3001/',
      createdAt: new Date().toISOString()
    });

    return c.json({ success: true });
  } catch (err: any) {
    console.log('resend-verification error:', err);
    return c.json({ error: err?.message || 'Unknown error' }, 500);
  }
});

// Signed link verification (public GET)
auth.get('/auth/verify-link', async (c) => {
  try {
    const url = new URL(c.req.url);
    const token = url.searchParams.get('token') || '';
    if (!token) return c.json({ success: false, error: 'Missing token' }, 400);
    const textEncoder = new TextEncoder();
    const raw = textEncoder.encode(token);
    const digest = await crypto.subtle.digest('SHA-256', raw);
    const hash = btoa(String.fromCharCode(...new Uint8Array(digest))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
    const usedKey = `verify:used:${hash}`;
    const used = await kv.get(usedKey);
    if (used?.used) return c.json({ success: false, error: 'Link already used' }, 410);
    const email = await verifyVerificationToken(token);
    const { data: existing } = await supabase.schema('auth').from('users').select('id').eq('email', email).maybeSingle();
    const userId = existing?.id || null;
    try {
      const key = `email_verified:${email}:${Date.now()}`;
      await kv.set(key, { email, userId, timestamp: new Date().toISOString() });
      if (userId) {
        const current = (await kv.get(`user:${userId}`)) || {};
        await kv.set(`user:${userId}`, { ...current, id: userId, email, verificationStatus: 'verified', updatedAt: new Date().toISOString() });
      }
      await kv.set(usedKey, { used: true, at: new Date().toISOString() });
    } catch (_) {}
    return c.json({ success: true });
  } catch (e: any) {
    return c.json({ success: false, error: e?.message || 'Invalid token' }, 400);
  }
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

export { auth };
