import React from 'react';
import { motion } from 'motion/react';
import { Shield, Users, Building, GraduationCap, Globe, Fingerprint, ShieldCheck } from 'lucide-react';

type Metric = {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
};

interface TrustBannerProps {
  title?: string;
  description?: string;
  metrics?: Metric[];
  className?: string;
}

const defaultMetrics: Metric[] = [
  { label: 'Active PIN Identities', value: '128,400+', icon: Fingerprint, color: '#32f08c' },
  { label: 'Connected Companies', value: '3,200+', icon: Building, color: '#bfa5ff' },
  { label: 'Instant Verifications Processed', value: '2.8M+', icon: ShieldCheck, color: '#7bb8ff' },
  { label: 'Countries with PIN Coverage', value: '60+', icon: Globe, color: '#7bb8ff' },
];

export function TrustBanner({
  title = 'Global Professional Identity Network',
  description = 'Unlock a trusted, universal identity layer powered by PIN — enabling professionals, employers, and platforms to verify and connect instantly across borders.',
  metrics = defaultMetrics,
  className = '',
}: TrustBannerProps) {
  return (
    <div className={`relative border-t border-white/10 mt-4 md:mt-6 ${className}`} style={{ backgroundColor: '#0a0b0d' }}>
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute -top-12 -left-12 w-64 h-64 rounded-full blur-3xl"
          style={{ backgroundColor: 'rgba(191,165,255,0.08)' }}
          animate={{ opacity: [0.25, 0.45, 0.25], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-16 -right-16 w-72 h-72 rounded-full blur-3xl"
          style={{ backgroundColor: 'rgba(50,240,140,0.08)' }}
          animate={{ opacity: [0.2, 0.4, 0.2], scale: [1.1, 1, 1.1] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        />
      </div>

      <div className="relative container mx-auto px-4 pt-12 pb-16">
        <div className="text-center space-y-4 mt-4 md:mt-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Shield className="h-6 w-6" style={{ color: '#7bb8ff' }} />
            <h3 className="text-2xl sm:text-3xl font-semibold text-white">{title}</h3>
          </div>
          <p className="max-w-3xl mx-auto text-sm sm:text-base text-white/70">
            {description}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12 md:mt-16">
          {metrics.map((metric) => (
            <motion.div
              key={metric.label}
              whileHover={{ y: -3 }}
              className="group relative rounded-2xl p-6 bg-white/5 backdrop-blur-sm border border-white/10 transition-all"
            >
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ boxShadow: `0 0 24px ${metric.color}40` }}
              />
              <div className="relative flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${metric.color}20` }}>
                  <metric.icon className="h-6 w-6" style={{ color: metric.color }} />
                </div>
                <div className="text-xs text-white/60">{metric.label}</div>
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                {metric.value}
              </div>
              <div className="mt-3 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <div className="mt-3 flex items-center gap-2 text-xs text-white/50">
                <span>Live updates</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: metric.color }} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TrustBanner;
