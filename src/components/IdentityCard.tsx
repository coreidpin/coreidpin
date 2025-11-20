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
    <div className="min-h-screen bg-gray-100 text-gray-900 py-8 font-sans">
      <div className="container mx-auto px-4 max-w-lg">
        {/* Header Navigation */}
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-6 text-gray-600 hover:text-gray-900 pl-0 hover:bg-transparent transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Physical ID Card Design */}
          <div className="relative group perspective-1000">
            <div className="relative bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-200 overflow-hidden transition-transform duration-500 hover:scale-[1.02]">
              
              {/* Decorative Header Strip */}
              <div className="h-3 w-full bg-gradient-to-r from-[#0a0b0d] to-[#1a1b1f]" />
              
              <div className="p-6 sm:p-8">
                {/* Top Section: Identity & Verification */}
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-1">
                      {profile?.name || 'User'}
                    </h1>
                    <p className="text-gray-500 font-medium text-sm uppercase tracking-wider">
                      {profile?.role || 'Professional'}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${
                    verificationStatus === 'verified' 
                      ? 'bg-green-50 text-green-700 border-green-200' 
                      : 'bg-gray-50 text-gray-600 border-gray-200'
                  }`}>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {verificationStatus === 'verified' ? 'VERIFIED' : 'PENDING'}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-8">
                  {/* Left Column: Details */}
                  <div className="flex-1 space-y-5 min-w-0">
                    <div className="space-y-3">
                      {profile?.phone && (
                        <div className="flex items-center gap-3 text-gray-600 group/item">
                          <div className="p-2 rounded-full bg-gray-50 group-hover/item:bg-gray-100 transition-colors">
                            <Phone className="h-4 w-4 text-gray-900" />
                          </div>
                          <span className="text-sm font-medium">{profile.phone}</span>
                        </div>
                      )}
                      {profile?.email && (
                        <div className="flex items-center gap-3 text-gray-600 group/item">
                          <div className="p-2 rounded-full bg-gray-50 group-hover/item:bg-gray-100 transition-colors">
                            <Mail className="h-4 w-4 text-gray-900" />
                          </div>
                          <span className="text-sm font-medium truncate max-w-[180px]">{profile.email}</span>
                        </div>
                      )}
                      {profile?.industry && (
                        <div className="flex items-center gap-3 text-gray-600 group/item">
                          <div className="p-2 rounded-full bg-gray-50 group-hover/item:bg-gray-100 transition-colors">
                            <Briefcase className="h-4 w-4 text-gray-900" />
                          </div>
                          <span className="text-sm font-medium">{profile.industry}</span>
                        </div>
                      )}
                    </div>

                    {/* PIN Section */}
                    {pin && (
                      <div className="pt-2">
                        <div className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-1.5">Professional PIN</div>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-100">
                          <Shield className="h-4 w-4 text-gray-900" />
                          <span className="text-xl font-mono font-bold text-gray-900 tracking-widest">{pin}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: QR Code */}
                  <div className="flex flex-col items-center justify-center sm:items-end">
                    {publicProfileUrl && (
                      <div className="bg-white p-2 rounded-xl border-2 border-gray-100 shadow-sm">
                        <QRCodeSVG 
                          value={publicProfileUrl}
                          size={120}
                          level="H"
                          className="rounded-lg"
                        />
                      </div>
                    )}
                    <p className="mt-2 text-[10px] text-gray-400 font-medium uppercase tracking-wide text-center sm:text-right w-full">
                      Scan to Verify
                    </p>
                  </div>
                </div>

                {/* Footer Strip */}
                <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-gray-900" />
                    <span className="text-xs font-bold text-gray-900 tracking-wider">CORE ID</span>
                  </div>
                  <span className="text-[10px] text-gray-400">Official Digital Identity</span>
                </div>
              </div>
            </div>
            
            {/* Card Shadow Effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-br from-gray-200 to-gray-100 rounded-2xl blur opacity-30 -z-10 translate-y-2" />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button
              onClick={handleShare}
              className="bg-gray-900 hover:bg-gray-800 text-white shadow-lg shadow-gray-900/20 transition-all hover:-translate-y-0.5"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>

            <Button
              onClick={handleDownloadWallet}
              variant="outline"
              className="bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 shadow-sm transition-all hover:-translate-y-0.5"
            >
              <Download className="h-4 w-4 mr-2" />
              Wallet
            </Button>

            {publicProfileUrl && (
              <Button
                onClick={() => window.open(publicProfileUrl, '_blank')}
                variant="outline"
                className="bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 shadow-sm transition-all hover:-translate-y-0.5"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Profile
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
