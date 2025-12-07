import React from 'react';
import { motion } from 'framer-motion';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
  onClick?: () => void;
  isLight?: boolean;
}

export function Logo({ size = 'md', className = '', showText = true, onClick, isLight = false }: LogoProps) {
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

  // Dynamic logo source based on background brightness (isLight)
  // isLight = true (Light background) -> Use Dark Logo
  // isLight = false (Dark background) -> Use Light Logo
  const logoSrc = isLight 
    ? '/logos/gidipin-logo-dark.svg' 
    : '/logos/gidipin-logo-light.svg';

  return (
    <div 
      className={`flex items-center gap-2 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={handleClick}
    >
      <motion.img
        key={logoSrc} // Ensure re-render on source change
        src={logoSrc}
        alt="CoreID logo"
        className={`${sizes[size].icon} object-contain`}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.3, type: 'spring' }}
        loading="eager"
        decoding="async"
        draggable="false"
        onError={(e) => {
          const el = e.currentTarget as HTMLImageElement;
          // Fallback to PNGs if SVGs fail
          if (el.src.includes('gidipin-logo-dark.svg')) {
            el.src = '/logos/gidipin-logo-dark.png';
          } else if (el.src.includes('gidipin-logo-light.svg')) {
            el.src = '/logos/gidipin-logo-light.png';
          } else {
             console.warn('Logo failed to load:', el.src);
          }
        }}
      />
      {showText && (
        <motion.span 
          className={`font-bold ${sizes[size].text}`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <span className={isLight ? 'text-black' : 'text-white'}>GiDi</span>
          <span className="text-[#3DE6B3]">PIN</span>
        </motion.span>
      )}
    </div>
  );
}
