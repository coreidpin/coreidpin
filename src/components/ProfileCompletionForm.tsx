import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Alert, AlertDescription } from './ui/alert';
import { api } from '../utils/api';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Link as LinkIcon,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Loader2,
  Github,
  Linkedin,
  Globe
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ProfileCompletionFormProps {
  onAnalysisComplete: (analysis: any) => void;
  onProfileSaved: (profile: any) => void;
}

export function ProfileCompletionForm({ 
  onAnalysisComplete,
  onProfileSaved 
}: ProfileCompletionFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    gender: '',
    bio: '',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
    resumeUrl: '',
    skills: [] as string[],
    hourlyRate: '',
    availability: 'Available',
    yearsOfExperience: 0
  });

  const [newSkill, setNewSkill] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  // Calculate completion percentage
  useEffect(() => {
    const allFields = Object.keys(formData);
    const filledFields = allFields.filter(key => {
      const value = formData[key as keyof typeof formData];
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'number') return value > 0;
      return value !== '';
    });
    
    const percentage = Math.round((filledFields.length / allFields.length) * 100);
    setCompletionPercentage(percentage);

    // Check required fields - now only profile links are required
    const hasAtLeastOneLink = formData.linkedinUrl || formData.githubUrl || formData.portfolioUrl || formData.resumeUrl;
    const missing = hasAtLeastOneLink ? [] : ['at least one profile link'];
    setMissingFields(missing);
  }, [formData]);

  const updateField = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      updateField('skills', [...formData.skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    updateField('skills', formData.skills.filter(s => s !== skill));
  };

  const handleAnalyzeProfile = async () => {
    // Provide default name and title if not filled
    const analysisName = formData.name || 'Professional';
    const analysisTitle = formData.title || 'Professional';
    
    // Check if at least one profile link is provided
    if (!formData.linkedinUrl && !formData.githubUrl && !formData.portfolioUrl && !formData.resumeUrl) {
      toast.error('Please provide at least one profile link (LinkedIn, GitHub, Portfolio, or Resume)');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        toast.error('Please login to continue');
        setIsAnalyzing(false);
        return;
      }

      console.log('Starting profile analysis...', {
        hasLinkedIn: !!formData.linkedinUrl,
        hasGitHub: !!formData.githubUrl,
        hasPortfolio: !!formData.portfolioUrl,
        name: analysisName,
        title: analysisTitle
      });

      const result = await api.analyzeProfile({
        linkedinUrl: formData.linkedinUrl,
        githubUrl: formData.githubUrl,
        portfolioUrl: formData.portfolioUrl,
        name: analysisName,
        title: analysisTitle
      }, accessToken);

      console.log('Analysis result:', result);

      if (result.success && result.analysis) {
        // Validate analysis has required fields
        const validatedAnalysis = {
          yearsOfExperience: result.analysis.yearsOfExperience || 3,
          experienceLevel: result.analysis.experienceLevel || 'mid',
          nigerianResponse: result.analysis.nigerianResponse || 'Professional verified',
          analysis: result.analysis.analysis || 'Experienced professional',
          topSkills: result.analysis.topSkills || ['Technology', 'Problem Solving']
        };
        
        onAnalysisComplete(validatedAnalysis);
        
        // Update years of experience from AI analysis
        updateField('yearsOfExperience', validatedAnalysis.yearsOfExperience);
        
        if (result.note) {
          toast.success(result.note, { duration: 5000 });
        } else {
          toast.success('Profile analyzed successfully! Check your AI badge.');
        }
      } else {
        toast.error('Analysis completed but no data returned. Please try again.');
      }
    } catch (error: any) {
      console.error('Analysis error details:', error);
      const errorMessage = error.message || 'Failed to analyze profile';
      
      // Provide more helpful error messages
      if (errorMessage.includes('Unauthorized') || errorMessage.includes('401')) {
        toast.error('Session expired. Please login again.');
      } else if (errorMessage.includes('not configured') || errorMessage.includes('503')) {
        toast.error('AI service is temporarily unavailable. Using default analysis.');
        
        // Provide a basic fallback analysis
        const fallbackAnalysis = {
          yearsOfExperience: 3,
          experienceLevel: 'mid' as const,
          nigerianResponse: 'Verified professional, you dey try well',
          analysis: 'Professional with demonstrated expertise in technology.',
          topSkills: ['Technology', 'Communication', 'Problem Solving']
        };
        
        onAnalysisComplete(fallbackAnalysis);
        updateField('yearsOfExperience', 3);
      } else if (errorMessage.includes('service error') || errorMessage.includes('500')) {
        toast.error('Analysis service temporarily unavailable. Please try again in a few moments.');
      } else {
        toast.error(`Analysis error: ${errorMessage}`);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveProfile = async () => {
    if (missingFields.length > 0) {
      toast.error(`Please complete required fields: ${missingFields.join(', ')}`);
      return;
    }

    setIsSaving(true);
    
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        toast.error('Please login to continue');
        setIsSaving(false);
        return;
      }

      console.log('Saving profile...', { 
        name: formData.name, 
        title: formData.title,
        completionPercentage 
      });

      const result = await api.saveCompleteProfile({
        ...formData,
        hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : null
      }, accessToken);

      console.log('Save result:', result);

      if (result.success) {
        onProfileSaved(result.profile);
        toast.success(`Profile saved successfully! ${result.completionPercentage}% complete`);
        
        if (result.missingFields && result.missingFields.length > 0) {
          setTimeout(() => {
            toast.info(`Optional fields remaining: ${result.missingFields.join(', ')}`);
          }, 2000);
        }
      } else {
        toast.error('Failed to save profile. Please try again.');
      }
    } catch (error: any) {
      console.error('Save error:', error);
      const errorMessage = error.message || 'Failed to save profile';
      
      if (errorMessage.includes('Unauthorized')) {
        toast.error('Session expired. Please login again.');
      } else if (errorMessage.includes('Missing required fields')) {
        toast.error(errorMessage);
      } else {
        toast.error(`Save error: ${errorMessage}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Profile Completion</CardTitle>
              <CardDescription>
                Add your profile links to unlock AI analysis and verification
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">{completionPercentage}%</div>
              <p className="text-xs text-muted-foreground">Complete</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={completionPercentage} className="h-2" />
          
          {missingFields.length > 0 && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Required fields missing: <strong>{missingFields.join(', ')}</strong>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Profile Links - Key for AI Analysis */}
      <Card className="border-primary/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Profile Links for AI Analysis
          </CardTitle>
          <CardDescription>
            Add your LinkedIn, GitHub, or Portfolio for AI-powered experience analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="linkedin" className="flex items-center gap-2">
                <Linkedin className="h-4 w-4 text-blue-600" />
                LinkedIn Profile URL
              </Label>
              <Input
                id="linkedin"
                value={formData.linkedinUrl}
                onChange={(e) => updateField('linkedinUrl', e.target.value)}
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>

            <div>
              <Label htmlFor="github" className="flex items-center gap-2">
                <Github className="h-4 w-4" />
                GitHub Profile URL
              </Label>
              <Input
                id="github"
                value={formData.githubUrl}
                onChange={(e) => updateField('githubUrl', e.target.value)}
                placeholder="https://github.com/yourusername"
              />
            </div>

            <div>
              <Label htmlFor="portfolio" className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                Portfolio Website
              </Label>
              <Input
                id="portfolio"
                value={formData.portfolioUrl}
                onChange={(e) => updateField('portfolioUrl', e.target.value)}
                placeholder="https://yourportfolio.com"
              />
            </div>

            <div>
              <Label htmlFor="resume" className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-primary" />
                Resume/CV URL
              </Label>
              <Input
                id="resume"
                value={formData.resumeUrl}
                onChange={(e) => updateField('resumeUrl', e.target.value)}
                placeholder="https://drive.google.com/your-resume"
              />
            </div>
          </div>

          <Button 
            onClick={handleAnalyzeProfile}
            disabled={isAnalyzing || (!formData.linkedinUrl && !formData.githubUrl && !formData.portfolioUrl && !formData.resumeUrl)}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing with AI...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Analyze My Profile with AI
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle>Skills & Expertise</CardTitle>
          <CardDescription>
            Add your technical skills and areas of expertise
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="e.g., Product Strategy, Agile, Data Analysis"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            />
            <Button onClick={addSkill} variant="outline">
              Add
            </Button>
          </div>

          {formData.skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill, idx) => (
                <Badge 
                  key={idx} 
                  variant="secondary"
                  className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  onClick={() => removeSkill(skill)}
                >
                  {skill} ×
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <Card>
        <CardContent className="pt-6">
          <Button 
            onClick={handleSaveProfile}
            disabled={isSaving || missingFields.length > 0}
            className="w-full h-12"
            size="lg"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Saving Profile...
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5 mr-2" />
                Save Complete Profile
              </>
            )}
          </Button>
          
          {missingFields.length === 0 && completionPercentage < 100 && (
            <p className="text-xs text-center text-muted-foreground mt-2">
              Optional fields remaining. You can save now or complete them later.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
