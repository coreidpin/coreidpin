import React from 'react';
import { useFinchConnect } from '@tryfinch/react-connect';
import { Button } from '../ui/button';
import { Shield } from 'lucide-react';

interface FinchConnectButtonProps {
  onSuccess: (code: string) => void;
  onError: (error: any) => void;
}

export const FinchConnectButton: React.FC<FinchConnectButtonProps> = ({ onSuccess, onError }) => {
  const { open } = useFinchConnect({
    clientId: '93d90810-e1fe-4adf-9675-0f435ec77a06', // Provided Client ID
    // category: 'hris', // Optional: 'hris' | 'ats' | 'individual'
    products: ['employment', 'directory'], // Requests read access to employment data
    sandbox: true, // Use Sandbox environment
    onSuccess: ({ code }) => {
      onSuccess(code);
    },
    onError: (e) => {
      console.error('Finch Connect Error:', e);
      onError(e);
    },
  });

  return (
    <Button 
        onClick={() => open()}
        size="sm" 
        variant="outline"
        className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
    >
        <Shield className="h-4 w-4 mr-2" />
        Connect Payroll (SDK)
    </Button>
  );
};
