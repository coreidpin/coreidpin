import React, { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { toast } from 'sonner'
import { api } from '../utils/api'
import { initAuth } from '../utils/auth'
import { supabase } from '../utils/supabase/client'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { Sparkles, Loader2, Users, Mail, CheckCircle, ArrowLeft } from 'lucide-react'
import { RegistrationStateManager } from '../utils/registrationState'
import { CountryCodeSelect } from './ui/country-code-select'
import { getDefaultCountry, isCountrySupported } from '../utils/countryCodes'
import { OTPInput } from './ui/otp-input'

type SimpleRegistrationProps = {
  onComplete?: () => void
  onBack?: () => void
  showChrome?: boolean
}

type FormData = {
  name: string
  email: string
  phone: string
}

function validateEmail(email: string) {
  if (!email) return 'Email is required'
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) ? null : 'Enter a valid email address'
}

function validatePhone(phone: string) {
  if (!phone) return null // Optional field
  const phoneRegex = /^[+]?[1-9]\d{1,14}$/
  return phoneRegex.test(phone.replace(/\s/g, '')) ? null : 'Enter a valid phone number'
}

export default function SimpleRegistration({ onComplete, onBack, showChrome = true }: SimpleRegistrationProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '', email: '', phone: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  
  // Stages: basic -> otp-verification -> success
  const [stage, setStage] = useState<'basic' | 'otp-verification' | 'success'>('basic')
  
  const [countryCode, setCountryCode] = useState(getDefaultCountry().code)
  const [countryError, setCountryError] = useState('')
  
  // OTP State
  const [otp, setOtp] = useState('')
  const [contactType, setContactType] = useState<'phone' | 'email'>('phone')
  const [activeContact, setActiveContact] = useState('')
  
  // PIN State removed
  // const [pin, setPin] = useState('')
  // const [confirmPin, setConfirmPin] = useState('')
  // const [regToken, setRegToken] = useState('')

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
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
      // Request OTP
      await api.requestOTP(contact, type)
      
      setActiveContact(contact)
      setContactType(type)
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
      toast.error(err.message || 'Failed to send OTP')
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
        phone: formData.phone
      }, true)
      
      if (result.access_token) {
        // Handle successful login/registration directly
        localStorage.setItem('accessToken', result.access_token)
        localStorage.setItem('refreshToken', result.access_token) // Save refresh token for session persistence
        localStorage.setItem('isAuthenticated', 'true')
        localStorage.setItem('userId', result.user?.id || '')
        
        await supabase.auth.setSession({
          access_token: result.access_token,
          refresh_token: result.access_token // Using access token as dummy refresh token
        })
        
        await initAuth()
        
        RegistrationStateManager.markCompleted()
        setStage('success')
        toast.success('Registration completed successfully')
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (err: any) {
      console.error('OTP verification failed:', err)
      toast.error(err.message || 'Invalid OTP')
    } finally {
      setIsLoading(false)
    }
  }

  // PIN setup handler removed

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
                
                {/* STAGE 1: BASIC INFO */}
                {stage === 'basic' && (
                  <div className="space-y-5">
                    {onBack && (
                      <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors -mt-2 mb-2"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back</span>
                      </button>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="quick-name" className="text-sm font-medium text-white/80 ml-1">Full Name</Label>
                      <div className="flex items-center h-14 px-4 bg-white/5 border border-white/10 rounded-xl focus-within:border-blue-500/50 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all group">
                        <Users className="h-5 w-5 text-white/40 group-focus-within:text-blue-400 transition-colors shrink-0 mr-3" />
                        <input
                          id="quick-name"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={(e) => updateField('name', e.target.value)}
                          className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/40 h-full w-full text-base"
                          aria-invalid={!!errors.name}
                        />
                      </div>
                      {errors.name && <p className="text-xs text-red-400 ml-1">{errors.name}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="quick-phone" className="text-sm font-medium text-white/80 ml-1">Phone Number</Label>
                      <div className="flex items-center h-14 bg-white/5 border border-white/10 rounded-xl focus-within:border-blue-500/50 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all group">
                        <CountryCodeSelect
                          value={countryCode}
                          onChange={(code) => {
                            setCountryCode(code)
                            setCountryError('')
                          }}
                          onUnsupportedSelect={(country) => {
                            setCountryError(`We're coming to ${country.name} soon! Currently only supporting Nigeria.`)
                          }}
                          className="h-full bg-transparent border-none text-white focus:ring-0 w-[100px] pl-3"
                        />
                        <div className="w-px h-6 bg-white/10" />
                        <input
                          id="quick-phone"
                          type="tel"
                          placeholder="803 123 4567"
                          value={formData.phone}
                          onChange={(e) => {
                            updateField('phone', e.target.value)
                            setCountryError('')
                          }}
                          className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/40 h-full w-full text-base px-4"
                          aria-invalid={!!(errors.phone || countryError)}
                        />
                      </div>
                      {errors.phone && <p className="text-xs text-red-400 ml-1">{errors.phone}</p>}
                      {countryError && <p className="text-xs text-orange-400 ml-1">{countryError}</p>}
                    </div>
                    
                    <div className="relative py-2">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-white/10" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-[#0a0b0d] px-2 text-white/40">Or continue with email</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="quick-email" className="text-sm font-medium text-white/80 ml-1">Email Address</Label>
                      <div className="flex items-center h-14 px-4 bg-white/5 border border-white/10 rounded-xl focus-within:border-blue-500/50 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all group">
                        <Mail className="h-5 w-5 text-white/40 group-focus-within:text-blue-400 transition-colors shrink-0 mr-3" />
                        <input
                          id="quick-email"
                          type="email"
                          placeholder="you@example.com"
                          value={formData.email}
                          onChange={(e) => updateField('email', e.target.value)}
                          className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/40 h-full w-full text-base"
                          aria-invalid={!!errors.email}
                        />
                      </div>
                      {errors.email && <p className="text-xs text-red-400 ml-1">{errors.email}</p>}
                    </div>

                    <Button
                      onClick={handleStartRegistration}
                      disabled={isLoading}
                      className="w-full h-14 bg-white text-black hover:bg-white/90 rounded-xl font-medium text-base shadow-lg shadow-white/5 transition-all mt-2"
                    >
                      {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Continue'}
                    </Button>
                  </div>
                )}

                {/* STAGE 2: OTP VERIFICATION */}
                {stage === 'otp-verification' && (
                  <div className="space-y-8">
                    <button
                      onClick={() => setStage('basic')}
                      className="flex items-center gap-2 text-white hover:text-white/80 text-sm transition-colors -mt-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>Back to form</span>
                    </button>
                    
                    <div className="flex justify-center py-4">
                      <OTPInput
                        value={otp}
                        onChange={setOtp}
                        length={6}
                        className="gap-2"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <Button
                        onClick={handleVerifyOTP}
                        disabled={isLoading || otp.length !== 6}
                        className="w-full h-14 bg-white text-black hover:bg-white/90 rounded-xl font-medium text-base shadow-lg shadow-white/5 transition-all"
                      >
                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Verify Code'}
                      </Button>
                    </div>
                  </div>
                )}

                {/* STAGE 3: PIN SETUP REMOVED */}

                {/* STAGE 4: SUCCESS */}
                {stage === 'success' && (
                  <div className="text-center space-y-6 py-4">
                    <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle className="h-10 w-10 text-green-500" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-white">Registration Complete!</h3>
                      <p className="text-white/60">Your secure digital identity is ready.</p>
                    </div>
                    <Button
                      onClick={() => window.location.href = '/dashboard'}
                      className="w-full h-14 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium text-base shadow-lg shadow-green-900/20 transition-all"
                    >
                      Go to Dashboard
                    </Button>
                  </div>
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