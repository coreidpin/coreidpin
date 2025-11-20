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

const handleMe = async (c: any) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ error: 'Authorization header required' }, 401);
    }

    const token = authHeader.replace('Bearer ', '');

    // 1. Validate Token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    // 2. Fetch Profile & PIN Status
    const { data: profile, error: profileError } = await supabase
      .from('identity_users')
      .select('full_name, email, phone_hash, pin_hash, verified, profile_completion')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      // If not found in identity_users, try profiles (legacy) or return basic info
      console.warn('Profile not found in identity_users:', profileError);
      return c.json({ 
        id: user.id,
        email: user.email,
        pin_set: false,
        verified: false
      });
    }

    return c.json({
      id: user.id,
      email: profile.email || user.email,
      full_name: profile.full_name,
      pin_set: !!profile.pin_hash, // Boolean flag
      verified: profile.verified,
      profile_completion: profile.profile_completion
    });

  } catch (error) {
    console.error('User profile error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
};

// Register routes with multiple path variations
app.get('/me', handleMe);
app.get('/user/me', handleMe);
app.get('/functions/v1/user/me', handleMe);

Deno.serve(app.fetch);
