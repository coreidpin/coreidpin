import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Building, Globe, Fingerprint, ShieldCheck } from 'lucide-react';
import CountUp from 'react-countup';

type Metric = {
  label: string;
  value: number;
  suffix: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
};

interface TrustBannerProps {
  title?: string;
  description?: string;
  className?: string;
}

const metrics: Metric[] = [
  { label: 'Active PIN Identities', value: 128400, suffix: '+', icon: Fingerprint, color: '#32f08c' },
  { label: 'Connected Companies', value: 3200, suffix: '+', icon: Building, color: '#bfa5ff' },
  { label: 'Instant Verifications', value: 2.8, suffix: 'M+', icon: ShieldCheck, color: '#7bb8ff' },
  { label: 'Countries Covered', value: 60, suffix: '+', icon: Globe, color: '#7bb8ff' },
];

export function TrustBanner({
  title = 'What you see on your dashboard',
  description = 'Unlock a trusted, universal identity layer powered by PIN — enabling professionals, employers, and platforms to verify and connect instantly across borders.',
  className = '',
}: TrustBannerProps) {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <div 
      className={`relative py-24 overflow-hidden ${className}`} 
      style={{ backgroundColor: '#050608' }}
      ref={containerRef}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      {/* Cyber Grid / Glowing Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#bfa5ff]/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-[#32f08c]/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative container mx-auto px-4">
        <div className="text-center max-w-4xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight leading-[1.1]">
              {title}
            </h2>
            <p className="text-lg text-white/60 leading-relaxed font-light">
              {description}
            </p>
          </motion.div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="group relative"
            >
              <div className="h-full rounded-3xl p-8 bg-white/[0.03] backdrop-blur-xl border border-white/10 hover:border-[#32f08c]/30 hover:bg-white/[0.05] transition-all duration-300">
                {/* Decorative glow on hover */}
                <div 
                  className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-500"
                  style={{ backgroundColor: metric.color }}
                />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div 
                      className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:rotate-6 sm:group-hover:scale-110"
                      style={{ backgroundColor: `${metric.color}15`, border: `1px solid ${metric.color}30` }}
                    >
                      <metric.icon className="h-6 w-6" style={{ color: metric.color }} />
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 group-hover:text-white/80 transition-colors">
                      {metric.label}
                    </div>
                  </div>

                  <div className="text-5xl font-bold text-white tracking-tighter tabular-nums flex items-baseline gap-1">
                    {isInView ? (
                      <CountUp
                        end={metric.value}
                        decimals={metric.value % 1 !== 0 ? 1 : 0}
                        duration={2.5}
                        separator=","
                      />
                    ) : (
                      <span>0</span>
                    )}
                    <span className="text-[#32f08c] font-medium">{metric.suffix}</span>
                  </div>

                  <div className="mt-10 flex items-center gap-2.5">
                    <div className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: metric.color }}></span>
                      <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: metric.color }}></span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40 group-hover:text-white/60 transition-colors">
                      Live Network Active
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Bottom accent grid line */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}

export default TrustBanner;
