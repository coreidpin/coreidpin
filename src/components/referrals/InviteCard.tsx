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
    <Card className="bg-gradient-to-br from-primary/5 to-purple-500/5 border-primary/20 overflow-hidden relative">
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-primary/10 rounded-full blur-2xl animate-pulse" />
      
      <CardHeader>
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="bg-primary/10 text-primary mb-2">
            <Sparkles className="h-3 w-3 mr-1" />
            Grow the Community
          </Badge>
        </div>
        <CardTitle className="text-xl">Invite Professionals</CardTitle>
        <CardDescription>
          Share your unique link. When they join and verify, you both earn reputation badges.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {loading ? (
          <div className="h-10 w-full bg-gray-100 animate-pulse rounded-md" />
        ) : (
          <div className="flex items-center space-x-2">
            <Input 
              value={referralLink} 
              readOnly 
              className="bg-white/50 font-mono text-xs md:text-sm"
            />
            <Button size="icon" variant="outline" onClick={copyToClipboard} className="shrink-0">
              {copied ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </Button>
            <Button size="icon" onClick={shareLink} className="shrink-0">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="flex items-center gap-4 text-xs text-muted-foreground bg-white/50 p-3 rounded-lg border border-primary/5">
          <div className="flex items-center gap-2">
            <Gift className="h-4 w-4 text-primary" />
            <span>Earn "Community Builder" badge</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
