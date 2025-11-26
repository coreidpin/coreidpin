import React from 'react';
import { Sparkles } from 'lucide-react';
import { colors, borderRadius, typography, spacing } from '../../styles/designTokens';
import { shadows } from '../../styles/shadows';

interface BetaBadgeProps {
  className?: string;
}

export function BetaBadge({ className = '' }: BetaBadgeProps) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${className}`}
      style={{
        backgroundColor: '#FEF3C7',
        color: colors.betaGold,
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.semibold,
        border: '1px solid #FCD34D',
        boxShadow: shadows.gold,
      }}
    >
      <Sparkles className="h-3 w-3" />
      <span>Beta Tester</span>
    </div>
  );
}
