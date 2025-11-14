import * as kv from "../kv_store.tsx";

// Performance monitoring configuration
const PERF_THRESHOLDS = {
  WARNING_MS: 500,      // Warn if response > 500ms
  CRITICAL_MS: 1000,     // Critical if response > 1000ms
  TARGET_MS: 100,        // Target response time
};

// Email deliverability thresholds
const EMAIL_THRESHOLDS = {
  SUCCESS_RATE: 0.98,    // 98% success rate target
  BOUNCE_RATE: 0.02,     // Max 2% bounce rate
  COMPLAINT_RATE: 0.001,  // Max 0.1% complaint rate
};

// Track API performance
export async function trackApiPerformance(
  endpoint: string,
  method: string,
  statusCode: number,
  responseTimeMs: number,
  userId?: string
) {
  const timestamp = Date.now();
  const key = `perf:api:${timestamp}`;
  
  const data = {
    endpoint,
    method,
    statusCode,
    responseTimeMs,
    userId: userId || null,
    timestamp: new Date(timestamp).toISOString(),
    threshold: responseTimeMs > PERF_THRESHOLDS.CRITICAL_MS ? 'critical' : 
               responseTimeMs > PERF_THRESHOLDS.WARNING_MS ? 'warning' : 'ok'
  };
  
  try {
    await kv.set(key, data);
    
    // Alert on critical performance issues
    if (responseTimeMs > PERF_THRESHOLDS.CRITICAL_MS) {
      await createAlert('performance_critical', {
        endpoint,
        responseTimeMs,
        threshold: PERF_THRESHOLDS.CRITICAL_MS,
        timestamp: data.timestamp
      });
    }
  } catch (e) {
    console.error('Failed to track API performance:', e);
  }
}

// Track email deliverability
export async function trackEmailEvent(
  email: string,
  event: 'sent' | 'delivered' | 'bounced' | 'complained' | 'opened' | 'clicked',
  provider: string,
  messageId?: string,
  error?: string,
  userId?: string
) {
  const timestamp = Date.now();
  const key = `email:event:${timestamp}`;
  
  const data = {
    email,
    event,
    provider,
    messageId: messageId || null,
    error: error || null,
    userId: userId || null,
    timestamp: new Date(timestamp).toISOString()
  };
  
  try {
    await kv.set(key, data);
    
    // Track deliverability metrics
    await updateDeliverabilityMetrics(event, provider);
    
    // Alert on delivery failures
    if (event === 'bounced' || event === 'complained') {
      await createAlert('email_delivery_issue', {
        email,
        event,
        provider,
        error: error || 'Unknown error',
        timestamp: data.timestamp
      });
    }
  } catch (e) {
    console.error('Failed to track email event:', e);
  }
}

// Update deliverability metrics
async function updateDeliverabilityMetrics(event: string, provider: string) {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const key = `email:metrics:${today}:${provider}`;
  
  try {
    const current = await kv.get(key) || {
      sent: 0,
      delivered: 0,
      bounced: 0,
      complained: 0,
      opened: 0,
      clicked: 0,
      lastUpdated: new Date().toISOString()
    };
    
    current[event] = (current[event] || 0) + 1;
    current.lastUpdated = new Date().toISOString();
    
    await kv.set(key, current);
    
    // Check thresholds and alert if needed
    const total = current.sent;
    if (total > 10) { // Only check after reasonable volume
      const bounceRate = current.bounced / total;
      const complaintRate = current.complained / total;
      const successRate = current.delivered / total;
      
      if (bounceRate > EMAIL_THRESHOLDS.BOUNCE_RATE) {
        await createAlert('high_bounce_rate', {
          provider,
          bounceRate,
          threshold: EMAIL_THRESHOLDS.BOUNCE_RATE,
          date: today,
          totalEmails: total
        });
      }
      
      if (complaintRate > EMAIL_THRESHOLDS.COMPLAINT_RATE) {
        await createAlert('high_complaint_rate', {
          provider,
          complaintRate,
          threshold: EMAIL_THRESHOLDS.COMPLAINT_RATE,
          date: today,
          totalEmails: total
        });
      }
      
      if (successRate < EMAIL_THRESHOLDS.SUCCESS_RATE) {
        await createAlert('low_success_rate', {
          provider,
          successRate,
          threshold: EMAIL_THRESHOLDS.SUCCESS_RATE,
          date: today,
          totalEmails: total
        });
      }
    }
  } catch (e) {
    console.error('Failed to update deliverability metrics:', e);
  }
}

// Create alert
async function createAlert(type: string, data: any) {
  const timestamp = Date.now();
  const key = `alert:${type}:${timestamp}`;
  
  const alert = {
    type,
    data,
    severity: getAlertSeverity(type),
    acknowledged: false,
    createdAt: new Date(timestamp).toISOString(),
    acknowledgedAt: null
  };
  
  try {
    await kv.set(key, alert);
    
    // Keep only last 1000 alerts per type to prevent storage bloat
    await cleanupOldAlerts(type, 1000);
  } catch (e) {
    console.error('Failed to create alert:', e);
  }
}

// Get alert severity
function getAlertSeverity(type: string): 'info' | 'warning' | 'critical' {
  switch (type) {
    case 'performance_critical':
    case 'high_bounce_rate':
    case 'high_complaint_rate':
    case 'low_success_rate':
      return 'critical';
    case 'email_delivery_issue':
    case 'performance_warning':
      return 'warning';
    default:
      return 'info';
  }
}

// Cleanup old alerts
async function cleanupOldAlerts(type: string, keepCount: number) {
  try {
    const prefix = `alert:${type}:`;
    const allAlerts = await kv.getByPrefix(prefix);
    
    if (allAlerts.length > keepCount) {
      // Sort by timestamp (newest first)
      const sorted = allAlerts
        .map((alert: any, index: number) => ({ alert, key: `${prefix}${allAlerts.length - index}` }))
        .sort((a: any, b: any) => b.alert.createdAt.localeCompare(a.alert.createdAt));
      
      // Remove oldest alerts
      const toRemove = sorted.slice(keepCount);
      for (const item of toRemove) {
        try {
          await kv.delete(item.key);
        } catch {}
      }
    }
  } catch (e) {
    console.error('Failed to cleanup old alerts:', e);
  }
}

// Get performance summary
export async function getPerformanceSummary(hours: number = 24) {
  const since = Date.now() - (hours * 60 * 60 * 1000);
  const prefix = 'perf:api:';
  
  try {
    const allMetrics = await kv.getByPrefix(prefix);
    const recent = allMetrics.filter((m: any) => new Date(m.timestamp).getTime() >= since);
    
    const summary = {
      totalRequests: recent.length,
      avgResponseTime: 0,
      p95ResponseTime: 0,
      p99ResponseTime: 0,
      criticalCount: 0,
      warningCount: 0,
      okCount: 0,
      byEndpoint: {} as Record<string, any>
    };
    
    if (recent.length === 0) return summary;
    
    // Calculate averages and percentiles
    const responseTimes = recent.map((m: any) => m.responseTimeMs).sort((a: number, b: number) => a - b);
    summary.avgResponseTime = responseTimes.reduce((a: number, b: number) => a + b, 0) / responseTimes.length;
    summary.p95ResponseTime = responseTimes[Math.floor(responseTimes.length * 0.95)] || 0;
    summary.p99ResponseTime = responseTimes[Math.floor(responseTimes.length * 0.99)] || 0;
    
    // Count thresholds
    summary.criticalCount = recent.filter((m: any) => m.threshold === 'critical').length;
    summary.warningCount = recent.filter((m: any) => m.threshold === 'warning').length;
    summary.okCount = recent.filter((m: any) => m.threshold === 'ok').length;
    
    // Group by endpoint
    const byEndpoint: Record<string, number[]> = {};
    for (const metric of recent) {
      const ep = metric.endpoint;
      if (!byEndpoint[ep]) byEndpoint[ep] = [];
      byEndpoint[ep].push(metric.responseTimeMs);
    }
    
    for (const [endpoint, times] of Object.entries(byEndpoint)) {
      summary.byEndpoint[endpoint] = {
        count: times.length,
        avgResponseTime: times.reduce((a, b) => a + b, 0) / times.length,
        p95ResponseTime: times.sort((a, b) => a - b)[Math.floor(times.length * 0.95)] || 0
      };
    }
    
    return summary;
  } catch (e) {
    console.error('Failed to get performance summary:', e);
    return {
      totalRequests: 0,
      avgResponseTime: 0,
      p95ResponseTime: 0,
      p99ResponseTime: 0,
      criticalCount: 0,
      warningCount: 0,
      okCount: 0,
      byEndpoint: {}
    };
  }
}

// Get email deliverability summary
export async function getEmailDeliverabilitySummary(days: number = 7) {
  const summaries: any[] = [];
  
  try {
    // Get metrics for each day
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const providers = ['resend'];
      for (const provider of providers) {
        const key = `email:metrics:${dateStr}:${provider}`;
        const metrics = await kv.get(key);
        
        if (metrics) {
          summaries.push({
            date: dateStr,
            provider,
            ...metrics,
            successRate: metrics.sent > 0 ? metrics.delivered / metrics.sent : 0,
            bounceRate: metrics.sent > 0 ? metrics.bounced / metrics.sent : 0,
            complaintRate: metrics.sent > 0 ? metrics.complained / metrics.sent : 0
          });
        }
      }
    }
    
    return summaries;
  } catch (e) {
    console.error('Failed to get email deliverability summary:', e);
    return [];
  }
}

// Get active alerts
export async function getActiveAlerts() {
  try {
    const allAlerts = await kv.getByPrefix('alert:');
    const active = allAlerts.filter((alert: any) => !alert.acknowledged);
    
    return active.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (e) {
    console.error('Failed to get active alerts:', e);
    return [];
  }
}

// Acknowledge alert
export async function acknowledgeAlert(alertKey: string) {
  try {
    const alert = await kv.get(alertKey);
    if (alert && !alert.acknowledged) {
      alert.acknowledged = true;
      alert.acknowledgedAt = new Date().toISOString();
      await kv.set(alertKey, alert);
      return true;
    }
    return false;
  } catch (e) {
    console.error('Failed to acknowledge alert:', e);
    return false;
  }
}