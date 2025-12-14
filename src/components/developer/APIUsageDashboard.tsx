import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { supabase } from '../../utils/supabase/client';
import { toast } from 'sonner';
import {
  Activity,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
  BarChart3,
  Zap
} from 'lucide-react';

interface UsageStats {
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  avg_response_time: number;
  requests_today: number;
  monthly_usage: number;
  monthly_quota: number;
}

interface RecentRequest {
  id: string;
  endpoint: string;
  method: string;
  status_code: number;
  response_time_ms: number;
  created_at: string;
}

export function APIUsageDashboard() {
  const [stats, setStats] = useState<UsageStats>({
    total_requests: 0,
    successful_requests: 0,
    failed_requests: 0,
    avg_response_time: 0,
    requests_today: 0,
    monthly_usage: 0,
    monthly_quota: 1000
  });
  const [recentRequests, setRecentRequests] = useState<RecentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsageData();
  }, []);

  const fetchUsageData = async () => {
    try {
      // Get userId from localStorage (custom OTP auth)
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.log('No userId found');
        setLoading(false);
        return;
      }

      // Fetch business profile for quota
      const { data: profile } = await supabase
        .from('business_profiles')
        .select('current_month_usage, monthly_api_quota')
        .eq('user_id', userId)
        .maybeSingle();

      // Fetch usage logs
      const { data: logs, error } = await supabase
        .from('api_usage_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100);

    // Handle missing table gracefully
    if (error) {
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.warn('API usage logs table does not exist yet. Usage tracking not enabled.');
        // Set default stats
        setStats({
          total_requests: 0,
          successful_requests: 0,
          failed_requests: 0,
          avg_response_time: 0,
          requests_today: 0,
          monthly_usage: profile?.current_month_usage || 0,
          monthly_quota: profile?.monthly_api_quota || 1000
        });
        setRecentRequests([]);
        setLoading(false);
        return;
      }
      throw error;
    }

      // Calculate stats
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const todayRequests = logs?.filter(log => 
        new Date(log.created_at) >= todayStart
      ).length || 0;

      const successfulRequests = logs?.filter(log => 
        log.status_code >= 200 && log.status_code < 300
      ).length || 0;

      const failedRequests = logs?.filter(log => 
        log.status_code >= 400
      ).length || 0;

      const avgResponseTime = logs && logs.length > 0
        ? logs.reduce((sum, log) => sum + (log.response_time_ms || 0), 0) / logs.length
        : 0;

      setStats({
        total_requests: logs?.length || 0,
        successful_requests: successfulRequests,
        failed_requests: failedRequests,
        avg_response_time: Math.round(avgResponseTime),
        requests_today: todayRequests,
        monthly_usage: profile?.current_month_usage || 0,
        monthly_quota: profile?.monthly_api_quota || 1000
      });

      setRecentRequests(logs?.slice(0, 10) || []);
    } catch (error: any) {
      console.error('Error fetching usage data:', error);
      toast.error('Failed to load usage data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) return 'text-green-400';
    if (statusCode >= 400 && statusCode < 500) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getStatusBadge = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) return 'default';
    if (statusCode >= 400 && statusCode < 500) return 'secondary';
    return 'destructive';
  };

  const quotaPercentage = (stats.monthly_usage / stats.monthly_quota) * 100;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">API Usage & Analytics</h2>
        <p className="text-sm text-gray-500 mt-1">
          Monitor your API requests and performance metrics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border-purple-100 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Requests</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.total_requests.toLocaleString()}
                </p>
              </div>
              <Activity className="w-10 h-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-green-100 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Success Rate</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.total_requests > 0 
                    ? Math.round((stats.successful_requests / stats.total_requests) * 100)
                    : 0}%
                </p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-blue-100 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg Response Time</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.avg_response_time}ms
                </p>
              </div>
              <Clock className="w-10 h-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-orange-100 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Today's Requests</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.requests_today.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Quota */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-600" />
            Monthly Quota Usage
          </CardTitle>
          <CardDescription>
            {stats.monthly_usage.toLocaleString()} / {stats.monthly_quota.toLocaleString()} requests this month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  quotaPercentage >= 90 ? 'bg-red-500' :
                  quotaPercentage >= 75 ? 'bg-yellow-500' :
                  'bg-purple-500'
                }`}
                style={{ width: `${Math.min(quotaPercentage, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">{quotaPercentage.toFixed(1)}% used</span>
              <span className="text-gray-400">
                {(stats.monthly_quota - stats.monthly_usage).toLocaleString()} remaining
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Requests */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            Recent API Requests
          </CardTitle>
          <CardDescription className="text-gray-500">Latest 10 requests to your API endpoints</CardDescription>
        </CardHeader>
        <CardContent>
          {recentRequests.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No API requests yet</p>
              <p className="text-sm mt-1">Start making requests to see them here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-mono text-xs text-gray-700">
                        {request.method}
                      </Badge>
                      <code className="text-sm text-gray-700">{request.endpoint}</code>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>{new Date(request.created_at).toLocaleString()}</span>
                      <span>{request.response_time_ms}ms</span>
                    </div>
                  </div>
                  <Badge variant={getStatusBadge(request.status_code)}>
                    {request.status_code}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
