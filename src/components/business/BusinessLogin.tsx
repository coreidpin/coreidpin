import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent } from '../ui/card';
import { Loader2, Briefcase, Mail, ArrowRight, ArrowLeft, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../utils/supabase/client';

type LoginStep = 'email' | 'otp';

export function BusinessLogin() {
  const navigate = useNavigate();
  const [step, setStep] = useState<LoginStep>('email');
  const [isLoading, setIsLoading] = useState(false);
  
  // Form data
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loginToken, setLoginToken] = useState('');
  
  // Errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleSendOTP = async () => {
    if (!email.trim()) {
      setErrors({ email: 'Email is required' });
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    
    try {
      // Send login OTP via Edge Function
      const { data, error } = await supabase.functions.invoke('auth-otp/request', {
        body: {
          contact: email,
          contact_type: 'email'
        }
      });

      if (error) throw error;

      if (data?.status === 'ok') {
        setStep('otp');
        toast.success('Verification code sent to your email');
      } else {
        throw new Error(data?.error || 'Failed to send verification code');
      }
    } catch (error: any) {
      console.error('Send OTP error:', error);
      if (error.message?.includes('not found')) {
        setErrors({ email: 'No account found with this email' });
      } else {
        toast.error(error.message || 'Failed to send verification code');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setErrors({ otp: 'Please enter a valid 6-digit code' });
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    
    try {
      // Verify OTP and login
      const { data, error } = await supabase.functions.invoke('auth-otp/verify', {
        body: {
          contact: email,
          otp: otp,
          create_account: false
        }
      });

      if (error) throw error;

      if (data?.access_token) {
        // Set session
        await supabase.auth.setSession({
          access_token: data.access_token,
          refresh_token: data.access_token
        });
        
        toast.success('Login successful!');
        
        // Redirect to employer dashboard
        navigate('/dashboard');
      } else {
        throw new Error('Login failed');
      }
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      setErrors({ otp: error.message || 'Invalid verification code' });
      toast.error(error.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setOtp('');
    setErrors({});
    await handleSendOTP();
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  return (
    // Dark theme to match professional pages
    <div 
      className="min-h-screen bg-[#0a0b0d] text-white flex items-center justify-center p-4"
      style={{ backgroundColor: '#0a0b0d', minHeight: '100vh' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-400 mb-4">
            <Briefcase className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {step === 'email' && 'Business Login'}
            {step === 'otp' && 'Verify Your Email'}
          </h1>
          <p className="text-white/60">
            {step === 'email' && 'Access your employer dashboard'}
            {step === 'otp' && `We sent a code to ${email}`}
          </p>
        </div>

        <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl">
          <CardContent className="p-8">
            <AnimatePresence mode="wait">
              {/* Step 1: Email Input */}
              {step === 'email' && (
                <motion.div
                  key="email"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <div>
                    <Label htmlFor="email" className="text-white/80 mb-2 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Work Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, handleSendOTP)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-12"
                      disabled={isLoading}
                      autoFocus
                    />
                    {errors.email && (
                      <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>

                  <Button
                    onClick={handleSendOTP}
                    disabled={isLoading}
                    className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-medium mt-6"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Sending code...
                      </>
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </>
                    )}
                  </Button>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-2 bg-transparent text-white/40">
                        DON'T HAVE AN ACCOUNT?
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={() => navigate('/business/register')}
                    variant="outline"
                    className="w-full h-11 border-white/20 text-white hover:bg-white/10"
                  >
                    Create Business Account
                  </Button>

                  <p className="text-center text-white/40 text-xs mt-4">
                    Looking for professional access?{' '}
                    <button
                      onClick={() => navigate('/login')}
                      className="text-blue-400 hover:text-blue-300 underline"
                    >
                      Sign in here
                    </button>
                  </p>
                </motion.div>
              )}

              {/* Step 2: OTP Verification */}
              {step === 'otp' && (
                <motion.div
                  key="otp"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/10 text-purple-400 mb-4">
                      <Mail className="h-8 w-8" />
                    </div>
                    <p className="text-white/60 text-sm">
                      Enter the 6-digit code we sent to<br />
                      <span className="text-white font-medium">{email}</span>
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="otp" className="text-white/80 mb-2">
                      Verification Code
                    </Label>
                    <Input
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      onKeyPress={(e) => handleKeyPress(e, handleVerifyOTP)}
                      className="bg-white/10 border-white/20 text-white text-center text-2xl tracking-widest placeholder:text-white/40"
                      disabled={isLoading}
                      autoFocus
                    />
                    {errors.otp && (
                      <p className="text-red-400 text-sm mt-1">{errors.otp}</p>
                    )}
                  </div>

                  <Button
                    onClick={handleVerifyOTP}
                    disabled={isLoading || otp.length !== 6}
                    className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-medium"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <LogIn className="h-5 w-5 mr-2" />
                        Sign In
                      </>
                    )}
                  </Button>

                  <div className="flex items-center justify-between text-sm mt-4">
                    <button
                      onClick={() => {
                        setStep('email');
                        setOtp('');
                        setErrors({});
                      }}
                      className="text-white/60 hover:text-white flex items-center gap-1"
                      disabled={isLoading}
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </button>
                    <button
                      onClick={handleResendOTP}
                      className="text-purple-400 hover:text-purple-300"
                      disabled={isLoading}
                    >
                      Resend code
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        <p className="text-center text-white/30 text-xs mt-6 px-4">
          Secured with email verification
        </p>
      </motion.div>
    </div>
  );
}
