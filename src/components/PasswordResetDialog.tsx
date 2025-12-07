import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Eye, EyeOff, Lock, Shield, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from 'sonner';

interface PasswordResetDialogProps {
  open: boolean;
  email?: string | null;
  onClose: () => void;
  onReset: (newPassword: string) => Promise<void>;
}

// Password strength calculation
function calculatePasswordStrength(password: string): { score: number; feedback: string[]; isSecure: boolean } {
  const feedback: string[] = []
  let score = 0
  
  if (password.length >= 8) score += 20
  else feedback.push('At least 8 characters')
  
  if (password.length >= 12) score += 10
  
  if (/[a-z]/.test(password)) score += 15
  else feedback.push('Lowercase letter')
  
  if (/[A-Z]/.test(password)) score += 15
  else feedback.push('Uppercase letter')
  
  if (/[0-9]/.test(password)) score += 15
  else feedback.push('Number')
  
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 15
  else feedback.push('Special character')
  
  if (!/(..).*\1/.test(password)) score += 10 // No repeated patterns
  else feedback.push('Avoid repeated patterns')
  
  return { score, feedback, isSecure: score >= 80 }
}

export const PasswordResetDialog: React.FC<PasswordResetDialogProps> = ({ open, email, onClose, onReset }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: [] as string[], isSecure: false });
  const [attemptCount, setAttemptCount] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);

  // Rate limiting check
  useEffect(() => {
    const checkRateLimit = () => {
      const rateLimitKey = `password_reset_attempts_${email || 'unknown'}`
      const attempts = JSON.parse(localStorage.getItem(rateLimitKey) || '[]')
      const recentAttempts = attempts.filter((time: number) => Date.now() - time < 15 * 60 * 1000) // 15 minutes
      
      if (recentAttempts.length >= 5) {
        setIsRateLimited(true)
        setError('Too many password reset attempts. Please wait 15 minutes.')
      } else {
        setIsRateLimited(false)
        setAttemptCount(recentAttempts.length)
      }
    }
    
    if (open) {
      checkRateLimit()
    }
  }, [open, email])
  
  // Real-time password strength calculation
  useEffect(() => {
    if (newPassword) {
      setPasswordStrength(calculatePasswordStrength(newPassword))
    } else {
      setPasswordStrength({ score: 0, feedback: [], isSecure: false })
    }
  }, [newPassword])

  const validatePassword = (): string | null => {
    if (!newPassword) return 'Password is required'
    if (newPassword.length < 8) return 'Password must be at least 8 characters'
    if (!passwordStrength.isSecure) return 'Password is not secure enough'
    if (newPassword !== confirmPassword) return 'Passwords do not match'
    
    // Check for common weak passwords
    const weakPasswords = ['password', '12345678', 'qwerty123', 'admin123']
    if (weakPasswords.some(weak => newPassword.toLowerCase().includes(weak))) {
      return 'Password contains common weak patterns'
    }
    
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (isRateLimited) {
      setError('Too many attempts. Please wait before trying again.')
      return
    }
    
    const validationError = validatePassword()
    if (validationError) {
      setError(validationError)
      return
    }
    
    try {
      setIsLoading(true)
      
      // Record attempt for rate limiting
      const rateLimitKey = `password_reset_attempts_${email || 'unknown'}`
      const attempts = JSON.parse(localStorage.getItem(rateLimitKey) || '[]')
      attempts.push(Date.now())
      localStorage.setItem(rateLimitKey, JSON.stringify(attempts.slice(-10))) // Keep last 10
      
      await onReset(newPassword)
      
      // Clear rate limit on success
      localStorage.removeItem(rateLimitKey)
      
      toast.success('Password reset successfully!')
      onClose()
      
    } catch (err: any) {
      const message = err?.message || 'Failed to reset password'
      setError(message)
      
      // Increment attempt count
      setAttemptCount(prev => prev + 1)
      
      if (message.includes('rate limit') || message.includes('too many')) {
        setIsRateLimited(true)
      }
      
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent aria-describedby={error ? 'password-reset-error' : undefined}>
        <DialogHeader>
          <DialogTitle>Reset your password</DialogTitle>
          <DialogDescription>
            {email ? `Account: ${email}` : 'Enter a new password to continue.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">New password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="h-11 pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Password strength indicator */}
          {newPassword && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Password Strength</span>
                {passwordStrength.isSecure && <CheckCircle className="h-4 w-4 text-green-500" />}
                {!passwordStrength.isSecure && passwordStrength.score > 0 && <AlertCircle className="h-4 w-4 text-yellow-500" />}
              </div>
              <Progress value={passwordStrength.score} className="h-2" />
              {passwordStrength.feedback.length > 0 && (
                <p className="text-xs text-gray-500">
                  Missing: {passwordStrength.feedback.join(', ')}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm password</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="h-11 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-xs text-red-600">Passwords do not match</p>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <p id="password-reset-error" className="text-sm text-red-600" role="alert">
                {error}
              </p>
              {isRateLimited && (
                <p className="text-xs text-red-500 mt-1">
                  Please wait 15 minutes before trying again.
                </p>
              )}
            </div>
          )}
          
          {attemptCount > 0 && !isRateLimited && (
            <div className="p-2 rounded bg-yellow-50 border border-yellow-200">
              <p className="text-xs text-yellow-700">
                Attempts: {attemptCount}/5 (resets in 15 minutes)
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1" 
              disabled={isLoading || isRateLimited || !passwordStrength.isSecure}
            >
              {isLoading ? 'Updating…' : 'Reset password'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PasswordResetDialog;
