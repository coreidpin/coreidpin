import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { BadgeCheck, Globe, Eye, Star, Smartphone, RefreshCw, ArrowRight, Activity, Clock } from 'lucide-react';
import { ActivityNotification } from '../../types/dashboard';
import { colors } from '../../styles/designSystem';
import { cn } from '../../lib/utils';
import { formatDistanceToNow } from 'date-fns'; // Assumption: date-fns is installed, fallback if not

interface ActivityFeedProps {
  activities: ActivityNotification[];
  loading?: boolean;
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'verification':
      return <BadgeCheck className="h-4 w-4 text-green-600" />;
    case 'api':
      return <Globe className="h-4 w-4 text-blue-600" />;
    case 'view':
      return <Eye className="h-4 w-4 text-purple-600" />;
    case 'endorsement':
      return <Star className="h-4 w-4 text-amber-500" />;
    case 'pin_scan':
      return <Smartphone className="h-4 w-4 text-orange-500" />;
    case 'update':
      return <RefreshCw className="h-4 w-4 text-slate-500" />;
    default:
      return <Activity className="h-4 w-4 text-slate-400" />;
  }
};

const formatTime = (isoString?: string) => {
  if (!isoString) return '';
  try {
    return formatDistanceToNow(new Date(isoString), { addSuffix: true });
  } catch (e) {
    // Fallback for simple implementation without date-fns if preferred
    const date = new Date(isoString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  }
};

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities = [], loading = false }) => {
  if (loading) {
    return (
      <Card className="bg-white border-gray-100 shadow-sm h-full flex flex-col">
        <CardHeader className="pb-3 border-b border-gray-50">
          <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-400" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-hidden">
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-gray-100 animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-3/4 animate-pulse" />
                  <div className="h-3 bg-gray-50 rounded w-1/4 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Mock data if empty (for demo purposes if real data isn't hooked up yet)
  const displayActivities = activities.length > 0 ? activities : [
    { type: 'view', text: 'Profile viewed by recruiter at TechCorp', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
    { type: 'pin_scan', text: 'PIN scanned in Lagos, Nigeria', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
    { type: 'update', text: 'Updated "React Native" skill proficiency', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
    { type: 'verification', text: 'Email verification confirmed', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="h-full"
    >
      <Card className="bg-white border-gray-200 shadow-sm h-full flex flex-col hover:shadow-md transition-shadow duration-200">
        <CardHeader className="py-4 px-6 border-b border-gray-100 flex flex-row items-center justify-between">
          <CardTitle className="text-base sm:text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-500" />
            Recent Activity
          </CardTitle>
          <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-full">Live</span>
        </CardHeader>
        
        <CardContent className="p-0 flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto max-h-[320px]">
            {displayActivities.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center p-6">
                <div className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                  <Activity className="h-6 w-6 text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-900">No activity yet</p>
                <p className="text-xs text-gray-500 mt-1">Share your profile to start tracking views</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {displayActivities.map((activity, index) => (
                  <motion.div 
                    key={activity.id || index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 hover:bg-gray-50 transition-colors flex gap-3 group"
                  >
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 border",
                      activity.type === 'verification' ? "bg-green-50 border-green-100" :
                      activity.type === 'view' ? "bg-purple-50 border-purple-100" :
                      activity.type === 'pin_scan' ? "bg-orange-50 border-orange-100" :
                      "bg-slate-50 border-slate-100"
                    )}>
                      {getActivityIcon(activity.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 font-medium leading-tight truncate pr-2">
                        {activity.text}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-400">
                          {formatTime(activity.timestamp)}
                        </span>
                        {activity.type === 'view' && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded-full font-medium">New</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-3 border-t border-gray-100 bg-gray-50/50">
            <button className="w-full py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors flex items-center justify-center gap-1 group">
              View All Activity
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
