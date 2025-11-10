import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import {
  Upload,
  Link2,
  FileText,
  Sparkles,
  CheckCircle,
  Loader2,
  X,
  Target,
  Award,
  MapPin,
  DollarSign,
  Briefcase,
  Code,
  Eye,
  Heart,
  MessageSquare,
  ArrowRight,
  Shield,
  TrendingUp,
  Users
} from 'lucide-react';
import { mockTalentProfiles } from './mockSwipeData';

interface JDParserAndMatcherProps {
  onViewProfile: (profileId: string) => void;
}

export function JDParserAndMatcher({ onViewProfile }: JDParserAndMatcherProps) {
  const [inputMethod, setInputMethod] = useState<'paste' | 'link' | 'upload'>('paste');
  const [jdText, setJdText] = useState('');
  const [jdLink, setJdLink] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [parsedRequirements, setParsedRequirements] = useState<any>(null);
  const [matchedCandidates, setMatchedCandidates] = useState<any[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setJdText(text);
        processJD(text);
      };
      reader.readAsText(file);
    }
  };

  const processJD = async (text: string) => {
    setIsProcessing(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock parsed requirements
    const requirements = {
      role: 'Senior Full Stack Developer',
      experience: '5+ years',
      location: 'Remote',
      salary: '$80,000 - $120,000',
      skills: [
        { name: 'React', level: 'Expert', required: true },
        { name: 'Node.js', level: 'Advanced', required: true },
        { name: 'TypeScript', level: 'Advanced', required: true },
        { name: 'AWS', level: 'Intermediate', required: false },
        { name: 'MongoDB', level: 'Intermediate', required: false },
        { name: 'GraphQL', level: 'Intermediate', required: false }
      ],
      responsibilities: [
        'Lead development of web applications',
        'Mentor junior developers',
        'Participate in code reviews',
        'Contribute to architecture decisions'
      ],
      benefits: [
        'Remote work',
        'Health insurance',
        'Professional development budget',
        '401k matching'
      ]
    };
    
    setParsedRequirements(requirements);
    
    // Mock matching candidates based on requirements
    const matches = mockTalentProfiles.slice(0, 5).map((profile, index) => ({
      ...profile,
      matchScore: 95 - (index * 5),
      matchingSkills: requirements.skills.slice(0, 4 - index).map(s => s.name),
      missingSkills: requirements.skills.slice(4 - index, 5).map(s => s.name)
    }));
    
    setMatchedCandidates(matches);
    setShowResults(true);
    setIsProcessing(false);
  };

  const handleProcessJD = () => {
    if (inputMethod === 'paste' && jdText) {
      processJD(jdText);
    } else if (inputMethod === 'link' && jdLink) {
      // Simulate fetching from link
      processJD(`Job description from: ${jdLink}`);
    }
  };

  const resetForm = () => {
    setJdText('');
    setJdLink('');
    setShowResults(false);
    setParsedRequirements(null);
    setMatchedCandidates([]);
  };

  if (showResults && parsedRequirements) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl mb-2">Qualified Candidates</h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Found {matchedCandidates.length} candidates matching your requirements
            </p>
          </div>
          <Button variant="outline" onClick={resetForm}>
            <X className="h-4 w-4 mr-2" />
            New Search
          </Button>
        </div>

        {/* Parsed Requirements Summary */}
        <Card className="bg-gradient-to-br from-primary/5 to-white border-2 border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-2 flex-wrap">
              <CheckCircle className="h-5 w-5 text-success" />
              <CardTitle className="text-lg sm:text-xl">Job Requirements Analyzed</CardTitle>
            </div>
            <CardDescription>AI-extracted requirements from your job description</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-3 sm:p-4 bg-white rounded-lg border border-border">
                <div className="text-xs text-muted-foreground mb-1">Role</div>
                <div className="text-sm sm:text-base">{parsedRequirements.role}</div>
              </div>
              <div className="p-3 sm:p-4 bg-white rounded-lg border border-border">
                <div className="text-xs text-muted-foreground mb-1">Experience</div>
                <div className="text-sm sm:text-base">{parsedRequirements.experience}</div>
              </div>
              <div className="p-3 sm:p-4 bg-white rounded-lg border border-border">
                <div className="text-xs text-muted-foreground mb-1">Location</div>
                <div className="text-sm sm:text-base">{parsedRequirements.location}</div>
              </div>
              <div className="p-3 sm:p-4 bg-white rounded-lg border border-border">
                <div className="text-xs text-muted-foreground mb-1">Salary Range</div>
                <div className="text-sm sm:text-base">{parsedRequirements.salary}</div>
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Required Skills</Label>
              <div className="flex flex-wrap gap-2">
                {parsedRequirements.skills.map((skill: any) => (
                  <Badge 
                    key={skill.name} 
                    variant={skill.required ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {skill.name}
                    {skill.required && <span className="ml-1">*</span>}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Matched Candidates */}
        <div className="space-y-4">
          {matchedCandidates.map((candidate, index) => (
            <motion.div
              key={candidate.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow bg-white border-2 border-border hover:border-primary/30">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                    {/* Profile Info */}
                    <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                      <Avatar className="h-12 w-12 sm:h-16 sm:w-16 border-2 border-background shadow-lg flex-shrink-0">
                        <AvatarImage src={candidate.avatar} />
                        <AvatarFallback>{candidate.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-lg sm:text-xl truncate">{candidate.name}</h3>
                              {candidate.verified && (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs flex-shrink-0">
                                  <Shield className="h-3 w-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm sm:text-base text-muted-foreground">{candidate.role}</p>
                          </div>

                          {/* Match Score */}
                          <div className="text-center px-3 py-2 bg-primary/10 rounded-lg border border-primary/20 flex-shrink-0">
                            <div className="text-xl sm:text-2xl text-primary">{candidate.matchScore}%</div>
                            <div className="text-xs text-muted-foreground">Match</div>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-3 flex-wrap">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span className="truncate">{candidate.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span className="truncate">{candidate.experience}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span className="truncate">${candidate.rate}/month</span>
                          </div>
                        </div>

                        {/* Skills Match */}
                        <div className="space-y-2">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="h-4 w-4 text-success" />
                              <span className="text-xs sm:text-sm font-medium">Matching Skills</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                              {candidate.matchingSkills.map((skill: string) => (
                                <Badge key={skill} variant="secondary" className="bg-green-50 text-green-700 border-green-200 text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {candidate.missingSkills.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="h-4 w-4 text-amber-600" />
                                <span className="text-xs sm:text-sm font-medium text-muted-foreground">Can Learn</span>
                              </div>
                              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                {candidate.missingSkills.map((skill: string) => (
                                  <Badge key={skill} variant="outline" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex lg:flex-col gap-2 justify-end lg:justify-start flex-wrap lg:flex-nowrap">
                      <Button 
                        onClick={() => onViewProfile(candidate.id)}
                        className="flex-1 lg:flex-initial lg:w-full"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">View Profile</span>
                        <span className="sm:hidden">View</span>
                      </Button>
                      <Button 
                        variant="outline"
                        className="flex-1 lg:flex-initial lg:w-full"
                      >
                        <Heart className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Save</span>
                        <span className="sm:hidden">Save</span>
                      </Button>
                      <Button 
                        variant="outline"
                        className="flex-1 lg:flex-initial lg:w-full"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Message</span>
                        <span className="sm:hidden">Chat</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {matchedCandidates.length === 0 && (
          <Card className="p-8 sm:p-12 text-center bg-white">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl mb-2">No Matches Found</h3>
              <p className="text-sm text-muted-foreground mb-6">
                We couldn't find candidates matching all requirements. Try adjusting your criteria.
              </p>
              <Button onClick={resetForm}>
                Try Different Requirements
              </Button>
            </div>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl mb-2">Post a Job & Find Candidates</h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Upload, paste, or link your job description. Our AI will analyze it and find qualified candidates.
        </p>
      </div>

      <Card className="bg-white border-2 border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Sparkles className="h-5 w-5 text-primary" />
            AI-Powered Job Description Analysis
          </CardTitle>
          <CardDescription>Choose how you'd like to submit your job description</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Input Method Tabs */}
          <Tabs value={inputMethod} onValueChange={(v) => setInputMethod(v as any)}>
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="paste" className="flex items-center gap-2 text-xs sm:text-sm px-2 sm:px-4">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Paste JD</span>
                <span className="sm:hidden">Paste</span>
              </TabsTrigger>
              <TabsTrigger value="link" className="flex items-center gap-2 text-xs sm:text-sm px-2 sm:px-4">
                <Link2 className="h-4 w-4" />
                <span className="hidden sm:inline">Add Link</span>
                <span className="sm:hidden">Link</span>
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex items-center gap-2 text-xs sm:text-sm px-2 sm:px-4">
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Upload File</span>
                <span className="sm:hidden">Upload</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="paste" className="space-y-4 mt-6">
              <div>
                <Label htmlFor="jd-text" className="text-sm mb-2 block">Paste Your Job Description</Label>
                <Textarea
                  id="jd-text"
                  placeholder="Paste your complete job description here...&#10;&#10;Example:&#10;Position: Senior Full Stack Developer&#10;Experience: 5+ years&#10;Skills: React, Node.js, TypeScript, AWS&#10;Location: Remote&#10;&#10;We are looking for an experienced developer to join our team..."
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  className="min-h-[200px] sm:min-h-[300px] font-mono text-xs sm:text-sm"
                />
              </div>
              <Button 
                onClick={handleProcessJD} 
                disabled={!jdText || isProcessing}
                className="w-full sm:w-auto"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Analyze & Find Candidates
                  </>
                )}
              </Button>
            </TabsContent>

            <TabsContent value="link" className="space-y-4 mt-6">
              <div>
                <Label htmlFor="jd-link" className="text-sm mb-2 block">Job Description URL</Label>
                <Input
                  id="jd-link"
                  type="url"
                  placeholder="https://example.com/job-description"
                  value={jdLink}
                  onChange={(e) => setJdLink(e.target.value)}
                  className="text-sm"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Paste a link to your job posting from LinkedIn, Indeed, or your company website
                </p>
              </div>
              <Button 
                onClick={handleProcessJD} 
                disabled={!jdLink || isProcessing}
                className="w-full sm:w-auto"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Fetching & Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Analyze & Find Candidates
                  </>
                )}
              </Button>
            </TabsContent>

            <TabsContent value="upload" className="space-y-4 mt-6">
              <div>
                <Label htmlFor="jd-file" className="text-sm mb-2 block">Upload Document</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 sm:p-12 text-center hover:border-primary/50 transition-colors">
                  <Upload className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm mb-2">Drag and drop your file here, or click to browse</p>
                  <p className="text-xs text-muted-foreground mb-4">Supports PDF, DOC, DOCX, TXT (Max 5MB)</p>
                  <Input
                    id="jd-file"
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button variant="outline" onClick={() => document.getElementById('jd-file')?.click()}>
                    Choose File
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Features Info */}
          <Separator />
          
          <div className="grid sm:grid-cols-3 gap-3 sm:gap-4 pt-2">
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Target className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="text-sm mb-1">Smart Matching</div>
                <div className="text-xs text-muted-foreground">AI matches skills & experience</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="h-4 w-4 text-success" />
              </div>
              <div>
                <div className="text-sm mb-1">Verified Only</div>
                <div className="text-xs text-muted-foreground">All candidates are verified</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <div className="text-sm mb-1">Instant Results</div>
                <div className="text-xs text-muted-foreground">Get matches in seconds</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
