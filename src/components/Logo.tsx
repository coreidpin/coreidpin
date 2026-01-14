import React from 'react';
import { motion } from 'framer-motion';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
  onClick?: () => void;
  isLight?: boolean;
  style?: React.CSSProperties;
}

export function Logo({ size = 'md', className = '', showText = true, onClick, isLight = false, style = {} }: LogoProps) {
  const sizes = {
    sm: { icon: 'h-8 w-auto', text: 'text-lg' },
    md: { icon: 'h-10 w-auto', text: 'text-xl' },
    lg: { icon: 'h-16 w-auto', text: 'text-3xl' }
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
      style={style}
    >
      <motion.svg
        className={`${sizes[size].icon} object-contain`}
        viewBox="0 0 40 40"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.3, type: 'spring' }}
        aria-label="GidiPIN logo"
        role="img"
      >
        <circle
          cx="20"
          cy="20"
          r="18"
          fill={isLight ? '#0A1A33' : '#FCFCFD'}
        />
        <circle
          cx="20"
          cy="20"
          r="17"
          stroke={isLight ? '#3DE6B3' : '#1565FF'}
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M24 17C24 14.7909 22.2091 13 20 13H18C15.7909 13 14 14.7909 14 17V23C14 25.2091 15.7909 27 18 27H20C21.933 27 23.5 25.433 23.5 23.5V22H19.5"
          stroke={isLight ? '#FCFCFD' : '#0A1A33'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.svg>
      {showText && (
        <motion.span 
          className={`font-bold ${sizes[size].text}`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <span style={{ color: isLight ? 'black' : 'white' }}>GiDi</span>
          <span style={{ color: '#3DE6B3' }}>PIN</span>
        </motion.span>
      )}
    </div>
  );
}
