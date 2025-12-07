import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { 
  Fingerprint, 
  Mail, 
  CheckCircle, 
  Link, 
  Upload, 
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Linkedin,
  Github,
  Globe,
  Shield,
  Award,
  Brain,
  Target,
  Camera,
  FileText,
  Code,
  Briefcase,
  ChevronRight,
  Zap,
  Lock,
  Database,
  Phone
} from 'lucide-react';
import { toast } from 'sonner';
import { PINIdentityCard, generateMockPINData } from './PINIdentityCard';
import { PhoneVerification } from './PhoneVerification';
import { api } from '../utils/api';

interface PINOnboardingProps {
  onComplete: (pinData: any) => void;
  onSkip?: () => void;
}

export function PINOnboarding({ onComplete, onSkip }: PINOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showPINReveal, setShowPINReveal] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    name: '',
    title: '',
    location: '',
    bio: '',
    category: '',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
    experiences: [] as any[],
    skills: [] as string[],
    photoUrl: ''
  });

  const steps = [
    {
      id: 'welcome',
      title: 'Welcome',
      shortTitle: 'Start',
      icon: Fingerprint,
      color: '#7bb8ff'
    },
    {
      id: 'identity',
      title: 'Your Identity',
      shortTitle: 'Identity',
      icon: Shield,
      color: '#bfa5ff'
    },
    {
      id: 'phone',
      title: 'Phone Verification',
      shortTitle: 'Phone',
      icon: Phone,
      color: '#32f08c'
    },
    {
      id: 'professional',
      title: 'Professional Info',
      shortTitle: 'Profile',
      icon: Briefcase,
      color: '#7bb8ff'
    },
    {
      id: 'connect',
      title: 'Connect Accounts',
      shortTitle: 'Connect',
      icon: Link,
      color: '#bfa5ff'
    },
    {
      id: 'verify',
      title: 'Verification',
      shortTitle: 'Verify',
      icon: Brain,
      color: '#32f08c'
    },
    {
      id: 'complete',
      title: 'PIN Generated',
      shortTitle: 'Complete',
      icon: Sparkles,
      color: '#7bb8ff'
    }
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - CREATE PIN with real API call
      setShowPINReveal(true);
      
      try {
        const accessToken = localStorage.getItem('accessToken');
        const userId = localStorage.getItem('userId');
        
        if (!accessToken || !userId) {
          throw new Error('Not authenticated. Please login again.');
        }

        // Prepare PIN payload
        const pinPayload = {
          name: formData.name,
          title: formData.title,
          location: formData.location,
          avatar: formData.photoUrl || null,
          linkedinUrl: formData.linkedinUrl,
          githubUrl: formData.githubUrl,
          portfolioUrl: formData.portfolioUrl,
          experiences: formData.experiences,
          skills: formData.skills.map(skill => ({
            name: typeof skill === 'string' ? skill : skill,
            level: 'Intermediate',
            verified: false
          }))
        };

        console.log('Creating PIN with payload:', pinPayload);

        // Create PIN via API
        const result = await api.createPIN(pinPayload, accessToken);
        
        if (result.success) {
          console.log('PIN created successfully:', result.pinNumber);
          
          // Fetch the complete PIN data
          const pinData = await api.getUserPIN(userId, accessToken);
          
          setTimeout(() => {
            if (pinData.success && pinData.data) {
              onComplete(pinData.data);
            } else {
              // Fallback to generated data if fetch fails
              const fallbackData = generateMockPINData({
                name: formData.name,
                title: formData.title,
                location: formData.location,
                linkedAccounts: {
                  linkedin: !!formData.linkedinUrl,
                  github: !!formData.githubUrl,
                  portfolio: !!formData.portfolioUrl
                }
              });
              fallbackData.pinNumber = result.pinNumber;
              onComplete(fallbackData);
            }
          }, 3000);
        } else {
          throw new Error(result.error || 'PIN creation failed');
        }
      } catch (error: any) {
        console.error('PIN creation error:', error);
        toast.error('Failed to create PIN: ' + error.message);
        setShowPINReveal(false);
        
        // Optionally fall back to mock data for demo purposes
        // Uncomment if you want to allow demo mode
        /*
        setTimeout(() => {
          const pinData = generateMockPINData({
            name: formData.name,
            title: formData.title,
            location: formData.location,
            linkedAccounts: {
              linkedin: !!formData.linkedinUrl,
              github: !!formData.githubUrl,
              portfolio: !!formData.portfolioUrl
            }
          });
          onComplete(pinData);
        }, 3000);
        */
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSendVerificationCode = async () => {
    if (!formData.email) {
      toast.error('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      setIsVerifying(true);
      toast.info('Sending verification code...');
      
      await api.sendVerificationEmail(formData.email, formData.name);
      
      setVerificationSent(true);
      toast.success('✓ Verification code sent! Check your email.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send verification code');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Please enter the 6-digit code');
      return;
    }

    try {
      setIsVerifying(true);
      
      await api.verifyEmailCode(formData.email, verificationCode);
      
      setEmailVerified(true);
      toast.success('✓ Email verified successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Invalid verification code');
      setVerificationCode('');
    } finally {
      setIsVerifying(false);
    }
  };

  // PIN Reveal Animation Component
  if (showPINReveal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: '#0a0b0d' }}>
        {/* Animated background */}
        <div className="absolute inset-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.3, scale: 2 }}
            transition={{ duration: 2 }}
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl"
            style={{ backgroundColor: '#bfa5ff' }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.3, scale: 2 }}
            transition={{ duration: 2, delay: 0.3 }}
            className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl"
            style={{ backgroundColor: '#32f08c' }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.2, scale: 2 }}
            transition={{ duration: 2, delay: 0.6 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl"
            style={{ backgroundColor: '#7bb8ff' }}
          />
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="relative z-10 text-center space-y-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1, type: "spring" }}
          >
            <Fingerprint className="h-24 w-24 mx-auto mb-6" style={{ color: '#32f08c' }} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            <h1 className="text-6xl text-white mb-4">Generating Your PIN</h1>
            <div className="flex items-center justify-center gap-2 text-gray-400">
              <Database className="h-5 w-5 animate-pulse" />
              <span className="text-lg">Securing identity on blockchain...</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "300px" }}
            transition={{ delay: 2, duration: 0.8 }}
            className="h-1 rounded-full mx-auto"
            style={{ backgroundColor: '#32f08c' }}
          />
        </motion.div>
      </div>
    );
  }

  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case 'welcome':
        return (
          <div className="min-h-[500px] flex flex-col items-center justify-center text-center py-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.8 }}
              className="relative mb-8"
            >
              {/* Pulsing rings */}
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: '#7bb8ff' }}
              />
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: '#bfa5ff' }}
              />
              
              {/* Icon */}
              <div 
                className="relative w-32 h-32 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(123, 184, 255, 0.2)' }}
              >
                <Fingerprint className="h-16 w-16" style={{ color: '#7bb8ff' }} />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4 max-w-2xl"
            >
              <Badge className="mb-2 px-4 py-1.5" style={{ backgroundColor: '#bfa5ff', color: '#0a0b0d' }}>
                Professional Identity Network
              </Badge>
              <h1 className="text-5xl mb-4">
                Welcome to <span style={{ color: '#32f08c' }}>PIN</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Create your Professional Identity Number — a globally verified, blockchain-secured identity that proves your skills and experience to employers worldwide.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid sm:grid-cols-3 gap-6 mt-12 w-full max-w-3xl"
            >
              {[
                { 
                  icon: Shield, 
                  title: 'Verified Identity',
                  desc: 'AI-powered credential verification',
                  color: '#7bb8ff'
                },
                { 
                  icon: Database, 
                  title: 'Blockchain Secured',
                  desc: 'Immutable professional records',
                  color: '#bfa5ff'
                },
                { 
                  icon: Globe, 
                  title: 'Global Recognition',
                  desc: 'Trusted by employers worldwide',
                  color: '#32f08c'
                }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="p-6 border-2 hover:shadow-xl transition-all">
                    <div 
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 mx-auto"
                      style={{ backgroundColor: `${item.color}20` }}
                    >
                      <item.icon className="h-7 w-7" style={{ color: item.color }} />
                    </div>
                    <h3 className="font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-8 text-sm text-gray-500"
            >
              ⏱️ Takes 5 minutes • 🔒 Bank-level security • ✨ Free forever
            </motion.div>
          </div>
        );

      case 'identity':
        return (
          <div className="space-y-8 py-8">
            <div className="text-center mb-8">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: 'rgba(191, 165, 255, 0.1)' }}
              >
                <Shield className="h-8 w-8" style={{ color: '#bfa5ff' }} />
              </div>
              <h2 className="text-3xl mb-2">Verify Your Identity</h2>
              <p className="text-gray-600">Let's confirm it's really you</p>
            </div>

            <div className="max-w-md mx-auto space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={emailVerified || verificationSent}
                  className="h-12 text-base"
                />
              </div>

              {!emailVerified && !verificationSent && (
                <Button 
                  onClick={handleSendVerificationCode}
                  className="w-full h-12 text-base"
                  disabled={!formData.email || isVerifying}
                  style={{ backgroundColor: '#bfa5ff', color: '#0a0b0d' }}
                >
                  <Mail className="h-5 w-5 mr-2" />
                  {isVerifying ? 'Sending...' : 'Send Verification Code'}
                </Button>
              )}

              {verificationSent && !emailVerified && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="code" className="text-base">Enter 6-Digit Code</Label>
                    <Input
                      id="code"
                      type="text"
                      placeholder="000000"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      maxLength={6}
                      className="h-12 text-base text-center text-2xl tracking-widest font-mono"
                      autoFocus
                    />
                    <p className="text-sm text-gray-500">Check your email for the verification code</p>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button 
                      onClick={handleVerifyCode}
                      className="flex-1 h-12 text-base"
                      disabled={verificationCode.length !== 6 || isVerifying}
                      style={{ backgroundColor: '#32f08c', color: '#0a0b0d' }}
                    >
                      <CheckCircle className="h-5 w-5 mr-2" />
                      {isVerifying ? 'Verifying...' : 'Verify Code'}
                    </Button>
                    
                    <Button 
                      onClick={handleSendVerificationCode}
                      variant="outline"
                      className="h-12"
                      disabled={isVerifying}
                    >
                      Resend
                    </Button>
                  </div>
                </div>
              )}

              {emailVerified && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="rounded-2xl p-6 border-2"
                  style={{ borderColor: '#32f08c', backgroundColor: 'rgba(50, 240, 140, 0.05)' }}
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: '#32f08c' }}
                    >
                      <CheckCircle className="h-6 w-6 text-black" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Email Verified!</h4>
                      <p className="text-sm text-gray-600">Your identity has been confirmed</p>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="pt-6">
                <div className="bg-gray-50 rounded-xl p-4 border">
                  <div className="flex items-start gap-3">
                    <Lock className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-gray-600">
                      <p className="font-medium mb-1">Your data is secure</p>
                      <p>We use bank-level encryption to protect your information. Your email will never be shared.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'phone':
        return (
          <div className="space-y-8 py-8">
            <div className="text-center mb-8">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: 'rgba(50, 240, 140, 0.1)' }}
              >
                <Phone className="h-8 w-8" style={{ color: '#32f08c' }} />
              </div>
              <h2 className="text-3xl mb-2">Verify Your Phone Number</h2>
              <p className="text-gray-600">Required for PIN issuance and security</p>
            </div>

            <div className="max-w-2xl mx-auto">
              <PhoneVerification
                onVerificationComplete={(phone) => {
                  setFormData({ ...formData, phone });
                  setPhoneVerified(true);
                }}
                initialPhone={formData.phone}
                isVerified={phoneVerified}
              />
            </div>
          </div>
        );

      case 'professional':
        return (
          <div className="space-y-8 py-8">
            <div className="text-center mb-8">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: 'rgba(50, 240, 140, 0.1)' }}
              >
                <Briefcase className="h-8 w-8" style={{ color: '#32f08c' }} />
              </div>
              <h2 className="text-3xl mb-2">Professional Information</h2>
              <p className="text-gray-600">This will appear on your PIN identity card</p>
            </div>

            <div className="max-w-2xl mx-auto space-y-6">
              {/* Profile Photo */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4" style={{ borderColor: '#32f08c' }}>
                    <AvatarImage src={formData.photoUrl} />
                    <AvatarFallback className="text-2xl">
                      {formData.name ? formData.name.split(' ').map(n => n[0]).join('').toUpperCase() : '?'}
                    </AvatarFallback>
                  </Avatar>
                  <button 
                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-lg"
                    style={{ backgroundColor: '#32f08c' }}
                  >
                    <Camera className="h-4 w-4 text-black" />
                  </button>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Profile Photo</h4>
                  <p className="text-sm text-gray-600 mb-2">Upload a professional photo</p>
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Photo
                  </Button>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-base">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-base">Location *</Label>
                  <Input
                    id="location"
                    placeholder="Lagos, Nigeria"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title" className="text-base">Professional Title *</Label>
                <Input
                  id="title"
                  placeholder="Senior Software Engineer"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-base">Industry Category *</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full h-12 px-3 rounded-md border border-input bg-background"
                >
                  <option value="">Select your industry</option>
                  <option value="tech">Technology & Software</option>
                  <option value="design">Design & Creative</option>
                  <option value="marketing">Marketing & Sales</option>
                  <option value="finance">Finance & Accounting</option>
                  <option value="engineering">Engineering</option>
                  <option value="consulting">Consulting</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'connect':
        return (
          <div className="space-y-8 py-8">
            <div className="text-center mb-8">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: 'rgba(123, 184, 255, 0.1)' }}
              >
                <Link className="h-8 w-8" style={{ color: '#7bb8ff' }} />
              </div>
              <h2 className="text-3xl mb-2">Connect Your Profiles</h2>
              <p className="text-gray-600">Link your professional accounts for AI-powered verification</p>
            </div>

            <div className="max-w-2xl mx-auto space-y-6">
              {/* LinkedIn */}
              <Card className="p-6 border-2 border-blue-200 hover:border-blue-400 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <Linkedin className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">LinkedIn Profile</h4>
                      <Badge className="bg-orange-100 text-orange-700 border-orange-200">Required</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">We'll verify your work experience and endorsements</p>
                    <Input
                      placeholder="https://linkedin.com/in/yourprofile"
                      value={formData.linkedinUrl}
                      onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                      className="h-11"
                    />
                  </div>
                </div>
              </Card>

              {/* GitHub */}
              <Card className="p-6 border-2 hover:border-gray-400 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center flex-shrink-0">
                    <Github className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">GitHub Profile</h4>
                      <Badge variant="outline">Optional</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">For developers - showcase your code contributions</p>
                    <Input
                      placeholder="https://github.com/yourusername"
                      value={formData.githubUrl}
                      onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                      className="h-11"
                    />
                  </div>
                </div>
              </Card>

              {/* Portfolio */}
              <Card className="p-6 border-2 hover:border-purple-400 transition-colors">
                <div className="flex items-start gap-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#bfa5ff' }}
                  >
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">Portfolio Website</h4>
                      <Badge variant="outline">Optional</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">Your personal website or portfolio</p>
                    <Input
                      placeholder="https://yourportfolio.com"
                      value={formData.portfolioUrl}
                      onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                      className="h-11"
                    />
                  </div>
                </div>
              </Card>

              {/* Info Box */}
              <div 
                className="rounded-2xl p-6 border-2"
                style={{ borderColor: '#7bb8ff', backgroundColor: 'rgba(123, 184, 255, 0.05)' }}
              >
                <div className="flex items-start gap-3">
                  <Brain className="h-6 w-6 flex-shrink-0" style={{ color: '#7bb8ff' }} />
                  <div>
                    <h4 className="font-semibold mb-2">AI-Powered Verification</h4>
                    <p className="text-sm text-gray-600">
                      Our AI will analyze your connected profiles to automatically verify your skills, experience, and achievements. This typically takes 24-48 hours.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'verify':
        return (
          <div className="space-y-8 py-8">
            <div className="text-center mb-8">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: 'rgba(191, 165, 255, 0.1)' }}
              >
                <Brain className="h-8 w-8" style={{ color: '#bfa5ff' }} />
              </div>
              <h2 className="text-3xl mb-2">AI Verification Process</h2>
              <p className="text-gray-600">We'll analyze your profiles to verify your professional identity</p>
            </div>

            <div className="max-w-2xl mx-auto space-y-6">
              {/* Verification Steps */}
              {[
                {
                  icon: Linkedin,
                  title: 'LinkedIn Analysis',
                  desc: 'Verifying work experience, endorsements, and connections',
                  status: 'complete',
                  color: '#0077b5'
                },
                {
                  icon: Code,
                  title: 'Technical Skills',
                  desc: formData.githubUrl ? 'Analyzing GitHub contributions and repositories' : 'No GitHub profile connected',
                  status: formData.githubUrl ? 'complete' : 'skipped',
                  color: '#7bb8ff'
                },
                {
                  icon: FileText,
                  title: 'Professional Credentials',
                  desc: 'Cross-referencing information across platforms',
                  status: 'complete',
                  color: '#bfa5ff'
                },
                {
                  icon: Shield,
                  title: 'Identity Verification',
                  desc: 'Confirming authenticity and generating trust score',
                  status: 'complete',
                  color: '#32f08c'
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2 }}
                >
                  <Card className="p-4 border-2">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${item.color}20` }}
                      >
                        <item.icon className="h-6 w-6" style={{ color: item.color }} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{item.title}</h4>
                        <p className="text-sm text-gray-600">{item.desc}</p>
                      </div>
                      {item.status === 'complete' && (
                        <CheckCircle className="h-6 w-6 flex-shrink-0" style={{ color: '#32f08c' }} />
                      )}
                      {item.status === 'skipped' && (
                        <Badge variant="outline" className="flex-shrink-0">Skipped</Badge>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}

              {/* What happens next */}
              <div 
                className="rounded-2xl p-6 mt-8"
                style={{ backgroundColor: 'rgba(50, 240, 140, 0.05)', border: '2px solid #32f08c' }}
              >
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5" style={{ color: '#32f08c' }} />
                  What Happens Next
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-sm">
                    <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: '#32f08c' }} />
                    <span>Your PIN will be generated and secured on the blockchain</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm">
                    <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: '#32f08c' }} />
                    <span>AI verification continues in the background (24-48 hours)</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm">
                    <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: '#32f08c' }} />
                    <span>You can start applying to jobs immediately with your PIN</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm">
                    <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: '#32f08c' }} />
                    <span>Your trust score increases as verifications complete</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'complete':
        const previewData = generateMockPINData({
          name: formData.name || 'Your Name',
          title: formData.title || 'Your Title',
          location: formData.location || 'Your Location',
          linkedAccounts: {
            linkedin: !!formData.linkedinUrl,
            github: !!formData.githubUrl,
            portfolio: !!formData.portfolioUrl
          }
        });

        return (
          <div className="space-y-8 py-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring" }}
              className="text-center mb-8"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 10, 0] }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="inline-block mb-4"
              >
                <Sparkles className="h-16 w-16 mx-auto" style={{ color: '#32f08c' }} />
              </motion.div>
              <h2 className="text-4xl mb-3">
                🎉 Your PIN is Ready!
              </h2>
              <p className="text-xl text-gray-600">Your professional identity is now verified and blockchain-secured</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="max-w-3xl mx-auto"
            >
              <PINIdentityCard data={previewData} variant="preview" showActions={true} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="max-w-2xl mx-auto"
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <Card className="p-6 border-2 hover:shadow-lg transition-all cursor-pointer" style={{ borderColor: '#7bb8ff' }}>
                  <div className="flex items-start gap-3">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: 'rgba(123, 184, 255, 0.2)' }}
                    >
                      <Target className="h-6 w-6" style={{ color: '#7bb8ff' }} />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Start Swiping Jobs</h4>
                      <p className="text-sm text-gray-600">Browse verified opportunities</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 border-2 hover:shadow-lg transition-all cursor-pointer" style={{ borderColor: '#bfa5ff' }}>
                  <div className="flex items-start gap-3">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: 'rgba(191, 165, 255, 0.2)' }}
                    >
                      <Globe className="h-6 w-6" style={{ color: '#bfa5ff' }} />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Share Your PIN</h4>
                      <p className="text-sm text-gray-600">Send to potential employers</p>
                    </div>
                  </div>
                </Card>
              </div>
            </motion.div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (steps[currentStep].id) {
      case 'welcome':
        return true;
      case 'identity':
        return emailVerified;
      case 'phone':
        return phoneVerified;
      case 'professional':
        return formData.name && formData.title && formData.location && formData.category;
      case 'connect':
        return formData.linkedinUrl; // LinkedIn is required
      case 'verify':
        return true;
      case 'complete':
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Progress Header */}
        <div className="mb-8">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl flex items-center gap-2">
                <Fingerprint className="h-7 w-7" style={{ color: '#7bb8ff' }} />
                Create Your PIN
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Step {currentStep + 1} of {steps.length}
              </p>
            </div>
            {onSkip && currentStep === 0 && (
              <Button variant="ghost" onClick={onSkip}>
                Skip for now
              </Button>
            )}
          </div>

          {/* Progress Bar */}
          <div className="relative">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
                className="h-full rounded-full"
                style={{ 
                  background: 'linear-gradient(90deg, #7bb8ff 0%, #bfa5ff 50%, #32f08c 100%)'
                }}
              />
            </div>
          </div>

          {/* Step Indicators */}
          <div className="flex items-center justify-between mt-6 relative">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div key={step.id} className="flex flex-col items-center relative z-10">
                  <motion.div
                    animate={{
                      scale: isActive ? 1.1 : 1,
                    }}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      isActive
                        ? 'shadow-lg'
                        : isCompleted
                        ? 'shadow-md'
                        : ''
                    }`}
                    style={{
                      backgroundColor: isActive || isCompleted ? step.color : '#e5e7eb',
                      border: isActive ? `3px solid ${step.color}40` : 'none'
                    }}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-6 w-6 text-white" />
                    ) : (
                      <StepIcon className={`h-6 w-6 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                    )}
                  </motion.div>
                  <span className={`text-xs mt-2 text-center hidden sm:block ${isActive ? 'font-semibold' : 'text-gray-500'}`}>
                    {step.shortTitle}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <Card className="border-2 shadow-xl">
          <CardContent className="p-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="p-8"
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between p-6 border-t bg-gray-50">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0}
                className="h-12 px-6"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="h-12 px-8 text-base"
                style={{ 
                  backgroundColor: canProceed() ? steps[currentStep].color : '#d1d5db',
                  color: canProceed() ? (currentStep === 2 ? '#0a0b0d' : 'white') : '#6b7280'
                }}
              >
                {currentStep === steps.length - 1 ? (
                  <>
                    <Zap className="h-5 w-5 mr-2" />
                    Activate My PIN
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-8 mt-8 text-sm text-gray-500"
        >
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span>Encrypted</span>
          </div>
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span>Blockchain Secured</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>GDPR Compliant</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
