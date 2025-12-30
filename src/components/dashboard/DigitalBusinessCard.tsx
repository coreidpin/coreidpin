
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
          className="w-full text-white p-6 rounded-3xl shadow-2xl overflow-hidden border border-slate-700/50 relative mx-auto transform transition-transform hover:scale-[1.02] duration-300"
          style={{ 
            minWidth: '280px', 
            maxWidth: '320px',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}
        >
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />
          
          {/* Card Border Highlight/Sheen */}
          <div className="absolute inset-0 rounded-3xl ring-1 ring-white/10 pointer-events-none" />
          
          <div className="flex flex-col items-center text-center space-y-5 relative z-10">
            {/* Header / Brand */}
            <div className="w-full flex justify-between items-center opacity-80 mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-blue-200">GidiPIN ID</span>
              </div>
              {userProfile?.created_at && (
                <span className="text-[10px] font-medium text-slate-400 font-mono">
                  SINCE {new Date(userProfile.created_at).getFullYear()}
                </span>
              )}
            </div>

            {/* Avatar with Glow */}
            <div className="relative group-hover:scale-105 transition-transform duration-500">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-500"></div>
                <div className="relative p-1 bg-slate-900 rounded-full">
                 {(!imgError && userProfile?.avatar_url) ? (
                   <img 
                    src={userProfile.avatar_url} 
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-slate-800"
                    crossOrigin="anonymous" 
                    onError={() => setImgError(true)}
                  />
                 ) : (
                   <div className="w-24 h-24 rounded-full border-4 border-slate-800 flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900 text-white shadow-inner">
                     <span className="text-3xl font-bold tracking-widest text-slate-200" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                       {getInitials(displayName)}
                     </span>
                   </div>
                 )}
               </div>
               
               {/* Verified Badge Overlay */}
               {userProfile?.email_verified && (
                 <div className="absolute bottom-0 right-0 bg-blue-500 text-white p-1.5 rounded-full border-4 border-slate-900 shadow-lg" title="Verified Professional">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                     <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                   </svg>
                 </div>
               )}
            </div>
            
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-white tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-300">
                {displayName}
              </h3>
              <p className="text-sm font-medium text-blue-200 tracking-wide uppercase text-[11px]">
                {displayRole}
              </p>
            </div>

            {/* Premium Divider */}
            <div className="w-16 h-0.5 mx-auto bg-gradient-to-r from-transparent via-slate-500 to-transparent opacity-50"></div>

            {/* PIN Display */}
            {pin && (
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl px-4 py-2 flex items-center gap-3 shadow-inner">
                <span className="text-[10px] uppercase tracking-widest text-slate-400">PIN</span>
                <span className="font-mono text-lg font-bold text-white tracking-wider tabular-nums" style={{ textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>
                  {pin}
                </span>
                <Copy className="w-3 h-3 text-slate-500 cursor-pointer hover:text-white transition-colors" />
              </div>
            )}

            {/* QR Code Section */}
            <div className="pt-2">
              <div className="bg-white p-2.5 rounded-xl inline-block shadow-lg">
                <QRCodeSVG 
                  value={profileUrl} 
                  size={100}
                  level="M"
                  includeMargin={false}
                />
              </div>
              <p className="text-[9px] mt-3 uppercase tracking-[0.2em] text-slate-500 font-bold">
                Scan to Verify Identity
              </p>
            </div>
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
