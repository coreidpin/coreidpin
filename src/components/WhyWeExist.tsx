import { motion } from 'motion/react';
import { Shield, Zap, CheckCircle, Users } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

const problems = [
  {
    icon: Users,
    title: 'Identity',
    description: 'Fragmented credentials across platforms',
    color: '#bfa5ff',
  },
  {
    icon: Shield,
    title: 'Trust',
    description: 'High fraud and false positives',
    color: '#32f08c',
  },
  {
    icon: CheckCircle,
    title: 'Verification',
    description: 'Slow manual verification processes',
    color: '#7bb8ff',
  },
  {
    icon: Zap,
    title: 'Speed',
    description: 'Poor interoperability and portability',
    color: '#bfa5ff',
  },
];

export function WhyWeExist() {
  return (
    <section id="why-we-exist" className="relative py-24 md:py-32 overflow-hidden bg-gradient-to-br from-[#0a0b0d] via-[#1a1b2d] to-[#0a0b0d]">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(#32f08c 1px, transparent 1px), linear-gradient(90deg, #32f08c 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-8 py-24 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left side - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="inline-block mb-6"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
            >
              <span className="text-[#32f08c] tracking-[0.2em] text-sm">THE PROBLEM</span>
            </motion.div>

            <h2 className="text-6xl md:text-7xl mb-8 text-white">
              Why PIN Exists
            </h2>

            <p className="text-xl text-white/70 mb-12 leading-relaxed">
              A global pain point — fragmented professional credentials, high fraud, 
              slow verification, and poor cross-platform identity.
            </p>

            {/* Problem cards */}
            <div className="grid grid-cols-2 gap-6">
              {problems.map((problem, index) => {
                const Icon = problem.icon;
                return (
                  <motion.div
                    key={problem.title}
                    className="relative group"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -5 }}
                  >
                    <div className="relative p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 transition-all duration-300 hover:bg-white/10 hover:border-white/20">
                      {/* Glow effect on hover */}
                      <div
                        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300"
                        style={{ backgroundColor: `${problem.color}20` }}
                      />
                      
                      <div className="relative">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                          style={{ backgroundColor: `${problem.color}20` }}
                        >
                          <Icon className="w-6 h-6" style={{ color: problem.color }} />
                        </div>
                        <h3 className="text-xl mb-2 text-white">{problem.title}</h3>
                        <p className="text-sm text-white/60 leading-relaxed">
                          {problem.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Right side - Illustration */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="relative">
              {/* Main visual container */}
              <div className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-[#bfa5ff]/20 to-[#7bb8ff]/20 backdrop-blur-sm border border-white/10 p-12">
                {/* Phone number transformation visual */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  {/* Phone number */}
                  <div className="absolute left-12 top-1/2 -translate-y-1/2">
                    <motion.div
                      className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center"
                      animate={{
                        boxShadow: [
                          '0 0 20px rgba(191, 165, 255, 0.3)',
                          '0 0 40px rgba(191, 165, 255, 0.5)',
                          '0 0 20px rgba(191, 165, 255, 0.3)',
                        ],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <div className="text-sm text-white/60 mb-2">Phone Number</div>
                      <div className="text-2xl text-white">+234 812 345 6789</div>
                    </motion.div>
                  </div>

                  {/* Arrow */}
                  <motion.div
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                    initial={{ x: -50, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                    viewport={{ once: true }}
                  >
                    <svg width="120" height="24" viewBox="0 0 120 24" fill="none">
                      <motion.path
                        d="M0 12H118M118 12L108 2M118 12L108 22"
                        stroke="url(#gradient)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        whileInView={{ pathLength: 1 }}
                        transition={{ delay: 1, duration: 1 }}
                        viewport={{ once: true }}
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0" y1="12" x2="118" y2="12">
                          <stop offset="0%" stopColor="#bfa5ff" />
                          <stop offset="50%" stopColor="#32f08c" />
                          <stop offset="100%" stopColor="#7bb8ff" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </motion.div>

                  {/* Verified PIN */}
                  <div className="absolute right-12 top-1/2 -translate-y-1/2">
                    <motion.div
                      className="bg-gradient-to-br from-[#32f08c]/20 to-[#7bb8ff]/20 backdrop-blur-md border border-[#32f08c]/40 rounded-2xl p-6 text-center"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ delay: 1.2, duration: 0.5, type: 'spring' }}
                      viewport={{ once: true }}
                      animate={{
                        boxShadow: [
                          '0 0 20px rgba(50, 240, 140, 0.3)',
                          '0 0 40px rgba(50, 240, 140, 0.5)',
                          '0 0 20px rgba(50, 240, 140, 0.3)',
                        ],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <CheckCircle className="w-8 h-8 text-[#32f08c] mx-auto mb-2" />
                      <div className="text-sm text-white/60 mb-2">Verified PIN</div>
                      <div className="text-xl text-white">PIN-234-812345</div>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Animated connection lines */}
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-px h-16 bg-gradient-to-b from-transparent via-[#32f08c]/50 to-transparent"
                    style={{
                      left: `${20 + i * 10}%`,
                      top: '20%',
                    }}
                    animate={{
                      opacity: [0, 1, 0],
                      height: ['0px', '64px', '0px'],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>

              {/* Corner accents */}
              <div className="absolute -top-4 -right-4 w-24 h-24 border-t-2 border-r-2 border-[#bfa5ff] rounded-tr-3xl" />
              <div className="absolute -bottom-4 -left-4 w-24 h-24 border-b-2 border-l-2 border-[#32f08c] rounded-bl-3xl" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}