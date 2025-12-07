import React from 'react';
import { Trophy, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { colors, typography } from '../../styles/designTokens';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface TopTalentBadgeProps {
  className?: string;
}

export function TopTalentBadge({ className = '' }: TopTalentBadgeProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full cursor-help select-none ${className}`}
            style={{
              background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', // Deep blue to blue
              color: '#ffffff',
              fontSize: typography.fontSize.xs,
              fontWeight: typography.fontWeight.semibold,
              border: '1px solid #60a5fa',
              boxShadow: '0 4px 6px -1px rgba(30, 58, 138, 0.4)',
            }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 6px 8px -1px rgba(30, 58, 138, 0.6)",
              background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <motion.div
              animate={{ 
                rotate: [0, -10, 10, -10, 10, 0],
                scale: [1, 1.2, 1] 
              }}
              transition={{ 
                duration: 2.5,
                repeat: Infinity,
                repeatDelay: 5,
                ease: "easeInOut"
              }}
              style={{ display: 'flex' }}
            >
              <Trophy className="h-3 w-3 text-yellow-300" />
            </motion.div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-100 to-white">
              Top Talent
            </span>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent className="bg-slate-900 border-slate-700 text-white">
          <div className="flex flex-col gap-1 text-center">
            <p className="font-semibold text-yellow-500 flex items-center justify-center gap-1">
              <Star className="h-3 w-3 fill-yellow-500" /> Top 5% Professional
            </p>
            <p className="text-xs text-slate-300">Recognized for exceptional expertise and validated skills</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
