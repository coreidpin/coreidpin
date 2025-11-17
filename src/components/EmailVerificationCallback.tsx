import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase/client';
import { api } from '../utils/api';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function EmailVerificationCallback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleVerification = async () => {
      try {
        console.log('Starting email verification process...');
        console.log('Current URL:', window.location.href);
        console.log('URL search params:', window.location.search);
        console.log('URL hash:', window.location.hash);
        
        // Handle Supabase email confirmation callback
        const { data, error } = await supabase.auth.getSession();
        
        console.log('Supabase session data:', data);
        console.log('Supabase session error:', error);
        
        if (data.session?.user) {
          console.log('User found in session:', data.session.user.email);
          console.log('Email confirmed at:', data.session.user.email_confirmed_at);
          
          // Update verification status in profiles table
          try {
            await supabase
              .from('profiles')
              .update({ 
                email_verified: true,
                updated_at: new Date().toISOString()
              })
              .eq('id', data.session.user.id);
            console.log('Profile updated successfully');
          } catch (profileError) {
            console.warn('Failed to update profile:', profileError);
          }

          // Update local storage
          localStorage.setItem('emailVerified', 'true');
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('userType', data.session.user.user_metadata?.userType || 'professional');
          localStorage.setItem('userId', data.session.user.id);
          localStorage.setItem('accessToken', data.session.access_token);
          
          setStatus('success');
          setMessage('Email verified successfully!');
          toast.success('Email verified! You now have full access.');
          
          // Redirect to dashboard after 2 seconds
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 2000);
          return;
        }
        
        // Check for custom token in URL (fallback for API-based verification)
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.slice(1));
        
        const token = urlParams.get('token') || hashParams.get('token') || 
                     urlParams.get('access_token') || hashParams.get('access_token');
        
        console.log('Custom token found:', token ? 'Yes' : 'No');
        
        if (token) {
          console.log('Attempting to verify custom token...');
          // Use the API method to verify the token
          const result = await api.verifyLinkToken(token);
          
          if (result.success && result.user) {
            console.log('Custom token verification successful');
            // Update verification status
            localStorage.setItem('emailVerified', 'true');
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('userType', result.user.user_metadata?.userType || 'professional');
            localStorage.setItem('userId', result.user.id);
            
            setStatus('success');
            setMessage('Email verified successfully!');
            toast.success('Email verified! You now have full access.');
            
            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
              window.location.href = '/dashboard';
            }, 2000);
            return;
          } else {
            throw new Error(result.error || 'Token verification failed');
          }
        }
        
        // If no session and no token, this might be an error state
        console.log('No session or token found');
        throw new Error('No verification session or token found. Please try clicking the verification link again.');
        
      } catch (error: any) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage(error.message || 'Verification failed');
        toast.error('Email verification failed: ' + (error.message || 'Unknown error'));
      }
    };

    handleVerification();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl p-8 border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-400" />
            <h1 className="text-xl font-semibold text-white mb-2">Verifying Email</h1>
            <p className="text-white/70">Please wait while we verify your email address...</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-400" />
            <h1 className="text-xl font-semibold text-white mb-2">Email Verified!</h1>
            <p className="text-white/70">{message}</p>
            <p className="text-sm text-white/60 mt-2">Redirecting to dashboard...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <XCircle className="h-12 w-12 mx-auto mb-4 text-red-400" />
            <h1 className="text-xl font-semibold text-white mb-2">Verification Failed</h1>
            <p className="text-white/70 mb-4">{message}</p>
            <div className="space-y-2">
              <button 
                onClick={async () => {
                  try {
                    const email = localStorage.getItem('registrationEmail') || prompt('Enter your email to resend verification:');
                    if (email) {
                      // Use Supabase's resend confirmation
                      const { error } = await supabase.auth.resend({
                        type: 'signup',
                        email: email
                      });
                      
                      if (error) {
                        throw error;
                      }
                      
                      toast.success('Verification email sent! Check your inbox.');
                    }
                  } catch (err: any) {
                    console.error('Resend error:', err);
                    toast.error(err.message || 'Failed to send email');
                  }
                }}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 mb-2"
              >
                Request New Code
              </button>
              <button 
                onClick={() => window.location.href = '/login'}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Back to Login
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}