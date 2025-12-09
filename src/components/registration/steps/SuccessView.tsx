import React from 'react'
import { Button } from '../../ui/button'
import { CheckCircle } from 'lucide-react'

export function SuccessView() {
  return (
    <div className="text-center space-y-6 py-4">
      <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="h-10 w-10 text-green-500" />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-white">Registration Complete!</h3>
        <p className="text-white/60">Your secure digital identity is ready.</p>
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
