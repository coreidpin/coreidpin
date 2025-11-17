import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { CheckCircle } from 'lucide-react'

type Props = {
  open: boolean
  onClose: () => void
  userType: 'employer' | 'professional' | 'university'
}

export function VerificationSuccessModal({ open, onClose, userType }: Props) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Email Verified
          </DialogTitle>
          <DialogDescription>
            Your account has been verified. Continue to your {userType} dashboard.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <Button onClick={onClose} className="w-full">Continue</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

