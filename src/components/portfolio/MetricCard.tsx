/**
 * MetricCard Component
 * Displays a metric with label, value, change indicator, and optional icon
 */

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '../../lib/utils';

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: number;
  changeDirection?: 'up' | 'down';
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  change,
  changeDirection,
  icon,
  color = 'blue',
  size = 'md',
  className
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    red: 'bg-red-50 text-red-600 border-red-100',
    gray: 'bg-gray-50 text-gray-600 border-gray-100'
  };

  const sizeClasses = {
    sm: {
      container: 'p-3',
      icon: 'h-4 w-4',
      value: 'text-xl',
      label: 'text-xs',
      change: 'text-xs'
    },
    md: {
      container: 'p-4',
      icon: 'h-5 w-5',
      value: 'text-2xl sm:text-3xl',
      label: 'text-sm',
      change: 'text-sm'
    },
    lg: {
      container: 'p-6',
      icon: 'h-6 w-6',
      value: 'text-3xl sm:text-4xl',
      label: 'text-base',
      change: 'text-base'
    }
  };

  const sizes = sizeClasses[size];

  // Auto-determine direction from change value if not specified
  const direction = changeDirection || (change && change > 0 ? 'up' : 'down');
  const isPositive = direction === 'up';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={cn(
        'bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all',
        sizes.container,
        className
      )}
    >
      {/* Header with icon and change */}
      <div className="flex items-start justify-between mb-3">
        {icon && (
          <div className={cn('rounded-lg p-2', colorClasses[color])}>
            {React.cloneElement(icon as React.ReactElement, {
              className: cn(sizes.icon)
            })}
          </div>
        )}

        {change !== undefined && (
          <div className={cn(
            'flex items-center gap-1 font-semibold rounded-full px-2 py-1',
            isPositive 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700',
            sizes.change
          )}>
            {isPositive ? (
              <ArrowUp className="h-3 w-3" />
            ) : (
              <ArrowDown className="h-3 w-3" />
            )}
            {Math.abs(change)}%
          </div>
        )}
      </div>

      {/* Value and Label */}
      <div>
        <div className={cn(
          'font-bold text-gray-900 mb-1 tabular-nums',
          sizes.value
        )}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        <div className={cn('text-gray-600 font-medium', sizes.label)}>
          {label}
        </div>
      </div>
    </motion.div>
  );
};

/**
 * MetricBadge - Inline version for use in cards
 */
export const MetricBadge: React.FC<Omit<MetricCardProps, 'size' | 'className'> & { className?: string }> = ({
  label,
  value,
  icon,
  color = 'blue',
  className
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    gray: 'bg-gray-50 text-gray-700 border-gray-200'
  };

  return (
    <div className={cn(
      'inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium',
      colorClasses[color],
      className
    )}>
      {icon && React.cloneElement(icon as React.ReactElement, {
        className: 'h-4 w-4'
      })}
      <span className="font-semibold">{value}</span>
      <span className="opacity-80">{label}</span>
    </div>
  );
};
