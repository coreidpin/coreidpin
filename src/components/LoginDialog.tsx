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
  Sparkles,
  User,
  MapPin,
  Briefcase
} from 'lucide-react';
import { supabase } from '../utils/supabase/client';
import { api } from '../utils/api';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import RegistrationFlow from './RegistrationFlow';

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
  const [email, setEmail] = useState(''); // login-only
  const [password, setPassword] = useState(''); // login-only
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedUserType, setSelectedUserType] = useState<'employer' | 'professional' | 'university'>(defaultUserType);

  // Signup form data to mirror OnboardingFlow exactly
  const [formData, setFormData] = useState<any>({
    // professional
    name: '',
    email: '',
    title: '',
    location: '',
    password: '',
    confirmPassword: '',
    phone: '',
    // employer
    companyName: '',
    industry: '',
    headquarters: '',
    contactEmail: '',
  });

  const updateFormData = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

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

  const handlePasswordResetRequest = async () => {
    setError('');
    if (!email) {
      setError('Please enter your email address to reset your password.');
      return;
    }
    try {
      setIsLoading(true);
      const redirectTo = `${window.location.origin}`; // App listens for PASSWORD_RECOVERY and opens reset dialog
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) throw error;
      toast.success('Password reset email sent. Check your inbox.');
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        // Validate parity with Get Started (OnboardingFlow)
        const payload = {
          entryPoint: 'signup' as const,
          userType: selectedUserType,
          data: selectedUserType === 'professional' ? {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            confirmPassword: formData.confirmPassword,
            phone: formData.phone,
            title: formData.title,
            location: formData.location,
          } : selectedUserType === 'employer' ? {
            name: formData.companyName,
            email: formData.contactEmail,
            contactEmail: formData.contactEmail,
            password: formData.password,
            confirmPassword: formData.confirmPassword,
            phone: formData.phone,
            companyName: formData.companyName,
            industry: formData.industry,
            headquarters: formData.headquarters,
          } : {}
        };

        const res = await api.validateRegistration(payload);
        if (!res.valid) {
          const firstErr = res.errors?.[0] || 'Invalid registration data';
          toast.error(firstErr);
          setIsLoading(false);
          return;
        }

        if (selectedUserType === 'university') {
          toast.error('University sign-up is coming soon. Please use Professional or Employer.');
          setIsLoading(false);
          return;
        }

        const emailToUse = selectedUserType === 'employer' ? formData.contactEmail : formData.email;
        const passwordToUse = formData.password;

        const { data, error } = await supabase.auth.signUp({
          email: emailToUse,
          password: passwordToUse,
          options: {
            data: selectedUserType === 'professional' ? {
              name: formData.name,
              userType: selectedUserType,
              title: formData.title,
              location: formData.location,
              phone: formData.phone,
            } : {
              userType: selectedUserType,
              companyName: formData.companyName,
              industry: formData.industry,
              headquarters: formData.headquarters,
              contactEmail: formData.contactEmail,
              phone: formData.phone,
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
        // Route login through secure API for rate limiting & history
        try {
          const result = await api.loginSecure({ email, password });
          const accessToken = result.accessToken;
          const refreshToken = result.refreshToken;

          if (!accessToken || !refreshToken || !result.user) {
            throw new Error('Login failed: invalid response');
          }

          // Persist session in Supabase client
          await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });

          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('userId', result.user.id);
          localStorage.setItem('userType', result.user.user_metadata?.userType || 'professional');

          toast.success('You have successfully logged in');
          onLoginSuccess(
            result.user.user_metadata?.userType || 'professional',
            result.user
          );
          if (onOpenChange) onOpenChange(false);
        } catch (apiErr: any) {
          // Fallback to direct Supabase auth when server function is unavailable
          const msg = (apiErr?.message || '').toLowerCase();
          const serviceDown = /503|fetch|network|temporarily unavailable|service unavailable/.test(msg);
          const tooMany = /too many login attempts/i.test(apiErr?.message || '');
          const csrfMissing = /csrf token/i.test(apiErr?.message || '');
          if (tooMany) {
            throw new Error('Too many login attempts. Please wait a few minutes and retry.');
          }
          if (csrfMissing) {
            throw new Error('Security check failed. Please refresh the page and try again.');
          }
          if (!serviceDown) {
            // Re-throw non-service errors to be handled by outer catch
            throw apiErr;
          }

          const { data, error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) {
            const sanitized = /confirm/i.test(error.message)
              ? 'Email not verified. Please check your inbox.'
              : /invalid|credential/i.test(error.message)
              ? 'Invalid email or password'
              : 'Login failed';
            throw new Error(sanitized);
          }
          const session = data?.session;
          if (!session?.access_token || !session?.refresh_token || !data?.user) {
            throw new Error('Login failed: invalid response');
          }
          await supabase.auth.setSession({ access_token: session.access_token, refresh_token: session.refresh_token });
          localStorage.setItem('accessToken', session.access_token);
          localStorage.setItem('userId', data.user.id);
          localStorage.setItem('userType', data.user.user_metadata?.userType || 'professional');
          toast.success('You have successfully logged in');
          onLoginSuccess(
            data.user.user_metadata?.userType || 'professional',
            data.user
          );
          if (onOpenChange) onOpenChange(false);
        }
      }
    } catch (err: any) {
      setError(err.message || `${mode === 'signup' ? 'Sign up' : 'Sign in'} failed. Please try again.`);
      // Clear password field but retain email on failure
      setPassword('');
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
    // {
    //   value: 'university' as const,
    //   label: 'University',
    //   icon: GraduationCap,
    //   description: 'Issue verified credentials',
    //   features: ['Issue certificates', 'Verify students', 'Alumni network'],
    //   color: '#32f08c'
    // }
  ];

  const content = (
    <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden">
      <AnimatePresence mode="wait">
        {mode === 'select' && (
          <motion.div
            key="select"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-6"
          >
            <DialogHeader className="space-y-3 mb-6">
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
                style={{ backgroundColor: 'rgba(123, 184, 255, 0.1)' }}
              >
                <Fingerprint className="h-7 w-7" style={{ color: '#7bb8ff' }} />
              </div>
              <DialogTitle className="text-center text-3xl">
                Join <span style={{ color: '#7bb8ff' }}>PIN</span>
              </DialogTitle>
              <p className="text-center text-gray-600">
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
                    className={`w-full p-5 rounded-2xl border-2 text-left transition-all ${
                      isSelected
                        ? 'shadow-lg'
                        : 'hover:shadow-md'
                    }`}
                    style={{
                      borderColor: isSelected ? type.color : '#e5e7eb',
                      backgroundColor: isSelected ? `${type.color}10` : 'white'
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${type.color}20` }}
                      >
                        <TypeIcon className="h-6 w-6" style={{ color: type.color }} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{type.label}</h4>
                          {isSelected && (
                            <CheckCircle className="h-4 w-4" style={{ color: type.color }} />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{type.description}</p>
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
              
              <div className="text-center text-sm text-gray-600">
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
            className="p-6"
          >
            <DialogHeader className="space-y-3 mb-6">
              <button
                onClick={() => setMode('select')}
                className="text-sm text-gray-600 hover:text-gray-900 text-left flex items-center gap-1"
              >
                ← Back
              </button>
              <DialogTitle className="text-2xl">
                {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
              </DialogTitle>
              <p className="text-gray-600">
                {mode === 'signup' 
                  ? `Sign up as a ${userTypes.find(t => t.value === selectedUserType)?.label.toLowerCase()}`
                  : 'Sign in to your PIN account'}
              </p>
            </DialogHeader>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3"
              >
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </motion.div>
            )}
            {/* Scroll container to keep content within modal bounds */}
            <div className="overflow-y-auto overscroll-contain max-h-[75vh] pr-1">
              {mode === 'login' && (
                <form onSubmit={handleEmailSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-11 pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-11 pl-10 pr-10"
                        aria-invalid={!!error}
                        aria-describedby={error ? 'auth-error' : undefined}
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
                    <div className="mt-1 text-right">
                      <button
                        type="button"
                        onClick={handlePasswordResetRequest}
                        className="text-sm font-medium hover:underline"
                        style={{ color: '#7bb8ff' }}
                        aria-label="Forgot password? Request a reset email"
                      >
                        Forgot your password?
                      </button>
                    </div>
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
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </>
                    )}
                  </Button>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-2 bg-surface text-muted-foreground">OR</span>
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

                  <div className="mt-6 text-center text-sm text-gray-600">
                    Don't have an account?{' '}
                    <button
                      onClick={() => setMode('signup')}
                      className="font-semibold hover:underline"
                      style={{ color: '#7bb8ff' }}
                    >
                      Sign up
                    </button>
                  </div>
                </form>
              )}

              {mode === 'signup' && (
                <div className="space-y-6">
                  {selectedUserType === 'professional' ? (
                    <RegistrationFlow
                      userType="professional"
                      origin="modal"
                      onComplete={(userData) => {
                        onLoginSuccess('professional', userData);
                        onOpenChange?.(false);
                      }}
                      onBack={() => setMode('select')}
                    />
                  ) : (
                    <form onSubmit={handleEmailSignIn} className="space-y-4">
                      {selectedUserType === 'employer' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="company-name">Company Name *</Label>
                            <Input 
                              id="company-name" 
                              placeholder="Your Company Ltd."
                              value={formData.companyName || ''}
                              onChange={(e) => updateFormData('companyName', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="industry">Industry *</Label>
                            <Select value={formData.industry || ''} onValueChange={(value) => updateFormData('industry', value)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select industry..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="technology">Technology</SelectItem>
                                <SelectItem value="finance">Finance</SelectItem>
                                <SelectItem value="healthcare">Healthcare</SelectItem>
                                <SelectItem value="education">Education</SelectItem>
                                <SelectItem value="retail">Retail</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="location">Headquarters Location *</Label>
                            <Input 
                              id="location" 
                              placeholder="City, Country"
                              value={formData.headquarters || ''}
                              onChange={(e) => updateFormData('headquarters', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="contact-email">Contact Email *</Label>
                            <Input 
                              id="contact-email" 
                              type="email"
                              placeholder="hr@yourcompany.com"
                              value={formData.contactEmail || ''}
                              onChange={(e) => updateFormData('contactEmail', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                      )}

                      {selectedUserType === 'university' && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="name">University Name *</Label>
                              <Input id="name" placeholder="Your University" value={formData.name || ''} onChange={(e) => updateFormData('name', e.target.value)} />
                            </div>
                            <div>
                              <Label htmlFor="email">Contact Email *</Label>
                              <Input id="email" type="email" placeholder="contact@university.edu" value={formData.email || ''} onChange={(e) => updateFormData('email', e.target.value)} />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="password">Password *</Label>
                              <Input id="password" type="password" placeholder="••••••••" value={formData.password || ''} onChange={(e) => updateFormData('password', e.target.value)} />
                            </div>
                            <div>
                              <Label htmlFor="confirmPassword">Confirm Password *</Label>
                              <Input id="confirmPassword" type="password" placeholder="••••••••" value={formData.confirmPassword || ''} onChange={(e) => updateFormData('confirmPassword', e.target.value)} />
                            </div>
                          </div>
                        </div>
                      )}

                      <Button type="submit" className="w-full h-12 text-base" disabled={isLoading} style={{ backgroundColor: '#7bb8ff', color: 'white' }}>
                        {isLoading ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            Continue
                            <ArrowRight className="h-5 w-5 ml-2" />
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </div>
              )}
            </div>
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
