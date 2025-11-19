import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Phone, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  MessageSquare,
  Clock,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../utils/api';
import { RegistrationStateManager, RegistrationErrorHandler } from '../utils/registrationState';
import { CountryCodeSelect } from './ui/country-code-select';
import { getDefaultCountry, isCountrySupported, getCountryByCode } from '../utils/countryCodes';

interface RegistrationPhoneVerificationProps {
  name: string;
  email?: string;
  onVerificationComplete: (phoneNumber: string, regToken: string) => void;
  onBack: () => void;
  onFallbackToEmail: () => void;
}



export function RegistrationPhoneVerification({ 
  name,
  email,
  onVerificationComplete, 
  onBack,
  onFallbackToEmail
}: RegistrationPhoneVerificationProps) {
  const [stage, setStage] = useState<'phone' | 'otp'>('phone');
  const [countryCode, setCountryCode] = useState(getDefaultCountry().code);
  const [countryError, setCountryError] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [regToken, setRegToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [smsFailureCount, setSmsFailureCount] = useState(0);
  
  const maxResends = Number(import.meta.env.VITE_OTP_MAX_SENDS_PER_HOUR || 3);
  const resendCooldown = Number(import.meta.env.VITE_OTP_RESEND_COOLDOWN || 90);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  // Load existing registration state
  useEffect(() => {
    const state = RegistrationStateManager.get();
    if (state.step === 'phone_verification' && state.phone) {
      const digits = state.phone.replace(/\D/g, '');
      if (digits.startsWith('234')) {
        setCountryCode('+234');
        setPhoneNumber(formatPhoneNumber(digits.slice(3)));
      } else if (digits.startsWith('1')) {
        setCountryCode('+1');
        setPhoneNumber(formatPhoneNumber(digits.slice(1)));
      }
    }
  }, []);

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (countryCode === '+234' && digits.length >= 4) {
      return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 11)}`;
    }
    return digits;
  };

  const validatePhoneNumber = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    if (countryCode === '+234' && digits.length !== 11) {
      return 'Nigerian phone numbers must be 11 digits';
    }
    if (countryCode === '+1' && digits.length !== 10) {
      return 'US phone numbers must be 10 digits';
    }
    if (digits.length < 7 || digits.length > 15) {
      return 'Phone number must be 7-15 digits';
    }
    return null;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
    setError('');
  };

  const handleSendOTP = async () => {
    const fullPhone = countryCode + phoneNumber.replace(/\D/g, '');
    
    // Check country support
    if (!isCountrySupported(countryCode)) {
      const country = getCountryByCode(countryCode);
      setCountryError(`We're coming to ${country?.name || 'your country'} soon! Currently only supporting Nigeria.`);
      return;
    }
    
    const validationError = validatePhoneNumber(phoneNumber);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError('');
    setCountryError('');

    try {
      const result = await api.sendRegistrationOTP(fullPhone, name, email);
      setRegToken(result.reg_token || '');
      
      // Save registration state
      RegistrationStateManager.save({
        step: 'phone_verification',
        name,
        email,
        phone: fullPhone,
        regToken: result.reg_token
      });
      
      setStage('otp');
      setTimeLeft(resendCooldown);
      setCanResend(false);
      setResendCount(prev => prev + 1);
      setSmsFailureCount(0); // Reset failure count on success
      toast.success('OTP sent to your phone!');
    } catch (error: any) {
      const newFailureCount = smsFailureCount + 1;
      setSmsFailureCount(newFailureCount);
      
      const errorMessage = RegistrationErrorHandler.getErrorMessage(error, 'phone');
      setError(errorMessage);
      
      // Check if we should fallback to email
      if (RegistrationErrorHandler.shouldFallbackToEmail(error, newFailureCount)) {
        toast.error('SMS service unavailable. Switching to email registration.');
        setTimeout(() => onFallbackToEmail(), 2000);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const fullPhone = countryCode + phoneNumber.replace(/\D/g, '');
      const result = await api.verifyRegistrationOTP(fullPhone, otp, regToken);
      
      // Mark phone as verified in state
      RegistrationStateManager.markPhoneVerified(fullPhone, regToken);
      
      onVerificationComplete(fullPhone, regToken);
      toast.success('Phone verified successfully!');
    } catch (error: any) {
      const errorMessage = RegistrationErrorHandler.getErrorMessage(error, 'otp');
      setError(errorMessage);
      setOtp('');
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCount >= maxResends) {
      setError('Maximum resend attempts reached');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const fullPhone = countryCode + phoneNumber.replace(/\D/g, '');
      const result = await api.sendRegistrationOTP(fullPhone, name, email);
      setRegToken(result.reg_token || regToken);
      setTimeLeft(resendCooldown);
      setCanResend(false);
      setResendCount(prev => prev + 1);
      setOtp('');
      toast.success('OTP resent successfully!');
    } catch (error: any) {
      const errorMessage = RegistrationErrorHandler.getErrorMessage(error, 'phone');
      setError(errorMessage);
      
      if (RegistrationErrorHandler.handleSMSFailure(error) === 'fallback_email') {
        toast.error('SMS service unavailable. Please try email registration.');
        onFallbackToEmail();
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (stage === 'phone') {
    return (
      <Card className="border-2 border-blue-200 hover:border-blue-300 transition-colors">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-blue-600" />
              Phone Verification
            </CardTitle>
            <Badge className="bg-blue-100 text-blue-700 border-blue-200">
              Recommended
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            We'll send a verification code to confirm your phone number for instant PIN creation.
          </p>

          <div className="space-y-3">
            <div className="flex gap-2">
              <CountryCodeSelect
                value={countryCode}
                onChange={(code) => {
                  setCountryCode(code);
                  setError('');
                  setCountryError('');
                }}
                onUnsupportedSelect={(country) => {
                  setCountryError(`We're coming to ${country.name} soon! Currently only supporting Nigeria.`);
                }}
              />

              <div className="flex-1">
                <Input
                  type="tel"
                  placeholder={countryCode === '+234' ? '0803 123 4567' : 'Phone number'}
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  className="h-11"
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-sm text-red-600"
              >
                <AlertCircle className="h-4 w-4" />
                {error}
              </motion.div>
            )}
            
            {countryError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-sm text-orange-600"
              >
                <AlertCircle className="h-4 w-4" />
                {countryError}
              </motion.div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleSendOTP}
                disabled={!phoneNumber || isLoading || !isCountrySupported(countryCode)}
                className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Code
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={onBack}
                className="h-11"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </div>

            <div className="text-center">
              <Button
                variant="link"
                onClick={onFallbackToEmail}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Use email registration instead
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-600" />
          Enter Verification Code
        </CardTitle>
        <p className="text-sm text-gray-600">
          Code sent to {countryCode} {phoneNumber}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="otp">6-digit code</Label>
          <Input
            id="otp"
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="123456"
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value.replace(/[^0-9]/g, ''));
              setError('');
            }}
            className="text-center text-lg font-mono"
            disabled={isLoading}
          />
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-sm text-red-600"
          >
            <AlertCircle className="h-4 w-4" />
            {error}
          </motion.div>
        )}

        <div className="text-center space-y-2">
          {!canResend ? (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              Resend in {timeLeft}s
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={handleResend}
              disabled={isLoading || resendCount >= maxResends}
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Resend Code ({resendCount}/{maxResends})
                </>
              )}
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleVerifyOTP}
            disabled={otp.length !== 6 || isLoading}
            className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Verify Code
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setStage('phone')}
            className="h-11"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-center">
          <Button
            variant="link"
            onClick={onFallbackToEmail}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Use email registration instead
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}