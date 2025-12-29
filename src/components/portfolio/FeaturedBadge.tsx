/**
 * FeaturedBadge Component
 * A star icon that toggles featured status
 */

import React from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface FeaturedBadgeProps {
  isFeatured: boolean;
  onToggle: (featured: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  disabled?: boolean;
  className?: string;
}

export const FeaturedBadge: React.FC<FeaturedBadgeProps> = ({
  isFeatured,
  onToggle,
  size = 'md',
  showLabel = false,
  disabled = false,
  className
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const handleClick = () => {
    if (!disabled) {
      onToggle(!isFeatured);
    }
  };

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <motion.button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        whileHover={{ scale: disabled ? 1 : 1.1 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        className={cn(
          'relative transition-colors rounded-full p-1',
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-yellow-50'
        )}
        aria-label={isFeatured ? 'Remove from featured' : 'Add to featured'}
      >
        <Star
          className={cn(
            sizeClasses[size],
            'transition-all duration-200',
            isFeatured
              ? 'fill-yellow-400 text-yellow-400 drop-shadow-lg'
              : 'text-gray-400 hover:text-yellow-400'
          )}
        />
        
        {/* Sparkle effect when featured */}
        {isFeatured && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.5, 0] }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 rounded-full bg-yellow-400 opacity-30"
          />
        )}
      </motion.button>

      {showLabel && (
        <span className={cn(
          'text-sm font-medium',
          isFeatured ? 'text-yellow-600' : 'text-gray-500'
        )}>
          {isFeatured ? 'Featured' : 'Feature this'}
        </span>
      )}
    </div>
  );
};
