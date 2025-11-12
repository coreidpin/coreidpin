import { Hono } from "npm:hono";
import { getSupabaseClient } from "../lib/supabaseClient.tsx";
import * as kv from "../kv_store.tsx";

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
    const body = await c.req.json();
    const { email, password, name, userType, companyName, role, institution, gender } = body;

    // Validate required fields
    if (!email || !password || !name || !userType) {
      return c.json({ error: "Missing required fields: email, password, name, userType" }, 400);
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { 
        name, 
        userType,
        companyName: companyName || null,
        role: role || null,
        institution: institution || null,
        gender: gender || null
      },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (authError) {
      console.log("Registration error during auth creation:", authError);
      return c.json({ error: `Registration failed: ${authError.message}` }, 400);
    }

    // Store additional user data in KV store
    const userId = authData.user?.id;
    if (userId) {
      await kv.set(`user:${userId}`, {
        id: userId,
        email,
        name,
        userType,
        companyName: companyName || null,
        role: role || null,
        institution: institution || null,
        gender: gender || null,
        createdAt: new Date().toISOString(),
        verificationStatus: "pending"
      });

      // Create user profile entry
      await kv.set(`profile:${userType}:${userId}`, {
        userId,
        profileComplete: false,
        onboardingComplete: false,
        createdAt: new Date().toISOString()
      });
    }

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
      email_confirm: true
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
    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
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
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    const userAgent = c.req.header('user-agent') || 'unknown';

    // Update rate bucket
    await kv.set(bucketKey, { count: count + 1, resetAt: now > resetAt ? new Date(now + windowMs).toISOString() : new Date(resetAt).toISOString() });

    if (error) {
      console.log('Login error:', error);
      // Log failed attempt
      const logKey = `login_history:${email}:${Date.now()}`;
      await kv.set(logKey, {
        email,
        ip,
        userAgent,
        success: false,
        reason: error.message,
        timestamp: new Date().toISOString(),
      });
      return c.json({ error: `Login failed: ${error.message}` }, 401);
    }

    const userId = data.user?.id;
    const userData = userId ? await kv.get(`user:${userId}`) : null;

    // Log success attempt
    const logKey = `login_history:${userId || email}:${Date.now()}`;
    await kv.set(logKey, {
      userId: userId || null,
      email,
      ip,
      userAgent,
      success: true,
      timestamp: new Date().toISOString(),
    });

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

export { auth };
