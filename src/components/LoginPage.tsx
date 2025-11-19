import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, AlertTriangle, HelpCircle } from 'lucide-react';
import { supabase } from '../utils/supabase/client';
import { api } from '../utils/api';

interface LoginPageProps {
  onLoginSuccess?: (userType: 'employer' | 'professional' | 'university', userData: any) => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps = {}) {
  const defaultOnLoginSuccess = () => {
    window.location.href = '/dashboard';
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) {
        if (error.message.includes('not enabled') || error.message.includes('provider')) {
          setError('Google sign-in is not configured yet. Please use email/password to continue.');
        } else {
          setError(error.message);
        }
        setIsLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed. Please try again.');
      setIsLoading(false);
    }
  };
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [resendAttempts, setResendAttempts] = useState(0);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinLoading, setPinLoading] = useState(false);

  const normalizePin = (raw: string) => (raw || '').toUpperCase().replace(/^PIN-/, '');
  const isValidPinFormat = (raw: string) => {
    const v = normalizePin(raw);
    return /^[A-Z0-9]{3}-[A-Z0-9]{3}-[A-Z0-9]{6}$/.test(v);
  };
  const sanitizedPin = (raw: string) => normalizePin(raw).replace(/[^A-Z0-9-]/g, '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    const trimmedEmail = (email || '').trim();
    if (!trimmedEmail || !password) {
      setError('Please enter your email and password.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    try { 
      await supabase.auth.signOut();
      // Clear only auth-related items to avoid clearing other app data
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('userType');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('emailVerified');
      localStorage.removeItem('tempSession');
      localStorage.removeItem('lastActivity');
    } catch {}
    try {
      // Support demo accounts for E2E/UI verification without requiring email confirmation
      // Demo credentials: email in demo set + password 'demo123'
      const demoEmails = new Set([
        'demo.professional@swipe.work',
        'demo.employer@swipe.work',
        'demo.university@nwanne.com'
      ]);

      const useDemo = demoEmails.has(trimmedEmail) && password === 'demo123';

      let result: any;
      if (useDemo) {
        result = await api.login({ email: trimmedEmail, password });
      } else {
        try {
          // Try direct Supabase auth first
          const { data, error } = await supabase.auth.signInWithPassword({ 
            email: trimmedEmail, 
            password 
          });
          
          if (error) {
            // Check if it's an email verification issue
            if (/confirm|verification|verify/i.test(error.message)) {
              // Terminate login and show verification requirement
              setError('Your email address requires verification before you can access your account');
              setCanResend(true);
              localStorage.setItem('registrationEmail', trimmedEmail);
              return;
            } else {
              const sanitized = /invalid|credential/i.test(error.message)
                ? 'Invalid email or password'
                : 'Sign in failed';
              throw new Error(sanitized);
            }
          } else {
            // Check email verification status from user data
            if (!data?.user?.email_confirmed_at) {
              // Email not verified - terminate login
              setError('Your email address requires verification before you can access your account');
              setCanResend(true);
              localStorage.setItem('registrationEmail', trimmedEmail);
              return;
            }
            
            // Successful Supabase login with verified email
            result = {
              accessToken: data?.session?.access_token,
              refreshToken: data?.session?.refresh_token,
              user: data?.user,
            };
          }
        } catch (fetchError) {
          // Network/fetch error - create temp session to allow login
          console.log('Network error, creating temp session');
          const mockUser = {
            id: `temp_${Date.now()}`,
            email: trimmedEmail,
            email_confirmed_at: null,
            user_metadata: { userType: 'professional' }
          };
          
          result = {
            accessToken: `temp_token_${Date.now()}`,
            refreshToken: `temp_refresh_${Date.now()}`,
            user: mockUser,
          };
          
          localStorage.setItem('emailVerified', 'false');
          localStorage.setItem('tempSession', 'true');
        }
      }
      const accessToken = result.accessToken;
      const refreshToken = result.refreshToken;
      if (!accessToken || !result.user) {
        throw new Error('Login failed: invalid response');
      }

      // Persist session in Supabase client and local storage
      if (!String(accessToken).startsWith('demo-token-') && !String(accessToken).startsWith('temp_token_')) {
        await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
      }
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('userId', result.user.id);
      localStorage.setItem('userType', result.user.user_metadata?.userType || 'professional');

      // Set verification status
      const userVerified = !!result.user.email_confirmed_at;
      localStorage.setItem('emailVerified', String(userVerified));

      // Async logging with circuit breaker pattern
      const logLogin = async () => {
        try {
          const lastLogFail = localStorage.getItem('lastLogFail');
          if (lastLogFail && Date.now() - parseInt(lastLogFail) < 60000) {
            return; // Circuit breaker: skip logging if failed recently
          }
          
          await supabase.from('verification_logs').insert({
            user_id: result.user.id,
            event_type: 'login',
            email: result.user.email,
            timestamp: new Date().toISOString(),
            verified_status: !!userVerified,
            user_agent: navigator.userAgent.substring(0, 255),
            ip_address: 'client_side' // Server should log actual IP
          });
          
          localStorage.removeItem('lastLogFail');
        } catch (logErr) {
          localStorage.setItem('lastLogFail', Date.now().toString());
          // Queue for retry in background
          setTimeout(() => logLogin(), 5000);
        }
      };
      
      // Non-blocking async logging
      logLogin();

      // Success notification handled above

      // Store authentication state and activity
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('lastActivity', Date.now().toString());
      
      // Success notification
      const emailVerified = localStorage.getItem('emailVerified') === 'true';
      toast.success(emailVerified ? 'Login successful!' : 'Login successful - Please verify your email');
      
      // Call success callback instead of direct redirect
      if (onLoginSuccess) {
        onLoginSuccess(result.user.user_metadata?.userType || 'professional', result.user);
      } else {
        defaultOnLoginSuccess();
      }
    } catch (err: any) {
      const msg = err?.message || 'Sign in failed. Please try again.';
      setError(msg);
      setCanResend(/verify|confirm/i.test(msg));
      // Clear password but retain email
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setIsLoading(true);
      const trimmedEmail = (email || '').trim();
      
      // Enhanced rate limiting - max 3 attempts per hour
      const rateLimitKey = `rate_limit_${trimmedEmail}`;
      const rateLimitData = localStorage.getItem(rateLimitKey);
      
      if (rateLimitData) {
        const { count, lastAttempt } = JSON.parse(rateLimitData);
        const timeSinceLastAttempt = Date.now() - lastAttempt;
        const oneHour = 60 * 60 * 1000;
        
        // Reset count if more than 1 hour has passed
        if (timeSinceLastAttempt >= oneHour) {
          localStorage.removeItem(rateLimitKey);
        } else if (count >= 3) {
          const waitMinutes = Math.ceil((oneHour - timeSinceLastAttempt) / 60000);
          toast.error(`Rate limit exceeded. Please wait ${waitMinutes} minutes before requesting another verification email.`);
          return;
        }
      }
      
      // Send magic link using Resend API
      await api.sendVerificationEmail(trimmedEmail);
      
      // Update rate limiting
      const currentRateLimit = localStorage.getItem(rateLimitKey);
      const newCount = currentRateLimit ? JSON.parse(currentRateLimit).count + 1 : 1;
      localStorage.setItem(rateLimitKey, JSON.stringify({
        count: newCount,
        lastAttempt: Date.now()
      }));
      
      setResendAttempts(newCount);
      
      // Enhanced logging for security auditing
      const logResend = async () => {
        try {
          await supabase.from('verification_logs').insert({
            email: trimmedEmail,
            event_type: 'verification_resent',
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent.substring(0, 255),
            ip_address: 'client_side',
            attempt_count: newCount,
            session_id: localStorage.getItem('csrfToken')
          });
        } catch (logErr) {
          console.warn('Verification logging failed:', logErr);
        }
      };
      
      logResend();
      
      toast.success(
        `Magic link sent via Resend! Check your inbox and click the link to sign in instantly. ` +
        `${newCount >= 3 ? 'This was your final attempt for the next hour.' : `${3 - newCount} attempts remaining.`}`
      );
      
      if (newCount >= 3) {
        setCanResend(false);
      }
      
    } catch (e: any) {
      const errorMsg = e?.message || 'Failed to send verification email';
      
      if (errorMsg.includes('rate limit') || errorMsg.includes('Too many')) {
        toast.error('Rate limit exceeded. Please wait before requesting another verification email.');
      } else if (errorMsg.includes('expired')) {
        toast.error('Previous verification token expired. A new verification email has been sent.');
      } else if (errorMsg.includes('invalid')) {
        toast.error('Invalid verification attempt. Please contact support if this issue persists.');
      } else {
        toast.error(`${errorMsg}. Please contact support if this issue persists.`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordResetRequest = async () => {
    setError('');
    const trimmedEmail = (email || '').trim();
    if (!trimmedEmail) {
      setError('Please enter your email address to reset your password.');
      return;
    }
    try {
      setIsLoading(true);
      await api.passwordResetSend(trimmedEmail);
      toast.success('Password reset email sent. Check your inbox.');
    } catch (err: any) {
      setError(err?.message || 'Failed to send password reset email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl p-8 border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg">
      <h1 className="text-2xl font-semibold mb-2 text-white">Welcome Back</h1>
      <p className="text-sm mb-6 text-white/70">Sign in to your account</p>

      {error && (
        <div className="mb-4 p-3 rounded-lg border border-amber-200 bg-amber-50/10 text-sm text-white">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-amber-100">{error}</div>
              {canResend && (
                <div className="mt-3 space-y-2">
                  <Button 
                    type="button" 
                    variant="secondary" 
                    className="w-full h-9 bg-amber-600 hover:bg-amber-700 text-white border-0" 
                    onClick={handleResendVerification} 
                    disabled={isLoading || resendAttempts >= 3}
                  >
                    {resendAttempts >= 3 ? 'Rate Limited' : 'Resend Verification Email'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="w-full h-9 text-white/70 hover:text-white" 
                    onClick={() => {
                      setEmail('');
                      setError('');
                      setCanResend(false);
                      setResendAttempts(0);
                      localStorage.removeItem('registrationEmail');
                    }}
                  >
                    Change Email Address
                  </Button>
                  {resendAttempts > 0 && (
                    <p className="text-xs text-amber-200 text-center">
                      {resendAttempts}/3 verification emails sent this hour
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mb-4">
        <Button
          type="button"
          className="w-full h-11 bg-white text-black hover:bg-white/90"
          disabled={isLoading}
          onClick={handleGoogleSignIn}
        >
          Continue with Google
        </Button>
      </div>

      <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor="pin" className="text-white">Professional PIN</Label>
          <a href="/help" className="text-xs text-white/70 hover:text-white flex items-center gap-1" aria-label="Where to find your PIN">
            <HelpCircle className="h-4 w-4" /> Help
          </a>
        </div>
        <div className="relative">
          <Input
            id="pin"
            type="password"
            inputMode="numeric"
            placeholder="PIN-234-812345"
            value={pin}
            onChange={(e) => { setPin(e.target.value); if (pinError) setPinError(''); }}
            aria-invalid={!!pinError}
            aria-describedby={pinError ? 'pin-error' : undefined}
            className="h-11 bg-transparent border-white/20 text-white placeholder-white/60"
          />
        </div>
        {pinError && (
          <p id="pin-error" className="text-xs text-red-400 mt-2">{pinError}</p>
        )}
        <div className="mt-3">
          <Button
            type="button"
            className="w-full h-10"
            disabled={pinLoading}
            onClick={async () => {
              setPinError('');
              const pinValue = sanitizedPin(pin);
              if (!isValidPinFormat(pinValue)) {
                setPinError('Enter PIN as XXX-XXX-XXXXXX');
                return;
              }
              try {
                setPinLoading(true);
                const data = await api.getPublicPIN(pinValue);
                const ok = !!data && (data.success === undefined || data.success === true);
                if (!ok) {
                  setPinError('Invalid or expired PIN');
                  return;
                }
                try {
                  localStorage.setItem('isAuthenticated', 'true');
                  localStorage.setItem('userType', 'professional');
                  localStorage.setItem('userId', `pin:${pinValue}`);
                  localStorage.setItem('emailVerified', 'true');
                } catch {}
                try {
                  await supabase.from('verification_logs').insert({
                    user_id: `pin:${pinValue}`,
                    event_type: 'pin_login',
                    timestamp: new Date().toISOString(),
                    verified_status: true,
                    user_agent: navigator.userAgent.substring(0, 255)
                  });
                } catch {}
                if (onLoginSuccess) {
                  onLoginSuccess('professional', { id: `pin:${pinValue}`, user_metadata: { userType: 'professional' } });
                } else {
                  defaultOnLoginSuccess();
                }
              } catch (e: any) {
                setPinError(e?.message?.includes('Failed') ? 'PIN verification failed' : (e?.message || 'PIN verification failed'));
              } finally {
                setPinLoading(false);
              }
            }}
          >
            {pinLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Verifying PIN...
              </>
            ) : (
              <>Login with PIN</>
            )}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-white">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/80" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`h-11 pl-10 bg-transparent border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#7bb8ff] focus:border-[#7bb8ff]`}
                aria-invalid={!!error}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/80" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`h-11 pl-10 pr-10 bg-transparent border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#7bb8ff] focus:border-[#7bb8ff]`}
                aria-invalid={!!error}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <div className="mt-1 text-right">
              <button
                type="button"
                onClick={handlePasswordResetRequest}
                className="text-sm text-white/70 hover:text-white"
                aria-label="Forgot password? Request a reset email"
              >
                Forgot your password?
              </button>
            </div>
          </div>

        <Button
          type="submit"
          className="w-full h-11 bg-[#7bb8ff] text-white hover:bg-[#6aa5e6]"
          disabled={isLoading}
        >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="h-5 w-5 ml-2" />
              </>
            )}
          </Button>
        </form>
    </div>
  );
}
