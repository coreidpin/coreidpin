import React from 'react';
import { MapPin, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '../ui/badge';
import { BetaBadge } from '../ui/BetaBadge';

// ✅ NEW: Import design system tokens
import { colors, typography, spacing, borderRadius, shadows } from '../../styles/designSystem';

interface HeroProfileCardProps {
  name: string;
  role: string;
  country: string;
  isVerified?: boolean;
  isBetaTester?: boolean;
}

export function HeroProfileCard({
  name,
  role,
  country,
  isVerified = false,
  isBetaTester = true,
}: HeroProfileCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative overflow-hidden w-full"
      style={{
        // ✅ UPDATED: Using design system tokens instead of hardcoded values
        background: 'linear-gradient(135deg, #1a1a1a 0%, #000000 100%)', // TODO: Replace with colors.gradients.darkSlate
        minHeight: '200px',
        borderRadius: borderRadius['2xl'],  // ✅ Using design system
        boxShadow: shadows.lg,               // ✅ Using design system
      }}
    >
      {/* Animated gradient overlay */}
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

      {/* Content */}
      <div 
        className="relative z-10 flex flex-col justify-between h-full min-h-[200px]"
        style={{
          padding: spacing.lg,  // ✅ Using design system (24px)
        }}
      >
        {/* Top Row: Gift Icon (left) and Beta Badge (right) */}
        <div className="flex justify-between items-start">
          {/* Beta Badge */}
          {isBetaTester && (
            <div>
              <BetaBadge />
            </div>
          )}
        </div>

        {/* Bottom Row: Profile Info */}
        <div 
          className="flex flex-col mt-auto"
          style={{
            gap: spacing.sm,  // ✅ Using design system (8px)
          }}
        >
          <h1
            style={{
              // ✅ Using design system typography
              fontSize: typography.fontSize['3xl'][0],
              lineHeight: typography.fontSize['3xl'][1].lineHeight,
              fontWeight: typography.fontWeight.bold,
              color: colors.white,
            }}
          >
            {name}
          </h1>

          <div 
            className="flex flex-wrap items-center"
            style={{
              gap: spacing.sm,
            }}
          >
            <div 
              className="flex items-center"
              style={{
                gap: spacing.xs,  // ✅ Using design system (4px)
              }}
            >
              <Briefcase className="h-4 w-4 text-gray-400" />
              <span 
                style={{
                  fontSize: typography.fontSize.sm[0],
                  color: colors.neutral[400],
                }}
              >
                {role}
              </span>
            </div>

            <div 
              className="flex items-center"
              style={{
                gap: spacing.xs,
              }}
            >
              <MapPin className="h-4 w-4 text-gray-400" />
              <span 
                style={{
                  fontSize: typography.fontSize.sm[0],
                  color: colors.neutral[400],
                }}
              >
                {country}
              </span>
            </div>

            {isVerified && (
              <Badge 
                variant="secondary"
                style={{
                  backgroundColor: colors.brand.secondary[500],
                  color: colors.white,
                  fontSize: typography.fontSize.xs[0],
                }}
              >
                ✓ Verified
              </Badge>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
