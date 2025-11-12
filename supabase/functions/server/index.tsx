import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { getSupabaseClient } from "./lib/supabaseClient.tsx";
import { validateServerEnv } from "./lib/envCheck.tsx";
import * as kv from "./kv_store.tsx";
import { matching } from "./routes/matching.tsx";
import { auth } from "./routes/auth.tsx";
import { ai } from "./routes/ai.tsx";
import { professionals } from "./routes/professionals.tsx";
import { profile } from "./routes/profile.tsx";
import { signVerificationToken } from "./lib/token.ts";
// Note: PIN routes are handled within profile routes for now

// Validate environment before app initializes
validateServerEnv();
const app = new Hono();

// Supabase client singleton
const supabase = getSupabaseClient();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "X-CSRF-Token", "apikey"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    credentials: false,
    maxAge: 600,
  }),
);

// Explicit OPTIONS handler for all routes to ensure preflight succeeds
app.options("/*", (c) => {
  return c.text("", 204);
});

// Health check endpoint (must include function slug in path)
app.get("/server/health", (c) => {
  return c.json({ status: "ok" });
});

// Registration data validation endpoint
app.post("/server/validate-registration", async (c) => {
  try {
    const body = await c.req.json();
    const entryPoint = body.entryPoint as 'signup' | 'get-started' | undefined;
    const userType = body.userType as 'professional' | 'employer' | 'university' | undefined;
    const data = body.data || {};

    const errors: string[] = [];

    if (!entryPoint) errors.push('Missing entryPoint');
    if (!userType) errors.push('Missing userType');

    // Common fields
    const email = (data.email || data.contactEmail || '').toString().trim();
    const name = (data.name || '').toString().trim();
    const phone = (data.phone || '').toString().trim();
    const password = (data.password || '').toString();
    const confirmPassword = (data.confirmPassword || '').toString();

    // Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      errors.push('Email Address must be a valid email');
    }

    if (!name) {
      errors.push('Full Name is required');
    }

    // Phone optional: allow +country and digits, spaces, hyphens
    if (phone && !/^\+?[0-9\s-]{7,20}$/.test(phone)) {
      errors.push('Phone Number format is invalid');
    }

    // Password requirements for both entry points
    if (!password || password.length < 6) {
      errors.push('Password must be at least 6 characters');
    }
    if (password !== confirmPassword) {
      errors.push('Password and Confirm Password must match');
    }

    // User-type specific validations
    if (userType === 'professional') {
      const title = (data.title || '').toString().trim();
      const location = (data.location || '').toString().trim();
      if (!title) errors.push('Professional Title is required');
      if (!location) errors.push('Location is required');
    }

    if (userType === 'employer') {
      const companyName = (data.companyName || '').toString().trim();
      const industry = (data.industry || '').toString().trim();
      const headquarters = (data.headquarters || '').toString().trim();
      const contactEmail = (data.contactEmail || '').toString().trim();
      if (!companyName) errors.push('Company Name is required');
      if (!industry) errors.push('Industry is required');
      if (!headquarters) errors.push('Headquarters Location is required');
      if (!contactEmail || !emailRegex.test(contactEmail)) {
        errors.push('Contact Email must be a valid email');
      }
    }

    return c.json({ valid: errors.length === 0, errors });
  } catch (error: any) {
    return c.json({ valid: false, errors: ['Validation failed', error?.message] }, 400);
  }
});

// Mount modular route groups under function slug base
app.route('/server', auth);
app.route('/server/ai', ai);
app.use('/server/professionals/*', requireAuth);
app.route('/server/professionals', professionals);
app.route('/server/profile', profile);
// PIN routes are handled within profile routes

// Route handlers for professionals and profile are provided by modular routers above.

// Mount matching routes group under function slug base
app.use('/server/*', requireAuth);
app.route('/server', matching);

export default app;
app.post('/server/auth/session-cookie', async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const token = (body?.token || '').toString();
    if (!token) return c.json({ success: false, error: 'Missing token' }, 400);
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) return c.json({ success: false, error: 'Invalid token' }, 401);
    const secure = true;
    const sameSite = 'Lax';
    const maxAge = 60 * 60;
    c.header('Set-Cookie', `sb_access_token=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=${sameSite}; Path=/; Max-Age=${maxAge}`);
    const csrf = crypto.getRandomValues(new Uint8Array(16)).reduce((s,b)=>s+('0'+b.toString(16)).slice(-2),'');
    c.header('Set-Cookie', `csrf_token=${csrf}; HttpOnly; Secure; SameSite=${sameSite}; Path=/; Max-Age=${maxAge}`);
    await kv.set(`auth:state:${Date.now()}`, { event: 'session-cookie-set', userId: data.user.id, ts: new Date().toISOString() });
    return c.json({ success: true, csrf });
  } catch (e: any) {
    return c.json({ success: false, error: e?.message || 'Unknown error' }, 500);
  }
});

app.post('/server/auth/logout', async (c) => {
  const secure = true;
  const sameSite = 'Lax';
  c.header('Set-Cookie', `sb_access_token=; HttpOnly; Secure; SameSite=${sameSite}; Path=/; Max-Age=0`);
  c.header('Set-Cookie', `csrf_token=; HttpOnly; Secure; SameSite=${sameSite}; Path=/; Max-Age=0`);
  await kv.set(`auth:state:${Date.now()}`, { event: 'logout', ts: new Date().toISOString() });
  return c.json({ success: true });
});

async function requireAuth(c: any, next: any) {
  try {
    const path = new URL(c.req.url).pathname;
    const method = c.req.method.toUpperCase();
    if (method === 'OPTIONS') { await next(); return; }
    const publicPaths = ['/server/health', '/server/send-verification', '/server/resend-verification', '/server/auth/verify-link'];
    if (publicPaths.includes(path)) { await next(); return; }
    const authz = c.req.header('Authorization') || '';
    const cookie = c.req.header('Cookie') || '';
    let token = '';
    if (authz.startsWith('Bearer ')) token = authz.slice(7);
    if (!token && cookie) {
      const m = /sb_access_token=([^;]+)/.exec(cookie);
      if (m) token = decodeURIComponent(m[1]);
    }
    if (!token) return c.json({ success: false, error: 'Unauthorized' }, 401);
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) return c.json({ success: false, error: 'Unauthorized' }, 401);
    const csrfCookie = /csrf_token=([^;]+)/.exec(cookie || '');
    const csrfHeader = c.req.header('X-CSRF-Token') || '';
    const mutating = method === 'POST' || method === 'PUT' || method === 'DELETE' || method === 'PATCH';
    if (mutating && (!csrfCookie || csrfCookie[1] !== csrfHeader)) return c.json({ success: false, error: 'CSRF' }, 403);
    c.set('user', data.user);
    await next();
  } catch {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }
}
