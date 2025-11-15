import { motion } from 'motion/react';
import { Users, TrendingUp, Briefcase, Heart, Shield, Zap, ArrowRight } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

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
    color: '#bfa5ff',
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
    color: '#32f08c',
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
    color: '#7bb8ff',
  },
];

const values = [
  { icon: Shield, label: 'Trust', description: 'Built on verified identity' },
  { icon: Zap, label: 'Simplicity', description: 'Easy to integrate & use' },
  { icon: Users, label: 'Accessibility', description: 'Universal phone-based identity' },
  { icon: Heart, label: 'Integrity', description: 'Privacy-first approach' },
];

export function MissionPage() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden" style={{ backgroundColor: '#0a0b0d' }}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(#0a0b0d 1px, transparent 1px), linear-gradient(90deg, #0a0b0d 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          backgroundColor: '#fcfdfd',
        }} />
      </div>

      {/* Gradient orbs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#bfa5ff]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#32f08c]/10 rounded-full blur-3xl" />

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
            className="inline-block text-[#32f08c] tracking-[0.2em] text-sm mb-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
          >
            OUR VISION
          </motion.span>
          
          <h2 className="text-6xl md:text-7xl mb-8 text-white">
            What PIN Means<br />
            <span className="text-[#adabff]">
              for Everyone
            </span>
          </h2>
        </motion.div>

        {/* Stakeholders */}
        <div className="grid lg:grid-cols-3 gap-8 mb-24">
          {stakeholders.map((stakeholder, index) => {
            const Icon = stakeholder.icon;
            return (
              <motion.div
                key={stakeholder.title}
                className="group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
              >
                <Card className="relative h-full p-8 rounded-3xl bg-white text-black border-white transition-all duration-300 hover:shadow-2xl">
                  {/* Gradient border on hover */}
                  <div 
                    className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: 'white',
                      padding: '1px',
                      WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                      WebkitMaskComposite: 'xor',
                      maskComposite: 'exclude',
                    }}
                  />
                  
                  <div className="relative">
                    {/* Icon */}
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                      style={{ backgroundColor: `${stakeholder.color}20` }}
                    >
                      <Icon className="w-8 h-8" style={{ color: stakeholder.color }} />
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-2xl mb-4 text-black">{stakeholder.title}</h3>
                    <p className="text-black mb-6 leading-relaxed">
                      {stakeholder.description}
                    </p>

                    {/* Benefits */}
                    <div className="space-y-3">
                      {stakeholder.benefits.map((benefit, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${stakeholder.color}20` }}
                          >
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: stakeholder.color }}
                            />
                          </div>
                          <span className="text-sm text-black">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
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
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <div className="relative p-12 md:p-16 rounded-3xl bg-[#15372d] overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#bfa5ff]/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#32f08c]/20 rounded-full blur-3xl" />
            
            <div className="relative text-center max-w-4xl mx-auto mt-6">
              <motion.div
                className="inline-block mb-6"
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 }}
                viewport={{ once: true }}
              >
                <div className="text-[#32f08c] tracking-[0.3em] text-sm">MISSION</div>
              </motion.div>
              
              <motion.h3
                className="text-4xl md:text-5xl mb-6 text-white leading-tight"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                viewport={{ once: true }}
              >
                Build a universal, privacy-preserving identity layer that turns phone numbers 
                into trusted professional identities.
              </motion.h3>

              <motion.p
                className="text-xl text-white/60 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                viewport={{ once: true }}
              >
                Empowering professionals, enabling businesses, and building trust in the digital economy.
              </motion.p>
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
          <h3 className="text-3xl text-center mb-12 text-white">Our Values</h3>
          
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
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#bfa5ff]/10 to-[#7bb8ff]/10 flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-6 h-6 text-white/70" />
                    </div>
                    <div className="text-lg mb-2 text-white">{value.label}</div>
                    <div className="text-sm text-white">{value.description}</div>
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
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
        >
          {/* Technical Notes */}
          <Card className="p-8 rounded-3xl bg-white/5 backdrop-blur-xl border-white/10 mt-6">
            <h4 className="text-2xl mb-6 text-white">Quick Technical Notes</h4>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-[#bfa5ff]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-[#bfa5ff]" />
                </div>
                <div>
                  <div className="text-sm mb-1 text-white">Implementation</div>
                  <div className="text-sm text-white">
                    Quickstart SDKs for Node/Python + Embeddable JS widget
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-[#32f08c]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-[#32f08c]" />
                </div>
                <div>
                  <div className="text-sm mb-1 text-white">Security</div>
                  <div className="text-sm text-white">
                    Phone encrypted (AES-256), PIN hashed (SHA-256 + salt)
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-[#7bb8ff]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-[#7bb8ff]" />
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
          <div className="relative p-8 rounded-3xl bg-[#142e28] overflow-hidden flex flex-col justify-center">
            {/* Decorative glow */}
            
            <div className="relative text-center">
              <h4 className="text-3xl mb-4 text-white">Ready to Build?</h4>
              <p className="text-white/60 mb-8 leading-relaxed">
                Join the future of professional identity infrastructure
              </p>
              
              <motion.button
                className="group relative px-10 py-5 overflow-hidden rounded-full bg-gradient-to-r from-[#83b6ff] to-[#adacff] text-white transition-all duration-300 hover:shadow-2xl hover:shadow-[#83b6ff]/50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10 flex items-center gap-3 text-lg">
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

              <div className="mt-8 flex items-center justify-center gap-8 text-sm text-white/40">
                <div>5 min integration</div>
                <div className="w-1 h-1 rounded-full bg-white/40" />
                <div>Free sandbox</div>
                <div className="w-1 h-1 rounded-full bg-white/40" />
                <div>24/7 support</div>
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
          <div className="inline-flex items-center gap-2 text-sm text-white/40 mt-4">
            <div className="w-2 h-2 rounded-full bg-[#32f08c]" />
            <span>PIN Infrastructure API — Building Trust, One Identity at a Time</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
