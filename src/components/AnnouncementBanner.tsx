import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Megaphone, Sparkles, Gift } from 'lucide-react';
import { Button } from './ui/button';

interface AnnouncementBannerProps {
  message?: string;
  type?: 'info' | 'success' | 'warning' | 'promotional';
  dismissible?: boolean;
  link?: {
    text: string;
    href: string;
  };
}

export function AnnouncementBanner({ 
  message = "🎉 Welcome to CoreID! The world's first social network where real skills meet verified opportunities.",
  type = 'info',
  dismissible = true,
  link
}: AnnouncementBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  const typeStyles = {
    info: 'bg-surface border-surface text-foreground',
    success: 'bg-surface border-surface text-foreground',
    warning: 'bg-surface border-surface text-foreground',
    promotional: 'bg-surface border-surface text-foreground'
  };

  const iconMap = {
    info: Megaphone,
    success: Sparkles,
    warning: Megaphone,
    promotional: Gift
  };

  const Icon = iconMap[type];

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className={`border-b ${typeStyles[type]}`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-4 py-2.5 min-h-[48px]">
            <div className="flex items-center gap-3 justify-center min-w-0">
              <Icon className="h-4 w-4 flex-shrink-0" />
              <p className="text-sm font-medium text-center">
                {message}
              </p>
              {link && (
                <a
                  href={link.href}
                  className="text-sm font-semibold underline underline-offset-4 hover:no-underline flex-shrink-0"
                >
                  {link.text}
                </a>
              )}
            </div>
            {dismissible && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
                className="h-6 w-6 p-0 hover:bg-transparent flex-shrink-0 absolute right-4"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Dismiss announcement</span>
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
