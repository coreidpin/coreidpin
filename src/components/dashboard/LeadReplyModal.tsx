import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Loader2, Send } from 'lucide-react';
import { supabase, supabaseUrl } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { ensureValidSession } from '@/utils/session';

interface LeadReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: {
    id: string;
    sender_name: string;
    sender_email: string;
    message: string;
  } | null;
  onReplySent: (leadId: string) => void;
}

export function LeadReplyModal({ isOpen, onClose, lead, onReplySent }: LeadReplyModalProps) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  // Reset message when modal opens with new lead
  React.useEffect(() => {
    if (isOpen) setMessage(`Hi ${lead?.sender_name?.split(' ')[0]},\n\nThanks for reaching out! `);
  }, [isOpen, lead]);

  const handleSend = async () => {
    if (!lead || !message.trim()) return;

    setSending(true);
    try {
      const token = await ensureValidSession();
      if (!token) {
        console.error('LeadReplyModal: ensureValidSession returned null. Session might be expired or missing.');
        const sessionState = localStorage.getItem('accessToken'); // detailed check
        console.log('LeadReplyModal: Raw token in storage:', sessionState ? 'Present' : 'Missing');
        toast.error('Session expired. Please log in again.');
        return;
      }

      const functionUrl = `${supabaseUrl}/functions/v1/send-lead-reply`;
      console.log('Sending reply to:', functionUrl);
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          lead_id: lead.id,
          message: message
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to send reply');
      }

      toast.success('Reply sent successfully!');
      onReplySent(lead.id);
      onClose();
    } catch (error: any) {
      console.error('Error sending reply:', error);
      toast.error(error.message || 'Failed to send email');
    } finally {
      setSending(false);
    }
  };

  if (!lead) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !sending && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Reply to {lead.sender_name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600 border border-slate-100 italic">
            "{lead.message.length > 100 ? lead.message.substring(0, 100) + '...' : lead.message}"
          </div>

          <div className="space-y-2">
            <Label>Your Message</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your reply..."
              className="min-h-[150px] font-normal"
            />
            <p className="text-xs text-slate-400 text-right">
              Sent to: {lead.sender_email}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={sending}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={sending || !message.trim()} className="bg-blue-600 hover:bg-blue-700 text-white">
            {sending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Email
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
