import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Activity, AlertTriangle, CheckCircle, Clock, Database, Server, TrendingUp, Zap, AlertCircle, ArrowLeft } from 'lucide-react';
import { monitoringService, TimePeriod } from '../services/monitoring.service';

export function PerformanceMonitoring() {
  const navigate = useNavigate();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('1h');
  const [summary, setSummary] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [endpoints, setEndpoints] = useState<any[]>([]);
  const [slowEndpoints, setSlowEndpoints] = useState<any[]>([]);
  const [dbPerformance, setDbPerformance] = useState<any>(null);
  const [errorDist, setErrorDist] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
    // Refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [timePeriod]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [summaryData, trendsData, endpointsData, slowData, dbData, errorsData] = await Promise.all([
        monitoringService.getPerformanceSummary(timePeriod),
        monitoringService.getResponseTimeTrends(timePeriod),
        monitoringService.getEndpointPerformance(10),
        monitoringService.getSlowEndpoints(1000),
        monitoringService.getDatabasePerformance(),
        monitoringService.getErrorDistribution()
      ]);

      setSummary(summaryData);
      setTrends(trendsData);
      setEndpoints(endpointsData);
      setSlowEndpoints(slowData);
      setDbPerformance(dbData);
      setErrorDist(errorsData);
    } catch (error) {
      console.error('Failed to load monitoring data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const healthScore = summary ? monitoringService.calculateHealthScore(summary) : 0;
  const healthStatus = monitoringService.getHealthStatus(healthScore);
  const recommendations = monitoringService.getRecommendations(summary, slowEndpoints);

  const periodOptions: { value: TimePeriod; label: string }[] = [
    { value: '1h', label: 'Last Hour' },
    { value: '6h', label: 'Last 6 Hours' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' }
  ];

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'from-green-500 to-emerald-600';
      case 'good': return 'from-blue-500 to-cyan-600';
      case 'fair': return 'from-yellow-500 to-orange-500';
      case 'poor': return 'from-orange-500 to-red-500';
      case 'critical': return 'from-red-600 to-rose-700';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'excellent':
      case 'good':
        return <CheckCircle className="h-6 w-6" />;
      case 'fair':
        return <Activity className="h-6 w-6" />;
      case 'poor':
      case 'critical':
        return <AlertTriangle className="h-6 w-6" />;
      default:
        return <AlertCircle className="h-6 w-6" />;
    }
  };

  const ERROR_COLORS = ['#ef4444', '#f97316', '#f59e0b', '#eab308'];

  if (isLoading && !summary) {
    return (
      <div className="p-6">
        <div className="h-96 flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Loading performance data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/dashboard')} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Performance Monitoring</h1>
            <p className="text-gray-600 mt-1">Real-time API and database performance metrics</p>
          </div>
        </div>
        
        {/* Period Selector */}
        <div className="inline-flex items-center p-1 bg-gray-100 rounded-lg shadow-sm">
          {periodOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setTimePeriod(option.value)}
              className={`
                relative px-4 py-2 text-sm font-medium rounded-md 
                transition-all duration-300 ease-out
                ${
                  timePeriod === option.value
                    ? 'text-white shadow-lg scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 active:scale-95'
                }
              `}
              style={{
                background: timePeriod === option.value
                  ? 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)'
                  : 'transparent'
              }}
            >
              {timePeriod === option.value && (
                <span 
                  className="absolute inset-0 rounded-md bg-gradient-to-r from-blue-400 to-indigo-400 opacity-20 blur-sm"
                  style={{ zIndex: -1 }}
                />
              )}
              <span className="relative z-10">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Health Score Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${getHealthColor(healthStatus)} text-white`}>
                  {getHealthIcon(healthStatus)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
                  <p className="text-sm text-gray-600 capitalize">{healthStatus} Performance</p>
                </div>
              </div>
              
              {/* Health Score Progress */}
              <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${getHealthColor(healthStatus)} transition-all duration-500`}
                  style={{ width: `${healthScore}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">Health Score: {healthScore}/100</p>
            </div>
            
            <div className="text-right ml-8">
              <div className="text-4xl font-bold text-gray-900">{healthScore}</div>
              <div className="text-sm text-gray-500">/ 100</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Requests */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="absolute top-0 right-0 -mt-4 -mr-4">
            <Server className="h-24 w-24 opacity-10" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Server className="h-5 w-5" />
              <p className="text-sm font-medium opacity-90">Total Requests</p>
            </div>
            <p className="text-4xl font-bold mb-1">{summary?.total_requests?.toLocaleString() || 0}</p>
            <p className="text-xs opacity-75">In selected period</p>
          </div>
        </div>

        {/* Avg Response Time */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="absolute top-0 right-0 -mt-4 -mr-4">
            <Clock className="h-24 w-24 opacity-10" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5" />
              <p className="text-sm font-medium opacity-90">Avg Response</p>
            </div>
            <p className="text-4xl font-bold mb-1">{summary?.avg_response_time?.toFixed(0) || 0}</p>
            <p className="text-xs opacity-75">milliseconds</p>
          </div>
        </div>

        {/* Error Rate */}
        <div 
          className="relative overflow-hidden rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow"
          style={{
            background: (summary?.error_rate || 0) > 5
              ? 'linear-gradient(to bottom right, #ef4444, #f43f5e)'
              : 'linear-gradient(to bottom right, #10b981, #14b8a6)'
          }}
        >
          <div className="absolute top-0 right-0 -mt-4 -mr-4">
            <AlertTriangle className="h-24 w-24 opacity-10" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5" />
              <p className="text-sm font-medium opacity-90">Error Rate</p>
            </div>
            <p className="text-4xl font-bold mb-1">{summary?.error_rate?.toFixed(2) || 0}%</p>
            <p className="text-xs opacity-75">{(summary?.error_rate || 0) > 5 ? 'Needs attention' : 'Healthy'}</p>
          </div>
        </div>

        {/* Requests/Min */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="absolute top-0 right-0 -mt-4 -mr-4">
            <Zap className="h-24 w-24 opacity-10" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-5 w-5" />
              <p className="text-sm font-medium opacity-90">Req/Min</p>
            </div>
            <p className="text-4xl font-bold mb-1">{summary?.requests_per_minute?.toFixed(1) || 0}</p>
            <p className="text-xs opacity-75">Average rate</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Response Time Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Response Time Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trends}>
                <defs>
                  <linearGradient id="colorResponseTime" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="time_bucket" 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                  label={{ value: 'ms', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="avg_response_time"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  name="Avg Response Time"
                  dot={{ fill: '#3b82f6', r: 4 }}
                  fill="url(#colorResponseTime)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Error Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Error Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {errorDist.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={errorDist}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.status_code} (${entry.percentage}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="error_count"
                  >
                    {errorDist.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={ERROR_COLORS[index % ERROR_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-280 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                  <p>No errors in selected period</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Endpoint Performance & Database Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Endpoints */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top Endpoints by Traffic</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-3 text-sm font-semibold text-gray-700">Endpoint</th>
                    <th className="text-right p-3 text-sm font-semibold text-gray-700">Requests</th>
                    <th className="text-right p-3 text-sm font-semibold text-gray-700">Avg Time</th>
                    <th className="text-right p-3 text-sm font-semibold text-gray-700">Errors</th>
                    <th className="text-right p-3 text-sm font-semibold text-gray-700">Error %</th>
                  </tr>
                </thead>
                <tbody>
                  {endpoints.length > 0 ? endpoints.map((ep, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-3 text-sm font-mono text-gray-800">{ep.endpoint}</td>
                      <td className="p-3 text-sm text-right font-semibold">{ep.request_count.toLocaleString()}</td>
                      <td className="p-3 text-sm text-right">
                        <span className={`${ep.avg_response_time > 1000 ? 'text-red-600' : ep.avg_response_time > 500 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {ep.avg_response_time.toFixed(0)}ms
                        </span>
                      </td>
                      <td className="p-3 text-sm text-right">{ep.error_count}</td>
                      <td className="p-3 text-sm text-right">
                        <span className={`${ep.error_rate > 5 ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                          {ep.error_rate.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-gray-500">
                        No endpoint data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Database Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Database Size</p>
              <p className="text-2xl font-bold text-gray-900">{dbPerformance?.database_size || 'N/A'}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Connections</p>
                <p className="text-xl font-semibold text-gray-900">{dbPerformance?.total_connections || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Active</p>
                <p className="text-xl font-semibold text-green-600">{dbPerformance?.active_connections || 0}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Idle Connections</p>
              <p className="text-lg font-semibold text-gray-700">{dbPerformance?.idle_connections || 0}</p>
            </div>

            {dbPerformance?.slowest_queries && dbPerformance.slowest_queries.length > 0 && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm font-semibold text-gray-900 mb-2">Active Queries</p>
                <div className="space-y-2">
                  {dbPerformance.slowest_queries.slice(0, 3).map((query: any, index: number) => (
                    <div key={index} className="text-xs p-2 bg-gray-50 rounded border border-gray-200">
                      <p className="font-mono text-gray-700 truncate">{query.query}</p>
                      <p className="text-gray-500 mt-1">{query.duration?.toFixed(2)}s • {query.state}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Slow Endpoints Alert */}
      {slowEndpoints.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-900">
              <AlertTriangle className="h-5 w-5" />
              Slow Endpoints Detected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {slowEndpoints.map((ep, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200">
                  <div className="flex-1">
                    <p className="font-mono text-sm font-semibold text-gray-900">{ep.endpoint}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {ep.method} • {ep.slow_request_count} slow requests
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-2xl font-bold text-orange-600">{ep.avg_response_time.toFixed(0)}</p>
                    <p className="text-xs text-gray-600">ms avg</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <Card className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <TrendingUp className="h-5 w-5" />
            Performance Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-200">
                <div className="p-2 bg-blue-500 rounded-lg text-white mt-0.5">
                  <Zap className="h-4 w-4" />
                </div>
                <p className="text-sm text-gray-700 flex-1">{rec}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Last Updated */}
      <div className="text-center text-sm text-gray-500">
        Auto-refreshing every 30 seconds • Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
}
