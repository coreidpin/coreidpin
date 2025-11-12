import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner@2.0.3';
import { supabase } from '../utils/supabase/client';
import { api } from '../utils/api';

interface EmailVerificationGateProps {
  email: string;
  userId: string;
  accessToken: string;
  onVerified?: () => void;
}

export function EmailVerificationGate({ email, userId, accessToken, onVerified }: EmailVerificationGateProps) {
  const [code, setCode] = useState('');
  const [resending, setResending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const resendLink = async () => {
    try {
      setResending(true);
      await api.resendVerificationLink(email);
      toast.success('Verification email resent');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to resend verification email');
    } finally {
      setResending(false);
    }
  };

  const verifyCode = async () => {
    if (!code || code.trim().length < 6) {
      toast.error('Enter the 6-digit code from your email');
      return;
    }
    try {
      setVerifying(true);
      const { error } = await supabase.auth.verifyOtp({ type: 'email', email, token: code.trim() });
      if (error) throw error;

      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email_confirmed_at) {
        try {
          await api.updateProfile(userId, accessToken, { verificationStatus: 'verified' });
        } catch {}
        toast.success('Email verified. Redirecting…');
        onVerified?.();
      } else {
        toast.info('Code accepted. Waiting for confirmation to propagate…');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Verify your email</CardTitle>
          <CardDescription>
            We’ve sent a verification link to <span className="font-medium">{email}</span>. You must verify your email before accessing the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Enter 6‑digit code</label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="123456"
              maxLength={6}
            />
            <Button disabled={verifying} onClick={verifyCode} className="w-full">
              {verifying ? 'Verifying…' : 'Verify code'}
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <Button variant="secondary" onClick={() => window.open('https://mail.google.com', '_blank')}>Open Gmail</Button>
            <Button variant="outline" onClick={resendLink} disabled={resending}>
              {resending ? 'Resending…' : 'Resend verification email'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}