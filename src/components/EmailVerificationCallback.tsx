import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase/client';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function EmailVerificationCallback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleVerification = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (data.session?.user) {
          // Update verification status in profiles table
          await supabase
            .from('profiles')
            .update({ 
              email_verified: true,
              updated_at: new Date().toISOString()
            })
            .eq('id', data.session.user.id);

          // Log verification success
          await supabase.from('verification_logs').insert({
            user_id: data.session.user.id,
            event_type: 'email_verified',
            email: data.session.user.email || '',
            timestamp: new Date().toISOString(),
            verified_status: true
          });

          localStorage.setItem('emailVerified', 'true');
          setStatus('success');
          setMessage('Email verified successfully!');
          toast.success('Email verified! You now have full access.');
          
          // Redirect to dashboard after 2 seconds
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 2000);
        } else {
          throw new Error('No active session found');
        }
      } catch (error: any) {
        setStatus('error');
        setMessage(error.message || 'Verification failed');
        toast.error('Email verification failed');
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
            <p className="text-white/70">{message}</p>
            <button 
              onClick={() => window.location.href = '/login'}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}