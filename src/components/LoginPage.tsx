// Auth v1.1.0 - Splited layout
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { Loader2, Chrome, Shield, ArrowLeft } from 'lucide-react';
import { supabase } from '../utils/supabase/client';
import { ActivityTracker } from '../utils/activityTracker';
import { OTPRequestForm } from '../features/auth/OTPRequestForm';
import { OTPVerifyForm } from '../features/auth/OTPVerifyForm';
import { UserTypeSelector } from './UserTypeSelector';
import { AuthLayout } from './AuthLayout';

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
    
    // Track login activity
    try {
      ActivityTracker.login().catch(console.error);
    } catch (error) {
      console.error('Failed to track login:', error);
    }
    
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
    <AuthLayout
      sidebarData={{
        name: contact || undefined,
        role: userType === 'business' ? 'Business Account' : 'Professional Identity',
        pin: step === 'verify_otp' ? 'PIN-VERIFYING' : undefined
      }}
    >
      <div className="w-full">
        {/* Progress Indicator */}
        <div className="mb-6 flex space-x-1">
          <div 
            className="h-1 flex-1 rounded-full transition-all duration-500"
            style={{ 
              backgroundColor: '#6366f1' 
            }}
          />
          <div 
            className="h-1 flex-1 rounded-full transition-all duration-500"
            style={{ 
              backgroundColor: step === 'verify_otp' ? '#6366f1' : 'rgba(255,255,255,0.1)' 
            }}
          />
        </div>
        {step === 'request' && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 text-white">Welcome Back</h1>
            <p style={{ color: '#9ca3af' }}>Sign in to your global professional identity</p>
          </div>
        )}

        {/* User Type Tab-style selector for left-aligned layout */}
        {step === 'request' && (
          <div className="mb-8 p-1 bg-white/5 rounded-xl border border-white/10 flex relative overflow-hidden">
            <button
              type="button"
              onClick={() => handleUserTypeChange('professional')}
              className="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors relative"
              style={{ 
                color: userType === 'professional' ? 'black' : '#94a3b8',
              }}
            >
              <span className="relative z-10">Professional</span>
              {userType === 'professional' && (
                <motion.div 
                  layoutId="activeLoginTab"
                  className="absolute inset-0 bg-white rounded-lg shadow-sm"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
            <button
              type="button"
              onClick={() => handleUserTypeChange('business')}
              className="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors relative"
              style={{ 
                color: userType === 'business' ? 'black' : '#94a3b8',
              }}
            >
              <span className="relative z-10">Business</span>
              {userType === 'business' && (
                <motion.div 
                  layoutId="activeLoginTab"
                  className="absolute inset-0 bg-white rounded-lg shadow-sm"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Auth Flow Components */}
        <div className="relative min-h-[350px]">
          <AnimatePresence mode="wait" initial={false}>
            {step === 'request' && (
              <motion.div
                key="login-request"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <div className="mb-8 font-inherit">
                  <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 hover:opacity-80 text-sm transition-colors -mt-2 mb-4"
                    style={{ color: '#9ca3af' }}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back</span>
                  </button>
                  <OTPRequestForm onSuccess={handleOTPRequestSuccess} />
                </div>
              </motion.div>
            )}
  
            {step === 'verify_otp' && (
              <motion.div
                key="login-verify"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <div className="mb-8 font-inherit">
                  <OTPVerifyForm 
                    contact={contact} 
                    contactType={contactType} 
                    onSuccess={handleOTPVerifySuccess}
                    onBack={handleBackToRequest}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {step === 'request' && userType !== 'business' && (
          <>
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-transparent uppercase tracking-wider" style={{ color: '#94a3b8' }}>Or continue with</span>
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
            </Button>
            
            <p className="text-center text-[10px] sm:text-xs mt-8 px-4 leading-relaxed" style={{ color: '#9ca3af' }}>
              By signing in, you agree to our <a href="/terms" className="underline hover:text-white" style={{ color: '#94a3b8' }}>Terms</a> and <a href="/privacy" className="underline hover:text-white" style={{ color: '#94a3b8' }}>Privacy Policy</a>.
            </p>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
