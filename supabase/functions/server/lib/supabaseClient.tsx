import { createClient } from "npm:@supabase/supabase-js";

// Singleton Supabase clients for server-side usage (Edge Functions)
let supabaseServiceSingleton: ReturnType<typeof createClient> | null = null;
let supabasePublicSingleton: ReturnType<typeof createClient> | null = null;

// Service-role client for admin/database operations
export function getSupabaseClient() {
  if (!supabaseServiceSingleton) {
    const url = Deno.env.get('SUPABASE_URL') ?? 'https://evcqpapvcvmljgqiuzsq.supabase.co';
    const serviceKey =
      Deno.env.get('SUPABASE_SERVICE_KEY') ??
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ??
      Deno.env.get('SERVICE_KEY') ??
      Deno.env.get('SERVICE_ROLE_KEY') ??
      // Fallback to anon/publishable to avoid startup crash; admin ops will fail gracefully
      Deno.env.get('SUPABASE_KEY') ??
      Deno.env.get('SUPABASE_ANON_KEY') ??
      'anon-key-placeholder';

    supabaseServiceSingleton = createClient(url, serviceKey);
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
  const supabase = getSupabaseClient();
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  return { user, error, accessToken };
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