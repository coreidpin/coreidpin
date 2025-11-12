import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { PINIdentityCard } from './PINIdentityCard';
import { api } from '../utils/api';
import {
  Share2,
  Linkedin,
  Twitter,
  Facebook,
  MessageCircle,
  Copy,
  QrCode,
  ArrowLeft,
  Shield,
  CheckCircle,
  Loader2,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

interface PublicPINPageProps {
  pinNumber: string;
  onNavigate?: (page: string) => void;
}

export function PublicPINPage({ pinNumber, onNavigate }: PublicPINPageProps) {
  const [pinData, setPinData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    loadPINData();
    updateMetaTags();
  }, [pinNumber]);

  const loadPINData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await api.getPublicPIN(pinNumber);
      
      if (result.success && result.data) {
        setPinData(result.data);
        updateMetaTags(result.data);
      } else {
        setError('PIN not found or not verified');
      }
    } catch (err: any) {
      console.error('Failed to load PIN:', err);
      setError(err.message || 'Failed to load PIN');
    } finally {
      setIsLoading(false);
    }
  };

  const updateMetaTags = (data?: any) => {
    const title = data 
      ? `${data.name} - ${data.title} | CoreID Professional PIN`
      : 'Professional PIN | CoreID';
    const description = data
      ? `Verified professional profile for ${data.name}. Trust Score: ${data.trustScore}/100. View credentials, experience, and verified skills.`
      : 'View verified professional credentials on CoreID';
    const url = `${window.location.origin}/pin/${pinNumber}`;

    // Update title
    document.title = title;

    // Update or create meta tags
    const updateMeta = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    const updateMetaName = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Open Graph tags
    updateMeta('og:title', title);
    updateMeta('og:description', description);
    updateMeta('og:url', url);
    updateMeta('og:type', 'profile');
    updateMeta('og:image', 'https://coreid.ng/og-pin-preview.png'); // TODO: Generate dynamic OG image

    // Twitter Card tags
    updateMetaName('twitter:card', 'summary_large_image');
    updateMetaName('twitter:title', title);
    updateMetaName('twitter:description', description);
    updateMetaName('twitter:image', 'https://coreid.ng/og-pin-preview.png');

    // Standard meta
    updateMetaName('description', description);
  };

  const handleShare = async (platform: 'linkedin' | 'twitter' | 'facebook' | 'whatsapp' | 'copy') => {
    const url = `${window.location.origin}/pin/${pinNumber}`;
    const text = `Check out ${pinData?.name}'s verified professional PIN on CoreID!`;
    
    // Track share event
    try {
      await api.trackPINShare(pinNumber);
    } catch (err) {
      console.log('Failed to track share:', err);
    }

    switch (platform) {
      case 'linkedin':
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
          '_blank',
          'width=600,height=400'
        );
        toast.success('Opening LinkedIn share dialog');
        break;

      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
          '_blank',
          'width=600,height=400'
        );
        toast.success('Opening Twitter share dialog');
        break;

      case 'facebook':
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
          '_blank',
          'width=600,height=400'
        );
        toast.success('Opening Facebook share dialog');
        break;

      case 'whatsapp':
        window.open(
          `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
          '_blank'
        );
        toast.success('Opening WhatsApp');
        break;

      case 'copy':
        navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard');
        break;
    }
  };

  const generateQRCode = () => {
    const url = `${window.location.origin}/pin/${pinNumber}`;
    // Using a QR code API service
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Loading professional PIN...</p>
        </div>
      </div>
    );
  }

  if (error || !pinData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
        <Card className="max-w-md w-full p-8 text-center">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">PIN Not Found</h1>
          <p className="text-muted-foreground mb-6">
            {error || 'This PIN does not exist or has not been verified yet.'}
          </p>
          <Button onClick={() => onNavigate?.('landing')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with back button */}
        <div className="mb-6">
          <Button
            onClick={() => onNavigate?.('landing')}
            variant="ghost"
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-3xl font-bold mb-2">Professional Identity Number</h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Verified by CoreID
                {pinData.verificationDate && (
                  <span className="text-sm">• Verified on {pinData.verificationDate}</span>
                )}
              </p>
            </div>
            <Badge variant={pinData.verificationStatus === 'verified' ? 'default' : 'secondary'} className="h-8">
              <CheckCircle className="h-3 w-3 mr-1" />
              {pinData.verificationStatus === 'verified' ? 'Verified' : 'Pending'}
            </Badge>
          </motion.div>
        </div>

        {/* PIN Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <PINIdentityCard data={pinData} variant="full" interactive={false} showActions={false} />
        </motion.div>

        {/* Share Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Share this Profile
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              <Button
                onClick={() => handleShare('linkedin')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </Button>
              
              <Button
                onClick={() => handleShare('twitter')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Twitter className="h-4 w-4" />
                Twitter
              </Button>
              
              <Button
                onClick={() => handleShare('facebook')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Facebook className="h-4 w-4" />
                Facebook
              </Button>
              
              <Button
                onClick={() => handleShare('whatsapp')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </Button>
              
              <Button
                onClick={() => handleShare('copy')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy Link
              </Button>
              
              <Button
                onClick={() => setShowQR(!showQR)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <QrCode className="h-4 w-4" />
                QR Code
              </Button>
            </div>

            {/* QR Code Display */}
            {showQR && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t pt-6"
              >
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Scan this QR code to view this PIN
                  </p>
                  <img
                    src={generateQRCode()}
                    alt="QR Code"
                    className="mx-auto rounded-lg shadow-md"
                  />
                  <Button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = generateQRCode();
                      link.download = `PIN-${pinNumber}-QR.png`;
                      link.click();
                      toast.success('QR code downloaded');
                    }}
                    variant="outline"
                    className="mt-4"
                  >
                    Download QR Code
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Stats */}
            <div className="border-t pt-6 mt-6">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">{pinData.totalViews || 0}</p>
                  <p className="text-sm text-muted-foreground">Profile Views</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{pinData.trustScore}/100</p>
                  <p className="text-sm text-muted-foreground">Trust Score</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <Card className="p-8 text-center bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <h3 className="text-2xl font-bold mb-2">Get Your Own Professional PIN</h3>
            <p className="text-muted-foreground mb-6">
              Join thousands of verified professionals on CoreID and build your credible identity
            </p>
            <Button onClick={() => onNavigate?.('landing')} size="lg" className="gap-2">
              Create Your PIN
              <ExternalLink className="h-4 w-4" />
            </Button>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
