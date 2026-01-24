import React, { useEffect, useState } from 'react';
import { CheckCircle2, Circle, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { colors, typography, spacing, borderRadius, shadows } from '../../styles/designSystem';

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  action?: () => void;
}

interface ProfileCompletionWidgetProps {
  percentage: number;
  checklist: ChecklistItem[];
  onItemClick?: (itemId: string) => void;
}

export function ProfileCompletionWidget({
  percentage,
  checklist,
  onItemClick,
}: ProfileCompletionWidgetProps) {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);

  useEffect(() => {
    // Animate percentage on mount
    const timer = setTimeout(() => {
      setAnimatedPercentage(percentage);
    }, 200);
    return () => clearTimeout(timer);
  }, [percentage]);

  // Calculate circle properties
  const radius = 56; // Circle radius
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedPercentage / 100) * circumference;

  // Shared Background Component
  const PremiumBackground = () => (
    <>
      <div className="absolute inset-0 opacity-10" style={{ background: 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.05) 0%, transparent 50%)' }} />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
    </>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="relative overflow-hidden w-[calc(100%+2rem)] -mx-4 sm:w-full sm:mx-0 rounded-xl p-4 md:p-6 border border-slate-200"
      style={{
        background: '#ffffff',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      }}
    >
      <PremiumBackground />

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1">
            <h2
              className="text-slate-900"
              style={{
                fontSize: typography.fontSize.xl[0],
                fontWeight: typography.fontWeight.bold,
              }}
            >
              Profile Completion
            </h2>
            {percentage === 100 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.5 }}
                className="px-3 py-1 rounded-full flex items-center gap-1.5"
                style={{ background: `linear-gradient(to right, ${colors.brand.secondary[400]}, ${colors.brand.secondary[500]})` }}
              >
                <CheckCircle2 className="h-4 w-4" style={{ color: colors.white }} />
                <span className="text-xs font-bold" style={{ color: colors.white }}>Elite</span>
              </motion.div>
            )}
          </div>
          <p
            className={percentage === 100 ? '' : ''}
            style={{
              fontSize: typography.fontSize.sm[0],
              color: percentage === 100 ? colors.brand.secondary[600] : colors.neutral[500]
            }}
          >
            {percentage === 100 
              ? '🎉 All features unlocked! Your profile is complete.' 
              : 'Complete your profile to unlock all features'}
          </p>
        </div>

        {/* Progress Circle */}
        <div className="flex justify-center mb-6">
          <div className="relative" style={{ width: '140px', height: '140px' }}>
            {/* Background Circle */}
            <svg className="transform -rotate-90" width="140" height="140">
              <circle
                cx="70"
                cy="70"
                r={radius}
                stroke="rgba(0,0,0,0.05)"
                strokeWidth="8"
                fill="none"
              />
              {/* Progress Circle */}
              <motion.circle
                cx="70"
                cy="70"
                r={radius}
                stroke="url(#gradient)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{
                  duration: 0.8,
                  delay: 0.3,
                  ease: [0.68, -0.55, 0.265, 1.55], // Spring easing
                }}
                style={{
                  strokeDasharray: circumference,
                  filter: 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.5))',
                }}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
              </defs>
            </svg>

            {/* Percentage Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                style={{
                  fontSize: typography.fontSize['4xl'][0],
                  fontWeight: typography.fontWeight.bold,
                  color: colors.neutral[900],
                  lineHeight: 1,
                }}
              >
                {animatedPercentage}%
              </motion.div>
              <span
                className="mt-1"
                style={{
                  fontSize: typography.fontSize.xs[0],
                  color: colors.neutral[400]
                }}
              >
                Complete
              </span>
            </div>
          </div>
        </div>

        {/* Checklist */}
        <div className="space-y-2">
          {checklist.map((item, index) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
              onClick={() => onItemClick?.(item.id)}
              className="w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 hover:bg-white/5 active:scale-[0.99] group"
              style={{
                border: `1px solid ${colors.neutral[200]}`,
                background: colors.neutral[50],
                minHeight: '56px',
              }}
            >
              <div className="flex items-center gap-3 flex-1">
                {/* Checkbox Icon */}
                <div className="flex-shrink-0">
                  {item.completed ? (
                    <CheckCircle2
                      className=""
                      style={{ width: '20px', height: '20px', color: colors.brand.secondary[400], filter: `drop-shadow(0 0 2px ${colors.brand.secondary[400]}80)` }}
                    />
                  ) : (
                    <Circle
                      className="transition-colors group-hover:text-gray-500"
                      style={{ width: '20px', height: '20px', color: colors.neutral[600] }}
                    />
                  )}
                </div>

                {/* Label */}
                <span
                  className={item.completed ? 'text-slate-400 line-through' : 'text-slate-700 group-hover:text-slate-900 transition-colors'}
                  style={{
                    fontSize: typography.fontSize.sm[0],
                    fontWeight: typography.fontWeight.medium,
                    textAlign: 'left',
                  }}
                >
                  {item.label}
                </span>
              </div>

              {/* Arrow */}
              {!item.completed && (
                <ChevronRight
                  className="text-gray-600 group-hover:text-gray-400 transition-colors flex-shrink-0"
                  style={{ width: '16px', height: '16px' }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
