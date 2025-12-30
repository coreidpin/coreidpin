/**
 * Social Share & QR Code Component
 * Share portfolio to social media and generate QR code
 */

import React, { useState } from 'react';
import { Share2, Linkedin, Twitter, Facebook, Link as LinkIcon, QrCode, Download, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import QRCodeLib from 'qrcode';

interface SocialShareProps {
  portfolioUrl: string;
  userName: string;
  userTitle: string;
  className?: string;
}

export const SocialShare: React.FC<SocialShareProps> = ({
  portfolioUrl,
  userName,
  userTitle,
  className,
}) => {
  const [copied, setCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [showQR, setShowQR] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(portfolioUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const generateQRCode = async () => {
    try {
      const url = await QRCodeLib.toDataURL(portfolioUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      setQrCodeUrl(url);
      setShowQR(true);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;
    
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `${userName.replace(/\s+/g, '_')}_Portfolio_QR.png`;
    link.click();
  };

  const shareToLinkedIn = () => {
    const text = `Check out ${userName}'s portfolio - ${userTitle}`;
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(portfolioUrl)}`;
    window.open(url, '_blank', 'width=600,height=600');
  };

  const shareToTwitter = () => {
    const text = `Check out my portfolio: ${userTitle}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(portfolioUrl)}`;
    window.open(url, '_blank', 'width=600,height=600');
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(portfolioUrl)}`;
    window.open(url, '_blank', 'width=600,height=600');
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${userName}'s Portfolio`,
          text: `Check out ${userName}'s portfolio - ${userTitle}`,
          url: portfolioUrl,
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    }
  };

  return (
    <div className={cn('bg-white border border-gray-200 rounded-lg p-6', className)}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Share2 className="h-5 w-5 text-gray-700" />
        <h3 className="text-lg font-bold text-gray-900">Share Portfolio</h3>
      </div>

      {/* Portfolio URL */}
      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          value={portfolioUrl}
          readOnly
          className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg"
        />
        <button
          onClick={handleCopyLink}
          className={cn(
            'px-4 py-2 rounded-lg border transition-colors flex items-center gap-2',
            copied
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-white border-gray-200 hover:bg-gray-50'
          )}
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              <span className="text-sm">Copied!</span>
            </>
          ) : (
            <>
              <LinkIcon className="h-4 w-4" />
              <span className="text-sm">Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Social Share Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <button
          onClick={shareToLinkedIn}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0077B5] text-white rounded-lg hover:bg-[#006399] transition-colors"
        >
          <Linkedin className="h-4 w-4" />
          <span className="text-sm font-medium">LinkedIn</span>
        </button>

        <button
          onClick={shareToTwitter}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-[#1DA1F2] text-white rounded-lg hover:bg-[#1a8cd8] transition-colors"
        >
          <Twitter className="h-4 w-4" />
          <span className="text-sm font-medium">Twitter</span>
        </button>

        <button
          onClick={shareToFacebook}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-[#1877F2] text-white rounded-lg hover:bg-[#166fe5] transition-colors"
        >
          <Facebook className="h-4 w-4" />
          <span className="text-sm font-medium">Facebook</span>
        </button>

        {navigator.share && (
          <button
            onClick={shareNative}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Share2 className="h-4 w-4" />
            <span className="text-sm font-medium">More</span>
          </button>
        )}
      </div>

      {/* QR Code Section */}
      <div className="border-t pt-4">
        {!showQR ? (
          <button
            onClick={generateQRCode}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <QrCode className="h-4 w-4" />
            <span className="text-sm font-medium">Generate QR Code</span>
          </button>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
              {qrCodeUrl && (
                <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={downloadQRCode}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span className="text-sm font-medium">Download QR Code</span>
              </button>
              <button
                onClick={() => setShowQR(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Hide
              </button>
            </div>
            <p className="text-xs text-gray-500 text-center">
              Perfect for business cards, resumes, and presentations
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
