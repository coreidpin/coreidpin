import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, ArrowRight, Loader2, CheckCircle2, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { toast } from 'sonner';
import { api } from '../../utils/api';

interface PhoneToPinWidgetProps {
  currentPin: string;
  phoneNumber?: string;
  onSuccess: (newPin: string) => void;
}

export function PhoneToPinWidget({ currentPin, phoneNumber, onSuccess }: PhoneToPinWidgetProps) {
  const [isLoading, setIsLoading] = useState(false);

  // If PIN is already phone number (simple check: mostly digits and length match)
  const isPhonePin = phoneNumber && currentPin === phoneNumber.replace(/\D/g, '');

  if (isPhonePin || !phoneNumber) return null;

  const handleConvert = async () => {
    if (!phoneNumber) return;
    
    setIsLoading(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) throw new Error('Not authenticated');

      const result = await api.convertPhoneToPIN(phoneNumber, accessToken);
      
      if (result.success) {
        toast.success('PIN updated successfully!', {
            description: `Your new PIN is ${result.pinNumber}`
        });
        onSuccess(result.pinNumber);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update PIN');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-3 opacity-10">
            <RefreshCw className="w-24 h-24 text-blue-500" />
        </div>
        
        <CardContent className="p-6 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <Phone className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Use Phone Number as PIN?</h3>
              <p className="text-gray-400 text-sm max-w-md">
                Make your Professional Identity Number easier to remember by converting it to match your verified phone number ({phoneNumber}).
              </p>
            </div>
          </div>

          <Button 
            onClick={handleConvert} 
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white min-w-[160px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                Convert Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
