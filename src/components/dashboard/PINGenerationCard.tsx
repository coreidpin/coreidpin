import React, { useState } from 'react';
import { Fingerprint, Phone, Globe, Shield, ChevronRight, Copy, Eye, EyeOff, Share2, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { colors, typography, spacing, borderRadius } from '../../styles/designTokens';
import { shadows } from '../../styles/shadows';

interface PINGenerationCardProps {
  onGenerateWithPhone: () => void;
  onGenerateRandom: () => void;
  isLoading?: boolean;
  currentPin?: string;
  onCopyPin?: () => void;
  onSharePin?: (platform: 'twitter' | 'linkedin') => void;
  pinVisible?: boolean;
  onTogglePinVisibility?: () => void;
}

export function PINGenerationCard({
  onGenerateWithPhone,
  onGenerateRandom,
  isLoading = false,
  currentPin,
  onCopyPin,
  onSharePin,
  pinVisible = true,
  onTogglePinVisibility,
}: PINGenerationCardProps) {
  const [hoveredButton, setHoveredButton] = useState<'phone' | 'random' | 'copy' | 'share' | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (onCopyPin) {
      onCopyPin();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const benefits = [
    {
      icon: Shield,
      title: 'Shareable Verification',
      description: 'Share your PIN to prove your identity instantly',
    },
    {
      icon: Globe,
      title: 'Global Recognition',
      description: 'Your PIN works everywhere, across platforms',
    },
  ];

  // Shared Background Component
  const PremiumBackground = () => (
    <>
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 50%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)',
            'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)',
          ],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
    </>
  );

  // Render PIN Display Mode
  if (currentPin) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden w-[calc(100%+2rem)] -mx-4 sm:w-full sm:mx-0 rounded-xl p-4 md:p-6"
        style={{
          background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        }}
      >
        <PremiumBackground />
        
        <div className="relative z-10">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="mb-2 text-sm font-medium text-gray-400 uppercase tracking-wider">Your Professional PIN</div>
            
            <div className="relative group w-full flex items-center justify-center gap-3">
              <div 
                className="flex-1 text-xl md:text-2xl font-mono font-bold text-white my-4 px-3 py-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm text-center"
                style={{ 
                  textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                  letterSpacing: '0.1em',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '60px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {isLoading || currentPin === 'Loading...' ? (
                  <span className="animate-pulse opacity-70">Loading...</span>
                ) : (
                  pinVisible ? currentPin : '••••••'
                )}
              </div>
              
              {!(isLoading || currentPin === 'Loading...') && (
                <button
                  onClick={onTogglePinVisibility}
                  className="flex-shrink-0 p-3 text-gray-400 hover:text-white transition-colors rounded-xl hover:bg-white/5"
                  aria-label={pinVisible ? "Hide PIN" : "Show PIN"}
                >
                  {pinVisible ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                </button>
              )}
            </div>

            <div className="flex gap-3 mt-4 w-full justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCopy}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-900/20 hover:bg-blue-500 transition-colors"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied' : 'Copy PIN'}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSharePin?.('twitter')}
                className="p-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors border border-white/5"
                title="Share on X"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSharePin?.('linkedin')}
                className="p-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors border border-white/5"
                title="Share on LinkedIn"
              >
                <svg className="h-4 w-4 md:h-5 md:w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </motion.button>
            </div>
          </div>

          {/* Benefits Grid (Compact) */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="flex flex-col items-center text-center">
                <benefit.icon className="h-5 w-5 text-blue-400 mb-2" />
                <div className="text-xs font-semibold text-white">{benefit.title}</div>
                <div className="text-[10px] text-gray-400 leading-tight mt-1">{benefit.description}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  // Render Generation Mode (Original)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="relative overflow-hidden w-[calc(100%+2rem)] -mx-4 sm:w-full sm:mx-0 rounded-xl p-4 md:p-6"
      style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
      }}
    >
      <PremiumBackground />

      <div className="relative z-10">
        {/* Header with Icon */}
        <div className="flex flex-col items-center text-center mb-6">
          {/* Premium Identity Icon */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-4"
            style={{
              width: '64px',
              height: '64px',
              borderRadius: borderRadius.xl,
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(59, 130, 246, 0.1)',
            }}
          >
            <Fingerprint
              className="text-blue-400"
              style={{ width: '32px', height: '32px' }}
            />
          </motion.div>

          <h2
            className="text-white mb-2"
            style={{
              fontSize: typography.fontSize.xl,
              fontWeight: typography.fontWeight.bold,
              lineHeight: typography.lineHeight.tight,
            }}
          >
            Generate Your GidiPIN PIN
          </h2>
          <p
            className="text-gray-400"
            style={{
              fontSize: typography.fontSize.sm,
              lineHeight: typography.lineHeight.relaxed,
            }}
          >
            Choose how you'd like to create your unique professional identity number
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3 mb-6">
          {/* Primary Button - Phone Number */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onHoverStart={() => setHoveredButton('phone')}
            onHoverEnd={() => setHoveredButton(null)}
            onClick={onGenerateWithPhone}
            disabled={isLoading}
            className="w-full flex items-center justify-between p-4 transition-all duration-200"
            style={{
              background: hoveredButton === 'phone' ? colors.coreBlueDark : colors.coreBlue,
              borderRadius: borderRadius.lg,
              color: 'white',
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.semibold,
              boxShadow: hoveredButton === 'phone' ? shadows.blue : shadows.md,
              minHeight: '56px',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: borderRadius.md,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                }}
              >
                <Phone className="h-5 w-5" />
              </div>
              <div className="text-left">
                <div className="font-semibold">Use Phone Number</div>
                <div className="text-xs text-white/80">Recommended for most users</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isLoading && <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />}
              <ChevronRight className="h-5 w-5" />
            </div>
          </motion.button>

          {/* Secondary Button - Random PIN */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onHoverStart={() => setHoveredButton('random')}
            onHoverEnd={() => setHoveredButton(null)}
            onClick={onGenerateRandom}
            disabled={isLoading}
            className="w-full flex items-center justify-between p-4 transition-all duration-200"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${hoveredButton === 'random' ? colors.coreBlue : 'rgba(255, 255, 255, 0.1)'}`,
              borderRadius: borderRadius.lg,
              color: 'white',
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.semibold,
              minHeight: '56px',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: borderRadius.md,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }}
              >
                <Fingerprint className="h-5 w-5 text-gray-300" />
              </div>
              <div className="text-left">
                <div className="font-semibold">Generate Random</div>
                <div className="text-xs text-gray-400">System-generated PIN</div>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-500" />
          </motion.button>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 gap-4 pt-4 border-t border-white/10">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
              className="flex items-start gap-3"
            >
              <div
                className="flex-shrink-0 flex items-center justify-center"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: borderRadius.md,
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                }}
              >
                <benefit.icon className="h-5 w-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <h3
                  className="text-white mb-1"
                  style={{
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.semibold,
                  }}
                >
                  {benefit.title}
                </h3>
                <p
                  className="text-gray-400"
                  style={{
                    fontSize: typography.fontSize.xs,
                    lineHeight: typography.lineHeight.relaxed,
                  }}
                >
                  {benefit.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
