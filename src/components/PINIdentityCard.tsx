import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { 
  BadgeCheck, 
  Shield, 
  Award, 
  Briefcase, 
  Code, 
  Globe, 
  Copy,
  Share2,
  Download,
  ExternalLink,
  CheckCircle,
  Star,
  Fingerprint
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Experience {
  title: string;
  company: string;
  duration: string;
  verified: boolean;
}

interface Skill {
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  verified: boolean;
}

interface PINData {
  pinNumber: string;
  name: string;
  title: string;
  location: string;
  avatar?: string;
  verificationStatus: 'verified' | 'pending' | 'unverified';
  verificationDate?: string;
  experiences: Experience[];
  skills: Skill[];
  endorsements: number;
  projectsCompleted: number;
  linkedAccounts: {
    linkedin?: boolean;
    github?: boolean;
    portfolio?: boolean;
  };
  trustScore: number; // 0-100
}

interface PINIdentityCardProps {
  data: PINData;
  variant?: 'full' | 'compact' | 'preview';
  interactive?: boolean;
  showActions?: boolean;
}

export function PINIdentityCard({ 
  data, 
  variant = 'full', 
  interactive = true,
  showActions = true 
}: PINIdentityCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyPIN = () => {
    navigator.clipboard.writeText(data.pinNumber);
    setIsCopied(true);
    toast.success('PIN number copied to clipboard');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/pin/${data.pinNumber}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Public PIN link copied to clipboard');
  };

  const getSkillColor = (level: string) => {
    switch (level) {
      case 'Expert': return 'bg-purple-500';
      case 'Advanced': return 'bg-blue-500';
      case 'Intermediate': return 'bg-emerald-500';
      default: return 'bg-gray-500';
    }
  };

  if (variant === 'compact') {
    return (
      <motion.div
        whileHover={interactive ? { scale: 1.02 } : {}}
        className="w-full"
      >
        <Card className="p-4 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white border-blue-500/20">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-blue-400">
              <AvatarImage src={data.avatar} />
              <AvatarFallback>{data.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold">{data.name}</h3>
                {data.verificationStatus === 'verified' && (
                  <BadgeCheck className="h-4 w-4 text-blue-400" />
                )}
              </div>
              <p className="text-sm text-blue-200">{data.title}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs border-blue-400 text-blue-300">
                  PIN: {data.pinNumber}
                </Badge>
                <Badge variant="outline" className="text-xs border-emerald-400 text-emerald-300">
                  Trust Score: {data.trustScore}%
                </Badge>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  if (variant === 'preview') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mx-auto perspective-1000"
      >
        <Card className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white border-2 border-blue-500/30 shadow-2xl">
          {/* Holographic effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-400/10 to-transparent opacity-50"></div>
          
          <div className="relative p-6 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Fingerprint className="h-6 w-6 text-blue-400" />
                <span className="text-sm font-semibold text-blue-300">swipe PIN</span>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400">
                Verified
              </Badge>
            </div>

            {/* Profile */}
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border-2 border-blue-400 shadow-lg">
                <AvatarImage src={data.avatar} />
                <AvatarFallback className="bg-blue-800 text-white text-xl">
                  {data.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1">{data.name}</h3>
                <p className="text-blue-200 text-sm mb-2">{data.title}</p>
                <div className="flex items-center gap-1 text-xs text-blue-300">
                  <Globe className="h-3 w-3" />
                  <span>{data.location}</span>
                </div>
              </div>
            </div>

            {/* PIN Number */}
            <div className="bg-black/30 rounded-lg p-3 border border-blue-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-300 mb-1">Professional Identity Number</p>
                  <p className="text-lg font-mono font-semibold tracking-wider text-blue-100">
                    {data.pinNumber}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopyPIN}
                  className="text-blue-300 hover:text-blue-100 hover:bg-blue-500/20"
                >
                  {isCopied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-black/20 rounded-lg p-2 text-center border border-blue-500/20">
                <div className="text-xl font-bold text-blue-100">{data.trustScore}%</div>
                <div className="text-xs text-blue-300">Trust Score</div>
              </div>
              <div className="bg-black/20 rounded-lg p-2 text-center border border-blue-500/20">
                <div className="text-xl font-bold text-blue-100">{data.projectsCompleted}</div>
                <div className="text-xs text-blue-300">Projects</div>
              </div>
              <div className="bg-black/20 rounded-lg p-2 text-center border border-blue-500/20">
                <div className="text-xl font-bold text-blue-100">{data.endorsements}</div>
                <div className="text-xs text-blue-300">Endorsements</div>
              </div>
            </div>

            {/* Verification Date */}
            {data.verificationDate && (
              <div className="flex items-center justify-between text-xs text-blue-300 pt-2 border-t border-blue-500/20">
                <span>Verified: {data.verificationDate}</span>
                <div className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  <span>Blockchain Secured</span>
                </div>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    );
  }

  // Full variant
  return (
    <motion.div
      className="w-full max-w-2xl mx-auto perspective-1000"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <motion.div
        className="relative"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring' }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front of Card */}
        <Card 
          className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white border-2 border-blue-500/30 shadow-2xl"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Holographic effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-400/10 to-transparent opacity-50"></div>
          
          <div className="relative p-8 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center border border-blue-400">
                  <Fingerprint className="h-7 w-7 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-blue-100">swipe Professional ID</h3>
                  <p className="text-xs text-blue-300">Globally Recognized Identity</p>
                </div>
              </div>
              {data.verificationStatus === 'verified' && (
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400 flex items-center gap-1">
                  <BadgeCheck className="h-3 w-3" />
                  Verified
                </Badge>
              )}
            </div>

            {/* Profile Section */}
            <div className="flex items-start gap-6">
              <Avatar className="h-28 w-28 border-3 border-blue-400 shadow-xl">
                <AvatarImage src={data.avatar} />
                <AvatarFallback className="bg-blue-800 text-white text-2xl">
                  {data.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <div>
                  <h2 className="text-2xl font-bold mb-1">{data.name}</h2>
                  <p className="text-blue-200 mb-2">{data.title}</p>
                  <div className="flex items-center gap-2 text-sm text-blue-300">
                    <Globe className="h-4 w-4" />
                    <span>{data.location}</span>
                  </div>
                </div>

                {/* Connected Accounts */}
                <div className="flex items-center gap-2">
                  {data.linkedAccounts.linkedin && (
                    <Badge variant="outline" className="text-xs border-blue-400 text-blue-300">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      LinkedIn
                    </Badge>
                  )}
                  {data.linkedAccounts.github && (
                    <Badge variant="outline" className="text-xs border-blue-400 text-blue-300">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      GitHub
                    </Badge>
                  )}
                  {data.linkedAccounts.portfolio && (
                    <Badge variant="outline" className="text-xs border-blue-400 text-blue-300">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Portfolio
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* PIN Number Section */}
            <div className="bg-black/30 rounded-lg p-4 border border-blue-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-300 mb-1">Professional Identity Number (PIN)</p>
                  <p className="text-2xl font-mono font-bold tracking-wider text-blue-100">
                    {data.pinNumber}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCopyPIN}
                    className="text-blue-300 hover:text-blue-100 hover:bg-blue-500/20"
                  >
                    {isCopied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-black/20 rounded-lg p-3 text-center border border-blue-500/20">
                <div className="flex items-center justify-center mb-1">
                  <Shield className="h-5 w-5 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-blue-100">{data.trustScore}%</div>
                <div className="text-xs text-blue-300">Trust Score</div>
              </div>
              <div className="bg-black/20 rounded-lg p-3 text-center border border-blue-500/20">
                <div className="flex items-center justify-center mb-1">
                  <Briefcase className="h-5 w-5 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-blue-100">{data.experiences.length}</div>
                <div className="text-xs text-blue-300">Experiences</div>
              </div>
              <div className="bg-black/20 rounded-lg p-3 text-center border border-blue-500/20">
                <div className="flex items-center justify-center mb-1">
                  <Award className="h-5 w-5 text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-blue-100">{data.projectsCompleted}</div>
                <div className="text-xs text-blue-300">Projects</div>
              </div>
              <div className="bg-black/20 rounded-lg p-3 text-center border border-blue-500/20">
                <div className="flex items-center justify-center mb-1">
                  <Star className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="text-2xl font-bold text-blue-100">{data.endorsements}</div>
                <div className="text-xs text-blue-300">Endorsements</div>
              </div>
            </div>

            {/* Top Skills */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-blue-200">Top Verified Skills</h4>
              <div className="flex flex-wrap gap-2">
                {data.skills.slice(0, 6).map((skill, index) => (
                  <Badge
                    key={index}
                    className={`${getSkillColor(skill.level)} text-white border-0`}
                  >
                    {skill.name}
                    {skill.verified && <CheckCircle className="h-3 w-3 ml-1" />}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Verification Footer */}
            {data.verificationDate && (
              <div className="flex items-center justify-between text-xs text-blue-300 pt-4 border-t border-blue-500/20">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>Verified on {data.verificationDate}</span>
                </div>
                <div className="flex items-center gap-1">
                  <BadgeCheck className="h-4 w-4" />
                  <span>Blockchain Secured</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {showActions && (
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleShare}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share PIN
                </Button>
                <Button
                  onClick={() => setIsFlipped(!isFlipped)}
                  variant="outline"
                  className="border-blue-400 text-blue-300 hover:bg-blue-500/20"
                >
                  View Details
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Back of Card */}
        <Card 
          className="absolute inset-0 overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white border-2 border-purple-500/30 shadow-2xl"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <div className="relative p-8 space-y-6 h-full overflow-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-purple-100">Verified Experiences</h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsFlipped(false)}
                className="text-purple-300 hover:text-purple-100"
              >
                Back
              </Button>
            </div>

            {/* Experiences */}
            <div className="space-y-3">
              {data.experiences.map((exp, index) => (
                <div key={index} className="bg-black/20 rounded-lg p-4 border border-purple-500/20">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-purple-100">{exp.title}</h4>
                      <p className="text-sm text-purple-300">{exp.company}</p>
                    </div>
                    {exp.verified && (
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-purple-400">{exp.duration}</p>
                </div>
              ))}
            </div>

            {/* All Skills */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-purple-200">All Verified Skills</h4>
              <div className="grid grid-cols-2 gap-2">
                {data.skills.map((skill, index) => (
                  <div key={index} className="bg-black/20 rounded-lg p-2 border border-purple-500/20">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-purple-100">{skill.name}</span>
                      {skill.verified && <CheckCircle className="h-3 w-3 text-emerald-400" />}
                    </div>
                    <div className="text-xs text-purple-400 mt-1">{skill.level}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// Mock data generator for preview
export function generateMockPINData(overrides?: Partial<PINData>): PINData {
  return {
    pinNumber: 'PIN-NG-2025-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
    name: 'Adebayo Olatunji',
    title: 'Senior Full-Stack Developer',
    location: 'Lagos, Nigeria',
    verificationStatus: 'verified',
    verificationDate: 'November 2, 2025',
    experiences: [
      {
        title: 'Senior Software Engineer',
        company: 'TechCorp Global',
        duration: '2022 - Present',
        verified: true
      },
      {
        title: 'Full-Stack Developer',
        company: 'StartupHub Africa',
        duration: '2020 - 2022',
        verified: true
      },
      {
        title: 'Junior Developer',
        company: 'Digital Solutions Ltd',
        duration: '2018 - 2020',
        verified: true
      }
    ],
    skills: [
      { name: 'React', level: 'Expert', verified: true },
      { name: 'TypeScript', level: 'Expert', verified: true },
      { name: 'Node.js', level: 'Advanced', verified: true },
      { name: 'Python', level: 'Advanced', verified: true },
      { name: 'AWS', level: 'Intermediate', verified: true },
      { name: 'Docker', level: 'Intermediate', verified: true },
      { name: 'GraphQL', level: 'Advanced', verified: true },
      { name: 'PostgreSQL', level: 'Advanced', verified: true }
    ],
    endorsements: 47,
    projectsCompleted: 23,
    linkedAccounts: {
      linkedin: true,
      github: true,
      portfolio: true
    },
    trustScore: 96,
    ...overrides
  };
}
