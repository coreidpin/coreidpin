/* Simple post-deployment verification script */
import { getProjectInfo } from './lib/projectInfo.mjs';

const { supabaseUrl: SUPABASE_URL, projectRef } = getProjectInfo();
const FUNCTION_SLUG = process.env.FUNCTION_SLUG || 'server';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
if (!SUPABASE_URL) {
  console.error('SUPABASE_URL env is required');
  process.exit(1);
}

const BASE_URL = `${SUPABASE_URL}/functions/v1/${FUNCTION_SLUG}`;

async function check(path, { auth = false } = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = { 'Content-Type': 'application/json' };
  if (auth && SUPABASE_ANON_KEY) headers['Authorization'] = `Bearer ${SUPABASE_ANON_KEY}`;
  const res = await fetch(url, { headers });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

async function main() {
  const results = {};

  // Health (use anon key if available, since project may enable JWT verification)
  results.health = await check('/health', { auth: true });

  // Validation smoke (should return 400)
  const valHeaders = { 'Content-Type': 'application/json' };
  if (SUPABASE_ANON_KEY) valHeaders['Authorization'] = `Bearer ${SUPABASE_ANON_KEY}`;
  const valRes = await fetch(`${BASE_URL}/validate-registration`, {
    method: 'POST',
    headers: valHeaders,
    body: JSON.stringify({ entryPoint: 'signup', userType: 'professional', data: {} })
  });
  results.validate = { ok: valRes.ok, status: valRes.status };

  // Protected endpoint without token (should be 401)
  const profRes = await fetch(`${BASE_URL}/professionals`, { headers: { 'Content-Type': 'application/json' } });
  results.professionals = { ok: profRes.ok, status: profRes.status };

  const summary = {
    health_ok: results.health.ok && results.health.data?.status === 'ok',
    validation_endpoint_reachable: [200, 400].includes(results.validate.status),
    professionals_requires_auth: results.professionals.status === 401,
  };

  console.log('Post-deploy check summary:', summary);
  if (!summary.health_ok || !summary.validation_endpoint_reachable || !summary.professionals_requires_auth) {
    console.error('Post-deploy verification failed', results);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error('Post-deploy check error:', e);
  process.exit(1);
});