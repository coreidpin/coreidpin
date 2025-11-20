import React, { useState } from 'react';
import { api } from '../../utils/api';
import { toast } from 'sonner';

interface OTPRequestFormProps {
  onSuccess: (contact: string, contactType: 'phone' | 'email') => void;
}

export const OTPRequestForm: React.FC<OTPRequestFormProps> = ({ onSuccess }) => {
  const [contact, setContact] = useState('');
  const [contactType, setContactType] = useState<'phone' | 'email'>('phone');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Basic validation
      const normalizedContact = contact.trim().toLowerCase();
      if (normalizedContact.length < 5) {
        throw new Error('Please enter a valid contact');
      }

      await api.requestOTP(normalizedContact, contactType);
      toast.success('OTP sent successfully');
      onSuccess(contact, contactType);
    } catch (error: any) {
      console.error('OTP Request Error:', error);
      toast.error(error.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2 text-white">
          {contactType === 'phone' ? 'Enter your phone' : 'Enter your email'}
        </h2>
        <p className="text-sm text-white/70">
          We'll send you a one-time code to verify your identity.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white/90 mb-1.5">
            {contactType === 'phone' ? 'Phone Number' : 'Email Address'}
          </label>
          <input
            type={contactType === 'phone' ? 'tel' : 'email'}
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder={contactType === 'phone' ? '+234 800 000 0000' : 'you@example.com'}
            className="w-full h-11 px-4 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
              Sending...
            </>
          ) : (
            'Send Code'
          )}
        </button>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => {
              setContactType(contactType === 'phone' ? 'email' : 'phone');
              setContact('');
            }}
            className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            Use {contactType === 'phone' ? 'email' : 'phone number'} instead
          </button>
        </div>
      </form>
    </div>
  );
};
