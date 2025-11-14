// Unified registration and onboarding flow for all user types
// Combines logic from RegistrationFlow.tsx and OnboardingFlow.tsx

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { toast } from 'sonner'
import { api } from '../utils/api'
import { initAuth } from '../utils/auth'
import { supabase } from '../utils/supabase/client'
import { EmailVerificationGate } from './EmailVerificationGate'
import { WelcomeAIBadge } from './WelcomeAIBadge'
import { Logo } from './Logo'
import '../styles/auth-dark.css'
import { Sparkles, ArrowRight, ArrowLeft, Loader2, Users, Mail, MapPin, Lock, Briefcase, Building, School, FileText, CheckCircle, Shield, Brain, BadgeCheck, X, Plus, GraduationCap, Chrome, User } from 'lucide-react'

type UnifiedFlowProps = {
  userType: 'professional' | 'employer' | 'university'
  origin?: 'modal' | 'onboarding'
  onComplete?: (userData?: any) => void
  onBack?: () => void
}

type YearsOfExperience = '1-5' | '5-10' | '10+'
type Seniority = 'Entry' | 'Mid' | 'Senior' | 'Lead' | 'Manager' | 'Director' | 'VP' | 'C-Level'
type EducationLevel = 'High School' | 'Associate' | 'Bachelor' | 'Master' | 'PhD' | 'Bootcamp' | 'Self-taught'

function validateEmail(email?: string) {
  if (!email) return 'Email is required'
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) return 'Enter a valid email address'
  const domain = email.split('@')[1]
  const domainRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (domain.includes('..')) return 'Email domain appears invalid'
  if (!domainRegex.test(domain)) return 'Email domain appears invalid'
  return null
}

function validatePassword(password?: string) {
  if (!password) return 'Password is required'
  if (password.length < 8) return 'Password must be at least 8 characters'
  if (!/[0-9]/.test(password)) return 'Include at least one number'
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'Include at least one special character'
  return null
}

function validatePhone(phone?: string) {
  if (!phone) return null
  const normalized = phone.replace(/[\s()-]/g, '')
  const e164 = /^\+?[1-9]\d{7,14}$/
  if (!e164.test(normalized)) return 'Enter a valid phone with country code'
  return null
}

function withBackoff<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  let attempt = 0
  let lastError: any = null
  return new Promise(async (resolve, reject) => {
    while (attempt <= retries) {
      try {
        const res = await fn()
        resolve(res)
        return
      } catch (err: any) {
        lastError = err
        const isTransient = !!(err && (err.status >= 500 || err.status === 429))
        if (!isTransient || attempt === retries) break
        const backoffMs = Math.min(500 * Math.pow(2, attempt), 3000)
        await new Promise(r => setTimeout(r, backoffMs))
        attempt++
      }
    }
    reject(lastError)
  })
}

type RegistrationData = {
  name?: string
  title?: string
  email?: string
  location?: string
  password?: string
  confirmPassword?: string
  phone?: string
  yearsOfExperience?: YearsOfExperience
  currentCompany?: string
  seniority?: Seniority
  topSkills?: string[]
  highestEducation?: EducationLevel
  resumeFileName?: string
  verifyAI?: boolean
  verifyEmail?: boolean
  verifyPeers?: boolean
  verifySMS?: boolean
}

const SUGGESTED_COMPANIES = ['Google','Microsoft','Amazon','Meta','Apple','Netflix','OpenAI','Stripe','Shopify','NVIDIA','Oracle','IBM']
const SUGGESTED_SKILLS = ['JavaScript','TypeScript','React','Node.js','Python','Go','Rust','SQL','NoSQL','AWS','Docker','Kubernetes','UI/UX','GraphQL','Next.js','Redux','Tailwind','CI/CD','Testing','Data Structures']
const SESSION_KEY = 'registrationFlow:professional'

function ProfessionalFlow({ origin = 'modal', onComplete, onBack }: { origin?: 'modal' | 'onboarding'; onComplete?: (userData?: any) => void; onBack?: () => void }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<RegistrationData>({ topSkills: [] })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [showVerificationGate, setShowVerificationGate] = useState(false)
  const [registeredUserId, setRegisteredUserId] = useState<string | null>(null)
  const [successModalOpen, setSuccessModalOpen] = useState(false)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed?.formData) setFormData(parsed.formData)
        if (typeof parsed?.currentStep === 'number') setCurrentStep(parsed.currentStep)
      }
    } catch {}
  }, [])

  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ formData, currentStep }))
    } catch {}
  }, [formData, currentStep])

  useEffect(() => {
    try {
      if (formData.email) {
        const stepNum = currentStep + 1
        if (currentStep > 0) {
          api.recordRegistrationStep({ email: formData.email!, step: currentStep, status: 'completed' }).catch(() => {})
        }
        api.recordRegistrationStep({ email: formData.email!, step: stepNum, status: 'started' }).catch(() => {})
      }
    } catch {}
  }, [currentStep])

  const progressValue = useMemo(() => (currentStep + 1) * 25, [currentStep])

  const updateFormData = (field: keyof RegistrationData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addSkill = (skill: string) => {
    const clean = skill.trim()
    if (!clean) return
    setFormData(prev => ({ ...prev, topSkills: Array.from(new Set([...(prev.topSkills || []), clean])).slice(0, 20) }))
  }

  const removeSkill = (skill: string) => {
    setFormData(prev => ({ ...prev, topSkills: (prev.topSkills || []).filter(s => s.toLowerCase() !== skill.toLowerCase()) }))
  }

  const validateStep = (step: number): boolean => {
    const stepErrors: Record<string, string> = {}
    if (step === 0) {
      if (!formData.name?.trim()) stepErrors.name = 'Full name is required'
      const titleVal = (formData.title || '').trim()
      if (!titleVal) stepErrors.title = 'Professional Title is required'
      else if (titleVal.length < 2 || titleVal.length > 80) stepErrors.title = 'Title must be between 2 and 80 characters'
      const emailErr = validateEmail(formData.email)
      if (emailErr) stepErrors.email = emailErr
      const passErr = validatePassword(formData.password)
      if (passErr) stepErrors.password = passErr
      if (!formData.confirmPassword) stepErrors.confirmPassword = 'Please confirm your password'
      if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) stepErrors.confirmPassword = 'Passwords do not match'
      const phoneErr = validatePhone(formData.phone)
      if (phoneErr) stepErrors.phone = phoneErr
    } else if (step === 1) {
      if (!formData.yearsOfExperience) stepErrors.yearsOfExperience = 'Select years of experience'
      if (!formData.currentCompany?.trim()) stepErrors.currentCompany = 'Current company is required'
      if (!formData.seniority) stepErrors.seniority = 'Select a seniority level'
    } else if (step === 2) {
      if (!formData.topSkills || formData.topSkills.length < 3) stepErrors.topSkills = 'Add at least 3 top skills'
      if (!formData.highestEducation) stepErrors.highestEducation = 'Select your highest education'
      if (resumeFile) {
        const validTypes = ['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/msword']
        if (!validTypes.includes(resumeFile.type)) stepErrors.resume = 'Resume must be a PDF or DOCX'
        const maxSize = 5 * 1024 * 1024
        if (resumeFile.size > maxSize) stepErrors.resume = 'File must be less than 5MB'
      }
    } else if (step === 3) {
      const methods = [formData.verifyAI, formData.verifyEmail, formData.verifyPeers, formData.verifySMS].filter(Boolean).length
      if (methods < 1) stepErrors.verification = 'Select at least one verification method'
      if (!formData.verifyEmail) stepErrors.verifyEmail = 'Email verification is required'
    }
    setErrors(stepErrors)
    return Object.keys(stepErrors).length === 0
  }

  const handleContinue = async () => {
    if (!validateStep(currentStep)) return
    setIsLoading(true)
    try {
      const payload = {
        entryPoint: origin === 'onboarding' ? 'get-started' : 'signup',
        userType: 'professional',
        data: {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          phone: formData.phone,
          title: formData.title,
          location: formData.location,
        }
      }
      const res = await withBackoff(() => api.validateRegistration(payload))
      if (!res.valid) {
        const firstErr = res.errors?.[0] || 'Invalid registration data'
        toast.error(firstErr, { description: 'Please correct the highlighted fields and try again.' })
        setIsLoading(false)
        return
      }

      let registerResult: any
      let userAlreadyExists = false
      try {
        registerResult = await withBackoff(() => api.register({
          email: formData.email!,
          password: formData.password!,
          name: formData.name!,
          userType: 'professional',
          title: formData.title,
          phoneNumber: formData.phone,
          location: formData.location,
        }))
        if (!registerResult.success) throw new Error(registerResult.message || 'Registration failed')
      } catch (regError: any) {
        const errorMsg = regError.message || ''
        if (errorMsg.includes('already been registered') || errorMsg.includes('already exists')) {
          userAlreadyExists = true
          if (formData.email) localStorage.setItem('registrationEmail', formData.email)
          toast.info('Account already exists. Please verify your email to continue.', { description: "We'll send you a verification code." })
        } else {
          throw regError
        }
      }

      if (!userAlreadyExists && registerResult) {
        try {
          const loginRes = await api.loginSecure({ email: formData.email!, password: formData.password! })
          const accessToken = loginRes.accessToken
          const refreshToken = loginRes.refreshToken
          if (accessToken && refreshToken && loginRes.user) {
            await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
            localStorage.setItem('accessToken', accessToken)
            localStorage.setItem('userId', loginRes.user.id)
            localStorage.setItem('userType', loginRes.user.user_metadata?.userType || 'professional')
            await initAuth()
          }
        } catch {}
      }

      try {
        if (formData.email) {
          await withBackoff(() => api.sendVerificationEmail(formData.email!, formData.name))
          if (userAlreadyExists) toast.success('Verification code sent to your email.')
          else toast.success('Registration successful! Verification code sent to your email.')
        }
      } catch (verifyErr: any) {
        const msg = (verifyErr?.message || '').toLowerCase()
        const notConfigured = /server not configured|supabase credentials|failed to store verification code/i.test(msg)
        const rateLimited = /rate limit/i.test(msg)
        if (notConfigured) toast.error('PIN verification temporarily unavailable. Please retry later.')
        else if (rateLimited) toast.error('Too many PIN requests. Please retry later.')
        else {
          if (userAlreadyExists) toast.error('Could not send verification email', { description: 'You can request a new code from the verification screen.' })
          else toast.error('Registration successful but could not send verification email', { description: 'You can request a new code from the verification screen.' })
        }
      }

      setIsLoading(false)
      setShowVerificationGate(false)
      setSuccessModalOpen(true)
    } catch (err: any) {
      try {
        localStorage.setItem('pendingRegistrationData', JSON.stringify({ ...formData, resumeFileName: resumeFile?.name }))
      } catch {}
      toast.error(err.message || 'Failed to submit registration', { description: 'Your data has been preserved. Please retry when connection is stable.' })
      setIsLoading(false)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) setCurrentStep(s => s - 1)
    else onBack?.()
  }

  const handleVerificationComplete = async () => {
    try {
      localStorage.setItem('registrationCompletedAt', new Date().toISOString())
      sessionStorage.removeItem(SESSION_KEY)
      try {
        if (formData.email) await api.recordRegistrationStep({ email: formData.email!, step: 4, status: 'completed' })
      } catch {}
      toast.success('Email verified! Redirecting to login...', { duration: 1500 })
      setTimeout(() => { onComplete?.() }, 1500)
    } catch {
      onComplete?.()
    }
  }

  const handleCancelVerification = () => {
    setShowVerificationGate(false)
    toast.info('You can verify your email later from the login page.')
    onComplete?.()
  }

  if (showVerificationGate) {
    return (
      <div className={origin === 'modal' ? 'space-y-6 text-white' : 'min-h-screen bg-[#0a0b0d] text-white flex items-center justify-center p-4'}>
        <EmailVerificationGate email={formData.email} userId={registeredUserId || undefined} name={formData.name} onVerified={handleVerificationComplete} onCancel={handleCancelVerification} />
      </div>
    )
  }

  if (successModalOpen) {
    return (
      <div className={origin === 'modal' ? 'space-y-6 text-white' : 'min-h-screen bg-[#0a0b0d] text-white flex items-center justify-center p-4'}>
        <Card className="bg-[#0f1317] border-white/10 max-w-md w-full">
          <CardHeader>
            <CardTitle>Account Created</CardTitle>
            <CardDescription className="text-white/70">A verification email has been sent. You are now signed in.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-[#7bb8ff] text-black hover:opacity-90" onClick={() => onComplete?.()}>Go to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={origin === 'modal' ? 'space-y-6 text-white' : 'min-h-screen bg-[#0a0b0d] text-white'}>
      {origin === 'onboarding' && (
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
      )}

      {origin === 'onboarding' && (
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-white" />
              <span className="text-sm">
                {currentStep === 0 && 'Basic Information'}
                {currentStep === 1 && 'Professional Details'}
                {currentStep === 2 && 'Skills'}
                {currentStep === 3 && 'Verification'}
              </span>
            </div>
          </div>
        </div>
      )}

      <main className={origin === 'onboarding' ? 'container mx-auto px-4 py-8' : ''} aria-busy={isLoading}>
        <div className={origin === 'onboarding' ? 'max-w-2xl mx-auto' : ''}>
          <AnimatePresence mode="wait">
            <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              {currentStep === 0 && (
                <Card className="bg-surface">
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>Enter your details to create your account.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <div className="relative">
                          <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="name" placeholder="John Doe" value={formData.name || ''} onChange={(e) => updateFormData('name', e.target.value)} className="pl-10" aria-invalid={!!errors.name} aria-describedby={errors.name ? 'name-error' : undefined} />
                        </div>
                        {errors.name && <p id="name-error" className="text-xs text-red-600 mt-1">{errors.name}</p>}
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="email" type="email" placeholder="you@example.com" value={formData.email || ''} onChange={(e) => updateFormData('email', e.target.value)} className="pl-10" aria-invalid={!!errors.email} aria-describedby={errors.email ? 'email-error' : undefined} />
                        </div>
                        {errors.email && <p id="email-error" className="text-xs text-red-600 mt-1">{errors.email}</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <Label htmlFor="title">Professional Title *</Label>
                        <div className="relative">
                          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="title" placeholder="e.g., Senior Frontend Developer" value={formData.title || ''} onChange={(e) => updateFormData('title', e.target.value)} className="pl-10" aria-invalid={!!errors.title} aria-describedby={errors.title ? 'title-error' : undefined} />
                        </div>
                        {errors.title && <p id="title-error" className="text-xs text-red-600 mt-1">{errors.title}</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="location">Location *</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="location" placeholder="City, Country" value={formData.location || ''} onChange={(e) => updateFormData('location', e.target.value)} className="pl-10" aria-invalid={!!errors.location} aria-describedby={errors.location ? 'location-error' : undefined} />
                        </div>
                        {errors.location && <p id="location-error" className="text-xs text-red-600 mt-1">{errors.location}</p>}
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" type="tel" placeholder="e.g., +234 801 234 5678" value={formData.phone || ''} onChange={(e) => updateFormData('phone', e.target.value)} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? 'phone-error' : undefined} />
                        {errors.phone && <p id="phone-error" className="text-xs text-red-600 mt-1">{errors.phone}</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="password">Password *</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="password" type="password" placeholder="••••••••" value={formData.password || ''} onChange={(e) => updateFormData('password', e.target.value)} className="pl-10" />
                        </div>
                        {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
                      </div>
                      <div>
                        <Label htmlFor="confirmPassword">Confirm Password *</Label>
                        <Input id="confirmPassword" type="password" placeholder="••••••••" value={formData.confirmPassword || ''} onChange={(e) => updateFormData('confirmPassword', e.target.value)} />
                        {errors.confirmPassword && <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {currentStep === 1 && (
                <Card className="bg-surface">
                  <CardHeader>
                    <CardTitle>Professional Details</CardTitle>
                    <CardDescription>Tell us about your experience and role.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Years of Experience *</Label>
                        <Select value={formData.yearsOfExperience || ''} onValueChange={(v) => updateFormData('yearsOfExperience', v as YearsOfExperience)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1-5">1-5</SelectItem>
                            <SelectItem value="5-10">5-10</SelectItem>
                            <SelectItem value="10+">10+</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.yearsOfExperience && <p className="text-xs text-red-600 mt-1">{errors.yearsOfExperience}</p>}
                      </div>
                      <div>
                        <Label>Seniority Level *</Label>
                        <Select value={formData.seniority || ''} onValueChange={(v) => updateFormData('seniority', v as Seniority)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Entry">Entry</SelectItem>
                            <SelectItem value="Mid">Mid</SelectItem>
                            <SelectItem value="Senior">Senior</SelectItem>
                            <SelectItem value="Lead">Lead</SelectItem>
                            <SelectItem value="Manager">Manager</SelectItem>
                            <SelectItem value="Director">Director</SelectItem>
                            <SelectItem value="VP">VP</SelectItem>
                            <SelectItem value="C-Level">C-Level</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.seniority && <p className="text-xs text-red-600 mt-1">{errors.seniority}</p>}
                      </div>
                    </div>
                    <div>
                      <Label>Current Company *</Label>
                      <Input placeholder="e.g., Stripe" value={formData.currentCompany || ''} onChange={(e) => updateFormData('currentCompany', e.target.value)} />
                      {errors.currentCompany && <p className="text-xs text-red-600 mt-1">{errors.currentCompany}</p>}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {SUGGESTED_COMPANIES.map((c) => (
                          <Badge key={c} variant="outline" className="cursor-pointer" onClick={() => updateFormData('currentCompany', c)}>
                            {c}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {currentStep === 2 && (
                <Card className="bg-surface">
                  <CardHeader>
                    <CardTitle>Skills</CardTitle>
                    <CardDescription>Add your top skills and education.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Top Skills *</Label>
                      <div className="flex gap-2">
                        <Input placeholder="e.g., React" onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            const target = e.target as HTMLInputElement
                            addSkill(target.value)
                            target.value = ''
                          }
                        }} />
                        <Button type="button" variant="secondary" onClick={() => {
                          const input = document.querySelector<HTMLInputElement>('input[placeholder="e.g., React"]')
                          if (input) { addSkill(input.value); input.value = '' }
                        }}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {errors.topSkills && <p className="text-xs text-red-600 mt-1">{errors.topSkills}</p>}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {(formData.topSkills || []).map((skill) => (
                          <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                            {skill}
                            <button type="button" onClick={() => removeSkill(skill)} className="ml-1 text-xs">
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {SUGGESTED_SKILLS.map((s) => (
                          <Badge key={s} variant="outline" className="cursor-pointer" onClick={() => addSkill(s)}>
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Highest Education *</Label>
                        <Select value={formData.highestEducation || ''} onValueChange={(v) => updateFormData('highestEducation', v as EducationLevel)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="High School">High School</SelectItem>
                            <SelectItem value="Associate">Associate</SelectItem>
                            <SelectItem value="Bachelor">Bachelor</SelectItem>
                            <SelectItem value="Master">Master</SelectItem>
                            <SelectItem value="PhD">PhD</SelectItem>
                            <SelectItem value="Bootcamp">Bootcamp</SelectItem>
                            <SelectItem value="Self-taught">Self-taught</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.highestEducation && <p className="text-xs text-red-600 mt-1">{errors.highestEducation}</p>}
                      </div>
                      <div>
                        <Label>Resume (optional)</Label>
                        <Input type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(e) => {
                          const file = e.target.files?.[0] || null
                          setResumeFile(file)
                          updateFormData('resumeFileName', file?.name || '')
                        }} />
                        {errors.resume && <p className="text-xs text-red-600 mt-1">{errors.resume}</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {currentStep === 3 && (
                <Card className="bg-surface">
                  <CardHeader>
                    <CardTitle>Almost there!</CardTitle>
                    <CardDescription>Choose your verification methods. A PIN will be generated upon verification.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className={`border rounded-lg p-4 ${formData.verifyAI ? 'border-primary' : 'border-muted'}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <Brain className="h-5 w-5 text-primary" />
                          <span className="font-medium">AI Skills Analysis</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">Recommended. Analyze your skills to boost visibility.</p>
                        <div className="flex items-center gap-2">
                          <input id="verifyAI" type="checkbox" checked={!!formData.verifyAI} onChange={(e) => updateFormData('verifyAI', e.target.checked)} />
                          <Label htmlFor="verifyAI">Enable</Label>
                        </div>
                      </div>
                      <div className={`border rounded-lg p-4 ${formData.verifyEmail ? 'border-primary' : 'border-muted'}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <Mail className="h-5 w-5 text-primary" />
                          <span className="font-medium">Email Verification</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">Required to activate your account.</p>
                        <div className="flex items-center gap-2">
                          <input id="verifyEmail" type="checkbox" checked={formData.verifyEmail ?? true} onChange={(e) => updateFormData('verifyEmail', e.target.checked)} />
                          <Label htmlFor="verifyEmail">Enable</Label>
                        </div>
                      </div>
                      <div className={`border rounded-lg p-4 ${formData.verifyPeers ? 'border-primary' : 'border-muted'}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <BadgeCheck className="h-5 w-5 text-primary" />
                          <span className="font-medium">Peer Endorsements</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">Optional endorsements from colleagues.</p>
                        <div className="flex items-center gap-2">
                          <input id="verifyPeers" type="checkbox" checked={!!formData.verifyPeers} onChange={(e) => updateFormData('verifyPeers', e.target.checked)} />
                          <Label htmlFor="verifyPeers">Enable</Label>
                        </div>
                      </div>
                      <div className={`border rounded-lg p-4 ${formData.verifySMS ? 'border-primary' : 'border-muted'}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="h-5 w-5 text-primary" />
                          <span className="font-medium">SMS Verification</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">Optional. Requires a valid phone number.</p>
                        <div className="flex items-center gap-2">
                          <input id="verifySMS" type="checkbox" checked={!!formData.verifySMS} onChange={(e) => updateFormData('verifySMS', e.target.checked)} disabled={!formData.phone || !!validatePhone(formData.phone)} />
                          <Label htmlFor="verifySMS">Enable</Label>
                        </div>
                      </div>
                    </div>
                    {errors.verification && <p className="text-xs text-red-600">{errors.verification}</p>}
                    {errors.verifyEmail && <p className="text-xs text-red-600">{errors.verifyEmail}</p>}
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </AnimatePresence>

          <div className={origin === 'onboarding' ? 'flex items-center justify-between mt-8' : 'flex items-center justify-between'}>
            <Button variant="outline" onClick={handlePrevious} className="min-w-[120px]">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {currentStep === 0 ? 'Back' : 'Previous'}
            </Button>
            <Button onClick={handleContinue} className="min-w-[140px]" disabled={isLoading} aria-disabled={isLoading} aria-live="polite">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  <span>Loading...</span>
                </>
              ) : currentStep === 3 ? (
                'Finish'
              ) : (
                <>
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}

function EmployerFlow({ onComplete, onBack }: { onComplete?: () => void; onBack?: () => void }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showWelcomeBadge, setShowWelcomeBadge] = useState(false)

  const steps = [
    { title: 'Company Information', component: EmployerBasicInfo },
    { title: 'Welcome to swipe', component: CompletionStep },
  ]

  const progress = ((currentStep + 1) / steps.length) * 100

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNext = async () => {
    try {
      setIsLoading(true)
      const payload: any = {
        entryPoint: 'get-started',
        userType: 'employer',
        data: {
          name: formData.companyName,
          email: formData.contactEmail,
          contactEmail: formData.contactEmail,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          phone: formData.phone,
          companyName: formData.companyName,
          industry: formData.industry,
          headquarters: formData.headquarters,
        }
      }
      const res = await api.validateRegistration(payload)
      if (!res.valid) {
        const firstErr = res.errors?.[0] || 'Invalid registration data'
        toast.error(firstErr)
        setIsLoading(false)
        return
      }
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1)
      } else {
        setShowWelcomeBadge(true)
      }
    } catch (err: any) {
      toast.error(err.message || 'Validation failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1)
    else onBack?.()
  }

  const CurrentStepComponent = steps[currentStep]?.component as any

  return (
    <>
      <div className="min-h-screen bg-[#0a0b0d] text-white">
        <header className="border-b border-surface bg-surface sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Logo size="md" />
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="hidden sm:flex">
                  <Brain className="h-3 w-3 mr-1" />
                  Quick Setup
                </Badge>
                <span className="text-sm text-muted-foreground">Employer Setup</span>
              </div>
            </div>
          </div>
        </header>
        <div className="bg-[#0a0b0d] border-b border-white/10">
          <div className="container mx-auto px-4 py-6">
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Step {currentStep + 1} of {steps.length}</span>
                <span className="text-muted-foreground">{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="w-full h-2" />
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">{steps[currentStep]?.title}</span>
              </div>
            </div>
          </div>
        </div>
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                {CurrentStepComponent && (
                  <CurrentStepComponent formData={formData} updateFormData={updateFormData} userType={'employer'} isLoading={isLoading} setIsLoading={setIsLoading} />
                )}
              </motion.div>
            </AnimatePresence>
            <motion.div className="flex items-center justify-between mt-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Button variant="outline" onClick={handlePrevious} className="min-w-[120px]">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {currentStep === 0 ? 'Back' : 'Previous'}
              </Button>
              <Button onClick={handleNext} className="min-w-[120px]" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : currentStep === steps.length - 1 ? 'Go to Dashboard' : (<><span>Continue</span><ArrowRight className="h-4 w-4 ml-2" /></>)}
              </Button>
            </motion.div>
          </div>
        </main>
      </div>
      {showWelcomeBadge && (
        <WelcomeAIBadge userName={formData.companyName || 'User'} professionalTitle={'Employer'} userType={'employer'} onClose={() => { setShowWelcomeBadge(false); onComplete?.() }} />
      )}
    </>
  )
}

function EmployerBasicInfo({ formData, updateFormData, isLoading, setIsLoading }: any) {
  const [showGoogleAuth, setShowGoogleAuth] = useState(true)
  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      localStorage.setItem('pendingUserType', 'employer')
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin, queryParams: { access_type: 'offline', prompt: 'consent' } } })
      if (error) {
        if (error.message.includes('not enabled') || error.message.includes('provider')) {
          toast.error('Google sign-in not configured. Please complete the form manually or contact support.')
          setShowGoogleAuth(false)
        } else {
          throw error
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in with Google')
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-3xl mb-2">Welcome to swipe! 🚀</h1>
        <p className="text-muted-foreground">Start hiring verified talent in minutes</p>
      </div>
      <Card className="bg-surface">
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>Quick setup to get you started. You can add more details later in your dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {showGoogleAuth && (
            <div className="space-y-4">
              <div className="text-center">
                <Button onClick={handleGoogleSignIn} variant="outline" className="w-full h-12" disabled={isLoading} type="button">
                  {isLoading ? (<Loader2 className="h-5 w-5 mr-2 animate-spin" />) : (<Chrome className="h-5 w-5 mr-2" />)}
                  Continue with Google
                </Button>
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-surface px-2 text-muted-foreground">Or fill manually</span></div>
              </div>
            </div>
          )}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company-name">Company Name *</Label>
                <Input id="company-name" placeholder="Your Company Ltd." value={formData.companyName || ''} onChange={(e) => updateFormData('companyName', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="industry">Industry *</Label>
                <Select value={formData.industry || ''} onValueChange={(value) => updateFormData('industry', value)}>
                  <SelectTrigger><SelectValue placeholder="Select industry..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Headquarters Location *</Label>
                <Input id="location" placeholder="City, Country" value={formData.headquarters || ''} onChange={(e) => updateFormData('headquarters', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="contact-email">Contact Email *</Label>
                <Input id="contact-email" type="email" placeholder="hr@yourcompany.com" value={formData.contactEmail || ''} onChange={(e) => updateFormData('contactEmail', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="password">Password *</Label>
                <Input id="password" type="password" placeholder="••••••••" value={formData.password || ''} onChange={(e) => updateFormData('password', e.target.value)} />
                <p className="text-xs text-muted-foreground mt-1">Must be at least 6 characters</p>
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input id="confirmPassword" type="password" placeholder="••••••••" value={formData.confirmPassword || ''} onChange={(e) => updateFormData('confirmPassword', e.target.value)} />
              </div>
            </div>
            <div>
              <Label htmlFor="phone">Phone Number (optional)</Label>
              <Input id="phone" type="tel" placeholder="e.g., +234 801 234 5678" value={formData.phone || ''} onChange={(e) => updateFormData('phone', e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function CompletionStep({ userType }: any) {
  return (
    <div className="text-center space-y-8">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', duration: 0.5 }} className="w-24 h-24 bg-gradient-to-br from-success to-green-600 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="h-12 w-12 text-white" />
      </motion.div>
      <div>
        <h1 className="text-3xl mb-3">You're All Set! 🎉</h1>
        <p className="text-lg text-muted-foreground">{userType === 'employer' ? 'Welcome to swipe! You can now start discovering verified talent.' : 'Welcome to swipe! Complete your profile in the Setup tab to get discovered by employers.'}</p>
      </div>
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 max-w-md mx-auto">
        <h3 className="font-semibold mb-4 flex items-center gap-2 justify-center"><Sparkles className="h-5 w-5 text-primary" /><span>What's Next?</span></h3>
        <ul className="text-left space-y-3 text-sm">
          {userType === 'employer' ? (
            <>
              <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" /><span>Post your first job in the Swipe tab</span></li>
              <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" /><span>Browse verified professionals and swipe to match</span></li>
              <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" /><span>Complete your company profile for better matches</span></li>
            </>
          ) : (
            <>
              <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" /><span>Complete your profile in the Setup tab</span></li>
              <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" /><span>Add LinkedIn, GitHub, or portfolio for AI verification</span></li>
              <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" /><span>Start swiping on jobs that match your skills</span></li>
            </>
          )}
        </ul>
      </div>
    </div>
  )
}

function UniversityComingSoon() {
  return (
    <div className="min-h-screen bg-[#0a0b0d] text-white space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-6">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
          <GraduationCap className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-3xl">University Partnerships</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">We're crafting something special for educational institutions</p>
      </motion.div>
      <Card className="relative overflow-hidden text-center bg-surface">
        <CardContent className="py-12">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl">Coming Soon</h2>
              <p className="text-muted-foreground max-w-md mx-auto">Our university portal is in development. We're building powerful tools for institutions to issue verifiable digital credentials.</p>
            </div>
            <div className="space-y-4">
              <p className="text-sm font-medium">Interested in partnering with us?</p>
              <Button variant="outline"><Mail className="h-4 w-4 mr-2" />Contact Partnership Team</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function UnifiedFlow({ userType, origin = 'onboarding', onComplete, onBack }: UnifiedFlowProps) {
  if (userType === 'professional') return <ProfessionalFlow origin={origin} onComplete={onComplete} onBack={onBack} />
  if (userType === 'employer') return <EmployerFlow onComplete={onComplete} onBack={onBack} />
  return <UniversityComingSoon />
}
