import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, Loader2, CheckCircle2 } from 'lucide-react';
import { ConnectionStatus } from '../hooks/useRealtime';

interface RealtimeStatusProps {
  status: ConnectionStatus;
  showWhenConnected?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  compact?: boolean;
}

export const RealtimeStatus: React.FC<RealtimeStatusProps> = ({
  status,
  showWhenConnected = false,
  position = 'top-right',
  compact = false
}) => {
  const shouldShow = status !== 'connected' || showWhenConnected;

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  };

  const statusConfig = {
    connected: {
      icon: CheckCircle2,
      label: 'Live',
      color: 'bg-green-500',
      textColor: 'text-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      pulse: false
    },
    connecting: {
      icon: Loader2,
      label: 'Connecting...',
      color: 'bg-yellow-500',
      textColor: 'text-yellow-700',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      pulse: true,
      spin: true
    },
    disconnected: {
      icon: WifiOff,
      label: 'Offline',
      color: 'bg-gray-500',
      textColor: 'text-gray-700',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      pulse: false
    },
    error: {
      icon: WifiOff,
      label: 'Connection Error',
      color: 'bg-red-500',
      textColor: 'text-red-700',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      pulse: true
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  if (!shouldShow) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`fixed ${positionClasses[position]} z-50`}
      >
        {compact ? (
          // Compact dot indicator
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white shadow-md border border-gray-200">
            <div className={`relative`}>
              <div className={`w-2 h-2 rounded-full ${config.color}`}></div>
              {config.pulse && (
                <motion.div
                  className={`absolute inset-0 rounded-full ${config.color}`}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.7, 0, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </div>
            <span className="text-xs font-medium text-gray-600">{config.label}</span>
          </div>
        ) : (
          // Full status card
          <div className={`${config.bgColor} border ${config.borderColor} rounded-lg shadow-lg px-4 py-2.5 min-w-[140px]`}>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Icon
                  className={`h-5 w-5 ${config.textColor} ${config.spin ? 'animate-spin' : ''}`}
                />
                {config.pulse && !config.spin && (
                  <motion.div
                    className={`absolute -inset-1 rounded-full ${config.color} opacity-20`}
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </div>
              <div>
                <p className={`text-sm font-semibold ${config.textColor}`}>
                  {config.label}
                </p>
                {status === 'connected' && (
                  <p className="text-xs text-gray-500">Real-time sync active</p>
                )}
                {status === 'error' && (
                  <p className="text-xs text-red-600">Retrying...</p>
                )}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * Inline status indicator (for use in headers, etc.)
 */
export const InlineRealtimeStatus: React.FC<{ status: ConnectionStatus }> = ({ status }) => {
  const config = {
    connected: { color: 'bg-green-500', label: 'Live' },
    connecting: { color: 'bg-yellow-500', label: 'Connecting' },
    disconnected: { color: 'bg-gray-400', label: 'Offline' },
    error: { color: 'bg-red-500', label: 'Error' }
  };

  const { color, label } = config[status];

  return (
    <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-gray-100">
      <div className="relative">
        <div className={`w-2 h-2 rounded-full ${color}`}></div>
        {status === 'connected' && (
          <motion.div
            className={`absolute inset-0 rounded-full ${color}`}
            animate={{ scale: [1, 1.5, 1], opacity: [0.7, 0, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </div>
      <span className="text-xs font-medium text-gray-600">{label}</span>
    </div>
  );
};
