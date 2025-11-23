import React from 'react'
import { motion } from 'motion/react'
import { Card, CardContent } from './ui/card'
import { Navbar } from './Navbar'
import { Sparkles } from 'lucide-react'
import { useRegistration } from './registration/useRegistration'
import { BasicInfoForm } from './registration/steps/BasicInfoForm'
import { OTPVerification } from './registration/steps/OTPVerification'
import { SuccessView } from './registration/steps/SuccessView'

type SimpleRegistrationProps = {
  onComplete?: () => void
  onBack?: () => void
  showChrome?: boolean
}

export default function SimpleRegistration({ onComplete, onBack, showChrome = true }: SimpleRegistrationProps) {
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

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-white flex flex-col">
      {showChrome && (
        <Navbar 
          currentPage="registration" 
          onNavigate={(page) => console.log('Navigate to:', page)}
          onLogin={(userType) => console.log('Login as:', userType)}
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
              {stage === 'success' && 'Welcome to CoreID'}
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
          
          <p className="text-center text-white/40 text-xs mt-8">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </motion.div>
      </main>
      
      {showChrome && (
        <div className="py-6 text-center text-white/20 text-xs">
          &copy; {new Date().getFullYear()} CoreID. All rights reserved.
        </div>
      )}
    </div>
  )
}