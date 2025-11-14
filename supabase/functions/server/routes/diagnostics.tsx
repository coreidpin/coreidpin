import { Hono } from "npm:hono";
import { getSupabaseClient } from "../lib/supabaseClient.tsx";
import * as kv from "../kv_store.tsx";
import { testResendHealth } from "../lib/email.ts";
import { 
  getPerformanceSummary, 
  getEmailDeliverabilitySummary, 
  getActiveAlerts, 
  acknowledgeAlert,
  trackApiPerformance,
  trackEmailEvent
} from "../lib/monitoring.ts";

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

// Performance monitoring endpoints
diagnostics.get('/performance/summary', async (c) => {
  try {
    const hours = Number(c.req.query('hours') || 24);
    const summary = await getPerformanceSummary(hours);
    return c.json({ status: 'success', summary });
  } catch (e: any) {
    return c.json({ status: 'failure', error: { message: e?.message || 'Unknown error' } }, 500);
  }
});

diagnostics.get('/email/deliverability', async (c) => {
  try {
    const days = Number(c.req.query('days') || 7);
    const summary = await getEmailDeliverabilitySummary(days);
    return c.json({ status: 'success', summary });
  } catch (e: any) {
    return c.json({ status: 'failure', error: { message: e?.message || 'Unknown error' } }, 500);
  }
});

diagnostics.get('/alerts/active', async (c) => {
  try {
    const alerts = await getActiveAlerts();
    return c.json({ status: 'success', alerts });
  } catch (e: any) {
    return c.json({ status: 'failure', error: { message: e?.message || 'Unknown error' } }, 500);
  }
});

diagnostics.post('/alerts/acknowledge', async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const alertKey = (body?.alertKey || '').toString();
    if (!alertKey) return c.json({ status: 'failure', error: { message: 'alertKey required' } }, 400);
    
    const success = await acknowledgeAlert(alertKey);
    return c.json({ status: success ? 'success' : 'failure', acknowledged: success });
  } catch (e: any) {
    return c.json({ status: 'failure', error: { message: e?.message || 'Unknown error' } }, 500);
  }
});

// Comprehensive system health check
diagnostics.get('/system/health', async (c) => {
  try {
    const supabase = getSupabaseClient();
    
    // Check database connectivity
    const dbStart = Date.now();
    const { error: dbError } = await supabase.from('auth_audit_log').select('id').limit(1);
    const dbResponseTime = Date.now() - dbStart;
    
    // Check email service health
    const emailHealth = await testResendHealth();
    
    // Get recent performance metrics
    const perfSummary = await getPerformanceSummary(1); // Last 1 hour
    
    // Get recent email metrics
    const emailSummary = await getEmailDeliverabilitySummary(1); // Last 1 day
    
    // Get active alerts
    const activeAlerts = await getActiveAlerts();
    
    // Calculate overall health score (0-100)
    let healthScore = 100;
    
    // Database health (30% weight)
    if (dbError) healthScore -= 30;
    else if (dbResponseTime > 1000) healthScore -= 15;
    else if (dbResponseTime > 500) healthScore -= 10;
    
    // Email health (25% weight)
    if (!emailHealth.healthy) healthScore -= 25;
    
    // Performance health (25% weight)
    if (perfSummary.criticalCount > 0) healthScore -= 25;
    else if (perfSummary.warningCount > 5) healthScore -= 15;
    else if (perfSummary.avgResponseTime > 1000) healthScore -= 10;
    
    // Email deliverability health (20% weight)
    const latestEmail = emailSummary[0];
    if (latestEmail && latestEmail.successRate < 0.95) healthScore -= 20;
    else if (latestEmail && latestEmail.successRate < 0.98) healthScore -= 10;
    
    // Critical alerts penalty
    const criticalAlerts = activeAlerts.filter((a: any) => a.severity === 'critical').length;
    if (criticalAlerts > 0) healthScore -= (criticalAlerts * 10);
    
    healthScore = Math.max(0, healthScore);
    
    const health = {
      score: healthScore,
      status: healthScore >= 90 ? 'healthy' : healthScore >= 70 ? 'degraded' : 'critical',
      components: {
        database: {
          healthy: !dbError,
          responseTime: dbResponseTime,
          status: dbError ? 'down' : dbResponseTime > 1000 ? 'slow' : 'healthy'
        },
        email: {
          healthy: emailHealth.healthy,
          status: emailHealth.healthy ? 'healthy' : 'unhealthy',
          lastCheck: emailHealth.ts
        },
        performance: {
          avgResponseTime: perfSummary.avgResponseTime,
          p95ResponseTime: perfSummary.p95ResponseTime,
          criticalRequests: perfSummary.criticalCount,
          warningRequests: perfSummary.warningRequests || 0,
          status: perfSummary.criticalCount > 0 ? 'critical' : 
                  perfSummary.avgResponseTime > 1000 ? 'slow' : 'healthy'
        },
        emailDeliverability: {
          latestMetrics: latestEmail || null,
          status: latestEmail?.successRate >= 0.98 ? 'excellent' :
                  latestEmail?.successRate >= 0.95 ? 'good' :
                  latestEmail?.successRate >= 0.90 ? 'fair' : 'poor'
        }
      },
      activeAlerts: {
        total: activeAlerts.length,
        critical: activeAlerts.filter((a: any) => a.severity === 'critical').length,
        warning: activeAlerts.filter((a: any) => a.severity === 'warning').length,
        info: activeAlerts.filter((a: any) => a.severity === 'info').length
      },
      timestamp: new Date().toISOString()
    };
    
    return c.json({ status: 'success', health });
  } catch (e: any) {
    return c.json({ status: 'failure', error: { message: e?.message || 'Unknown error' } }, 500);
  }
});
