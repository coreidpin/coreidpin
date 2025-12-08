import React, { useState } from 'react';
import { OTPRequestForm } from './OTPRequestForm';
import { OTPVerifyForm } from './OTPVerifyForm';
import { PINSetupForm } from './PINSetupForm';
import { PINVerifyForm } from './PINVerifyForm';
import { supabase } from '../../utils/supabase/client';

interface AuthContainerProps {
  onLoginSuccess: (accessToken: string, user: any) => void;
}

type AuthStep = 'request' | 'verify_otp' | 'setup_pin' | 'verify_pin';

export const AuthContainer: React.FC<AuthContainerProps> = ({ onLoginSuccess }) => {
  const [step, setStep] = useState<AuthStep>('request');
  const [contact, setContact] = useState('');
  const [contactType, setContactType] = useState<'phone' | 'email'>('phone');
  const [regToken, setRegToken] = useState('');

  const handleOTPRequestSuccess = (newContact: string, newType: 'phone' | 'email') => {
    setContact(newContact);
    setContactType(newType);
    setStep('verify_otp');
  };

  const handleOTPVerifySuccess = (token: string, nextStep: 'pin_setup' | 'pin_required') => {
    setRegToken(token);
    setStep(nextStep === 'pin_setup' ? 'setup_pin' : 'verify_pin');
  };

  const handleBackToRequest = () => {
    setStep('request');
    setContact('');
  };

  const handleForgotPin = () => {
    // To reset PIN, we restart the flow (OTP proves identity)
    // In a real app, we might have a specific reset flow, but OTP is the recovery mechanism here.
    setStep('request');
    setContact('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">
            GidiPIN Login
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Secure Passwordless Authentication
          </p>
        </div>

        {step === 'request' && (
          <OTPRequestForm onSuccess={handleOTPRequestSuccess} />
        )}

        {step === 'verify_otp' && (
          <OTPVerifyForm 
            contact={contact} 
            contactType={contactType} 
            onSuccess={handleOTPVerifySuccess}
            onBack={handleBackToRequest}
          />
        )}

        {step === 'setup_pin' && (
          <PINSetupForm 
            regToken={regToken} 
            onSuccess={async (accessToken, user) => {
              // Set session in Supabase client
              await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: accessToken // Using access token as dummy refresh token for now
              });
              onLoginSuccess(accessToken, user);
            }} 
          />
        )}

        {step === 'verify_pin' && (
          <PINVerifyForm 
            regToken={regToken} 
            onSuccess={async (accessToken, user) => {
              // Set session in Supabase client
              await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: accessToken // Using access token as dummy refresh token for now
              });
              onLoginSuccess(accessToken, user);
            }}
            onForgotPin={handleForgotPin}
          />
        )}
      </div>
    </div>
  );
};
