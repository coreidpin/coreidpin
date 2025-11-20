import React, { useState } from 'react';
import { api } from '../../utils/api';
import { toast } from 'sonner';

interface PINVerifyFormProps {
  regToken: string;
  onSuccess: (accessToken: string, user: any) => void;
  onForgotPin: () => void;
}

export const PINVerifyForm: React.FC<PINVerifyFormProps> = ({ regToken, onSuccess, onForgotPin }) => {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (pin.length < 4) {
        throw new Error('Please enter your PIN');
      }

      const response = await api.verifyPIN(regToken, pin);
      toast.success('Welcome back!');
      onSuccess(response.access_token, response.user);
    } catch (error: any) {
      console.error('PIN Verify Error:', error);
      toast.error(error.message || 'Invalid PIN');
      setPin(''); // Clear PIN on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2 text-white">
          Enter your PIN
        </h2>
        <p className="text-sm text-white/70">
          Please enter your security PIN to continue.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            placeholder="Enter PIN"
            className="w-full h-14 px-4 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/20 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-center text-3xl tracking-[0.5em] font-mono"
            required
            autoFocus
          />
        </div>

        <button
          type="submit"
          disabled={loading || pin.length < 4}
          className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
              Verifying...
            </>
          ) : (
            'Unlock'
          )}
        </button>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={onForgotPin}
            className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            Forgot PIN?
          </button>
        </div>
      </form>
    </div>
  );
};
