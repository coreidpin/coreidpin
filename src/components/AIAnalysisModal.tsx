import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Sparkles, Trophy, Star, Zap, CheckCircle, TrendingUp } from 'lucide-react';

interface AIAnalysisModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analysis: {
    yearsOfExperience: number;
    experienceLevel: 'junior' | 'mid' | 'senior' | 'expert';
    nigerianResponse: string;
    analysis: string;
    topSkills: string[];
  } | null;
  isLoading: boolean;
}

export function AIAnalysisModal({ open, onOpenChange, analysis, isLoading }: AIAnalysisModalProps) {
  // Ensure analysis has all required fields
  const validatedAnalysis = analysis ? {
    yearsOfExperience: analysis.yearsOfExperience || 0,
    experienceLevel: analysis.experienceLevel || 'mid',
    nigerianResponse: analysis.nigerianResponse || 'Professional verified',
    analysis: analysis.analysis || 'Experienced professional',
    topSkills: analysis.topSkills || []
  } : null;

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'expert':
      case 'senior':
        return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'mid':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      case 'junior':
        return 'bg-gradient-to-r from-green-500 to-emerald-500';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600';
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Profile Analysis
          </DialogTitle>
          <DialogDescription>
            Your profile has been analyzed by our AI
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
              />
              <p className="text-sm text-muted-foreground">
                Analyzing your profile with AI...
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Fetching GitHub data and calculating experience
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                This may take a few seconds...
              </p>
            </motion.div>
          ) : validatedAnalysis ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Nigerian Response - Hero Section */}
              <div className={`${getLevelColor(validatedAnalysis.experienceLevel)} p-6 rounded-xl text-white relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                <div className="relative z-10 space-y-3">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {React.createElement(getLevelIcon(validatedAnalysis.experienceLevel), {
                      className: "h-8 w-8"
                    })}
                  </div>
                  <h3 className="text-2xl text-center font-bold">
                    {validatedAnalysis.nigerianResponse}
                  </h3>
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      {validatedAnalysis.yearsOfExperience}+ years experience
                    </Badge>
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30 capitalize">
                      {validatedAnalysis.experienceLevel}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Analysis Details */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <h4 className="font-semibold">AI Analysis</h4>
                  </div>
                  <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    {validatedAnalysis.analysis}
                  </p>
                </div>

                {/* Top Skills */}
                {validatedAnalysis.topSkills && validatedAnalysis.topSkills.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <h4 className="font-semibold">Top Skills Identified</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {validatedAnalysis.topSkills.map((skill, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.1 }}
                        >
                          <Badge variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* CTA */}
              <div className="pt-4 border-t">
                <p className="text-xs text-center text-muted-foreground mb-3">
                  This badge will appear on your profile
                </p>
                <Button 
                  onClick={() => onOpenChange(false)} 
                  className="w-full"
                >
                  Continue to Profile
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-8 text-center"
            >
              <p className="text-sm text-muted-foreground">
                No analysis available
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
