import React, { useEffect, useState } from 'react';
import { CheckCircle2, Circle, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { colors, typography, spacing, borderRadius } from '../../styles/designTokens';
import { shadows } from '../../styles/shadows';

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
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 50%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)',
            'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)',
          ],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
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
      className="w-full relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
        borderRadius: borderRadius.xl,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        padding: spacing[6],
      }}
    >
      <PremiumBackground />

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1">
            <h2
              className="text-white"
              style={{
                fontSize: typography.fontSize.xl,
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
                className="px-3 py-1 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center gap-1.5"
              >
                <CheckCircle2 className="h-4 w-4 text-white" />
                <span className="text-xs font-bold text-white">Elite</span>
              </motion.div>
            )}
          </div>
          <p
            className={percentage === 100 ? 'text-green-400' : 'text-gray-400'}
            style={{
              fontSize: typography.fontSize.sm,
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
                stroke="rgba(255,255,255,0.1)"
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
                  fontSize: typography.fontSize['4xl'],
                  fontWeight: typography.fontWeight.bold,
                  color: 'white',
                  lineHeight: 1,
                  textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                }}
              >
                {animatedPercentage}%
              </motion.div>
              <span
                className="text-gray-400 mt-1"
                style={{
                  fontSize: typography.fontSize.xs,
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
                border: `1px solid rgba(255, 255, 255, 0.1)`,
                background: 'rgba(255, 255, 255, 0.02)',
                minHeight: '56px',
              }}
            >
              <div className="flex items-center gap-3 flex-1">
                {/* Checkbox Icon */}
                <div className="flex-shrink-0">
                  {item.completed ? (
                    <CheckCircle2
                      className="text-green-400"
                      style={{ width: '20px', height: '20px', filter: 'drop-shadow(0 0 2px rgba(74, 222, 128, 0.5))' }}
                    />
                  ) : (
                    <Circle
                      className="text-gray-600 group-hover:text-gray-500 transition-colors"
                      style={{ width: '20px', height: '20px' }}
                    />
                  )}
                </div>

                {/* Label */}
                <span
                  className={item.completed ? 'text-gray-500 line-through' : 'text-gray-200 group-hover:text-white transition-colors'}
                  style={{
                    fontSize: typography.fontSize.sm,
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
