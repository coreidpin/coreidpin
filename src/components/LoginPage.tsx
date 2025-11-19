import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { Loader2, Chrome, Shield } from 'lucide-react';
import { supabase } from '../utils/supabase/client';
import { api } from '../utils/api';

interface LoginPageProps {
  onLoginSuccess?: (userType: 'employer' | 'professional' | 'university', userData: any) => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [pin, setPin] = useState('');
  const [pinLoading, setPinLoading] = useState(false);
  const [pinError, setPinError] = useState('');

  const defaultOnLoginSuccess = () => {
    window.location.href = '/dashboard';
  };

  const handlePinLogin = async () => {
    setPinError('');
    const pinValue = pin.toUpperCase().replace(/^PIN-/, '');
    
    if (!/^[A-Z0-9]{3}-[A-Z0-9]{3}-[A-Z0-9]{6}$/.test(pinValue)) {
      setPinError('Enter PIN as XXX-XXX-XXXXXX');
      return;
    }
    
    try {
      setPinLoading(true);
      const data = await api.getPublicPIN(pinValue);
      
      if (!data || (data.success !== undefined && !data.success)) {
        setPinError('Invalid or expired PIN');
        return;
      }
      
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userType', 'professional');
      localStorage.setItem('userId', `pin:${pinValue}`);
      localStorage.setItem('emailVerified', 'true');
      
      toast.success('PIN login successful!');
      
      if (onLoginSuccess) {
        onLoginSuccess('professional', { id: `pin:${pinValue}`, user_metadata: { userType: 'professional' } });
      } else {
        defaultOnLoginSuccess();
      }
    } catch (e: any) {
      setPinError('PIN verification failed');
    } finally {
      setPinLoading(false);
    }
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
          setError('Google sign-in is not configured yet.');
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

  return (
    <div className="w-full max-w-md rounded-2xl p-8 border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg">
      <h1 className="text-2xl font-semibold mb-2 text-white">Welcome Back</h1>
      <p className="text-sm mb-6 text-white/70">Sign in to your account</p>

      {error && (
        <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50/10 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-4 w-4 text-white" />
          <Label htmlFor="pin" className="text-white">Professional PIN</Label>
        </div>
        <Input
          id="pin"
          type="text"
          placeholder="PIN-234-812345"
          value={pin}
          onChange={(e) => {
            setPin(e.target.value);
            if (pinError) setPinError('');
          }}
          className="h-11 bg-transparent border-white/20 text-white placeholder-white/60 mb-3"
        />
        {pinError && (
          <p className="text-xs text-red-400 mb-3">{pinError}</p>
        )}
        <Button
          type="button"
          className="w-full h-10 bg-blue-600 hover:bg-blue-700"
          disabled={pinLoading}
          onClick={handlePinLogin}
        >
          {pinLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Verifying PIN...
            </>
          ) : (
            'Login with PIN'
          )}
        </Button>
      </div>

      <div className="relative mb-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/20" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-2 bg-transparent text-white/60">OR</span>
        </div>
      </div>

      <Button
        type="button"
        className="w-full h-11 bg-white text-black hover:bg-white/90"
        disabled={isLoading}
        onClick={handleGoogleSignIn}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Signing in...
          </>
        ) : (
          <>
            <Chrome className="h-5 w-5 mr-2" />
            Continue with Google
          </>
        )}
      </Button>
    </div>
  );
}