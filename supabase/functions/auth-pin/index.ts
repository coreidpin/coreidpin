// DEPRECATED: This function is no longer used as of 2025-11-20. 
// PIN authentication has been removed in favor of true passwordless auth via auth-otp.
import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { createClient } from "npm:@supabase/supabase-js";
import * as bcrypt from "npm:bcryptjs";
import { create, getNumericDate } from "https://deno.land/x/djwt@v2.9.1/mod.ts";

const app = new Hono();

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const JWT_SECRET = Deno.env.get('JWT_SECRET') ?? '';

app.use("/*", cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization", "X-CSRF-Token", "apikey"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: false,
}));

// Helper to generate Supabase JWT
async function generateJWT(userId: string, email: string | null) {
  const payload = {
    aud: "authenticated",
    exp: getNumericDate(60 * 60 * 24), // 24 hours
    sub: userId,
    email: email || "",
    role: "authenticated",
    app_metadata: { provider: "email", providers: ["email"] },
    user_metadata: {}
  };
  
  // Use the project's JWT secret to sign
  // Note: In production, ensure SUPABASE_JWT_SECRET is set
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(JWT_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  return await create({ alg: "HS256", typ: "JWT" }, payload, key);
}

const handleSetup = async (c: any) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const { reg_token, pin, full_name } = body;

    if (!reg_token || !pin) {
      return c.json({ error: 'Registration token and PIN required' }, 400);
    }
    if (pin.length < 4) {
      return c.json({ error: 'PIN must be at least 4 digits' }, 400);
    }

    // 1. Verify reg_token
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('token', reg_token)
      .eq('scope', 'pin_setup')
      .gt('expires_at', new Date().toISOString())
      .single();

    if (sessionError || !session) {
      return c.json({ error: 'Invalid or expired registration session' }, 401);
    }

    // 2. Hash PIN
    const pinHash = await bcrypt.hash(pin, 10);

    // 3. Create/Update User
    let userId = session.user_id;
    let email: string | null = null;

    if (!userId) {
      // New user - create in auth.users first
      // For passwordless flow, generate a unique email
      // Use the session token to create a unique identifier
      const uniqueId = session.token.substring(0, 12);
      const placeholderEmail = `passwordless_${uniqueId}@coreid.app`;
      
      // Generate a random password that meets strict complexity requirements
      const randomPassword = `P@ssw0rd_${crypto.randomUUID()}!`;
      
      // Use RPC function to bypass Auth API issues
      const { data: newUserId, error: createError } = await supabase.rpc('create_passwordless_user', {
        p_email: placeholderEmail,
        p_password: randomPassword
      });

      if (createError) {
        console.error('User creation error (RPC):', createError);
        console.error('Error details:', JSON.stringify(createError, null, 2));
        
        return c.json({ 
          error: 'Failed to create user account',
          details: createError.message,
          full_error: createError
        }, 500);
      }

      if (!newUserId) {
        console.error('No user ID returned from RPC');
        return c.json({ error: 'Failed to create user account (no ID)' }, 500);
      }

      userId = newUserId;
      email = placeholderEmail;

      // Create identity_users record
      // We use upsert to handle cases where the user exists but identity record is missing or incomplete
      // We also provide placeholder phone data if missing, as the schema requires it (Phone-First design)
      const placeholderPhoneHash = crypto.randomUUID(); 
      
      const { error: identityError } = await supabase
        .from('identity_users')
        .upsert({
          user_id: userId,
          pin_hash: pinHash,
          full_name: full_name || null, // Store full_name
          status: 'active',
          // Provide required fields even if they are placeholders for email-only users
          phone_hash: placeholderPhoneHash, 
          phone_encrypted: 'placeholder',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (identityError) {
        console.error('Identity user creation error:', identityError);
        console.error('Identity error details:', JSON.stringify(identityError, null, 2));
        return c.json({ 
          error: 'Failed to create user identity',
          details: identityError.message,
          full_error: identityError
        }, 500);
      }

      // Update session with the new user_id
      await supabase
        .from('sessions')
        .update({ user_id: userId })
        .eq('id', session.id);
    } else {
      // Existing user - just update PIN
      const { error: updateError } = await supabase
        .from('identity_users')
        .update({ 
          pin_hash: pinHash,
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('PIN setup update error:', updateError);
        return c.json({ error: 'Failed to set PIN' }, 500);
      }

      // Fetch user email for JWT
      const { data: userData } = await supabase.auth.admin.getUserById(userId);
      email = userData?.user?.email || null;
    }

    // 4. Issue JWT
    const jwt = await generateJWT(userId, email);

    // 5. Cleanup session
    await supabase.from('sessions').delete().eq('id', session.id);

    // Log audit
    await supabase.from('audit_events').insert({
      event_type: 'pin_set',
      user_id: userId
    });

    return c.json({
      status: 'ok',
      access_token: jwt,
      expires_in: 86400,
      user: { id: userId, email }
    });

  } catch (error) {
    console.error('PIN setup error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return c.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, 500);
  }
};

const handleVerify = async (c: any) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const { reg_token, pin } = body;

    if (!reg_token || !pin) {
      return c.json({ error: 'Registration token and PIN required' }, 400);
    }

    // 1. Verify reg_token
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('token', reg_token)
      .eq('scope', 'pin_required')
      .gt('expires_at', new Date().toISOString())
      .single();

    if (sessionError || !session) {
      return c.json({ error: 'Invalid or expired registration session' }, 401);
    }

    const userId = session.user_id;
    if (!userId) {
      return c.json({ error: 'Invalid session state' }, 400);
    }

    // 2. Get User PIN
    const { data: user, error: userError } = await supabase
      .from('identity_users')
      .select('pin_hash, pin_failed_attempts, pin_locked_until')
      .eq('user_id', userId)
      .single();

    if (userError || !user || !user.pin_hash) {
      return c.json({ error: 'User not found or PIN not set' }, 404);
    }

    // 3. Check Lockout
    if (user.pin_locked_until && new Date(user.pin_locked_until) > new Date()) {
      return c.json({ error: 'Account locked. Please try again later.' }, 423);
    }

    // 4. Verify PIN
    const isValid = await bcrypt.compare(pin, user.pin_hash);

    if (!isValid) {
      // Increment failed attempts
      const attempts = (user.pin_failed_attempts || 0) + 1;
      const updateData: any = { pin_failed_attempts: attempts };
      
      if (attempts >= 5) {
        updateData.pin_locked_until = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 min lock
      }

      await supabase.from('identity_users').update(updateData).eq('user_id', userId);

      // Log failure
      await supabase.from('audit_events').insert({
        event_type: 'login_fail',
        user_id: userId,
        meta: { reason: 'incorrect_pin' }
      });

      return c.json({ error: 'Incorrect PIN' }, 401);
    }

    // 5. Success - Reset attempts
    await supabase.from('identity_users').update({ 
      pin_failed_attempts: 0, 
      pin_locked_until: null 
    }).eq('user_id', userId);

    // 6. Issue JWT
    const { data: userData } = await supabase.auth.admin.getUserById(userId);
    const email = userData?.user?.email || null;
    const jwt = await generateJWT(userId, email);

    // 7. Cleanup session
    await supabase.from('sessions').delete().eq('id', session.id);

    // Log success
    await supabase.from('audit_events').insert({
      event_type: 'login_success',
      user_id: userId
    });

    return c.json({
      status: 'ok',
      access_token: jwt,
      expires_in: 86400,
      user: { id: userId, email }
    });

  } catch (error) {
    console.error('PIN verify error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
};

// Register routes with multiple path variations
app.post('/setup', handleSetup);
app.post('/auth-pin/setup', handleSetup);
app.post('/functions/v1/auth-pin/setup', handleSetup);

app.post('/verify', handleVerify);
app.post('/auth-pin/verify', handleVerify);
app.post('/functions/v1/auth-pin/verify', handleVerify);

Deno.serve(app.fetch);
