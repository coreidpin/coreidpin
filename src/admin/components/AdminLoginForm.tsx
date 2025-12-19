import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';
import { Loader2, Chrome, Shield, Lock } from 'lucide-react';
import { supabase } from '../../utils/supabase/client';
import { api } from '../../utils/api';
import { OTPVerifyForm } from '../../features/auth/OTPVerifyForm';

type AuthStep = 'request' | 'verify_otp';

export const AdminLoginForm: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Auth Flow State
  const [step, setStep] = useState<AuthStep>('request');
  const [contact, setContact] = useState('');
  const [contactType, setContactType] = useState<'phone' | 'email'>('email');

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const normalizedContact = contact.trim().toLowerCase();
      if (normalizedContact.length < 5) {
        throw new Error('Please enter a valid email address');
      }

      // Need create_account=true to create identity_users record
      await api.requestOTP(normalizedContact, contactType, true);
      toast.success('OTP sent to your email');
      setStep('verify_otp');
    } catch (err: any) {
      console.error('OTP Request Error:', err);
      if (err.message?.includes('Account not found')) {
        setError('Account does not exist. Please contact administrator.');
      } else {
        setError(err.message || 'Failed to send OTP');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerifySuccess = async (accessToken: string, user: any) => {
    setIsLoading(true);
    try {
      console.log('🔍 Checking admin status for user:', user.id);
      console.log('User object:', user);
      
      // 1. Verify Admin Status using RPC function (bypasses RLS)
      const { data: adminCheckResult, error: adminError } = await supabase
        .rpc('check_admin_status', { check_user_id: user.id });

      console.log('Admin RPC result:', { adminCheckResult, adminError });

      const adminData = adminCheckResult?.[0];

      if (adminError || !adminData || !adminData.is_admin) {
        console.error('❌ Admin check failed:', adminError);
        console.error('User ID searched:', user.id);
        console.error('Result:', adminData);
        
        // Not an admin - sign out immediately
        await supabase.auth.signOut();
        localStorage.clear();
        setError('Unauthorized: You do not have administrator access.');
        setStep('request');
        toast.error('Unauthorized access attempt logged.');
        return;
      }

      console.log('✅ Admin verified:', adminData);

      // 2. Success - Supabase session is already set
      localStorage.setItem('isAdmin', 'true');
      localStorage.setItem('adminRole', adminData.role);
      localStorage.setItem('adminSession', Date.now().toString());
      
      console.log('🔐 Admin localStorage set:', {
        isAdmin: localStorage.getItem('isAdmin'),
        adminRole: localStorage.getItem('adminRole'),
        adminSession: localStorage.getItem('adminSession')
      });
      
      toast.success('Admin authentication successful - redirecting to dashboard...');
      
      // Delay redirect to ensure localStorage is persisted
      setTimeout(() => {
        console.log('🚀 Redirecting to /admin/dashboard');
        window.location.href = '/admin/dashboard';
      }, 1000);
      
    } catch (err: any) {
      console.error('Admin verification error:', err);
      setError('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToRequest = () => {
    setStep('request');
    setContact('');
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/admin`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) setError(error.message);
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed.');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-[32px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] overflow-hidden border-0 flex flex-col">
      <div className="p-8 sm:p-10 flex-1">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-[20px] flex items-center justify-center shadow-sm" style={{ background: 'linear-gradient(135deg, #f0f4ff, #e8efff)' }}>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          {step === 'request' && (
            <>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Access</h1>
              <p className="text-gray-500 text-sm">Enter your credentials to access the dashboard</p>
            </>
          )}
          {step === 'verify_otp' && (
            <>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Identity</h1>
              <p className="text-gray-500 text-sm">Enter the code sent to {contact}</p>
            </>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 flex items-start gap-3">
            <Lock className="h-4 w-4 mt-0.5 text-red-500 shrink-0" />
            <p className="text-xs text-red-600 font-medium">{error}</p>
          </div>
        )}

        {/* Auth Flow - OTP Forms */}
        <div className="space-y-6">
          {step === 'request' && (
            <form onSubmit={handleRequestOTP} className="space-y-6">
              <div>
                <label htmlFor="admin-email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="admin-email"
                  type="email"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full h-12 px-4 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  required
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Sending Code...
                  </>
                ) : (
                  'Send Verification Code'
                )}
              </Button>
            </form>
          )}

          {step === 'verify_otp' && (
            <div className="space-y-6">
              <button 
                onClick={handleBackToRequest}
                className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 transition-colors mb-4"
              >
                ← Back
              </button>

              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!contact) return;

                setIsLoading(true);
                setError('');

                try {
                  const otpInput = (e.target as HTMLFormElement).otp as HTMLInputElement;
                  const otpValue = otpInput.value;

                  if (otpValue.length < 6) {
                    throw new Error('Please enter a valid 6-digit code');
                  }

                  const normalizedContact = contact.trim().toLowerCase();
                  const response = await api.verifyOTP(
                    normalizedContact, 
                    otpValue,
                    { email: normalizedContact, userType: 'professional' },
                    true // Create identity_users record if needed
                  );
                  
                  if (response.access_token) {
                    console.log('🔑 OTP verified, setting up Supabase session...');
                    
                    // Save tokens
                    localStorage.setItem('accessToken', response.access_token);
                    localStorage.setItem('userId', response.user.id);
                    localStorage.setItem('isAuthenticated', 'true');
                    // FIX: Force 'admin' type for admin login, don't default to professional
                    localStorage.setItem('userType', 'admin');
                    
                    // Sync with Supabase - CRITICAL: Must set proper session
                    try {
                      const sessionData = {
                        access_token: response.access_token,
                        refresh_token: response.refresh_token || response.access_token
                      };
                      
                      console.log('Setting Supabase session with tokens:', {
                        hasAccessToken: !!sessionData.access_token,
                        hasRefreshToken: !!sessionData.refresh_token
                      });
                      
                      const { data: sessionResult, error: sessionError } = await supabase.auth.setSession(sessionData);
                      
                      if (sessionError) {
                        console.error('❌ Supabase session error:', sessionError);
                      } else {
                        console.log('✅ Supabase session set successfully:', sessionResult.session?.user?.id);
                      }
                    } catch (syncError) {
                      console.error('Session sync error:', syncError);
                    }
                    
                    // Now check admin status
                    await handleOTPVerifySuccess(response.access_token, response.user);
                  }
                } catch (error: any) {
                  console.error('OTP Verify Error:', error);
                  setError(error.message || 'Invalid code');
                } finally {
                  setIsLoading(false);
                }
              }} className="space-y-6">
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Code
                  </label>
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    className="w-full h-14 px-4 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-center text-2xl tracking-[0.5em] font-mono"
                    required
                    autoFocus
                    onChange={(e) => {
                      e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    }}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify Code'
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Didn't receive code?{' '}
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await api.requestOTP(contact, contactType);
                          toast.success('New code sent');
                        } catch (error: any) {
                          toast.error(error.message || 'Failed to resend');
                        }
                      }}
                      className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                      Resend
                    </button>
                  </p>
                </div>
              </form>
            </div>
          )}
        </div>

      </div>

      {/* Footer info */}
      <div className="bg-gray-50/50 px-8 py-5 border-t border-gray-100 text-center">
        <p className="text-[10px] text-gray-400 flex items-center justify-center gap-2 font-medium">
          <Lock className="h-3 w-3" />
          Authorized access only. All sessions are encrypted and monitored.
        </p>
      </div>
    </div>
  );
};
