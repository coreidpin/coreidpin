import React from 'react';
import { MapPin, Briefcase } from 'lucide-react';
import { motion } from 'motion/react';
import { Badge } from '../ui/badge';
import { BetaBadge } from '../ui/BetaBadge';
import { colors, typography, spacing, borderRadius } from '../../styles/designTokens';
import { gradients, glassMorphism } from '../../styles/shadows';

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
      className="relative w-full overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
        borderRadius: '16px',
        minHeight: '200px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
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
      <div className="relative z-10 p-6 flex flex-col justify-between h-full min-h-[200px]">
        {/* Top Row: Beta Badge */}
        {isBetaTester && (
          <div className="flex justify-end">
            <BetaBadge />
          </div>
        )}

        {/* Bottom Row: Profile Info */}
        <div className="flex flex-col gap-2 mt-auto">
          <h1
            className="text-white"
            style={{
              fontSize: typography.fontSize['3xl'],
              fontWeight: typography.fontWeight.bold,
              lineHeight: typography.lineHeight.tight,
            }}
          >
            {name}
          </h1>

          <div className="flex flex-wrap items-center gap-2 text-white">
            <div className="flex items-center gap-1.5">
              <Briefcase className="h-4 w-4 text-white" />
              <span style={{ fontSize: typography.fontSize.sm, color: '#ffffff' }}>
                {role}
              </span>
            </div>

            <span className="text-white">•</span>

            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-white" />
              <span style={{ fontSize: typography.fontSize.sm, color: '#ffffff' }}>
                {country}
              </span>
            </div>

            {isVerified && (
              <>
                <span className="text-white/50">•</span>
                <Badge
                  className="bg-white/20 text-white border-white/30 hover:bg-white/20"
                  style={{
                    fontSize: typography.fontSize.xs,
                    fontWeight: typography.fontWeight.medium,
                  }}
                >
                  ✓ Verified
                </Badge>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
    </motion.div>
  );
}
