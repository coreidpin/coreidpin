import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import {
  Brain,
  Sparkles,
  ArrowRight,
  Users,
  CheckCircle,
  XCircle,
  TrendingUp,
  Shield,
  Zap,
  DollarSign,
  AlertTriangle,
  Award,
  Building,
  Volume2,
  VolumeX
} from 'lucide-react';

interface HeroWithAnimationProps {
  onLogin: (userType: "employer" | "professional" | "university") => void;
}

export function HeroWithAnimation({ onLogin }: HeroWithAnimationProps) {
  const [activeScene, setActiveScene] = useState<'problem' | 'solution'>('solution');
  const [isMuted, setIsMuted] = useState(true);
  const isProd = import.meta.env.PROD;

  const problemScenes = [
    {
      icon: XCircle,
      title: "Anyone Can Claim Anything",
      description: "Résumés are full of unverified claims and inflated experience",
      color: "text-destructive",
      bgColor: "bg-destructive/10"
    },
    {
      icon: AlertTriangle,
      title: "Recruiters Waste Time",
      description: "Hours spent on unqualified leads and fake credentials",
      color: "text-warning",
      bgColor: "bg-warning/10"
    },
    {
      icon: DollarSign,
      title: "Trust is Missing",
      description: "Talented people overlooked because skills are hard to verify",
      color: "text-warning",
      bgColor: "bg-warning/10"
    }
  ];

  const solutionScenes = [
    {
      icon: Shield,
      title: "AI-Verified Skills",
      description: "Analyzes LinkedIn, GitHub, portfolios to verify real experience",
      color: "text-success",
      bgColor: "bg-success/10"
    },
    {
      icon: Award,
      title: "Social Verification",
      description: "Build a trusted identity with verified badges and credentials",
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      icon: TrendingUp,
      title: "Instant Matching",
      description: "Swipe. Verify. Match. Hire. — Find talent in minutes, not months",
      color: "text-success",
      bgColor: "bg-success/10"
    }
  ];

  const currentScenes = activeScene === 'problem' ? problemScenes : solutionScenes;

  return (
    <section className="relative py-8 sm:py-12 md:py-16 lg:py-24 px-4 overflow-hidden bg-white">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-60 h-60 sm:w-80 sm:h-80 bg-primary/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-60 h-60 sm:w-80 sm:h-80 bg-purple-500/5 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="container mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-6 flex-wrap">
              <Badge variant="secondary" className="px-3 py-1.5">
                <Brain className="h-3.5 w-3.5 mr-1.5" />
                AI-Verified Skills
              </Badge>
              <Badge variant="secondary" className="px-3 py-1.5">
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                Social + Professional
              </Badge>
            </div>

            <motion.h1 
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl mb-4 sm:mb-6 tracking-tight leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              The Future of Work is
              <span className="text-primary block mt-1 sm:mt-2 bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
                Social, Borderless & Verified
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-xl leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Swipe. Verify. Match. Hire. Where real skills, verified experience, and authentic people connect to create opportunity.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                size="lg"
                disabled={isProd}
                onClick={() => { if (isProd) return; onLogin("employer"); }}
                className="flex items-center justify-center gap-2 text-sm sm:text-base px-6 py-5 sm:py-6 w-full sm:w-auto hover:scale-105 transition-transform"
              >
                <Building className="h-4 w-4 sm:h-5 sm:w-5" />
                Post a Job
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                disabled={isProd}
                onClick={() => { if (isProd) return; onLogin("professional"); }}
                className="flex items-center justify-center gap-2 text-sm sm:text-base px-6 py-5 sm:py-6 w-full sm:w-auto hover:scale-105 transition-transform"
              >
                <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                Get Verified
              </Button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div 
              className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 pt-4 sm:pt-6 border-t border-border"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="text-center sm:text-left">
                <div className="text-lg sm:text-xl md:text-2xl font-semibold text-primary">10K+</div>
                <div className="text-xs sm:text-sm text-muted-foreground leading-tight">Verified<span className="hidden sm:inline"> Profiles</span></div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-lg sm:text-xl md:text-2xl font-semibold text-primary">500+</div>
                <div className="text-xs sm:text-sm text-muted-foreground leading-tight">Companies</div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-lg sm:text-xl md:text-2xl font-semibold text-primary">30+</div>
                <div className="text-xs sm:text-sm text-muted-foreground leading-tight">Countries</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Video & Message */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            {/* Main Video - Job Search */}
            <motion.div 
              className="relative rounded-2xl overflow-hidden shadow-2xl mb-4 sm:mb-6 bg-black"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative w-full h-48 sm:h-64 md:h-80 lg:h-96">
                <video
                  id="hero-video"
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  className="w-full h-full object-cover"
                  poster="https://images.unsplash.com/photo-1686984096026-23d6e82f9749?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqb2IlMjBzZWFyY2glMjBsYXB0b3B8ZW58MXx8fHwxNzU5OTk5OTQ3fDA&ixlib=rb-4.1.0&q=80&w=1080"
                >
                  {/* Job search video - someone looking for job on laptop */}
                  <source src="https://cdn.pixabay.com/video/2022/06/23/121534-724267419_large.mp4" type="video/mp4" />
                  
                  {/* Fallback to image */}
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1686984096026-23d6e82f9749?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqb2IlMjBzZWFyY2glMjBsYXB0b3B8ZW58MXx8fHwxNzU5OTk5OTQ3fDA&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="Professional searching for job opportunities"
                    className="w-full h-full object-cover"
                  />
                </video>

                {/* Video Overlay with Message */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end">
                  <div className="p-4 sm:p-6 w-full">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1 }}
                      className="text-white space-y-2"
                    >
                      <h3 className="text-lg sm:text-xl font-semibold">Our Solution</h3>
                      <p className="text-sm sm:text-base text-white/90">
                        AI-powered verification meets social hiring. No more fake résumés. No more wasted time.
                      </p>
                    </motion.div>
                  </div>
                </div>

                {/* Mute Toggle Button */}
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? (
                    <VolumeX className="h-5 w-5 text-white" />
                  ) : (
                    <Volume2 className="h-5 w-5 text-white" />
                  )}
                </button>
              </div>
              
              {/* Floating Stats */}
              <motion.div
                className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-white/95 backdrop-blur-sm p-3 sm:p-4 rounded-lg shadow-lg border border-border"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                  <span className="font-semibold text-foreground">99.9% Compliance Rate</span>
                </div>
              </motion.div>

              <motion.div
                className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 bg-white/95 backdrop-blur-sm p-3 sm:p-4 rounded-lg shadow-lg border border-border"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  <div>
                    <div className="font-semibold text-xs sm:text-sm text-foreground">≤7 Days</div>
                    <div className="text-xs text-muted-foreground">Onboarding Time</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Problem/Solution Toggle Section */}
            <div className="bg-white border border-border rounded-xl p-4 sm:p-6 shadow-lg">
              {/* Toggle Buttons */}
              <div className="flex gap-2 mb-4 sm:mb-6">
                <Button
                  variant={activeScene === 'problem' ? 'default' : 'ghost'}
                  onClick={() => setActiveScene('problem')}
                  className="flex-1 text-xs sm:text-sm px-2 sm:px-4"
                  size="sm"
                >
                  <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">The Challenge</span>
                  <span className="sm:hidden">Challenge</span>
                </Button>
                <Button
                  variant={activeScene === 'solution' ? 'default' : 'ghost'}
                  onClick={() => setActiveScene('solution')}
                  className="flex-1 text-xs sm:text-sm px-2 sm:px-4"
                  size="sm"
                >
                  <Zap className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Our Solution</span>
                  <span className="sm:hidden">Solution</span>
                </Button>
              </div>

              {/* Animated Cards */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeScene}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-3"
                >
                  {currentScenes.map((scene, index) => (
                    <motion.div
                      key={scene.title}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      className={`p-3 sm:p-4 rounded-lg border ${ 
                        activeScene === 'problem'
                          ? 'border-destructive/30 bg-destructive/5'
                          : 'border-success/30 bg-success/5'
                      }`}
                    >
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 ${scene.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <scene.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${scene.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-xs sm:text-sm mb-1 text-foreground">{scene.title}</h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">{scene.description}</p>
                        </div>
                        {activeScene === 'solution' && (
                          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-success flex-shrink-0" />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
