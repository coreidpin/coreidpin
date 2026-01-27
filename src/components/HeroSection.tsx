import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ArrowRight, CheckCircle, Shield, Play, Fingerprint, Clock, Sparkles, ChevronRight, Loader2 } from 'lucide-react';
import { colors, spacing, typography } from '../styles/designSystem';
import { useMotionValue, useTransform } from 'framer-motion';

interface HeroSectionProps {
  onNavigate: (page: string) => void;
  isAuthenticated: boolean;
  setShowWaitlist: (show: boolean) => void;
}

const roles = [
  "Software Engineers",
  "Product Managers",
  "Product Designers",
  "Data Scientists",
  "HR Professionals",
  "Creative Directors",
  "Developers"
];

export function HeroSection({ onNavigate, isAuthenticated, setShowWaitlist }: HeroSectionProps) {
  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = useState(false);
  const [roleIndex, setRoleIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setRoleIndex((prev) => (prev + 1) % roles.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);
  
  const handleNavigate = (page: string) => {
    setIsNavigating(true);
    // Use React Router for all navigation
    if (page === 'dashboard') {
      navigate('/dashboard');
    } else if (page === 'how-it-works') {
      navigate('/how-it-works');
    } else {
      // Fallback to onNavigate for other pages
      onNavigate(page);
    }
    // Reset loading state after a short delay
    setTimeout(() => setIsNavigating(false), 1000);
  };

  const handleDashboardOrWaitlist = () => {
    setIsNavigating(true);
    if (isAuthenticated) {
      handleNavigate('dashboard');
    } else {
      // Redirect to Get Started page instead of waitlist
      navigate('/get-started');
      setTimeout(() => setIsNavigating(false), 500);
    }
  };

  // 3D Tilt Effect for Desktop
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [-300, 300], [15, -15]);
  const rotateY = useTransform(mouseX, [-300, 300], [-15, 15]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <>
      {/* HERO SECTION - Modern Light, Mobile-First */}
      <section className="relative min-h-[85vh] sm:min-h-[90vh] lg:min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-white to-slate-50">
        {/* Animated gradient overlay */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            background: [
              'radial-gradient(circle 800px at 20% 50%, rgba(123, 184, 255, 0.15) 0%, transparent 70%)',
              'radial-gradient(circle 800px at 80% 50%, rgba(191, 165, 255, 0.15) 0%, transparent 70%)',
              'radial-gradient(circle 800px at 20% 50%, rgba(123, 184, 255, 0.15) 0%, transparent 70%)',
            ],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16 lg:py-20 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Hero Content - Mobile: Stack, Desktop: 2-col */}
            <div className="grid gap-6 md:gap-8 lg:grid-cols-2 lg:gap-12 items-center hero-grid">
              {/* Left: Text Content */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center lg:text-left hero-mobile hero-text"
                data-testid="hero-text"
              >
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 sm:mb-6 border border-slate-200 bg-white"
                >
                  <Sparkles className="h-4 w-4" style={{ color: colors.brand.secondary[500] }} />
                  <span className="text-xs sm:text-sm" style={{ color: colors.brand.primary[400] }}>Introducing PIN</span>
                  <Badge className="ml-1 text-xs" style={{ backgroundColor: colors.neutral[900], color: colors.white }}>New</Badge>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl mb-4 sm:mb-6 leading-tight font-bold tracking-tight"
                  style={{ color: colors.black }}
                >
                  Your Phone Number. Your Verified Global PIN for{' '}
                  <span className="relative inline-block min-w-[200px]">
                    <motion.span
                      key={roles[roleIndex]}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                      className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500"
                    >
                      {roles[roleIndex]}
                    </motion.span>
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-sm sm:text-base md:text-lg lg:text-xl mb-8 sm:mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed opacity-80"
                  style={{ color: colors.black }}
                >
                  Gidi-PIN turns your phone number into a secure, universal Professional Identity Number (PIN). One identity, recognized across companies, platforms, and borders — powered by enterprise-grade infrastructure.
                </motion.p>

                {/* CTAs */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8"
                >
                  <Button
                    onClick={handleDashboardOrWaitlist}
                    disabled={isNavigating}
                    className="
                      w-full sm:w-auto
                      h-12 sm:h-auto
                      text-base px-6 py-3 sm:text-lg sm:px-8 sm:py-6 
                      group hover:scale-105 transition-all duration-200 
                      text-white disabled:opacity-70 disabled:cursor-not-allowed
                    "
                    style={{ backgroundColor: colors.black }}
                  >
                    {isNavigating ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <Fingerprint className="h-5 w-5 mr-2" />
                        {isAuthenticated ? 'Dashboard' : 'Get Started'}
                        <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => handleNavigate('how-it-works')}
                    variant="outline"
                    className="
                      w-full sm:w-auto
                      h-12 sm:h-auto
                      text-base px-6 py-3 sm:text-lg sm:px-8 sm:py-6 
                      hover:scale-105 transition-all duration-200
                    "
                    style={{ borderColor: colors.brand.primary[200], color: colors.black }}
                  >
                    <Play className="h-5 w-5 mr-2" />
                    See How It Works
                  </Button>
                </motion.div>

                {/* Social proof */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-[10px] sm:text-xs font-medium uppercase tracking-wider text-slate-500"
                >
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5" style={{ color: colors.brand.secondary[500] }} />
                    <span>Free forever</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" style={{ color: colors.brand.primary[400] }} />
                    <span>5 min setup</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5" style={{ color: colors.brand.primary[300] }} />
                    <span>Blockchain secured</span>
                  </div>
                </motion.div>
              </motion.div>

              {/* Right: Abstract Identity Visualization */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 1 }}
                className="relative hidden lg:flex flex-col items-center justify-center gap-8 lg:gap-12 perspective-1000"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
              >
                {/* Phone Number Card */}
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  className="relative group rounded-2xl p-6 md:p-8 border border-white/10 shadow-2xl w-64 md:w-72"
                  style={{ backgroundColor: colors.neutral[900], color: 'white' }}
                >
                  <div className="text-xs mb-2 text-center uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>Phone Number</div>
                  <div className="text-xl md:text-2xl font-mono tracking-tighter text-center" style={{ color: 'white' }}>
                    +234 812 345 6789
                  </div>
                  <motion.div 
                    className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"
                    animate={{ opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    style={{ transform: "translateZ(20px)" }}
                  />
                </motion.div>

                {/* Arrow / Connection */}
                <motion.div
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  transition={{ delay: 1, duration: 0.5 }}
                  className="relative h-px w-24 bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400"
                >
                  <motion.div 
                    className="absolute right-0 -top-[3px] w-2 h-2 border-t border-r border-emerald-400 rotate-45"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </motion.div>

                {/* Verified PIN Card */}
                <motion.div
                  initial={{ x: 20, opacity: 0, scale: 0.9 }}
                  animate={{ x: 0, opacity: 1, scale: 1 }}
                  transition={{ delay: 1.4, duration: 0.8, type: "spring" }}
                  className="relative group rounded-2xl p-6 md:p-8 border shadow-2xl w-64 md:w-72"
                  style={{ 
                    backgroundColor: colors.black, 
                    color: 'white', 
                    borderColor: `${colors.brand.secondary[500]}80`, 
                    boxShadow: `0 0 50px ${colors.brand.secondary[500]}33` 
                  }}
                >
                  <div className="flex flex-col items-center gap-3">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <CheckCircle className="h-10 w-10" style={{ color: colors.brand.secondary[500] }} />
                    </motion.div>
                    <div className="text-center">
                      <div className="text-xs mb-1 uppercase tracking-widest" style={{ color: `${colors.brand.secondary[500]}99` }}>Verified PIN</div>
                      <div className="text-xl md:text-2xl font-semibold" style={{ color: 'white' }}>PIN-234-812345</div>
                    </div>
                  </div>
                  
                  {/* Outer Glow */}
                  <div className="absolute -inset-0.5 rounded-2xl bg-emerald-500/20 blur opacity-70" style={{ transform: "translateZ(-10px)" }} />
                </motion.div>
                
                {/* Mobile version without 3D effect */}
                <div className="lg:hidden relative flex flex-col items-center justify-center gap-8">
                   {/* Phone Number Card */}
                   <div className="relative group rounded-2xl p-6 border border-white/10 shadow-2xl w-64" style={{ backgroundColor: colors.neutral[900], color: 'white' }}>
                    <div className="text-xs mb-2 text-center uppercase tracking-widest text-white/40">Phone Number</div>
                    <div className="text-xl font-mono text-center text-white">+234 812 345 6789</div>
                  </div>
                  {/* Verified PIN Card */}
                  <div className="relative group rounded-2xl p-6 border shadow-2xl w-64" style={{ backgroundColor: colors.black, color: 'white', borderColor: `${colors.brand.secondary[500]}80` }}>
                    <div className="flex flex-col items-center gap-3">
                      <CheckCircle className="h-10 w-10" style={{ color: colors.brand.secondary[500] }} />
                      <div className="text-center">
                        <div className="text-xs mb-1 uppercase tracking-widest text-[#32f08c]/60">Verified PIN</div>
                        <div className="text-xl font-semibold text-white">PIN-234-812345</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <ChevronRight className="h-6 w-6 text-slate-400 rotate-90" />
        </motion.div>
      </section>
    </>
  );
}
