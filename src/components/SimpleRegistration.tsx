import React, { useState } from 'react'
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
import { Sparkles, ArrowLeft, ArrowRight, Loader2, Users, Mail, Briefcase, MapPin, Lock, Eye, EyeOff, CheckCircle, AlertCircle, Shield } from 'lucide-react'

type SimpleRegistrationProps = {
  onComplete?: () => void
  onBack?: () => void
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

export default function SimpleRegistration({ onComplete, onBack }: SimpleRegistrationProps) {
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
    
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            title: formData.title,
            phone: formData.phone,
            location: formData.location,
            userType: 'professional'
          }
        }
      })

      if (error) {
        if (error.message.includes('already registered')) {
          setErrors({ email: 'Email already exists' })
        } else {
          throw error
        }
        return
      }

      // Production-grade data synchronization with retry logic
      if (data.user) {
        const profileData = {
          id: data.user.id,
          email: formData.email,
          name: formData.name,
          title: formData.title,
          phone: formData.phone,
          location: formData.location,
          user_type: 'professional',
          email_verified: false,
          verification_sent_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        // Retry logic for critical data sync
        let syncRetries = 3;
        let syncSuccess = false;
        
        while (syncRetries > 0 && !syncSuccess) {
          try {
            const { error: profileError } = await supabase
              .from('profiles')
              .upsert(profileData, { onConflict: 'id' });
            
            if (profileError) throw profileError;
            syncSuccess = true;
            
            // Cache profile data locally for offline access
            localStorage.setItem(`profile_${data.user.id}`, JSON.stringify(profileData));
            
          } catch (syncErr) {
            syncRetries--;
            if (syncRetries === 0) {
              // Critical: Store for background sync
              const pendingSync = JSON.parse(localStorage.getItem('pendingProfileSync') || '[]');
              pendingSync.push({ ...profileData, retryCount: 0 });
              localStorage.setItem('pendingProfileSync', JSON.stringify(pendingSync));
              
              console.error('Profile sync failed, queued for background retry:', syncErr);
            } else {
              await new Promise(resolve => setTimeout(resolve, 1000 * (4 - syncRetries))); // Exponential delay
            }
          }
        }

        // Non-blocking verification event logging
        const logVerification = async () => {
          try {
            await supabase.from('verification_logs').insert({
              user_id: data.user.id,
              event_type: 'verification_sent',
              email: formData.email,
              timestamp: new Date().toISOString(),
              user_agent: navigator.userAgent.substring(0, 255),
              registration_source: 'web_app'
            });
          } catch (logErr) {
            // Queue for background retry
            const logQueue = JSON.parse(localStorage.getItem('logRetryQueue') || '[]');
            logQueue.push({
              type: 'verification_sent',
              userId: data.user.id,
              email: formData.email,
              timestamp: new Date().toISOString()
            });
            localStorage.setItem('logRetryQueue', JSON.stringify(logQueue.slice(-20))); // Keep last 20
          }
        };
        
        logVerification();
      }

      localStorage.setItem('pendingVerification', JSON.stringify({
        email: formData.email,
        name: formData.name,
        userId: data.user?.id
      }))

      toast.success('Registration successful! Please check your email for verification.')
      onComplete?.()
      
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

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-white">
      <Navbar 
        currentPage="registration" 
        onNavigate={(page) => console.log('Navigate to:', page)}
        onLogin={(userType) => console.log('Login as:', userType)}
      />
      
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

      <main className="container mx-auto px-4 py-8" aria-busy={isLoading}>
        <div className="max-w-2xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-white/5 backdrop-blur-xl border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Create Account</CardTitle>
                <CardDescription className="text-gray-300">
                  Enter your details to create your account.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-white">Full Name *</Label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
                        <Input
                          id="name"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={(e) => updateField('name', e.target.value)}
                          className="pl-10 bg-transparent border-white/20 text-white placeholder-white/60"
                          aria-invalid={!!errors.name}
                          aria-describedby={errors.name ? 'name-error' : undefined}
                        />
                      </div>
                      {errors.name && <p id="name-error" className="text-xs text-red-600 mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-white">Email Address *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          value={formData.email}
                          onChange={(e) => updateField('email', e.target.value)}
                          className="pl-10 pr-10 bg-transparent border-white/20 text-white placeholder-white/60"
                          aria-invalid={!!errors.email}
                          aria-describedby={errors.email ? 'email-error' : undefined}
                        />
                        {isEmailChecking && (
                          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60 animate-spin" />
                        )}
                        {!isEmailChecking && emailAvailable === true && (
                          <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                        )}
                        {!isEmailChecking && emailAvailable === false && (
                          <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                        )}
                      </div>
                      {errors.email && <p id="email-error" className="text-xs text-red-600 mt-1">{errors.email}</p>}
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <Label htmlFor="title" className="text-white">Professional Title *</Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
                      <Input
                        id="title"
                        placeholder="e.g., Senior Frontend Developer"
                        value={formData.title}
                        onChange={(e) => updateField('title', e.target.value)}
                        className="pl-10 bg-transparent border-white/20 text-white placeholder-white/60"
                        aria-invalid={!!errors.title}
                        aria-describedby={errors.title ? 'title-error' : undefined}
                      />
                    </div>
                    {errors.title && <p id="title-error" className="text-xs text-red-600 mt-1">{errors.title}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="location" className="text-white">Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
                        <Input
                          id="location"
                          placeholder="City, Country"
                          value={formData.location}
                          onChange={(e) => updateField('location', e.target.value)}
                          className="pl-10 bg-transparent border-white/20 text-white placeholder-white/60"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-white">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="e.g., +234 801 234 5678"
                        value={formData.phone}
                        onChange={(e) => updateField('phone', e.target.value)}
                        className="bg-transparent border-white/20 text-white placeholder-white/60"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="password" className="text-white">Password *</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
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
                      {formData.password && (
                        <div className="mt-2">
                          <div className="flex items-center gap-2 mb-1">
                            <Shield className="h-3 w-3 text-white/60" />
                            <span className="text-xs text-white/60">Password Strength</span>
                          </div>
                          <Progress value={passwordStrength.score} className="h-1" />
                          {passwordStrength.feedback.length > 0 && (
                            <p className="text-xs text-white/60 mt-1">Missing: {passwordStrength.feedback.join(', ')}</p>
                          )}
                        </div>
                      )}
                      {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword" className="text-white">Confirm Password *</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={formData.confirmPassword}
                          onChange={(e) => updateField('confirmPassword', e.target.value)}
                          className="pr-10 bg-transparent border-white/20 text-white placeholder-white/60"
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
                  </div>

                  <div className="flex items-center justify-between mt-8">
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={onBack} 
                      className="min-w-[120px] border-white/20 text-white hover:bg-white/10"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="min-w-[140px] text-white"
                      aria-disabled={isLoading}
                      aria-live="polite"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          <span>Creating...</span>
                        </>
                      ) : (
                        <>
                          Create Account
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
      
      <Footer onNavigate={(page) => console.log('Navigate to:', page)} />
    </div>
  )
}