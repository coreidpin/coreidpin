import React, { useMemo, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { CountryCodeSelect } from '../ui/country-code-select'
import { Badge } from '../ui/badge'
import { toast } from 'sonner'
import { Mail, MessageSquare, Link as LinkIcon, Copy, CheckCircle, Smartphone } from 'lucide-react'

type Theme = 'light' | 'dark'

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

function isPhone(value: string) {
  return /^[0-9\s\-()]+$/.test(value.trim()) && value.replace(/[^0-9]/g, '').length >= 8
}

function getReferralLink() {
  const stored = typeof window !== 'undefined' ? localStorage.getItem('referral_link') : null
  if (stored) return stored
  const uid = typeof window !== 'undefined' ? localStorage.getItem('userId') || 'guest' : 'guest'
  return `${window.location.origin}/get-started?ref=${uid}`
}

export function InviteFriendsCard() {
  const [theme, setTheme] = useState<Theme>('light')
  const [countryCode, setCountryCode] = useState<string>(localStorage.getItem('defaultCountryCode') || '+234')
  const [contact, setContact] = useState('')
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)
  const [inviteCount, setInviteCount] = useState<number>(() => Number(localStorage.getItem('inviteCount') || 0))

  useEffect(() => {
    try {
      const dark = document.documentElement.classList.contains('dark')
      setTheme(dark ? 'dark' : 'light')
    } catch {}
  }, [])

  const isValid = useMemo(() => {
    if (!contact.trim()) return false
    if (contact.includes('@')) return isEmail(contact)
    return isPhone(contact)
  }, [contact])

  const [link, setLink] = useState<string>(() => getReferralLink())

  const sendInvite = async () => {
    if (!isValid) {
      toast.error('Enter a valid phone number or email')
      return
    }
    setBusy(true)
    try {
      const token = localStorage.getItem('accessToken')
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const channel = contact.includes('@') ? 'email' : 'sms'

      const res = await fetch(`${supabaseUrl}/functions/v1/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : { 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` })
        },
        body: JSON.stringify({
          inviter_user_id: localStorage.getItem('userId'),
          contact: contact.includes('@') ? contact : `${countryCode} ${contact}`,
          channel
        })
      })

      const data = await res.json()
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to send invite')
      }

      const next = inviteCount + 1
      setInviteCount(next)
      localStorage.setItem('inviteCount', String(next))
      const finalLink = data?.default_referral_link || data?.referral?.referral_link
      if (finalLink) {
        localStorage.setItem('referral_link', finalLink)
        setLink(finalLink)
      }
      toast.success(channel === 'email' ? 'Invite sent via email' : 'Invite sent via SMS')
      setContact('')
    } catch (e: any) {
      toast.error(e?.message || 'Failed to send invite')
    } finally {
      setBusy(false)
    }
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      toast.success('Invite link copied')
      setTimeout(() => setCopied(false), 1200)
    } catch {
      toast.error('Failed to copy link')
    }
  }

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`Join me on GidiPIN: ${link}`)
    const url = `https://wa.me/?text=${text}`
    window.open(url, '_blank')
  }

  const shareSMS = () => {
    const body = encodeURIComponent(`Join me on GidiPIN: ${link}`)
    const url = `sms:?&body=${body}`
    window.open(url, '_blank')
  }

  const shareEmail = () => {
    const subject = encodeURIComponent('Join me on GidiPIN')
    const body = encodeURIComponent(`Secure your professional identity and unlock opportunities.
${link}`)
    const url = `mailto:?subject=${subject}&body=${body}`
    window.open(url, '_self')
  }

  return (
    <Card className="rounded-2xl overflow-hidden border-0 shadow-sm bg-white dark:bg-[#0A0B0D]">
      <CardHeader className="space-y-1 bg-gradient-to-r from-[#bfa5ff]/20 via-[#7bb8ff]/10 to-transparent">
        <CardTitle className="text-lg sm:text-xl font-semibold tracking-tight text-[#0A0B0D] dark:text-white">
          Invite your circle to GidiPIN
        </CardTitle>
        <CardDescription className="text-sm text-[#0A0B0D]/70 dark:text-white/60">
          Help your friends secure their professional identity and unlock opportunities.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5 sm:p-6 space-y-6">
        <div className="flex items-start gap-4">
          <div className="flex-1 space-y-2">
            <Label htmlFor="invite-contact" className="text-sm">Contact</Label>
            <div className="flex gap-2">
              {!contact.includes('@') && (
                <CountryCodeSelect
                  value={countryCode}
                  onChange={setCountryCode}
                  className="min-w-[120px]"
                />
              )}
              <Input
                id="invite-contact"
                placeholder="Enter phone number or email"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="h-11 flex-1 bg-white dark:bg-[#0A0B0D] border-gray-200 dark:border-white/10"
              />
            </div>
            <div className="text-xs">
              {!contact ? (
                <span className="text-muted-foreground">Enter phone or email</span>
              ) : isValid ? (
                <span className="text-green-600">Looks good</span>
              ) : (
                <span className="text-red-600">Invalid contact</span>
              )}
            </div>
          </div>
        </div>

        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
          <Button
            onClick={sendInvite}
            disabled={!isValid || busy}
            className="w-full h-11 rounded-xl text-black dark:text-[#0A0B0D] shadow-sm"
            style={{
              background: 'linear-gradient(90deg, #32f08c 0%, #7bb8ff 100%)',
            }}
          >
            {busy ? 'Sending…' : 'Send Invite'}
          </Button>
        </motion.div>

        <div className="space-y-3">
          <div className="text-xs text-muted-foreground">Or share your invite link</div>
          <div className="flex items-center gap-3">
            <motion.button
              onClick={shareWhatsApp}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.96 }}
              className="h-10 w-10 rounded-full bg-white dark:bg-[#0A0B0D] flex items-center justify-center shadow-[0_0_0_4px_rgba(191,165,255,0.25)]"
            >
              <MessageSquare className="h-5 w-5 text-[#25D366]" />
            </motion.button>
            <motion.button
              onClick={shareSMS}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.96 }}
              className="h-10 w-10 rounded-full bg-white dark:bg-[#0A0B0D] flex items-center justify-center shadow-[0_0_0_4px_rgba(191,165,255,0.25)]"
            >
              <Smartphone className="h-5 w-5 text-[#0A0B0D] dark:text-white" />
            </motion.button>
            <motion.button
              onClick={shareEmail}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.96 }}
              className="h-10 w-10 rounded-full bg-white dark:bg-[#0A0B0D] flex items-center justify-center shadow-[0_0_0_4px_rgba(191,165,255,0.25)]"
            >
              <Mail className="h-5 w-5 text-[#7bb8ff]" />
            </motion.button>
            <motion.button
              onClick={copyLink}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.96 }}
              className="h-10 w-10 rounded-full bg-white dark:bg-[#0A0B0D] flex items-center justify-center shadow-[0_0_0_4px_rgba(191,165,255,0.25)]"
            >
              <LinkIcon className="h-5 w-5 text-[#0A0B0D] dark:text-white" />
            </motion.button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input readOnly value={link} className="pr-24 h-11 bg-white dark:bg-[#0A0B0D] border-gray-200 dark:border-white/10" />
            <motion.button
              onClick={copyLink}
              whileTap={{ scale: 0.97 }}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-9 px-3 rounded-lg bg-gray-100 dark:bg-white/10 text-sm"
            >
              {copied ? (
                <span className="inline-flex items-center gap-1"><CheckCircle className="h-4 w-4 text-green-600" /> Copied</span>
              ) : (
                <span className="inline-flex items-center gap-1"><Copy className="h-4 w-4" /> Copy</span>
              )}
            </motion.button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">You’ve invited {inviteCount} people so far</div>
          <div className="relative h-8 w-8">
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  'conic-gradient(from 0deg, #32f08c 0%, #7bb8ff 50%, #bfa5ff 100%)',
                boxShadow: '0 0 20px rgba(191,165,255,0.15)'
              }}
            />
            <div className="absolute inset-[3px] rounded-full bg-white dark:bg-[#0A0B0D]" />
          </div>
        </div>

        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="text-xs text-[#0A0B0D]/70 dark:text-white/60"
          >
            Spread the word—let your people join the future of work.
          </motion.div>
        </AnimatePresence>

        <div className="mt-2">
          <Illustration theme={theme} />
        </div>
      </CardContent>
    </Card>
  )
}

function Illustration({ theme }: { theme: Theme }) {
  const dark = theme === 'dark'
  return (
    <svg className="w-full" viewBox="0 0 360 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#bfa5ff" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#7bb8ff" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id="g2" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#32f08c" />
          <stop offset="100%" stopColor="#7bb8ff" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="360" height="120" fill="none" />
      <rect x="16" y="12" rx="16" width="72" height="96" fill={dark ? '#0A0B0D' : '#ffffff'} stroke="#bfa5ff" opacity="0.6" />
      <circle cx="52" cy="28" r="6" fill="#32f08c" />
      <rect x="30" y="44" width="44" height="8" rx="4" fill="#7bb8ff" opacity="0.6" />
      <rect x="26" y="60" width="52" height="8" rx="4" fill="#bfa5ff" opacity="0.6" />
      <g>
        <circle cx="160" cy="32" r="14" fill="#bfa5ff" opacity="0.8" />
        <circle cx="220" cy="24" r="12" fill="#32f08c" opacity="0.9" />
        <circle cx="200" cy="64" r="13" fill="#7bb8ff" opacity="0.9" />
        <path d="M174 32 L207 57" stroke="url(#g1)" strokeWidth="2" />
        <path d="M174 32 L208 24" stroke="url(#g1)" strokeWidth="2" />
        <path d="M220 24 L207 57" stroke="url(#g1)" strokeWidth="2" />
      </g>
      <rect x="272" y="20" width="72" height="16" rx="8" fill="url(#g2)" opacity="0.9" />
      <rect x="274" y="40" width="68" height="8" rx="4" fill="#bfa5ff" opacity="0.5" />
      <rect x="274" y="54" width="52" height="8" rx="4" fill="#7bb8ff" opacity="0.5" />
    </svg>
  )
}

export default InviteFriendsCard
