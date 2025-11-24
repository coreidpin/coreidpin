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

// Simple GET for health check
app.get('/', (c) => {
  return c.json({ status: 'ok', message: 'Work Identity Update Function is running' });
});

// UPDATE Work Identity
app.put('*', async (c) => {
  console.log('PUT request received at path:', c.req.path);
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
    
    // Extract only allowed fields
    const { 
      work_experience, 
      skills, 
      tools, 
      industry_tags, 
      certifications 
    } = body;

    const updates: any = {};
    if (work_experience !== undefined) updates.work_experience = work_experience;
    if (skills !== undefined) updates.skills = skills;
    if (tools !== undefined) updates.tools = tools;
    if (industry_tags !== undefined) updates.industry_tags = industry_tags;
    if (certifications !== undefined) updates.certifications = certifications;

    if (Object.keys(updates).length === 0) {
      return c.json({ error: 'No valid fields to update' }, 400);
    }

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
      console.error('Work Identity update error:', error);
      throw error;
    }

    return c.json({ 
      success: true, 
      message: 'Work Identity updated successfully',
      profile: data
    });
  } catch (error: any) {
    console.error('Update Work Identity error:', error);
    return c.json({ 
      error: `Failed to update Work Identity: ${error.message || 'Unknown error'}`,
      details: JSON.stringify(error)
    }, 500);
  }
});

Deno.serve(app.fetch);
