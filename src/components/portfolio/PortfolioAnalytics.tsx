/**
 * Portfolio Analytics Dashboard
 * Track views, engagement, and performance metrics
 */

import React from 'react';
import { Eye, TrendingUp, Heart, Share2, Download, ExternalLink } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PortfolioStats {
  totalViews: number;
  totalProjects: number;
  featuredProjects: number;
  totalEngagement: number;
  topProject: {
    title: string;
    views: number;
  };
  recentViews: {
    date: string;
    count: number;
  }[];
}

interface PortfolioAnalyticsProps {
  stats: PortfolioStats;
  className?: string;
}

export const PortfolioAnalytics: React.FC<PortfolioAnalyticsProps> = ({
  stats,
  className,
}) => {
  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const statCards = [
    {
      label: 'Total Views',
      value: formatNumber(stats.totalViews),
      icon: Eye,
      color: 'blue',
      trend: '+12%',
    },
    {
      label: 'Projects',
      value: stats.totalProjects,
      icon: TrendingUp,
      color: 'green',
      trend: '+3',
    },
    {
      label: 'Featured',
      value: stats.featuredProjects,
      icon: Heart,
      color: 'purple',
    },
    {
      label: 'Engagement',
      value: formatNumber(stats.totalEngagement),
      icon: Share2,
      color: 'orange',
      trend: '+8%',
    },
  ];

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Portfolio Analytics</h2>
        <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <Download className="h-4 w-4" />
          Export Report
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white border border-gray-200 rounded-lg p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={cn('p-2 rounded-lg', colorClasses[stat.color as keyof typeof colorClasses])}>
                <stat.icon className="h-5 w-5" />
              </div>
              {stat.trend && (
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                  {stat.trend}
                </span>
              )}
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Top Performing Project */}
      {stats.topProject && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-600 mb-1">
                Top Performing Project
              </div>
              <div className="text-lg font-bold text-gray-900">
                {stats.topProject.title}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {formatNumber(stats.topProject.views)} views
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
              View
              <ExternalLink className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Recent Activity Chart */}
      {stats.recentViews && stats.recentViews.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            Views Last 7 Days
          </h3>
          <div className="flex items-end justify-between gap-2 h-32">
            {stats.recentViews.map((day, idx) => {
              const maxViews = Math.max(...stats.recentViews.map(d => d.count));
              const height = (day.count / maxViews) * 100;
              
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex items-end" style={{ height: '100px' }}>
                    <div
                      className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer"
                      style={{ height: `${height}%` }}
                      title={`${day.count} views on ${day.date}`}
                    />
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
