import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Loader2, Briefcase, Mail, User, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../utils/supabase/client';

type RegistrationStep = 'details' | 'otp' | 'success';

const BUSINESS_ROLES = [
  'Founder',
  'CEO',
  'HR Lead',
  'HR Manager',
  'Recruiter',
  'Talent Acquisition',
  'Operations Manager',
  'Developer',
  'Other'
];

export function BusinessRegistration() {
  const navigate = useNavigate();
  const [step, setStep] = useState<RegistrationStep>('details');
  const [isLoading, setIsLoading] = useState(false);
  
  // Form data
  const [fullName, setFullName] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [role, setRole] = useState('');
  const [otp, setOtp] = useState('');
  const [registrationToken, setRegistrationToken] = useState('');
  
  // Errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateDetailsStep = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    
    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!workEmail.trim()) {
      newErrors.workEmail = 'Work email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(workEmail)) {
      newErrors.workEmail = 'Please enter a valid email address';
    }
    
    if (!role) {
      newErrors.role = 'Please select your role';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOTP = async () => {
    if (!validateDetailsStep()) return;
    
    setIsLoading(true);
    setErrors({});
    
    try {
      // Send registration OTP via Edge Function
      const { data, error } = await supabase.functions.invoke('auth-otp', {
        body: {
          contact: workEmail,
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
      toast.error(error.message || 'Failed to send verification code');
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
      // Verify OTP and create account
      const { data, error } = await supabase.functions.invoke('auth-otp/verify', {
        body: {
          contact: workEmail,
          otp: otp,
          name: fullName,
          email: workEmail,
          create_account: true
        }
      });

      if (error) throw error;

      if (data?.access_token) {
        // Set session with JWT
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: data.access_token,
          refresh_token: data.access_token
        });

        if (sessionError) throw sessionError;

        // Create business profile
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('business_profiles').insert({
            user_id: user.id,
            company_name: fullName,
            use_case: 'recruiting'
          });

          // Update user metadata
          await supabase.auth.updateUser({
            data: { user_type: 'employer', role: role }
          });
        }
        
        setStep('success');
        toast.success('Account created successfully!');
        
        // Redirect to employer dashboard after 2 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        throw new Error(data?.error || 'Verification failed');
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
            {step === 'details' && 'Create Business Account'}
            {step === 'otp' && 'Verify Your Email'}
            {step === 'success' && 'Welcome to GidiPIN!'}
          </h1>
          <p className="text-white/60">
            {step === 'details' && 'Start hiring verified talent today'}
            {step === 'otp' && `We sent a code to ${workEmail}`}
            {step === 'success' && 'Your account is ready'}
          </p>
        </div>

        <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl">
          <CardContent className="p-8">
            <AnimatePresence mode="wait">
              {/* Step 1: Business Details */}
              {step === 'details' && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  {/* Full Name */}
                  <div>
                    <Label htmlFor="fullName" className="text-white/80 mb-2 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Full Name
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                      disabled={isLoading}
                    />
                    {errors.fullName && (
                      <p className="text-red-400 text-sm mt-1">{errors.fullName}</p>
                    )}
                  </div>

                  {/* Work Email */}
                  <div>
                    <Label htmlFor="workEmail" className="text-white/80 mb-2 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Work Email
                    </Label>
                    <Input
                      id="workEmail"
                      type="email"
                      placeholder="john@company.com"
                      value={workEmail}
                      onChange={(e) => setWorkEmail(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                      disabled={isLoading}
                    />
                    {errors.workEmail && (
                      <p className="text-red-400 text-sm mt-1">{errors.workEmail}</p>
                    )}
                    <p className="text-white/40 text-xs mt-1">
                      This will be your login email
                    </p>
                  </div>

                  {/* Role */}
                  <div>
                    <Label htmlFor="role" className="text-white/80 mb-2 flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Your Role
                    </Label>
                    <Select value={role} onValueChange={setRole} disabled={isLoading}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-white/20">
                        {BUSINESS_ROLES.map((r) => (
                          <SelectItem key={r} value={r} className="text-white hover:bg-white/10">
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.role && (
                      <p className="text-red-400 text-sm mt-1">{errors.role}</p>
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

                  <p className="text-center text-white/40 text-xs mt-4">
                    Already have an account?{' '}
                    <button
                      onClick={() => navigate('/business/login')}
                      className="text-purple-400 hover:text-purple-300 underline"
                    >
                      Sign in
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
                      <span className="text-white font-medium">{workEmail}</span>
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
                      'Verify & Create Account'
                    )}
                  </Button>

                  <div className="flex items-center justify-between text-sm mt-4">
                    <button
                      onClick={() => setStep('details')}
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

              {/* Step 3: Success */}
              {step === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 text-green-400 mb-6">
                    <CheckCircle2 className="h-10 w-10" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Account Created!
                  </h2>
                  <p className="text-white/60 mb-6">
                    Redirecting to your dashboard...
                  </p>
                  <div className="flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        <p className="text-center text-white/30 text-xs mt-6 px-4">
          By creating an account, you agree to our{' '}
          <a href="/terms" className="underline hover:text-white/50">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="underline hover:text-white/50">
            Privacy Policy
          </a>
        </p>
      </motion.div>
    </div>
  );
}
