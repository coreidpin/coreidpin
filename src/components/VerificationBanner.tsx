import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { AlertTriangle, Mail, Clock, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../utils/api';
import { supabase } from '../utils/supabase/client';

interface VerificationBannerProps {
  userEmail: string;
  onDismiss?: () => void;
}

export default function VerificationBanner({ userEmail, onDismiss }: VerificationBannerProps) {
  const [isResending, setIsResending] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('verificationModalDismissed');
    const lastSent = localStorage.getItem('lastVerificationSent');
    
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
    
    if (lastSent) {
      const sentTime = parseInt(lastSent);
      const now = Date.now();
      const elapsed = now - sentTime;
      const cooldown = 60000;
      
      if (elapsed < cooldown) {
        setTimeLeft(Math.ceil((cooldown - elapsed) / 1000));
      }
    }
  }, []);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleResendVerification = async () => {
    if (timeLeft > 0) return;
    
    setIsResending(true);
    try {
      // Production-grade rate limiting with exponential backoff
      const rateLimitKey = `rate_limit_${userEmail}`;
      const rateLimitData = localStorage.getItem(rateLimitKey);
      
      let attemptCount = 1;
      if (rateLimitData) {
        const { count, lastAttempt } = JSON.parse(rateLimitData);
        const timeSinceLastAttempt = Date.now() - lastAttempt;
        const backoffTime = Math.min(900000, Math.pow(2, count) * 60000); // Max 15 minutes
        
        if (timeSinceLastAttempt < backoffTime) {
          const waitMinutes = Math.ceil((backoffTime - timeSinceLastAttempt) / 60000);
          toast.error(`Please wait ${waitMinutes} minute(s) before requesting another email.`);
          return;
        }
        attemptCount = count + 1;
      }
      
      // Send verification with retry logic
      let success = false;
      let retries = 3;
      
      while (retries > 0 && !success) {
        try {
          await api.sendVerificationEmail(userEmail);
          success = true;
        } catch (apiErr: any) {
          retries--;
          if (retries === 0) throw apiErr;
          await new Promise(resolve => setTimeout(resolve, 1000)); // 1s delay between retries
        }
      }
      
      // Update rate limiting
      localStorage.setItem(rateLimitKey, JSON.stringify({
        count: attemptCount,
        lastAttempt: Date.now()
      }));
      
      const now = Date.now();
      localStorage.setItem('lastVerificationSent', now.toString());
      
      // Dynamic cooldown based on attempt count
      const cooldownTime = Math.min(300, Math.pow(2, attemptCount - 1) * 60); // Max 5 minutes
      setTimeLeft(cooldownTime);
      
      toast.success('Verification email sent! Check your inbox and spam folder.', {
        description: 'Click the link in the email to verify your account and unlock all features.'
      });
      
      // Analytics tracking for production monitoring
      try {
        const userId = localStorage.getItem('userId');
        if (userId) {
          // Non-blocking analytics
          try {
            await (supabase as any)
              .from('verification_logs')
              .insert([
                {
                  user_id: userId,
                  event_type: 'verification_resent_modal',
                  email: userEmail,
                  timestamp: new Date().toISOString(),
                  attempt_count: attemptCount,
                  user_agent: navigator.userAgent.substring(0, 255)
                }
              ] as any);
          } catch {}
        }
      } catch {}
      
      // Listen for verification completion
      const checkVerification = setInterval(async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user?.email_confirmed_at) {
            localStorage.setItem('emailVerified', 'true');
            localStorage.removeItem('tempSession');
            sessionStorage.removeItem('verificationModalDismissed');
            clearInterval(checkVerification);
            toast.success('Email verified successfully! Welcome to GidiPIN.');
            window.location.reload(); // Refresh to update UI
          }
        } catch {}
      }, 5000); // Check every 5 seconds
      
      // Clean up interval after 10 minutes
      setTimeout(() => clearInterval(checkVerification), 600000);
      
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to send verification email';
      
      // Enhanced error handling for production
      if (errorMessage.includes('rate limit')) {
        toast.error('Too many requests. Please wait before trying again.');
      } else if (errorMessage.includes('network')) {
        toast.error('Network error. Please check your connection and try again.');
      } else if (errorMessage.includes('invalid email')) {
        toast.error('Invalid email address. Please contact support.');
      } else {
        toast.error('Unable to send verification email. Please try again later.');
      }
      
      // Log errors for monitoring
      console.error('Verification email error:', {
        error: errorMessage,
        email: userEmail,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      });
      
    } finally {
      setIsResending(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('verificationModalDismissed', 'true');
    onDismiss?.();
  };

  const canSend = timeLeft === 0 && !isResending;

  return (
    <Dialog open={!isDismissed} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md bg-white/10 backdrop-blur-xl border-white/20 text-white" hideClose={true}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-400">
            <Shield className="h-5 w-5" />
            Email Verification Required
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-white/80">
              Please verify your email address to access all features and ensure account security.
            </div>
          </div>
          
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <p className="text-xs text-white/60 mb-2">Verification email will be sent to:</p>
            <p className="text-sm font-medium text-white">{userEmail}</p>
          </div>
          
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleResendVerification}
              disabled={!canSend}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-50"
            >
              {isResending ? (
                <>
                  <Mail className="h-4 w-4 mr-2 animate-pulse" />
                  Sending...
                </>
              ) : timeLeft > 0 ? (
                <>
                  <Clock className="h-4 w-4 mr-2" />
                  Resend in {timeLeft}s
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Verification Email
                </>
              )}
            </Button>
            
            <Button
              variant="ghost"
              onClick={handleDismiss}
              className="w-full text-white/70 hover:text-white hover:bg-white/10"
            >
              Dismiss for now
            </Button>
          </div>
          
          <div className="text-xs text-white/50 space-y-1">
            <p>• Check your spam folder if you don't see the email</p>
            <p>• The verification link expires in 24 hours</p>
            <p>• This modal will reappear until your email is verified</p>
            <p>• You have limited access until verification is complete</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
