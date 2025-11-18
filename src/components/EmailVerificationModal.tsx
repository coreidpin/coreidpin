import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { api } from '../utils/api'

type Props = {
  isOpen: boolean
  onClose: () => void
  userEmail?: string
}

export function EmailVerificationModal({ isOpen, onClose, userEmail }: Props) {
  const [email, setEmail] = React.useState(userEmail || '')
  const [code, setCode] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)
  const [message, setMessage] = React.useState('')

  React.useEffect(() => {
    setEmail(userEmail || '')
  }, [userEmail])

  const handleSend = async () => {
    setSubmitting(true)
    setMessage('')
    try {
      await api.sendVerificationEmail(email)
      setMessage('Verification email sent. Check your inbox.')
    } catch {
      setMessage('Failed to send verification email')
    } finally {
      setSubmitting(false)
    }
  }

  const handleVerify = async () => {
    setSubmitting(true)
    setMessage('')
    try {
      await api.verifyEmailCode(email, code)
      try { localStorage.setItem('emailVerified', 'true') } catch {}
      setMessage('Email verified')
      onClose()
    } catch (e: any) {
      setMessage(e?.message || 'Invalid or expired code')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="bg-black/60 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>Email Verification</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div className="flex gap-2">
            <Button disabled={submitting || !email} onClick={handleSend} className="bg-[#7bb8ff] text-black hover:opacity-90">Send Code</Button>
          </div>
          <div className="space-y-2">
            <Label htmlFor="code">Verification Code</Label>
            <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" />
          </div>
          <div className="flex gap-2">
            <Button disabled={submitting || !code} onClick={handleVerify} className="bg-[#32f08c] text-black hover:opacity-90">Verify</Button>
            <Button variant="outline" onClick={onClose} className="border-white/20">Cancel</Button>
          </div>
          {message && <div className="text-sm text-white/70">{message}</div>}
        </div>
      </DialogContent>
    </Dialog>
  )
}
