import React from 'react';
import { Flame, Star, UploadCloud, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

export type ContributionType = 'streak' | 'endorsement' | 'upload' | 'activity';

interface ContributionBadgeProps {
  type: ContributionType;
  count: number;
  className?: string;
}

export function ContributionBadge({ type, count, className = '' }: ContributionBadgeProps) {
  const getConfig = () => {
    switch (type) {
      case 'streak':
        return {
          icon: Flame,
          label: `${count} Day Streak`,
          colors: 'from-orange-500 to-red-500',
          border: 'border-orange-400',
          bg: 'bg-orange-50',
          shadow: 'shadow-orange-200',
          description: 'Concsecutive days of activity'
        };
      case 'endorsement':
        return {
          icon: Star,
          label: `${count} Endorsements`,
          colors: 'from-yellow-400 to-amber-500',
          border: 'border-yellow-400',
          bg: 'bg-yellow-50',
          shadow: 'shadow-yellow-200',
          description: 'Validated by peers'
        };
      case 'upload':
        return {
          icon: UploadCloud,
          label: `${count} Contributions`,
          colors: 'from-blue-400 to-indigo-500',
          border: 'border-blue-400',
          bg: 'bg-blue-50',
          shadow: 'shadow-blue-200',
          description: 'Document uploads and assets'
        };
      default:
        return {
          icon: TrendingUp,
          label: `${count} Actions`,
          colors: 'from-gray-400 to-slate-500',
          border: 'border-gray-400',
          bg: 'bg-gray-50',
          shadow: 'shadow-gray-200',
          description: 'Platform activity'
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full cursor-help select-none bg-white border ${config.border} ${className}`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 4px 12px -2px rgba(0,0,0,0.1)",
              y: -1
            }}
            whileTap={{ scale: 0.95 }}
          >
            <div className={`p-1 rounded-full bg-gradient-to-br ${config.colors} text-white`}>
              <Icon className="h-3 w-3" />
            </div>
            <span className="text-xs font-semibold text-gray-700">
              {config.label}
            </span>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{config.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
