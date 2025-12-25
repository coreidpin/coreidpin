import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Users, UserPlus, Activity } from 'lucide-react';
import { analyticsService, UserGrowthData, TimePeriod } from '../../services/analytics.service';

export function UserGrowthChart() {
  const [data, setData] = useState<UserGrowthData[]>([]);
  const [period, setPeriod] = useState<TimePeriod>('30d');
  const [isLoading, setIsLoading] = useState(true);
  const [growthRate, setGrowthRate] = useState<number>(0);

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const growthData = await analyticsService.getUserGrowth(period);
      setData(growthData);

      // Calculate growth rate (compare last day to first day)
      if (growthData.length >= 2) {
        const firstDay = growthData[0].count;
        const lastDay = growthData[growthData.length - 1].count;
        const rate = analyticsService.calculateGrowthRate(lastDay, firstDay);
        setGrowthRate(rate);
      }
    } catch (error) {
      console.error('Failed to load user growth data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const periodOptions: { value: TimePeriod; label: string }[] = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '1y', label: 'Last Year' }
  ];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (period === '7d' || period === '30d') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const totalNewUsers = data.reduce((sum, item) => sum + item.count, 0);
  const currentTotal = data.length > 0 ? data[data.length - 1].cumulative : 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center">
            <div className="animate-pulse text-gray-400">Loading chart...</div>
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
            <CardTitle className="text-2xl">User Growth</CardTitle>
            <p className="text-sm text-gray-500 mt-1">Track user acquisition and growth trends</p>
          </div>
          
          {/* Period Selector - Modern Pills with Animations */}
          <div className="inline-flex items-center p-1 bg-gray-100 rounded-lg shadow-sm">
            {periodOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setPeriod(option.value)}
                className={`
                  relative px-4 py-2 text-sm font-medium rounded-md 
                  transition-all duration-300 ease-out
                  ${
                    period === option.value
                      ? 'text-white shadow-lg scale-105'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 active:scale-95'
                  }
                `}
                style={{
                  background: period === option.value 
                    ? 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)'
                    : 'transparent'
                }}
              >
                {/* Active state glow effect */}
                {period === option.value && (
                  <span 
                    className="absolute inset-0 rounded-md bg-gradient-to-r from-blue-400 to-indigo-400 opacity-20 blur-sm"
                    style={{ zIndex: -1 }}
                  />
                )}
                
                {/* Button text */}
                <span className="relative z-10">{option.label}</span>
                
                {/* Click ripple effect */}
                <span className="absolute inset-0 rounded-md overflow-hidden">
                  <span 
                    className={`
                      absolute inset-0 bg-white opacity-0 
                      ${period === option.value ? 'animate-ping-once' : ''}
                    `}
                  />
                </span>
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Premium Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* New Users */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="absolute top-0 right-0 -mt-4 -mr-4">
              <UserPlus className="h-24 w-24 opacity-10" />
            </div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                  <UserPlus className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium opacity-90">New Users</p>
              </div>
              <p className="text-4xl font-bold mb-1">{totalNewUsers.toLocaleString()}</p>
              <p className="text-xs opacity-75">In selected period</p>
            </div>
          </div>

          {/* Total Users */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="absolute top-0 right-0 -mt-4 -mr-4">
              <Users className="h-24 w-24 opacity-10" />
            </div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                  <Users className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium opacity-90">Total Users</p>
              </div>
              <p className="text-4xl font-bold mb-1">{currentTotal.toLocaleString()}</p>
              <p className="text-xs opacity-75">Cumulative count</p>
            </div>
          </div>

          {/* Growth Rate */}
          <div 
            className="relative overflow-hidden rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow"
            style={{
              background: growthRate >= 0 
                ? 'linear-gradient(to bottom right, #10b981, #14b8a6)' 
                : 'linear-gradient(to bottom right, #ef4444, #f43f5e)'
            }}
          >
            <div className="absolute top-0 right-0 -mt-4 -mr-4">
              {growthRate >= 0 ? (
                <TrendingUp className="h-24 w-24 opacity-10" />
              ) : (
                <TrendingDown className="h-24 w-24 opacity-10" />
              )}
            </div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                  {growthRate >= 0 ? (
                    <TrendingUp className="h-5 w-5" />
                  ) : (
                    <TrendingDown className="h-5 w-5" />
                  )}
                </div>
                <p className="text-sm font-medium opacity-90">Growth Rate</p>
              </div>
              <p className="text-4xl font-bold mb-1">
                {growthRate >= 0 ? '+' : ''}{Math.abs(growthRate).toFixed(1)}%
              </p>
              <p className="text-xs opacity-75">{growthRate >= 0 ? 'Positive trend' : 'Needs attention'}</p>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="colorDaily" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
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
                dataKey="count" 
                stroke="#3b82f6" 
                strokeWidth={3}
                name="Daily Signups"
                dot={{ fill: '#3b82f6', r: 4, strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 2 }}
                fill="url(#colorDaily)"
              />
              <Line 
                type="monotone" 
                dataKey="cumulative" 
                stroke="#10b981" 
                strokeWidth={3}
                name="Total Users"
                dot={{ fill: '#10b981', r: 4, strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 2 }}
                fill="url(#colorTotal)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
