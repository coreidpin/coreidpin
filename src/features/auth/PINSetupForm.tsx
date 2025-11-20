import React, { useState } from 'react';
import { api } from '../../utils/api';
import { toast } from 'sonner';

interface PINSetupFormProps {
  regToken: string;
  onSuccess: (accessToken: string, user: any) => void;
}

export const PINSetupForm: React.FC<PINSetupFormProps> = ({ regToken, onSuccess }) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (pin.length < 4) {
        throw new Error('PIN must be at least 4 digits');
      }
      if (pin !== confirmPin) {
        throw new Error('PINs do not match');
      }

      const response = await api.setupPIN(regToken, pin);
      toast.success('PIN set successfully');
      onSuccess(response.access_token, response.user);
    } catch (error: any) {
      console.error('PIN Setup Error:', error);
      toast.error(error.message || 'Failed to set PIN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2 text-white">
          Create your PIN
        </h2>
        <p className="text-sm text-white/70">
          Set a secure PIN to access your account without a password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white/90 mb-1.5">
            New PIN
          </label>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            placeholder="Enter 4-6 digit PIN"
            className="w-full h-11 px-4 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
            required
            minLength={4}
            maxLength={6}
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/90 mb-1.5">
            Confirm PIN
          </label>
          <input
            type="password"
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
            placeholder="Confirm PIN"
            className="w-full h-11 px-4 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
            required
            minLength={4}
            maxLength={6}
          />
        </div>

        <button
          type="submit"
          disabled={loading || pin.length < 4 || pin !== confirmPin}
          className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
              Setting PIN...
            </>
          ) : (
            'Set PIN & Login'
          )}
        </button>
      </form>
    </div>
  );
};
