import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '@/utils/api';
import { initAuth } from '@/utils/auth';

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
        const code = searchParams.get('code');
        const email = searchParams.get('email');
        const token = searchParams.get('token');

        if (token) {
          await initAuth();
          const data = await api.verifyEmailCode('', token);
          if (data.success) {
            setState({
              loading: false,
              success: true,
              error: null,
              message: 'Your email has been successfully verified! ✓',
            });
            setTimeout(() => { navigate('/dashboard'); }, 3000);
            return;
          }
        }

        if (!code || !email) {
          setState({
            loading: false,
            success: false,
            error: 'Missing verification code or email',
            message: '',
          });
          return;
        }

        await initAuth();
        const data = await api.verifyEmailCode(email, code);

        if (data.success) {
          setState({
            loading: false,
            success: true,
            error: null,
            message: 'Your email has been successfully verified! ✓',
          });

          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            navigate('/dashboard');
          }, 3000);
        } else {
          // Handle specific error codes
          let errorMessage = data.message || 'Verification failed';

          const errorCodeMessages: Record<string, string> = {
            ERR_INVALID_CODE: 'Invalid verification code. Please check your email and try again.',
            ERR_CODE_EXPIRED: 'Verification code has expired. Please request a new one.',
            ERR_CODE_USED: 'This verification code has already been used.',
            ERR_ALREADY_VERIFIED: 'Your email is already verified.',
            ERR_NOT_FOUND: 'User account not found.',
          };

          errorMessage = errorCodeMessages[data.error_code] || errorMessage;

          setState({
            loading: false,
            success: false,
            error: data.error_code,
            message: errorMessage,
          });
        }
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
