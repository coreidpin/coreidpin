import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export interface GlowTabItem {
  id: string;
  label: string;
  href?: string;
  onClick?: () => void;
}

interface GlowTabsProps {
  items: GlowTabItem[];
  activeId?: string;
  onChange?: (id: string) => void;
  className?: string;
  itemClassName?: string;
  glowColor?: string;
}

export function GlowTabs({ 
  items, 
  activeId, 
  onChange, 
  className, 
  itemClassName,
  glowColor = "bg-white" 
}: GlowTabsProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Determine which ID to highlight (hovered takes precedence, then active)
  const currentId = hoveredId || activeId;

  return (
    <div 
      className={cn("flex items-center gap-6", className)} 
      onMouseLeave={() => setHoveredId(null)}
    >
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => {
            if (item.onClick) item.onClick();
            if (onChange) onChange(item.id);
          }}
          onMouseEnter={() => setHoveredId(item.id)}
          className={cn(
            "relative px-1 py-2 text-sm transition-colors duration-200",
            itemClassName
          )}
        >
          {/* Glowing Dot Effect */}
          {currentId === item.id && (
            <motion.div
              layoutId="glow-dot"
              className={cn(
                "absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full shadow-[0_0_8px_2px_rgba(255,255,255,0.5)]",
                glowColor
              )}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
            />
          )}

          {/* Text */}
          <span 
            className={cn(
              "relative z-10 transition-colors duration-200 font-medium",
              currentId === item.id ? "text-white" : "text-white/60 hover:text-white"
            )}
          >
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
}
