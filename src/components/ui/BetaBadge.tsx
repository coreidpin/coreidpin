import React from 'react';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { colors, typography } from '../../styles/designTokens';
import { shadows } from '../../styles/shadows';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface BetaBadgeProps {
  className?: string;
}

export function BetaBadge({ className = '' }: BetaBadgeProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full cursor-help select-none ${className}`}
            style={{
              backgroundColor: '#FEF3C7',
              color: colors.betaGold,
              fontSize: typography.fontSize.xs,
              fontWeight: typography.fontWeight.semibold,
              border: '1px solid #FCD34D',
              boxShadow: shadows.gold,
            }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 4px 6px -1px rgba(251, 191, 36, 0.4), 0 2px 4px -1px rgba(251, 191, 36, 0.2)",
              backgroundColor: '#FFFBEB'
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
                ease: "easeInOut"
              }}
            >
              <Sparkles className="h-3 w-3" />
            </motion.div>
            <span>Beta Tester</span>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Early Adopter - Joined during Beta Phase</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
