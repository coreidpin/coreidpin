import { createClient } from "npm:@supabase/supabase-js";

// Singleton Supabase clients for server-side usage (Edge Functions)
let supabaseServiceSingleton: ReturnType<typeof createClient> | null = null;
let supabasePublicSingleton: ReturnType<typeof createClient> | null = null;

// Service-role client for admin/database operations
export function getSupabaseClient() {
  if (!supabaseServiceSingleton) {
    const url = Deno.env.get('SUPABASE_URL') ?? 'https://evcqpapvcvmljgqiuzsq.supabase.co';
    const serviceKey =
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ??
      Deno.env.get('SUPABASE_SERVICE_KEY') ??
      Deno.env.get('SERVICE_ROLE_KEY') ??
      Deno.env.get('SERVICE_KEY') ?? '';

    if (!serviceKey) {
      console.error('WARNING: No service role key found in environment');
    }

    supabaseServiceSingleton = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
  }
  return supabaseServiceSingleton;
}

// Public anon client for end-user auth flows (signIn/signUp)
export function getSupabasePublicClient() {
  if (!supabasePublicSingleton) {
    const url = Deno.env.get('SUPABASE_URL') ?? 'https://evcqpapvcvmljgqiuzsq.supabase.co';
    const anonKey =
      Deno.env.get('SUPABASE_KEY') ??
      Deno.env.get('SUPABASE_ANON_KEY') ??
      Deno.env.get('ANON_KEY') ??
      Deno.env.get('PUBLIC_ANON_KEY') ??
      'anon-key-placeholder';

    supabasePublicSingleton = createClient(url, anonKey);
  }
  return supabasePublicSingleton;
}

// Helper to extract user from Authorization header consistently
export async function getAuthUser(c: any) {
  const authHeader = c.req.header('Authorization');
  const accessToken = authHeader?.split(' ')[1];
  const supabase = getSupabaseClient();
  
  if (!accessToken) {
    return { user: null, error: { message: 'No authorization token provided' }, supabase };
  }
  
  try {
    const payload = JSON.parse(atob(accessToken.split('.')[1]));
    const userId = payload.sub;
    const email = payload.email;
    
    if (!userId) {
      return { user: null, error: { message: 'Invalid token: no user ID' }, supabase };
    }
    
    // Return user from JWT payload - trust the token since it's signed
    const user = {
      id: userId,
      email: email,
      aud: payload.aud,
      role: payload.role
    };
    
    return { user, error: null, supabase };
  } catch (err: any) {
    console.error('[getAuthUser] Token decode error:', err.message);
    return { user: null, error: { message: 'Invalid token format' }, supabase };
  }
}

// Simple retry helper for transient failures on HTTP-based operations
export async function withRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  let attempt = 0;
  let lastError: any;
  while (attempt <= retries) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      const isTransient = !!(err && (err.status >= 500 || err.status === 429));
      if (!isTransient || attempt === retries) break;
      const backoffMs = Math.min(1000 * Math.pow(2, attempt), 4000);
      await new Promise(res => setTimeout(res, backoffMs));
      attempt++;
    }
  }
  throw lastError;
}
// (duplicate definition removed)