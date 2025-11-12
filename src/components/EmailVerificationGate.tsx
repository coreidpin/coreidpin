import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { AlertTriangle, Mail, CheckCircle } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from './ui/input-otp';
import { toast } from 'sonner';
import { supabase } from '../utils/supabase/client';
import { api } from '../utils/api';

interface EmailVerificationGateProps {
  email?: string;
  userId?: string;
  accessToken?: string;
  onVerified?: (user?: any) => void;
}

export function EmailVerificationGate({ email, userId, accessToken, onVerified }: EmailVerificationGateProps) {
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [hasSent, setHasSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [mode, setMode] = useState<'link' | 'pin'>('link');

  const safeEmail = email || localStorage.getItem('registrationEmail') || undefined;

  const handleResend = async () => {
    if (!safeEmail) {
      toast.error('No email found. Please log in again.');
      return;
    }
    try {
      setIsVerifying(true);
      if (cooldown > 0) return;
      await api.sendVerificationEmail(safeEmail);
      setHasSent(true);
      setCooldown(60);
      toast.success('Verification email sent. Check your inbox.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to send verification email');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!safeEmail) {
      toast.error('No email found. Please log in again.');
      return;
    }
    if (!code || code.trim().length !== 6) {
      toast.error('Enter the 6-digit verification code');
      return;
    }
    try {
      setIsVerifying(true);
      const { success } = await api.verifyPinCode(safeEmail, code.trim());
      if (!success) throw new Error('Invalid code');

      const { data: userResp, error } = await supabase.auth.getUser();
      if (error) {
        // Non-blocking: we still allow progress and sync KV status
        console.warn('Failed to refresh user after verification:', error.message);
      }

      const refreshedUser = userResp?.user;
      const emailConfirmedAt = refreshedUser?.email_confirmed_at || new Date().toISOString();

      if (userId && accessToken) {
        try {
          await api.updateProfile(userId, accessToken, { verificationStatus: 'verified' });
        } catch (e) {
          console.warn('Failed to sync profile verification status:', (e as any)?.message);
        }
      }

      toast.success('Email verified. Redirecting to your dashboard...');
      onVerified?.({ ...refreshedUser, email_confirmed_at: emailConfirmedAt });
    } catch (err: any) {
      toast.error(err?.message || 'Verification failed');
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
            Verify your email to continue
          </CardTitle>
          <CardDescription>
            Choose a method: verify using email link or enter a 6‑digit PIN code.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertTriangle className="h-4 w-4" />
            Access is gated until email verification is complete.
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setMode('link')} variant={mode === 'link' ? 'default' : 'secondary'}>Link verification</Button>
            <Button onClick={() => setMode('pin')} variant={mode === 'pin' ? 'default' : 'secondary'}>PIN verification</Button>
          </div>

          {mode === 'link' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Button onClick={handleResend} disabled={isVerifying || cooldown > 0} variant="secondary">
                  Send verification email
                </Button>
                {hasSent && <span className="text-xs text-muted-foreground">Email sent</span>}
                {cooldown > 0 && <span className="text-xs text-muted-foreground">Retry in {cooldown}s</span>}
              </div>
              <Button onClick={async () => { if (!safeEmail) { toast.error('No email found.'); return; } try { setIsVerifying(true); const { success } = await api.verifyLink(safeEmail); if (!success) throw new Error('Link verification failed'); toast.success('Email verified'); onVerified?.({ email: safeEmail }); } catch (e: any) { toast.error(e?.message || 'Verification failed'); } finally { setIsVerifying(false); } }} disabled={isVerifying}>
                Confirm verification
              </Button>
            </div>
          )}

          {mode === 'pin' && (
            <div className="space-y-2">
              <Label htmlFor="verification-code">Enter 6‑digit PIN</Label>
              <div className="flex items-center gap-2">
                <InputOTP maxLength={6} value={code} onChange={(v) => setCode(v)}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
                <Button onClick={handleVerifyCode} disabled={isVerifying || code.length !== 6}>
                  <CheckCircle className="h-4 w-4 mr-2" /> Verify
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={async () => { if (!safeEmail) { toast.error('No email found.'); return; } try { setIsVerifying(true); await api.sendPinCode(safeEmail); toast.success('PIN code sent to your email'); } catch (e: any) { toast.error(e?.message || 'Failed to send PIN'); } finally { setIsVerifying(false); } }} disabled={isVerifying} variant="secondary">
                  Send PIN code
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
