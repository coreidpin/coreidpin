import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Lock, Shield, AlertTriangle, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { supabase } from '../../utils/supabase/client';

interface AdminLoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoginSuccess: () => void;
}

export function AdminLoginDialog({ open, onOpenChange, onLoginSuccess }: AdminLoginDialogProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Sign in with Supabase
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      if (!data.user) {
        throw new Error('No user returned from sign in');
      }

      // Check if user is an admin
      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('role')
        .eq('user_id', data.user.id)
        .single();

      if (adminError || !adminUser) {
        // User is not an admin, sign them out
        await supabase.auth.signOut();
        throw new Error('You do not have admin access. Please contact an administrator.');
      }

      // Success - Supabase manages the session automatically
      onLoginSuccess();
      onOpenChange(false);
      setEmail('');
      setPassword('');
    } catch (err: any) {
      console.error('Admin login error:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setPassword('');
    setError('');
    setShowPassword(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-white border-gray-200 shadow-xl p-0 overflow-hidden gap-0">
        <div className="p-6 sm:p-8">
          <DialogHeader>
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center ring-1 ring-black/5" style={{ background: 'linear-gradient(135deg, rgba(191, 165, 255, 0.2), rgba(123, 184, 255, 0.2))' }}>
                <Shield className="h-8 w-8" style={{ color: '#bfa5ff' }} />
              </div>
            </div>
            <DialogTitle className="text-center text-2xl font-bold text-gray-900">Admin Access</DialogTitle>
            <DialogDescription className="text-center text-gray-500 mt-2">
              Enter your credentials to access the dashboard
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-8">
            {error && (
              <Alert variant="destructive" className="bg-red-50 border-red-100 text-red-900">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="admin-email" className="text-sm font-medium text-gray-700">Email Address</Label>
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="admin@nwanne.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="username"
                  className="h-11 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-[#bfa5ff] focus:ring-[#bfa5ff] focus:ring-1 transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-password" className="text-sm font-medium text-gray-700">Password</Label>
                <div className="relative">
                  <Input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="h-11 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-[#bfa5ff] focus:ring-[#bfa5ff] focus:ring-1 pr-10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex gap-3">
                <div className="mt-0.5 p-1 bg-white rounded-md border border-gray-100 shadow-sm h-fit">
                  <Lock className="h-3.5 w-3.5 text-gray-500" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-semibold text-gray-900">Demo Credentials</p>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <span className="w-16">Email:</span>
                      <code className="bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-800 font-mono">admin@nwanne.com</code>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <span className="w-16">Password:</span>
                      <code className="bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-800 font-mono">NwanneAdmin2025!</code>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1 h-11 border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-medium bg-white"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 h-11 text-black border-0 font-medium shadow-lg shadow-blue-500/20 transition-all duration-200"
                style={{ background: 'linear-gradient(to right, #bfa5ff, #7bb8ff)' }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="mr-2"
                    >
                      <Loader2 className="h-4 w-4" />
                    </motion.div>
                    Authenticating...
                  </>
                ) : (
                  <>
                    Sign In <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
        
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
          <p className="text-xs text-center text-gray-500 flex items-center justify-center gap-2">
            <Shield className="h-3 w-3" />
            Secure admin environment. Activity is monitored.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
