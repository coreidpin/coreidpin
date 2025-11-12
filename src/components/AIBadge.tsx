import React from 'react';
import { motion } from 'motion/react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Sparkles, Award, TrendingUp, Star } from 'lucide-react';

interface AIBadgeProps {
  experienceLevel: 'entry' | 'junior' | 'mid' | 'senior' | 'expert' | 'chief';
  industry?: string;
  analysisDate?: string;
  show?: boolean;
}

const nigerianMessages = {
  entry: {
    title: 'Sharp! Sharp! 🌟',
    message: 'My guy, you dey start well! Keep grinding, you go reach there.',
    icon: Star,
    gradient: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-blue-500/10 to-cyan-500/10'
  },
  junior: {
    title: 'Correct Developer! 💪',
    message: 'You don dey show workings! E remain small, you go level up.',
    icon: TrendingUp,
    gradient: 'from-green-500 to-emerald-500',
    bgGradient: 'from-green-500/10 to-emerald-500/10'
  },
  mid: {
    title: 'Okay! You Sabi Work! 🔥',
    message: 'Chai! You don carry experience wella. Na better developer you be!',
    icon: Award,
    gradient: 'from-purple-500 to-pink-500',
    bgGradient: 'from-purple-500/10 to-pink-500/10'
  },
  senior: {
    title: 'My Oga! Senior Man! 👑',
    message: 'Oga you too much! Your experience dey speak for you.',
    icon: Award,
    gradient: 'from-orange-500 to-red-500',
    bgGradient: 'from-orange-500/10 to-red-500/10'
  },
  expert: {
    title: 'Chairman of the Board! 🎯',
    message: 'Oga you be expert o! See as you sharp for this industry.',
    icon: Sparkles,
    gradient: 'from-yellow-500 to-orange-500',
    bgGradient: 'from-yellow-500/10 to-orange-500/10'
  },
  chief: {
    title: 'Oga You Be Chief! 🚀',
    message: 'My chief, you dey chief with massive experience for this tech industry. Respect!',
    icon: Sparkles,
    gradient: 'from-indigo-600 to-purple-600',
    bgGradient: 'from-indigo-600/10 to-purple-600/10'
  }
};

export function AIBadge({ 
  experienceLevel, 
  industry = 'tech', 
  analysisDate,
  show = true 
}: AIBadgeProps) {
  if (!show) return null;

  const badgeData = nigerianMessages[experienceLevel];
  const Icon = badgeData.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ 
        duration: 0.5,
        type: 'spring',
        stiffness: 200,
        damping: 20
      }}
    >
      <Card className={`relative overflow-hidden border-2 bg-gradient-to-br ${badgeData.bgGradient}`}>
        {/* Animated gradient overlay */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-r ${badgeData.gradient} opacity-5`}
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'linear'
          }}
          style={{ backgroundSize: '200% 200%' }}
        />

        <CardContent className="relative p-6">
          <div className="flex items-start gap-4">
            {/* Icon with animation */}
            <motion.div
              className={`w-14 h-14 rounded-xl bg-gradient-to-br ${badgeData.gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            >
              <Icon className="h-7 w-7 text-white" />
            </motion.div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold">{badgeData.title}</h3>
                <Badge variant="secondary" className="text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI Analyzed
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground mb-3">
                {badgeData.message}
              </p>

              {/* Experience level badge */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge 
                  variant="outline" 
                  className={`bg-gradient-to-r ${badgeData.gradient} text-white border-0`}
                >
                  {experienceLevel.charAt(0).toUpperCase() + experienceLevel.slice(1)} Level
                </Badge>
                {industry && (
                  <Badge variant="outline" className="text-xs">
                    {industry.charAt(0).toUpperCase() + industry.slice(1)} Industry
                  </Badge>
                )}
                {analysisDate && (
                  <span className="text-xs text-muted-foreground">
                    Analyzed {analysisDate}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Floating particles animation */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className={`absolute w-1 h-1 rounded-full bg-gradient-to-r ${badgeData.gradient}`}
                initial={{ 
                  x: Math.random() * 100 + '%', 
                  y: '100%',
                  opacity: 0 
                }}
                animate={{ 
                  y: '-10%',
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 3 + i,
                  repeat: Infinity,
                  delay: i * 0.8,
                  ease: 'easeOut'
                }}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Helper function to determine experience level from years
export function getExperienceLevelFromYears(years: number): 'entry' | 'junior' | 'mid' | 'senior' | 'expert' | 'chief' {
  if (years < 1) return 'entry';
  if (years < 3) return 'junior';
  if (years < 6) return 'mid';
  if (years < 10) return 'senior';
  if (years < 15) return 'expert';
  return 'chief';
}

// Helper function to get experience level from AI analysis
export function getExperienceLevelFromAnalysis(analysis: string): 'entry' | 'junior' | 'mid' | 'senior' | 'expert' | 'chief' {
  const lowerAnalysis = analysis.toLowerCase();
  
  if (lowerAnalysis.includes('chief') || lowerAnalysis.includes('15+ years')) return 'chief';
  if (lowerAnalysis.includes('expert') || lowerAnalysis.includes('10+ years')) return 'expert';
  if (lowerAnalysis.includes('senior') || lowerAnalysis.includes('6+ years')) return 'senior';
  if (lowerAnalysis.includes('mid') || lowerAnalysis.includes('3+ years')) return 'mid';
  if (lowerAnalysis.includes('junior') || lowerAnalysis.includes('1+ year')) return 'junior';
  return 'entry';
}
