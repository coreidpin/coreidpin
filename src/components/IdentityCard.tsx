import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'motion/react';
import {
  Shield, Phone, Mail, Briefcase, Download, Share2,
  CheckCircle2, ExternalLink, ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { supabase } from '../utils/supabase/client';
import { getSessionState, ensureValidSession } from '../utils/session';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

export const IdentityCard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [pin, setPin] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<any>(null);
  
  const baseUrl = window.location.origin;
  const publicProfileUrl = profile?.profile_url_slug 
    ? `${baseUrl}/profile/${profile.profile_url_slug}` 
    : '';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = await ensureValidSession();
      if (!token) {
        navigate('/login');
        return;
      }

      const session = getSessionState();
      if (!session?.userId) {
        navigate('/login');
        return;
      }

      // Fetch Profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.userId)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch PIN
      const { data: pinData } = await supabase
        .from('professional_pins')
        .select('pin_number, verification_status')
        .eq('user_id', session.userId)
        .single();

      if (pinData) {
        setPin(pinData.pin_number);
        setVerificationStatus(pinData.verification_status);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load identity card data');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!publicProfileUrl) {
      toast.error('Profile URL not available');
      return;
    }

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${profile.name} - CoreID`,
          text: `Check out my professional identity on CoreID`,
          url: publicProfileUrl
        });

        // Log share event
        await supabase.from('profile_shares').insert({
          user_id: profile.user_id,
          shared_via: 'link'
        });

        toast.success('Shared successfully');
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(publicProfileUrl);
        toast.success('Link copied to clipboard');
      }
    } catch (error) {
      console.error('Share error:', error);
      toast.error('Failed to share');
    }
  };

  const handleDownloadWallet = async () => {
    try {
      toast.loading('Generating wallet pass...');
      
      const session = getSessionState();
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/identity-card/${session?.userId}/wallet`, {
        headers: {
          'Authorization': `Bearer ${await ensureValidSession()}`
        }
      });

      if (!response.ok) throw new Error('Failed to generate wallet pass');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'coreid.pkpass';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.dismiss();
      toast.success('Wallet pass downloaded');
    } catch (error) {
      toast.dismiss();
      console.error('Wallet download error:', error);
      toast.error('Failed to download wallet pass');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0b0d] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#32f08c]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-white py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-6 text-white/60 hover:text-white pl-0 hover:bg-transparent"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Digital Identity Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Main Card */}
          <Card className="bg-gradient-to-br from-[#32f08c]/20 via-[#0e0f12] to-[#bfa5ff]/20 border-[#32f08c]/30 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Left: Profile Info */}
                <div className="flex-1 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-white mb-1">{profile?.name || 'User'}</h1>
                      <p className="text-white/90">{profile?.role || 'Professional'}</p>
                    </div>
                    <Badge className="bg-[#32f08c]/20 text-[#32f08c] border-[#32f08c]/30">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      {verificationStatus === 'verified' ? 'Verified' : 'Pending'}
                    </Badge>
                  </div>

                  {/* Contact */}
                  <div className="space-y-2">
                    {profile?.phone && (
                      <div className="flex items-center gap-2 text-white/80">
                        <Phone className="h-4 w-4 text-[#32f08c]" />
                        <span className="text-sm">{profile.phone}</span>
                      </div>
                    )}
                    {profile?.email && (
                      <div className="flex items-center gap-2 text-white/80">
                        <Mail className="h-4 w-4 text-[#32f08c]" />
                        <span className="text-sm">{profile.email}</span>
                      </div>
                    )}
                    {profile?.industry && (
                      <div className="flex items-center gap-2 text-white/80">
                        <Briefcase className="h-4 w-4 text-[#32f08c]" />
                        <span className="text-sm">{profile.industry}</span>
                      </div>
                    )}
                  </div>

                  {/* PIN Display */}
                  {pin && (
                    <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-4 w-4 text-[#32f08c]" />
                        <span className="text-xs text-white/60 uppercase tracking-wide">Professional PIN</span>
                      </div>
                      <div className="text-2xl font-mono font-bold text-white tracking-wider">{pin}</div>
                    </div>
                  )}
                </div>

                {/* Right: QR Code */}
                <div className="flex flex-col items-center justify-center gap-3">
                  {publicProfileUrl && (
                    <>
                      <div className="p-4 bg-white rounded-lg">
                        <QRCodeSVG 
                          value={publicProfileUrl}
                          size={180}
                          level="H"
                          includeMargin
                        />
                      </div>
                      <p className="text-xs text-white/60 text-center">
                        Scan to view profile
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Bio */}
              {profile?.bio && (
                <div className="mt-6 pt-6 border-t border-white/10">
                  <p className="text-white/90 text-sm leading-relaxed">{profile.bio}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={handleShare}
              className="bg-[#32f08c] hover:bg-[#32f08c]/90 text-black font-semibold"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share Card
            </Button>

            <Button
              onClick={handleDownloadWallet}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/5"
            >
              <Download className="h-4 w-4 mr-2" />
              Add to Wallet
            </Button>

            {publicProfileUrl && (
              <Button
                onClick={() => window.open(publicProfileUrl, '_blank')}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/5"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Public Profile
              </Button>
            )}
          </div>

          {/* Info Card */}
          <Card className="bg-[#0e0f12]/60 border-[#1a1b1f]/50">
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold text-white mb-3">About Your Identity Card</h3>
              <ul className="space-y-2 text-sm text-white/80">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#32f08c] flex-shrink-0 mt-0.5" />
                  <span>Your QR code links to your public profile that anyone can verify</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#32f08c] flex-shrink-0 mt-0.5" />
                  <span>Share your card at networking events for instant credential sharing</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#32f08c] flex-shrink-0 mt-0.5" />
                  <span>Add to Apple Wallet for quick access on your mobile device</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
