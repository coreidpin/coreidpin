import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Download, Trophy, Star, Zap, Sparkles } from 'lucide-react';

interface ProfileBadgeProps {
  userName: string;
  userTitle: string;
  userImage?: string;
  analysis: {
    yearsOfExperience: number;
    experienceLevel: 'junior' | 'mid' | 'senior' | 'expert';
    nigerianResponse: string;
    topSkills?: string[];
  };
  className?: string;
}

export function ProfileBadge({ 
  userName, 
  userTitle, 
  userImage, 
  analysis,
  className = ''
}: ProfileBadgeProps) {
  const badgeRef = useRef<HTMLDivElement>(null);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'expert':
      case 'senior':
        return 'from-purple-500 to-pink-500';
      case 'mid':
        return 'from-blue-500 to-cyan-500';
      case 'junior':
        return 'from-green-500 to-emerald-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'expert':
      case 'senior':
        return Trophy;
      case 'mid':
        return Star;
      case 'junior':
        return Zap;
      default:
        return Sparkles;
    }
  };

  const handleDownload = async () => {
    if (!badgeRef.current) return;

    try {
      // Dynamically import html2canvas
      const html2canvas = (await import('html2canvas')).default;
      
      const canvas = await html2canvas(badgeRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
      });

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
  link.download = `coreid-badge-${userName.replace(/\s+/g, '-').toLowerCase()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      });
    } catch (error) {
      console.error('Failed to download badge:', error);
      alert('Download feature temporarily unavailable. Please take a screenshot instead.');
    }
  };

  const Icon = getLevelIcon(analysis.experienceLevel);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Badge Preview */}
      <Card 
        ref={badgeRef}
        className="p-6 relative overflow-hidden"
        style={{ width: '400px' }}
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${getLevelColor(analysis.experienceLevel)} opacity-10`} />
        
        <div className="relative z-10 space-y-4">
          {/* Header with Logo */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
    <span className="text-xs font-semibold text-primary">CoreID</span>
            </div>
            <Icon className={`h-6 w-6 bg-gradient-to-br ${getLevelColor(analysis.experienceLevel)} bg-clip-text text-transparent`} />
          </div>

          {/* User Info */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary/20">
              <AvatarImage src={userImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`} />
              <AvatarFallback>{userName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h3 className="font-semibold">{userName}</h3>
              <p className="text-sm text-muted-foreground">{userTitle}</p>
            </div>
          </div>

          {/* Nigerian Response */}
          <div className={`bg-gradient-to-r ${getLevelColor(analysis.experienceLevel)} p-4 rounded-lg text-white text-center`}>
            <p className="font-bold text-lg">
              {analysis.nigerianResponse}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/50 p-3 rounded-lg text-center">
              <p className="text-2xl font-bold">{analysis.yearsOfExperience}+</p>
              <p className="text-xs text-muted-foreground">Years Experience</p>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg text-center">
              <p className="text-sm font-bold capitalize">{analysis.experienceLevel}</p>
              <p className="text-xs text-muted-foreground">Level</p>
            </div>
          </div>

          {/* Top Skills */}
          {analysis.topSkills && analysis.topSkills.length > 0 && (
            <div className="flex flex-wrap gap-1 justify-center">
              {analysis.topSkills.slice(0, 3).map((skill, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="text-center pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              AI-Verified Professional
            </p>
          </div>
        </div>
      </Card>

      {/* Download Button */}
      <Button 
        onClick={handleDownload}
        variant="outline"
        className="w-full"
      >
        <Download className="h-4 w-4 mr-2" />
        Download Badge
      </Button>
    </div>
  );
}
