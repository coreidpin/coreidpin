import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Smartphone, Key, Lock, Webhook, LayoutDashboard, Shield } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { colors, spacing, typography } from '../styles/designSystem';

const steps = [
  { icon: Smartphone, label: 'User enters phone number', color: colors.brand.primary[300] },
  { icon: Key, label: 'OTP verification', color: colors.brand.secondary[500] },
  { icon: Lock, label: 'PIN minted and stored hashed', color: colors.brand.accent[400] },
  { icon: Shield, label: 'API returns verified data', color: colors.brand.primary[300] },
];

const apiFeatures = [
  { icon: Key, label: 'API Key', description: 'Secure authentication' },
  { icon: Shield, label: '/verify-pin', description: 'Verify identity' },
  { icon: Lock, label: '/pin/create', description: 'Create new PIN' },
  { icon: Webhook, label: 'Webhooks', description: 'Real-time events' },
  { icon: LayoutDashboard, label: 'Dashboard', description: 'Analytics & insights' },
];

export function SolutionPage() {
  // 3D Tilt Effect for Code Terminal
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [-300, 300], [10, -10]);
  const rotateY = useTransform(mouseX, [-300, 300], [-10, 10]);

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
    <section className="relative py-24 md:py-32 overflow-hidden bg-white">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle, ${colors.black} 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }} />
      </div>

      {/* Gradient orbs */}
      <div className="absolute top-20 left-10 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: `${colors.brand.primary[300]}1a` }} />
      <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: `${colors.brand.secondary[500]}1a` }} />

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
            className="inline-block text-green-500 tracking-[0.2em] text-sm mb-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
          >
            THE SOLUTION
          </motion.span>
          
          <h2 className="text-6xl md:text-7xl mb-8 text-gray-900">
            Our Solution —<br />
            <span className="text-black">
              Phone Number as Verified PIN
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            PIN turns every verified phone number into a universal professional identity, 
            secured by encryption + optional blockchain proofs.
          </p>
        </motion.div>

        {/* Process Flow */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <h3 className="text-3xl text-center mb-16 text-gray-900">
            How It Works
          </h3>
          
          <div className="relative max-w-5xl mx-auto">
            {/* Connection line - Desktop only */}
            <div className="hidden lg:block absolute top-[88px] left-[150px] right-[150px] z-0 overflow-visible pointer-events-none">
              <svg width="100%" height="20" viewBox="0 0 100 20" preserveAspectRatio="none" className="overflow-visible">
                <motion.path
                  d="M 0 10 Q 25 20, 50 10 T 100 10"
                  fill="transparent"
                  stroke={`url(#lineGradient)`}
                  strokeWidth="0.5"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 0.4 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                  viewport={{ once: true }}
                />
                <defs>
                  <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={colors.brand.primary[300]} />
                    <stop offset="50%" stopColor={colors.brand.secondary[500]} />
                    <stop offset="100%" stopColor={colors.brand.accent[400]} />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Moving dot */}
              <motion.div
                className="absolute top-[8px] w-2 h-2 rounded-full bg-white shadow-[0_0_10px_white] z-10"
                animate={{ 
                  left: ["0%", "100%", "0%"],
                  opacity: [0, 1, 0]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                }}
                style={{ filter: 'blur(1px)' }}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={index}
                    className="relative"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.15 }}
                    viewport={{ once: true }}
                  >
                    <div className="text-center">
                      {/* Icon container */}
                      <motion.div
                        className="relative mx-auto w-40 h-40 sm:w-44 sm:h-44 mb-6 rounded-2xl flex items-center justify-center bg-white shadow-xl border border-gray-200"
                        style={{ 
                          boxShadow: `0 10px 40px ${step.color}30`,
                        }}
                        whileHover={{ y: -8, boxShadow: `0 20px 60px ${step.color}40` }}
                        transition={{ duration: 0.3 }}
                      >
                        {/* Number badge */}
                        <div
                          className="absolute -top-3 -right-3 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-sm sm:text-base font-bold text-white shadow-lg"
                          style={{ backgroundColor: step.color }}
                        >
                          {index + 1}
                        </div>
                        
                        <Icon className="w-14 h-14 sm:w-16 sm:h-16" style={{ color: step.color }} />
                      </motion.div>
                      
                      {/* Label */}
                      <p className="text-sm text-gray-600 leading-relaxed max-w-[200px] mx-auto">
                        {step.label}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* API Integration */}
        <motion.div
          className="mt-40 lg:mt-48 mb-32"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <h3 className="text-3xl text-center mb-4 text-gray-900 mt-2 md:mt-4">
            How Businesses Plug In
          </h3>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto mt-2 md:mt-4">
            Simple, powerful APIs for seamless integration
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-4xl mx-auto mt-2 mb-20">
            {apiFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.label}
                  className="group"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="relative p-6 rounded-2xl bg-gray-50 border border-gray-200 transition-all duration-300 hover:shadow-2xl">
                    {/* Hover glow */}
                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ backgroundImage: `linear-gradient(135deg, ${colors.brand.primary[300]}0d, ${colors.brand.accent[400]}0d)` }} />
                    
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-opacity opacity-70 group-hover:opacity-100" style={{ backgroundImage: `linear-gradient(135deg, ${colors.brand.primary[300]}1a, ${colors.brand.accent[400]}1a)` }}>
                        <Icon className="w-6 h-6 text-gray-700" />
                      </div>
                      <div className="text-sm mb-1 text-gray-900">{feature.label}</div>
                      <div className="text-xs text-gray-600">{feature.description}</div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Spacer */}
        <div className="h-32"></div>

        {/* Code snippet preview */}
        <motion.div
          className="mt-64 pt-32 max-w-4xl mx-auto perspective-1000"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        >
          <div className="relative rounded-2xl overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.5)] border border-white/10" style={{ backgroundColor: colors.black }}>
            {/* Terminal header */}
            <div className="flex items-center gap-2 px-6 py-4 border-b border-white/10" style={{ backgroundColor: colors.neutral[900] }}>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ff5f57' }} />
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ffbd2e' }} />
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#28ca42' }} />
              <span className="ml-4 text-sm text-white/80">API Example</span>
            </div>
            
            {/* Code */}
          <div className="p-6 overflow-x-auto" style={{ backgroundColor: colors.black }}>
              <pre className="text-sm text-white/80">
                <code>
                  <span style={{ color: 'var(--brand-accent)' }}>POST</span> <span className="text-white">/api/v1/pin/create</span>
                  {'\n\n'}
                  <span className="text-white/70">{'{'}</span>
                  {'\n  '}<span style={{ color: 'var(--brand-primary)' }}>
                    "phone"
                  </span>: <span style={{ color: 'var(--brand-secondary)' }}>
                    "+234 803 555 1212"
                  </span>,
                  {'\n  '}<span style={{ color: 'var(--brand-primary)' }}>
                    "partner_token"
                  </span>: <span style={{ color: 'var(--brand-secondary)' }}>
                    "pk_live_..."
                  </span>
                  {'\n'}<span className="text-white/70">{'}'}</span>
                  {'\n\n'}
                  <span className="text-white/80">// Response</span>
                  {'\n'}<span className="text-white/80">{'{'}</span>
                  {'\n  '}<span style={{ color: 'var(--brand-primary)' }}>
                    "pin"
                  </span>: <span style={{ color: 'var(--brand-secondary)' }}>
                    "PIN-234-8035551212"
                  </span>,
                  {'\n  '}<span style={{ color: 'var(--brand-primary)' }}>
                    "status"
                  </span>: <span style={{ color: 'var(--brand-secondary)' }}>
                    "verified"
                  </span>,
                  {'\n  '}<span style={{ color: 'var(--brand-primary)' }}>
                    "trust_score"
                  </span>: <span style={{ color: 'var(--brand-secondary)' }}>
                    0.92
                  </span>
                  {'\n'}<span className="text-white/70">{'}'}</span>
                </code>
              </pre>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
