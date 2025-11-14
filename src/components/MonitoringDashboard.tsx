import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Clock, Mail, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { api } from '@/utils/api';

interface SystemHealth {
  score: number;
  status: 'healthy' | 'degraded' | 'critical';
  components: {
    database: {
      healthy: boolean;
      responseTime: number;
      status: string;
    };
    email: {
      healthy: boolean;
      status: string;
      lastCheck: string;
    };
    performance: {
      avgResponseTime: number;
      p95ResponseTime: number;
      criticalRequests: number;
      status: string;
    };
    emailDeliverability: {
      latestMetrics: any;
      status: string;
    };
  };
  activeAlerts: {
    total: number;
    critical: number;
    warning: number;
    info: number;
  };
  timestamp: string;
}

interface PerformanceSummary {
  totalRequests: number;
  avgResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  criticalCount: number;
  warningCount: number;
  okCount: number;
  byEndpoint: Record<string, {
    count: number;
    avgResponseTime: number;
    p95ResponseTime: number;
  }>;
}

interface EmailDeliverabilitySummary {
  date: string;
  provider: string;
  sent: number;
  delivered: number;
  bounced: number;
  complained: number;
  opened: number;
  clicked: number;
  successRate: number;
  bounceRate: number;
  complaintRate: number;
}

interface Alert {
  type: string;
  data: any;
  severity: 'info' | 'warning' | 'critical';
  acknowledged: boolean;
  createdAt: string;
}

export function MonitoringDashboard() {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [performanceSummary, setPerformanceSummary] = useState<PerformanceSummary | null>(null);
  const [emailDeliverability, setEmailDeliverability] = useState<EmailDeliverabilitySummary[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchData();
    if (autoRefresh) {
      const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all monitoring data in parallel
      const [healthRes, perfRes, emailRes, alertsRes] = await Promise.all([
        api.fetchWithRetry('/functions/v1/server/diagnostics/system/health'),
        api.fetchWithRetry('/functions/v1/server/diagnostics/performance/summary?hours=24'),
        api.fetchWithRetry('/functions/v1/server/diagnostics/email/deliverability?days=7'),
        api.fetchWithRetry('/functions/v1/server/diagnostics/alerts/active')
      ]);

      const healthData = await healthRes.json();
      const perfData = await perfRes.json();
      const emailData = await emailRes.json();
      const alertsData = await alertsRes.json();

      if (healthData.status === 'success') setSystemHealth(healthData.health);
      if (perfData.status === 'success') setPerformanceSummary(perfData.summary);
      if (emailData.status === 'success') setEmailDeliverability(emailData.summary);
      if (alertsData.status === 'success') setAlerts(alertsData.alerts);

    } catch (error) {
      console.error('Failed to fetch monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  const acknowledgeAlert = async (alertKey: string) => {
    try {
      const response = await api.fetchWithRetry('/functions/v1/server/diagnostics/alerts/acknowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertKey })
      });
      
      if (response.ok) {
        // Remove acknowledged alert from local state
        setAlerts(alerts.filter(alert => 
          `alert:${alert.type}:${new Date(alert.createdAt).getTime()}` !== alertKey
        ));
      }
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'excellent':
        return 'text-green-600 bg-green-100';
      case 'degraded':
      case 'fair':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
      case 'poor':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'warning': return 'secondary';
      default: return 'default';
    }
  };

  if (loading && !systemHealth) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading monitoring data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Monitoring</h1>
          <p className="text-gray-600">Real-time performance and deliverability metrics</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="auto-refresh"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="auto-refresh" className="text-sm text-gray-600">Auto-refresh</label>
          </div>
          <Button onClick={fetchData} variant="outline" size="sm">
            <Activity className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      {systemHealth && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              System Health
              <Badge className={`ml-2 ${getHealthColor(systemHealth.status)}`}>
                {systemHealth.status.toUpperCase()}
              </Badge>
            </CardTitle>
            <CardDescription>
              Overall health score: {systemHealth.score}/100 • Last updated: {new Date(systemHealth.timestamp).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Database Health */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Database</h3>
                  {systemHealth.components.database.healthy ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <p className="text-sm text-gray-600">Response: {systemHealth.components.database.responseTime}ms</p>
                <Badge className={`mt-1 ${getHealthColor(systemHealth.components.database.status)}`}>
                  {systemHealth.components.database.status}
                </Badge>
              </div>

              {/* Email Service Health */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Email Service</h3>
                  {systemHealth.components.email.healthy ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <p className="text-sm text-gray-600">Status: {systemHealth.components.email.status}</p>
                <p className="text-xs text-gray-500">Last check: {new Date(systemHealth.components.email.lastCheck).toLocaleTimeString()}</p>
              </div>

              {/* Performance Health */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">API Performance</h3>
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-sm text-gray-600">Avg: {Math.round(systemHealth.components.performance.avgResponseTime)}ms</p>
                <p className="text-sm text-gray-600">P95: {Math.round(systemHealth.components.performance.p95ResponseTime)}ms</p>
                <Badge className={`mt-1 ${getHealthColor(systemHealth.components.performance.status)}`}>
                  {systemHealth.components.performance.status}
                </Badge>
              </div>

              {/* Email Deliverability */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Email Deliverability</h3>
                  <Mail className="h-5 w-5 text-purple-600" />
                </div>
                {systemHealth.components.emailDeliverability.latestMetrics ? (
                  <>
                    <p className="text-sm text-gray-600">
                      Success: {(systemHealth.components.emailDeliverability.latestMetrics.successRate * 100).toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-600">
                      Bounce: {(systemHealth.components.emailDeliverability.latestMetrics.bounceRate * 100).toFixed(1)}%
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-gray-600">No data available</p>
                )}
                <Badge className={`mt-1 ${getHealthColor(systemHealth.components.emailDeliverability.status)}`}>
                  {systemHealth.components.emailDeliverability.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              Active Alerts ({alerts.length})
              <Badge variant="destructive" className="ml-2">
                {alerts.filter(a => a.severity === 'critical').length} Critical
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className={`h-5 w-5 ${
                      alert.severity === 'critical' ? 'text-red-600' :
                      alert.severity === 'warning' ? 'text-yellow-600' : 'text-blue-600'
                    }`} />
                    <div>
                      <p className="font-medium capitalize">{alert.type.replace(/_/g, ' ')}</p>
                      <p className="text-sm text-gray-600">
                        Created: {new Date(alert.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => acknowledgeAlert(`alert:${alert.type}:${new Date(alert.createdAt).getTime()}`)}
                    variant="outline"
                    size="sm"
                  >
                    Acknowledge
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Metrics */}
      {performanceSummary && (
        <Card>
          <CardHeader>
            <CardTitle>API Performance (24h)</CardTitle>
            <CardDescription>
              {performanceSummary.totalRequests} requests • Avg: {Math.round(performanceSummary.avgResponseTime)}ms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{performanceSummary.okCount}</div>
                <div className="text-sm text-gray-600">OK Requests</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{performanceSummary.warningCount}</div>
                <div className="text-sm text-gray-600">Slow Requests</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{performanceSummary.criticalCount}</div>
                <div className="text-sm text-gray-600">Critical Requests</div>
              </div>
            </div>

            {Object.keys(performanceSummary.byEndpoint).length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Performance by Endpoint</h4>
                <div className="space-y-2">
                  {Object.entries(performanceSummary.byEndpoint).map(([endpoint, metrics]) => (
                    <div key={endpoint} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm font-mono truncate mr-2">{endpoint}</span>
                      <div className="flex items-center space-x-4 text-sm">
                        <span>{metrics.count} req</span>
                        <span>avg: {Math.round(metrics.avgResponseTime)}ms</span>
                        <span>p95: {Math.round(metrics.p95ResponseTime)}ms</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Email Deliverability */}
      {emailDeliverability.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Email Deliverability (7 days)</CardTitle>
            <CardDescription>Email delivery success rates and metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {emailDeliverability.map((day, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{new Date(day.date).toLocaleDateString()}</h4>
                    <Badge className={getHealthColor(day.successRate >= 0.98 ? 'excellent' : day.successRate >= 0.95 ? 'fair' : 'poor')}>
                      {(day.successRate * 100).toFixed(1)}% Success
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Sent</div>
                      <div className="font-medium">{day.sent}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Delivered</div>
                      <div className="font-medium text-green-600">{day.delivered}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Bounced</div>
                      <div className="font-medium text-red-600">{day.bounced}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Opened</div>
                      <div className="font-medium text-blue-600">{day.opened}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Clicked</div>
                      <div className="font-medium text-purple-600">{day.clicked}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}