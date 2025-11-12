import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { toast } from 'sonner';
import { api } from '../utils/api';
import { supabase } from '../utils/supabase/client';
import { EmailVerificationGate } from './EmailVerificationGate';
import '../styles/auth-dark.css';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Users,
  Mail,
  MapPin,
  Lock,
  Briefcase,
  Building,
  School,
  FileText,
  CheckCircle,
  Shield,
  Brain,
  BadgeCheck,
  X,
  Plus
} from 'lucide-react';

type YearsOfExperience = '1-5' | '5-10' | '10+';
type Seniority = 'Entry' | 'Mid' | 'Senior' | 'Lead' | 'Manager' | 'Director' | 'VP' | 'C-Level';
type EducationLevel = 'High School' | 'Associate' | 'Bachelor' | 'Master' | 'PhD' | 'Bootcamp' | 'Self-taught';

interface RegistrationFlowProps {
  userType?: 'professional';
  origin?: 'modal' | 'onboarding';
  onComplete?: (userData?: any) => void;
  onBack?: () => void;
}

interface RegistrationData {
  // Step 1
  name?: string;
  title?: string;
  email?: string;
  location?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
  // Step 2
  yearsOfExperience?: YearsOfExperience;
  currentCompany?: string;
  seniority?: Seniority;
  // Step 3
  topSkills?: string[];
  highestEducation?: EducationLevel;
  resumeFileName?: string;
  // Step 4
  verifyAI?: boolean;
  verifyEmail?: boolean;
  verifyPeers?: boolean;
  verifySMS?: boolean;
}

const SUGGESTED_COMPANIES = [
  'Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix', 'OpenAI', 'Stripe', 'Shopify', 'NVIDIA', 'Oracle', 'IBM'
];

const SUGGESTED_SKILLS = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Go', 'Rust', 'SQL', 'NoSQL', 'AWS', 'Docker', 'Kubernetes',
  'UI/UX', 'GraphQL', 'Next.js', 'Redux', 'Tailwind', 'CI/CD', 'Testing', 'Data Structures'
];

const SESSION_KEY = 'registrationFlow:professional';

function validateEmail(email?: string) {
  if (!email) return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Enter a valid email address';
  const domain = email.split('@')[1];
  const domainRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!domainRegex.test(domain)) return 'Email domain appears invalid';
  return null;
}

function validatePassword(password?: string) {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[0-9]/.test(password)) return 'Include at least one number';
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'Include at least one special character';
  return null;
}

function validatePhone(phone?: string) {
  if (!phone) return null; // optional
  const normalized = phone.replace(/[\s()-]/g, '');
  const e164 = /^\+?[1-9]\d{7,14}$/;
  if (!e164.test(normalized)) return 'Enter a valid phone with country code';
  return null;
}

export function RegistrationFlow({ userType = 'professional', origin = 'modal', onComplete, onBack }: RegistrationFlowProps) {
  const [currentStep, setCurrentStep] = useState(0); // 0..3
  const [formData, setFormData] = useState<RegistrationData>({ topSkills: [] });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [showVerificationGate, setShowVerificationGate] = useState(false);
  const [registeredUserId, setRegisteredUserId] = useState<string | null>(null);

  // Client-side retry with exponential backoff for transient failures
  async function withBackoff<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
    let attempt = 0;
    let lastError: any = null;
    while (attempt <= retries) {
      try {
        return await fn();
      } catch (err: any) {
        lastError = err;
        const isTransient = !!(err && (err.status >= 500 || err.status === 429));
        if (!isTransient || attempt === retries) break;
        const backoffMs = Math.min(500 * Math.pow(2, attempt), 3000);
        await new Promise(res => setTimeout(res, backoffMs));
        attempt++;
      }
    }
    throw lastError;
  }

  // Load persisted session state
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.formData) setFormData(parsed.formData);
        if (typeof parsed?.currentStep === 'number') setCurrentStep(parsed.currentStep);
      }
    } catch (_) {}
  }, []);

  // Persist session state on change
  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ formData, currentStep }));
    } catch (_) {}
  }, [formData, currentStep]);

  const progressValue = useMemo(() => (currentStep + 1) * 25, [currentStep]);

  const updateFormData = (field: keyof RegistrationData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSkill = (skill: string) => {
    const clean = skill.trim();
    if (!clean) return;
    setFormData(prev => ({
      ...prev,
      topSkills: Array.from(new Set([...(prev.topSkills || []), clean])).slice(0, 20)
    }));
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      topSkills: (prev.topSkills || []).filter(s => s.toLowerCase() !== skill.toLowerCase())
    }));
  };

  const validateStep = (step: number): boolean => {
    const stepErrors: Record<string, string> = {};
    if (step === 0) {
      if (!formData.name?.trim()) stepErrors.name = 'Full name is required';
      const titleVal = (formData.title || '').trim();
      if (!titleVal) {
        stepErrors.title = 'Professional Title is required';
      } else if (titleVal.length < 2 || titleVal.length > 80) {
        stepErrors.title = 'Title must be between 2 and 80 characters';
      }
      const emailErr = validateEmail(formData.email);
      if (emailErr) stepErrors.email = emailErr;
      if (!formData.location?.trim()) stepErrors.location = 'Location is required';
      const passErr = validatePassword(formData.password);
      if (passErr) stepErrors.password = passErr;
      if (!formData.confirmPassword) stepErrors.confirmPassword = 'Please confirm your password';
      if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
        stepErrors.confirmPassword = 'Passwords do not match';
      }
      const phoneErr = validatePhone(formData.phone);
      if (phoneErr) stepErrors.phone = phoneErr;
    } else if (step === 1) {
      if (!formData.yearsOfExperience) stepErrors.yearsOfExperience = 'Select years of experience';
      if (!formData.currentCompany?.trim()) stepErrors.currentCompany = 'Current company is required';
      if (!formData.seniority) stepErrors.seniority = 'Select a seniority level';
    } else if (step === 2) {
      if (!formData.topSkills || formData.topSkills.length < 3) stepErrors.topSkills = 'Add at least 3 top skills';
      if (!formData.highestEducation) stepErrors.highestEducation = 'Select your highest education';
      if (resumeFile) {
        const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
        if (!validTypes.includes(resumeFile.type)) stepErrors.resume = 'Resume must be a PDF or DOCX';
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (resumeFile.size > maxSize) stepErrors.resume = 'File must be less than 5MB';
      }
    } else if (step === 3) {
      const methods = [formData.verifyAI, formData.verifyEmail, formData.verifyPeers, formData.verifySMS].filter(Boolean).length;
      if (methods < 1) stepErrors.verification = 'Select at least one verification method';
      if (!formData.verifyEmail) stepErrors.verifyEmail = 'Email verification is required';
    }
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleContinue = async () => {
    if (!validateStep(currentStep)) return;
    setIsLoading(true);
    // For intermediate steps, keep UX snappy but indicate progress briefly
    if (currentStep < 3) {
      await new Promise(res => setTimeout(res, 500));
      setIsLoading(false);
      setCurrentStep(s => s + 1);
      return;
    }
    // Final submission
    try {
      const payload = {
        entryPoint: origin === 'onboarding' ? 'get-started' : 'signup-modal',
        userType: 'professional',
        data: {
          ...formData,
          resumeFileName: resumeFile?.name || formData.resumeFileName,
        }
      };
      const res = await withBackoff(() => api.validateRegistration(payload));
      if (!res.valid) {
        const firstErr = res.errors?.[0] || 'Invalid registration data';
        toast.error(firstErr, { description: 'Please correct the highlighted fields and try again.' });
        setIsLoading(false);
        return;
      }

      // Register via backend /server/register endpoint
      let registerResult;
      let userAlreadyExists = false;
      
      try {
        registerResult = await withBackoff(() => api.register({
          email: formData.email!,
          password: formData.password!,
          name: formData.name!,
          userType: 'professional',
          title: formData.title,
          phoneNumber: formData.phone,
          location: formData.location,
          yearsOfExperience: formData.yearsOfExperience,
          currentCompany: formData.currentCompany,
          seniority: formData.seniority,
          topSkills: formData.topSkills,
          highestEducation: formData.highestEducation,
          resumeFileName: resumeFile?.name || formData.resumeFileName,
        }));

        if (!registerResult.success) {
          throw new Error(registerResult.message || 'Registration failed');
        }
      } catch (regError: any) {
        // Check if user already exists
        const errorMsg = regError.message || '';
        if (errorMsg.includes('already been registered') || errorMsg.includes('already exists')) {
          userAlreadyExists = true;
          console.log('User already exists, proceeding to email verification');
          
          // Store email for verification
          if (formData.email) {
            localStorage.setItem('registrationEmail', formData.email);
          }
          
          toast.info('Account already exists. Please verify your email to continue.', {
            description: 'We\'ll send you a verification code.'
          });
        } else {
          // Other registration errors - re-throw
          throw regError;
        }
      }

      // Only set userId if registration was successful (new user)
      if (!userAlreadyExists && registerResult) {
        const userId = registerResult.userId;
        const userType = registerResult.userType;

        // Persist user identifiers
        localStorage.setItem('userId', userId);
        localStorage.setItem('userType', userType);
        setRegisteredUserId(userId);
      }

      // Send 6-digit verification code (for both new and existing users)
      try {
        if (formData.email) {
          await withBackoff(() => api.sendVerificationEmail(formData.email!, formData.name));
          
          if (userAlreadyExists) {
            toast.success('Verification code sent to your email.');
          } else {
            toast.success('Registration successful! Verification code sent to your email.');
          }
        }
      } catch (verifyErr: any) {
        console.error('Failed to send verification email:', verifyErr);
        const msg = (verifyErr?.message || '').toLowerCase();
        const notConfigured = /server not configured|supabase credentials|failed to store verification code/i.test(msg);
        const rateLimited = /rate limit/i.test(msg);
        if (notConfigured) {
          toast.error('PIN verification temporarily unavailable', {
            description: 'We will send a verification link instead. Please check your inbox.'
          });
          try {
            if (formData.email) {
              await withBackoff(() => api.sendVerificationLink(formData.email!));
              toast.info('Verification link sent. Please check your inbox.', { duration: 3000 });
            }
          } catch (linkErr: any) {
            console.error('Fallback link send failed:', linkErr);
          }
        } else if (rateLimited) {
          toast.error('Too many PIN requests. Please retry later.');
        } else {
          if (userAlreadyExists) {
            toast.error('Could not send verification email', {
              description: 'You can request a new code from the verification screen.'
            });
          } else {
            toast.error('Registration successful but could not send verification email', {
              description: 'You can request a new code from the verification screen.'
            });
          }
        }
      }

      // Show email verification gate for both new and existing users
      setIsLoading(false);
      setShowVerificationGate(true);
    } catch (err: any) {
      // Persist unsaved form for retry (only for non-duplicate errors)
      try {
        localStorage.setItem('pendingRegistrationData', JSON.stringify({ ...formData, resumeFileName: resumeFile?.name }));
      } catch (_) {}
      
      toast.error(err.message || 'Failed to submit registration', {
        description: 'Your data has been preserved. Please retry when connection is stable.'
      });
      setIsLoading(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) setCurrentStep(s => s - 1);
    else onBack?.();
  };

  const handleVerificationComplete = async () => {
    try {
      // Mark completion timestamp
      localStorage.setItem('registrationCompletedAt', new Date().toISOString());
      sessionStorage.removeItem(SESSION_KEY);
      
      toast.success('Email verified! Redirecting to login...', { duration: 1500 });
      
      // Redirect to login or dashboard
      setTimeout(() => {
        onComplete?.();
      }, 1500);
    } catch (err) {
      console.error('Verification complete handler error:', err);
      onComplete?.();
    }
  };

  const handleCancelVerification = () => {
    // User cancelled verification - allow them to go back or cancel entirely
    setShowVerificationGate(false);
    toast.info('You can verify your email later from the login page.');
    onComplete?.();
  };

  // Show email verification gate after successful registration
  if (showVerificationGate) {
    return (
      <div className={origin === 'modal' ? 'space-y-6' : 'auth-page-dark min-h-screen flex items-center justify-center p-4'}>
        <EmailVerificationGate
          email={formData.email}
          userId={registeredUserId || undefined}
          name={formData.name}
          onVerified={handleVerificationComplete}
          onCancel={handleCancelVerification}
        />
      </div>
    );
  }

  return (
    <div className={origin === 'modal' ? 'space-y-6' : 'auth-page-dark min-h-screen'}>
      {origin === 'onboarding' && (
        <header className="reg-header border-b sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="reg-icon-primary h-5 w-5" />
                <span className="auth-subtitle text-sm">Professional Setup</span>
              </div>
              <Badge variant="secondary" className="hidden sm:flex reg-badge">
                Quick Setup
              </Badge>
            </div>
          </div>
        </header>
      )}

      <div className={origin === 'onboarding' ? 'reg-divider border-b' : ''}>
        <div className={origin === 'onboarding' ? 'container mx-auto px-4 py-6' : ''}>
          <div className={origin === 'onboarding' ? 'max-w-2xl mx-auto space-y-4' : ''}>
            <div className="flex items-center justify-between text-sm">
              <span className="auth-title font-medium">Step {currentStep + 1} of 4</span>
              <span className="auth-subtitle">{progressValue}% Complete</span>
            </div>
            <Progress value={progressValue} className="w-full h-2 reg-progress-bg" />
            <div className="flex items-center gap-2">
              <Sparkles className="reg-icon-primary h-4 w-4" />
              <span className="auth-subtitle text-sm">
                {currentStep === 0 && 'Basic Information'}
                {currentStep === 1 && 'Professional Details'}
                {currentStep === 2 && 'Skills'}
                {currentStep === 3 && 'Verification'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <main className={origin === 'onboarding' ? 'container mx-auto px-4 py-8' : ''} aria-busy={isLoading}>
        <div className={origin === 'onboarding' ? 'max-w-2xl mx-auto' : ''}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 0 && (
                <Card className="bg-surface">
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>Enter your details to create your account.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <div className="relative">
                          <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="name" placeholder="John Doe" value={formData.name || ''} onChange={(e) => updateFormData('name', e.target.value)} className="pl-10" aria-invalid={!!errors.name} aria-describedby={errors.name ? 'name-error' : undefined} />
                        </div>
                        {errors.name && <p id="name-error" className="text-xs text-red-600 mt-1" aria-live="polite">{errors.name}</p>}
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="email" type="email" placeholder="you@example.com" value={formData.email || ''} onChange={(e) => updateFormData('email', e.target.value)} className="pl-10" aria-invalid={!!errors.email} aria-describedby={errors.email ? 'email-error' : undefined} />
                        </div>
                        {errors.email && <p id="email-error" className="text-xs text-red-600 mt-1" aria-live="polite">{errors.email}</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <Label htmlFor="title">Professional Title *</Label>
                        <div className="relative">
                          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="title" placeholder="e.g., Senior Frontend Developer" value={formData.title || ''} onChange={(e) => updateFormData('title', e.target.value)} className="pl-10" aria-invalid={!!errors.title} aria-describedby={errors.title ? 'title-error' : undefined} />
                        </div>
                        {errors.title && <p id="title-error" className="text-xs text-red-600 mt-1" aria-live="polite">{errors.title}</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="location">Location *</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="location" placeholder="City, Country" value={formData.location || ''} onChange={(e) => updateFormData('location', e.target.value)} className="pl-10" aria-invalid={!!errors.location} aria-describedby={errors.location ? 'location-error' : undefined} />
                        </div>
                        {errors.location && <p id="location-error" className="text-xs text-red-600 mt-1" aria-live="polite">{errors.location}</p>}
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" type="tel" placeholder="e.g., +234 801 234 5678" value={formData.phone || ''} onChange={(e) => updateFormData('phone', e.target.value)} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? 'phone-error' : undefined} />
                        {errors.phone && <p id="phone-error" className="text-xs text-red-600 mt-1" aria-live="polite">{errors.phone}</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="password">Password *</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="password" type="password" placeholder="••••••••" value={formData.password || ''} onChange={(e) => updateFormData('password', e.target.value)} className="pl-10" />
                        </div>
                        {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
                      </div>
                      <div>
                        <Label htmlFor="confirmPassword">Confirm Password *</Label>
                        <Input id="confirmPassword" type="password" placeholder="••••••••" value={formData.confirmPassword || ''} onChange={(e) => updateFormData('confirmPassword', e.target.value)} />
                        {errors.confirmPassword && <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {currentStep === 1 && (
                <Card className="bg-surface">
                  <CardHeader>
                    <CardTitle>Professional Details</CardTitle>
                    <CardDescription>Tell us about your experience and role.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Years of Experience *</Label>
                        <Select value={formData.yearsOfExperience || ''} onValueChange={(v) => updateFormData('yearsOfExperience', v as YearsOfExperience)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1-5">1-5</SelectItem>
                            <SelectItem value="5-10">5-10</SelectItem>
                            <SelectItem value="10+">10+</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.yearsOfExperience && <p className="text-xs text-red-600 mt-1">{errors.yearsOfExperience}</p>}
                      </div>
                      <div>
                        <Label>Seniority Level *</Label>
                        <Select value={formData.seniority || ''} onValueChange={(v) => updateFormData('seniority', v as Seniority)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Entry">Entry</SelectItem>
                            <SelectItem value="Mid">Mid</SelectItem>
                            <SelectItem value="Senior">Senior</SelectItem>
                            <SelectItem value="Lead">Lead</SelectItem>
                            <SelectItem value="Manager">Manager</SelectItem>
                            <SelectItem value="Director">Director</SelectItem>
                            <SelectItem value="VP">VP</SelectItem>
                            <SelectItem value="C-Level">C-Level</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.seniority && <p className="text-xs text-red-600 mt-1">{errors.seniority}</p>}
                      </div>
                    </div>
                    <div>
                      <Label>Current Company *</Label>
                      <Input placeholder="e.g., Stripe" value={formData.currentCompany || ''} onChange={(e) => updateFormData('currentCompany', e.target.value)} />
                      {errors.currentCompany && <p className="text-xs text-red-600 mt-1">{errors.currentCompany}</p>}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {SUGGESTED_COMPANIES.map((c) => (
                          <Badge key={c} variant="outline" className="cursor-pointer" onClick={() => updateFormData('currentCompany', c)}>
                            {c}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {currentStep === 2 && (
                <Card className="bg-surface">
                  <CardHeader>
                    <CardTitle>Skills</CardTitle>
                    <CardDescription>Add your top skills and education.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Top Skills *</Label>
                      <div className="flex gap-2">
                        <Input placeholder="e.g., React" onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const target = e.target as HTMLInputElement;
                            addSkill(target.value);
                            target.value = '';
                          }
                        }} />
                        <Button type="button" variant="secondary" onClick={() => {
                          const input = document.querySelector<HTMLInputElement>('input[placeholder="e.g., React"]');
                          if (input) { addSkill(input.value); input.value = ''; }
                        }}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {errors.topSkills && <p className="text-xs text-red-600 mt-1">{errors.topSkills}</p>}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {(formData.topSkills || []).map((skill) => (
                          <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                            {skill}
                            <button type="button" onClick={() => removeSkill(skill)} className="ml-1 text-xs">
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {SUGGESTED_SKILLS.map((s) => (
                          <Badge key={s} variant="outline" className="cursor-pointer" onClick={() => addSkill(s)}>
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Highest Education *</Label>
                        <Select value={formData.highestEducation || ''} onValueChange={(v) => updateFormData('highestEducation', v as EducationLevel)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="High School">High School</SelectItem>
                            <SelectItem value="Associate">Associate</SelectItem>
                            <SelectItem value="Bachelor">Bachelor</SelectItem>
                            <SelectItem value="Master">Master</SelectItem>
                            <SelectItem value="PhD">PhD</SelectItem>
                            <SelectItem value="Bootcamp">Bootcamp</SelectItem>
                            <SelectItem value="Self-taught">Self-taught</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.highestEducation && <p className="text-xs text-red-600 mt-1">{errors.highestEducation}</p>}
                      </div>
                      <div>
                        <Label>Resume (optional)</Label>
                        <Input type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setResumeFile(file);
                          updateFormData('resumeFileName', file?.name || '');
                        }} />
                        {errors.resume && <p className="text-xs text-red-600 mt-1">{errors.resume}</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {currentStep === 3 && (
                <Card className="bg-surface">
                  <CardHeader>
                    <CardTitle>Almost there!</CardTitle>
                    <CardDescription>Choose your verification methods. A PIN will be generated upon verification.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className={`border rounded-lg p-4 ${formData.verifyAI ? 'border-primary' : 'border-muted'}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <Brain className="h-5 w-5 text-primary" />
                          <span className="font-medium">AI Skills Analysis</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">Recommended. Analyze your skills to boost visibility.</p>
                        <div className="flex items-center gap-2">
                          <input id="verifyAI" type="checkbox" checked={!!formData.verifyAI} onChange={(e) => updateFormData('verifyAI', e.target.checked)} />
                          <Label htmlFor="verifyAI">Enable</Label>
                        </div>
                      </div>
                      <div className={`border rounded-lg p-4 ${formData.verifyEmail ? 'border-primary' : 'border-muted'}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <Mail className="h-5 w-5 text-primary" />
                          <span className="font-medium">Email Verification</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">Required to activate your account.</p>
                        <div className="flex items-center gap-2">
                          <input id="verifyEmail" type="checkbox" checked={formData.verifyEmail ?? true} onChange={(e) => updateFormData('verifyEmail', e.target.checked)} />
                          <Label htmlFor="verifyEmail">Enable</Label>
                        </div>
                      </div>
                      <div className={`border rounded-lg p-4 ${formData.verifyPeers ? 'border-primary' : 'border-muted'}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <BadgeCheck className="h-5 w-5 text-primary" />
                          <span className="font-medium">Peer Endorsements</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">Optional endorsements from colleagues.</p>
                        <div className="flex items-center gap-2">
                          <input id="verifyPeers" type="checkbox" checked={!!formData.verifyPeers} onChange={(e) => updateFormData('verifyPeers', e.target.checked)} />
                          <Label htmlFor="verifyPeers">Enable</Label>
                        </div>
                      </div>
                      <div className={`border rounded-lg p-4 ${formData.verifySMS ? 'border-primary' : 'border-muted'}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="h-5 w-5 text-primary" />
                          <span className="font-medium">SMS Verification</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">Optional. Requires a valid phone number.</p>
                        <div className="flex items-center gap-2">
                          <input id="verifySMS" type="checkbox" checked={!!formData.verifySMS} onChange={(e) => updateFormData('verifySMS', e.target.checked)} disabled={!formData.phone || !!validatePhone(formData.phone)} />
                          <Label htmlFor="verifySMS">Enable</Label>
                        </div>
                      </div>
                    </div>
                    {errors.verification && <p className="text-xs text-red-600">{errors.verification}</p>}
                    {errors.verifyEmail && <p className="text-xs text-red-600">{errors.verifyEmail}</p>}
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className={origin === 'onboarding' ? 'flex items-center justify-between mt-8' : 'flex items-center justify-between'}>
            <Button variant="outline" onClick={handlePrevious} className="min-w-[120px]">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {currentStep === 0 ? 'Back' : 'Previous'}
            </Button>

            <Button onClick={handleContinue} className="min-w-[140px]" disabled={isLoading} aria-disabled={isLoading} aria-live="polite">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" role="status" aria-label="Processing registration" />
                  <span>Loading...</span>
                </>
              ) : currentStep === 3 ? (
                'Finish'
              ) : (
                <>
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default RegistrationFlow;
