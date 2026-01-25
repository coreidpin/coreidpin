import React from 'react';
import { motion } from 'framer-motion';
import { Star, Award, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InfluentialBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'full' | 'compact';
  className?: string;
  animate?: boolean;
}

export function InfluentialBadge({ 
  size = 'md', 
  variant = 'full',
  className,
  animate = true 
}: InfluentialBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  // Icon-only variant
  if (variant === 'icon') {
    return (
      <div className={cn('inline-flex items-center', className)}>
        <div className="relative group">
          {animate ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              <Star 
                size={iconSizes[size]} 
                className="text-[#32f08c] fill-[#32f08c] drop-shadow-[0_0_8px_rgba(50,240,140,0.5)]" 
              />
            </motion.div>
          ) : (
            <Star 
              size={iconSizes[size]} 
              className="text-[#32f08c] fill-[#32f08c] drop-shadow-[0_0_8px_rgba(50,240,140,0.5)]" 
            />
          )}
          
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-black/90 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl border border-white/10">
            Influential Professional
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-black/90" />
          </div>
        </div>
      </div>
    );
  }

  // Compact variant (badge with icon)
  if (variant === 'compact') {
    return (
      <div className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        'bg-gradient-to-r from-[#32f08c]/10 to-[#32f08c]/5',
        'border border-[#32f08c]/30',
        'text-[#32f08c]',
        sizeClasses[size],
        className
      )}>
        <Sparkles size={iconSizes[size]} className="text-[#32f08c]" />
        <span>Influential</span>
      </div>
    );
  }

  // Full badge variant
  const BadgeContent = (
    <div className={cn(
      'inline-flex items-center gap-2 rounded-full font-semibold',
      'bg-gradient-to-r from-[#32f08c]/20 via-[#32f08c]/10 to-transparent',
      'border border-[#32f08c]/40',
      'text-[#32f08c]',
      'shadow-[0_0_20px_rgba(50,240,140,0.15)]',
      'backdrop-blur-sm',
      sizeClasses[size],
      className
    )}>
      <div className="relative">
        <Award size={iconSizes[size]} className="text-[#32f08c]" />
        <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-[#32f08c] rounded-full animate-pulse" />
      </div>
      <span style={{ color: '#32f08c' }} className="font-bold">
        Influential Professional
      </span>
    </div>
  );

  if (animate) {
    return (
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="inline-block"
      >
        {BadgeContent}
      </motion.div>
    );
  }

  return BadgeContent;
}
