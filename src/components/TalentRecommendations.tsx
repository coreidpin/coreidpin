import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { QuickVerificationStatus } from './VerificationBadge';
import { 
  Brain, 
  Sparkles, 
  Target, 
  Star, 
  MapPin, 
  DollarSign, 
  Clock, 
  Briefcase,
  Award,
  TrendingUp,
  Users,
  Eye,
  Heart,
  MessageCircle,
  RefreshCw,
  Lightbulb,
  Zap,
  CheckCircle,
  ArrowRight,
  ThumbsUp,
  ThumbsDown,
  X
} from 'lucide-react';

interface TalentRecommendationsProps {
  onTalentSelect?: (talentId: string) => void;
  onSaveTalent?: (talentId: string) => void;
  onMessageTalent?: (talentId: string) => void;
  jobRequirements?: {
    skills: string[];
    experience: string;
    budget: [number, number];
    location?: string;
    projectType?: string;
  };
}

interface RecommendedTalent {
  id: string;
  name: string;
  role: string;
  location: string;
  skills: string[];
  hourlyRate: number;
  experience: string;
  verificationStatus: 'verified' | 'pending' | 'required';
  rating: number;
  completedProjects: number;
  responseTime: string;
  availability: string;
  matchScore: number;
  matchReasons: string[];
  aiInsights: {
    strengthMatch: string;
    potentialConcerns?: string;
    recommendation: string;
  };
  avatar?: string;
}

const mockRecommendations: RecommendedTalent[] = [
  {
    id: '1',
    name: 'Adebayo Olatunji',
    role: 'Senior Frontend Developer',
    location: 'Lagos, Nigeria',
    skills: ['React', 'TypeScript', 'Node.js', 'AWS', 'GraphQL'],
    hourlyRate: 45,
    experience: '5+ years',
    verificationStatus: 'verified',
    rating: 4.9,
    completedProjects: 28,
    responseTime: '2 hours',
    availability: 'Available',
    matchScore: 95,
    matchReasons: [
      'Expert in React and TypeScript (exact match)',
      'Strong track record with 28+ completed projects',
      'Available immediately',
      'Excellent client ratings (4.9/5)'
    ],
    aiInsights: {
      strengthMatch: 'Perfect technical fit with proven expertise in your required tech stack',
      recommendation: 'Highly recommended - top performer with immediate availability'
    }
  },
  {
    id: '2',
    name: 'Kemi Adebola',
    role: 'Full Stack Developer',
    location: 'Abuja, Nigeria',
    skills: ['Python', 'Django', 'React', 'PostgreSQL', 'Docker'],
    hourlyRate: 40,
    experience: '4+ years',
    verificationStatus: 'verified',
    rating: 4.8,
    completedProjects: 22,
    responseTime: '1 hour',
    availability: 'Available',
    matchScore: 88,
    matchReasons: [
      'Strong full-stack capabilities',
      'Competitive hourly rate within budget',
      'Fast response time (1 hour average)',
      'Recent project success in similar domain'
    ],
    aiInsights: {
      strengthMatch: 'Excellent value proposition with strong technical breadth',
      potentialConcerns: 'Slightly less React experience than Adebayo',
      recommendation: 'Great choice for full-stack projects requiring backend expertise'
    }
  },
  {
    id: '3',
    name: 'Chinedu Okoro',
    role: 'DevOps Engineer',
    location: 'Port Harcourt, Nigeria',
    skills: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'CI/CD'],
    hourlyRate: 50,
    experience: '6+ years',
    verificationStatus: 'verified',
    rating: 4.9,
    completedProjects: 15,
    responseTime: '4 hours',
    availability: 'Partially Available',
    matchScore: 82,
    matchReasons: [
      'Senior-level expertise in cloud infrastructure',
      'Perfect for scaling and deployment needs',
      'Strong AWS certification background',
      'Proven track record with enterprise clients'
    ],
    aiInsights: {
      strengthMatch: 'Exceptional DevOps expertise for infrastructure scaling',
      potentialConcerns: 'Limited availability, higher rate',
      recommendation: 'Ideal for complex infrastructure projects requiring senior expertise'
    }
  }
];

export function TalentRecommendations({ 
  onTalentSelect, 
  onSaveTalent, 
  onMessageTalent,
  jobRequirements 
}: TalentRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<RecommendedTalent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savedTalents, setSavedTalents] = useState<Set<string>>(new Set());
  const [feedback, setFeedback] = useState<Record<string, 'up' | 'down'>>({});
  const [dismissedTalents, setDismissedTalents] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Simulate AI recommendation generation
    const generateRecommendations = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      setRecommendations(mockRecommendations);
      setIsLoading(false);
    };

    generateRecommendations();
  }, [jobRequirements]);

  const handleSaveTalent = (talentId: string) => {
    const newSaved = new Set(savedTalents);
    if (savedTalents.has(talentId)) {
      newSaved.delete(talentId);
    } else {
      newSaved.add(talentId);
    }
    setSavedTalents(newSaved);
    onSaveTalent?.(talentId);
  };

  const handleFeedback = (talentId: string, type: 'up' | 'down') => {
    setFeedback(prev => ({ ...prev, [talentId]: type }));
  };

  const handleDismiss = (talentId: string) => {
    setDismissedTalents(prev => new Set([...prev, talentId]));
  };

  const refreshRecommendations = async () => {
    setIsLoading(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRecommendations([...mockRecommendations].sort(() => Math.random() - 0.5));
    setIsLoading(false);
  };

  const visibleRecommendations = recommendations.filter(talent => !dismissedTalents.has(talent.id));

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Talent Recommendations
          </CardTitle>
          <CardDescription>
            Our AI is analyzing your requirements to find the perfect matches
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="text-center py-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
              />
              <div className="space-y-2">
                <p className="font-medium">Analyzing talent pool...</p>
                <p className="text-sm text-muted-foreground">Finding candidates that match your specific needs</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {['Scanning skill requirements', 'Evaluating experience levels', 'Checking availability', 'Calculating match scores'].map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.5 }}
                  className="flex items-center gap-3"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: idx * 0.5 + 0.2 }}
                    className="w-2 h-2 bg-primary rounded-full"
                  />
                  <span className="text-sm text-muted-foreground">{step}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>AI Talent Recommendations</CardTitle>
                <CardDescription>
                  Personalized matches based on your project requirements
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="h-3 w-3" />
                AI-Powered
              </Badge>
              <Button variant="outline" size="sm" onClick={refreshRecommendations}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {jobRequirements && (
          <CardContent>
            <div className="bg-muted/30 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Matching Criteria
              </h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Skills: </span>
                  {jobRequirements.skills.join(', ')}
                </div>
                <div>
                  <span className="text-muted-foreground">Experience: </span>
                  {jobRequirements.experience}
                </div>
                <div>
                  <span className="text-muted-foreground">Budget: </span>
                  ${jobRequirements.budget[0]}-{jobRequirements.budget[1]}/hr
                </div>
                {jobRequirements.location && (
                  <div>
                    <span className="text-muted-foreground">Location: </span>
                    {jobRequirements.location}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Recommendations */}
      <div className="space-y-6">
        <AnimatePresence>
          {visibleRecommendations.map((talent, index) => (
            <motion.div
              key={talent.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <Badge variant="secondary" className="gap-1 bg-green-100 text-green-800">
                    <TrendingUp className="h-3 w-3" />
                    {talent.matchScore}% match
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDismiss(talent.id)}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="flex gap-4">
                      <Avatar className="h-16 w-16 flex-shrink-0">
                        <AvatarImage src={talent.avatar} alt={talent.name} />
                        <AvatarFallback>
                          {talent.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg">{talent.name}</h3>
                              <QuickVerificationStatus status={talent.verificationStatus} />
                            </div>
                            <p className="text-muted-foreground">{talent.role}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {talent.location}
                              </div>
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-current text-yellow-500" />
                                {talent.rating}
                              </div>
                              <div className="flex items-center gap-1">
                                <Briefcase className="h-4 w-4" />
                                {talent.completedProjects} projects
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-2xl font-bold text-primary">${talent.hourlyRate}/hr</div>
                            <div className="text-sm text-muted-foreground">{talent.availability}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* AI Insights */}
                    <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                          <Lightbulb className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-semibold text-blue-900 dark:text-blue-100">AI Analysis</h4>
                          <p className="text-sm text-blue-800 dark:text-blue-200">{talent.aiInsights.strengthMatch}</p>
                          {talent.aiInsights.potentialConcerns && (
                            <p className="text-sm text-orange-700 dark:text-orange-300">
                              <strong>Note:</strong> {talent.aiInsights.potentialConcerns}
                            </p>
                          )}
                          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                            💡 {talent.aiInsights.recommendation}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Match Reasons */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Why this match?
                      </h4>
                      <div className="grid md:grid-cols-2 gap-2">
                        {talent.matchReasons.map((reason, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm">
                            <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                            <span className="text-muted-foreground">{reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Skills */}
                    <div>
                      <h4 className="font-semibold mb-2">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {talent.skills.map((skill, idx) => (
                          <Badge key={idx} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleFeedback(talent.id, 'up')}
                          className={feedback[talent.id] === 'up' ? 'text-green-600 bg-green-50' : ''}
                        >
                          <ThumbsUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleFeedback(talent.id, 'down')}
                          className={feedback[talent.id] === 'down' ? 'text-red-600 bg-red-50' : ''}
                        >
                          <ThumbsDown className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-muted-foreground ml-2">
                          Responds in {talent.responseTime}
                        </span>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleSaveTalent(talent.id)}
                          className={savedTalents.has(talent.id) ? "text-red-600 border-red-200" : ""}
                        >
                          <Heart className={`h-4 w-4 ${savedTalents.has(talent.id) ? 'fill-current' : ''}`} />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onMessageTalent?.(talent.id)}
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Message
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onTalentSelect?.(talent.id)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Profile
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => onTalentSelect?.(talent.id)}
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Connect
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {visibleRecommendations.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No more recommendations</h3>
              <p className="text-muted-foreground mb-4">
                We've shown you all the best matches for your criteria
              </p>
              <Button variant="outline" onClick={refreshRecommendations}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Recommendations
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}