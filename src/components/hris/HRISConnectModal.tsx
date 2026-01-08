import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Loader2, Search, CheckCircle2, AlertCircle, Building2, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HRISConnectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (data: any) => void;
}

const PROVIDERS = [
  { id: 'workday', name: 'Workday', logo: 'https://logo.clearbit.com/workday.com' },
  { id: 'bamboohr', name: 'BambooHR', logo: 'https://logo.clearbit.com/bamboohr.com' },
  { id: 'adp', name: 'ADP', logo: 'https://logo.clearbit.com/adp.com' },
  { id: 'gusto', name: 'Gusto', logo: 'https://logo.clearbit.com/gusto.com' },
  { id: 'rippling', name: 'Rippling', logo: 'https://logo.clearbit.com/rippling.com' },
  { id: 'justworks', name: 'Justworks', logo: 'https://logo.clearbit.com/justworks.com' },
];

export function HRISConnectModal({ open, onOpenChange, onSuccess }: HRISConnectModalProps) {
  const [step, setStep] = useState<'select' | 'login' | 'sync' | 'success'>('select');
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSelect = (provider: any) => {
    setSelectedProvider(provider);
    setStep('login');
  };

  const handleLogin = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setStep('sync');
      startSync();
    }, 1500);
  };

  const startSync = async () => {
    // Simulate Syncing Data
    setTimeout(() => {
      setStep('success');
      // Mock Public Token from Finch Link
      onSuccess({
        publicToken: 'mock-public-token-' + selectedProvider.id,
        providerId: selectedProvider.id
      });
    }, 2000);
  };

  const reset = () => {
    setStep('select');
    setSelectedProvider(null);
    setUsername('');
    setPassword('');
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!val) reset();
      onOpenChange(val);
    }}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden bg-white">
        <div className="bg-slate-50 border-b px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="bg-blue-600 p-1.5 rounded-lg">
                    <Building2 className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold text-slate-800">Connect Work</span>
            </div>
            {selectedProvider && step !== 'success' && (
                <Button variant="ghost" size="sm" onClick={() => setStep('select')} className="h-8 text-xs">
                    Change
                </Button>
            )}
        </div>

        <div className="p-6 h-[400px]">
          <AnimatePresence mode="wait">
            {step === 'select' && (
              <motion.div 
                key="select"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4 h-full flex flex-col"
              >
                <div className="text-center mb-2">
                  <h3 className="font-bold text-lg mb-1">Select your Payroll Provider</h3>
                  <p className="text-sm text-slate-500">We'll verify your employment history automatically.</p>
                </div>
                
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input placeholder="Search providers..." className="pl-9 bg-slate-50 border-slate-200" />
                </div>

                <div className="grid grid-cols-2 gap-3 overflow-y-auto pr-1 flex-1">
                  {PROVIDERS.map(p => (
                    <button
                      key={p.id}
                      onClick={() => handleSelect(p)}
                      className="flex flex-col items-center justify-center p-4 border rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all gap-3 group"
                    >
                      <img src={p.logo} alt={p.name} className="h-10 w-10 object-contain grayscale group-hover:grayscale-0 transition-all opacity-80 group-hover:opacity-100" 
                           onError={(e) => (e.currentTarget.style.display = 'none')} 
                      />
                      <span className="font-medium text-sm text-slate-700 group-hover:text-blue-700">{p.name}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 'login' && (
              <motion.div 
                key="login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 flex flex-col h-full"
              >
                 <div className="text-center">
                    <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3 border">
                        <img src={selectedProvider.logo} className="h-8 w-auto" />
                    </div>
                    <h3 className="font-bold text-lg">Log in to {selectedProvider.name}</h3>
                    <p className="text-sm text-slate-500">Enter your credentials to connect.</p>
                 </div>

                 <div className="space-y-4 flex-1">
                    <div className="space-y-2">
                        <Label>Username / Email</Label>
                        <Input value={username} onChange={e => setUsername(e.target.value)} disabled={loading} />
                    </div>
                    <div className="space-y-2">
                        <Label>Password</Label>
                        <Input type="password" value={password} onChange={e => setPassword(e.target.value)} disabled={loading} />
                    </div>
                 </div>

                 <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleLogin} disabled={loading || !username || !password}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {loading ? 'Connecting...' : 'Connect & Verify'}
                 </Button>
              </motion.div>
            )}

            {step === 'sync' && (
                <motion.div 
                    key="sync"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex flex-col items-center justify-center text-center space-y-6"
                >
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping" />
                        <div className="bg-white p-4 rounded-full border-2 border-blue-500 relative z-10">
                             <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-2">Verifying Employment...</h3>
                        <p className="text-sm text-slate-500 max-w-[250px] mx-auto">
                            We are securely fetching your verified work history from {selectedProvider?.name}.
                        </p>
                    </div>
                </motion.div>
            )}

            {step === 'success' && (
                <motion.div 
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="h-full flex flex-col items-center justify-center text-center space-y-6"
                >
                    <div className="bg-green-100 p-4 rounded-full">
                         <CheckCircle2 className="h-12 w-12 text-green-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-xl mb-2 text-green-700">Verification Complete!</h3>
                        <p className="text-sm text-slate-500 max-w-[250px] mx-auto mb-6">
                            We successfully verified your employment at <strong>{selectedProvider?.name === 'ADP' ? 'Acme Corp' : 'Tech Giant Inc'}</strong>.
                        </p>
                        <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => onOpenChange(false)}>
                            Done
                        </Button>
                    </div>
                </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="bg-slate-50 border-t px-6 py-3 text-center">
            <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
                <Shield className="h-3 w-3" />
                Secure connection via Finch
            </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
