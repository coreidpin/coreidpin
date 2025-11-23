import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type StatusType = 
  | 'active' 
  | 'pending' 
  | 'suspended' 
  | 'verified' 
  | 'rejected' 
  | 'warning'
  | 'inactive'
  | 'approved'
  | 'declined'
  | 'expired';

export type StatusSize = 'sm' | 'md' | 'lg';

interface StatusBadgeProps {
  status: StatusType;
  size?: StatusSize;
  icon?: LucideIcon;
  className?: string;
}

const statusConfig: Record<StatusType, { 
  label: string; 
  color: string; 
  bgColor: string; 
  borderColor: string;
}> = {
  active: {
    label: 'Active',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
  verified: {
    label: 'Verified',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
  approved: {
    label: 'Approved',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
  pending: {
    label: 'Pending',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  suspended: {
    label: 'Suspended',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
  rejected: {
    label: 'Rejected',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
  declined: {
    label: 'Declined',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
  warning: {
    label: 'Warning',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  inactive: {
    label: 'Inactive',
    color: 'text-gray-700',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
  },
  expired: {
    label: 'Expired',
    color: 'text-slate-700',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
  },
};

const sizeConfig: Record<StatusSize, {
  padding: string;
  fontSize: string;
  iconSize: string;
  gap: string;
}> = {
  sm: {
    padding: 'px-2 py-0.5',
    fontSize: 'text-xs',
    iconSize: 'h-3 w-3',
    gap: 'gap-1',
  },
  md: {
    padding: 'px-2.5 py-1',
    fontSize: 'text-sm',
    iconSize: 'h-3.5 w-3.5',
    gap: 'gap-1.5',
  },
  lg: {
    padding: 'px-3 py-1.5',
    fontSize: 'text-base',
    iconSize: 'h-4 w-4',
    gap: 'gap-2',
  },
};

export function StatusBadge({ 
  status, 
  size = 'md', 
  icon: Icon,
  className 
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const sizeStyle = sizeConfig[size];

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border',
        config.color,
        config.bgColor,
        config.borderColor,
        sizeStyle.padding,
        sizeStyle.fontSize,
        sizeStyle.gap,
        className
      )}
    >
      {Icon && <Icon className={sizeStyle.iconSize} />}
      {config.label}
    </span>
  );
}
