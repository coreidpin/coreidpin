import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { createClient } from "npm:@supabase/supabase-js";
import { issuePinToUser, verifyPin } from "../_shared/pinService.ts";

const app = new Hono();

// Helper to verify JWT and extract user ID
async function getAuthUser(c: any) {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) return { user: null, error: 'No authorization header' };
    
    const token = authHeader.replace('Bearer ', '');
    const jwtSecret = Deno.env.get('JWT_SECRET') || Deno.env.get('SUPABASE_JWT_SECRET');
    
    if (!jwtSecret) {
      console.error('JWT_SECRET not configured');
      return { user: null, error: 'Server configuration error' };
    }

    // Verify the JWT
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
      return { 
        user: { id: payload.sub as string, email: payload.email as string || '' }, 
        error: null 
      };
    }
    
    return { user: null, error: 'Invalid token' };
  } catch (error) {
    console.error('Token verification failed:', error);
    return { user: null, error: 'Token verification failed' };
  }
}

// Middleware
app.use("/*", cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization", "apikey"],
  allowMethods: ["POST", "GET", "OPTIONS"],
  credentials: false,
}));

// Auth Middleware for protected routes
const authMiddleware = async (c: any, next: any) => {
  const { user, error } = await getAuthUser(c);
  if (error || !user) {
    console.error('Auth Middleware Error:', error);
    return c.json({ 
      success: false, 
      error: 'Unauthorized: ' + (error?.message || 'Invalid Token'),
      details: error // Expose full error for debugging
    }, 401);
  }
  c.set('userId', user.id);
  await next();
};

app.use("/issue", authMiddleware);
app.use("/pin/issue", authMiddleware);
app.use("/functions/v1/pin/issue", authMiddleware);

// Routes
const handleIssue = async (c: any) => {
  const userId = c.get('userId');
  const body = await c.req.json().catch(() => ({}));
  const { customPin } = body;

  console.log('Issuing PIN for user:', userId, 'Custom PIN requested:', !!customPin);
  
  const result = await issuePinToUser(userId, customPin);

  // Auto-verify if profile is complete
  if (result.success) {
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const { data: profile } = await supabase
        .from('profiles')
        .select('name, role, email')
        .eq('user_id', userId)
        .single();

      if (profile && profile.name && profile.role && profile.email) {
        console.log(`Profile complete for user ${userId}, auto-verifying new PIN...`);
        await supabase
          .from('professional_pins')
          .update({ 
            verification_status: 'verified',
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);
      }
    } catch (err) {
      console.error('Failed to auto-verify new PIN:', err);
      // Don't fail the request, just log the error
    }
  }

  return c.json(result);
};

app.post("/issue", handleIssue);
app.post("/pin/issue", handleIssue);
app.post("/functions/v1/pin/issue", handleIssue);

const handleVerify = async (c: any) => {
  const body = await c.req.json().catch(() => ({}));
  const { pin, verifierType, verifierId } = body;
  
  if (!pin || !verifierType || !verifierId) {
    return c.json({ success: false, error: 'Missing required fields' }, 400);
  }
  
  const result = await verifyPin(pin, verifierType, verifierId);
  return c.json(result);
};

app.post("/verify", handleVerify);
app.post("/pin/verify", handleVerify);
app.post("/functions/v1/pin/verify", handleVerify);

Deno.serve(app.fetch);
