import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import {
  LogIn,
  Mail,
  Lock,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Building,
  Users,
  GraduationCap,
  Chrome,
  Fingerprint,
  Shield,
  ArrowRight,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { api } from '../utils/api';
import { supabase } from '../utils/supabase/client';
import { toast } from 'sonner@2.0.3';

interface LoginDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onLoginSuccess: (userType: 'employer' | 'professional' | 'university', userData: any) => void;
  onSignUpClick?: () => void;
  trigger?: React.ReactNode;
  defaultUserType?: 'employer' | 'professional' | 'university';
}

export function LoginDialog({ 
  open, 
  onOpenChange, 
  onLoginSuccess, 
  onSignUpClick, 
  trigger,
  defaultUserType = 'professional'
}: LoginDialogProps) {
  const [mode, setMode] = useState<'login' | 'signup' | 'select'>('select');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedUserType, setSelectedUserType] = useState<'employer' | 'professional' | 'university'>(defaultUserType);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const userType = session.user.user_metadata?.userType || 'professional';
        onLoginSuccess(userType, session.user);
        if (onOpenChange) onOpenChange(false);
      }
    };
    
    if (open) {
      checkSession();
    }
  }, [open]);

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);

    try {
      localStorage.setItem('pendingUserType', selectedUserType);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        if (error.message.includes('not enabled') || error.message.includes('provider')) {
          setError(
            'Google sign-in is not configured yet. Please use email/password to continue.'
          );
        } else {
          throw error;
        }
        setIsLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              userType: selectedUserType,
            },
          },
        });

        if (error) throw error;

        if (data.user) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            localStorage.setItem('accessToken', session.access_token);
            localStorage.setItem('userId', data.user.id);
            localStorage.setItem('userType', selectedUserType);
          }

          toast.success('🎉 Account created successfully!');
          onLoginSuccess(selectedUserType, data.user);
          if (onOpenChange) onOpenChange(false);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user && data.session) {
          localStorage.setItem('accessToken', data.session.access_token);
          localStorage.setItem('userId', data.user.id);
          localStorage.setItem('userType', data.user.user_metadata?.userType || 'professional');

          toast.success('Welcome back! 👋');
          onLoginSuccess(
            data.user.user_metadata?.userType || 'professional',
            data.user
          );
          if (onOpenChange) onOpenChange(false);
        }
      }
    } catch (err: any) {
      setError(err.message || `${mode === 'signup' ? 'Sign up' : 'Sign in'} failed. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const userTypes = [
    {
      value: 'professional' as const,
      label: 'Professional',
      icon: Users,
      description: 'Get verified, match with jobs',
      features: ['Create PIN identity', 'AI verification', 'Global opportunities'],
      color: '#7bb8ff'
    },
    {
      value: 'employer' as const,
      label: 'Employer',
      icon: Building,
      description: 'Post jobs, hire verified talent',
      features: ['Post job openings', 'Verify candidates', 'Fast hiring'],
      color: '#bfa5ff'
    },
    {
      value: 'university' as const,
      label: 'University',
      icon: GraduationCap,
      description: 'Issue verified credentials',
      features: ['Issue certificates', 'Verify students', 'Alumni network'],
      color: '#32f08c'
    }
  ];

  const content = (
    <DialogContent className="sm:max-w-[350px] max-h-[75vh] p-0 gap-0 overflow-hidden">
      <AnimatePresence mode="wait">
        {mode === 'select' && (
          <motion.div
            key="select"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-4"
          >
            <DialogHeader className="space-y-2 mb-4">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto"
                style={{ backgroundColor: 'rgba(123, 184, 255, 0.1)' }}
              >
                <Fingerprint className="h-6 w-6" style={{ color: '#7bb8ff' }} />
              </div>
              <DialogTitle className="text-center text-[1.2rem]">
                Join <span style={{ color: '#7bb8ff' }}>PIN</span>
              </DialogTitle>
              <p className="text-center text-gray-600 text-[0.9rem]">
                Choose your account type to get started
              </p>
            </DialogHeader>

            <div className="space-y-3">
              {userTypes.map((type) => {
                const TypeIcon = type.icon;
                const isSelected = selectedUserType === type.value;
                
                return (
                  <motion.button
                    key={type.value}
                    onClick={() => setSelectedUserType(type.value)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                      isSelected
                        ? 'shadow-lg'
                        : 'hover:shadow-md'
                    }`}
                    style={{
                      borderColor: isSelected ? type.color : '#e5e7eb',
                      backgroundColor: isSelected ? `${type.color}10` : 'white'
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${type.color}20` }}
                      >
                        <TypeIcon className="h-5 w-5" style={{ color: type.color }} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{type.label}</h4>
                          {isSelected && (
                            <CheckCircle className="h-4 w-4" style={{ color: type.color }} />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2 text-[0.9rem]">{type.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {type.features.map((feature, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <div className="mt-6 space-y-3">
              <Button
                onClick={() => setMode('signup')}
                className="w-full h-12 text-base"
                style={{ 
                  backgroundColor: userTypes.find(t => t.value === selectedUserType)?.color,
                  color: selectedUserType === 'university' ? '#0a0b0d' : 'white'
                }}
              >
                Continue as {userTypes.find(t => t.value === selectedUserType)?.label}
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              
              <div className="text-center text-gray-600 text-[0.9rem]">
                Already have an account?{' '}
                <button
                  onClick={() => setMode('login')}
                  className="font-semibold hover:underline"
                  style={{ color: '#7bb8ff' }}
                >
                  Sign in
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {(mode === 'login' || mode === 'signup') && (
          <motion.div
            key={mode}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-4"
          >
            <DialogHeader className="space-y-2 mb-4">
              <button
                onClick={() => setMode('select')}
                className="text-gray-600 hover:text-gray-900 text-left flex items-center gap-1 text-[0.9rem]"
              >
                ← Back
              </button>
              <DialogTitle className="text-[1.2rem]">
                {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
              </DialogTitle>
              <p className="text-gray-600 text-[0.9rem]">
                {mode === 'signup' 
                  ? `Sign up as a ${userTypes.find(t => t.value === selectedUserType)?.label.toLowerCase()}`
                  : 'Sign in to your PIN account'}
              </p>
            </DialogHeader>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3"
              >
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-800 text-[0.9rem]">{error}</p>
              </motion.div>
            )}

            <form onSubmit={handleEmailSignIn} className="space-y-3">
              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[0.9rem]">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="h-11 text-[0.9rem] placeholder:text-[0.9rem]"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[0.9rem]">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 pl-10 text-[0.9rem] placeholder:text-[0.9rem]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[0.9rem]">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 pl-10 pr-10 text-[0.9rem] placeholder:text-[0.9rem]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {mode === 'signup' && (
                  <p className="text-xs text-gray-500">
                    Must be at least 6 characters
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base"
                disabled={isLoading}
                style={{ 
                  backgroundColor: '#7bb8ff',
                  color: 'white'
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    {mode === 'signup' ? 'Creating account...' : 'Signing in...'}
                  </>
                ) : (
                  <>
                    {mode === 'signup' ? 'Create Account' : 'Sign In'}
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </>
                )}
              </Button>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-gray-500">OR</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full h-12 text-base border-2"
            >
              <Chrome className="h-5 w-5 mr-2" />
              Continue with Google
            </Button>

            <div className="mt-4 text-center text-gray-600 text-[0.9rem]">
              {mode === 'signup' ? (
                <>
                  Already have an account?{' '}
                  <button
                    onClick={() => setMode('login')}
                    className="font-semibold hover:underline"
                    style={{ color: '#7bb8ff' }}
                  >
                    Sign in
                  </button>
                </>
              ) : (
                <>
                  Don't have an account?{' '}
                  <button
                    onClick={() => setMode('signup')}
                    className="font-semibold hover:underline"
                    style={{ color: '#7bb8ff' }}
                  >
                    Sign up
                  </button>
                </>
              )}
            </div>

            {mode === 'signup' && (
              <div className="mt-4 p-3 bg-gray-50 rounded-xl border">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-gray-600">
                    <p className="font-medium mb-1">Your data is secure</p>
                    <p>We use bank-level encryption. By signing up, you agree to our Terms of Service and Privacy Policy.</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </DialogContent>
  );

  if (trigger) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <div onClick={() => onOpenChange?.(true)}>{trigger}</div>
        {content}
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {content}
    </Dialog>
  );
}
