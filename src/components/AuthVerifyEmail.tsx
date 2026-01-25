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
    message: 'Signing you in...',
  });

  useEffect(() => {
    const handleMagicLink = async () => {
      try {
        
        // Check for token from Resend email
        const token = searchParams.get('token');
        let email = searchParams.get('email') || localStorage.getItem('registrationEmail');
        
        if (token) {
          // Prompt for email if not found
          if (!email) {
            email = prompt('Please enter your email address:');
            if (!email) {
              throw new Error('Email is required for magic link authentication');
            }
          }
          
          // Mark as verified and authenticated (magic link = instant login)
          localStorage.setItem('emailVerified', 'true');
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('userType', 'professional'); // Default
          localStorage.setItem('registrationEmail', email);
          
          setState({
            loading: false,
            success: true,
            error: null,
            message: 'Successfully signed in! Welcome back.',
          });
          
          // Redirect to dashboard after 1 second
          setTimeout(() => {
            navigate('/dashboard');
          }, 1000);
          return;
        }

        // No token found, invalid magic link
        
        setState({
          loading: false,
          success: false,
          error: 'Invalid link',
          message: 'This magic link is invalid or has expired. Please request a new one.',
        });

      } catch (err) {
        console.error('Magic link error:', err);
        setState({
          loading: false,
          success: false,
          error: 'NETWORK_ERROR',
          message: 'Sign in failed. Please try again.',
        });
      }
    };

    handleMagicLink();
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
                Signing You In
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
                Sign In Failed
              </h1>
              <p className="text-gray-600 mb-6">{state.message}</p>
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-700 transition"
                >
                  Send New Magic Link
                </button>
                <button
                  onClick={() => navigate('/login')}
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

export default AuthVerifyEmail;
