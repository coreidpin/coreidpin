import React from 'react'
import { Button } from '../../ui/button'
import { CheckCircle } from 'lucide-react'

export function SuccessView() {
  return (
    <div className="text-left space-y-6 py-4">
      <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center">
        <CheckCircle className="h-8 w-8 text-emerald-500" />
      </div>
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-white">Registration Complete!</h3>
        <p className="text-white/60">Your secure global professional identity is now active. Welcome to the future of verified identity.</p>
      </div>
      <Button
        onClick={() => {
          const userType = localStorage.getItem('userType');
          window.location.href = userType === 'business' ? '/developer' : '/dashboard';
        }}
        className="w-full h-14 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium text-base shadow-lg shadow-green-900/20 transition-all"
      >
        Go to Dashboard
      </Button>
    </div>
  )
}
