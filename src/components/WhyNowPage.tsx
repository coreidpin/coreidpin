import { motion } from 'motion/react';
import { Globe, TrendingUp, Scale, Cpu, CheckCircle, ArrowRight } from 'lucide-react';

const whyNowPoints = [
  {
    icon: Globe,
    title: 'Global Phone Penetration',
    description: 'Phone adoption is near-universal in target markets',
    color: '#bfa5ff',
  },
  {
    icon: TrendingUp,
    title: 'Faster Talent Access',
    description: 'Employers need faster, verifiable access to talent',
    color: '#32f08c',
  },
  {
    icon: Scale,
    title: 'Regulatory Compliance',
    description: 'Increasing demand for auditable verification',
    color: '#7bb8ff',
  },
  {
    icon: Cpu,
    title: 'Blockchain Infrastructure',
    description: 'Affordable blockchain anchoring via Polygon',
    color: '#bfa5ff',
  },
];

export function WhyNowPage() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden" style={{ backgroundColor: '#0a0b0d' }}>
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full blur-3xl animate-pulse" style={{ backgroundColor: 'rgba(143, 208, 202, 0.1)' }} />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full blur-3xl animate-pulse" style={{ backgroundColor: 'rgba(143, 208, 202, 0.1)', animationDelay: '1s' }} />
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
            style={{ color: '#8fd0ca' }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
          >
            THE OPPORTUNITY
          </motion.span>
          
          <h2 className="text-6xl md:text-7xl mb-8 text-white">
            Why Now
          </h2>
          
          <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
            The perfect convergence of technology, market readiness, and global demand
          </p>
        </motion.div>

        {/* Why Now Grid */}
        <div className="grid md:grid-cols-2 gap-8 mt-8 md:mt-12 mb-24">
          {whyNowPoints.map((point, index) => {
            const Icon = point.icon;
            return (
              <motion.div
                key={point.title}
                className="group relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div className="relative h-full p-8 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 transition-all duration-300 hover:bg-white/10 hover:border-white/20">
                  {/* Glow effect */}
                  <div
                    className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-300"
                    style={{ backgroundColor: `${point.color}20` }}
                  />
                  
                  <div className="relative">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                      style={{ backgroundColor: `${point.color}20` }}
                    >
                      <Icon className="w-8 h-8" style={{ color: point.color }} />
                    </div>
                    <h3 className="text-2xl mb-4 text-white">{point.title}</h3>
                    <p className="text-white/60 leading-relaxed">{point.description}</p>
                  </div>
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
              <div className="relative p-8 rounded-3xl backdrop-blur-sm border mt-4 md:mt-6" style={{ backgroundColor: '#64748b', borderColor: 'rgba(143, 208, 202, 0.2)' }}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(143, 208, 202, 0.2)' }}>
                    <CheckCircle className="w-6 h-6 text-[#bfa5ff]" />
                  </div>
                  <h4 className="text-2xl text-white">Professional Onboarding</h4>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: 'rgba(143, 208, 202, 0.2)' }}>
                      <span className="text-sm" style={{ color: '#212535' }}>1</span>
                    </div>
                    <div>
                      <p className="text-white/80 mb-2">User enters phone number</p>
                      <div className="inline-block px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm" style={{ color: '#8fd0ca' }}>
                        +234 812 345 6789
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    <ArrowRight className="w-6 h-6 text-white/40" />
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: 'rgba(143, 208, 202, 0.2)' }}>
                      <span className="text-sm" style={{ color: '#8fd0ca' }}>2</span>
                    </div>
                    <div>
                      <p className="text-white/80 mb-2">OTP verification sent</p>
                      <div className="inline-block px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm text-white/60">
                        Enter 6-digit code
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    <ArrowRight className="w-6 h-6 text-white/40" />
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: 'rgba(143, 208, 202, 0.2)' }}>
                      <span className="text-sm" style={{ color: '#8fd0ca' }}>3</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white/80 mb-3">PIN generated & profile created</p>
                      <div className="p-4 rounded-lg border" style={{ backgroundColor: 'rgba(143, 208, 202, 0.1)', borderColor: 'rgba(143, 208, 202, 0.3)' }}>
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-5 h-5" style={{ color: '#8fd0ca' }} />
                          <span style={{ color: '#8fd0ca' }}>Verified</span>
                        </div>
                        <div className="text-sm text-white/60">
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
              <div className="relative p-8 rounded-3xl backdrop-blur-sm border mt-4 md:mt-6" style={{ backgroundImage: 'linear-gradient(to bottom right, rgba(143, 208, 202, 0.1), rgba(143, 208, 202, 0.1))', borderColor: 'rgba(143, 208, 202, 0.2)' }}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(143, 208, 202, 0.2)' }}>
                    <Cpu className="w-6 h-6" style={{ color: '#8fd0ca' }} />
                  </div>
                  <h4 className="text-2xl text-white">Business Integration</h4>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: 'rgba(143, 208, 202, 0.2)' }}>
                      <span className="text-sm" style={{ color: '#8fd0ca' }}>1</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white/80 mb-2">Opay calls PIN API</p>
                      <div className="p-3 rounded-lg border" style={{ backgroundColor: 'rgba(10, 11, 13, 0.5)', borderColor: 'rgba(143, 208, 202, 0.3)' }}>
                        <code className="text-xs text-white/70">
                          POST /api/v1/pin/create
                        </code>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    <ArrowRight className="w-6 h-6 text-white/40" />
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: 'rgba(143, 208, 202, 0.2)' }}>
                      <span className="text-sm" style={{ color: '#8fd0ca' }}>2</span>
                    </div>
                    <div>
                      <p className="text-white/80 mb-2">Customer phone verified</p>
                      <div className="inline-block px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm text-white">
                        +234 803 555 1212
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    <ArrowRight className="w-6 h-6 text-white/40" />
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: 'rgba(143, 208, 202, 0.2)' }}>
                      <span className="text-sm" style={{ color: '#8fd0ca' }}>3</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white/80 mb-3">API response & webhook fired</p>
                      <div className="p-4 rounded-lg border" style={{ backgroundColor: 'rgba(10, 11, 13, 0.5)', borderColor: 'rgba(143, 208, 202, 0.3)' }}>
                        <pre className="text-xs text-white/70 overflow-x-auto">
{`{
  "pin": "PIN-234-8035551212",
  "status": "verified",
  "trust_score": 0.92
}`}
                        </pre>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border text-center" style={{ backgroundColor: 'rgba(143, 208, 202, 0.1)', borderColor: 'rgba(143, 208, 202, 0.3)' }}>
                    <CheckCircle className="w-6 h-6 mx-auto mb-2" style={{ color: '#8fd0ca' }} />
                    <p className="text-sm" style={{ color: '#8fd0ca' }}>Instant KYC Complete</p>
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
