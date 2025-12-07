import { createClient } from "npm:@supabase/supabase-js";

// Singleton Supabase client for server-side usage (Edge Functions)
let supabaseSingleton: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (!supabaseSingleton) {
    const url = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceKey =
      Deno.env.get('SUPABASE_SERVICE_KEY') ??
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ??
      '';

    supabaseSingleton = createClient(url, serviceKey);
  }
  return supabaseSingleton;
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
