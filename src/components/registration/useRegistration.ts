import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { api } from '../../utils/api'
import { initAuth } from '../../utils/auth'
import { supabase } from '../../utils/supabase/client'
import { RegistrationStateManager } from '../../utils/registrationState'
import { getDefaultCountry, isCountrySupported } from '../../utils/countryCodes'

export type FormData = {
  name: string
  email: string
  phone: string
  userType?: string
}

export type RegistrationStage = 'basic' | 'otp-verification' | 'success'

export function useRegistration() {
  const [formData, setFormData] = useState<FormData>({
    name: '', email: '', phone: '', userType: 'professional'
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  
  // Stages: basic -> otp-verification -> success
  const [stage, setStage] = useState<RegistrationStage>('basic')
  
  const [countryCode, setCountryCode] = useState(getDefaultCountry().code)
  const [countryError, setCountryError] = useState('')
  
  // OTP State
  const [otp, setOtp] = useState('')
  const [contactType, setContactType] = useState<'phone' | 'email'>('phone')
  const [activeContact, setActiveContact] = useState('')
  const [resendCountdown, setResendCountdown] = useState(0)
  const [canResend, setCanResend] = useState(false)

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const validateEmail = (email: string) => {
    if (!email) return 'Email is required'
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email) ? null : 'Enter a valid email address'
  }

  const validatePhone = (phone: string) => {
    if (!phone) return null // Optional field
    const phoneRegex = /^[+]?[1-9]\d{1,14}$/
    return phoneRegex.test(phone.replace(/\s/g, '')) ? null : 'Enter a valid phone number'
  }

  const handleStartRegistration = async () => {
    const newErrors: Record<string, string> = {}
    const name = (formData.name || '').trim()
    const email = (formData.email || '').trim()
    const phone = (formData.phone || '').trim()
    
    if (!name) newErrors.name = 'Full name is required'
    
    // Determine primary contact method
    let type: 'phone' | 'email' = 'phone'
    let contact = ''

    if (phone) {
      if (!isCountrySupported(countryCode)) {
        setCountryError("We're coming to your country soon! Currently only supporting Nigeria.")
        return
      }
      const fullPhone = countryCode + phone.replace(/\D/g, '')
      const phoneErr = validatePhone(fullPhone)
      if (phoneErr) newErrors.phone = phoneErr
      else {
        contact = fullPhone
        type = 'phone'
      }
    } else if (email) {
      const emailErr = validateEmail(email)
      if (emailErr) newErrors.email = emailErr
      else {
        contact = email
        type = 'email'
      }
    } else {
      newErrors.phone = 'Phone number or email is required'
    }
    
    setErrors(newErrors)
    setCountryError('')
    if (Object.keys(newErrors).length > 0) return
    
    setIsLoading(true)
    try {
      // Request OTP with createAccount=true
      await api.requestOTP(contact, type, true)
      
      setContactType(type)
      setActiveContact(contact)
      setOtp('') // Clear previous OTP
      setResendCountdown(60) // Start 60-second countdown
      setCanResend(false)
      setStage('otp-verification')
      
      // Save partial state
      RegistrationStateManager.save({
        step: 'phone_verification',
        name,
        email: type === 'email' ? contact : email,
        phone: type === 'phone' ? contact : phone
      })
      
      toast.success(`OTP sent to ${contact}`)
    } catch (err: any) {
      console.error('Registration start failed:', err)
      if (err.message?.includes('Account already exists')) {
        toast.error('Account already exists', {
          description: 'Please log in instead.',
          action: {
            label: 'Log In',
            onClick: () => window.location.href = '/login'
          }
        })
      } else {
        toast.error(err.message || 'Failed to send OTP')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Start countdown timer for OTP resend
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (stage === 'otp-verification') {
      setCanResend(true)
    }
  }, [resendCountdown, stage])

  const handleResendOTP = async () => {
    if (!canResend || resendCountdown > 0) return

    setIsLoading(true)
    try {
      await api.requestOTP(activeContact, contactType)
      setOtp('') // Clear previous OTP
      setResendCountdown(60) // 60 second countdown
      setCanResend(false)
      toast.success('New verification code sent!')
    } catch (err: any) {
      console.error('Resend OTP failed:', err)
      toast.error(err.message || 'Failed to resend code')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP')
      return
    }

    setIsLoading(true)
    try {
      // Send registration metadata along with OTP
      const result = await api.verifyOTP(activeContact, otp, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        userType: formData.userType
      }, true)
      
      if (result.access_token) {
        // Handle successful login/registration directly
        localStorage.setItem('accessToken', result.access_token)
        localStorage.setItem('refreshToken', result.access_token) 
        localStorage.setItem('isAuthenticated', 'true')
        localStorage.setItem('userId', result.user?.id || '')
        localStorage.setItem('userType', formData.userType || 'professional')
        
        // Initialize auth state
        await initAuth()
        
        RegistrationStateManager.markCompleted()
        setStage('success')
        toast.success('Registration completed successfully')
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (err: any) {
      console.error('OTP verification failed:', err)
      
      // Improved error handling
      if (err.message?.toLowerCase().includes('expired')) {
        toast.error('Your verification code has expired.', {
          description: 'Please click "Resend Code" to get a new one.',
        })
      } else if (err.message?.toLowerCase().includes('invalid')) {
        toast.error('Invalid verification code', {
          description: 'Please check your code and try again.',
        })
      } else if (err.message?.toLowerCase().includes('already exists') || err.message?.toLowerCase().includes('already registered')) {
        toast.error('Account already exists', {
          description: 'Please try logging in instead.',
          action: {
            label: 'Go to Login',
            onClick: () => window.location.href = '/login'
          }
        })
      } else if (err.message?.toLowerCase().includes('deleted') || err.code === 'ACCOUNT_DELETED') {
        toast.error('Registration was not completed', {
          description: 'Your previous registration attempt was incomplete. Please start over.',
          action: {
            label: 'Start Over',
            onClick: () => {
              setStage('basic')
              setOtp('')
              setFormData({ name: '', email: '', phone: '', userType: 'professional' })
              setResendCountdown(0)
              setCanResend(false)
            }
          },
          duration: 10000,
        })
      } else {
        toast.error(err.message || 'Verification failed', {
          description: 'Please try again or request a new code.',
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })
      if (error) {
        toast.error(error.message)
        setIsLoading(false)
      }
    } catch (err: any) {
      toast.error(err.message || 'Google sign-in failed')
      setIsLoading(false)
    }
  }

  return {
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
    contactType,
    activeContact,
    resendCountdown,
    setResendCountdown,
    canResend,
    setCanResend,
    updateField,
    handleStartRegistration,
    handleResendOTP,
    handleVerifyOTP,
    handleGoogleSignIn
  }
}
