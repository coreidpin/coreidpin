import React from 'react';
import { Skeleton } from '../ui/skeleton';
import { Card, CardContent, CardHeader } from '../ui/card';

export function OverviewSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 animate-pulse">
      {/* Quick Actions Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 dark:bg-slate-800 rounded-xl" />
        ))}
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-background">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Area Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 md:gap-8">
        <div className="lg:col-span-4 h-[300px] bg-gray-200 dark:bg-slate-800 rounded-xl" />
        <div className="lg:col-span-3 h-[300px] bg-gray-200 dark:bg-slate-800 rounded-xl" />
      </div>
    </div>
  );
}
