import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: Number(__ENV.VUS || 20),
  duration: __ENV.DURATION || '30s',
};

const BASE = `${__ENV.SUPABASE_URL.replace(/\/$/, '')}/functions/v1/server`;
const ANON = __ENV.ANON_KEY;

export default function () {
  const email = `load_${Date.now()}_${Math.floor(Math.random()*100000)}@example.com`;
  const password = 'StrongP@ssw0rd!';
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ANON}`,
    'apikey': ANON,
    'X-CSRF-Token': 't',
    'Cookie': 'csrf_token=t',
  };

  const reg = http.post(`${BASE}/register`, JSON.stringify({ email, password, name: 'Load User', userType: 'professional' }), { headers });
  check(reg, { 'register ok': (r) => r.status === 200 });

  const login = http.post(`${BASE}/login`, JSON.stringify({ email, password }), { headers });
  check(login, { 'login ok': (r) => r.status === 200 });
  sleep(1);
}
