import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import { motion } from 'framer-motion';

interface FeatureTooltipProps {
  children: React.ReactNode;
  content: string;
  isVisible?: boolean;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

export function FeatureTooltip({
  children,
  content,
  isVisible = true,
  side = 'top'
}: FeatureTooltipProps) {
  if (!isVisible) return <>{children}</>;

  return (
    <TooltipProvider>
      <Tooltip open={true}>
        <TooltipTrigger asChild>
          <div className="relative inline-block">
            {children}
            {/* Pulsing Dot Indicator */}
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent 
          side={side} 
          className="bg-blue-600 text-white border-blue-500 shadow-xl px-4 py-3 max-w-[200px]"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {content}
          </motion.div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
