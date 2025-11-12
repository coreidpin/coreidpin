import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Loader2, CheckCircle } from 'lucide-react';
import { Logo } from './Logo';

interface AuthCallbackProps {
  onComplete: () => void;
}

export function AuthCallback({ onComplete }: AuthCallbackProps) {
  useEffect(() => {
    // Simulate processing delay for smooth UX
    const timer = setTimeout(() => {
      onComplete();
    }, 1500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-8"
      >
        <Logo size="lg" />
        
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="h-8 w-8 text-primary" />
              </motion.div>
            </div>
            <h2 className="text-2xl font-semibold">Signing you in...</h2>
            <p className="text-muted-foreground">Please wait while we set up your account</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
          >
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>Authentication successful</span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
