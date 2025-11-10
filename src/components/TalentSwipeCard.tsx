import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'motion/react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { 
  MapPin, 
  Briefcase, 
  DollarSign, 
  Star, 
  Github, 
  Linkedin, 
  Globe,
  Shield,
  CheckCircle,
  X,
  Heart,
  Info
} from 'lucide-react';

interface TalentProfile {
  id: string;
  name: string;
  title: string;
  location: string;
  avatar?: string;
  bio: string;
  yearsOfExperience: number;
  experienceLevel: string;
  topSkills: string[];
  hourlyRate?: number;
  availability: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  verified: boolean;
  nigerianResponse?: string;
  matchScore?: number;
}

interface TalentSwipeCardProps {
  profile: TalentProfile;
  onSwipeLeft: (profileId: string) => void;
  onSwipeRight: (profileId: string) => void;
  onViewProfile: (profileId: string) => void;
}

export function TalentSwipeCard({ 
  profile, 
  onSwipeLeft, 
  onSwipeRight, 
  onViewProfile 
}: TalentSwipeCardProps) {
  const [exitX, setExitX] = useState(0);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 100;
    
    if (Math.abs(info.offset.x) > threshold) {
      setExitX(info.offset.x > 0 ? 300 : -300);
      
      if (info.offset.x > 0) {
        onSwipeRight(profile.id);
      } else {
        onSwipeLeft(profile.id);
      }
    }
  };

  const handleReject = () => {
    setExitX(-300);
    onSwipeLeft(profile.id);
  };

  const handleLike = () => {
    setExitX(300);
    onSwipeRight(profile.id);
  };

  return (
    <motion.div
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={exitX !== 0 ? { x: exitX } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="absolute w-full max-w-md"
    >
      <Card className="overflow-hidden border-2 hover:shadow-2xl transition-shadow">
        {/* Header with Avatar and Match Score */}
        <CardHeader className="relative bg-gradient-to-br from-primary/10 via-card to-card p-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20 border-4 border-primary/20">
              <AvatarImage src={profile.avatar} alt={profile.name} />
              <AvatarFallback className="text-2xl">{profile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-bold">{profile.name}</h3>
                {profile.matchScore && (
                  <Badge variant="secondary" className="text-lg px-3 py-1">
                    <Star className="h-4 w-4 mr-1 fill-primary text-primary" />
                    {profile.matchScore}%
                  </Badge>
                )}
              </div>
              
              <p className="text-muted-foreground mb-2">{profile.title}</p>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {profile.location}
              </div>
            </div>
          </div>

          {/* Verification Badge */}
          {profile.verified && (
            <Badge className="absolute top-4 right-4 bg-success text-success-foreground">
              <Shield className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          )}
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          {/* Nigerian Response */}
          {profile.nigerianResponse && (
            <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
              <p className="text-sm font-medium text-primary">
                💬 {profile.nigerianResponse}
              </p>
            </div>
          )}

          {/* Bio */}
          <div>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {profile.bio}
            </p>
          </div>

          {/* Experience & Rate */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Experience</p>
                <p className="font-semibold">{profile.yearsOfExperience} years</p>
              </div>
            </div>
            
            {profile.hourlyRate && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Rate</p>
                  <p className="font-semibold">${profile.hourlyRate}/hr</p>
                </div>
              </div>
            )}
          </div>

          {/* Skills */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Top Skills</p>
            <div className="flex flex-wrap gap-2">
              {profile.topSkills.slice(0, 5).map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-3 pt-2 border-t">
            {profile.linkedinUrl && (
              <a 
                href={profile.linkedinUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            )}
            {profile.githubUrl && (
              <a 
                href={profile.githubUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
            )}
            {profile.portfolioUrl && (
              <a 
                href={profile.portfolioUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Globe className="h-5 w-5" />
              </a>
            )}
            
            <div className="flex-1" />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewProfile(profile.id)}
              className="text-xs"
            >
              <Info className="h-4 w-4 mr-1" />
              Full Profile
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              variant="outline"
              size="lg"
              onClick={handleReject}
              className="flex-1 border-2 hover:bg-destructive/10 hover:border-destructive"
            >
              <X className="h-5 w-5 mr-2" />
              Pass
            </Button>
            
            <Button
              size="lg"
              onClick={handleLike}
              className="flex-1"
            >
              <Heart className="h-5 w-5 mr-2" />
              Interested
            </Button>
          </div>

          {/* Swipe Instructions */}
          <p className="text-xs text-center text-muted-foreground pt-2">
            Swipe left to pass • Swipe right to show interest
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
