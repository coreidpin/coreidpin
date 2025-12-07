import React from 'react';
import { motion } from 'framer-motion';
import { borderRadius, spacing } from '../../styles/designTokens';
import { premiumCardShadow } from '../../styles/shadows';

export function DashboardSkeleton() {
  const SkeletonCard = ({ height, className = '' }: { height: string | number; className?: string }) => (
    <div
      className={`bg-white overflow-hidden ${className}`}
      style={{
        borderRadius: borderRadius.xl,
        boxShadow: premiumCardShadow,
        padding: spacing[6],
      }}
    >
      <div className="animate-pulse space-y-4">
        {/* Header Skeleton */}
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-2">
            <div className="h-6 w-32 bg-gray-100 rounded" />
            <div className="h-4 w-48 bg-gray-50 rounded" />
          </div>
          <div className="h-8 w-8 bg-gray-100 rounded-full" />
        </div>
        
        {/* Content Skeleton */}
        <div className="space-y-3">
          <div style={{ height }} className="w-full bg-gray-50 rounded-lg" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-[428px] mx-auto w-full">
      {/* Hero Profile Skeleton */}
      <div
        className="bg-white overflow-hidden relative"
        style={{
          borderRadius: borderRadius.xl,
          boxShadow: premiumCardShadow,
          height: '180px',
        }}
      >
        <div className="absolute inset-0 animate-pulse bg-gray-100" />
        <div className="relative p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-3">
              <div className="h-8 w-48 bg-white/50 rounded" />
              <div className="h-4 w-32 bg-white/50 rounded" />
            </div>
            <div className="h-8 w-24 bg-white/50 rounded-full" />
          </div>
        </div>
      </div>

      {/* PIN Card Skeleton */}
      <SkeletonCard height={160} />

      {/* Completion Widget Skeleton */}
      <SkeletonCard height={120} />

      {/* Activity Chart Skeleton */}
      <SkeletonCard height={200} />

      {/* Activity Feed Skeleton */}
      <SkeletonCard height={240} />
    </div>
  );
}
