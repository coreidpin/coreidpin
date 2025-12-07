import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { CheckCircle, Loader2, X, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { submitWaitlistForm } from '../utils/waitlist';
import { trackEvent } from '../utils/amplitude';

const countries = [
  'Nigeria', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Netherlands', 'South Africa', 'Kenya', 'Ghana', 'Other'
];

interface WaitlistFormData {
  fullName: string;
  email: string;
  userType: string;
  problemToSolve: string;
  currentVerificationMethod: string;
  usePhoneAsPin: string;
  importanceLevel: string;
  expectedUsage: string;
  heardAboutUs: string;
  country: string;
  wantsEarlyAccess: string;
  willingToProvideFeedback: string;
}

interface WaitlistFormProps {
  onClose: () => void;
}

export function WaitlistForm({ onClose }: WaitlistFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<WaitlistFormData>({
    fullName: '',
    email: '',
    userType: '',
    problemToSolve: '',
    currentVerificationMethod: '',
    usePhoneAsPin: '',
    importanceLevel: '',
    expectedUsage: '',
    heardAboutUs: '',
    country: '',
    wantsEarlyAccess: '',
    willingToProvideFeedback: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [scroll, setScroll] = useState({ canScroll: false, atTop: true, atBottom: false });

  useEffect(() => {
    const el = contentRef.current;
    let rafId = 0;
    let scheduled = false;
    const measure = () => {
      scheduled = false;
      if (!el) return;
      const can = el.scrollHeight > el.clientHeight;
      const top = el.scrollTop <= 0;
      const bottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
      setScroll({ canScroll: can, atTop: top, atBottom: bottom });
    };
    const schedule = () => {
      if (scheduled) return;
      scheduled = true;
      rafId = requestAnimationFrame(measure);
    };
    schedule();
    el?.addEventListener('scroll', schedule, { passive: true });
    const ro = new ResizeObserver(schedule);
    if (el) ro.observe(el);
    return () => {
      el?.removeEventListener('scroll', schedule);
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, [step]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await submitWaitlistForm({
        fullName: formData.fullName,
        email: formData.email,
        userType: formData.userType,
        problemToSolve: formData.problemToSolve,
        currentVerificationMethod: formData.currentVerificationMethod,
        usePhoneAsPin: formData.usePhoneAsPin,
        importanceLevel: formData.importanceLevel,
        expectedUsage: formData.expectedUsage,
        heardAboutUs: formData.heardAboutUs,
        country: formData.country,
        wantsEarlyAccess: formData.wantsEarlyAccess,
        willingToProvideFeedback: formData.willingToProvideFeedback,
      });
      
      // Track successful waitlist join in Amplitude
      trackEvent('Join Waitlist', {
        userType: formData.userType,
        country: formData.country,
        problemToSolve: formData.problemToSolve,
        wantsEarlyAccess: formData.wantsEarlyAccess
      });
      
      setShowSuccess(true);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to join waitlist');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: keyof WaitlistFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const isStepValid = () => {
    switch (step) {
      case 1: return Boolean(formData.fullName.trim()) && isValidEmail(formData.email.trim());
      case 2: return formData.userType && formData.problemToSolve;
      case 3: return formData.currentVerificationMethod && formData.usePhoneAsPin && formData.importanceLevel;
      case 4: return formData.expectedUsage && formData.heardAboutUs && formData.country && formData.wantsEarlyAccess && formData.willingToProvideFeedback;
      default: return false;
    }
  };

  if (showSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            <CheckCircle className="h-20 w-20 text-[#32f08c] mx-auto mb-6" />
          </motion.div>
          <h3 className="text-3xl font-bold mb-4 text-gray-900">Thank You!</h3>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Thank you for completing the form and becoming part of our community. Rest assured, we'll keep you updated and reach out to you directly via email.
          </p>
          <Button onClick={onClose} className="w-full bg-[#32f08c] hover:bg-[#32f08c]/90 text-black font-semibold py-3">
            Close
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-sm sm:max-w-lg lg:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="border-0 shadow-none">
          <CardHeader className="relative bg-gradient-to-r from-[#bfa5ff] to-[#7bb8ff] text-white p-4 sm:p-6">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 sm:top-4 sm:right-4 text-white hover:bg-white/20 h-8 w-8 sm:h-10 sm:w-10"
              onClick={onClose}
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <CardTitle className="text-xl sm:text-2xl lg:text-3xl text-center pr-8 sm:pr-10">Join the Waitlist</CardTitle>
            <div className="flex justify-center mt-3 sm:mt-4">
              <div className="flex space-x-1 sm:space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-1.5 sm:h-2 w-6 sm:w-8 rounded-full transition-all duration-300 ${
                      i <= step ? 'bg-white' : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="relative p-4 sm:p-6 max-h-[calc(95vh-200px)] sm:max-h-[calc(90vh-200px)] overflow-y-auto" style={{ scrollBehavior: 'smooth' }}>
            {scroll.canScroll && !scroll.atTop && (
              <div className="pointer-events-none absolute top-0 left-0 right-0 h-6 sm:h-8 bg-gradient-to-b from-white/70 to-transparent" />
            )}
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4 sm:space-y-5 -mt-4 sm:-mt-6"
                >
                  <div className="text-center mb-2 sm:mb-4">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Basic Information</h3>
                    <p className="text-gray-600 text-xs sm:text-sm">Let's start with the basics</p>
                  </div>
                  
                  <div className="space-y-4 sm:space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-xs sm:text-sm font-medium text-gray-700">Full Name *</Label>
                      <Input
                        id="fullName"
                        placeholder="Enter your full name"
                        value={formData.fullName}
                        onChange={(e) => updateField('fullName', e.target.value)}
                        className="h-10 sm:h-11 text-xs sm:text-sm border-gray-300 focus:border-[#bfa5ff] focus:ring-[#bfa5ff]"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-xs sm:text-sm font-medium text-gray-700">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        className="h-10 sm:h-11 text-xs sm:text-sm border-gray-300 focus:border-[#bfa5ff] focus:ring-[#bfa5ff]"
                      />
                      {formData.email && !isValidEmail(formData.email) && (
                        <p className="text-red-600 text-xs sm:text-sm">Enter a valid email address</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4 sm:space-y-5 -mt-4 sm:-mt-6"
                >
                  <div className="text-center mb-2 sm:mb-4">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">About You</h3>
                    <p className="text-gray-600 text-xs sm:text-sm">Help us understand your role and needs</p>
                  </div>
                  
                  <div className="space-y-4 sm:space-y-5">
                    <div className="space-y-2 sm:space-y-3">
                      <Label className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-2">Are you signing up as a: * {formData.userType && (<CheckCircle className="h-3 w-3" style={{ color: '#32f08c' }} />)}</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {[
                          { value: 'professional', label: 'Professional' },
                          { value: 'employer', label: 'Employer / Business' },
                          { value: 'developer', label: 'Developer / Platform' },
                          { value: 'other', label: 'Other' }
                        ].map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => updateField('userType', option.value)}
                            className={`p-2 sm:p-3 rounded-lg border text-left text-xs sm:text-sm transition-all duration-200 hover:shadow-sm ${
                              formData.userType === option.value
                                ? 'border-[#bfa5ff] bg-[#bfa5ff]/10 text-[#bfa5ff] font-medium'
                                : 'border-gray-200 hover:border-gray-300 text-gray-700'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{option.label}</span>
                              {formData.userType === option.value && (
                                <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                                  <CheckCircle className="h-4 w-4" />
                                </motion.div>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                      <Label className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-2">What problem do you want PIN to solve for you? * {formData.problemToSolve && (<CheckCircle className="h-3 w-3" style={{ color: '#32f08c' }} />)}</Label>
                      <div className="space-y-2">
                        {[
                          { value: 'identity_verification', label: 'Identity verification' },
                          { value: 'professional_credibility', label: 'Professional credibility' },
                          { value: 'hiring_verification', label: 'Hiring verification' },
                          { value: 'api_integration', label: 'API integration' },
                          { value: 'secure_login', label: 'Secure login / authentication' }
                        ].map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => updateField('problemToSolve', option.value)}
                            className={`w-full p-2 sm:p-3 rounded-lg border text-left text-xs sm:text-sm transition-all duration-200 hover:shadow-sm ${
                              formData.problemToSolve === option.value
                                ? 'border-[#32f08c] bg-[#32f08c]/10 text-[#32f08c] font-medium'
                                : 'border-gray-200 hover:border-gray-300 text-gray-700'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{option.label}</span>
                              {formData.problemToSolve === option.value && (
                                <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                                  <CheckCircle className="h-4 w-4" />
                                </motion.div>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4 sm:space-y-5 -mt-4 sm:-mt-6"
                >
                  <div className="text-center mb-2 sm:mb-4">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Current Practices</h3>
                    <p className="text-gray-600 text-xs sm:text-sm">Tell us about your current verification methods</p>
                  </div>
                  
                  <div className="space-y-4 sm:space-y-5">
                    <div className="space-y-2">
                      <Label className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-2">How do you currently verify professionals or your own identity? * {formData.currentVerificationMethod && (<CheckCircle className="h-3 w-3" style={{ color: '#32f08c' }} />)}</Label>
                      <Select value={formData.currentVerificationMethod} onValueChange={(value) => updateField('currentVerificationMethod', value)}>
                        <SelectTrigger className="h-10 sm:h-11 text-xs sm:text-sm border-gray-300 focus:border-[#bfa5ff] focus:ring-[#bfa5ff]">
                          <SelectValue placeholder="Select verification method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manual_checks">Manual checks</SelectItem>
                          <SelectItem value="social_media">Social media</SelectItem>
                          <SelectItem value="traditional_kyc">Traditional KYC</SelectItem>
                          <SelectItem value="dont_verify">I don't verify</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                      <Label className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-2">Would you use your phone number as your global Professional Identity Number (PIN)? * {formData.usePhoneAsPin && (<CheckCircle className="h-3 w-3" style={{ color: '#32f08c' }} />)}</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: 'yes', label: 'Yes' },
                          { value: 'maybe', label: 'Maybe' },
                          { value: 'no', label: 'No' }
                        ].map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => updateField('usePhoneAsPin', option.value)}
                            className={`p-2 sm:p-3 rounded-lg border text-center text-xs sm:text-sm transition-all duration-200 hover:shadow-sm ${
                              formData.usePhoneAsPin === option.value
                                ? 'border-[#7bb8ff] bg-[#7bb8ff]/10 text-[#7bb8ff] font-medium'
                                : 'border-gray-200 hover:border-gray-300 text-gray-700'
                            }`}
                          >
                            <div className="flex items-center justify-center gap-2">
                              <span>{option.label}</span>
                              {formData.usePhoneAsPin === option.value && (
                                <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                                  <CheckCircle className="h-4 w-4" />
                                </motion.div>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-2">How important is verified professional identity to you or your organization? * {formData.importanceLevel && (<CheckCircle className="h-3 w-3" style={{ color: '#32f08c' }} />)}</Label>
                      <Select value={formData.importanceLevel} onValueChange={(value) => updateField('importanceLevel', value)}>
                        <SelectTrigger className="h-10 sm:h-11 text-xs sm:text-sm border-gray-300 focus:border-[#bfa5ff] focus:ring-[#bfa5ff]">
                          <SelectValue placeholder="Select importance level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="extremely_important">Extremely important</SelectItem>
                          <SelectItem value="important">Important</SelectItem>
                          <SelectItem value="somewhat_important">Somewhat important</SelectItem>
                          <SelectItem value="not_important">Not important</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4 sm:space-y-5 -mt-4 sm:-mt-6"
                >
                  <div className="text-center mb-2 sm:mb-4">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Final Details</h3>
                    <p className="text-gray-600 text-xs sm:text-sm">Just a few more questions to complete your profile</p>
                  </div>
                  
                  <div className="space-y-3 sm:space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label className="text-xs sm:text-sm font-medium text-gray-700">How do you expect to use your PIN? *</Label>
                        {formData.expectedUsage && (
                          <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center gap-1 text-xs text-emerald-600">
                            <CheckCircle className="h-3 w-3" />Selected
                          </motion.div>
                        )}
                      </div>
                      <Select value={formData.expectedUsage} onValueChange={(value) => updateField('expectedUsage', value)}>
                        <SelectTrigger className="h-10 sm:h-11 text-xs sm:text-sm border-gray-300 focus:border-[#bfa5ff] focus:ring-[#bfa5ff]">
                          <SelectValue placeholder="Select expected usage" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="job_applications">For job applications</SelectItem>
                          <SelectItem value="professional_networking">For professional networking</SelectItem>
                          <SelectItem value="business_verification">For business verification</SelectItem>
                          <SelectItem value="hiring">For hiring</SelectItem>
                          <SelectItem value="api_integrations">For API integrations</SelectItem>
                          <SelectItem value="personal_identity">Personal identity management</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label className="text-xs sm:text-sm font-medium text-gray-700">Where did you hear about GiDiPIN? *</Label>
                        {formData.heardAboutUs && (
                          <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center gap-1 text-xs text-emerald-600">
                            <CheckCircle className="h-3 w-3" />Selected
                          </motion.div>
                        )}
                      </div>
                      <Select value={formData.heardAboutUs} onValueChange={(value) => updateField('heardAboutUs', value)}>
                        <SelectTrigger className="h-10 sm:h-11 text-xs sm:text-sm border-gray-300 focus:border-[#bfa5ff] focus:ring-[#bfa5ff]">
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="social_media">Social media</SelectItem>
                          <SelectItem value="referral">Referral</SelectItem>
                          <SelectItem value="online_search">Online search</SelectItem>
                          <SelectItem value="community_event">Community or event</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label className="text-xs sm:text-sm font-medium text-gray-700">What country are you signing up from? *</Label>
                        {formData.country && (
                          <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center gap-1 text-xs text-emerald-600">
                            <CheckCircle className="h-3 w-3" />Selected
                          </motion.div>
                        )}
                      </div>
                      <Select value={formData.country} onValueChange={(value) => updateField('country', value)}>
                        <SelectTrigger className="h-10 sm:h-11 text-xs sm:text-sm border-gray-300 focus:border-[#bfa5ff] focus:ring-[#bfa5ff]">
                          <SelectValue placeholder="Select your country" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem key={country} value={country}>
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label className="text-xs sm:text-sm font-medium text-gray-700">Early access to beta? *</Label>
                          {formData.wantsEarlyAccess && (
                            <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center gap-1 text-xs text-emerald-600">
                              <CheckCircle className="h-3 w-3" />Selected
                            </motion.div>
                          )}
                        </div>
                        <Select value={formData.wantsEarlyAccess} onValueChange={(value) => updateField('wantsEarlyAccess', value)}>
                          <SelectTrigger className="h-10 sm:h-11 text-xs sm:text-sm border-gray-300 focus:border-[#bfa5ff] focus:ring-[#bfa5ff]">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="maybe">Maybe</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label className="text-xs sm:text-sm font-medium text-gray-700">Provide feedback? *</Label>
                          {formData.willingToProvideFeedback && (
                            <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center gap-1 text-xs text-emerald-600">
                              <CheckCircle className="h-3 w-3" />Selected
                            </motion.div>
                          )}
                        </div>
                        <Select value={formData.willingToProvideFeedback} onValueChange={(value) => updateField('willingToProvideFeedback', value)}>
                          <SelectTrigger className="h-10 sm:h-11 text-xs sm:text-sm border-gray-300 focus:border-[#bfa5ff] focus:ring-[#bfa5ff]">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="maybe">Maybe</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200 sticky bottom-0 bg-white z-10">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={step === 1}
                className="flex items-center gap-2 h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm border-gray-300 hover:bg-gray-50 w-full sm:w-auto"
              >
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                Previous
              </Button>

              {step < 4 ? (
                (() => {
                  const canProceed = isStepValid();
                  const enabledClasses = "bg-[#7bb8ff] hover:bg-[#7bb8ff]/90 text-black rounded-lg border-2 border-[#7bb8ff]";
                  const disabledClasses = "bg-[#7bb8ff]/50 text-black rounded-lg border-2 border-[#7bb8ff]/50 cursor-not-allowed";
                  return (
                    <Button
                      onClick={nextStep}
                      disabled={!canProceed}
                      className={`flex items-center gap-2 h-9 sm:h-10 px-4 sm:px-6 text-xs sm:text-sm w-full sm:w-auto ${canProceed ? enabledClasses : disabledClasses}`}
                    >
                      Next
                      <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  );
                })()
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!isStepValid() || isSubmitting}
                  className="flex items-center gap-2 h-9 sm:h-10 px-4 sm:px-6 text-xs sm:text-sm bg-[#32f08c] hover:bg-[#32f08c]/90 text-black font-semibold w-full sm:w-auto rounded-lg border-2 border-[#32f08c] disabled:border-[#32f08c]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Join the Waitlist'
                  )}
                </Button>
              )}
            </div>
            {scroll.canScroll && !scroll.atBottom && (
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 sm:h-10 bg-gradient-to-t from-white/70 to-transparent flex items-end justify-center pb-1">
                <span className="text-[10px] sm:text-xs text-gray-500">Scroll for more</span>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
