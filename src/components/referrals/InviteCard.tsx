import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Share2, Copy, CheckCircle, Gift, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { ensureReferralCode } from '@/utils/referralUtils';
import { supabase } from '@/utils/supabase/client';

export function InviteCard() {
  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralLink, setReferralLink] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchCode();
  }, []);

  const fetchCode = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const code = await ensureReferralCode(user.id);
      if (code) {
        setReferralCode(code);
        setReferralLink(`${window.location.origin}/join?ref=${code}`);
      }
    } catch (error) {
      console.error('Error fetching referral code:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join GidiPIN',
          text: 'Join the verified professional network of Nigeria.',
          url: referralLink,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <div 
      className="relative overflow-hidden w-full"
      style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
      }}
    >
      {/* Premium Background Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="relative z-10 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/20 mb-2">
            <Sparkles className="h-3 w-3 mr-1" />
            Grow the Community
          </Badge>
        </div>
        
        <div>
          <h3 className="text-xl font-bold text-white mb-2">Invite Professionals</h3>
          <p className="text-gray-400 text-sm">
            Share your unique link. When they join and verify, you both earn reputation badges.
          </p>
        </div>
        
        <div className="space-y-4">
          {loading ? (
            <div className="h-10 w-full bg-white/5 animate-pulse rounded-md" />
          ) : (
            <div className="flex items-center space-x-2">
              <Input 
                value={referralLink} 
                readOnly 
                className="bg-white/5 border-white/10 text-white font-mono text-xs md:text-sm h-11 focus-visible:ring-blue-500/50"
              />
              <Button 
                size="icon" 
                variant="outline" 
                onClick={copyToClipboard} 
                className="shrink-0 h-11 w-11 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white"
              >
                {copied ? <CheckCircle className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button 
                size="icon" 
                onClick={shareLink} 
                className="shrink-0 h-11 w-11 bg-blue-600 hover:bg-blue-500 text-white border-none"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="flex items-center gap-4 text-xs text-gray-400 bg-white/5 p-3 rounded-lg border border-white/10">
            <div className="flex items-center gap-2">
              <Gift className="h-4 w-4 text-blue-400" />
              <span>Earn "Community Builder" badge</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
