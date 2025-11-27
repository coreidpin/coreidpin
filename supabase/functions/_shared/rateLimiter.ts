import { createClient } from "npm:@supabase/supabase-js";

function getSupabaseClient() {
  const url = Deno.env.get('SUPABASE_URL') ?? '';
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  return createClient(url, serviceKey);
}

export async function checkRateLimit(
  userId: string,
  action: string,
  maxRequests: number = 10,
  windowMinutes: number = 1
): Promise<{ allowed: boolean; remaining: number }> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase.rpc('check_rate_limit', {
    p_user_id: userId,
    p_action: action,
    p_max_requests: maxRequests,
    p_window_minutes: windowMinutes
  });
  
  if (error) {
    console.error('Rate limit check failed:', error);
    return { allowed: true, remaining: maxRequests }; // Fail open
  }
  
  return { 
    allowed: data === true, 
    remaining: data ? maxRequests - 1 : 0 
  };
}
