import React from 'react';
import { cn } from '@/lib/utils';

interface ShimmerProps {
  className?: string;
  variant?: 'default' | 'circle' | 'text' | 'card';
  width?: string;
  height?: string;
}

export const Shimmer: React.FC<ShimmerProps> = ({ 
  className, 
  variant = 'default',
  width,
  height 
}) => {
  const baseClasses = "animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]";
  
  const variants = {
    default: 'rounded',
    circle: 'rounded-full',
    text: 'rounded h-4',
    card: 'rounded-lg'
  };

  const style: React.CSSProperties = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1rem' : variant === 'circle' ? '40px' : '100%'),
    animation: 'shimmer 2s infinite linear'
  };

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
      <div 
        className={cn(baseClasses, variants[variant], className)}
        style={style}
        aria-label="Loading..."
        role="status"
      />
    </>
  );
};

// Preset shimmer components
export const ShimmerText: React.FC<{ width?: string; className?: string }> = ({ width, className }) => (
  <Shimmer variant="text" width={width} className={className} />
);

export const ShimmerCircle: React.FC<{ size?: string; className?: string }> = ({ size = '40px', className }) => (
  <Shimmer variant="circle" width={size} height={size} className={className} />
);

export const ShimmerCard: React.FC<{ className?: string; height?: string }> = ({ className, height = '200px' }) => (
  <Shimmer variant="card" height={height} className={className} />
);
