import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Building, ShieldCheck, Key, Users, BookOpen, Webhook, Settings, Zap, BarChart3, Shield, LayoutGrid, Sparkles } from 'lucide-react';
import { colors } from '../styles/designSystem';

interface TrustBannerProps {
  title?: string;
  description?: string;
  className?: string;
}

export function TrustBanner({
  title = 'What you see on your dashboard',
  description = 'Powerful, intuitive business console to manage your global workforce identity and verify trust in real-time.',
  className = '',
}: TrustBannerProps) {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const tabs = [
    { icon: LayoutGrid, label: 'Overview', active: true },
    { icon: Key, label: 'API Keys' },
    { icon: Users, label: 'Team' },
    { icon: Shield, label: 'Verify Identity' },
    { icon: BookOpen, label: 'Documentation' },
    { icon: Webhook, label: 'Webhooks' },
    { icon: Settings, label: 'Settings' },
  ];

  return (
    <div 
      className={`relative py-24 sm:py-32 overflow-hidden ${className}`} 
      style={{ backgroundColor: colors.black }}
      ref={containerRef}
    >
      {/* Subtle Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <div className="relative container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight leading-[1.1]">
              {title}
            </h2>
            <p 
              className="text-lg sm:text-xl font-medium leading-relaxed max-w-3xl mx-auto opacity-80 text-center mb-10"
              style={{ color: colors.white }}
            >
              {description}
            </p>
          </motion.div>
        </div>

        {/* Clean, Static Business Console Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-6xl mx-auto rounded-3xl overflow-hidden shadow-2xl bg-white border border-slate-200"
        >
            {/* Console Header */}
            <div className="px-6 py-6 sm:px-8 sm:py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-slate-100 bg-[#f8fafc]">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white flex items-center justify-center text-indigo-600 shadow-sm border border-slate-200/60">
                  <LayoutGrid className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Business Console</h3>
                  <p className="text-slate-500 font-medium text-xs sm:text-sm">Welcome to GidiPIN API</p>
                </div>
              </div>
              <div className="px-4 py-1.5 sm:px-5 sm:py-2 rounded-full bg-white border border-indigo-100 text-indigo-600 font-bold text-[10px] sm:text-xs tracking-widest uppercase shadow-sm self-start sm:self-auto">
                FREE Tier
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="p-6 sm:p-10 bg-white">
              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 sm:mb-10">
                {[
                  { icon: Zap, label: 'Monthly Quota', value: '1,000', color: 'text-indigo-600', bg: 'bg-indigo-50' },
                  { icon: BarChart3, label: 'This Month', value: '0 requests', color: 'text-slate-600', bg: 'bg-slate-50' },
                  { icon: Sparkles, label: 'Status', value: 'Active', color: 'text-emerald-600', bg: 'bg-emerald-50', isStatus: true },
                ].map((metric) => (
                  <div key={metric.label} className="group p-5 sm:p-6 rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all duration-300 bg-white">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${metric.bg} flex items-center justify-center ${metric.color} flex-shrink-0`}>
                        <metric.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div>
                        <div className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">{metric.label}</div>
                        <div className={`text-xl sm:text-2xl font-bold tracking-tight ${metric.isStatus ? metric.color : 'text-slate-900'}`}>{metric.value}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation Tabs */}
              <div className="border-t border-slate-100 pt-6 sm:pt-8">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Left Nav Group - Hidden on mobile */}
                  <div className="hidden sm:flex items-center gap-8 pl-2 border-r border-slate-100 pr-8">
                    <div className="flex items-center gap-2 text-slate-900 group cursor-pointer opacity-40 hover:opacity-100 transition-opacity">
                      <Building className="w-5 h-5" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Home</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-900 group cursor-pointer opacity-40 hover:opacity-100 transition-opacity">
                      <Users className="w-5 h-5" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Team</span>
                    </div>
                  </div>

                  {/* Feature Tabs - Scrollable on mobile */}
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 sm:pb-0 -mx-6 px-6 sm:mx-0 sm:px-0">
                    {tabs.map((tab) => (
                      <div 
                        key={tab.label}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                          tab.active 
                            ? 'bg-white text-slate-900 shadow-sm border border-slate-200 ring-1 ring-slate-100' 
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        {tab.label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
        </motion.div>
      </div>
    </div>
  );
}

export default TrustBanner;
