import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

// Prefer environment variables, fallback to generated project info
const envUrl = (import.meta as any)?.env?.VITE_SUPABASE_URL as string | undefined;
const envAnonKey = (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY as string | undefined;

const supabaseUrl = envUrl || `https://${projectId}.supabase.co`;
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
        storageKey: 'gidipin-auth',
        flowType: 'pkce'
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
