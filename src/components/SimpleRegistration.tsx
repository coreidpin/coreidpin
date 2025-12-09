import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, CardContent } from './ui/card'
import { Navbar } from './Navbar'
import { Sparkles } from 'lucide-react'
import { useRegistration } from './registration/useRegistration'
import { BasicInfoForm } from './registration/steps/BasicInfoForm'
import { OTPVerification } from './registration/steps/OTPVerification'
import { SuccessView } from './registration/steps/SuccessView'
import { UserTypeSelector } from './UserTypeSelector'

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

  // Handle user type change - redirect to business registration if business selected
  const handleUserTypeChange = (type: 'professional' | 'business') => {
    setUserType(type);
    if (type === 'business') {
      navigate('/business/register');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-white flex flex-col">
      {showChrome && (
        <Navbar 
          currentPage="registration" 
          onNavigate={() => {}}
          onLogin={() => {}}
        />
      )}
      
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6" aria-busy={isLoading}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 mb-4">
              <Sparkles className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {stage === 'basic' && 'Create your account'}
              {stage === 'otp-verification' && 'Verify your identity'}
              {stage === 'success' && 'Welcome to GidiPIN'}
            </h1>
            <p className="text-white/60 text-sm">
              {stage === 'basic' && 'Start your professional identity journey today.'}
              {stage === 'otp-verification' && `We sent a code to ${activeContact}`}
              {stage === 'success' && 'Your account has been successfully created.'}
            </p>
          </div>

          <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl">
            <CardContent className="p-6 sm:p-8">
              <div className="space-y-6">
                
                {stage === 'basic' && (
                  <>
                    {/* User Type Selector - Only show at start of registration */}
                    <UserTypeSelector 
                      selectedType={userType}
                      onTypeChange={handleUserTypeChange}
                    />
                    
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
                  </>
                )}

                {stage === 'otp-verification' && (
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
                )}

                {stage === 'success' && (
                  <SuccessView />
                )}

              </div>
            </CardContent>
          </Card>
          
          <p className="text-center text-white/40 text-[10px] sm:text-xs mt-8 px-4 leading-relaxed">
            By creating an account, you agree to the <a href="/terms" className="underline hover:text-white/60">Terms of Service</a>. For more information about GidiPIN's privacy practices, see the <a href="/privacy" className="underline hover:text-white/60">GidiPIN Privacy Statement</a>. We'll occasionally send you account-related emails.
          </p>
        </motion.div>
      </main>
      
      {showChrome && (
        <div className="py-6 text-center text-white/20 text-xs">
          &copy; {new Date().getFullYear()} GidiPIN. All rights reserved.
        </div>
      )}
    </div>
  )
}
