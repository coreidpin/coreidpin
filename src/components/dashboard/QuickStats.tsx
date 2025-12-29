import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Eye, Star, Zap, Users, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down';
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'orange';
}

const StatCard: React.FC<StatCardProps> = ({ 
  label, 
  value, 
  change, 
  trend,
  icon,
  color = 'blue'
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className={cn('p-2 sm:p-3 rounded-lg', colorClasses[color])}>
          {icon}
        </div>
        {change !== undefined && (
          <div className={cn(
            'flex items-center gap-1 text-xs sm:text-sm font-medium',
            trend === 'up' ? 'text-green-600' : 'text-red-600'
          )}>
            {trend === 'up' ? (
              <ArrowUp className="h-3 w-3 sm:h-4 sm:w-4" />
            ) : (
              <ArrowDown className="h-3 w-3 sm:h-4 sm:w-4" />
            )}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div>
        <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{value}</div>
        <div className="text-xs sm:text-sm text-gray-500">{label}</div>
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
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-gray-900">Quick Stats</h2>
          <p className="text-xs sm:text-sm text-gray-500">Your performance at a glance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Profile Views"
          value={stats.profileViews.toLocaleString()}
          change={stats.profileViewsChange}
          trend={stats.profileViewsChange && stats.profileViewsChange > 0 ? 'up' : 'down'}
          icon={<Eye className="h-5 w-5" />}
          color="blue"
        />
        
        <StatCard
          label="Total Endorsements"
          value={stats.endorsements}
          change={stats.endorsementsChange}
          trend={stats.endorsementsChange && stats.endorsementsChange > 0 ? 'up' : 'down'}
          icon={<Star className="h-5 w-5" />}
          color="purple"
        />
        
        <StatCard
          label="PIN Usage"
          value={stats.pinUsage.toLocaleString()}
          change={stats.pinUsageChange}
          trend={stats.pinUsageChange && stats.pinUsageChange > 0 ? 'up' : 'down'}
          icon={<Zap className="h-5 w-5" />}
          color="green"
        />
        
        <StatCard
          label="Verifications"
          value={stats.verifications.toLocaleString()}
          change={stats.verificationsChange}
          trend={stats.verificationsChange && stats.verificationsChange > 0 ? 'up' : 'down'}
          icon={<Users className="h-5 w-5" />}
          color="orange"
        />
      </div>
    </div>
  );
};

// Mini chart component for trends
interface MiniChartProps {
  data: number[];
  color?: string;
}

export const MiniChart: React.FC<MiniChartProps> = ({ data, color = '#3b82f6' }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  return (
    <svg
      width="100%"
      height="40"
      viewBox="0 0 100 40"
      preserveAspectRatio="none"
      className="mt-2"
    >
      <defs>
        <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.05" />
        </linearGradient>
      </defs>
      
      {/* Area */}
      <path
        d={`M 0 40 ${data.map((val, i) => {
          const x = (i / (data.length - 1)) * 100;
          const y = 40 - ((val - min) / range) * 35;
          return `L ${x} ${y}`;
        }).join(' ')} L 100 40 Z`}
        fill={`url(#gradient-${color})`}
      />
      
      {/* Line */}
      <path
        d={`M ${data.map((val, i) => {
          const x = (i / (data.length - 1)) * 100;
          const y = 40 - ((val - min) / range) * 35;
          return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
        }).join(' ')}`}
        fill="none"
        stroke={color}
        strokeWidth="2"
      />
    </svg>
  );
};
