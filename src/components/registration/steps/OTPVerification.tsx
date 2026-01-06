import React from 'react'
import { Button } from '../../ui/button'
import { OTPInput } from '../../ui/otp-input'
import { Loader2, ArrowLeft } from 'lucide-react'

type OTPVerificationProps = {
  otp: string
  setOtp: (otp: string) => void
  isLoading: boolean
  resendCountdown: number
  canResend: boolean
  onVerify: () => void
  onResend: () => void
  onBack: () => void
}

export function OTPVerification({
  otp,
  setOtp,
  isLoading,
  resendCountdown,
  canResend,
  onVerify,
  onResend,
  onBack
}: OTPVerificationProps) {
  return (
    <div className="space-y-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-white hover:text-white/80 text-sm transition-colors -mt-2"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to form</span>
      </button>
      
      <div className="flex justify-start py-4">
        <OTPInput
          value={otp}
          onChange={setOtp}
          length={6}
          className="gap-2"
        />
      </div>
      
      <div className="space-y-3">
        <Button
          onClick={onVerify}
          disabled={isLoading || otp.length !== 6}
          className="w-full h-14 bg-white text-black hover:bg-white/90 rounded-xl font-medium text-base shadow-lg shadow-white/5 transition-all"
        >
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Verify Code'}
        </Button>
        
        <div className="text-left text-sm pt-2">
          <p className="text-white/60 mb-2">Didn't receive a code?</p>
          <button
            onClick={onResend}
            disabled={!canResend || resendCountdown > 0 || isLoading}
            className="text-blue-400 hover:text-blue-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {resendCountdown > 0 
              ? `Resend code in ${resendCountdown}s`
              : 'Resend Code'
            }
          </button>
        </div>
      </div>
    </div>
  )
}
