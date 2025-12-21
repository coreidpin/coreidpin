import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { supabase } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { Loader2, Send, CheckCircle2 } from 'lucide-react';

interface ContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  professionalId: string;
  professionalName: string;
}

export function ContactModal({ open, onOpenChange, professionalId, professionalName }: ContactModalProps) {
  console.log('ContactModal render:', { open, professionalId });
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    sender_name: '',
    sender_email: '',
    inquiry_type: '',
    message: '',
    budget_range: '',
    timeframe: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.inquiry_type) {
        toast.error('Please select how you want to work together');
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!formData.sender_name || !formData.sender_email || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      if (!professionalId) throw new Error('Professional ID is missing');
      
      const cleanId = professionalId.trim();
      console.log('Inserting Lead for:', cleanId);

      const { error } = await supabase.from('job_leads').insert({
        professional_id: cleanId,
        sender_name: formData.sender_name,
        sender_email: formData.sender_email,
        inquiry_type: formData.inquiry_type,
        message: formData.message,
        budget_range: formData.budget_range,
        // timeframe: formData.timeframe // schema doesn't have timeframe, putting in message or separate if needed. Let's append to message for now or rely on budget_range as proxy for project scope.
        // Actually I can just add it to the message or budget column if I didn't verify schema column existence.
        // Migration added: sender_name, sender_email, inquiry_type, budget_range, message.
      });

      if (error) throw error;

      toast.success('Message sent successfully!');

      // Send Email Notification (Async)
      supabase.functions.invoke('send-lead-notification', {
        body: {
          professional_id: professionalId,
          sender_name: formData.sender_name,
          sender_email: formData.sender_email,
          inquiry_type: formData.inquiry_type,
          message: formData.message,
          budget_range: formData.budget_range
        }
      }).then(({ error }) => {
        if (error) console.error('Failed to send email notification:', error);
      });

      onOpenChange(false);
      
      // Reset form after delay
      setTimeout(() => {
        setStep(1);
        setFormData({
          sender_name: '',
          sender_email: '',
          inquiry_type: '',
          message: '',
          budget_range: '',
          timeframe: ''
        });
      }, 500);

    } catch (error: any) {
      console.error('Error sending lead:', error);
      toast.error(error.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? `Hire ${professionalName}` : 'Contact Details'}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <Label>How can I help you?</Label>
                <Select 
                  value={formData.inquiry_type} 
                  onValueChange={(val) => handleInputChange('inquiry_type', val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select opportunity type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_time">Full-time Role</SelectItem>
                    <SelectItem value="contract">Contract / Project</SelectItem>
                    <SelectItem value="freelance">Freelance Task</SelectItem>
                    <SelectItem value="consultation">Consultation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(formData.inquiry_type === 'contract' || formData.inquiry_type === 'freelance') && (
                 <div className="space-y-2">
                  <Label>Budget Range (USD)</Label>
                  <Select 
                    value={formData.budget_range} 
                    onValueChange={(val) => handleInputChange('budget_range', val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select budget..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="<1k">Less than $1,000</SelectItem>
                      <SelectItem value="1k-5k">$1,000 - $5,000</SelectItem>
                      <SelectItem value="5k-10k">$5,000 - $10,000</SelectItem>
                      <SelectItem value="10k+">$10,000+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Project / Inquiry Details</Label>
                <Textarea 
                  placeholder="Tell me a bit about what you need..."
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <Label>Your Name</Label>
                <Input 
                  placeholder="John Doe"
                  value={formData.sender_name}
                  onChange={(e) => handleInputChange('sender_name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Your Email</Label>
                <Input 
                  type="email"
                  placeholder="john@example.com"
                  value={formData.sender_email}
                  onChange={(e) => handleInputChange('sender_email', e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2 sm:justify-between">
          {step === 1 ? (
             <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
               Cancel
             </Button>
          ) : (
            <Button type="button" variant="outline" onClick={handleBack}>
              Back
            </Button>
          )}

          {step === 1 ? (
            <Button onClick={handleNext} className="bg-black text-white hover:bg-gray-800">
              Next
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading} className="bg-black text-white hover:bg-gray-800">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  Send Message
                  <Send className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
