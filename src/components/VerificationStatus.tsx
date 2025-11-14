import React, { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { toast } from 'sonner'
import { CheckCircle, Clock, Mail, RefreshCw, AlertTriangle } from 'lucide-react'

interface VerificationStatusProps {
  email: string
  onVerified: () => void
  onResendEmail: () => void
}

export function VerificationStatus({ email, onVerified, onResendEmail }: VerificationStatusProps) {
  const [isPolling, setIsPolling] = useState(true)
  const [timeLeft, setTimeLeft] = useState(24 * 60 * 60) // 24 hours in seconds
  const [canResend, setCanResend] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  // Poll for verification status
  useEffect(() => {
    if (!isPolling) return

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/verification-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        })
        
        const data = await response.json()
        
        if (data.verified) {
          setIsPolling(false)
          toast.success('Email verified successfully!')
          onVerified()
        }
      } catch (error) {
        console.error('Polling error:', error)
      }
    }, 5000) // Poll every 5 seconds

    return () => clearInterval(pollInterval)
  }, [isPolling, email, onVerified])

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setCanResend(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown(prev => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [resendCooldown])

  const handleResend = async () => {
    try {
      await onResendEmail()
      setResendCooldown(60) // 1 minute cooldown
      setTimeLeft(24 * 60 * 60) // Reset timer
      setCanResend(false)
      toast.success('Verification email sent!')
    } catch (error) {
      toast.error('Failed to resend email')
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 rounded-full bg-blue-500/20">
              <Mail className="h-8 w-8 text-blue-400" />
            </div>
            <CardTitle className="text-white">Check Your Email</CardTitle>
            <CardDescription className="text-gray-300">
              We've sent a verification link to <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-white/60" />
                <span className="text-sm text-white/60">
                  {timeLeft > 0 ? `Expires in ${formatTime(timeLeft)}` : 'Link expired'}
                </span>
              </div>
              
              {isPolling && (
                <div className="flex items-center justify-center gap-2 text-sm text-blue-400">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Waiting for verification...
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-white">Click the verification link</p>
                    <p className="text-xs text-white/60">Check your email and click the verification button</p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-white">Check spam folder</p>
                    <p className="text-xs text-white/60">The email might be in your spam or junk folder</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleResend}
                disabled={!canResend || resendCooldown > 0}
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10"
              >
                {resendCooldown > 0 
                  ? `Resend in ${resendCooldown}s` 
                  : canResend 
                    ? 'Resend Email' 
                    : 'Resend Available After Expiry'
                }
              </Button>

              <Button
                onClick={() => window.location.href = '/login'}
                variant="ghost"
                className="w-full text-white/60 hover:text-white hover:bg-white/5"
              >
                Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}