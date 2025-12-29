import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Shimmer, ShimmerText, ShimmerCircle, ShimmerCard } from '../ui/shimmer';

// Stats Card Skeleton
export const StatsCardSkeleton: React.FC = () => (
  <Card className="bg-white border-gray-100 shadow-sm">
    <CardContent className="p-6">
      <div className="flex items-center justify-between mb-4">
        <ShimmerCircle size="48px" />
        <Shimmer width="60px" height="24px" className="rounded-full" />
      </div>
      <ShimmerText width="80%" className="mb-2" />
      <ShimmerText width="60%" />
    </CardContent>
  </Card>
);

// Profile Card Skeleton
export const ProfileCardSkeleton: React.FC = () => (
  <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-0 shadow-xl">
    <CardContent className="p-8">
      <div className="flex items-start gap-6">
        <ShimmerCircle size="80px" className="bg-white/20" />
        <div className="flex-1 space-y-3">
          <Shimmer width="200px" height="32px" className="bg-white/20" />
          <Shimmer width="150px" height="20px" className="bg-white/10" />
          <div className="flex gap-2 mt-4">
            <Shimmer width="80px" height="32px" className="bg-white/10 rounded-full" />
            <Shimmer width="80px" height="32px" className="bg-white/10 rounded-full" />
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Project Card Skeleton
export const ProjectCardSkeleton: React.FC = () => (
  <Card className="bg-white border-gray-100 shadow-sm">
    <CardContent className="p-6">
      <div className="flex items-start gap-4">
        <ShimmerCircle size="48px" />
        <div className="flex-1 space-y-3">
          <ShimmerText width="70%" />
          <ShimmerText width="100%" />
          <ShimmerText width="90%" />
          <div className="flex gap-2 mt-4">
            <Shimmer width="80px" height="24px" className="rounded-full" />
            <Shimmer width="80px" height="24px" className="rounded-full" />
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Endorsement Card Skeleton
export const EndorsementCardSkeleton: React.FC = () => (
  <Card className="bg-white border-gray-100 shadow-sm">
    <CardContent className="p-6">
      <div className="flex items-start gap-4 mb-4">
        <ShimmerCircle size="40px" />
        <div className="flex-1">
          <ShimmerText width="40%" className="mb-2" />
          <ShimmerText width="60%" />
        </div>
      </div>
      <div className="space-y-2">
        <ShimmerText width="100%" />
        <ShimmerText width="90%" />
        <ShimmerText width="70%" />
      </div>
      <div className="flex gap-2 mt-4">
        <Shimmer width="60px" height="20px" className="rounded-full" />
        <Shimmer width="60px" height="20px" className="rounded-full" />
      </div>
    </CardContent>
  </Card>
);

// Activity Timeline Skeleton
export const ActivityTimelineSkeleton: React.FC = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex items-start gap-4">
        <ShimmerCircle size="32px" />
        <div className="flex-1 space-y-2">
          <ShimmerText width="60%" />
          <ShimmerText width="40%" />
        </div>
      </div>
    ))}
  </div>
);

// Full Dashboard Skeleton (for initial load)
export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-8 animate-fade-in">
    {/* Profile Section */}
    <ProfileCardSkeleton />

    {/* Stats Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCardSkeleton />
      <StatsCardSkeleton />
      <StatsCardSkeleton />
      <StatsCardSkeleton />
    </div>

    {/* Content Sections */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <Shimmer width="150px" height="28px" className="mb-4" />
        <ProjectCardSkeleton />
        <ProjectCardSkeleton />
      </div>
      <div className="space-y-4">
        <Shimmer width="150px" height="28px" className="mb-4" />
        <EndorsementCardSkeleton />
        <EndorsementCardSkeleton />
      </div>
    </div>
  </div>
);
