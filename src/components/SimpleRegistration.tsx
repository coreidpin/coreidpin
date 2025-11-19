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
  const [stage, setStage] = useState<'basic' | 'otp' | 'success'>('basic')
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
    const phone = normalizePhoneLocal((formData.phone || '').trim())
    if (!name) newErrors.name = 'Full name is required'
    if (email) {
      const emailErr = validateEmail(email)
      if (emailErr) newErrors.email = emailErr
    }
    if (!phone) newErrors.phone = 'Phone number is required'
    else {
      const phoneErr = validatePhone(phone)
      if (phoneErr) newErrors.phone = phoneErr
    }
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return
    try {
      localStorage.setItem('preName', name)
      localStorage.setItem('preEmail', email)
      localStorage.setItem('prePhone', phone)
      const idem = `idem_${Date.now()}`
      const start = await api.registerStart({ full_name: name, phone, email, idempotency_key: idem })
      const token = start?.reg_token || ''
      setRegToken(token)
      try { localStorage.setItem('registration_token', token) } catch {}
      setOtpExpiresIn(start?.otp_expires_in || 600)
      setResendCooldown(resendDefault)
      setResendCount(0)
      setStage('otp')
      toast.success('OTP sent')
    } catch {}
  }

  useEffect(() => {
    try {
      const token = localStorage.getItem('registration_token') || ''
      const phone = localStorage.getItem('prePhone') || ''
      if (token && phone) {
        setRegToken(token)
        setStage('otp')
        setResendCooldown(resendDefault)
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

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) newErrors.name = 'Full name is required'
    if (!formData.title.trim()) newErrors.title = 'Professional title is required'
    
    const emailErr = validateEmail(formData.email)
    if (emailErr) newErrors.email = emailErr
    else if (emailAvailable === false) newErrors.email = 'Email already exists'
    
    const phoneErr = validatePhone(formData.phone)
    if (phoneErr) newErrors.phone = phoneErr
    
    const passErr = validatePassword(formData.password)
    if (passErr) newErrors.password = passErr
    
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password'
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    if (pinInput && !pinVerified) {
      setPinError('Verify your PIN before proceeding')
      return
    }
    
    setIsLoading(true)
    try {
      const result = await api.register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        userType: 'professional',
        title: formData.title,
        phoneNumber: formData.phone,
        location: formData.location
      })

      const accessToken = result.accessToken
      const refreshToken = result.refreshToken
      if (accessToken && refreshToken) {
        try {
          await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
          await api.setSessionCookie(accessToken)
        } catch {}
      }

      localStorage.setItem('promptEmailVerification', 'true')
      localStorage.setItem('registrationEmail', formData.email)
      localStorage.setItem('userType', 'professional')
      toast.success('Registration successful! Verify your email from the link we sent.')
      window.location.href = '/dashboard'
      
    } catch (err: any) {
      const message = err.message || 'Registration failed'
      if (message.includes('already exists')) {
        setErrors({ email: 'Email already exists' })
      } else if (message.includes('rate limit')) {
        toast.error('Too many attempts. Please wait before trying again.')
      } else {
        toast.error(message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setIsLoading(true)
    try {
      localStorage.setItem('pendingUserType', 'professional')
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: { access_type: 'offline', prompt: 'consent' }
        }
      })
      if (error) {
        if (error.message.includes('not enabled') || error.message.includes('provider')) {
          toast.error('Google sign-in is not configured yet. Please use the form below.')
        } else {
          throw error
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Google sign-in failed. Please try again.')
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
                <CardTitle className="text-white">PIN Verification</CardTitle>
                <CardDescription className="text-gray-300">This PIN is generated after completing professional dashboard verification.</CardDescription>
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
                        <Label htmlFor="quick-email" className="text-white">Email (optional)</Label>
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
                      <div>
                        <Label htmlFor="quick-phone" className="text-white">Phone Number *</Label>
                        <Input
                          id="quick-phone"
                          type="tel"
                          placeholder="e.g., +234 801 234 5678"
                          value={formData.phone}
                          onChange={(e) => updateField('phone', e.target.value)}
                          className="bg-transparent border-white/20 text-white placeholder-white/60"
                          aria-invalid={!!errors.phone}
                          aria-describedby={errors.phone ? 'quick-phone-error' : undefined}
                        />
                        {errors.phone && <p id="quick-phone-error" className="text-xs text-red-600 mt-1">{errors.phone}</p>}
                      </div>
                      <Button
                        type="button"
                        className="w-full h-11 bg-white text-black hover:bg-white/90"
                        onClick={handleQuickContinue}
                      >
                        Continue
                      </Button>
                    </div>
                  )}
                  {stage === 'otp' && (
                    <div className="space-y-3">
                      <div className="text-white/80 text-sm">Enter the 6-digit code sent to {formData.phone}</div>
                      <div className="text-white/60 text-xs">Code expires in {otpExpiresIn}s</div>
                      <div className="text-white/60 text-xs">To: {maskPhone(formData.phone)}</div>
                      <Input
                        id="otp"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="123456"
                        value={otp}
                        onChange={(e) => { setOtp(e.target.value.replace(/[^0-9]/g, '')); if (otpError) setOtpError('') }}
                        onPaste={(e) => { const t = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0,6); setOtp(t); e.preventDefault(); }}
                        className="bg-transparent border-white/20 text-white placeholder-white/60"
                        aria-invalid={!!otpError}
                        aria-describedby={otpError ? 'otp-error' : undefined}
                      />
                      {otpError && <p id="otp-error" className="text-xs text-red-600">{otpError}</p>}
                      <div className="flex items-center gap-3">
                        <Button
                          type="button"
                          className="h-10"
                          onClick={async () => {
                            if (!regToken || otp.length < 4) { setOtpError('Enter valid OTP'); return }
                            try {
                              setIsLoading(true)
                              const res = await api.registerVerifyOtp({ reg_token: regToken, otp })
                              const pinAssigned = res?.pin || ''
                              try {
                                localStorage.setItem('pin', pinAssigned)
                                localStorage.setItem('isAuthenticated', 'true')
                                localStorage.setItem('userType', 'professional')
                                if (requireEmailVerification && formData.email) localStorage.setItem('requireEmailVerification', 'true')
                              } catch {}
                              try { toast.success('Welcome — PIN created') } catch {}
                              setStage('success')
                              setTimeout(() => { window.location.href = '/dashboard' }, 500)
                            } catch (e: any) {
                              setOtpError(e?.message || 'OTP verification failed')
                            } finally {
                              setIsLoading(false)
                            }
                          }}
                        >Verify OTP</Button>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={resendCooldown > 0 || resendCount >= maxResends}
                          onClick={async () => {
                            try {
                              const start = await api.registerStart({ full_name: formData.name, phone: formData.phone, email: formData.email, idempotency_key: `idem_${Date.now()}` })
                              setRegToken(start?.reg_token || regToken)
                              try { localStorage.setItem('registration_token', start?.reg_token || regToken) } catch {}
                              setOtpExpiresIn(start?.otp_expires_in || 600)
                              setResendCooldown(resendDefault)
                              setResendCount(prev => prev + 1)
                              toast.success('OTP resent')
                            } catch {}
                          }}
                        >{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : (resendCount >= maxResends ? 'Resend limit reached' : 'Resend OTP')}</Button>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => { setStage('basic'); setOtp(''); setOtpError('') }}
                        >Change phone</Button>
                      </div>
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
