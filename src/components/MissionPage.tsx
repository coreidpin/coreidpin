import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Users, TrendingUp, Briefcase, Heart, Shield, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import { colors, spacing, typography, gradients, shadows } from '../styles/designSystem';

const stakeholders = [
  {
    icon: Users,
    title: 'Professionals',
    description: 'A portable, verifiable professional passport — share it with employers, platforms, or partners.',
    benefits: [
      'Instant verification',
      'Single identity across platforms',
      'Privacy-preserving credentials',
    ],
    color: colors.brand.primary[300],
  },
  {
    icon: TrendingUp,
    title: 'Investors',
    description: 'A platform-level identity product with API revenue and sticky network effects.',
    benefits: [
      'Recurring API revenue model',
      'Strong network effects',
      'Infrastructure-grade product',
    ],
    color: colors.brand.secondary[500],
  },
  {
    icon: Briefcase,
    title: 'Business Owners',
    description: 'Plug into an API that reduces onboarding time and verification cost dramatically.',
    benefits: [
      'Faster onboarding (90% reduction)',
      'Lower verification costs',
      'Reduced fraud risk',
    ],
    color: colors.brand.accent[400],
  },
];

const values = [
  { icon: Shield, label: 'Trust', description: 'Built on verified identity' },
  { icon: Zap, label: 'Simplicity', description: 'Easy to integrate & use' },
  { icon: Users, label: 'Accessibility', description: 'Universal phone-based identity' },
  { icon: Heart, label: 'Integrity', description: 'Privacy-first approach' },
];

export function MissionPage() {
  const navigate = useNavigate();

  return (
    <section className="relative py-16 sm:py-24 overflow-hidden sm:[content-visibility:auto] sm:[contain:layout_style_paint]" style={{ backgroundColor: colors.black }}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(#0a0b0d 1px, transparent 1px), linear-gradient(90deg, #0a0b0d 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          backgroundColor: '#fcfdfd',
        }} />
      </div>

      {/* Gradient orbs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-3xl" style={{ backgroundColor: 'rgba(143, 208, 202, 0.1)' }} />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full blur-3xl" style={{ backgroundColor: 'rgba(143, 208, 202, 0.1)' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-8 py-24 w-full">
        {/* Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.span
            className="inline-block tracking-[0.3em] text-xs sm:text-sm mb-6 font-black uppercase"
            style={{ color: colors.brand.secondary[300] }} // Very bright brand color
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
          >
            OUR VISION
          </motion.span>
          
          <h2 className="text-4xl sm:text-5xl md:text-7xl mb-8 text-white font-bold leading-snug md:leading-tight break-words">
            What PIN Means<br />
            <span className="text-white">
              for Everyone
            </span>
          </h2>
        </motion.div>

        {/* Stakeholders */}
        <div className="grid lg:grid-cols-3 gap-8 mb-24">
          {stakeholders.map((stakeholder, index) => {
            const Icon = stakeholder.icon;
            
            // Mouse motion values for 3D tilt
            const x = useMotionValue(0);
            const y = useMotionValue(0);

            // Create smooth spring transitions
            const springConfig = { damping: 20, stiffness: 300 };
            const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [10, -10]), springConfig);
            const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-10, 10]), springConfig);

            const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
              const rect = event.currentTarget.getBoundingClientRect();
              const width = rect.width;
              const height = rect.height;
              const mouseX = event.clientX - rect.left;
              const mouseY = event.clientY - rect.top;
              const xPct = mouseX / width - 0.5;
              const yPct = mouseY / height - 0.5;
              x.set(xPct);
              y.set(yPct);
            };

            const handleMouseLeave = () => {
              x.set(0);
              y.set(0);
            };

            return (
              <motion.div
                key={stakeholder.title}
                className="group cursor-pointer perspective-1000"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                viewport={{ once: true }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                  rotateX,
                  rotateY,
                  transformStyle: "preserve-3d",
                }}
              >
                <Card className="relative h-full p-8 rounded-3xl bg-neutral-900/50 backdrop-blur-xl border border-white/10 transition-all duration-500 shadow-lg group-hover:shadow-2xl overflow-hidden group-hover:border-white/20"
                  style={{
                    transform: "translateZ(0)",
                  }}
                >
                  {/* Subtle sheen overlay on hover */}
                  <motion.div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                    style={{
                      background: `linear-gradient(135deg, ${stakeholder.color}10 0%, transparent 60%)`,
                    }}
                  />

                  {/* Reflection Sheen */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-30 pointer-events-none bg-gradient-to-tr from-transparent via-white to-transparent"
                    style={{
                      transform: useTransform(x, [-0.5, 0.5], ["translateX(-100%) rotate(45deg)", "translateX(100%) rotate(45deg)"]),
                    }}
                  />
                  
                  <div className="relative z-10" style={{ transform: "translateZ(50px)" }}>
                    {/* Enhanced Icon with glow */}
                    <div className="relative mb-6">
                      <motion.div
                        className="w-20 h-20 rounded-2xl flex items-center justify-center relative z-10"
                        style={{ 
                          backgroundColor: `${stakeholder.color}20`,
                          border: `1px solid ${stakeholder.color}40`,
                        }}
                        whileHover={{ 
                          scale: 1.1,
                          rotate: 5,
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 10 }}
                      >
                        <Icon className="w-10 h-10" style={{ color: stakeholder.color }} />
                      </motion.div>
                      {/* Bloom/Glow effect behind icon */}
                      <div 
                        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl"
                        style={{ backgroundColor: `${stakeholder.color}30` }}
                      />
                    </div>

                    <h3 className="text-2xl font-bold mb-4 text-white transition-colors">
                      {stakeholder.title}
                    </h3>
                    <p className="text-base text-white mb-6 leading-relaxed font-medium">
                      {stakeholder.description}
                    </p>

                    {/* Separator */}
                    <div 
                      className="h-px my-6 opacity-40"
                      style={{ backgroundColor: stakeholder.color }}
                    />

                    {/* Enhanced Benefits with Checkmarks */}
                    <div className="space-y-4">
                      {stakeholder.benefits.map((benefit, i) => (
                        <motion.div 
                          key={i} 
                          className="flex items-center gap-3"
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + (i * 0.1) }}
                          viewport={{ once: true }}
                        >
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ 
                              backgroundColor: `${stakeholder.color}33`,
                              border: `1px solid ${stakeholder.color}50`
                            }}
                          >
                            <CheckCircle2 className="w-4 h-4" style={{ color: stakeholder.color }} />
                          </div>
                          <span className="text-sm font-bold text-white transition-colors">
                            {benefit}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Corner accent logic */}
                  <div 
                    className="absolute bottom-0 right-0 w-32 h-32 rounded-tl-full opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700"
                    style={{ backgroundColor: stakeholder.color }}
                  />
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Mission Statement */}
        <motion.div
          className="relative mb-24"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="relative p-12 md:p-16 rounded-3xl overflow-hidden mt-6" style={{ backgroundColor: colors.neutral[900] }}>
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl" style={{ backgroundColor: `${colors.brand.secondary[500]}20` }} />
            <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl" style={{ backgroundColor: `${colors.brand.secondary[500]}20` }} />
            
            <div className="relative text-center max-w-4xl mx-auto mt-6 rounded-2xl p-8 sm:[content-visibility:auto] sm:[contain:layout_style_paint]" style={{ backgroundColor: colors.neutral[900] }}>
              <motion.div
                className="inline-block mb-6"
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 }}
                viewport={{ once: true }}
              >
                <div className="tracking-[0.3em] text-sm" style={{ color: colors.brand.secondary[500] }}>MISSION</div>
              </motion.div>
              
              <motion.h3
                className="text-3xl sm:text-4xl md:text-5xl mb-6 text-white leading-snug md:leading-tight break-words"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                viewport={{ once: true }}
              >
                Build a universal, privacy-preserving identity layer that turns phone numbers 
                into trusted professional identities.
              </motion.h3>

              <motion.p
                className="text-base sm:text-lg md:text-xl text-white leading-relaxed md:leading-relaxed mb-8 px-2 sm:px-0 font-medium"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                viewport={{ once: true }}
              >
                Empowering professionals, enabling businesses, and building trust in the digital economy.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                viewport={{ once: true }}
              >
                <Button
                  size="lg"
                  onClick={() => navigate('/get-started')}
                  className="text-black font-semibold px-8 py-4 text-lg"
                  style={{ backgroundColor: colors.brand.secondary[500] }}
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Values */}
        <motion.div
          className="mt-14 md:mt-20 mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <h3 className="text-3xl text-center mb-12 text-white mt-4 md:mt-6">Our Values</h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={value.label}
                  className="text-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="relative p-6 rounded-2xl bg-white/5 backdrop-blur-xl border-white/10 transition-all duration-300 hover:shadow-xl">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ backgroundImage: 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1))' }}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-lg mb-2 text-white font-bold">{value.label}</div>
                    <div className="text-sm text-white font-medium">{value.description}</div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Technical Notes & CTA */}
        <motion.div
          className="grid lg:grid-cols-2 gap-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          {/* Technical Notes */}
          <Card className="p-8 rounded-3xl bg-white/5 backdrop-blur-xl border-white/10 mt-8 md:mt-10">
            <h4 className="text-2xl mb-6 text-white">Quick Technical Notes</h4>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: 'rgba(143, 208, 202, 0.2)' }}>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#8fd0ca' }} />
                </div>
                <div>
                  <div className="text-sm mb-1 text-white">Implementation</div>
                  <div className="text-sm text-white">
                    Quickstart SDKs for Node/Python + Embeddable JS widget
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: 'rgba(143, 208, 202, 0.2)' }}>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#8fd0ca' }} />
                </div>
                <div>
                  <div className="text-sm mb-1 text-white">Security</div>
                  <div className="text-sm text-white">
                    Phone encrypted (AES-256), PIN hashed (SHA-256 + salt)
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: 'rgba(143, 208, 202, 0.2)' }}>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#8fd0ca' }} />
                </div>
                <div>
                  <div className="text-sm mb-1 text-white">Partners Get</div>
                  <div className="text-sm text-white">
                    Sandbox keys, webhooks, dashboard analytics, enterprise SLAs
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* CTA */}
          <div className="relative p-8 rounded-3xl overflow-hidden flex flex-col justify-center mt-2 md:mt-4" style={{ backgroundColor: '#28263b' }}>
            {/* Decorative glow */}
            
          <div className="relative text-center">
            <h4 className="text-3xl sm:text-4xl mb-4 text-white leading-snug mx-auto max-w-[22ch]">
              Ready to Build?
            </h4>
            <p className="text-white/90 mb-8 leading-relaxed mx-auto max-w-[38ch] sm:max-w-[56ch] px-2 sm:px-0">
              Join the future of professional identity infrastructure
            </p>
              
              <motion.button
                className="group relative px-6 py-3 sm:px-8 sm:py-4 md:px-10 md:py-5 overflow-hidden rounded-full text-white transition-all duration-300 hover:shadow-2xl hover:shadow-[#8fd0ca]/50"
                style={{ backgroundColor: '#8fd0ca' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10 flex items-center gap-3 text-sm sm:text-base md:text-lg whitespace-nowrap">
                  Explore the PIN API
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <motion.div
                  className="absolute inset-0 bg-white/20"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.5 }}
                />
              </motion.button>

              <div className="mt-8 mx-auto w-full max-w-[28rem] flex items-center justify-between text-sm text-white px-4">
                <div className="text-center">5 min integration</div>
                <div className="text-center">Free sandbox</div>
                <div className="text-center">24/7 support</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="mt-20 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 text-sm text-white mt-6 md:mt-8 font-medium">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.brand.secondary[400] }} />
            <span>PIN Infrastructure API — Building Trust, One Identity at a Time</span>
          </div>
        </motion.div>


      </div>
    </section>
  );
}
