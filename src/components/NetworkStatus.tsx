import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { isOnline } from '../utils/errorHandler';

interface NetworkStatusProps {
  showWhenOnline?: boolean;
  position?: 'top' | 'bottom';
}

export const NetworkStatus: React.FC<NetworkStatusProps> = ({ 
  showWhenOnline = false,
  position = 'top' 
}) => {
  const [online, setOnline] = useState(isOnline());
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      setShowReconnected(true);
      
      // Hide "reconnected" message after 3 seconds
      setTimeout(() => {
        setShowReconnected(false);
      }, 3000);
    };

    const handleOffline = () => {
      setOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const shouldShow = !online || (showWhenOnline && showReconnected);

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ y: position === 'top' ? -100 : 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: position === 'top' ? -100 : 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={`fixed left-0 right-0 z-[9999] ${position === 'top' ? 'top-0' : 'bottom-0'}`}
        >
          <div className={`mx-auto max-w-md px-4 ${position === 'top' ? 'pt-4' : 'pb-4'}`}>
            <div
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg backdrop-blur-md
                ${online 
                  ? 'bg-green-500/90 text-white' 
                  : 'bg-red-500/90 text-white'
                }
              `}
            >
              {online ? (
                <>
                  <Wifi className="h-5 w-5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Back online!</p>
                    <p className="text-xs opacity-90">Connection restored</p>
                  </div>
                </>
              ) : (
                <>
                  <WifiOff className="h-5 w-5 flex-shrink-0 animate-pulse" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">You're offline</p>
                    <p className="text-xs opacity-90">Check your internet connection</p>
                  </div>
                  <AlertCircle className="h-4 w-4 opacity-75" />
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * Hook to detect online/offline status
 */
export function useNetworkStatus() {
  const [online, setOnline] = useState(isOnline());

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { online, offline: !online };
}
