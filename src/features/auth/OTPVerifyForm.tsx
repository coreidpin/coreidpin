import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { toast } from 'sonner';

interface OTPVerifyFormProps {
  contact: string;
  contactType: 'phone' | 'email';
  onSuccess: (accessToken: string, user: any) => void;
  onBack: () => void;
}

export const OTPVerifyForm: React.FC<OTPVerifyFormProps> = ({ contact, contactType, onSuccess, onBack }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); // 60s cooldown for resend

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (otp.length < 6) {
        throw new Error('Please enter a valid 6-digit code');
      }

      const normalizedContact = contact.trim().toLowerCase();
      const normalizedOTP = otp.trim();

      const response = await api.verifyOTP(normalizedContact, normalizedOTP);
      
      if (response.access_token) {
        toast.success('Code verified');
        onSuccess(response.access_token, response.user);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('OTP Verify Error:', error);
      toast.error(error.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timeLeft > 0) return;
    setLoading(true);
    try {
      await api.requestOTP(contact, contactType);
      toast.success('New code sent');
      setTimeLeft(60);
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-4">
        <button 
          onClick={onBack}
          className="text-sm text-white/60 hover:text-white flex items-center gap-1 transition-colors"
        >
          ← Back
        </button>
      </div>
      
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2 text-white">
          Verify your {contactType}
        </h2>
        <p className="text-sm text-white/70">
          Enter the 6-digit code sent to <span className="font-medium text-white">{contact}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white/90 mb-1.5">
            Verification Code
          </label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="123456"
            className="w-full h-14 px-4 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/20 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-center text-3xl tracking-[0.5em] font-mono"
            required
            autoFocus
          />
        </div>

        <button
          type="submit"
          disabled={loading || otp.length < 6}
          className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
              Verifying...
            </>
          ) : (
            'Verify Code'
          )}
        </button>

        <div className="text-center pt-2">
          <p className="text-sm text-white/60">
            Didn't receive code?{' '}
            <button
              type="button"
              onClick={handleResend}
              disabled={timeLeft > 0 || loading}
              className="text-blue-400 hover:text-blue-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {timeLeft > 0 ? `Resend in ${timeLeft}s` : 'Resend'}
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};
