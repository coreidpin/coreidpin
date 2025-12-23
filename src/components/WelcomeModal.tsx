import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/button';
import { X, Sparkles } from 'lucide-react';

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show modal after a short delay
    const timer = setTimeout(() => {
      // Check if user has already seen it this session/ever
      const hasSeen = sessionStorage.getItem('hasSeenWelcomeModal');
      if (!hasSeen) {
        setIsOpen(true);
        sessionStorage.setItem('hasSeenWelcomeModal', 'true');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-6 right-6 z-50 max-w-sm w-full md:w-auto"
        >
          <div className="bg-zinc-900 border border-zinc-800 text-white p-5 rounded-2xl shadow-2xl flex items-start gap-4 relative overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="p-2 bg-zinc-800 rounded-xl relative z-10">
              <span className="text-2xl">👋</span>
            </div>
            
            <div className="flex-1 relative z-10">
              <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
                Welcome to GidiPIN!
               <Sparkles className="w-4 h-4 text-amber-400" />
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-3">
                Wishing you a season of success and growth. Happy Holidays! 🎄
              </p>
              <Button 
                size="sm" 
                onClick={handleClose}
                className="bg-white text-black hover:bg-gray-200 h-8 text-xs font-medium px-4"
              >
                Thanks!
              </Button>
            </div>

            <button 
              onClick={handleClose}
              className="absolute top-3 right-3 text-zinc-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
