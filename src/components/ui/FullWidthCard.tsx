import React from 'react';
import { motion, MotionProps } from 'framer-motion';

interface FullWidthCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  motionProps?: MotionProps;
  noPadding?: boolean;
}

/**
 * FullWidthCard - Breakout container that extends to screen edges
 * 
 * Uses the "full-bleed" technique to escape parent container padding
 * while maintaining a small internal padding for visual balance.
 * 
 * @example
 * <FullWidthCard>
 *   <YourCard />
 * </FullWidthCard>
 */
export function FullWidthCard({ 
  children, 
  className = '', 
  style = {},
  motionProps = {},
  noPadding = false
}: FullWidthCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      {...motionProps}
      className={noPadding ? className : `px-4 ${className}`}
      style={{
        width: '100vw',
        marginLeft: 'calc(-50vw + 50%)',
        marginRight: 'calc(-50vw + 50%)',
        ...style
      }}
    >
      {children}
    </motion.div>
  );
}
