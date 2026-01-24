import React from 'react'
import { Button } from '../../ui/button'
import { Label } from '../../ui/label'
import { Users, Mail, Loader2, ArrowLeft, Chrome, Briefcase, Globe, CheckCircle2 } from 'lucide-react'
// ... rest of imports unchanged
import { motion } from 'framer-motion'
import { CountryCodeSelect } from '../../ui/country-code-select'
import { FormData } from '../useRegistration'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../ui/tabs'
import { colors } from '../../../styles/designSystem'
import { Skeleton } from '../../ui/skeleton'

type BasicInfoFormProps = {
  formData: FormData
  errors: Record<string, string>
  isLoading: boolean
  countryCode: string
  countryError: string
  setCountryCode: (code: string) => void
  setCountryError: (error: string) => void
  updateField: (field: keyof FormData, value: string) => void
  onSubmit: () => void
  onGoogleSignIn: () => void
  onBack?: () => void
}

export function BasicInfoForm({
  formData,
  errors,
  isLoading,
  countryCode,
  countryError,
  setCountryCode,
  setCountryError,
  updateField,
  onSubmit,
  onGoogleSignIn,
  onBack
}: BasicInfoFormProps) {
  const [activeTab, setActiveTab] = React.useState('email');

  const isValid = formData.name?.length > 2 && formData.email?.includes('@');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={errors.name || errors.email ? { x: [0, -10, 10, -10, 10, 0] } : { opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-5"
    >
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-5">
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 hover:opacity-80 text-sm transition-colors -mt-2 mb-2"
          style={{ color: '#9ca3af' }}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>
      )}
      
      <div className="space-y-2">
        <Label 
          htmlFor="quick-name" 
          className="text-sm font-medium ml-1"
          style={{ color: '#d1d5db' }}
        >
          {formData.userType === 'business' ? 'Company Name' : 'Full Name'}
        </Label>
        <div className="flex items-center h-14 px-4 bg-white/5 border border-white/10 rounded-xl focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all group">
          <Users className="h-5 w-5 text-white/70 group-focus-within:text-indigo-400 transition-colors shrink-0 mr-3" />
          <input
            id="quick-name"
            placeholder={formData.userType === 'business' ? "Acme Corp" : "John Doe"}
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
            autoFocus
            className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/60 h-full w-full text-base"
            aria-invalid={!!errors.name}
          />
          {formData.name.length > 2 && !errors.name && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="shrink-0">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 ml-2" />
            </motion.div>
          )}
        </div>
        {errors.name && <p className="text-xs text-red-400 ml-1">{errors.name}</p>}
      </div>

      {formData.userType === 'business' && (
        <>
          <div className="space-y-2">
            <Label 
              htmlFor="industry" 
              className="text-sm font-medium ml-1"
              style={{ color: '#d1d5db' }}
            >
              Industry
            </Label>
            <div className="flex items-center h-14 px-4 bg-white/5 border border-white/10 rounded-xl focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all group">
              <Briefcase className="h-5 w-5 text-white/70 group-focus-within:text-indigo-400 transition-colors shrink-0 mr-3" />
              <input
                id="industry"
                placeholder="Fintech, Health, etc."
                value={formData.industry || ''}
                onChange={(e) => updateField('industry', e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/60 h-full w-full text-base"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label 
              htmlFor="website" 
              className="text-sm font-medium ml-1" 
              style={{ color: '#d1d5db' }}
            >
              Website
            </Label>
            <div className="flex items-center h-14 px-4 bg-white/5 border border-white/10 rounded-xl focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all group">
              <Globe className="h-5 w-5 text-white/70 group-focus-within:text-indigo-400 transition-colors shrink-0 mr-3" />
              <input
                id="website"
                placeholder="https://example.com"
                value={formData.website || ''}
                onChange={(e) => updateField('website', e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/60 h-full w-full text-base"
              />
            </div>
          </div>
        </>
      )}

      {/* Contact Method Tabs */}
      <Tabs defaultValue="email" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4 bg-white/5 border border-white/10">
          <TabsTrigger 
            value="email" 
            className="data-[state=active]:bg-white/10"
            style={{ color: '#d1d5db' }}
          >
            Email
          </TabsTrigger>
          <TabsTrigger 
            value="phone"
            className="group flex items-center justify-center gap-2 cursor-not-allowed opacity-100 data-[state=active]:bg-white/10"
            onClick={(e) => e.preventDefault()}
            style={{ pointerEvents: 'none', color: '#6b7280' }}
          >
            <span className="font-medium" style={{ color: 'inherit' }}>Phone</span>
            <span className="flex items-center justify-center px-2 py-0.5 bg-amber-500/20 text-amber-100 text-[8px] font-bold tracking-[0.2em] rounded-full shadow-[0_0_8px_-2px_rgba(245,158,11,0.5)]">
              SOON
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="phone" className="mt-0">
          <div className="space-y-2 opacity-50 pointer-events-none filter blur-[1px]">
            <Label htmlFor="quick-phone" className="text-sm font-medium !text-gray-300 ml-1">Phone Number</Label>
            <div className="flex items-center h-14 bg-white/5 border border-white/10 rounded-xl">
              <CountryCodeSelect
                value={countryCode}
                onChange={() => {}}
                onUnsupportedSelect={() => {}}
                className="h-full bg-transparent border-none text-white focus:ring-0 w-[100px] pl-3"
              />
              <div className="w-px h-6 bg-white/10" />
              <input
                type="tel"
                placeholder="803 123 4567"
                disabled
                className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/40 h-full w-full text-base px-4"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="email" className="mt-0">
          <div className="space-y-2">
            <Label 
              htmlFor="quick-email" 
              className="text-sm font-medium ml-1"
              style={{ color: '#d1d5db' }}
            >
              Email Address
            </Label>
            <div className="flex items-center h-14 px-4 bg-white/5 border border-white/10 rounded-xl focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all group">
              <Mail className="h-5 w-5 text-white/70 group-focus-within:text-indigo-400 transition-colors shrink-0 mr-3" />
              <input
                id="quick-email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/60 h-full w-full text-base"
                aria-invalid={!!errors.email}
              />
              {formData.email.includes('@') && formData.email.includes('.') && !errors.email && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 ml-2" />
                </motion.div>
              )}
            </div>
            {errors.email && <p className="text-xs text-red-400 ml-1">{errors.email}</p>}
          </div>
        </TabsContent>
      </Tabs>

      {isLoading ? (
        <Skeleton className="w-full h-14 rounded-xl" />
      ) : (
        <Button
          type="submit"
          className={`w-full h-14 rounded-xl font-medium text-base transition-all mt-2 hover:brightness-110 ${isValid ? 'animate-ready-glow' : ''}`}
          style={{ 
            backgroundColor: colors.brand.primary[600], 
            color: colors.white,
            boxShadow: isValid ? '0 0 20px rgba(99, 102, 241, 0.3)' : 'none'
          }}
        >
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Continue'}
        </Button>
      )}
      </form>

      {formData.userType !== 'business' && (
        <div className="pt-2">
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wider">
              <span className="px-2 bg-transparent text-gray-400" style={{ color: '#9ca3af' }}>Or register with</span>
            </div>
          </div>

          <Button
            type="button"
            className="w-full h-11 bg-white text-black hover:bg-white/90 font-medium"
            disabled={isLoading}
            onClick={onGoogleSignIn}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <Chrome className="h-5 w-5 mr-2" />
                Google
              </>
            )}
          </Button>
        </div>
      )}
    </motion.div>
  )
}
