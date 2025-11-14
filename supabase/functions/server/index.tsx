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
import { diagnostics } from "./routes/diagnostics.tsx";
import { pin } from "./routes/pin.tsx";
import { requireAuth } from "./lib/auth.ts";
import { signVerificationToken } from "./lib/token.ts";
import { trackApiPerformance } from "./lib/monitoring.ts";
// Note: PIN routes are now separate from profile routes

// Validate environment before app initializes (non-fatal)
try {
  validateServerEnv();
} catch (e: any) {
  console.error('ENV_VALIDATION_FAILED', e?.message || e);
}
const disabledAuth = Deno.env.get('DISABLE_AUTH_ENDPOINTS') === 'true';
const app = new Hono();

// Supabase client singleton
const supabase = getSupabaseClient();

// Enable logger
app.use('*', logger(console.log));

// Performance monitoring middleware
app.use('*', async (c, next) => {
  const start = Date.now();
  const endpoint = c.req.path;
  const method = c.req.method;
  
  await next();
  
  const responseTime = Date.now() - start;
  const statusCode = c.res.status;
  
  // Track performance for all requests
  try {
    // Extract user ID if available
    let userId = undefined;
    const authz = c.req.header('Authorization') || '';
    if (authz.startsWith('Bearer ')) {
      const token = authz.slice(7);
      if (token) {
        // We could decode the JWT to get user ID, but for now we'll skip this
        // to avoid additional overhead
      }
    }
    
    await trackApiPerformance(endpoint, method, statusCode, responseTime, userId);
  } catch (e) {
    console.error('Failed to track API performance:', e);
  }
});

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

// Registration data validation endpoint (public) - dual path support
// 1. /validate-registration (preferred public path)
// 2. /server/validate-registration (legacy path kept for compatibility)
async function handleValidateRegistration(c: any) {
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
}

app.post('/validate-registration', handleValidateRegistration);
app.post('/server/validate-registration', handleValidateRegistration);

// Mount modular route groups under function slug base
// Auth routes should be mounted before global auth middleware but after public endpoints
app.route('/server', auth);
app.route('/server/ai', ai);
app.route('/server/diagnostics', diagnostics);
app.use('/server/professionals/*', requireAuth);
app.route('/server/professionals', professionals);
app.route('/server/profile', profile);
app.use('/server/pin/*', requireAuth);
app.route('/server/pin', pin);

// Route handlers for professionals and profile are provided by modular routers above.

// Final catch-all auth for remaining /server routes excluding already handled public ones
app.use('/server/*', requireAuth);
app.route('/server', matching);

export default app;
app.post('/server/auth/session-cookie', async (c) => {
  if (disabledAuth) { return c.json({ success: false, error: 'Endpoint disabled' }, 410); }
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

// Public CSRF endpoint for clients without a session
app.get('/server/auth/csrf', async (c) => {
  try {
    const csrf = crypto.getRandomValues(new Uint8Array(16)).reduce((s,b)=>s+('0'+b.toString(16)).slice(-2),'');
    const secure = true;
    const sameSite = 'Lax';
    const maxAge = 60 * 60;
    c.header('Set-Cookie', `csrf_token=${csrf}; HttpOnly; Secure; SameSite=${sameSite}; Path=/; Max-Age=${maxAge}`);
    return c.json({ success: true, csrf });
  } catch (e: any) {
    return c.json({ success: false, error: e?.message || 'Unknown error' }, 500);
  }
});

app.post('/server/auth/logout', async (c) => {
  if (disabledAuth) { return c.json({ success: false, error: 'Endpoint disabled' }, 410); }
  const secure = true;
  const sameSite = 'Lax';
  c.header('Set-Cookie', `sb_access_token=; HttpOnly; Secure; SameSite=${sameSite}; Path=/; Max-Age=0`);
  c.header('Set-Cookie', `csrf_token=; HttpOnly; Secure; SameSite=${sameSite}; Path=/; Max-Age=0`);
  await kv.set(`auth:state:${Date.now()}`, { event: 'logout', ts: new Date().toISOString() });
  try {
    const authz = c.req.header('Authorization') || '';
    const cookie = c.req.header('Cookie') || '';
    let token = '';
    if (authz.startsWith('Bearer ')) token = authz.slice(7);
    if (!token && cookie) {
      const m = /sb_access_token=([^;]+)/.exec(cookie);
      if (m) token = decodeURIComponent(m[1]);
    }
    if (token) {
      const { data, error } = await supabase.auth.getUser(token);
      const userId = error ? null : data?.user?.id || null;
      if (userId) {
        await supabase.from('sessions').update({ revoked_at: new Date().toISOString() }).eq('user_id', userId).is('revoked_at', null);
      }
    }
  } catch {}
  return c.json({ success: true });
});

async function requireAuth(c: any, next: any) {
  try {
    const rawPath = new URL(c.req.url).pathname;
    // Normalize to strip Supabase functions prefix if present
    const path = rawPath.startsWith('/functions/v1') ? rawPath.replace('/functions/v1', '') : rawPath;
    // Canonical core path without trailing slash
    const corePath = path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
    // Explicit public guard (robust against prefix & trailing slash)
    // Public validation endpoint bypass (both legacy and new path forms)
    if (corePath === '/server/validate-registration' || rawPath.endsWith('/server/validate-registration') || corePath === '/validate-registration' || rawPath.endsWith('/validate-registration')) { await next(); return; }
    const method = c.req.method.toUpperCase();
    if (method === 'OPTIONS') { await next(); return; }
    const publicPaths = [
      '/server/health',
      '/server/login',
      '/server/register',
      '/server/auth/session-cookie',
      '/server/auth/csrf',
      '/server/auth/logout',
      '/server/auth/email/verify/send',
      '/server/auth/email/verify/confirm',
      '/server/auth/password-reset/send',
      '/server/auth/password-reset/confirm',
      '/server/auth/verify-link',
      '/server/validate-registration',
      '/server/send-verification',
      '/server/resend-verification',
      // Diagnostics endpoints (some are public for monitoring)
      '/server/diagnostics/health',
      '/server/diagnostics/system/health',
      '/server/diagnostics/performance/summary',
      '/server/diagnostics/email/deliverability',
      '/server/diagnostics/alerts/active',
      '/server/diagnostics/email/health'
    ];
    // Also allow full prefixed form used in deployment
    const altPrefixed = publicPaths.map(p => '/functions/v1' + p);
    if (publicPaths.includes(path) || altPrefixed.includes(rawPath)) { await next(); return; }
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
    let userType = (data.user.user_metadata || {}).userType;
    if (!userType) {
      try {
        const { data: prof } = await supabase.from('profiles').select('user_type').eq('user_id', data.user.id).maybeSingle();
        userType = prof?.user_type || userType;
      } catch {}
    }
    const canary = (c.req.header('x-canary-new-auth') || '').toString().toLowerCase() === 'true';
    const newAuthEnabled = canary || (Deno.env.get('NEW_AUTH_ENABLED') === 'true');
    c.set('claims', { userType });
    c.set('newAuthEnabled', newAuthEnabled);
    if (path.startsWith('/server/professionals') && userType !== 'employer') {
      return c.json({ success: false, error: 'Forbidden' }, 403);
    }
    c.set('user', data.user);
    await next();
  } catch {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }
}
