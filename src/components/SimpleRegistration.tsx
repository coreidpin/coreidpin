import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from './ui/card'
import { Navbar } from './Navbar'
import { Sparkles } from 'lucide-react'
import { useRegistration } from './registration/useRegistration'
import { BasicInfoForm } from './registration/steps/BasicInfoForm'
import { OTPVerification } from './registration/steps/OTPVerification'
import { SuccessView } from './registration/steps/SuccessView'
import { UserTypeSelector } from './UserTypeSelector'

import { AuthLayout } from './AuthLayout'

type SimpleRegistrationProps = {
  onComplete?: () => void
  onBack?: () => void
  showChrome?: boolean
}

export default function SimpleRegistration({ onComplete, onBack, showChrome = true }: SimpleRegistrationProps) {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<'professional' | 'business'>('professional');
  const {
    formData,
    errors,
    isLoading,
    stage,
    setStage,
    countryCode,
    setCountryCode,
    countryError,
    setCountryError,
    otp,
    setOtp,
    activeContact,
    resendCountdown,
    canResend,
    updateField,
    handleStartRegistration,
    handleResendOTP,
    handleVerifyOTP,
    handleGoogleSignIn
  } = useRegistration()

  // Handle user type change
  const handleUserTypeChange = (type: 'professional' | 'business') => {
    setUserType(type);
    updateField('userType', type);
  };

  return (
    <AuthLayout
      sidebarData={{
        name: formData.name || undefined,
        role: formData.userType === 'business' ? formData.industry : 'Professional',
        pin: stage === 'otp-verification' ? 'PIN-VERIFYING' : (stage === 'success' ? 'PIN-ACTIVE' : undefined)
      }}
    >
      <div className="w-full" aria-busy={isLoading}>
        {/* Progress Indicator */}
        <div className="mb-6 flex space-x-1">
          <div 
            className="h-1 flex-1 rounded-full transition-all duration-500"
            style={{ 
              backgroundColor: stage === 'basic' || stage === 'otp-verification' || stage === 'success' ? '#6366f1' : 'rgba(255,255,255,0.1)' 
            }}
          />
          <div 
            className="h-1 flex-1 rounded-full transition-all duration-500"
            style={{ 
              backgroundColor: stage === 'otp-verification' || stage === 'success' ? '#6366f1' : 'rgba(255,255,255,0.1)' 
            }}
          />
          <div 
            className="h-1 flex-1 rounded-full transition-all duration-500"
            style={{ 
              backgroundColor: stage === 'success' ? '#6366f1' : 'rgba(255,255,255,0.1)' 
            }}
          />
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {stage === 'basic' && 'Create your account'}
            {stage === 'otp-verification' && 'Verify your identity'}
            {stage === 'success' && 'Welcome to GidiPIN'}
          </h1>
          <p style={{ color: '#94a3b8' }}>
            {stage === 'basic' && 'Start your global professional identity journey today.'}
            {stage === 'otp-verification' && `We sent a code to ${activeContact}`}
            {stage === 'success' && 'Your account has been successfully created.'}
          </p>
        </div>

        <div className="relative min-h-[400px]">
          <AnimatePresence mode="wait" initial={false}>
            {stage === 'basic' && (
              <motion.div
                key="basic-stage"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                {/* User Type Tab-style selector for left-aligned layout */}
                <div className="mb-8 p-1 bg-white/5 rounded-xl border border-white/10 flex relative overflow-hidden">
                  <button
                    type="button"
                    onClick={() => handleUserTypeChange('professional')}
                    className="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors relative"
                    style={{ 
                      color: userType === 'professional' ? 'black' : '#9ca3af',
                    }}
                  >
                    <span className="relative z-10">Professional</span>
                    {userType === 'professional' && (
                      <motion.div 
                        layoutId="activeTab"
                        className="absolute inset-0 bg-white rounded-lg shadow-sm"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUserTypeChange('business')}
                    className="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors relative"
                    style={{ 
                      color: userType === 'business' ? 'black' : '#9ca3af',
                    }}
                  >
                    <span className="relative z-10">Business</span>
                    {userType === 'business' && (
                      <motion.div 
                        layoutId="activeTab"
                        className="absolute inset-0 bg-white rounded-lg shadow-sm"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </button>
                </div>
                
                <BasicInfoForm
                  formData={formData}
                  errors={errors}
                  isLoading={isLoading}
                  countryCode={countryCode}
                  countryError={countryError}
                  setCountryCode={setCountryCode}
                  setCountryError={setCountryError}
                  updateField={updateField}
                  onSubmit={handleStartRegistration}
                  onGoogleSignIn={handleGoogleSignIn}
                  onBack={onBack}
                />
              </motion.div>
            )}

            {stage === 'otp-verification' && (
              <motion.div
                key="otp-stage"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <OTPVerification
                  otp={otp}
                  setOtp={setOtp}
                  isLoading={isLoading}
                  resendCountdown={resendCountdown}
                  canResend={canResend}
                  onVerify={handleVerifyOTP}
                  onResend={handleResendOTP}
                  onBack={() => setStage('basic')}
                />
              </motion.div>
            )}

            {stage === 'success' && (
              <motion.div
                key="success-stage"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
              >
                <SuccessView />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {stage === 'basic' && (
          <p className="text-left text-[10px] sm:text-xs mt-8 px-1 leading-relaxed" style={{ color: '#64748b' }}>
            By creating an account, you agree to our <a href="/terms" className="underline hover:text-white" style={{ color: '#94a3b8' }}>Terms</a> and <a href="/privacy" className="underline hover:text-white" style={{ color: '#94a3b8' }}>Privacy Policy</a>.
          </p>
        )}
      </div>
    </AuthLayout>
  )
}
