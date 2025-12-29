import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

// Prefer environment variables, fallback to generated project info
const envUrl = (import.meta as any)?.env?.VITE_SUPABASE_URL as string | undefined;
const envAnonKey = (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabaseUrl = envUrl || `https://${projectId}.supabase.co`;
const supabaseAnonKey = envAnonKey || publicAnonKey;

// Singleton Supabase client
let supabaseClient: ReturnType<typeof createSupabaseClient> | null = null;

export function createClient() {
  if (!supabaseClient) {
    supabaseClient = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage,
        storageKey: 'sb-auth-token',
        flowType: 'pkce'
      },
      realtime: {
        // Prevent aggressive reconnection attempts
        params: {
          eventsPerSecond: 2 // Throttle events
        },
        timeout: 10000, // 10 seconds timeout
        heartbeatIntervalMs: 30000, // 30 second heartbeat
        reconnectAfterMs: (tries) => {
          // Exponential backoff with max 30 seconds
          const delay = Math.min(1000 * Math.pow(2, tries), 30000);
          console.log(`[Supabase] Reconnecting in ${delay/1000}s (attempt ${tries + 1})`);
          return delay;
        }
      },
      global: {
        headers: {
          'x-client-info': 'gidipin-web'
        }
      }
    });
  }
  return supabaseClient;
}

export const supabase = createClient();
