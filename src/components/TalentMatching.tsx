import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { VerificationBadge, VerificationStatus, QuickVerificationStatus } from './VerificationBadge';
import { 
  Search, 
  Upload, 
  Sparkles, 
  Target, 
  MessageCircle, 
  Calendar, 
  Bookmark,
  Star,
  MapPin,
  Clock,
  DollarSign,
  Filter,
  X,
  CheckCircle,
  Award,
  Briefcase,
  GraduationCap,
  TrendingUp,
  Heart,
  Eye,
  FileText
} from 'lucide-react';

interface TalentProfile {
  id: string;
  name: string;
  role: string;
  location: string;
  experience: string;
  skills: string[];
  hourlyRate: number;
  availability: string;
  matchScore: number;
  verificationStatus: VerificationStatus;
  profileImage: string;
  bio: string;
  languages: string[];
  timezone: string;
  previousClients: number;
  rating: number;
  completedProjects: number;
  responseTime: string;
  lastActive: string;
  topSkills: Array<{ skill: string; level: number }>;
  education: Array<{ degree: string; institution: string; year: string }>;
  certifications: Array<{ name: string; issuer: string; verified: boolean }>;
  portfolio: Array<{ title: string; description: string; image: string }>;
}

interface JobCriteria {
  skills: string[];
  experienceLevel: string;
  location: string;
  budget: number[];
  workType: string;
  availability: string;
  language: string[];
}

export function TalentMatching() {
  const [jobDescription, setJobDescription] = useState('');
  const [criteria, setCriteria] = useState<JobCriteria>({
    skills: [],
    experienceLevel: '',
    location: '',
    budget: [25, 100],
    workType: '',
    availability: '',
    language: []
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedTalent, setSelectedTalent] = useState<TalentProfile | null>(null);
  const [filteredTalents, setFilteredTalents] = useState<TalentProfile[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [shortlistedTalents, setShortlistedTalents] = useState<Set<string>>(new Set());

  // Mock talent data
  const mockTalents: TalentProfile[] = [
    {
      id: '1',
      name: 'Adebayo Olatunji',
      role: 'Senior Frontend Developer',
      location: 'Lagos, Nigeria',
      experience: '5+ years',
      skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'GraphQL', 'AWS'],
      hourlyRate: 45,
      availability: 'Full-time',
      matchScore: 96,
      verificationStatus: 'verified',
      profileImage: 'adebayo',
      bio: 'Passionate frontend developer with expertise in React ecosystem. I specialize in building scalable web applications and have worked with international teams for 5+ years.',
      languages: ['English', 'Yoruba'],
      timezone: 'WAT (UTC+1)',
      previousClients: 12,
      rating: 4.9,
      completedProjects: 45,
      responseTime: '< 1 hour',
      lastActive: '2 hours ago',
      topSkills: [
        { skill: 'React', level: 95 },
        { skill: 'TypeScript', level: 90 },
        { skill: 'Next.js', level: 85 }
      ],
      education: [
        { degree: 'B.Sc Computer Science', institution: 'University of Lagos', year: '2018' }
      ],
      certifications: [
        { name: 'AWS Cloud Practitioner', issuer: 'Amazon Web Services', verified: true },
        { name: 'React Professional', issuer: 'Meta', verified: true }
      ],
      portfolio: [
        { title: 'E-commerce Platform', description: 'Full-stack e-commerce solution built with React and Node.js', image: 'ecommerce' },
        { title: 'SaaS Dashboard', description: 'Analytics dashboard for B2B SaaS platform', image: 'dashboard' }
      ]
    },
    {
      id: '2',
      name: 'Ngozi Okwu',
      role: 'Senior UX/UI Designer',
      location: 'Abuja, Nigeria',
      experience: '4+ years',
      skills: ['Figma', 'Adobe XD', 'Sketch', 'Prototyping', 'User Research', 'Design Systems'],
      hourlyRate: 38,
      availability: 'Part-time',
      matchScore: 92,
      verificationStatus: 'verified',
      profileImage: 'ngozi',
      bio: 'Creative UX/UI designer focused on user-centered design. I help startups and enterprises create intuitive digital experiences.',
      languages: ['English', 'Igbo'],
      timezone: 'WAT (UTC+1)',
      previousClients: 18,
      rating: 4.8,
      completedProjects: 62,
      responseTime: '< 2 hours',
      lastActive: '1 hour ago',
      topSkills: [
        { skill: 'Figma', level: 98 },
        { skill: 'User Research', level: 85 },
        { skill: 'Prototyping', level: 90 }
      ],
      education: [
        { degree: 'B.A Fine Arts', institution: 'University of Nigeria, Nsukka', year: '2019' }
      ],
      certifications: [
        { name: 'Google UX Design Certificate', issuer: 'Google', verified: true },
        { name: 'Adobe Certified Expert', issuer: 'Adobe', verified: true }
      ],
      portfolio: [
        { title: 'Fintech Mobile App', description: 'Complete UX/UI design for a Nigerian fintech startup', image: 'fintech' },
        { title: 'E-learning Platform', description: 'Educational platform design with focus on accessibility', image: 'elearning' }
      ]
    },
    {
      id: '3',
      name: 'Kwame Asante',
      role: 'Full-Stack Developer',
      location: 'Accra, Ghana',
      experience: '6+ years',
      skills: ['Node.js', 'Python', 'React', 'PostgreSQL', 'Docker', 'AWS'],
      hourlyRate: 42,
      availability: 'Full-time',
      matchScore: 89,
      verificationStatus: 'verified',
      profileImage: 'kwame',
      bio: 'Full-stack developer with strong backend expertise. I build robust, scalable applications using modern technologies.',
      languages: ['English', 'Twi'],
      timezone: 'GMT (UTC+0)',
      previousClients: 15,
      rating: 4.7,
      completedProjects: 38,
      responseTime: '< 3 hours',
      lastActive: '4 hours ago',
      topSkills: [
        { skill: 'Node.js', level: 92 },
        { skill: 'Python', level: 88 },
        { skill: 'PostgreSQL', level: 85 }
      ],
      education: [
        { degree: 'B.Sc Software Engineering', institution: 'University of Ghana', year: '2017' }
      ],
      certifications: [
        { name: 'AWS Solutions Architect', issuer: 'Amazon Web Services', verified: true },
        { name: 'MongoDB Developer', issuer: 'MongoDB', verified: true }
      ],
      portfolio: [
        { title: 'Healthcare API', description: 'RESTful API for healthcare management system', image: 'healthcare' },
        { title: 'Real-time Chat App', description: 'Scalable chat application with WebSocket support', image: 'chat' }
      ]
    },
    {
      id: '4',
      name: 'Amara Okafor',
      role: 'DevOps Engineer',
      location: 'Port Harcourt, Nigeria',
      experience: '5+ years',
      skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins', 'Monitoring'],
      hourlyRate: 50,
      availability: 'Full-time',
      matchScore: 85,
      verificationStatus: 'verified',
      profileImage: 'amara',
      bio: 'DevOps engineer specializing in cloud infrastructure and CI/CD pipelines. I help teams deploy faster and more reliably.',
      languages: ['English', 'Igbo'],
      timezone: 'WAT (UTC+1)',
      previousClients: 10,
      rating: 4.9,
      completedProjects: 28,
      responseTime: '< 4 hours',
      lastActive: '6 hours ago',
      topSkills: [
        { skill: 'AWS', level: 95 },
        { skill: 'Kubernetes', level: 88 },
        { skill: 'Terraform', level: 90 }
      ],
      education: [
        { degree: 'B.Eng Computer Engineering', institution: 'University of Port Harcourt', year: '2018' }
      ],
      certifications: [
        { name: 'AWS DevOps Engineer', issuer: 'Amazon Web Services', verified: true },
        { name: 'Certified Kubernetes Administrator', issuer: 'CNCF', verified: true }
      ],
      portfolio: [
        { title: 'Cloud Migration', description: 'Migrated legacy systems to AWS cloud infrastructure', image: 'cloud' },
        { title: 'CI/CD Pipeline', description: 'Automated deployment pipeline reducing release time by 80%', image: 'pipeline' }
      ]
    }
  ];

  // AI Processing simulation
  const processJobDescription = async () => {
    setIsProcessing(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Extract skills from job description (simple simulation)
    const extractedSkills = ['React', 'TypeScript', 'Node.js'];
    setCriteria(prev => ({ ...prev, skills: extractedSkills }));
    
    // Filter and sort talents based on match score
    const filtered = mockTalents
      .filter(talent => talent.matchScore >= 80)
      .sort((a, b) => b.matchScore - a.matchScore);
    
    setFilteredTalents(filtered);
    setIsProcessing(false);
    setShowResults(true);
  };

  const toggleShortlist = (talentId: string) => {
    const newShortlisted = new Set(shortlistedTalents);
    if (newShortlisted.has(talentId)) {
      newShortlisted.delete(talentId);
    } else {
      newShortlisted.add(talentId);
    }
    setShortlistedTalents(newShortlisted);
  };

  const getMatchReason = (talent: TalentProfile) => {
    const reasons = [];
    if (talent.matchScore >= 95) reasons.push('Perfect skill match');
    if (talent.verificationStatus === 'verified') reasons.push('Fully verified');
    if (talent.rating >= 4.8) reasons.push('Top-rated talent');
    if (talent.responseTime.includes('< 1')) reasons.push('Lightning fast response');
    return reasons.slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-3xl md:text-4xl font-bold">AI-Powered Talent Matching</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Paste your job description and let our AI find the perfect verified talents for your project
        </p>
      </motion.div>

      {!showResults ? (
        <>
          {/* Job Description Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Step 1: Job Description
                </CardTitle>
                <CardDescription>
                  Paste your job description or upload a job posting document
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="job-description">Job Description</Label>
                  <Textarea
                    id="job-description"
                    placeholder="We are looking for a Senior Frontend Developer with expertise in React, TypeScript, and modern web technologies. The ideal candidate should have 3+ years of experience building scalable web applications..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="min-h-32 resize-none"
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={processJobDescription}
                    disabled={!jobDescription.trim() || isProcessing}
                    className="flex-1 sm:flex-none"
                  >
                    {isProcessing ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="mr-2"
                        >
                          <Sparkles className="h-4 w-4" />
                        </motion.div>
                        Processing with AI...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Find Matching Talent
                      </>
                    )}
                  </Button>
                  
                  <Button variant="outline" className="flex-1 sm:flex-none">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload JD
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Criteria Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Step 2: Refine Criteria (Optional)
                </CardTitle>
                <CardDescription>
                  Add specific requirements to improve matching accuracy
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Experience Level</Label>
                    <Select value={criteria.experienceLevel} onValueChange={(value) => setCriteria(prev => ({ ...prev, experienceLevel: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="junior">Junior (1-3 years)</SelectItem>
                        <SelectItem value="mid">Mid-level (3-5 years)</SelectItem>
                        <SelectItem value="senior">Senior (5+ years)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Location Preference</Label>
                    <Select value={criteria.location} onValueChange={(value) => setCriteria(prev => ({ ...prev, location: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nigeria">Nigeria</SelectItem>
                        <SelectItem value="ghana">Ghana</SelectItem>
                        <SelectItem value="kenya">Kenya</SelectItem>
                        <SelectItem value="any">Any Location</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Work Type</Label>
                    <Select value={criteria.workType} onValueChange={(value) => setCriteria(prev => ({ ...prev, workType: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select work type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fulltime">Full-time</SelectItem>
                        <SelectItem value="parttime">Part-time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <Label>Budget Range (USD/hour): ${criteria.budget[0]} - ${criteria.budget[1]}</Label>
                  <Slider
                    value={criteria.budget}
                    onValueChange={(value) => setCriteria(prev => ({ ...prev, budget: value }))}
                    max={150}
                    min={15}
                    step={5}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      ) : (
        <>
          {/* Results Header with Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
          >
            <div>
              <h2 className="text-2xl font-bold">Found {filteredTalents.length} Matching Talents</h2>
              <p className="text-muted-foreground">Sorted by AI match score and verification status</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="w-full sm:w-auto"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowResults(false)}
                className="w-full sm:w-auto"
              >
                <X className="h-4 w-4 mr-2" />
                New Search
              </Button>
            </div>
          </motion.div>

          {/* Talent Results */}
          <div className="space-y-4">
            <AnimatePresence>
              {filteredTalents.map((talent, index) => (
                <motion.div
                  key={talent.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.01 }}
                >
                  <Card className={`hover:shadow-lg transition-all duration-300 ${index === 0 ? 'ring-2 ring-primary/20 bg-primary/5' : ''}`}>
                    {index === 0 && (
                      <div className="bg-primary text-primary-foreground px-4 py-2 text-sm font-medium flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        Top Match
                      </div>
                    )}
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col lg:flex-row gap-4">
                        {/* Avatar and Basic Info */}
                        <div className="flex flex-col sm:flex-row gap-4 flex-1">
                          <Avatar className="h-16 w-16 mx-auto sm:mx-0">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${talent.profileImage}`} />
                            <AvatarFallback>{talent.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 text-center sm:text-left">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                              <h3 className="text-xl font-semibold">{talent.name}</h3>
                              <QuickVerificationStatus status={talent.verificationStatus} size="sm" />
                            </div>
                            
                            <p className="text-lg text-muted-foreground mb-2">{talent.role}</p>
                            
                            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-4 text-sm text-muted-foreground mb-3">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {talent.location}
                              </div>
                              <div className="flex items-center gap-1">
                                <Briefcase className="h-4 w-4" />
                                {talent.experience}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {talent.lastActive}
                              </div>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {talent.bio}
                            </p>
                            
                            <div className="flex flex-wrap gap-1 mb-3">
                              {talent.skills.slice(0, 4).map((skill, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {talent.skills.length > 4 && (
                                <Badge variant="outline" className="text-xs">
                                  +{talent.skills.length - 4} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Match Score and Actions */}
                        <div className="flex flex-col items-center gap-3 min-w-0 lg:min-w-[200px]">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-green-600 mb-1">{talent.matchScore}%</div>
                            <div className="text-sm text-muted-foreground">Match Score</div>
                            <Progress value={talent.matchScore} className="w-24 mt-2" />
                          </div>
                          
                          <div className="text-center">
                            <div className="text-2xl font-bold">${talent.hourlyRate}/hr</div>
                            <div className="text-sm text-muted-foreground">{talent.availability}</div>
                          </div>
                          
                          <div className="flex items-center gap-1 text-sm">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{talent.rating}</span>
                            <span className="text-muted-foreground">({talent.completedProjects} projects)</span>
                          </div>
                          
                          <div className="flex flex-col gap-2 w-full">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" className="w-full">
                                  <Eye className="h-4 w-4 mr-1" />
                                  View Profile
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-3">
                                    <Avatar className="h-12 w-12">
                                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${talent.profileImage}`} />
                                      <AvatarFallback>{talent.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        {talent.name}
                                        <QuickVerificationStatus status={talent.verificationStatus} size="sm" />
                                      </div>
                                      <p className="text-base font-normal text-muted-foreground">{talent.role}</p>
                                    </div>
                                  </DialogTitle>
                                  <DialogDescription>
                                    Detailed profile and portfolio
                                  </DialogDescription>
                                </DialogHeader>
                                
                                {/* Detailed Profile Content */}
                                <div className="space-y-6">
                                  {/* Stats Row */}
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="text-center p-3 bg-muted rounded-lg">
                                      <div className="text-2xl font-bold text-green-600">{talent.matchScore}%</div>
                                      <div className="text-sm text-muted-foreground">Match Score</div>
                                    </div>
                                    <div className="text-center p-3 bg-muted rounded-lg">
                                      <div className="text-2xl font-bold">{talent.rating}</div>
                                      <div className="text-sm text-muted-foreground">Rating</div>
                                    </div>
                                    <div className="text-center p-3 bg-muted rounded-lg">
                                      <div className="text-2xl font-bold">{talent.completedProjects}</div>
                                      <div className="text-sm text-muted-foreground">Projects</div>
                                    </div>
                                    <div className="text-center p-3 bg-muted rounded-lg">
                                      <div className="text-2xl font-bold">${talent.hourlyRate}</div>
                                      <div className="text-sm text-muted-foreground">Per Hour</div>
                                    </div>
                                  </div>
                                  
                                  {/* Bio */}
                                  <div>
                                    <h4 className="font-semibold mb-2">About</h4>
                                    <p className="text-muted-foreground">{talent.bio}</p>
                                  </div>
                                  
                                  {/* Skills */}
                                  <div>
                                    <h4 className="font-semibold mb-3">Top Skills</h4>
                                    <div className="space-y-2">
                                      {talent.topSkills.map((skill, idx) => (
                                        <div key={idx} className="flex items-center justify-between">
                                          <span>{skill.skill}</span>
                                          <div className="flex items-center gap-2">
                                            <Progress value={skill.level} className="w-24" />
                                            <span className="text-sm text-muted-foreground">{skill.level}%</span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  
                                  {/* Education & Certifications */}
                                  <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                                        <GraduationCap className="h-4 w-4" />
                                        Education
                                      </h4>
                                      <div className="space-y-2">
                                        {talent.education.map((edu, idx) => (
                                          <div key={idx} className="p-3 border rounded-lg">
                                            <div className="font-medium">{edu.degree}</div>
                                            <div className="text-sm text-muted-foreground">{edu.institution}</div>
                                            <div className="text-sm text-muted-foreground">{edu.year}</div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                                        <Award className="h-4 w-4" />
                                        Certifications
                                      </h4>
                                      <div className="space-y-2">
                                        {talent.certifications.map((cert, idx) => (
                                          <div key={idx} className="p-3 border rounded-lg">
                                            <div className="flex items-center gap-2">
                                              <div className="font-medium">{cert.name}</div>
                                              {cert.verified && <CheckCircle className="h-4 w-4 text-green-600" />}
                                            </div>
                                            <div className="text-sm text-muted-foreground">{cert.issuer}</div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Portfolio */}
                                  <div>
                                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                                      <FileText className="h-4 w-4" />
                                      Portfolio
                                    </h4>
                                    <div className="grid md:grid-cols-2 gap-4">
                                      {talent.portfolio.map((project, idx) => (
                                        <div key={idx} className="border rounded-lg overflow-hidden">
                                          <div className="h-32 bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                                            <FileText className="h-8 w-8 text-primary" />
                                          </div>
                                          <div className="p-3">
                                            <h5 className="font-medium mb-1">{project.title}</h5>
                                            <p className="text-sm text-muted-foreground">{project.description}</p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  
                                  {/* Action Buttons */}
                                  <div className="flex flex-col sm:flex-row gap-3">
                                    <Button className="flex-1">
                                      <MessageCircle className="h-4 w-4 mr-2" />
                                      Send Message
                                    </Button>
                                    <Button variant="outline" className="flex-1">
                                      <Calendar className="h-4 w-4 mr-2" />
                                      Schedule Interview
                                    </Button>
                                    <Button 
                                      variant="outline"
                                      onClick={() => toggleShortlist(talent.id)}
                                      className={shortlistedTalents.has(talent.id) ? 'bg-primary/10' : ''}
                                    >
                                      <Heart className={`h-4 w-4 ${shortlistedTalents.has(talent.id) ? 'fill-red-500 text-red-500' : ''}`} />
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => toggleShortlist(talent.id)}
                                className={`flex-1 ${shortlistedTalents.has(talent.id) ? 'bg-primary/10' : ''}`}
                              >
                                <Heart className={`h-4 w-4 mr-1 ${shortlistedTalents.has(talent.id) ? 'fill-red-500 text-red-500' : ''}`} />
                                {shortlistedTalents.has(talent.id) ? 'Saved' : 'Save'}
                              </Button>
                              <Button size="sm" variant="outline">
                                <MessageCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Match Reasons */}
                      {getMatchReason(talent).length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                          <h4 className="font-medium mb-2 text-sm">Why this talent matches:</h4>
                          <div className="flex flex-wrap gap-2">
                            {getMatchReason(talent).map((reason, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                {reason}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
}
