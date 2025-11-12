import React from 'react';
import { motion } from 'motion/react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
  onClick?: () => void;
  isLight?: boolean;
}

export function Logo({ size = 'md', className = '', showText = true, onClick, isLight = false }: LogoProps) {
  const sizes = {
    sm: { icon: 'w-6 h-6', text: 'text-lg' },
    md: { icon: 'w-8 h-8', text: 'text-xl' },
    lg: { icon: 'w-12 h-12', text: 'text-3xl' }
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <div 
      className={`flex items-center gap-2 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={handleClick}
    >
      {/* Modern "C" Logo Badge */}
      <motion.div 
        className={`${sizes[size].icon} relative flex items-center justify-center bg-gradient-to-br from-[var(--brand-primary)] to-emerald-500 rounded-lg shadow-lg`}
        whileHover={{ scale: 1.05, rotate: 5 }}
        transition={{ duration: 0.3, type: "spring" }}
      >
        <span className={`font-bold ${size === 'sm' ? 'text-base' : size === 'md' ? 'text-xl' : 'text-3xl'} ${isLight ? 'text-[var(--brand-primary-contrast)]' : 'text-white'}`}>
          C
        </span>
      </motion.div>
      
      {showText && (
        <motion.span 
          className={`font-bold ${sizes[size].text} ${isLight ? 'text-black' : 'text-[var(--brand-fg)]'}`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <span className="text-[var(--brand-primary)]">C</span>oreID
        </motion.span>
      )}
    </div>
  );
}
