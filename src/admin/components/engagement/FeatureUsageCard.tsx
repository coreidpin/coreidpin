import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Activity, Users, Clock } from 'lucide-react';
import { engagementService, FeatureUsage } from '../../services/engagement.service';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function FeatureUsageCard() {
  const [data, setData] = useState<FeatureUsage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const usageData = await engagementService.getFeatureUsage();
      setData(usageData);
    } catch (error) {
      console.error('Failed to load feature usage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Feature Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center">
            <div className="animate-pulse text-gray-400">Loading feature usage...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalUsage = data.reduce((sum, item) => sum + item.usage_count, 0);
  const totalUniqueUsers = new Set(data.flatMap(() => [])).size; // Simplified since we get aggregated data

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl">Feature Usage</CardTitle>
            <p className="text-sm text-gray-500 mt-1">Track feature adoption and engagement</p>
          </div>
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-lg shadow-md">
            <div className="text-xs font-medium uppercase tracking-wide opacity-90">Total Actions</div>
            <div className="text-2xl font-bold mt-1">{totalUsage.toLocaleString()}</div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Chart */}
        <div className="mb-8">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="feature_name"
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
              <Bar dataKey="usage_count" radius={[8, 8, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Feature Details */}
        <div className="space-y-3">
          {data.map((feature, index) => {
            const color = COLORS[index % COLORS.length];
            
            return (
              <div
                key={index}
                className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {/* Color Bar */}
                    <div
                      className="w-1 h-16 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    
                    {/* Feature Info */}
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{feature.feature_name}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <Activity className="h-4 w-4" />
                          <span>{feature.usage_count.toLocaleString()} actions</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="h-4 w-4" />
                          <span>{feature.unique_users.toLocaleString()} users</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4" />
                          <span>Last used {formatTimestamp(feature.last_used)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Usage Count Badge */}
                    <div className="text-right">
                      <div
                        className="text-3xl font-bold mb-1"
                        style={{ color }}
                      >
                        {feature.usage_count.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {((feature.usage_count / totalUsage) * 100).toFixed(1)}% of total
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {data.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No feature usage data available</p>
            <p className="text-sm mt-1">Data will appear as users interact with features</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
