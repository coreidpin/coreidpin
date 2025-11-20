import React from 'react'
import { cn } from './utils'

interface OTPInputProps {
  value: string
  onChange: (value: string) => void
  length?: number
  className?: string
  isPassword?: boolean
  placeholder?: string
  autoFocus?: boolean
}

export function OTPInput({
  value,
  onChange,
  length = 6,
  className,
  isPassword = false,
  placeholder,
  autoFocus = false
}: OTPInputProps) {
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, length)
    onChange(val)
  }

  return (
    <div className={cn("relative", className)}>
      <input
        type={isPassword ? "password" : "text"}
        value={value}
        onChange={handleChange}
        maxLength={length}
        placeholder={placeholder || "•".repeat(length)}
        autoFocus={autoFocus}
        className={cn(
          "w-full h-14 px-4 bg-white/5 border border-white/10 rounded-lg",
          "text-white placeholder-white/20",
          "focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all",
          "text-center text-3xl tracking-[0.5em] font-mono",
          isPassword && "tracking-[0.5em]" // Ensure spacing for password dots too
        )}
        style={{ letterSpacing: '0.5em' }}
      />
    </div>
  )
}
