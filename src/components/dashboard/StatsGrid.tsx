import React from 'react';
import { motion } from 'motion/react';
import { Card, CardContent } from '../ui/card';
import { DashboardStats } from '../../types/dashboard';

interface StatsGridProps {
  stats: DashboardStats;
  loading?: boolean;
  reducedMotion?: boolean;
}

export const StatsGrid: React.FC<StatsGridProps> = ({ stats, loading = false, reducedMotion = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="bg-white border-gray-100 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="h-8 w-16 bg-gray-100 rounded animate-pulse mx-auto mb-2" />
              <div className="h-3 w-20 bg-gray-100 rounded animate-pulse mx-auto" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div 
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3 md:gap-4"
    >
      <Card className="bg-white border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
        <CardContent className="p-3 md:p-4 text-center">
          <div className="text-xl md:text-2xl font-bold text-purple-600">{stats.profileViews}</div>
          <div className="text-[10px] md:text-xs text-gray-500 mt-1 font-medium">Profile Views</div>
        </CardContent>
      </Card>
      
      <Card className="bg-white border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
        <CardContent className="p-3 md:p-4 text-center">
          <div className="text-xl md:text-2xl font-bold text-green-600">{stats.pinUsage}</div>
          <div className="text-[10px] md:text-xs text-gray-500 mt-1 font-medium">PIN Usage</div>
        </CardContent>
      </Card>
      
      <Card className="bg-white border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
        <CardContent className="p-3 md:p-4 text-center">
          <div className="text-xl md:text-2xl font-bold text-blue-600">{stats.verifications}</div>
          <div className="text-[10px] md:text-xs text-gray-500 mt-1 font-medium">Verifications</div>
        </CardContent>
      </Card>
      
      <Card className="bg-white border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
        <CardContent className="p-3 md:p-4 text-center">
          <div className="text-xl md:text-2xl font-bold text-purple-600">{stats.apiCalls}</div>
          <div className="text-[10px] md:text-xs text-gray-500 mt-1 font-medium">API Calls</div>
        </CardContent>
      </Card>
      
      <Card className="bg-white border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
        <CardContent className="p-3 md:p-4 text-center">
          <div className="text-xl md:text-2xl font-bold text-green-600">{stats.countries}</div>
          <div className="text-[10px] md:text-xs text-gray-500 mt-1 font-medium">Countries</div>
        </CardContent>
      </Card>
      
      <Card className="bg-white border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
        <CardContent className="p-3 md:p-4 text-center">
          <div className="text-xl md:text-2xl font-bold text-blue-600">{stats.companies}</div>
          <div className="text-[10px] md:text-xs text-gray-500 mt-1 font-medium">Companies</div>
        </CardContent>
      </Card>
      
      <Card className="bg-white border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
        <CardContent className="p-3 md:p-4 text-center">
          <div className="text-xl md:text-2xl font-bold text-purple-600">{stats.projects}</div>
          <div className="text-[10px] md:text-xs text-gray-500 mt-1 font-medium">Projects</div>
        </CardContent>
      </Card>
      
      <Card className="bg-white border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
        <CardContent className="p-3 md:p-4 text-center">
          <div className="text-xl md:text-2xl font-bold text-green-600">{stats.endorsements}</div>
          <div className="text-[10px] md:text-xs text-gray-500 mt-1 font-medium">Endorsements</div>
        </CardContent>
      </Card>
    </div>
  );
};
