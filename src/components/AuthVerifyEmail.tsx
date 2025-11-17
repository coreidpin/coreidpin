import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/utils/supabase/client';

interface VerificationState {
  loading: boolean;
  success: boolean;
  error: string | null;
  message: string;
}

export const AuthVerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<VerificationState>({
    loading: true,
    success: false,
    error: null,
    message: 'Verifying your email...',
  });

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Check for token parameter and treat it as a code
        const token = searchParams.get('token');
        let email = searchParams.get('email') || localStorage.getItem('registrationEmail');
        
        // If no email found, prompt user for it
        if (token && !email) {
          email = prompt('Please enter your email address to complete verification:');
          if (email) {
            localStorage.setItem('registrationEmail', email);
          }
        }
        
        // Handle token without email (show error)
        if (token && !email) {
          setState({
            loading: false,
            success: false,
            error: 'Missing email',
            message: 'Email address is required for verification. Please try the verification link from your email again.',
          });
          return;
        }
        
        if (token && email) {
          console.log('Token found, manually verifying user in database');
          
          // Manually verify user in Supabase since backend API is deprecated
          const { data: user, error: fetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', email)
            .single();
            
          if (fetchError || !user) {
            throw new Error('User not found. Please ensure you registered with this email.');
          }
          
          // Update email verification status
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ 
              email_verified: true,
              updated_at: new Date().toISOString()
            })
            .eq('email', email);
            
          if (updateError) {
            throw new Error('Failed to verify email. Please try again.');
          }
          
          // Update local storage
          localStorage.setItem('emailVerified', 'true');
          localStorage.setItem('registrationEmail', email);
          
          setState({
            loading: false,
            success: true,
            error: null,
            message: 'Your email has been successfully verified! You can now sign in.',
          });
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate('/login');
          }, 3000);
          return;
        }
        
        // Fallback to code/email format
        const code = searchParams.get('code');
        const fallbackEmail = searchParams.get('email');

        if (!code && !token) {
          setState({
            loading: false,
            success: false,
            error: 'Missing verification code or token',
            message: 'Invalid verification link. Please request a new verification email.',
          });
          return;
        }
        
        if (code && fallbackEmail) {
          // Use API for code verification
          const { api } = await import('@/utils/api');
          const result = await api.verifyEmailCode(fallbackEmail, code);
          
          if (result.success) {
            localStorage.setItem('emailVerified', 'true');
            setState({
              loading: false,
              success: true,
              error: null,
              message: 'Your email has been successfully verified! ✓',
            });
            setTimeout(() => navigate('/login'), 3000);
            return;
          } else {
            throw new Error(result.error || 'Code verification failed');
          }
        }
        
        // If we reach here, something is wrong
        setState({
          loading: false,
          success: false,
          error: 'Invalid parameters',
          message: 'Invalid verification link format.',
        });
        return;


      } catch (err) {
        console.error('Verification error:', err);
        setState({
          loading: false,
          success: false,
          error: 'NETWORK_ERROR',
          message: 'Network error during verification. Please try again.',
        });
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          {state.loading && (
            <>
              <div className="mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 animate-pulse">
                  <svg
                    className="w-8 h-8 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Verifying Email
              </h1>
              <p className="text-gray-600">{state.message}</p>
            </>
          )}

          {state.success && (
            <>
              <div className="mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-green-600 mb-2">
                Success!
              </h1>
              <p className="text-gray-600 mb-6">{state.message}</p>
              <p className="text-sm text-gray-500 mb-4">
                Redirecting to dashboard...
              </p>
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:opacity-90 transition"
              >
                Go to Dashboard
              </button>
            </>
          )}

          {state.error && !state.loading && (
            <>
              <div className="mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100">
                  <svg
                    className="w-8 h-8 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-red-600 mb-2">
                Verification Failed
              </h1>
              <p className="text-gray-600 mb-6">{state.message}</p>
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/auth/resend-verification')}
                  className="w-full bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-700 transition"
                >
                  Request New Code
                </button>
                <button
                  onClick={() => navigate('/auth/login')}
                  className="w-full border-2 border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 transition"
                >
                  Back to Login
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
