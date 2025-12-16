import React from 'react';
import { MapPin, Circle } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatusCardProps {
  status: string;
  label?: string;
  badge?: string;
  badgeIcon?: React.ReactNode;
  statusColor?: 'green' | 'blue' | 'yellow' | 'red' | 'gray';
}

const statusColors = {
  green: {
    dot: 'bg-green-500',
    ring: 'ring-green-500/20',
    text: 'text-green-700',
  },
  blue: {
    dot: 'bg-blue-500',
    ring: 'ring-blue-500/20',
    text: 'text-blue-700',
  },
  yellow: {
    dot: 'bg-yellow-500',
    ring: 'ring-yellow-500/20',
    text: 'text-yellow-700',
  },
  red: {
    dot: 'bg-red-500',
    ring: 'ring-red-500/20',
    text: 'text-red-700',
  },
  gray: {
    dot: 'bg-gray-400',
    ring: 'ring-gray-400/20',
    text: 'text-gray-700',
  },
};

export function StatusCard({ 
  status, 
  label = "Current Status",
  badge,
  badgeIcon,
  statusColor = 'green' 
}: StatusCardProps) {
  const colors = statusColors[statusColor];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative group"
    >
      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 p-6">
        <div className="flex items-center justify-between">
          {/* Left Side - Status */}
          <div className="flex items-start gap-3">
            {/* Animated Pulse Indicator */}
            <div className="relative flex-shrink-0 mt-1">
              <motion.div
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.7, 0.3, 0.7],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className={`absolute inset-0 rounded-full ${colors.dot} opacity-30`}
              />
              <Circle 
                className={`h-3 w-3 ${colors.dot} fill-current relative z-10`} 
              />
            </div>

            {/* Status Text */}
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                {label}
              </p>
              <p className={`text-lg font-bold ${colors.text} leading-tight`}>
                {status}
              </p>
            </div>
          </div>

          {/* Right Side - Badge */}
          {badge && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-shrink-0"
            >
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full border border-blue-100 shadow-sm">
                {badgeIcon || <MapPin className="h-4 w-4" />}
                <span className="text-sm font-semibold">
                  {badge}
                </span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Optional: Subtle bottom border accent */}
        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-${statusColor}-500/20 to-transparent rounded-b-2xl`} />
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none -z-10" />
    </motion.div>
  );
}

// Example usage variants
export function ActiveStatusCard() {
  return (
    <StatusCard 
      status="Actively Working"
      label="Current Status"
      badge="Remote"
      statusColor="green"
    />
  );
}

export function OfflineStatusCard() {
  return (
    <StatusCard 
      status="Offline"
      label="Current Status"
      badge="Unavailable"
      statusColor="gray"
      badgeIcon={<Circle className="h-4 w-4" />}
    />
  );
}

export function InMeetingStatusCard() {
  return (
    <StatusCard 
      status="In Meeting"
      label="Current Status"
      badge="Do Not Disturb"
      statusColor="red"
    />
  );
}
