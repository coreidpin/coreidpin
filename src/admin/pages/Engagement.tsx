import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Users, TrendingUp, Zap, ArrowLeft } from 'lucide-react';
import { ActiveUsersChart } from '../components/engagement/ActiveUsersChart';
import { RetentionCohortTable } from '../components/engagement/RetentionCohortTable';
import { FeatureUsageCard } from '../components/engagement/FeatureUsageCard';
import { engagementService, EngagementMetric } from '../services/engagement.service';

export function EngagementPage() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<EngagementMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setIsLoading(true);
      const data = await engagementService.getEngagementSummary();
      setMetrics(data);
    } catch (error) {
      console.error('Failed to load engagement metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMetricIcon = (metricName: string) => {
    if (metricName.includes('Daily')) return Users;
    if (metricName.includes('Weekly')) return Activity;
    if (metricName.includes('Total')) return Zap;
    return TrendingUp;
  };

  const getMetricColor = (changePercent: number) => {
    if (changePercent > 0) return 'text-green-600';
    if (changePercent < 0) return 'text-red-600';
    return 'text-gray-600';
  };

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
            <h1 className="text-3xl font-bold text-gray-900">User Engagement</h1>
            <p className="text-gray-600 mt-1">Monitor user activity, retention, and feature adoption</p>
          </div>
        </div>
        <button
          onClick={loadMetrics}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 active:scale-95 font-medium"
        >
          Refresh Data
        </button>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ))
        ) : (
          metrics.map((metric, index) => {
            const Icon = getMetricIcon(metric.metric_name);
            const colorClass = getMetricColor(metric.change_percent);
            
            return (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Icon className="h-5 w-5 text-blue-600" />
                  </div>
                  {metric.change_percent !== 0 && (
                    <div className={`flex items-center gap-1 text-sm font-medium ${colorClass}`}>
                      <TrendingUp className={`h-4 w-4 ${metric.change_percent < 0 ? 'rotate-180' : ''}`} />
                      <span>{Math.abs(metric.change_percent)}%</span>
                    </div>
                  )}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {metric.metric_value.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">{metric.metric_name}</div>
              </div>
            );
          })
        )}
      </div>

      {/* Active Users Chart */}
      <ActiveUsersChart />

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature Usage */}
        <FeatureUsageCard />

        {/* Retention Cohorts */}
        <RetentionCohortTable />
      </div>

      {/* Insights & Tips */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-500 rounded-lg">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Engagement Best Practices</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Improve DAU/MAU Ratio</h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Target 20%+ DAU/MAU ratio for healthy engagement</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Send timely notifications to inactive users</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Create daily value propositions</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Boost Retention</h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500 mt-1">•</span>
                    <span>Focus on Month 1 retention (most critical period)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500 mt-1">•</span>
                    <span>Identify and remove friction points in user journey</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500 mt-1">•</span>
                    <span>Celebrate user milestones and achievements</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
