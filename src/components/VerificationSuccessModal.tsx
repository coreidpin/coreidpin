import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { CheckCircle, ArrowRight, User, Shield, Zap } from 'lucide-react';
import { motion } from 'motion/react';

interface VerificationSuccessModalProps {
  open: boolean;
  onClose: () => void;
  userType: 'employer' | 'professional' | 'university';
}

export function VerificationSuccessModal({ open, onClose, userType }: VerificationSuccessModalProps) {
  const nextSteps = {
    professional: [
      { icon: User, text: 'Complete your professional profile' },
      { icon: Shield, text: 'Set up your PIN identity' },
      { icon: Zap, text: 'Start connecting with opportunities' }
    ],
    employer: [
      { icon: User, text: 'Set up your company profile' },
      { icon: Shield, text: 'Configure hiring preferences' },
      { icon: Zap, text: 'Start discovering talent' }
    ],
    university: [
      { icon: User, text: 'Complete institutional setup' },
      { icon: Shield, text: 'Configure student verification' },
      { icon: Zap, text: 'Connect with industry partners' }
    ]
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto bg-white/95 backdrop-blur-xl border border-white/20">
        <DialogHeader className="text-center pb-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="mx-auto mb-4"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </motion.div>
          <DialogTitle className="text-2xl font-semibold text-gray-900">
            Email Successfully Verified!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <p className="text-gray-600 mb-4">
              Welcome to CoreID! Your account is now fully activated and ready to use.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            <h3 className="font-medium text-gray-900 mb-3">Next Steps:</h3>
            {nextSteps[userType].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <step.icon className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm text-gray-700">{step.text}</span>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Button 
              onClick={onClose}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Get Started
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}