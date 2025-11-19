import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Phone, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Shield,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';
import { OTPModal } from './OTPModal';
import { api } from '../utils/api';
import { CountryCodeSelect } from './ui/country-code-select';
import { getDefaultCountry, isCountrySupported, getCountryByCode } from '../utils/countryCodes';

interface PhoneVerificationProps {
  onVerificationComplete: (phoneNumber: string) => void;
  initialPhone?: string;
  isVerified?: boolean;
}



export function PhoneVerification({ 
  onVerificationComplete, 
  initialPhone = '', 
  isVerified = false 
}: PhoneVerificationProps) {
  const [countryCode, setCountryCode] = useState(getDefaultCountry().code);
  const [countryError, setCountryError] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(initialPhone);
  const [isLoading, setIsLoading] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [verified, setVerified] = useState(isVerified);
  const [error, setError] = useState('');

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format based on country code
    if (countryCode === '+1') {
      // US format: (123) 456-7890
      if (digits.length >= 6) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
      } else if (digits.length >= 3) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
      }
    } else if (countryCode === '+234') {
      // Nigerian format: 0803 123 4567
      if (digits.length >= 7) {
        return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 11)}`;
      } else if (digits.length >= 4) {
        return `${digits.slice(0, 4)} ${digits.slice(4)}`;
      }
    }
    
    return digits;
  };

  const validatePhoneNumber = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    
    if (countryCode === '+1' && digits.length !== 10) {
      return 'US phone numbers must be 10 digits';
    }
    if (countryCode === '+234' && digits.length !== 11) {
      return 'Nigerian phone numbers must be 11 digits';
    }
    if (countryCode === '+44' && (digits.length < 10 || digits.length > 11)) {
      return 'UK phone numbers must be 10-11 digits';
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

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      // Call API to send OTP
      await api.sendPhoneOTP(fullPhone, accessToken);
      
      setShowOTPModal(true);
      toast.success('OTP sent to your phone!');
    } catch (error: any) {
      setError(error.message || 'Failed to send OTP');
      toast.error('Failed to send OTP: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerified = (phone: string) => {
    setVerified(true);
    setShowOTPModal(false);
    onVerificationComplete(phone);
    toast.success('Phone number verified successfully!');
  };

  if (verified) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-4 rounded-lg border-2 border-green-200 bg-green-50"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
            <CheckCircle className="h-5 w-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-green-800">Phone Verified</h4>
            <p className="text-sm text-green-600">
              {countryCode} {phoneNumber}
            </p>
          </div>
          <Badge className="ml-auto bg-green-100 text-green-800 border-green-300">
            Verified
          </Badge>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <Card className="border-2 border-blue-200 hover:border-blue-300 transition-colors">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Phone className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold">Phone Number</h4>
                  <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                    Required for PIN
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                  We'll send a verification code to confirm your phone number
                </p>
              </div>

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

                  {/* Phone Number Input */}
                  <div className="flex-1">
                    <Input
                      type="tel"
                      placeholder={countryCode === '+1' ? '(555) 123-4567' : 
                                 countryCode === '+234' ? '0803 123 4567' : 
                                 'Phone number'}
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

                <Button
                  onClick={handleSendOTP}
                  disabled={!phoneNumber || isLoading || !isCountrySupported(countryCode)}
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send Verification Code
                    </>
                  )}
                </Button>
              </div>

              {/* Security Notice */}
              <div className="bg-gray-50 rounded-lg p-3 border">
                <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-gray-600">
                    <p className="font-medium mb-1">Your privacy is protected</p>
                    <p>We use your phone number only for verification. It will never be shared with third parties.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* OTP Modal */}
      <OTPModal
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        phoneNumber={countryCode + phoneNumber.replace(/\D/g, '')}
        onVerified={handleOTPVerified}
        onResend={handleSendOTP}
      />
    </>
  );
}