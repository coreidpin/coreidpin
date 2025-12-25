import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Users, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { engagementService, ActiveUsersData, MetricType } from '../../services/engagement.service';

export function ActiveUsersChart() {
  const [data, setData] = useState<ActiveUsersData[]>([]);
  const [metricType, setMetricType] = useState<MetricType>('dau');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [metricType]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const activeUsersData = await engagementService.getActiveUsers(metricType);
      setData(activeUsersData);
    } catch (error) {
      console.error('Failed to load active users data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const metricOptions: { value: MetricType; label: string; description: string }[] = [
    { value: 'dau', label: 'Daily', description: 'Daily Active Users' },
    { value: 'wau', label: 'Weekly', description: 'Weekly Active Users' },
    { value: 'mau', label: 'Monthly', description: 'Monthly Active Users' }
  ];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (metricType === 'dau') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const avgActiveUsers = data.length > 0
    ? Math.round(data.reduce((sum, item) => sum + item.active_users, 0) / data.length)
    : 0;

  const peakActiveUsers = data.length > 0
    ? Math.max(...data.map(item => item.active_users))
    : 0;

  const trend = data.length >= 2
    ? data[data.length - 1].active_users - data[0].active_users
    : 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center">
            <div className="animate-pulse text-gray-400">Loading engagement data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-2xl">Active Users</CardTitle>
            <p className="text-sm text-gray-500 mt-1">Track user engagement over time</p>
          </div>

          {/* Metric Type Selector - Enhanced with Glow */}
          <div className="inline-flex items-center p-1 bg-gray-100 rounded-lg shadow-sm">
            {metricOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setMetricType(option.value)}
                className={`
                  relative px-4 py-2 text-sm font-medium rounded-md 
                  transition-all duration-300 ease-out
                  ${
                    metricType === option.value
                      ? 'text-white shadow-lg scale-105'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 active:scale-95'
                  }
                `}
                style={{
                  background: metricType === option.value
                    ? 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)'
                    : 'transparent'
                }}
              >
                {/* Active state glow effect */}
                {metricType === option.value && (
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
      </CardHeader>

      <CardContent>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Average Active Users */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="absolute top-0 right-0 -mt-4 -mr-4">
              <Users className="h-24 w-24 opacity-10" />
            </div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                  <Users className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium opacity-90">Average Active</p>
              </div>
              <p className="text-4xl font-bold mb-1">{avgActiveUsers.toLocaleString()}</p>
              <p className="text-xs opacity-75">In selected period</p>
            </div>
          </div>

          {/* Peak Active Users */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="absolute top-0 right-0 -mt-4 -mr-4">
              <TrendingUp className="h-24 w-24 opacity-10" />
            </div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                  <Activity className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium opacity-90">Peak Active</p>
              </div>
              <p className="text-4xl font-bold mb-1">{peakActiveUsers.toLocaleString()}</p>
              <p className="text-xs opacity-75">Highest recorded</p>
            </div>
          </div>

          {/* Trend */}
          <div
            className="relative overflow-hidden rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow"
            style={{
              background: trend >= 0
                ? 'linear-gradient(to bottom right, #10b981, #14b8a6)'
                : 'linear-gradient(to bottom right, #ef4444, #f43f5e)'
            }}
          >
            <div className="absolute top-0 right-0 -mt-4 -mr-4">
              {trend >= 0 ? (
                <TrendingUp className="h-24 w-24 opacity-10" />
              ) : (
                <TrendingDown className="h-24 w-24 opacity-10" />
              )}
            </div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                  {trend >= 0 ? (
                    <TrendingUp className="h-5 w-5" />
                  ) : (
                    <TrendingDown className="h-5 w-5" />
                  )}
                </div>
                <p className="text-sm font-medium opacity-90">Trend</p>
              </div>
              <p className="text-4xl font-bold mb-1">
                {trend >= 0 ? '+' : ''}{Math.abs(trend).toLocaleString()}
              </p>
              <p className="text-xs opacity-75">{trend >= 0 ? 'Growing' : 'Declining'}</p>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorActiveUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                  tickMargin={10}
                />
                <YAxis
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                  tickMargin={10}
                />
                <Tooltip
                  labelFormatter={formatDate}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                  }}
                  labelStyle={{
                    fontWeight: 600,
                    marginBottom: '8px',
                    color: '#111827'
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                />
                <Line
                  type="monotone"
                  dataKey="active_users"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  name="Active Users"
                  dot={{ fill: '#3b82f6', r: 4, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                  fill="url(#colorActiveUsers)"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex flex-col items-center justify-center text-gray-500">
              <div className="text-center">
                <Activity className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Engagement Data Available</h3>
                <p className="text-sm mb-4">Deploy database functions to start tracking user engagement</p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left max-w-md mx-auto">
                  <p className="text-sm font-semibold text-blue-900 mb-2">To see data:</p>
                  <ol className="text-sm text-blue-800 space-y-1">
                    <li>1. Deploy engagement functions to Supabase</li>
                    <li>2. Wait for users to become active</li>
                    <li>3. Return here to view charts</li>
                  </ol>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
