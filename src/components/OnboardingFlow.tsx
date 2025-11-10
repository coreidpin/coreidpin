import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Logo } from './Logo';
import { WelcomeAIBadge } from './WelcomeAIBadge';
import { supabase } from '../utils/supabase/client';
import { api } from '../utils/api';
import { toast } from 'sonner@2.0.3';
import { 
  Shield, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  Building, 
  Users, 
  GraduationCap,
  Brain,
  Sparkles,
  Loader2,
  Chrome,
  Mail,
  User,
  MapPin,
  Briefcase
} from 'lucide-react';

interface OnboardingFlowProps {
  userType: 'employer' | 'professional' | 'university';
  onComplete: () => void;
  onBack: () => void;
}

export function OnboardingFlow({ userType, onComplete, onBack }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcomeBadge, setShowWelcomeBadge] = useState(false);

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getStepsForUserType = () => {
    switch (userType) {
      case 'employer':
        return [
          { title: 'Company Information', component: EmployerBasicInfo },
          { title: 'Welcome to swipe', component: CompletionStep }
        ];
      case 'professional':
        return [
          { title: 'Basic Information', component: ProfessionalBasicInfo },
          { title: 'Welcome to swipe', component: CompletionStep }
        ];
      case 'university':
        return [
          { title: 'Coming Soon', component: UniversityComingSoon }
        ];
      default:
        return [];
    }
  };

  const steps = getStepsForUserType();
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Show welcome badge before completing
      setShowWelcomeBadge(true);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      onBack();
    }
  };

  const CurrentStepComponent = steps[currentStep]?.component;

  return (
    <>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="border-b border-border bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Logo size="md" />
            
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="hidden sm:flex">
                <Brain className="h-3 w-3 mr-1" />
                Quick Setup
              </Badge>
              <span className="text-sm text-muted-foreground">
                {userType === 'employer' && 'Employer Setup'}
                {userType === 'professional' && 'Professional Setup'}
                {userType === 'university' && 'University Partnership'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      {userType !== 'university' && (
        <div className="bg-white border-b border-border">
          <div className="container mx-auto px-4 py-6">
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Step {currentStep + 1} of {steps.length}</span>
                <span className="text-muted-foreground">{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="w-full h-2" />
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">
                  {steps[currentStep]?.title}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {CurrentStepComponent && (
                <CurrentStepComponent
                  formData={formData}
                  updateFormData={updateFormData}
                  userType={userType}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          {userType !== 'university' && (
            <motion.div 
              className="flex items-center justify-between mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Button variant="outline" onClick={handlePrevious} className="min-w-[120px]">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {currentStep === 0 ? 'Back' : 'Previous'}
              </Button>
              
              <Button onClick={handleNext} className="min-w-[120px]" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : currentStep === steps.length - 1 ? (
                  'Go to Dashboard'
                ) : (
                  <>
                    Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </div>
      </main>
    </div>

    {/* Welcome Badge Modal */}
    {showWelcomeBadge && (
      <WelcomeAIBadge
        userName={formData.name || formData.companyName || 'User'}
        professionalTitle={formData.title || (userType === 'employer' ? 'Employer' : 'Professional')}
        userType={userType as 'professional' | 'employer'}
        onClose={() => {
          setShowWelcomeBadge(false);
          onComplete();
        }}
      />
    )}
  </>
  );
}

// Professional Basic Info - Simplified
function ProfessionalBasicInfo({ formData, updateFormData, isLoading, setIsLoading }: any) {
  const [showGoogleAuth, setShowGoogleAuth] = useState(true);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      localStorage.setItem('pendingUserType', 'professional');
      
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
          toast.error('Google sign-in not configured. Please complete the form manually or contact support.');
          setShowGoogleAuth(false);
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-3xl mb-2">Welcome to swipe! 👋</h1>
        <p className="text-muted-foreground">
          Let's get you set up in under 2 minutes
        </p>
      </div>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            We just need a few details to get started. You can complete your full profile later in your dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Google Sign In Option */}
          {showGoogleAuth && (
            <div className="space-y-4">
              <div className="text-center">
                <Button 
                  onClick={handleGoogleSignIn}
                  variant="outline"
                  className="w-full h-12"
                  disabled={isLoading}
                  type="button"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  ) : (
                    <Chrome className="h-5 w-5 mr-2" />
                  )}
                  Continue with Google
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">
                    Or fill manually
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Basic Form Fields */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="name" 
                    placeholder="John Doe"
                    value={formData.name || ''}
                    onChange={(e) => updateFormData('name', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email || ''}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Professional Title *</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="title" 
                    placeholder="e.g., Senior Developer"
                    value={formData.title || ''}
                    onChange={(e) => updateFormData('title', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="location">Location *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="location" 
                    placeholder="Lagos, Nigeria"
                    value={formData.location || ''}
                    onChange={(e) => updateFormData('location', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-primary mb-1">Complete your profile after signup!</p>
                <p className="text-muted-foreground">
                  You can add your LinkedIn, GitHub, portfolio, and other details in the Setup tab on your dashboard to unlock AI verification and get discovered by employers.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Employer Basic Info - Simplified
function EmployerBasicInfo({ formData, updateFormData, isLoading, setIsLoading }: any) {
  const [showGoogleAuth, setShowGoogleAuth] = useState(true);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      localStorage.setItem('pendingUserType', 'employer');
      
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
          toast.error('Google sign-in not configured. Please complete the form manually or contact support.');
          setShowGoogleAuth(false);
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-3xl mb-2">Welcome to swipe! 🚀</h1>
        <p className="text-muted-foreground">
          Start hiring verified talent in minutes
        </p>
      </div>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>
            Quick setup to get you started. You can add more details later in your dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Google Sign In Option */}
          {showGoogleAuth && (
            <div className="space-y-4">
              <div className="text-center">
                <Button 
                  onClick={handleGoogleSignIn}
                  variant="outline"
                  className="w-full h-12"
                  disabled={isLoading}
                  type="button"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  ) : (
                    <Chrome className="h-5 w-5 mr-2" />
                  )}
                  Continue with Google
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">
                    Or fill manually
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Basic Form Fields */}
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

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 mb-1">Start swiping immediately!</p>
                <p className="text-blue-800">
                  Once you complete this quick setup, you can post jobs and start discovering verified talent right away. Add additional company details anytime from your dashboard.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Completion Step
function CompletionStep({ userType }: any) {
  return (
    <div className="text-center space-y-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="w-24 h-24 bg-gradient-to-br from-success to-green-600 rounded-full flex items-center justify-center mx-auto"
      >
        <CheckCircle className="h-12 w-12 text-white" />
      </motion.div>

      <div>
        <h1 className="text-3xl mb-3">You're All Set! 🎉</h1>
        <p className="text-lg text-muted-foreground">
          {userType === 'employer' 
            ? 'Welcome to swipe! You can now start discovering verified talent.'
            : 'Welcome to swipe! Complete your profile in the Setup tab to get discovered by employers.'}
        </p>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 max-w-md mx-auto">
        <h3 className="font-semibold mb-4 flex items-center gap-2 justify-center">
          <Sparkles className="h-5 w-5 text-primary" />
          What's Next?
        </h3>
        <ul className="text-left space-y-3 text-sm">
          {userType === 'employer' ? (
            <>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                <span>Post your first job in the Swipe tab</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                <span>Browse verified professionals and swipe to match</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                <span>Complete your company profile for better matches</span>
              </li>
            </>
          ) : (
            <>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                <span>Complete your profile in the Setup tab</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                <span>Add LinkedIn, GitHub, or portfolio for AI verification</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                <span>Start swiping on jobs that match your skills</span>
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}

// University Coming Soon
function UniversityComingSoon() {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
          <GraduationCap className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-3xl">University Partnerships</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          We're crafting something special for educational institutions
        </p>
      </motion.div>

      <Card className="relative overflow-hidden text-center bg-white">
        <CardContent className="py-12">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl">Coming Soon</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Our university portal is in development. We're building powerful tools for institutions to issue verifiable digital credentials.
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-medium">Interested in partnering with us?</p>
              <Button variant="outline">
                <Mail className="h-4 w-4 mr-2" />
                Contact Partnership Team
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
