/**
 * Floating Action Button (FAB)
 * Primary action button for mobile
 */

import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

interface FABAction {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color?: string;
}

interface MobileFABProps {
  actions: FABAction[];
  className?: string;
}

export const MobileFAB: React.FC<MobileFABProps> = ({ actions, className }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn('md:hidden fixed bottom-20 right-4 z-40', className)}>
      {/* Action menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 flex flex-col gap-3 min-w-[200px]"
          >
            {actions.map((action, idx) => (
              <motion.button
                key={idx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => {
                  action.onClick();
                  setIsOpen(false);
                }}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors',
                  action.color
                )}
              >
                <div className="flex-shrink-0">{action.icon}</div>
                <span className="text-sm font-medium text-gray-900">{action.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'h-14 w-14 rounded-full shadow-lg flex items-center justify-center transition-all',
          isOpen
            ? 'bg-gray-900 text-white rotate-45'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        )}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
      </motion.button>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/20 -z-10"
          />
        )}
      </AnimatePresence>
    </div>
  );
};
