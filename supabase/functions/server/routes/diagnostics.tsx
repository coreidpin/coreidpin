import { Hono } from "npm:hono";
import { getSupabaseClient } from "../lib/supabaseClient.tsx";
import * as kv from "../kv_store.tsx";
import { testResendHealth } from "../lib/email.ts";

const diagnostics = new Hono();

diagnostics.get("/health", (c) => {
  const url = Deno.env.get("SUPABASE_URL") || null;
  return c.json({ status: "success", ok: true, url, timestamp: new Date().toISOString() });
});

diagnostics.get("/users/:id", async (c) => {
  try {
    const supabase = getSupabaseClient();
    const id = c.req.param("id");
    const { data, error } = await supabase.auth.admin.getUserById(id);
    if (error) {
      return c.json({ status: "failure", error: { message: error.message } }, 500);
    }
    const user = (data as any)?.user ?? data;
    return c.json({ status: "success", data: user });
  } catch (e: any) {
    return c.json({ status: "failure", error: { message: e?.message || "Unknown error" } }, 500);
  }
});

diagnostics.get("/app-users/:id", async (c) => {
  try {
    const supabase = getSupabaseClient();
    const id = c.req.param("id");
    const { data, error } = await supabase.from("app_users").select("*").eq("user_id", id).limit(1);
    if (error) {
      return c.json({ status: "failure", error: { message: error.message } }, 500);
    }
    const row = Array.isArray(data) ? data[0] : data;
    return c.json({ status: "success", data: row || null });
  } catch (e: any) {
    return c.json({ status: "failure", error: { message: e?.message || "Unknown error" } }, 500);
  }
});

export { diagnostics };

// Feature flags endpoint
diagnostics.get('/flags', async (c) => {
  try {
    const env = Deno.env.get('ENV') || 'production';
    const cached = await kv.get(`flags:${env}`);
    const defaults = {
      pwa: true,
      monitoring: true,
      pin_analytics_buffer: true,
      emails: env === 'production',
      sms: false
    };
    const flags = cached || defaults;
    return c.json({ status: 'success', env, flags });
  } catch (e: any) {
    return c.json({ status: 'failure', error: { message: e?.message || 'Unknown error' } }, 500);
  }
});

// Accept client metrics
diagnostics.post('/metrics', async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const ts = Date.now();
    await kv.set(`metrics:web:${ts}`, { ...body, ts });
    return c.json({ status: 'success' });
  } catch (e: any) {
    return c.json({ status: 'failure', error: { message: e?.message || 'Unknown error' } }, 500);
  }
});

// Summarize metrics (last 100 entries)
diagnostics.get('/metrics/summary', async (c) => {
  try {
    const items = await kv.getByPrefix('metrics:web:');
    const recent = items.slice(-100);
    const byEndpoint: Record<string, { count: number; avgMs: number; p95Ms: number }> = {};
    for (const it of recent) {
      if (it?.type === 'api-latency') {
        const ep = it.endpoint || 'unknown';
        const ms = Number(it.ms || 0);
        const bucket = (byEndpoint[ep] ||= { count: 0, avgMs: 0, p95Ms: 0 });
        bucket.count++;
        bucket.avgMs += ms;
      }
    }
    // compute p95 approximations using sorted values
    const p95Helper: Record<string, number[]> = {};
    for (const it of recent) {
      if (it?.type === 'api-latency') {
        const ep = it.endpoint || 'unknown';
        const ms = Number(it.ms || 0);
        (p95Helper[ep] ||= []).push(ms);
      }
    }
    Object.keys(byEndpoint).forEach((ep) => {
      const arr = (p95Helper[ep] || []).sort((a, b) => a - b);
      const idx = Math.floor(arr.length * 0.95) - 1;
      byEndpoint[ep].p95Ms = arr[idx >= 0 ? idx : 0] || 0;
      byEndpoint[ep].avgMs = Number((byEndpoint[ep].avgMs / byEndpoint[ep].count).toFixed(2));
    });
    return c.json({ status: 'success', summary: { byEndpoint } });
  } catch (e: any) {
    return c.json({ status: 'failure', error: { message: e?.message || 'Unknown error' } }, 500);
  }
});

// KV usage overview
diagnostics.get('/kv/usage', async (c) => {
  try {
    const prefixes = ['pin:', 'audit:', 'profile:', 'match:', 'metrics:web:'];
    const usage: Record<string, number> = {};
    for (const p of prefixes) {
      const items = await kv.getByPrefix(p);
      usage[p] = items.length;
    }
    return c.json({ status: 'success', usage });
  } catch (e: any) {
    return c.json({ status: 'failure', error: { message: e?.message || 'Unknown error' } }, 500);
  }
});

diagnostics.get('/email/health', async (c) => {
  try {
    const h = await testResendHealth();
    if (!h.healthy) {
      try { await kv.set(`alerts:email:${Date.now()}`, { ...h, ts: new Date().toISOString() }) } catch {}
    }
    return c.json({ status: 'success', health: h });
  } catch (e: any) {
    return c.json({ status: 'failure', error: { message: e?.message || 'Unknown error' } }, 500);
  }
});

// DB partitions (approximate by months seen in pin_analytics)
diagnostics.get('/db/partitions', async (c) => {
  try {
    const supabase = getSupabaseClient();
    const since = new Date();
    since.setMonth(since.getMonth() - 12);
    const { data, error } = await supabase
      .from('pin_analytics')
      .select('created_at')
      .gte('created_at', since.toISOString())
      .limit(2000);
    if (error) {
      return c.json({ status: 'failure', error: { message: error.message } }, 500);
    }
    const months = new Map<string, number>();
    for (const row of (data || [])) {
      const d = new Date(row.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      months.set(key, (months.get(key) || 0) + 1);
    }
    const list = Array.from(months.entries()).map(([month, count]) => ({ month, count }));
    return c.json({ status: 'success', partitions: list });
  } catch (e: any) {
    return c.json({ status: 'failure', error: { message: e?.message || 'Unknown error' } }, 500);
  }
});
