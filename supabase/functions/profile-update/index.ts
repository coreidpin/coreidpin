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
  allowHeaders: ["Content-Type", "Authorization", "x-client-info", "apikey"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: false,
}));

// Verify JWT and extract user ID
async function verifyToken(token: string): Promise<{ userId: string } | null> {
  try {
    const jwtSecret = Deno.env.get('JWT_SECRET') || Deno.env.get('SUPABASE_JWT_SECRET');
    if (!jwtSecret) {
      console.error('JWT_SECRET not configured');
      return null;
    }

    // Import the JWT verification from djwt
    const { verify } = await import("https://deno.land/x/djwt@v2.9.1/mod.ts");
    
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(jwtSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const payload = await verify(token, key);
    
    if (payload && payload.sub) {
      return { userId: payload.sub as string };
    }
    
    return null;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

// GET profile
app.get('/', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const auth = await verifyToken(token);
    if (!auth) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', auth.userId)
      .single();

    if (error) {
      console.error('Profile fetch error:', error);
      return c.json({ error: 'Profile not found' }, 404);
    }

    return c.json({ success: true, profile: data });
  } catch (error) {
    console.error('Get profile error:', error);
    return c.json({ error: 'Failed to get profile' }, 500);
  }
});

// UPDATE profile
app.put('*', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const auth = await verifyToken(token);
    if (!auth) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    const body = await c.req.json();
    
    // Remove sensitive fields that shouldn't be updated via this endpoint
    const { user_id, created_at, ...updates } = body;

    // Update profile using service role (bypasses RLS)
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', auth.userId)
      .select()
      .single();

    if (error) {
      console.error('Profile update error:', error);
      throw error;
    }

    // Option 2: Profile-Based Verification Logic
    // Check if profile is complete enough for verification
    if (data.name && data.role && data.email) {
      console.log(`Profile complete for user ${auth.userId}, checking verification status...`);
      
      // Update PIN verification status to 'verified'
      const { error: pinError } = await supabase
        .from('professional_pins')
        .update({ 
          verification_status: 'verified',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', auth.userId)
        .eq('verification_status', 'active'); // Only upgrade if currently active (pending)

      if (pinError) {
        console.error('Failed to auto-verify PIN:', pinError);
      } else {
        console.log(`Auto-verified PIN for user ${auth.userId}`);
      }
    }

    return c.json({ 
      success: true, 
      message: 'Profile updated successfully',
      profile: data
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return c.json({ error: 'Failed to update profile' }, 500);
  }
});

Deno.serve(app.fetch);
