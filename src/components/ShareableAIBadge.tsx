import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import { 
  Sparkles, 
  Award, 
  Share2, 
  Copy, 
  Check, 
  Twitter, 
  Linkedin,
  Mail,
  Download,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ShareableAIBadgeProps {
  userName: string;
  experienceLevel: 'entry' | 'junior' | 'mid' | 'senior' | 'expert' | 'chief';
  skills: string[];
  verifiedDate: string;
  badgeId: string;
}

const levelColors = {
  entry: { gradient: 'from-blue-500 to-cyan-500', text: 'text-blue-600' },
  junior: { gradient: 'from-green-500 to-emerald-500', text: 'text-green-600' },
  mid: { gradient: 'from-purple-500 to-pink-500', text: 'text-purple-600' },
  senior: { gradient: 'from-orange-500 to-red-500', text: 'text-orange-600' },
  expert: { gradient: 'from-yellow-500 to-orange-500', text: 'text-yellow-600' },
  chief: { gradient: 'from-indigo-600 to-purple-600', text: 'text-indigo-600' }
};

export function ShareableAIBadge({ 
  userName, 
  experienceLevel, 
  skills, 
  verifiedDate,
  badgeId 
}: ShareableAIBadgeProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/badge/${badgeId}`;
  const colors = levelColors[experienceLevel];

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

  const handleShare = (platform: 'twitter' | 'linkedin' | 'email') => {
    const text = `Check out my AI-verified professional badge on Swipe! 🎉 I'm a ${experienceLevel}-level verified professional.`;
    
    let url = '';
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'email':
        url = `mailto:?subject=${encodeURIComponent('My Swipe AI Badge')}&body=${encodeURIComponent(text + '\n\n' + shareUrl)}`;
        break;
    }
    
    window.open(url, '_blank', 'width=600,height=400');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Badge Preview */}
      <Card className={`relative overflow-hidden border-2 bg-gradient-to-br ${colors.gradient}/10`}>
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colors.gradient} opacity-10 rounded-full -translate-y-16 translate-x-16`} />
        
        <CardContent className="p-8 relative">
          <div className="text-center space-y-6">
            {/* Badge Icon */}
            <motion.div
              className={`w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow-2xl`}
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
              <Award className="h-12 w-12 text-white" />
            </motion.div>

            {/* Badge Title */}
            <div className="space-y-2">
              <Badge className={`bg-gradient-to-r ${colors.gradient} text-white border-0 px-4 py-1`}>
                <Sparkles className="h-3 w-3 mr-1" />
                AI-Verified Professional
              </Badge>
              <h2 className="text-2xl font-bold">{userName}</h2>
              <p className={`font-semibold ${colors.text}`}>
                {experienceLevel.charAt(0).toUpperCase() + experienceLevel.slice(1)} Level Developer
              </p>
            </div>

            {/* Skills */}
            <div className="flex flex-wrap gap-2 justify-center">
              {skills.slice(0, 5).map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {skills.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{skills.length - 5} more
                </Badge>
              )}
            </div>

            {/* Verified Date */}
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Check className="h-4 w-4 text-emerald-600" />
              <span>Verified on {verifiedDate}</span>
            </div>

            {/* Swipe Branding */}
            <div className="pt-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                <div className="w-6 h-6 bg-gradient-to-br from-primary to-emerald-500 rounded-md flex items-center justify-center">
                  <span className="text-xs font-bold text-white">S</span>
                </div>
                <span className="font-semibold text-sm">
                  <span className="text-primary">s</span>wipe
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shareable Link */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Share2 className="h-5 w-5" />
            Share Your Badge
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Copy Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Badge Link</label>
            <div className="flex gap-2">
              <Input 
                value={shareUrl} 
                readOnly 
                className="flex-1 bg-muted"
              />
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleCopyLink}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Share this link to show off your AI-verified skills!
            </p>
          </div>

          <Separator />

          {/* Social Share Buttons */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Share on Social Media</label>
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                onClick={() => handleShare('twitter')}
                className="w-full"
              >
                <Twitter className="h-4 w-4 mr-2" />
                Twitter
              </Button>
              <Button
                variant="outline"
                onClick={() => handleShare('linkedin')}
                className="w-full"
              >
                <Linkedin className="h-4 w-4 mr-2" />
                LinkedIn
              </Button>
              <Button
                variant="outline"
                onClick={() => handleShare('email')}
                className="w-full"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => window.open(shareUrl, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Preview Badge
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => toast.info('Badge download coming soon!')}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>

          {/* Info */}
          <div className="p-3 bg-primary/5 rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>Pro tip:</strong> Add this badge to your LinkedIn profile, resume, or portfolio website to showcase your verified skills to potential employers!
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}