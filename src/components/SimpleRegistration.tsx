import React, { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { toast } from 'sonner'
import { api } from '../utils/api'
import { initAuth } from '../utils/auth'
import { supabase } from '../utils/supabase/client'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { Logo } from './Logo'
import '../styles/auth-dark.css'
import { Sparkles, ArrowLeft, ArrowRight, Loader2, Users, Mail, Briefcase, MapPin, Lock, Eye, EyeOff, CheckCircle, AlertCircle, Shield, HelpCircle } from 'lucide-react'
import { RegistrationPhoneVerification } from './RegistrationPhoneVerification'
import { RegistrationStateManager } from '../utils/registrationState'
import { CountryCodeSelect } from './ui/country-code-select'
import { getDefaultCountry, isCountrySupported, getCountryByCode } from '../utils/countryCodes'

type SimpleRegistrationProps = {
  onComplete?: () => void
  onBack?: () => void
  showChrome?: boolean
}

type FormData = {
  name: string
  email: string
  title: string
  phone: string
  location: string
  password: string
  confirmPassword: string
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

function calculatePasswordStrength(password: string): { score: number; feedback: string[] } {
  const feedback: string[] = []
  let score = 0
  
  if (password.length >= 8) score += 25
  else feedback.push('At least 8 characters')
  
  if (/[a-z]/.test(password)) score += 25
  else feedback.push('Lowercase letter')
  
  if (/[A-Z]/.test(password)) score += 25
  else feedback.push('Uppercase letter')
  
  if (/[0-9]/.test(password)) score += 12.5
  else feedback.push('Number')
  
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 12.5
  else feedback.push('Special character')
  
  return { score, feedback }
}

function validatePassword(password: string) {
  if (!password) return 'Password is required'
  const { score } = calculatePasswordStrength(password)
  if (score < 75) return 'Password is too weak'
  return null
}

export default function SimpleRegistration({ onComplete, onBack, showChrome = true }: SimpleRegistrationProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '', email: '', title: '', phone: '', location: '', password: '', confirmPassword: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: [] as string[] })
  const [isEmailChecking, setIsEmailChecking] = useState(false)
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null)
  const [pinInput, setPinInput] = useState('')
  const [pinError, setPinError] = useState('')
  const [pinVerified, setPinVerified] = useState(false)
  const [pinLoading, setPinLoading] = useState(false)
  const normalizePin = (raw: string) => (raw || '').toUpperCase().replace(/^PIN-/, '')
  const isValidPinFormat = (raw: string) => {
    const v = normalizePin(raw)
    return /^[A-Z0-9]{3}-[A-Z0-9]{3}-[A-Z0-9]{6}$/.test(v)
  }
  const sanitizedPin = (raw: string) => normalizePin(raw).replace(/[^A-Z0-9-]/g, '')
  const [stage, setStage] = useState<'basic' | 'phone-verification' | 'email-form' | 'success'>('basic')
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [verifiedPhone, setVerifiedPhone] = useState('')
  const [registrationToken, setRegistrationToken] = useState('')
  const [countryCode, setCountryCode] = useState(getDefaultCountry().code)
  const [countryError, setCountryError] = useState('')
  const [regToken, setRegToken] = useState<string>('')
  const [otp, setOtp] = useState('')
  const [otpError, setOtpError] = useState('')
  const [resendCooldown, setResendCooldown] = useState<number>(0)
  const [otpExpiresIn, setOtpExpiresIn] = useState<number>(0)
  const [resendCount, setResendCount] = useState<number>(0)
  const maxResends = Number(import.meta.env.VITE_OTP_MAX_SENDS_PER_HOUR || 3)
  const resendDefault = Number(import.meta.env.VITE_OTP_RESEND_COOLDOWN || 90)
  const requireEmailVerification = String(import.meta.env.VITE_REQUIRE_EMAIL_VERIFICATION || 'false') === 'true'
  const defaultCountryCode = String(import.meta.env.VITE_DEFAULT_COUNTRY_CODE || '')

  useEffect(() => {
    if (resendCooldown > 0) {
      const t = setInterval(() => setResendCooldown(prev => (prev > 0 ? prev - 1 : 0)), 1000)
      return () => clearInterval(t)
    }
  }, [resendCooldown])

  useEffect(() => {
    if (otpExpiresIn > 0) {
      const t = setInterval(() => setOtpExpiresIn(prev => (prev > 0 ? prev - 1 : 0)), 1000)
      return () => clearInterval(t)
    }
  }, [otpExpiresIn])

  const normalizePhoneLocal = (raw: string) => {
    let p = (raw || '').replace(/\s+/g, '')
    if (p.startsWith('0') && defaultCountryCode.startsWith('+')) p = `${defaultCountryCode}${p.slice(1)}`
    if (!p.startsWith('+') && defaultCountryCode) p = `${defaultCountryCode}${p}`
    return p
  }
  const maskPhone = (p: string) => {
    const s = (p || '').replace(/\s+/g, '')
    if (!s) return ''
    const pref = s.startsWith('+') ? s.slice(0, 4) : ''
    const tail = s.slice(-2)
    return `${pref}••••••••${tail}`
  }

  const handleQuickContinue = async () => {
    const newErrors: Record<string, string> = {}
    const name = (formData.name || '').trim()
    const email = (formData.email || '').trim()
    const phone = (formData.phone || '').trim()
    
    if (!name) newErrors.name = 'Full name is required'
    
    // Check country support for phone registration
    if (phone && !isCountrySupported(countryCode)) {
      setCountryError("We're coming to your country soon! Currently only supporting Nigeria.")
      return
    }
    
    // Primary: Phone registration
    if (phone) {
      const fullPhone = countryCode + phone.replace(/\D/g, '')
      const phoneErr = validatePhone(fullPhone)
      if (phoneErr) newErrors.phone = phoneErr
    } else if (email) {
      // Fallback: Email registration
      const emailErr = validateEmail(email)
      if (emailErr) newErrors.email = emailErr
    } else {
      newErrors.phone = 'Phone number or email is required'
    }
    
    setErrors(newErrors)
    setCountryError('')
    if (Object.keys(newErrors).length > 0) return
    
    setIsLoading(true)
    try {
      // Save registration state
      const fullPhone = phone ? countryCode + phone.replace(/\D/g, '') : ''
      RegistrationStateManager.save({
        step: 'basic',
        name,
        email,
        phone: fullPhone
      })
      
      if (phone) {
        // Primary: Phone-based registration using dedicated component
        setFormData(prev => ({ ...prev, phone: fullPhone }))
        setStage('phone-verification')
      } else {
        // Fallback: Email-based registration - show password form
        setStage('email-form')
      }
    } catch (err: any) {
      const message = err.message || 'Registration failed'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    try {
      // Check for existing registration session
      const state = RegistrationStateManager.get()
      
      if (state.step === 'phone_verified' && state.phone && state.regToken) {
        setPhoneVerified(true)
        setVerifiedPhone(state.phone)
        setRegistrationToken(state.regToken)
        setFormData(prev => ({
          ...prev,
          name: state.name || prev.name,
          email: state.email || prev.email,
          phone: state.phone || prev.phone
        }))
        setStage('success')
      } else if (RegistrationStateManager.canResumeRegistration()) {
        // Resume from where user left off
        if (state.name) setFormData(prev => ({ ...prev, name: state.name! }))
        if (state.email) setFormData(prev => ({ ...prev, email: state.email! }))
        if (state.phone) setFormData(prev => ({ ...prev, phone: state.phone! }))
      }
    } catch {}
  }, [])

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
    
    // Real-time password strength calculation
    if (field === 'password') {
      setPasswordStrength(calculatePasswordStrength(value))
    }
    
    // Real-time email availability check
    if (field === 'email' && value && validateEmail(value) === null) {
      checkEmailAvailability(value)
    }
  }
  
  const checkEmailAvailability = async (email: string) => {
    setIsEmailChecking(true)
    setEmailAvailable(null)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single()
      
      setEmailAvailable(!data && !error)
    } catch {
      setEmailAvailable(null)
    } finally {
      setIsEmailChecking(false)
    }
  }

  const handleCompleteRegistration = async (phone: string, token: string) => {
    try {
      setIsLoading(true)
      
      // Complete registration with verified phone
      const result = await api.register({
        email: formData.email || `${Date.now()}@phone.coreid.com`,
        password: crypto.randomUUID(),
        name: formData.name,
        userType: 'professional',
        phoneNumber: phone,
        title: formData.title,
        location: formData.location
      })
      
      // Store session data immediately
      if (result.accessToken) {
        localStorage.setItem('accessToken', result.accessToken)
        localStorage.setItem('refreshToken', result.refreshToken || '')
        localStorage.setItem('userType', 'professional')
        localStorage.setItem('isAuthenticated', 'true')
        localStorage.setItem('userId', result.user?.id || '')
        
        // Set Supabase session
        if (result.refreshToken) {
          await supabase.auth.setSession({
            access_token: result.accessToken,
            refresh_token: result.refreshToken
          })
        }
        
        // Initialize auth context
        await initAuth()
        
        // Set session cookie for server-side auth
        await api.setSessionCookie(result.accessToken)
      }
      
      // Mark registration as completed and clear state
      RegistrationStateManager.markCompleted()
      
      setStage('success')
      toast.success('Welcome to CoreID!')
    } catch (err: any) {
      console.error('Registration completion failed:', err)
      toast.error(err.message || 'Registration completion failed')
      setStage('phone-verification')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-white">
      {showChrome && (
        <Navbar 
          currentPage="registration" 
          onNavigate={(page) => console.log('Navigate to:', page)}
          onLogin={(userType) => console.log('Login as:', userType)}
        />
      )}
      
      <header className="reg-header border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="reg-icon-primary h-5 w-5" />
              <span className="auth-subtitle text-sm">Professional Setup</span>
            </div>
            <Badge variant="secondary" className="hidden sm:flex reg-badge">Quick Setup</Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-white" />
            <span className="text-sm">Basic Information</span>
          </div>
        </div>
      </div>

      <main className="mx-auto px-6 py-10" aria-busy={isLoading}>
        <div className="mx-auto max-w-[1600px]">
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card className="mb-6 bg-white/5 backdrop-blur-xl border-white/10 lg:col-span-12 card-fixed mx-auto">
              <CardHeader>
                <CardTitle className="text-white">Quick Registration</CardTitle>
                <CardDescription className="text-gray-300">Get your CoreID PIN instantly with phone verification, or use email as backup.</CardDescription>
              </CardHeader>
              <CardContent className="card-content-scroll">
                <div className="space-y-4">
                  {stage === 'basic' && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="quick-name" className="text-white">Full Name *</Label>
                        <div className="relative">
                          <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
                          <Input
                            id="quick-name"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={(e) => updateField('name', e.target.value)}
                            className="pl-10 bg-transparent border-white/20 text-white placeholder-white/60"
                            aria-invalid={!!errors.name}
                            aria-describedby={errors.name ? 'quick-name-error' : undefined}
                          />
                        </div>
                        {errors.name && <p id="quick-name-error" className="text-xs text-red-600 mt-1">{errors.name}</p>}
                      </div>
                      <div>
                        <Label htmlFor="quick-phone" className="text-white">Phone Number (Recommended)</Label>
                        <div className="flex gap-2">
                          <CountryCodeSelect
                            value={countryCode}
                            onChange={(code) => {
                              setCountryCode(code)
                              setCountryError('')
                            }}
                            onUnsupportedSelect={(country) => {
                              setCountryError(`We're coming to ${country.name} soon! Currently only supporting Nigeria.`)
                            }}
                            className="bg-transparent border-white/20 text-white"
                          />
                          <Input
                            id="quick-phone"
                            type="tel"
                            placeholder={countryCode === '+234' ? '803 123 4567' : 'Phone number'}
                            value={formData.phone}
                            onChange={(e) => {
                              updateField('phone', e.target.value)
                              setCountryError('')
                            }}
                            className="flex-1 bg-transparent border-white/20 text-white placeholder-white/60"
                            aria-invalid={!!(errors.phone || countryError)}
                            aria-describedby={errors.phone ? 'quick-phone-error' : countryError ? 'country-error' : undefined}
                          />
                        </div>
                        {errors.phone && <p id="quick-phone-error" className="text-xs text-red-600 mt-1">{errors.phone}</p>}
                        {countryError && <p id="country-error" className="text-xs text-orange-600 mt-1">{countryError}</p>}
                      </div>
                      <div className="text-center text-white/60 text-xs">OR</div>
                      <div>
                        <Label htmlFor="quick-email" className="text-white">Email (Alternative)</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
                          <Input
                            id="quick-email"
                            type="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={(e) => updateField('email', e.target.value)}
                            className="pl-10 pr-10 bg-transparent border-white/20 text-white placeholder-white/60"
                            aria-invalid={!!errors.email}
                            aria-describedby={errors.email ? 'quick-email-error' : undefined}
                          />
                        </div>
                        {errors.email && <p id="quick-email-error" className="text-xs text-red-600 mt-1">{errors.email}</p>}
                      </div>
                      <Button
                        type="button"
                        className="w-full h-11 bg-white text-black hover:bg-white/90"
                        onClick={handleQuickContinue}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Preparing verification...
                          </>
                        ) : (
                          'Continue'
                        )}
                      </Button>
                    </div>
                  )}
                  {stage === 'email-form' && (
                    <div className="space-y-4">
                      <div className="text-white/80 text-sm mb-4">
                        Complete registration with email and password
                      </div>
                      
                      <div>
                        <Label htmlFor="reg-password" className="text-white">Password *</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
                          <Input
                            id="reg-password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter password"
                            value={formData.password}
                            onChange={(e) => updateField('password', e.target.value)}
                            className="pl-10 pr-10 bg-transparent border-white/20 text-white placeholder-white/60"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
                        
                        {/* Password Strength Indicator */}
                        {formData.password && (
                          <div className="mt-2">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-white/60">Password strength</span>
                              <span className={`${
                                passwordStrength.score >= 75 ? 'text-green-400' :
                                passwordStrength.score >= 50 ? 'text-yellow-400' : 'text-red-400'
                              }`}>
                                {passwordStrength.score >= 75 ? 'Strong' :
                                 passwordStrength.score >= 50 ? 'Medium' : 'Weak'}
                              </span>
                            </div>
                            <Progress value={passwordStrength.score} className="h-1" />
                            {passwordStrength.feedback.length > 0 && (
                              <p className="text-xs text-white/60 mt-1">
                                Missing: {passwordStrength.feedback.join(', ')}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="reg-confirm-password" className="text-white">Confirm Password *</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
                          <Input
                            id="reg-confirm-password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Confirm password"
                            value={formData.confirmPassword}
                            onChange={(e) => updateField('confirmPassword', e.target.value)}
                            className="pl-10 pr-10 bg-transparent border-white/20 text-white placeholder-white/60"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {errors.confirmPassword && <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>}
                      </div>
                      
                      <Button
                        type="button"
                        className="w-full h-11 bg-white text-black hover:bg-white/90"
                        onClick={async () => {
                          const newErrors: Record<string, string> = {}
                          
                          const passErr = validatePassword(formData.password)
                          if (passErr) newErrors.password = passErr
                          
                          if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password'
                          if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
                          
                          setErrors(newErrors)
                          if (Object.keys(newErrors).length > 0) return
                          
                          try {
                            setIsLoading(true)
                            
                            // Validate required fields before sending
                            if (!formData.email || !formData.name) {
                              toast.error('Missing required information. Please go back and fill out all fields.')
                              setStage('basic')
                              return
                            }
                            
                            // Use Edge Function for registration
                            const result = await api.register({
                              email: formData.email.trim(),
                              password: formData.password,
                              name: formData.name.trim(),
                              userType: 'professional'
                            })
                            
                            if (result.accessToken) {
                              localStorage.setItem('accessToken', result.accessToken)
                              localStorage.setItem('refreshToken', result.refreshToken || '')
                              localStorage.setItem('userType', 'professional')
                              localStorage.setItem('isAuthenticated', 'true')
                              localStorage.setItem('userId', result.user?.id || '')
                              localStorage.setItem('registrationEmail', formData.email)
                              
                              // Set Supabase session
                              if (result.refreshToken) {
                                await supabase.auth.setSession({
                                  access_token: result.accessToken,
                                  refresh_token: result.refreshToken
                                })
                              }
                              
                              // Initialize auth
                              await initAuth()
                              
                              // Clear registration state
                              RegistrationStateManager.markCompleted()
                              
                              toast.success('Account created successfully! Welcome to CoreID.')
                              window.location.href = '/dashboard'
                            }
                          } catch (err: any) {
                            console.error('Email registration failed:', err)
                            const message = err.message || 'Registration failed'
                            if (message.includes('already exists')) {
                              setErrors({ email: 'Email already exists' })
                            } else {
                              toast.error(message)
                            }
                          } finally {
                            setIsLoading(false)
                          }
                        }}
                        disabled={isLoading || !formData.password || !formData.confirmPassword}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Creating Account...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Create Account
                          </>
                        )}
                      </Button>
                      
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setStage('basic')}
                        className="w-full text-white/60 hover:text-white"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Basic Info
                      </Button>
                    </div>
                  )}
                  {stage === 'phone-verification' && (
                    <RegistrationPhoneVerification
                      name={formData.name}
                      email={formData.email}
                      onVerificationComplete={async (phone, token) => {
                        console.log('Phone verification completed:', { phone, token })
                        setPhoneVerified(true)
                        setVerifiedPhone(phone)
                        setRegistrationToken(token)
                        await handleCompleteRegistration(phone, token)
                      }}
                      onBack={() => setStage('basic')}
                      onFallbackToEmail={() => setStage('email-form')}
                    />
                  )}
                  {stage === 'success' && phoneVerified && (
                    <div className="text-center space-y-4">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                      <div>
                        <h3 className="text-lg font-semibold text-white">Registration Complete!</h3>
                        <p className="text-white/80">Your CoreID PIN has been created</p>
                        <p className="text-white/60 text-sm">Phone: {verifiedPhone}</p>
                      </div>
                      <Button
                        onClick={async () => {
                          try {
                            // Verify authentication state before navigation
                            const isAuth = localStorage.getItem('isAuthenticated') === 'true'
                            const hasToken = localStorage.getItem('accessToken')
                            
                            if (!isAuth || !hasToken) {
                              toast.error('Authentication failed. Please try logging in.')
                              window.location.href = '/login'
                              return
                            }
                            
                            // Ensure auth is properly initialized
                            await initAuth()
                            
                            // Navigate to dashboard
                            window.location.href = '/dashboard'
                          } catch (error) {
                            console.error('Dashboard navigation failed:', error)
                            toast.error('Navigation failed. Redirecting to login.')
                            window.location.href = '/login'
                          }
                        }}
                        className="w-full h-11 bg-green-600 hover:bg-green-700 text-white"
                      >
                        Go to Dashboard
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            
            </div>
          </motion.div>
        </div>
      </main>
      
      {showChrome && (
        <Footer onNavigate={(page) => console.log('Navigate to:', page)} />
      )}
    </div>
  )
}