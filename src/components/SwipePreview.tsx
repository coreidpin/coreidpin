import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { 
  MapPin, 
  Briefcase, 
  Heart, 
  X, 
  Star,
  CheckCircle
} from 'lucide-react';

// Mock profiles for preview
const mockProfiles = [
  {
    id: '1',
    name: 'Chinedu Okafor',
    title: 'Senior Full Stack Developer',
    location: 'Lagos, Nigeria',
    yearsOfExperience: 6,
    topSkills: ['React', 'Node.js', 'TypeScript', 'AWS'],
    matchScore: 95,
    nigerianResponse: 'Chief developer, you dey senior well well',
    verified: true,
    avatar: 'CO'
  },
  {
    id: '2',
    name: 'Aisha Mohammed',
    title: 'Product Designer',
    location: 'Abuja, Nigeria',
    yearsOfExperience: 4,
    topSkills: ['Figma', 'UI/UX', 'User Research', 'Prototyping'],
    matchScore: 88,
    nigerianResponse: 'Design queen, you too good',
    verified: true,
    avatar: 'AM'
  },
  {
    id: '3',
    name: 'Emeka Nwankwo',
    title: 'Data Scientist',
    location: 'Port Harcourt, Nigeria',
    yearsOfExperience: 5,
    topSkills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL'],
    matchScore: 92,
    nigerianResponse: 'Data wizard, you sabi the thing',
    verified: true,
    avatar: 'EN'
  }
];

export function SwipePreview() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);

  const currentProfile = mockProfiles[currentIndex];

  useEffect(() => {
    // Auto-rotate through profiles every 4 seconds
    const interval = setInterval(() => {
      handleNext();
    }, 4000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  const handleNext = () => {
    setDirection('right');
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % mockProfiles.length);
      setDirection(null);
    }, 300);
  };

  const handlePrev = () => {
    setDirection('left');
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + mockProfiles.length) % mockProfiles.length);
      setDirection(null);
    }, 300);
  };

  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* Preview Label */}
      <div className="text-center mb-4">
        <Badge variant="outline" className="mb-2">
          <Star className="h-3 w-3 mr-1" />
          Live Preview
        </Badge>
        <p className="text-sm text-muted-foreground">
          See how employers discover talent
        </p>
      </div>

      {/* Card Container */}
      <div className="relative h-[420px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentProfile.id}
            initial={{ 
              x: direction === 'right' ? 50 : direction === 'left' ? -50 : 0,
              opacity: 0,
              scale: 0.9,
              rotateY: direction === 'right' ? 10 : direction === 'left' ? -10 : 0
            }}
            animate={{ 
              x: 0, 
              opacity: 1, 
              scale: 1,
              rotateY: 0
            }}
            exit={{ 
              x: direction === 'right' ? -50 : direction === 'left' ? 50 : 0,
              opacity: 0,
              scale: 0.9,
              rotateY: direction === 'right' ? -10 : direction === 'left' ? 10 : 0
            }}
            transition={{ 
              type: 'spring',
              stiffness: 300,
              damping: 30
            }}
            className="absolute inset-0"
          >
            <Card className="overflow-hidden border-2 hover:shadow-2xl transition-shadow h-full">
              {/* Header with Avatar and Match Score */}
              <CardContent className="p-0">
                <div className="relative bg-gradient-to-br from-primary/20 via-card to-card p-6 border-b">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16 border-4 border-primary/30">
                      <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                        {currentProfile.avatar}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold">{currentProfile.name}</h3>
                        <Badge variant="secondary" className="text-sm px-2 py-1">
                          <Star className="h-3 w-3 mr-1 fill-primary text-primary" />
                          {currentProfile.matchScore}%
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {currentProfile.title}
                      </p>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {currentProfile.location}
                      </div>
                    </div>
                  </div>

                  {/* Verification Badge */}
                  {currentProfile.verified && (
                    <Badge className="absolute top-4 right-4 bg-success text-success-foreground">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  {/* Nigerian Response */}
                  <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
                    <p className="text-sm font-medium text-primary">
                      💬 {currentProfile.nigerianResponse}
                    </p>
                  </div>

                  {/* Experience */}
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Experience</p>
                      <p className="font-semibold">{currentProfile.yearsOfExperience} years</p>
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Top Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {currentProfile.topSkills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4">
                    <motion.button
                      onClick={handlePrev}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="flex-1 h-12 border-2 border-muted-foreground/20 rounded-lg flex items-center justify-center gap-2 hover:border-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <X className="h-5 w-5" />
                      <span className="text-sm font-medium">Pass</span>
                    </motion.button>
                    
                    <motion.button
                      onClick={handleNext}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="flex-1 h-12 bg-primary text-primary-foreground rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
                    >
                      <Heart className="h-5 w-5" />
                      <span className="text-sm font-medium">Interested</span>
                    </motion.button>
                  </div>

                  {/* Swipe Instruction */}
                  <p className="text-xs text-center text-muted-foreground pt-2">
                    Swipe to discover verified talent
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Dots */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
          {mockProfiles.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > currentIndex ? 'right' : 'left');
                setTimeout(() => {
                  setCurrentIndex(index);
                  setDirection(null);
                }, 300);
              }}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex 
                  ? 'w-6 bg-primary' 
                  : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
              aria-label={`View profile ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
