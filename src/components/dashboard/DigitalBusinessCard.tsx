
import React, { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { Download, Copy, Share2, Check, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';

interface DigitalBusinessCardProps {
  userProfile: any; // Typed as any for now to avoid conflicts, but should ideally be UserProfile
  pin: string | null;
}

export function DigitalBusinessCard({ userProfile, pin }: DigitalBusinessCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);

  const profileId = userProfile?.username || userProfile?.user_id || userProfile?.id || '';
  const profileUrl = profileId ? `${window.location.origin}/profile/${profileId}` : window.location.origin;

  const displayName = userProfile?.full_name || userProfile?.name || 'Professional User';
  const displayRole = userProfile?.job_title || userProfile?.role || 'Professional Member';
  
  // Helper to get initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    
    try {
      setDownloading(true);
      const canvas = await html2canvas(cardRef.current, {
        scale: 2, // Better resolution
        backgroundColor: null,
        useCORS: true, // Important for external images like avatars
        foreignObjectRendering: false,
        // Force dimensions to ensure everything is captured
        width: cardRef.current.offsetWidth,
        height: cardRef.current.offsetHeight
      });
      
      const link = document.createElement('a');
      link.download = `${displayName.replace(/\s+/g, '-').toLowerCase()}-card.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link); // Append to body for Firefox compatibility
      link.click();
      document.body.removeChild(link);
      
      toast.success('Card downloaded successfully!');
    } catch (err: any) {
      console.error('Failed to generate card image details:', err);
      // Show the actual error message to the user for debugging
      toast.error(`Download failed: ${err?.message || 'Unknown error'}`);
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyLink = () => {
    if (!profileId) {
       toast.error('Profile ID is missing, cannot copy link.');
       return;
    }
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    toast.success('Profile link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center space-y-6 w-full max-w-full overflow-hidden">
      {/* The Downloadable Card Area */}
      <div className="relative group perspective-1000 w-full max-w-sm flex justify-center mx-auto px-4">
        <div 
          ref={cardRef}
          className="w-full text-white p-5 rounded-2xl shadow-xl overflow-hidden border border-slate-700/50 relative mx-auto"
          style={{ 
            minWidth: '250px', 
            maxWidth: '280px', // Smaller mobile width as requested
            background: 'linear-gradient(to bottom right, #0f172a, #1e293b)' 
          }}
        >
          {/* Decorative Elements - preserved */}
          <div 
            className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" 
            style={{ background: 'rgba(59, 130, 246, 0.1)' }} 
          />
          <div 
            className="absolute bottom-0 left-0 w-32 h-32 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none" 
            style={{ background: 'rgba(168, 85, 247, 0.1)' }} 
          />
          
          <div className="flex flex-col items-center text-center space-y-4 relative z-10">
            {/* Header */}
            <div className="flex items-center space-x-2 opacity-70 mb-2">
              <Share2 className="w-4 h-4" />
              <span className="text-xs font-medium tracking-wider uppercase">Professional ID</span>
            </div>

            {/* Avatar & Info */}
            <div className="p-1 rounded-full backdrop-blur-sm" style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
               {(!imgError && userProfile?.avatar_url) ? (
                 <img 
                  src={userProfile.avatar_url} 
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover border-2"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
                  crossOrigin="anonymous" 
                  onError={(e) => {
                    console.error('Image failed to load:', userProfile.avatar_url);
                    setImgError(true);
                  }}
                />
               ) : (
                 <div 
                   className="w-20 h-20 rounded-full border-2 flex items-center justify-center shadow-inner"
                   style={{ 
                     background: 'linear-gradient(to bottom right, #60a5fa, #6366f1)', // blue-400 to indigo-500
                     borderColor: 'rgba(255, 255, 255, 0.2)'
                   }}
                 >
                   <span className="text-2xl font-bold text-white tracking-wider">
                     {getInitials(displayName)}
                   </span>
                 </div>
               )}
            </div>
            
            <div>
              <h3 
                className="text-xl font-bold"
                style={{ color: '#ffffff' }}
              >
                {displayName}
              </h3>
              <p className="text-sm mt-1" style={{ color: '#cbd5e1' }}>
                {displayRole}
              </p>
            </div>

            {/* PIN Badge */}
            {pin && (
              <Badge 
                variant="secondary" 
                className="text-white hover:bg-white/20 px-4 py-1.5 mt-2 transition-colors"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  letterSpacing: '0.05em',
                  color: '#ffffff',
                  fontFamily: 'monospace, ui-monospace, SFMono-Regular'
                }}
              >
                <span style={{ opacity: 0.7, marginRight: '8px', fontSize: '0.9em' }}>PIN:</span>
                <span style={{ fontWeight: 600, fontSize: '1.1em' }}>{pin}</span>
              </Badge>
            )}

            {/* QR Code */}
            <div 
              className="p-3 rounded-xl shadow-lg mt-4"
              style={{ background: '#ffffff' }}
            >
              <QRCodeSVG 
                value={profileUrl} 
                size={120}
                level="M"
                includeMargin={false}
              />
            </div>
            
            <p className="text-[10px] mt-4 uppercase tracking-widest font-medium" style={{ color: '#64748b' }}>
              Scan to view profile
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons - Stack on mobile, row on larger screens */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-[280px] sm:max-w-sm">
        <Button 
          variant="outline" 
          className="flex-1 gap-2 h-10"
          onClick={handleCopyLink}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied' : 'Copy Link'}
        </Button>
        
        <Button 
          className="flex-1 gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all"
          onClick={handleDownload}
          disabled={downloading}
        >
          {downloading ? (
            <span className="animate-spin mr-2">⏳</span>
          ) : (
            <Download className="w-4 h-4" />
          )}
          {downloading ? 'Saving...' : 'Save Image'}
        </Button>
      </div>
      
      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
         <ExternalLink className="w-3 h-3" />
         <span className="truncate max-w-[200px]">{profileUrl}</span>
      </div>
    </div>
  );
}
