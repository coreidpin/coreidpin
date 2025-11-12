export type ServerEnvCheckResult = {
  ok: boolean;
  errors: string[];
  warnings: string[];
};

export function validateServerEnv(): ServerEnvCheckResult {
  const url = Deno.env.get('SUPABASE_URL') || '';
  const anonKey =
    Deno.env.get('SUPABASE_KEY') ||
    Deno.env.get('SUPABASE_ANON_KEY') ||
    Deno.env.get('ANON_KEY') ||
    Deno.env.get('PUBLIC_ANON_KEY') ||
    '';
  const serviceKey =
    Deno.env.get('SUPABASE_SERVICE_KEY') ||
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ||
    Deno.env.get('SERVICE_KEY') ||
    Deno.env.get('SERVICE_ROLE_KEY') ||
    '';
  const jwtSecret = Deno.env.get('SUPABASE_JWT_SECRET');

  const errors: string[] = [];
  const warnings: string[] = [];

  // Basic format checks
  if (!url || !/^https:\/\/[\-a-z0-9]+\.supabase\.co\/?$/i.test(url.trim())) {
    errors.push('SUPABASE_URL missing or invalid (expected https://<ref>.supabase.co)');
  }
  if (!anonKey || /\s/.test(anonKey)) {
    errors.push('SUPABASE_KEY (or SUPABASE_ANON_KEY) missing or contains whitespace');
  }
  if (!serviceKey || /\s/.test(serviceKey)) {
    errors.push('SUPABASE_SERVICE_KEY (or SUPABASE_SERVICE_ROLE_KEY) missing or contains whitespace');
  }

  if (jwtSecret !== undefined && (!jwtSecret || /\s/.test(jwtSecret))) {
    warnings.push('SUPABASE_JWT_SECRET present but empty or contains whitespace');
  }

  // Optional notice when custom JWT not configured
  if (jwtSecret === undefined) {
    warnings.push('Note: SUPABASE_JWT_SECRET not set. Set only if using custom JWT.');
  }

  const result: ServerEnvCheckResult = { ok: errors.length === 0, errors, warnings };
  if (!result.ok) {
    console.warn('[server] Edge Function env incomplete; preflight/health will still work.');
    for (const e of errors) console.warn(' -', e);
  }
  for (const w of warnings) console.info('[server] ', w);
  return result;
}