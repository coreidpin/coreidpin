import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { AlertTriangle, Mail, CheckCircle, Clock } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from './ui/input-otp';
import { toast } from 'sonner';
import { supabase } from '../utils/supabase/client';
import { api } from '../utils/api';

interface EmailVerificationGateProps {
  email?: string;
  userId?: string;
  name?: string;
  onVerified?: () => void;
  onCancel?: () => void;
}

export function EmailVerificationGate({ email, userId, name, onVerified, onCancel }: EmailVerificationGateProps) {
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(60); // Start with 60s cooldown since code was just sent

  const safeEmail = email || localStorage.getItem('registrationEmail') || undefined;

  // Cooldown timer effect
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => {
      setCooldown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const handleResendCode = async () => {
    if (!safeEmail) {
      toast.error('No email found. Please try registering again.');
      return;
    }
    
    if (cooldown > 0) {
      toast.error(`Please wait ${cooldown} seconds before resending.`);
      return;
    }

    try {
      setIsResending(true);
      await api.sendVerificationEmail(safeEmail, name);
      setCooldown(60); // Reset cooldown to 60 seconds
      toast.success('New verification code sent! Check your email.');
    } catch (err: any) {
      // Check for rate limit error
      if (err?.message?.includes('rate limit') || err?.message?.includes('Too many')) {
        toast.error('Too many requests. Please wait a minute and try again.');
        setCooldown(60);
      } else {
        toast.error(err?.message || 'Failed to send verification code');
      }
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!safeEmail) {
      toast.error('No email found. Please try registering again.');
      return;
    }
    
    if (!code || code.trim().length !== 6) {
      toast.error('Please enter the complete 6-digit verification code');
      return;
    }

    try {
      setIsVerifying(true);
      
      // Verify the code
      const { success } = await api.verifyEmailCode(safeEmail, code.trim());
      if (!success) {
        throw new Error('Invalid or expired verification code');
      }

      toast.success('Email verified successfully! You can now log in.');
      
      // Clear registration email from storage
      localStorage.removeItem('registrationEmail');
      
      // Call the onVerified callback
      onVerified?.();
      
    } catch (err: any) {
      const errorMessage = err?.message || 'Verification failed';
      
      if (errorMessage.includes('expired')) {
        toast.error('Verification code has expired. Please request a new one.');
      } else if (errorMessage.includes('Invalid')) {
        toast.error('Invalid verification code. Please check and try again.');
      } else {
        toast.error(errorMessage);
      }
      
      // Clear the code input on error
      setCode('');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto w-full">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Verify Your Email
          </CardTitle>
          <CardDescription>
            We've sent a 6-digit verification code to <strong>{safeEmail}</strong>. 
            Please enter it below to complete your registration.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Security Notice */}
          <div className="flex items-start gap-2 text-sm text-muted-foreground bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg border border-amber-200 dark:border-amber-900">
            <AlertTriangle className="h-4 w-4 mt-0.5 text-amber-600 dark:text-amber-500 flex-shrink-0" />
            <span>
              Your account access is protected. You must verify your email before you can log in.
            </span>
          </div>

          {/* Code Input Section */}
          <div className="space-y-3">
            <Label htmlFor="verification-code" className="text-base font-medium">
              Enter 6-digit Verification Code
            </Label>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <InputOTP 
                maxLength={6} 
                value={code} 
                onChange={(v: string) => setCode(v)}
                disabled={isVerifying}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              <Button 
                onClick={handleVerifyCode} 
                disabled={isVerifying || code.length !== 6}
                className="w-full sm:w-auto"
              >
                {isVerifying ? (
                  <>Verifying...</>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" /> 
                    Verify
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              The code expires in 15 minutes.
            </p>
          </div>

          {/* Resend Section */}
          <div className="border-t pt-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              Didn't receive the code?
            </p>
            <div className="flex items-center gap-3">
              <Button 
                onClick={handleResendCode} 
                disabled={isResending || cooldown > 0}
                variant="secondary"
                className="w-full sm:w-auto"
              >
                {isResending ? (
                  <>Sending...</>
                ) : cooldown > 0 ? (
                  <>
                    <Clock className="h-4 w-4 mr-2" />
                    Resend in {cooldown}s
                  </>
                ) : (
                  <>Resend Code</>
                )}
              </Button>
              {onCancel && (
                <Button 
                  onClick={onCancel}
                  variant="ghost"
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
              )}
            </div>
            {cooldown > 0 && (
              <p className="text-xs text-muted-foreground">
                Rate limited to prevent spam. You can request a new code every minute.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
