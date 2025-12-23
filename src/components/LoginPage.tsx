import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { Loader2, Chrome, Shield } from 'lucide-react';
import { supabase } from '../utils/supabase/client';
import { OTPRequestForm } from '../features/auth/OTPRequestForm';
import { OTPVerifyForm } from '../features/auth/OTPVerifyForm';
import { UserTypeSelector } from './UserTypeSelector';

interface LoginPageProps {
  onLoginSuccess?: (userType: 'employer' | 'professional' | 'university', userData: any) => void;
}

type AuthStep = 'request' | 'verify_otp';

export default function LoginPage({ onLoginSuccess }: LoginPageProps = {}) {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<'professional' | 'business'>('professional');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Auth Flow State
  const [step, setStep] = useState<AuthStep>('request');
  const [contact, setContact] = useState('');
  const [contactType, setContactType] = useState<'phone' | 'email'>('phone');

  const defaultOnLoginSuccess = (userType: string) => {
    window.location.href = userType === 'business' ? '/developer' : '/dashboard';
  };

  const handleLoginSuccess = (accessToken: string, user: any) => {
    // Priority:
    // 1. userType state (what they selected in the UI)
    // 2. Metadata from user object
    // 3. Default to 'professional'
    const finalUserType = userType || user?.user_metadata?.userType || 'professional';
    
    if (onLoginSuccess) {
      onLoginSuccess(finalUserType, user);
    } else {
      defaultOnLoginSuccess(finalUserType);
    }
  };

  const handleOTPRequestSuccess = (newContact: string, newType: 'phone' | 'email') => {
    setContact(newContact);
    setContactType(newType);
    setStep('verify_otp');
  };

  const handleOTPVerifySuccess = async (accessToken: string, user: any) => {
    // Save tokens to localStorage for session persistence
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', accessToken); // Using access token as refresh token
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userId', user?.id || '');
    localStorage.setItem('userType', user?.user_metadata?.userType || 'professional');

    await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: accessToken
    });
    
    // Pass the userType from the state, not extracting from response potentially
    // The previous implementation was extracting from user.user_metadata, which might be stale or unset if it's a new user
    // We should respect the type chosen in the UI
    const finalUserType = user?.user_metadata?.userType || userType;
    
    // Update local storage with intended user type
    localStorage.setItem('userType', finalUserType);
    
    handleLoginSuccess(accessToken, user);
  };

  const handleBackToRequest = () => {
    setStep('request');
    setContact('');
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

  // Handle user type change
  const handleUserTypeChange = (type: 'professional' | 'business') => {
    setUserType(type);
  };

  return (
    <div className="w-full max-w-md rounded-2xl p-8 border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg">
      {step === 'request' && (
        <>
          <div className="mb-6">
            <h1 className="text-2xl font-semibold mb-2 text-white">Welcome Back</h1>
            <p className="text-sm text-white/70">Sign in to your account</p>
          </div>

          {/* User Type Selector */}
          <UserTypeSelector 
            selectedType={userType}
            onTypeChange={handleUserTypeChange}
          />

          {error && (
            <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50/10 text-sm text-red-400">
              {error}
            </div>
          )}
        </>
      )}

      {/* Auth Flow Components */}
      <div className="mb-6">
        {step === 'request' && (
          <OTPRequestForm onSuccess={handleOTPRequestSuccess} />
        )}

        {step === 'verify_otp' && (
          <OTPVerifyForm 
            contact={contact} 
            contactType={contactType} 
            onSuccess={handleOTPVerifySuccess}
            onBack={handleBackToRequest}
          />
        )}
      </div>

      {step === 'request' && (
        <>
{/*           <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-transparent text-white/40 uppercase tracking-wider">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            className="w-full h-11 bg-white text-black hover:bg-white/90 font-medium"
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
                Google
              </>
            )}
          </Button> */}
          
          <p className="text-center text-white/40 text-[10px] sm:text-xs mt-6 px-4 leading-relaxed">
            By creating an account, you agree to the <a href="/terms" className="underline hover:text-white/60">Terms of Service</a>. For more information about GidiPIN's privacy practices, see the <a href="/privacy" className="underline hover:text-white/60">GidiPIN Privacy Statement</a>. We'll occasionally send you account-related emails.
          </p>
        </>
      )}
    </div>
  );
}
