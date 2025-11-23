import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendIndicator } from './TrendIndicator';
import { cn } from '@/lib/utils';

export type StatCardVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: number;
  icon?: LucideIcon;
  variant?: StatCardVariant;
  loading?: boolean;
  className?: string;
}

const variantStyles: Record<StatCardVariant, {
  iconBg: string;
  iconText: string;
  accentBorder?: string;
}> = {
  default: {
    iconBg: 'bg-slate-100',
    iconText: 'text-slate-700',
  },
  success: {
    iconBg: 'bg-emerald-100',
    iconText: 'text-emerald-700',
    accentBorder: 'border-l-4 border-l-emerald-500',
  },
  warning: {
    iconBg: 'bg-amber-100',
    iconText: 'text-amber-700',
    accentBorder: 'border-l-4 border-l-amber-500',
  },
  error: {
    iconBg: 'bg-red-100',
    iconText: 'text-red-700',
    accentBorder: 'border-l-4 border-l-red-500',
  },
  info: {
    iconBg: 'bg-blue-100',
    iconText: 'text-blue-700',
    accentBorder: 'border-l-4 border-l-blue-500',
  },
};

export function StatCard({
  title,
  value,
  description,
  trend,
  icon: Icon,
  variant = 'default',
  loading = false,
  className,
}: StatCardProps) {
  const styles = variantStyles[variant];

  if (loading) {
    return (
      <Card className={cn('', className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-24 mb-2" />
          <Skeleton className="h-4 w-40" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(styles.accentBorder, className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">
          {title}
        </CardTitle>
        {Icon && (
          <div className={cn('h-8 w-8 rounded-full flex items-center justify-center', styles.iconBg)}>
            <Icon className={cn('h-4 w-4', styles.iconText)} />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-slate-900">{value}</div>
        {(description || trend !== undefined) && (
          <div className="mt-2 flex items-center gap-2">
            {trend !== undefined && <TrendIndicator value={trend} />}
            {description && (
              <p className="text-sm text-slate-500">{description}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
