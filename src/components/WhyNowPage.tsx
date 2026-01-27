import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Globe, TrendingUp, Scale, Cpu, CheckCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { colors, spacing, typography, gradients, shadows } from '../styles/designSystem';

const whyNowPoints = [
  {
    icon: Globe,
    title: 'Global Phone Penetration',
    description: 'Phone adoption is near-universal in target markets and others as well',
    color: colors.brand.primary[300],
  },
  {
    icon: TrendingUp,
    title: 'Faster Talent Access',
    description: 'Employers need faster, verifiable access to talent',
    color: colors.brand.secondary[500],
  },
  {
    icon: Scale,
    title: 'Regulatory Compliance',
    description: 'Increasing demand for auditable verification',
    color: colors.brand.accent[400],
  },
  {
    icon: Cpu,
    title: 'Blockchain Infrastructure',
    description: 'Affordable blockchain anchoring via Polygon',
    color: colors.brand.primary[300],
  },
];

export function WhyNowPage() {
  return (
    <section className="relative py-16 sm:py-24 overflow-hidden" style={{ backgroundColor: colors.black }}>
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full blur-3xl animate-pulse" style={{ backgroundColor: `${colors.brand.secondary[500]}1a` }} />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full blur-3xl animate-pulse" style={{ backgroundColor: `${colors.brand.secondary[500]}1a`, animationDelay: '1s' }} />
        </div>
      </div>

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
            className="inline-block tracking-[0.2em] text-sm mb-6"
            style={{ color: colors.brand.secondary[300] }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
          >
            THE OPPORTUNITY
          </motion.span>
          
          <h2 className="text-6xl md:text-7xl mb-8 text-white font-bold">
            Why Now
          </h2>
          
          <p className="text-xl text-white max-w-3xl mx-auto leading-relaxed opacity-90">
            The perfect convergence of technology, market readiness, and global demand
          </p>
        </motion.div>

        {/* Why Now Grid */}
        <div className="grid md:grid-cols-2 gap-8 mt-8 md:mt-12 mb-24">
          {whyNowPoints.map((point, index) => {
            const Icon = point.icon;

            // 3D tilt interaction
            const x = useMotionValue(0);
            const y = useMotionValue(0);
            const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [10, -10]), { damping: 25, stiffness: 200 });
            const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-10, 10]), { damping: 25, stiffness: 200 });

            const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
              const rect = event.currentTarget.getBoundingClientRect();
              x.set((event.clientX - rect.left) / rect.width - 0.5);
              y.set((event.clientY - rect.top) / rect.height - 0.5);
            };

            const handleMouseLeave = () => {
              x.set(0);
              y.set(0);
            };

            return (
              <motion.div
                key={point.title}
                className="group relative perspective-1000"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
              >
                <div className="relative h-full p-8 rounded-3xl bg-neutral-900/40 backdrop-blur-md border border-white/10 transition-all duration-300 group-hover:bg-neutral-900/60 group-hover:border-white/20 shadow-xl overflow-hidden">
                  {/* Premium Sheen */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none"
                    style={{ background: `linear-gradient(135deg, ${point.color} 0%, transparent 60%)` }}
                  />

                  {/* Icon and Content */}
                  <div className="relative" style={{ transform: "translateZ(40px)" }}>
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 relative"
                      style={{ 
                        backgroundColor: `${point.color}15`,
                        border: `1px solid ${point.color}30`
                      }}
                    >
                      <Icon className="w-8 h-8" style={{ color: point.color }} />
                      <div 
                        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
                        style={{ backgroundColor: `${point.color}40` }}
                      />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-white transition-colors">
                      {point.title}
                    </h3>
                    <p className="text-white leading-relaxed group-hover:text-white transition-colors opacity-90 group-hover:opacity-100">
                      {point.description}
                    </p>
                  </div>

                  {/* Background accent */}
                  <div
                    className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700"
                    style={{ backgroundColor: point.color }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Use Cases */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <h3 className="text-4xl text-center mb-16 text-white mt-12 md:mt-16">
            Real Use Cases
          </h3>

          <div className="grid lg:grid-cols-2 gap-12 mt-8 md:mt-12">
            {/* Use Case 1 - Professional Onboarding */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="relative p-8 rounded-3xl backdrop-blur-sm border mt-4 md:mt-6" style={{ backgroundColor: colors.neutral[800], borderColor: `${colors.brand.secondary[500]}33` }}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${colors.brand.secondary[500]}33` }}>
                    <CheckCircle className="w-6 h-6 text-brand-primary-300" />
                  </div>
                  <h4 className="text-2xl text-white">Professional Onboarding</h4>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: colors.brand.secondary[300] }}>
                      <span className="text-sm font-bold" style={{ color: colors.black }}>1</span>
                    </div>
                    <div>
                      <p className="text-white font-semibold mb-2">User enters phone number</p>
                      <div className="inline-block px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm font-bold" style={{ color: colors.brand.secondary[400] }}>
                        +234 812 345 6789
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    <ArrowRight className="w-6 h-6 text-white/60 rotate-90 md:rotate-0 transition-transform" />
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: colors.brand.secondary[300] }}>
                      <span className="text-sm font-bold" style={{ color: colors.black }}>2</span>
                    </div>
                    <div>
                      <p className="text-white font-semibold mb-2">OTP verification sent</p>
                      <div className="inline-block px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm text-white font-medium">
                        Enter 6-digit code
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    <ArrowRight className="w-6 h-6 text-white/60 rotate-90 md:rotate-0 transition-transform" />
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: colors.brand.secondary[300] }}>
                      <span className="text-sm font-bold" style={{ color: colors.black }}>3</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-semibold mb-3">PIN generated & profile created</p>
                      <div className="p-4 rounded-lg border shadow-xl" style={{ backgroundColor: `${colors.brand.secondary[500]}26`, borderColor: `${colors.brand.secondary[500]}66` }}>
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-5 h-5" style={{ color: colors.brand.secondary[300] }} />
                          <span className="font-bold" style={{ color: colors.brand.secondary[300] }}>Verified</span>
                        </div>
                        <div className="text-sm text-white/90 font-mono">
                          PIN-234-8123456789
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Use Case 2 - Business Integration */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="relative p-8 rounded-3xl backdrop-blur-sm border mt-4 md:mt-6" style={{ backgroundImage: `linear-gradient(to bottom right, ${colors.brand.secondary[500]}1a, ${colors.brand.secondary[500]}1a)`, borderColor: `${colors.brand.secondary[500]}33` }}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${colors.brand.secondary[500]}33` }}>
                    <Cpu className="w-6 h-6" style={{ color: colors.brand.secondary[300] }} />
                  </div>
                  <h4 className="text-2xl text-white">Business Integration</h4>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: colors.brand.secondary[300] }}>
                      <span className="text-sm font-bold" style={{ color: colors.black }}>1</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-semibold mb-2">Opay calls PIN API</p>
                      <div className="p-3 rounded-lg border shadow-lg" style={{ backgroundColor: `${colors.black}b3`, borderColor: `${colors.brand.secondary[500]}66` }}>
                        <code className="text-xs text-white font-mono">
                          POST /api/v1/pin/create
                        </code>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    <ArrowRight className="w-6 h-6 text-white/60 rotate-90 md:rotate-0 transition-transform" />
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: colors.brand.secondary[300] }}>
                      <span className="text-sm font-bold" style={{ color: colors.black }}>2</span>
                    </div>
                    <div>
                      <p className="text-white font-semibold mb-2">Customer phone verified</p>
                      <div className="inline-block px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm text-white font-bold">
                        +234 803 555 1212
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    <ArrowRight className="w-6 h-6 text-white/60 rotate-90 md:rotate-0 transition-transform" />
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: colors.brand.secondary[300] }}>
                      <span className="text-sm font-bold" style={{ color: colors.black }}>3</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-semibold mb-3">API response & webhook fired</p>
                      <div className="p-4 rounded-lg border shadow-lg" style={{ backgroundColor: `${colors.black}b3`, borderColor: `${colors.brand.secondary[500]}66` }}>
                        <pre className="text-xs text-white font-mono overflow-x-auto">
{`{
  "pin": "PIN-234-8035551212",
  "status": "verified",
  "trust_score": 0.92
}`}
                        </pre>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border text-center shadow-xl" style={{ backgroundColor: `${colors.brand.secondary[500]}26`, borderColor: `${colors.brand.secondary[500]}66` }}>
                    <CheckCircle className="w-6 h-6 mx-auto mb-2" style={{ color: colors.brand.secondary[300] }} />
                    <p className="text-sm font-bold" style={{ color: colors.brand.secondary[300] }}>Instant KYC Complete</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
