import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabase/client';
import { api } from '../../utils/api';
import { toast } from 'sonner';
import { Loader2, Shield, Mail, Lock } from 'lucide-react';

export function AcceptAdminInvitation() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState<any>(null);
  const [step, setStep] = useState<'validate' | 'otp-request' | 'otp-verify'>('validate');
  const [otp, setOtp] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    validateInvitation();
  }, [token]);

  const validateInvitation = async () => {
    try {
      
      const { data, error } = await supabase
        .from('admin_invitations')
        .select('*')
        .eq('invitation_token', token)
        .eq('status', 'pending')
        .single();

      if (error || !data) {
        console.error('Invalid invitation:', error);
        toast.error('Invalid or expired invitation link');
        setTimeout(() => navigate('/admin/login'), 2000);
        return;
      }

      // Check if expired
      const expiresAt = new Date(data.expires_at);
      if (expiresAt < new Date()) {
        toast.error('This invitation has expired');
        setTimeout(() => navigate('/admin/login'), 2000);
        return;
      }
      setInvitation(data);
      setStep('otp-request');
    } catch (err) {
      console.error('Validation error:', err);
      toast.error('Failed to validate invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOTP = async () => {
    setIsProcessing(true);
    try {
      await api.requestOTP(invitation.email, 'email', true); // create_account = true
      toast.success(`Verification code sent to ${invitation.email}`);
      setStep('otp-verify');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send verification code');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      if (otp.length < 6) {
        throw new Error('Please enter a valid 6-digit code');
      }
      
      const response = await api.verifyOTP(
        invitation.email,
        otp,
        { email: invitation.email, userType: 'admin' },
        true // create account if needed
      );

      if (!response.access_token) {
        throw new Error('Invalid response from server');
      }

      // Add user to admin_users table
      const { error: adminError } = await supabase
        .from('admin_users')
        .insert({
          user_id: response.user.id,
          role: invitation.role,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (adminError) {
        console.error('Failed to grant admin access:', adminError);
        throw new Error('Account created but failed to grant admin access');
      }

      // Mark invitation as accepted
      await supabase
        .from('admin_invitations')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id', invitation.id);

      // Set up localStorage for admin session
      localStorage.setItem('accessToken', response.access_token);
      localStorage.setItem('userId', response.user.id);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userType', 'admin');
      localStorage.setItem('isAdmin', 'true');
      localStorage.setItem('adminRole', invitation.role);
      localStorage.setItem('adminSession', Date.now().toString());
      toast.success('Welcome! Redirecting to admin dashboard...');

      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 1500);
    } catch (error: any) {
      console.error('OTP Verify Error:', error);
      toast.error(error.message || 'Failed to verify code');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-white mx-auto mb-4" />
          <p className="text-white/70">Validating invitation...</p>
        </div>
      </div>
    );
  }

  if (!invitation) {
    return null;
  }

  const roleName = invitation.role.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full mb-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Admin Invitation
            </h1>
            <p className="text-white/70 text-sm">
              You've been invited as {roleName}
            </p>
          </div>

          {step === 'otp-request' && (
            <div className="space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-purple-400 mt-0.5" />
                  <div>
                    <p className="text-white font-medium mb-1">Email</p>
                    <p className="text-white/70 text-sm">{invitation.email}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-white font-medium mb-1">Role</p>
                    <p className="text-white/70 text-sm">{roleName}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleRequestOTP}
                disabled={isProcessing}
                className="w-full h-11 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Sending code...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Create Admin Account
                  </>
                )}
              </button>

              <p className="text-white/50 text-xs text-center">
                A verification code will be sent to your email
              </p>
            </div>
          )}

          {step === 'otp-verify' && (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div>
                <p className="text-white/70 text-sm mb-4 text-center">
                  Enter the 6-digit code sent to<br />
                  <span className="text-white font-medium">{invitation.email}</span>
                </p>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  className="w-full h-14 px-4 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/20 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all text-center text-3xl tracking-[0.5em] font-mono"
                  required
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={isProcessing || otp.length < 6}
                className="w-full h-11 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating account...
                  </>
                ) : (
                  'Complete Setup'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
