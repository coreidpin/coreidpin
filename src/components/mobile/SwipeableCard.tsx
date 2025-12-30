/**
 * Swipeable Card Component  
 * For mobile swipe-to-action (delete, archive, etc.)
 */

import React, { useState, useRef, TouchEvent, ReactNode } from 'react';
import { Trash2, Archive, Star } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SwipeAction {
  icon: ReactNode;
  label: string;
  color: string;
  onAction: () => void;
}

interface SwipeableCardProps {
  children: ReactNode;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  className?: string;
  threshold?: number;
}

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  leftActions = [],
  rightActions = [
    {
      icon: <Trash2 className="h-5 w-5" />,
      label: 'Delete',
      color: 'bg-red-500',
      onAction: () => {},
    },
  ],
  className,
  threshold = 80,
}) => {
  const [swipeDistance, setSwipeDistance] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);

  const handleTouchStart = (e: TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isSwiping) return;

    currentX.current = e.touches[0].clientX;
    const distance = currentX.current - startX.current;

    // Limit swipe distance
    const maxDistance = 120;
    const limitedDistance = Math.max(-maxDistance, Math.min(maxDistance, distance));
    
    setSwipeDistance(limitedDistance);
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);

    // Check if threshold reached
    if (Math.abs(swipeDistance) >= threshold) {
      const actions = swipeDistance > 0 ? leftActions : rightActions;
      if (actions.length > 0) {
        actions[0].onAction();
      }
    }

    // Reset
    setSwipeDistance(0);
  };

  const revealPercentage = Math.min(Math.abs(swipeDistance) / threshold, 1);

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Left actions */}
      {swipeDistance > 0 && leftActions.length > 0 && (
        <div
          className="absolute inset-y-0 left-0 flex items-center"
          style={{
            width: `${Math.abs(swipeDistance)}px`,
          }}
        >
          {leftActions.map((action, idx) => (
            <div
              key={idx}
              className={cn(
                'h-full flex items-center justify-center px-4 text-white transition-all',
                action.color
              )}
              style={{
                opacity: revealPercentage,
                width: `${Math.abs(swipeDistance)}px`,
              }}
            >
              <div className="flex flex-col items-center gap-1">
                {action.icon}
                <span className="text-xs font-medium">{action.label}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Right actions */}
      {swipeDistance < 0 && rightActions.length > 0 && (
        <div
          className="absolute inset-y-0 right-0 flex items-center"
          style={{
            width: `${Math.abs(swipeDistance)}px`,
          }}
        >
          {rightActions.map((action, idx) => (
            <div
              key={idx}
              className={cn(
                'h-full flex items-center justify-center px-4 text-white transition-all',
                action.color
              )}
              style={{
                opacity: revealPercentage,
                width: `${Math.abs(swipeDistance)}px`,
              }}
            >
              <div className="flex flex-col items-center gap-1">
                {action.icon}
                <span className="text-xs font-medium">{action.label}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Card content */}
      <div
        className="relative bg-white z-10 touch-pan-y"
        style={{
          transform: `translateX(${swipeDistance}px)`,
          transition: isSwiping ? 'none' : 'transform 0.3s ease',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
};
