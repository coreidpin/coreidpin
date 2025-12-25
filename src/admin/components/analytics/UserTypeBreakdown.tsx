import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Users, Building, TrendingUp } from 'lucide-react';
import { analyticsService, UserTypeStats } from '../../services/analytics.service';

const COLORS = {
  professional: '#3b82f6',  // blue
  business: '#10b981',       // green
  employer: '#f59e0b',       // amber
  other: '#6b7280'           // gray
};

export function UserTypeBreakdown() {
  const [data, setData] = useState<UserTypeStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const breakdown = await analyticsService.getUserTypeBreakdown();
      setData(breakdown);
    } catch (error) {
      console.error('Failed to load user type breakdown:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalUsers = data.reduce((sum, item) => sum + item.count, 0);

  const chartData = data.map(item => ({
    name: item.type.charAt(0).toUpperCase() + item.type.slice(1),
    value: item.count,
    percentage: item.percentage
  }));

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Type Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-pulse text-gray-400">Loading chart...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Type Distribution</CardTitle>
        <p className="text-sm text-gray-500 mt-1">Breakdown by account type</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Compact Chart with Center Text */}
          <div className="relative">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={data.length > 1 ? 3 : 0}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {chartData.map((entry, index) => {
                    const colorKey = entry.name.toLowerCase() as keyof typeof COLORS;
                    return <Cell key={`cell-${index}`} fill={COLORS[colorKey] || COLORS.other} />;
                  })}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value: number, name: string, props: any) => [
                    `${value.toLocaleString()} users (${props.payload.percentage.toFixed(1)}%)`,
                    name
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Content */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{totalUsers}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Total Users</div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-3">
            {data.map((item, index) => {
              const colorKey = item.type.toLowerCase() as keyof typeof COLORS;
              const color = COLORS[colorKey] || COLORS.other;
              const Icon = item.type === 'business' ? Building : Users;
              
              return (
                <div 
                  key={index} 
                  className="relative overflow-hidden rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md group"
                >
                  {/* Color Bar */}
                  <div 
                    className="absolute left-0 top-0 bottom-0 w-1" 
                    style={{ backgroundColor: color }}
                  />
                  
                  <div className="flex items-center justify-between p-4 pl-5">
                    <div className="flex items-center gap-3 flex-1">
                      <div 
                        className="p-2 rounded-lg transition-transform group-hover:scale-110" 
                        style={{ backgroundColor: `${color}15` }}
                      >
                        <Icon className="h-5 w-5" style={{ color }} />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 capitalize">{item.type}s</p>
                        <p className="text-sm text-gray-500">{item.count.toLocaleString()} {item.count === 1 ? 'user' : 'users'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold" style={{ color }}>
                          {item.percentage.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Insights */}
          {data.length > 1 && (
            <div className="pt-3 border-t">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <span>
                  <strong className="text-gray-900">{data[0]?.type.charAt(0).toUpperCase() + data[0]?.type.slice(1)}s</strong> 
                  {' '}make up the majority at {data[0]?.percentage.toFixed(0)}%
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
