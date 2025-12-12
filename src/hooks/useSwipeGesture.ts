import { useEffect, useRef } from 'react';
import { haptics } from '../utils/haptics';

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  velocityThreshold?: number;
}

export function useSwipeGesture({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  velocityThreshold = 0.3,
}: SwipeHandlers) {
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now(),
      };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return;

      const touchEnd = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY,
        time: Date.now(),
      };

      const deltaX = touchEnd.x - touchStartRef.current.x;
      const deltaY = touchEnd.y - touchStartRef.current.y;
      const deltaTime = touchEnd.time - touchStartRef.current.time;

      const velocityX = Math.abs(deltaX) / deltaTime;
      const velocityY = Math.abs(deltaY) / deltaTime;

      // Determine if horizontal or vertical swipe
      const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);

      if (isHorizontal) {
        // Horizontal swipe
        if (Math.abs(deltaX) > threshold && velocityX > velocityThreshold) {
          if (deltaX > 0 && onSwipeRight) {
            haptics.light();
            onSwipeRight();
          } else if (deltaX < 0 && onSwipeLeft) {
            haptics.light();
            onSwipeLeft();
          }
        }
      } else {
        // Vertical swipe
        if (Math.abs(deltaY) > threshold && velocityY > velocityThreshold) {
          if (deltaY > 0 && onSwipeDown) {
            haptics.light();
            onSwipeDown();
          } else if (deltaY < 0 && onSwipeUp) {
            haptics.light();
            onSwipeUp();
          }
        }
      }

      touchStartRef.current = null;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold, velocityThreshold]);
}

/**
 * Hook for tab navigation with swipe gestures
 */
export function useSwipeNavigation(tabs: string[], currentTab: string, onTabChange: (tab: string) => void) {
  const currentIndex = tabs.indexOf(currentTab);

  useSwipeGesture({
    onSwipeLeft: () => {
      // Swipe left = next tab
      if (currentIndex < tabs.length - 1) {
        onTabChange(tabs[currentIndex + 1]);
      }
    },
    onSwipeRight: () => {
      // Swipe right = previous tab
      if (currentIndex > 0) {
        onTabChange(tabs[currentIndex - 1]);
      }
    },
  });
}
