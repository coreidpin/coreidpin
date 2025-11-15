import { motion } from 'motion/react';
import { Shield, Zap, CheckCircle, Users } from 'lucide-react';

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
    <section className="relative py-24 md:py-32 overflow-hidden" style={{ backgroundColor: '#0a0b0d' }}>
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
            className="-mt-2 md:-mt-4"
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
            className="relative mt-8 lg:mt-0 lg:ml-16 xl:ml-24"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="relative">
              {/* Main visual container */}
              <div className="relative aspect-square rounded-3xl overflow-hidden backdrop-blur-sm border border-white/10 p-12 pt-12 md:pt-16" style={{ backgroundImage: 'linear-gradient(to bottom right, rgba(143, 208, 202, 0.1), rgba(143, 208, 202, 0.1))' }}>
                {/* Phone number transformation visual */}
                <motion.div
                  className="flex flex-col sm:flex-row items-center justify-center gap-6 px-4 mx-auto lg:absolute lg:inset-0 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:place-items-center"
                  initial={{ scale: 0.75, opacity: 0 }}
                  whileInView={{ scale: 0.9, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  {/* Phone number */}
                  <div className="relative">
                    <motion.div
                      className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center w-56 sm:w-64 lg:w-56 xl:w-64"
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

                  {/* Arrow (inline, centered between cards) */}
                  <motion.div
                    className="hidden lg:block my-auto"
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
                  <div className="relative">
                    <motion.div
                      className="backdrop-blur-md rounded-2xl p-6 text-center w-56 sm:w-64 lg:w-56 xl:w-64"
                      style={{ backgroundImage: 'linear-gradient(to bottom right, rgba(143, 208, 202, 0.1), rgba(143, 208, 202, 0.1))', borderColor: 'rgba(143, 208, 202, 0.4)', borderStyle: 'solid', borderWidth: '1px' }}
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      animate={{
                        boxShadow: [
                          '0 0 20px rgba(50, 240, 140, 0.3)',
                          '0 0 40px rgba(50, 240, 140, 0.5)',
                          '0 0 20px rgba(50, 240, 140, 0.3)',
                        ],
                      }}
                      transition={{
                        scale: { delay: 1.2, duration: 0.5, type: 'spring' },
                        boxShadow: { duration: 2, repeat: Infinity },
                      }}
                    >
                      <CheckCircle className="w-8 h-8 mx-auto mb-2" style={{ color: '#8fd0ca' }} />
                      <div className="text-sm text-white/60 mb-2">Verified PIN</div>
                      <div className="text-xl text-white">PIN-234-812345</div>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Animated connection lines */}
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-px h-16"
                    style={{
                      left: `${20 + i * 10}%`,
                      top: '20%',
                      backgroundImage: 'linear-gradient(to bottom, rgba(143, 208, 202, 0), rgba(143, 208, 202, 0.5), rgba(143, 208, 202, 0))',
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
              <div className="absolute -top-4 -right-4 w-24 h-24 border-t-2 border-r-2 rounded-tr-3xl" style={{ borderColor: '#8fd0ca' }} />
              <div className="absolute -bottom-4 -left-4 w-24 h-24 border-b-2 border-l-2 rounded-bl-3xl" style={{ borderColor: '#8fd0ca' }} />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
