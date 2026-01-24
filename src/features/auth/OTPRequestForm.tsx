import React, { useState } from 'react';
import { api } from '../../utils/api';
import { toast } from 'sonner';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { colors } from '../../styles/designSystem';

interface OTPRequestFormProps {
  onSuccess: (contact: string, contactType: 'phone' | 'email') => void;
}

export const OTPRequestForm: React.FC<OTPRequestFormProps> = ({ onSuccess }) => {
  const [contact, setContact] = useState('');
  const [contactType, setContactType] = useState<'phone' | 'email'>('email');
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
      if (error.message?.includes('Account not found')) {
        toast.error('Account does not exist. Please create an account first.');
      } else {
        toast.error(error.message || 'Failed to send OTP');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-left mb-6">
        <h2 className="text-2xl font-semibold mb-2 text-white">
          Verify Identity
        </h2>
        <p className="text-sm" style={{ color: '#9ca3af' }}>
          We'll send you a one-time code to verify your identity.
        </p>
      </div>

      <Tabs defaultValue="email" value={contactType} onValueChange={(v) => setContactType(v as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/5 border border-white/10">
          <TabsTrigger value="email" className="data-[state=active]:bg-white/10 data-[state=active]:text-white" style={{ color: contactType === 'email' ? 'white' : '#94a3b8' }}>
            Email
          </TabsTrigger>
          <TabsTrigger 
            value="phone"
            className="group flex items-center justify-center gap-2 cursor-not-allowed"
            onClick={(e) => e.preventDefault()}
            style={{ pointerEvents: 'none', color: '#64748b' }}
          >
            <span style={{ color: '#64748b', fontWeight: 500 }}>Phone</span>
            <span className="flex items-center justify-center px-2 py-0.5 bg-amber-500/20 text-amber-100 text-[8px] font-bold tracking-[0.2em] rounded-full shadow-[0_0_8px_-2px_rgba(245,158,11,0.5)]">
              SOON
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="email" className="mt-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#d1d5db' }}>
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full h-11 px-4 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/60 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all"
                  required
                  autoFocus
                />
                <AnimatePresence>
                  {contact.includes('@') && contact.includes('.') && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-indigo-500/20"
              style={{ backgroundColor: colors.brand.primary[600] }}
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
          </form>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};
