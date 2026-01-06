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
    <AuthLayout>
      <div className="w-full" aria-busy={isLoading}>
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

        <div className="space-y-6">
          {stage === 'basic' && (
            <>
              {/* User Type Tab-style selector for left-aligned layout */}
              <div className="mb-8 p-1 bg-white/5 rounded-xl border border-white/10 flex">
                <button
                  onClick={() => handleUserTypeChange('professional')}
                  style={{ 
                    flex: 1, 
                    padding: '8px 16px', 
                    borderRadius: '8px', 
                    fontSize: '14px', 
                    fontWeight: 500, 
                    transition: 'all 0.2s',
                    backgroundColor: userType === 'professional' ? 'white' : 'transparent',
                    color: userType === 'professional' ? 'black' : '#94a3b8'
                  }}
                >
                  Professional
                </button>
                <button
                  onClick={() => handleUserTypeChange('business')}
                  style={{ 
                    flex: 1, 
                    padding: '8px 16px', 
                    borderRadius: '8px', 
                    fontSize: '14px', 
                    fontWeight: 500, 
                    transition: 'all 0.2s',
                    backgroundColor: userType === 'business' ? 'white' : 'transparent',
                    color: userType === 'business' ? 'black' : '#94a3b8'
                  }}
                >
                  Business
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

        {stage === 'basic' && (
          <p className="text-left text-[10px] sm:text-xs mt-8 px-1 leading-relaxed" style={{ color: '#64748b' }}>
            By creating an account, you agree to our <a href="/terms" className="underline hover:text-white" style={{ color: '#94a3b8' }}>Terms</a> and <a href="/privacy" className="underline hover:text-white" style={{ color: '#94a3b8' }}>Privacy Policy</a>.
          </p>
        )}
      </div>
    </AuthLayout>
  )
}
