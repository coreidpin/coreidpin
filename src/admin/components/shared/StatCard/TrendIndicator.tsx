import React from 'react';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrendIndicatorProps {
  value: number;
  showPercentage?: boolean;
  className?: string;
}

export function TrendIndicator({ value, showPercentage = true, className }: TrendIndicatorProps) {
  const isPositive = value > 0;
  const isNeutral = value === 0;
  
  if (isNeutral) {
    return (
      <span className={cn('text-sm font-medium text-slate-500', className)}>
        {showPercentage && '0%'}
      </span>
    );
  }

  const Icon = isPositive ? TrendingUp : TrendingDown;
  const colorClass = isPositive ? 'text-emerald-600' : 'text-red-600';
  const bgClass = isPositive ? 'bg-emerald-50' : 'bg-red-50';

  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-sm font-medium', bgClass, colorClass, className)}>
      <Icon className="h-3.5 w-3.5" />
      {showPercentage && `${Math.abs(value)}%`}
    </span>
  );
}
