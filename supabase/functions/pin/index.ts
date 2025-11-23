import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { createClient } from "npm:@supabase/supabase-js";
import { issuePinToUser, verifyPin } from "../_shared/pinService.ts";

const app = new Hono();

// Helper to get Auth User
async function getAuthUser(c: any) {
  const authHeader = c.req.header('Authorization');
  if (!authHeader) return { user: null, error: 'No authorization header' };
  
  const token = authHeader.replace('Bearer ', '');
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  );
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error) {
    console.error('getUser failed:', {
      message: error.message,
      status: error.status,
      name: error.name,
      token_preview: token.substring(0, 10) + '...'
    });
  }

  return { user, error };
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
