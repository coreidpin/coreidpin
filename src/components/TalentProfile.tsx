import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { QuickVerificationStatus } from './VerificationBadge';
import { 
  Star, 
  MapPin, 
  Clock, 
  DollarSign, 
  Award, 
  Briefcase, 
  Calendar,
  MessageCircle,
  Heart,
  Eye,
  Download,
  ExternalLink,
  Github,
  Linkedin,
  Globe,
  CheckCircle,
  TrendingUp,
  Users,
  Code,
  Palette,
  Database,
  Smartphone,
  Settings
} from 'lucide-react';

interface TalentProfileProps {
  profile: {
    id: string;
    name: string;
    role: string;
    location: string;
    experience: string;
    skills: string[];
    hourlyRate: number;
    availability: string;
    avatar?: string;
    bio: string;
    verificationStatus: 'verified' | 'pending' | 'required';
    rating: number;
    completedProjects: number;
    successRate: number;
    responseTime: string;
    portfolio?: string;
    github?: string;
    linkedin?: string;
    certifications: Array<{
      name: string;
      issuer: string;
      date: string;
      verified: boolean;
    }>;
    workHistory: Array<{
      company: string;
      role: string;
      duration: string;
      description: string;
    }>;
    education: Array<{
      school: string;
      degree: string;
      year: string;
      verified: boolean;
    }>;
  };
  onConnect?: () => void;
  onBookmark?: () => void;
  onMessage?: () => void;
}

export function TalentProfile({ profile, onConnect, onBookmark, onMessage }: TalentProfileProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    onBookmark?.();
  };

  const getSkillIcon = (skill: string) => {
    const skillLower = skill.toLowerCase();
    if (skillLower.includes('react') || skillLower.includes('vue') || skillLower.includes('angular')) {
      return Code;
    }
    if (skillLower.includes('design') || skillLower.includes('ui') || skillLower.includes('ux')) {
      return Palette;
    }
    if (skillLower.includes('database') || skillLower.includes('sql') || skillLower.includes('mongo')) {
      return Database;
    }
    if (skillLower.includes('mobile') || skillLower.includes('ios') || skillLower.includes('android')) {
      return Smartphone;
    }
    return Settings;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Card */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full -translate-y-16 translate-x-16"></div>
        
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <Avatar className="h-24 w-24 md:h-32 md:w-32">
                <AvatarImage src={profile.avatar} alt={profile.name} />
                <AvatarFallback className="text-lg">
                  {profile.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold">{profile.name}</h1>
                    <QuickVerificationStatus status={profile.verificationStatus} size="md" />
                  </div>
                  <p className="text-lg text-muted-foreground mb-2">{profile.role}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {profile.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      {profile.experience}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-current text-yellow-500" />
                      {profile.rating.toFixed(1)}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button onClick={onMessage} variant="outline">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                  <Button 
                    onClick={handleBookmark} 
                    variant="outline"
                    className={isBookmarked ? "text-red-600 border-red-200" : ""}
                  >
                    <Heart className={`h-4 w-4 mr-2 ${isBookmarked ? 'fill-current' : ''}`} />
                    {isBookmarked ? 'Saved' : 'Save'}
                  </Button>
                  <Button onClick={onConnect} className="bg-primary">
                    <Users className="h-4 w-4 mr-2" />
                    Connect
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <div className="text-lg font-semibold text-primary">${profile.hourlyRate}</div>
                  <div className="text-xs text-muted-foreground">per hour</div>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <div className="text-lg font-semibold text-primary">{profile.completedProjects}</div>
                  <div className="text-xs text-muted-foreground">projects</div>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <div className="text-lg font-semibold text-primary">{profile.successRate}%</div>
                  <div className="text-xs text-muted-foreground">success rate</div>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <div className="text-lg font-semibold text-primary">{profile.responseTime}</div>
                  <div className="text-xs text-muted-foreground">response</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Information Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="credentials">Credentials</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{profile.bio}</p>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Availability</h4>
                  <Badge variant="secondary" className="text-green-700 bg-green-100">
                    <Clock className="h-3 w-3 mr-1" />
                    {profile.availability}
                  </Badge>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Core Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, index) => {
                      const IconComponent = getSkillIcon(skill);
                      return (
                        <Badge key={index} variant="outline" className="gap-1">
                          <IconComponent className="h-3 w-3" />
                          {skill}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Links</h4>
                  <div className="flex gap-2">
                    {profile.portfolio && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={profile.portfolio} target="_blank" rel="noopener noreferrer">
                          <Globe className="h-4 w-4 mr-2" />
                          Portfolio
                        </a>
                      </Button>
                    )}
                    {profile.github && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={profile.github} target="_blank" rel="noopener noreferrer">
                          <Github className="h-4 w-4 mr-2" />
                          GitHub
                        </a>
                      </Button>
                    )}
                    {profile.linkedin && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
                          <Linkedin className="h-4 w-4 mr-2" />
                          LinkedIn
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="experience" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Work Experience</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profile.workHistory.map((work, index) => (
                  <div key={index} className="border-l-2 border-primary/20 pl-4 pb-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{work.role}</h4>
                        <p className="text-sm text-muted-foreground">{work.company}</p>
                      </div>
                      <Badge variant="outline">{work.duration}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{work.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Education</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {profile.education.map((edu, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <GraduationCap className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{edu.degree}</h4>
                        <p className="text-sm text-muted-foreground">{edu.school} • {edu.year}</p>
                      </div>
                    </div>
                    {edu.verified && (
                      <Badge variant="secondary" className="text-green-700 bg-green-100">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="credentials" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Professional Certifications</CardTitle>
              <CardDescription>
                Blockchain-verified credentials and certifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {profile.certifications.map((cert, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Award className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{cert.name}</h4>
                        <p className="text-sm text-muted-foreground">{cert.issuer} • {cert.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {cert.verified && (
                        <Badge variant="secondary" className="text-green-700 bg-green-100">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="portfolio" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio & Projects</CardTitle>
              <CardDescription>
                Recent work and project highlights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Portfolio integration coming soon</p>
                <p className="text-sm">Connect external portfolio or upload project samples</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}