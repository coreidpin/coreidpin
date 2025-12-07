import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Sparkles, 
  Award, 
  Share2, 
  Copy, 
  Check, 
  Download,
  X
} from 'lucide-react';
import { toast } from 'sonner';

interface WelcomeAIBadgeProps {
  userName: string;
  professionalTitle: string;
  userType: 'professional' | 'employer';
  onClose: () => void;
}

export function WelcomeAIBadge({ 
  userName, 
  professionalTitle,
  userType,
  onClose
}: WelcomeAIBadgeProps) {
  const [copied, setCopied] = useState(false);
  const badgeRef = useRef<HTMLDivElement>(null);
  const shareUrl = `${window.location.origin}/profile/${userName.toLowerCase().replace(/\s+/g, '-')}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Badge link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const handleDownload = async () => {
    if (!badgeRef.current) return;
    
    try {
      // Dynamic import of html2canvas
      const html2canvas = (await import('html2canvas')).default;
      
      const canvas = await html2canvas(badgeRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });
      
      const link = document.createElement('a');
      link.download = `swipe-welcome-badge-${userName.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = canvas.toDataURL();
      link.click();
      
      toast.success('Badge downloaded successfully!');
    } catch (err) {
      toast.error('Failed to download badge. Please try screenshot instead.');
      console.error('Download error:', err);
    }
  };

  const getBadgeColor = () => {
    return userType === 'professional' 
      ? { gradient: 'from-blue-500 to-cyan-500', text: 'text-blue-600', bg: 'bg-blue-50' }
      : { gradient: 'from-purple-500 to-pink-500', text: 'text-purple-600', bg: 'bg-purple-50' };
  };

  const colors = getBadgeColor();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-surface rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-border">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl mb-1">🎉 Welcome to swipe!</h2>
              <p className="text-sm text-muted-foreground">
                Here's your welcome badge
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Badge Preview */}
        <div className="p-6">
          <div ref={badgeRef} className={`relative overflow-hidden rounded-xl border-2 ${colors.bg} p-8`}>
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colors.gradient} opacity-20 rounded-full -translate-y-16 translate-x-16`} />
            
            <div className="relative text-center space-y-4">
              {/* Badge Icon */}
              <motion.div
                className={`w-20 h-20 mx-auto rounded-xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow-xl`}
                animate={{
                  scale: [1, 1.05, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >
                <Award className="h-10 w-10 text-white" />
              </motion.div>

              {/* Badge Content */}
              <div className="space-y-2">
                <Badge className={`bg-gradient-to-r ${colors.gradient} text-white border-0 px-3 py-1`}>
                  <Sparkles className="h-3 w-3 mr-1" />
                  Welcome Member
                </Badge>
                <h3 className="text-xl">{userName}</h3>
                <p className={`${colors.text}`}>
                  {professionalTitle}
                </p>
              </div>

              {/* Verified Badge */}
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-emerald-600" />
                <span>Joined {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              </div>

              {/* Swipe Branding */}
              <div className="pt-2">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                  <div className="w-6 h-6 bg-gradient-to-br from-primary to-emerald-500 rounded-md flex items-center justify-center">
                    <span className="text-xs text-white">S</span>
                  </div>
                  <span className="text-sm">
                    <span className="text-primary">s</span>wipe
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleCopyLink}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2 text-emerald-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </>
              )}
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                const text = `I just joined swipe! 🎉 Check out my profile: ${shareUrl}`;
                const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
                window.open(twitterUrl, '_blank', 'width=600,height=400');
              }}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>

          {/* Info */}
          <div className="mt-4 p-3 bg-primary/5 rounded-lg">
            <p className="text-xs text-muted-foreground text-center">
              Share this badge on LinkedIn, Twitter, or your portfolio to celebrate joining swipe!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <Button 
            onClick={onClose}
            className="w-full"
          >
            Continue to Dashboard
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
