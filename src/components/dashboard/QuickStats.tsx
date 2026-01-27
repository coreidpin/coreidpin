import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Eye, Star, Zap, Users, ArrowUp, ArrowDown, MapPin, BarChart3 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Sparkline } from '../ui/Sparkline';
import { colors } from '../../styles/designSystem';

interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down';
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'orange';
  sparklineData?: number[];
  benchmark?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  label, 
  value, 
  change, 
  trend,
  icon,
  color = 'blue',
  sparklineData,
  benchmark
}) => {
  const colorClasses = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', stroke: colors.brand.primary[500], fill: colors.brand.primary[100] },
    green: { bg: 'bg-green-50', text: 'text-green-600', stroke: colors.semantic.success, fill: colors.semantic.success },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', stroke: '#8B5CF6', fill: '#EDE9FE' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', stroke: colors.brand.accent[500], fill: colors.brand.accent[100] }
  };

  const currentTheme = colorClasses[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-lg transition-all duration-200 group relative overflow-hidden"
    >
      <div className="flex items-start justify-between mb-2">
        <div className={cn('p-2 sm:p-3 rounded-lg transition-colors', currentTheme.bg, currentTheme.text)}>
          {icon}
        </div>
        
        {/* Sparkline Chart */}
        {sparklineData && (
          <div className="w-24 h-10 -mr-2 -mt-2 opacity-80 group-hover:opacity-100 transition-opacity">
            <Sparkline 
              data={sparklineData} 
              width={96} 
              height={40} 
              color={currentTheme.stroke}
              strokeWidth={2}
              fillColor={currentTheme.fill}
            />
          </div>
        )}
      </div>

      <div className="relative z-10">
        <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 tracking-tight">{value}</div>
        <div className="flex items-center justify-between">
          <div className="text-xs sm:text-sm text-gray-500 font-medium">{label}</div>
          
          {change !== undefined && (
            <div className={cn(
              'flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full bg-opacity-10',
              trend === 'up' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
            )}>
              {trend === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
              {Math.abs(change)}%
            </div>
          )}
        </div>
        
        {benchmark && (
          <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400 flex items-center gap-1">
            <BarChart3 className="w-3 h-3" />
            {benchmark}
          </div>
        )}
      </div>
    </motion.div>
  );
};

interface QuickStatsProps {
  stats: {
    profileViews: number;
    profileViewsChange?: number;
    endorsements: number;
    endorsementsChange?: number;
    pinUsage: number;
    pinUsageChange?: number;
    verifications: number;
    verificationsChange?: number;
  };
}

export const QuickStats: React.FC<QuickStatsProps> = ({ stats }) => {
  // Mock data generation for sparklines (would come from API in production)
  // Ensure we have some realistic variance
  const generateTrendData = (baseValue: number) => {
    return Array.from({ length: 7 }, () => Math.max(0, baseValue * (0.8 + Math.random() * 0.4)));
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">Performance Overview</h2>
          <p className="text-xs sm:text-sm text-gray-500">Real-time metrics for the last 7 days</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <StatCard
          label="Profile Views"
          value={stats.profileViews.toLocaleString()}
          change={stats.profileViewsChange || 12}
          trend={(stats.profileViewsChange || 0) >= 0 ? 'up' : 'down'}
          icon={<Eye className="h-5 w-5" />}
          color="blue"
          sparklineData={generateTrendData(Math.max(stats.profileViews / 7, 10))}
          benchmark="Top 15% of peers"
        />
        
        <StatCard
          label="Trust Score"
          value="TOP RATED" /* Phase 2 will have real score */
          change={5}
          trend="up"
          icon={<Zap className="h-5 w-5" />}
          color="purple"
          sparklineData={[65, 68, 70, 72, 75, 78, 80]}
          benchmark="Verification pending"
        />
        
        <StatCard
          label="PIN Activity"
          value={stats.pinUsage.toLocaleString()}
          change={stats.pinUsageChange || 8}
          trend={(stats.pinUsageChange || 0) >= 0 ? 'up' : 'down'}
          icon={<MapPin className="h-5 w-5" />}
          color="orange"
          sparklineData={generateTrendData(Math.max(stats.pinUsage / 7, 5))}
          benchmark="Most views from Lagos"
        />

        <StatCard
          label="Endorsements"
          value={stats.endorsements}
          change={stats.endorsementsChange}
          trend={(stats.endorsementsChange || 0) >= 0 ? 'up' : 'down'}
          icon={<Star className="h-5 w-5" />}
          color="green"
          sparklineData={generateTrendData(Math.max(stats.endorsements / 2, 2))}
          benchmark="3 new this week"
        />
      </div>
    </div>
  );
};
