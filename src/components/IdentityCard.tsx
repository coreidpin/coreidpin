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
        .maybeSingle();

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 py-8 font-sans selection:bg-blue-100">
      <div className="container mx-auto px-4 max-w-lg">
        {/* Header Navigation */}
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-8 text-black hover:text-slate-900 hover:bg-slate-100 transition-all group"
        >
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Premium ID Card Design */}
          <div className="relative group perspective-1000">
            {/* Glow Effects */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
            
            <div className="relative bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xl transition-all duration-500 hover:scale-[1.01]">
              
              {/* Decorative Background Elements */}
              <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
              
              {/* Header Strip */}
              <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
              
              <div className="p-6 sm:p-8 relative z-10">
                {/* Top Section: Identity & Verification */}
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-4">
                    {/* Dynamic Avatar */}
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-lg group-hover:shadow-blue-500/20 transition-all ring-2 ring-slate-100">
                        {profile?.profile_picture_url ? (
                          <img src={profile.profile_picture_url} alt={profile.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-purple-400">
                            {profile?.name?.charAt(0) || 'U'}
                          </span>
                        )}
                      </div>
                      {verificationStatus === 'verified' && (
                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 border border-slate-100">
                          <div className="bg-blue-500 rounded-full p-0.5">
                            <CheckCircle2 className="h-3 w-3 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h1 className="text-2xl font-bold text-black tracking-tight mb-1">
                        {profile?.name || 'User'}
                      </h1>
                      <p className="text-black font-medium text-xs uppercase tracking-widest">
                        {profile?.role || 'Professional'}
                      </p>
                    </div>
                  </div>

                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider border backdrop-blur-md ${
                    verificationStatus === 'verified' 
                      ? 'bg-blue-50 text-blue-600 border-blue-200 shadow-sm' 
                      : 'bg-slate-100 text-black border-slate-200'
                  }`}>
                    {verificationStatus === 'verified' ? 'VERIFIED ID' : 'UNVERIFIED'}
                  </div>
                </div>

                {/* Main Content Section */}
                <div className="space-y-6">
                  {/* Contact Information Section */}
                  <div className="space-y-4">
                    {profile?.email && (
                      <div className="group/item">
                        <p className="text-[10px] uppercase tracking-widest text-black mb-1">Email</p>
                        <div className="flex items-center gap-3 text-black">
                          <div className="p-1.5 rounded-md bg-blue-50 text-blue-600">
                            <Mail className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-sm font-medium truncate">{profile.email}</span>
                        </div>
                      </div>
                    )}
                    
                    {profile?.phone && (
                      <div className="group/item">
                        <p className="text-[10px] uppercase tracking-widest text-black mb-1">Phone</p>
                        <div className="flex items-center gap-3 text-black">
                          <div className="p-1.5 rounded-md bg-purple-50 text-purple-600">
                            <Phone className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-sm font-medium">{profile.phone}</span>
                        </div>
                      </div>
                    )}

                    {profile?.industry && (
                      <div className="group/item">
                        <p className="text-[10px] uppercase tracking-widest text-black mb-1">Industry</p>
                        <div className="flex items-center gap-3 text-black">
                          <div className="p-1.5 rounded-md bg-pink-50 text-pink-600">
                            <Briefcase className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-sm font-medium">{profile.industry}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Two Column Layout for PIN and QR */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
                    {/* PIN Section */}
                    <div className="pt-2">
                      <div className="text-[10px] uppercase tracking-widest text-black font-bold mb-2 flex items-center gap-2">
                        <Shield className="h-3 w-3" />
                        Secure PIN
                      </div>
                      {pin ? (
                        <div className="relative overflow-hidden inline-flex items-center gap-3 px-5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 shadow-inner group/pin">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover/pin:opacity-100 transition-opacity" />
                          <span className="text-xl font-mono font-bold text-black tracking-[0.2em]">
                            {pin}
                          </span>
                        </div>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate('/dashboard')}
                          className="text-xs h-9 border-dashed border-slate-300 text-black hover:text-black hover:border-slate-400 hover:bg-slate-50"
                        >
                          Generate PIN
                        </Button>
                      )}
                    </div>

                    {/* QR Code Section */}
                    <div className="flex flex-col items-center sm:items-end justify-center">
                      <div className="relative group/qr">
                        <div className="absolute -inset-1 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl blur opacity-20 group-hover/qr:opacity-50 transition duration-500" />
                        <div className="relative bg-white p-3 rounded-lg shadow-xl">
                          {publicProfileUrl && (
                            <QRCodeSVG 
                              value={publicProfileUrl}
                              size={110}
                              level="H"
                              className="rounded"
                            />
                          )}
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-1.5 text-black">
                        <span className="text-[10px] font-bold uppercase tracking-widest">Scan to Verify</span>
                        <ArrowLeft className="h-3 w-3 rotate-180" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Strip */}
                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-600 shadow-sm" />
                    <span className="text-xs font-bold text-black tracking-widest">CORE ID</span>
                  </div>
                  <span className="text-[10px] text-black font-mono">SECURE DIGITAL IDENTITY</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Button
              onClick={handleShare}
              className="bg-white text-black hover:bg-slate-50 shadow-sm border border-slate-200 transition-all hover:-translate-y-0.5 font-medium"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>

            <Button
              onClick={handleDownloadWallet}
              variant="outline"
              className="bg-white border-slate-200 text-black hover:bg-slate-50 hover:text-black hover:border-slate-300 transition-all hover:-translate-y-0.5"
            >
              <Download className="h-4 w-4 mr-2" />
              Wallet
            </Button>

            {publicProfileUrl && (
              <Button
                onClick={() => window.open(publicProfileUrl, '_blank')}
                variant="outline"
                className="bg-white border-slate-200 text-black hover:bg-slate-50 hover:text-black hover:border-slate-300 transition-all hover:-translate-y-0.5"
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
