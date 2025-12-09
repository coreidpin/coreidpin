import React from 'react'
import { Button } from '../../ui/button'
import { Label } from '../../ui/label'
import { Users, Mail, Loader2, ArrowLeft, Chrome } from 'lucide-react'
import { CountryCodeSelect } from '../../ui/country-code-select'
import { FormData } from '../useRegistration'

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
  return (
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
        <Label htmlFor="quick-name" className="text-sm font-medium text-white/80 ml-1">
          {formData.userType === 'business' ? 'Company Name' : 'Full Name'}
        </Label>
        <div className="flex items-center h-14 px-4 bg-white/5 border border-white/10 rounded-xl focus-within:border-blue-500/50 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all group">
          <Users className="h-5 w-5 text-white/40 group-focus-within:text-blue-400 transition-colors shrink-0 mr-3" />
          <input
            id="quick-name"
            placeholder={formData.userType === 'business' ? "Acme Corp" : "John Doe"}
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
        onClick={onSubmit}
        disabled={isLoading}
        className="w-full h-14 bg-white text-black hover:bg-white/90 rounded-xl font-medium text-base shadow-lg shadow-white/5 transition-all mt-2"
      >
        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Continue'}
      </Button>

      {formData.userType !== 'business' && (
        <>
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#0a0b0d] px-2 text-white/40">Or register with</span>
            </div>
          </div>

          <Button
            type="button"
            className="w-full h-14 bg-white text-black hover:bg-white/90 rounded-xl font-medium text-base shadow-lg shadow-white/5 transition-all"
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
        </>
      )}
    </div>
  )
}
