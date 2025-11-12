import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { supabase } from '../utils/supabase/client';
import { api } from '../utils/api';
import '../styles/auth-dark.css';

interface LoginPageProps {
  onLoginSuccess: (userType: 'employer' | 'professional' | 'university', userData: any) => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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
          result = await api.loginSecure({ email: trimmedEmail, password });
        } catch (apiErr: any) {
          const msg = (apiErr?.message || '').toLowerCase();
          const serviceDown = /503|fetch|network|temporarily unavailable|service unavailable/.test(msg);
          const tooMany = /too many login attempts/i.test(apiErr?.message || '');
          const csrfMissing = /csrf token/i.test(apiErr?.message || '');
          if (tooMany) {
            throw new Error('Too many login attempts. Please wait a few minutes and retry.');
          }
          if (csrfMissing) {
            throw new Error('Security check failed. Please refresh the page and try again.');
          }
          if (!serviceDown) {
            // Re-throw non-service errors to be handled by outer catch
            throw apiErr;
          }
          // Fallback to direct Supabase auth when server function is unavailable
          const { data, error } = await supabase.auth.signInWithPassword({ email: trimmedEmail, password });
          if (error) {
            const sanitized = /confirm/i.test(error.message)
              ? 'Email not verified. Please check your inbox.'
              : /invalid|credential/i.test(error.message)
              ? 'Invalid email or password'
              : 'Sign in failed';
            throw new Error(sanitized);
          }
          result = {
            accessToken: data?.session?.access_token,
            refreshToken: data?.session?.refresh_token,
            user: data?.user,
          };
        }
      }
      const accessToken = result.accessToken;
      const refreshToken = result.refreshToken;
      if (!accessToken || (!useDemo && !refreshToken) || !result.user) {
        throw new Error('Login failed: invalid response');
      }

      // Persist session in Supabase client and local storage
      if (!String(accessToken).startsWith('demo-token-')) {
        await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
      }
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('userId', result.user.id);
      localStorage.setItem('userType', result.user.user_metadata?.userType || 'professional');

      // Success notification with requested message
      toast.success('You have successfully logged in');

      // Hand back to App to update navigation and redirect
      onLoginSuccess(result.user.user_metadata?.userType || 'professional', result.user);
    } catch (err: any) {
      setError(err?.message || 'Sign in failed. Please try again.');
      // Clear password but retain email
      setPassword('');
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
      const redirectTo = `${window.location.origin}`; // App listens for PASSWORD_RECOVERY and opens reset dialog
      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, { redirectTo });
      if (error) throw error;
      toast.success('Password reset email sent. Check your inbox.');
    } catch (err: any) {
      setError(err?.message || 'Failed to send password reset email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-dark min-h-screen flex items-center justify-center">
      <div className="auth-card w-full max-w-md border rounded-2xl shadow-lg p-8">
        <h1 className="auth-title text-2xl font-semibold mb-2">Welcome Back</h1>
        <p className="auth-subtitle text-sm mb-6">Sign in to your account</p>

        {error && (
          <div className="auth-error mb-4 p-3 rounded-lg border text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="auth-label">Email Address</Label>
            <div className="relative">
              <Mail className="auth-icon absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`auth-input h-11 pl-10 ${error ? 'auth-input-error' : ''}`}
                aria-invalid={!!error}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="auth-label">Password</Label>
            <div className="relative">
              <Lock className="auth-icon absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`auth-input h-11 pl-10 pr-10 ${error ? 'auth-input-error' : ''}`}
                aria-invalid={!!error}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="auth-icon-button absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <div className="mt-1 text-right">
              <button
                type="button"
                onClick={handlePasswordResetRequest}
                className="auth-link text-sm"
                aria-label="Forgot password? Request a reset email"
              >
                Forgot your password?
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11"
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
    </div>
  );
}
