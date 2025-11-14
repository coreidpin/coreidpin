#!/usr/bin/env node
/*
Manual E2E verification flow test
Requires env vars:
- PROJECT_ID: Supabase project ref (e.g., abcdxyz)
- ANON_KEY: Supabase anon key
- SERVICE_ROLE_KEY: Supabase service role key (for DB lookup)
- TEST_EMAIL: Existing profile email to test
- TEST_NAME: Optional display name for email template

Run: node scripts/verification-e2e.mjs
*/
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { readFile } from 'fs/promises';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function deriveProjectInfo() {
  let projectId = process.env.PROJECT_ID;
  let anonKey = process.env.ANON_KEY || process.env.SUPABASE_ANON_KEY;
  let supabaseUrl = process.env.SUPABASE_URL;
  let serviceRole = process.env.SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if ((!projectId || !anonKey) && !supabaseUrl) {
    try {
      const p = await readFile('./src/utils/supabase/info.tsx', 'utf8');
      const idMatch = p.match(/export const projectId\s*=\s*"([^"]+)"/);
      const keyMatch = p.match(/export const publicAnonKey\s*=\s*"([^"]+)"/);
      if (idMatch) projectId = projectId || idMatch[1];
      if (keyMatch) anonKey = anonKey || keyMatch[1];
    } catch {
      // ignore
    }
  }

  if (!supabaseUrl && projectId) {
    supabaseUrl = `https://${projectId}.supabase.co`;
  }

  return { projectId, anonKey, supabaseUrl, serviceRole };
}

const { projectId: PROJECT_ID, anonKey: ANON_KEY, supabaseUrl: SUPABASE_URL, serviceRole: SERVICE_ROLE_KEY } = await deriveProjectInfo();
const TEST_EMAIL = process.env.TEST_EMAIL || 'akinrodoluseun12@gmail.com';
const TEST_NAME = process.env.TEST_NAME || 'E2E Tester';

if (!SUPABASE_URL || !ANON_KEY || !SERVICE_ROLE_KEY || !TEST_EMAIL) {
  console.error('Missing env. Need SUPABASE_URL/PROJECT_ID, ANON_KEY, SERVICE_ROLE_KEY, TEST_EMAIL');
  process.exit(1);
}

const sendUrl = `${SUPABASE_URL}/functions/v1/send-verification-email`;
const verifyUrl = `${SUPABASE_URL}/functions/v1/verify-email-code`;

const service = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function requestCode() {
  const res = await fetch(sendUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ANON_KEY}`, apikey: ANON_KEY },
    body: JSON.stringify({ email: TEST_EMAIL, name: TEST_NAME })
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

async function latestCodeForEmail(email) {
  const { data: profile, error: pErr } = await service
    .from('profiles')
    .select('user_id')
    .eq('email', email.toLowerCase())
    .maybeSingle();
  if (pErr) throw new Error('Profile lookup failed: ' + pErr.message);
  if (!profile?.user_id) throw new Error('No user_id for email');

  const { data: rows, error: vErr } = await service
    .from('email_verifications')
    .select('id, token, sent_at, expires_at, used_at')
    .eq('user_id', profile.user_id)
    .order('sent_at', { ascending: false })
    .limit(1);
  if (vErr) throw new Error('Verification lookup failed: ' + vErr.message);
  if (!rows?.length) throw new Error('No verification rows found');
  return rows[0];
}

async function verifyCode(email, code) {
  const res = await fetch(verifyUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ANON_KEY}`, apikey: ANON_KEY },
    body: JSON.stringify({ email, code })
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

async function makeExpired(codeRow) {
  // Create a fresh code that is already expired to test expiration pathway
  // Insert a new row with expires_at in the past
  const pastIso = new Date(Date.now() - 60_000).toISOString();
  const nowIso = new Date().toISOString();

  // We need the user_id for insert
  const { data: p, error: pErr } = await service
    .from('profiles')
    .select('user_id')
    .eq('email', TEST_EMAIL.toLowerCase())
    .maybeSingle();
  if (pErr || !p?.user_id) throw new Error('Profile lookup for expired insert failed');

  const expiredToken = '919191'; // arbitrary known code for test
  await service.from('email_verifications').insert({
    user_id: p.user_id,
    token: expiredToken,
    expires_at: pastIso,
    method: 'code',
    status: null,
    used_at: null,
    sent_at: nowIso,
  });
  return expiredToken;
}

(async () => {
  console.log('1) Requesting verification code...');
  let r1 = await requestCode();
  if (!r1.ok && r1.data?.error_code === 'ERR_RATE_LIMIT') {
    const wait = (r1.data?.remainingSeconds ?? 60) * 1000;
    console.log(`Rate limited; waiting ${wait}ms...`);
    await sleep(wait + 500);
    r1 = await requestCode();
  }
  if (!r1.ok) throw new Error('send-verification-email failed: ' + JSON.stringify(r1));
  console.log('✓ Code request succeeded');

  console.log('2) Fetching latest code from DB...');
  const latest = await latestCodeForEmail(TEST_EMAIL);
  console.log('Latest token:', latest.token, 'expires_at:', latest.expires_at);

  console.log('3) Verifying with correct code...');
  const v1 = await verifyCode(TEST_EMAIL, latest.token);
  if (!v1.ok || !v1.data?.success) throw new Error('verify-email-code failed: ' + JSON.stringify(v1));
  console.log('✓ Verification succeeded');

  console.log('4) Reusing same code (should fail as used)...');
  const v2 = await verifyCode(TEST_EMAIL, latest.token);
  if (v2.ok || v2.data?.success || v2.data?.error_code !== 'ERR_INVALID_CODE') {
    throw new Error('Expected ERR_INVALID_CODE on reuse, got: ' + JSON.stringify(v2));
  }
  console.log('✓ Reuse correctly rejected');

  console.log('5) Trying invalid code...');
  const invalid = await verifyCode(TEST_EMAIL, '000000');
  if (invalid.ok || invalid.data?.success || invalid.data?.error_code !== 'ERR_INVALID_CODE') {
    throw new Error('Expected ERR_INVALID_CODE for invalid code, got: ' + JSON.stringify(invalid));
  }
  console.log('✓ Invalid code correctly rejected');

  console.log('6) Testing expired code...');
  const expiredToken = await makeExpired(latest);
  const expired = await verifyCode(TEST_EMAIL, expiredToken);
  if (expired.ok || expired.data?.success || expired.data?.error_code !== 'ERR_INVALID_CODE') {
    throw new Error('Expected ERR_INVALID_CODE for expired code, got: ' + JSON.stringify(expired));
  }
  console.log('✓ Expired code correctly rejected');

  console.log('\nAll checks passed.');
})().catch((err) => {
  console.error('E2E test failed:', err?.message || err);
  process.exit(1);
});
