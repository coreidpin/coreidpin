import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ArrowRight, CheckCircle, Shield, Play, Fingerprint, Clock, Sparkles, ChevronRight, Loader2 } from 'lucide-react';

interface HeroSectionProps {
  onNavigate: (page: string) => void;
  isAuthenticated: boolean;
  setShowWaitlist: (show: boolean) => void;
}

export function HeroSection({ onNavigate, isAuthenticated, setShowWaitlist }: HeroSectionProps) {
  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = useState(false);
  
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
                  <Sparkles className="h-4 w-4" style={{ color: '#32F08C' }} />
                  <span className="text-xs sm:text-sm" style={{ color: '#7BB8FF' }}>Introducing PIN</span>
                  <Badge className="ml-1 text-xs" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>New</Badge>
                </motion.div>

                {/* Main Headline */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl mb-4 sm:mb-5 md:mb-6 leading-tight font-bold"
                  style={{ color: '#0A0B0D' }}
                >
                  Your Phone Number. Your Global Identity.
                </motion.h1>

                {/* Subheadline */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-base sm:text-lg md:text-xl mb-6 sm:mb-7 md:mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
                  style={{ color: 'rgba(10,11,13,0.70)' }}
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
                    style={{ backgroundColor: '#0A0B0D' }}
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
                    style={{ borderColor: '#BFA5FF', color: '#0A0B0D' }}
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
                  className="flex items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs sm:text-sm text-gray-400"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" style={{ color: '#32f08c' }} />
                    <span>Free forever</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" style={{ color: '#7bb8ff' }} />
                    <span>5 min setup</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" style={{ color: '#bfa5ff' }} />
                    <span>Blockchain secured</span>
                  </div>
                </motion.div>
              </motion.div>

              {/* Right: Abstract Identity Visualization */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="relative max-w-[min(90vw,520px)] mx-auto"
              >
                {/* Floating particles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-blue-400/40 rounded-full"
                      initial={{ 
                        x: Math.random() * 400,
                        y: Math.random() * 400,
                        scale: 0
                      }}
                      animate={{
                        x: Math.random() * 400,
                        y: Math.random() * 400,
                        scale: [0, 1, 0]
                      }}
                      transition={{
                        duration: 4 + Math.random() * 2,
                        repeat: Infinity,
                        delay: i * 0.3
                      }}
                    />
                  ))}
                </div>

                <motion.div 
                  className="relative rounded-2xl md:rounded-3xl bg-white shadow-2xl border border-slate-200 p-6 md:p-8 cursor-pointer"
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  {/* Pulse effect on hover */}
                  <motion.div
                    className="absolute inset-0 rounded-3xl border-2 border-blue-400/50"
                    initial={{ scale: 1, opacity: 0 }}
                    whileHover={{ scale: 1.1, opacity: [0, 1, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  <div className="absolute inset-0 rounded-3xl pointer-events-none bg-[radial-gradient(circle_at_20%_30%,#e2e8f0_0,transparent_40%),radial-gradient(circle_at_80%_70%,#f1f5f9_0,transparent_40%)]" />
                  <div className="relative">
                    <motion.div 
                      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm overflow-hidden"
                      whileHover={{ y: -2 }}
                    >
                      {/* Animated gradient overlay */}
                      <motion.div
                        className="absolute inset-0"
                        animate={{
                          background: [
                            'radial-gradient(circle at 20% 50%, rgba(123, 184, 255, 0.2) 0%, transparent 50%)',
                            'radial-gradient(circle at 80% 50%, rgba(191, 165, 255, 0.2) 0%, transparent 50%)',
                            'radial-gradient(circle at 20% 50%, rgba(123, 184, 255, 0.2) 0%, transparent 50%)',
                          ],
                        }}
                        transition={{
                          duration: 8,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      />
                      
                      {/* Subtle grid pattern */}
                      <div
                        className="absolute inset-0 opacity-5"
                        style={{
                          backgroundImage: 'linear-gradient(rgba(10,11,13,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(10,11,13,0.05) 1px, transparent 1px)',
                          backgroundSize: '32px 32px',
                        }}
                      />
                      
                      <div className="relative z-10">
                        <div className="text-sm mb-2" style={{ color: '#0A0B0D' }}>Core-ID PIN</div>
                        <motion.div 
                          className="text-2xl font-semibold tracking-wide" 
                          style={{ color: '#0A0B0D' }}
                          whileHover={{ scale: 1.05 }}
                        >
                          PIN-234-812345
                        </motion.div>
                        <div className="mt-4 relative">
                          <div className="brand-gradient-overlay" />
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 relative">
                            <div className="rounded-lg bg-white border border-slate-200 p-3 brand-sheen">
                              <div className="text-xs" style={{ color: '#0A0B0D' }}>Status</div>
                              <div className="text-sm font-medium" style={{ color: '#0A0B0D' }}>Verified</div>
                            </div>
                            <div className="rounded-lg bg-white border border-slate-200 p-3 brand-sheen">
                              <div className="text-xs" style={{ color: '#0A0B0D' }}>Scope</div>
                              <div className="text-sm font-medium" style={{ color: '#0A0B0D' }}>Global</div>
                            </div>
                            <div className="rounded-lg bg-white border border-slate-200 p-3 brand-sheen col-span-2 sm:col-span-1">
                              <div className="text-xs" style={{ color: '#0A0B0D' }}>Security</div>
                              <div className="text-sm font-medium" style={{ color: '#0A0B0D' }}>Enterprise-grade</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
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
