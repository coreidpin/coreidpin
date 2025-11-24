import React from 'react';
import { motion } from 'motion/react';
import { Card, CardContent } from '../ui/card';
import { BadgeCheck, Globe, Eye } from 'lucide-react';
import { ActivityNotification } from '../../types/dashboard';

interface ActivityFeedProps {
  activities: ActivityNotification[];
  loading?: boolean;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities = [], loading = false }) => {
  if (loading) {
    return (
      <Card className="bg-white border-gray-100 shadow-sm h-full">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Recent Activity</h3>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="bg-white border-gray-100 shadow-sm h-full">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Recent Activity</h3>
          <div className="space-y-3">
            {activities.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
            ) : (
              activities.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                  {activity.type === 'verification' && <BadgeCheck className="h-4 w-4 text-green-500" />}
                  {activity.type === 'api' && <Globe className="h-4 w-4 text-blue-500" />}
                  {activity.type === 'view' && <Eye className="h-4 w-4 text-purple-500" />}
                  <span className="text-sm text-gray-700">{activity.text}</span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
