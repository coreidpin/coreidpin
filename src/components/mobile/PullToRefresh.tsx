import React, { useState, useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { haptics } from '../../utils/haptics';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
  disabled?: boolean;
}

export function PullToRefresh({ 
  onRefresh, 
  children, 
  threshold = 80,
  disabled = false 
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: TouchEvent) => {
    if (disabled || isRefreshing) return;
    
    // Only activate if at top of page
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollTop === 0) {
      setStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (disabled || isRefreshing || startY === 0) return;

    const currentY = e.touches[0].clientY;
    const distance = currentY - startY;

    // Only pull down
    if (distance > 0) {
      setPullDistance(Math.min(distance, threshold * 1.5));
      
      // Add haptic feedback at threshold
      if (distance >= threshold && pullDistance < threshold) {
        haptics.light();
      }
    }
  };

  const handleTouchEnd = async () => {
    if (disabled || isRefreshing) return;

    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      haptics.medium();
      
      try {
        await onRefresh();
        haptics.success();
      } catch (error) {
        haptics.error();
        console.error('Refresh error:', error);
      } finally {
        setIsRefreshing(false);
      }
    }

    setPullDistance(0);
    setStartY(0);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [startY, pullDistance, isRefreshing, disabled]);

  const rotation = Math.min((pullDistance / threshold) * 360, 360);
  const opacity = Math.min(pullDistance / threshold, 1);

  return (
    <div ref={containerRef} className="relative">
      {/* Pull indicator */}
      <div 
        className="absolute top-0 left-0 right-0 flex items-center justify-center transition-opacity"
        style={{
          height: `${Math.min(pullDistance, threshold)}px`,
          opacity: opacity,
        }}
      >
        <div 
          className="text-gray-400"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: isRefreshing ? 'none' : 'transform 0.2s ease-out',
          }}
        >
          {isRefreshing ? (
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          ) : (
            <svg 
              className="h-6 w-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
              />
            </svg>
          )}
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          transform: `translateY(${isRefreshing ? threshold : pullDistance}px)`,
          transition: isRefreshing || pullDistance === 0 ? 'transform 0.2s ease-out' : 'none',
        }}
      >
        {children}
      </div>
    </div>
  );
}
