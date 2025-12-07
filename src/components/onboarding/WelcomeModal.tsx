import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from '../ui/dialog';
import { Button } from '../ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';
import { colors, borderRadius, typography } from '../../styles/designTokens';

interface WelcomeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartTour: () => void;
  onSkip: () => void;
  userName?: string;
}

export function WelcomeModal({
  open,
  onOpenChange,
  onStartTour,
  onSkip,
  userName
}: WelcomeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-[#0a0b0d] border-white/10 text-white">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-blue-600/20 to-transparent opacity-50" />
          <motion.div 
            className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-purple-500/30 rounded-full blur-[50px]"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
        </div>

        <div className="relative z-10 p-8 flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6 p-4 bg-white/5 rounded-2xl border border-white/10 shadow-xl"
          >
            <Sparkles className="h-10 w-10 text-blue-400" />
          </motion.div>

          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400"
          >
            Welcome to CoreID{userName ? `, ${userName}` : ''}!
          </motion.h2>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-400 mb-8 leading-relaxed max-w-sm"
          >
            We've set up your professional dashboard. Let's take a quick tour to show you how to manage your identity and get endorsements.
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col gap-3 w-full"
          >
            <Button 
              onClick={onStartTour}
              className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/20"
            >
              Start Quick Tour <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={onSkip}
              className="w-full text-gray-500 hover:text-white hover:bg-white/5"
            >
              Skip for now
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
