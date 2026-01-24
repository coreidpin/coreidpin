import React from 'react'
import { Button } from '../../ui/button'
import { OTPInput } from '../../ui/otp-input'
import { Loader2, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { colors } from '../../../styles/designSystem'
import { Skeleton } from '../../ui/skeleton'

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
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={isLoading ? { opacity: 1, scale: 1 } : { opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <form onSubmit={(e) => { e.preventDefault(); onVerify(); }} className="space-y-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 hover:opacity-80 text-sm transition-colors -mt-2"
          style={{ color: '#9ca3af' }}
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
          {isLoading ? (
            <Skeleton className="w-full h-14 rounded-xl" />
          ) : (
            <Button
              type="submit"
              disabled={otp.length !== 6}
              className={`w-full h-14 rounded-xl font-medium text-base transition-all hover:brightness-110 ${otp.length === 6 ? 'animate-ready-glow' : ''}`}
              style={{ 
                backgroundColor: colors.brand.primary[600], 
                color: colors.white,
                boxShadow: otp.length === 6 ? '0 0 20px rgba(99, 102, 241, 0.3)' : 'none'
              }}
            >
              Verify Code
            </Button>
          )}
          
          <div className="text-left text-sm pt-2">
            <p style={{ color: '#9ca3af' }} className="mb-2">Didn't receive a code?</p>
            <button
              onClick={onResend}
              type="button"
              disabled={!canResend || resendCountdown > 0 || isLoading}
              className="text-indigo-400 hover:text-indigo-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {resendCountdown > 0 
                ? `Resend code in ${resendCountdown}s`
                : 'Resend Code'
              }
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  )
}
