import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { supabase, supabaseUrl } from '../utils/supabase/client';
import { getSessionState, ensureValidSession } from '../utils/session';
import { Button } from './ui/button';
import { PremiumIdentityCard } from './PremiumIdentityCard';

export const IdentityCard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [pin, setPin] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<any>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isDownloadingWallet, setIsDownloadingWallet] = useState(false);
  
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

    setIsSharing(true);
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
    } finally {
      setIsSharing(false);
    }
  };

  const handleDownloadWallet = async () => {
    setIsDownloadingWallet(true);
    try {
      toast.loading('Generating wallet pass...');
      
      const session = getSessionState();
      const response = await fetch(`${supabaseUrl}/functions/v1/identity-card/${session?.userId}/wallet`, {
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
    } finally {
      setIsDownloadingWallet(false);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 py-12 px-4">
      <div className="max-w-md mx-auto space-y-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <PremiumIdentityCard
          name={profile?.name || 'User'}
          role={profile?.role || 'Professional'}
          location={profile?.city || profile?.location || 'Location not set'}
          email={profile?.email}
          phone={profile?.phone}
          industry={profile?.industry}
          pinNumber={pin || undefined}
          avatar={profile?.profile_picture_url}
          verificationStatus={verificationStatus === 'verified' ? 'verified' : 'pending'}
          onGeneratePin={() => navigate('/dashboard', { state: { openPinGeneration: true } })}
        />
      </div>
    </div>
  );
};
