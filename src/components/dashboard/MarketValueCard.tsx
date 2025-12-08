import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { 
  TrendingUp, 
  Eye, 
  Briefcase, 
  Heart, 
  Mail,
  ArrowUp,
  ArrowDown,
  Sparkles
} from 'lucide-react';
import { useDemandScore } from '../../hooks/useDemandScore';
import { formatDistanceToNow } from 'date-fns';

interface MetricBoxProps {
  label: string;
  value: number;
  growth?: number;
  icon: React.ElementType;
}

function MetricBox({ label, value, growth, icon: Icon }: MetricBoxProps) {
  const hasGrowth = growth !== undefined && growth !== 0;
  const isPositiveGrowth = growth && growth > 0;

  return (
    <div className="bg-white/50 rounded-lg p-3 border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <Icon className="h-4 w-4 text-purple-600" />
        {hasGrowth && (
          <div className={`flex items-center gap-1 text-xs font-medium ${
            isPositiveGrowth ? 'text-green-600' : 'text-red-600'
          }`}>
            {isPositiveGrowth ? (
              <ArrowUp className="h-3 w-3" />
            ) : (
              <ArrowDown className="h-3 w-3" />
            )}
            {Math.abs(growth).toFixed(0)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-600 mt-1">{label}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <Card className="bg-gradient-to-br from-purple-50 via-white to-pink-50 border border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          Your PIN Market Value
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 px-4">
          <div className="h-20 w-20 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="h-10 w-10 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Building Your Market Value
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            We're calculating your demand score based on profile views, employer engagement, and job matches.
          </p>
          <p className="text-xs text-gray-500">
            Check back soon to see your score!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <Card className="bg-gradient-to-br from-purple-50 via-white to-pink-50 border border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-purple-600" />
          Your PIN Market Value
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col items-center">
            <Skeleton className="h-20 w-32 mb-2" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function MarketValueCard() {
  const { data: metrics, isLoading, error } = useDemandScore();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error || !metrics) {
    return <EmptyState />;
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-blue-600';
    if (score >= 4) return 'text-purple-600';
    return 'text-gray-600';
  };

  const getPercentileLabel = (percentile: number) => {
    if (percentile >= 90) return '🔥 Top 10%';
    if (percentile >= 75) return '⭐ Top 25%';
    if (percentile >= 50) return '✨ Above Average';
    return '📊 Building Momentum';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-purple-50 via-white to-pink-50 border border-purple-200 overflow-hidden relative">
        {/* Decorative background pattern */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100 rounded-full -mr-32 -mt-32 opacity-20" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-100 rounded-full -ml-24 -mb-24 opacity-20" />
        
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <span>Your PIN Market Value</span>
            </div>
            <Badge variant="outline" className="bg-white/80 backdrop-blur-sm">
              Live
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="relative z-10">
          {/* Large Score Display */}
          <div className="text-center mb-6">
            <div className={`text-6xl sm:text-7xl font-bold mb-2 ${getScoreColor(metrics.demand_score)}`}>
              {metrics.demand_score.toFixed(1)}
              <span className="text-2xl text-gray-400">/10</span>
            </div>
            <Badge 
              variant="secondary" 
              className="bg-purple-100 text-purple-700 px-4 py-1.5 text-sm font-semibold"
            >
              {getPercentileLabel(metrics.percentile_rank)}
            </Badge>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
            <MetricBox
              label="Profile Views"
              value={metrics.profile_views_30d}
              growth={metrics.profile_views_growth}
              icon={Eye}
            />
            <MetricBox
              label="Matching Jobs"
              value={metrics.matching_jobs_count}
              icon={Briefcase}
            />
            <MetricBox
              label="Saved by Employers"
              value={metrics.profile_saves}
              icon={Heart}
            />
            <MetricBox
              label="Contact Requests"
              value={metrics.contact_requests_30d}
              icon={Mail}
            />
          </div>

          {/* Last Updated */}
          <div className="flex items-center justify-center gap-2 pt-4 border-t border-purple-100">
            <Sparkles className="h-3 w-3 text-purple-400" />
            <p className="text-xs text-gray-500">
              Updated {formatDistanceToNow(new Date(metrics.last_calculated_at))} ago
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
