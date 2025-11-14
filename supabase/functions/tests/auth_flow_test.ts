import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

const PROJECT_URL = (Deno.env.get("SUPABASE_URL") || "https://evcqpapvcvmljgqiuzsq.supabase.co").replace(/\/$/, "");
const BASE = PROJECT_URL + "/functions/v1/server";
const ANON = Deno.env.get("ANON_KEY") || Deno.env.get("SUPABASE_ANON_KEY") || "";
const headers = {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${ANON}`,
  "apikey": ANON,
  "X-CSRF-Token": "t",
  "Cookie": "csrf_token=t",
};

function email() {
  return `test_${Date.now()}_${Math.floor(Math.random()*100000)}@example.com`;
}

Deno.test("register → verify → login → refresh → logout", async () => {
  const e = email();
  const password = "StrongP@ssw0rd!";
  const name = "Test User";
  const userType = "professional";

  const r1 = await fetch(`${BASE}/register`, { method: "POST", headers, body: JSON.stringify({ email: e, password, name, userType }) });
  assert(r1.ok);
  const j1 = await r1.json();
  assert(j1.success);

  const r2 = await fetch(`${BASE}/auth/dev/sign-token`, { method: "POST", headers, body: JSON.stringify({ email: e, minutes: 30 }) });
  assert(r2.ok);
  const j2 = await r2.json();
  assert(j2.success);
  const token = j2.token as string;
  assert(token && token.length > 20);

  const r3 = await fetch(`${BASE}/auth/email/verify/confirm`, { method: "POST", headers, body: JSON.stringify({ token }) });
  assert(r3.ok);
  const j3 = await r3.json();
  assert(j3.success);

  const r4 = await fetch(`${BASE}/login`, { method: "POST", headers, body: JSON.stringify({ email: e, password }) });
  assert(r4.ok);
  const j4 = await r4.json();
  assert(j4.success);
  assert(j4.accessToken && j4.refreshToken);

  const r5 = await fetch(`${BASE}/auth/refresh`, { method: "POST", headers, body: JSON.stringify({ refreshToken: j4.refreshToken }) });
  assert(r5.ok);
  const j5 = await r5.json();
  assert(j5.success);
  assert(j5.accessToken && j5.refreshToken);

  const logoutHeaders = { ...headers, Authorization: `Bearer ${j5.accessToken}` };
  const r6 = await fetch(`${BASE}/auth/logout`, { method: "POST", headers: logoutHeaders });
  assert(r6.ok);
  const j6 = await r6.json();
  assertEquals(j6.success, true);
});

Deno.test("email verify via GET confirm", async () => {
  const e = email();
  const password = "StrongP@ssw0rd!";
  const name = "Test User";

  const r1 = await fetch(`${BASE}/register`, { method: "POST", headers, body: JSON.stringify({ email: e, password, name, userType: "professional" }) });
  assert(r1.ok);

  const r2 = await fetch(`${BASE}/auth/dev/generate-email-token`, { method: "POST", headers, body: JSON.stringify({ email: e }) });
  assert(r2.ok);
  const j2 = await r2.json();
  const token = j2.token as string;
  assert(token && token.length > 20);

  const r3 = await fetch(`${BASE}/auth/email/verify/confirm?token=${encodeURIComponent(token)}`, { method: "GET" });
  assert(r3.ok);
});

Deno.test("password reset confirm", async () => {
  const e = email();
  const password = "StrongP@ssw0rd!";
  const name = "Reset User";

  const r1 = await fetch(`${BASE}/register`, { method: "POST", headers, body: JSON.stringify({ email: e, password, name, userType: "professional" }) });
  assert(r1.ok);

  const r2 = await fetch(`${BASE}/auth/dev/generate-reset-token`, { method: "POST", headers, body: JSON.stringify({ email: e }) });
  assert(r2.ok);
  const j2 = await r2.json();
  const token = j2.token as string;
  assert(token && token.length > 20);

  const newPassword = "NewStrongP@ssw0rd!";
  const r3 = await fetch(`${BASE}/auth/password-reset/confirm`, { method: "POST", headers, body: JSON.stringify({ email: e, newPassword, token }) });
  assert(r3.ok);
});
