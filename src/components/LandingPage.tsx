import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import CountUp from "react-countup";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import {
  CheckCircle,
  Globe,
  Shield,
  ArrowRight,
  Star,
  Brain,
  Sparkles,
  Fingerprint,
  ShieldCheck,
  Database,
  Share2,
  Zap,
  Clock,
  DollarSign,
  Users,
  ChevronRight,
  Play,
  Link as LinkIcon,
  Briefcase,
  Building,
  CheckCheck,
  Twitter,
  Linkedin,
  Instagram
} from "lucide-react";
import TrustBanner from "./TrustBanner";
import { MissionPage } from "./MissionPage";
import { SolutionPage } from "./SolutionPage";
import { WhyNowPage } from "./WhyNowPage";
import { WhyWeExist } from "./WhyWeExist";
import { WaitlistForm } from "./WaitlistForm";
import { HeroSection } from "./HeroSection";
import "../styles/hero-mobile.css";

interface LandingPageProps {
  onLogin: (
    userType: "employer" | "professional" | "university",
  ) => void;
  onNavigate?: (page: string) => void;
  isAuthenticated?: boolean;
  userType?: string;
}



export function LandingPage({ onLogin, onNavigate, isAuthenticated = false, userType }: LandingPageProps) {
  const [showWaitlist, setShowWaitlist] = React.useState(false);
  const [billingCycle, setBillingCycle] = React.useState<'monthly' | 'yearly'>('monthly');
  
  const handleNavigate = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
    }
  };


  return (
    <div className="min-h-screen" style={{ backgroundColor: '#ffffff' }}>

      <Navbar 
        currentPage="landing"
        onNavigate={handleNavigate}
        onLogin={onLogin}
        isAuthenticated={isAuthenticated}
        userType={userType}
      />

      {/* HERO SECTION - Modern Light */}
      <HeroSection 
        onNavigate={handleNavigate}
        isAuthenticated={isAuthenticated}
        setShowWaitlist={setShowWaitlist}
      />

      {/* Trust & Compliance Banner */}
      <section>
        <TrustBanner />
      </section>

      {/* Why We Exist - Problem Statement */}
      <WhyWeExist />

      <MissionPage />

      {/* Solution Page - Technical Implementation */}
      <SolutionPage />

      {/* Why Now Page - Market Timing */}
      <WhyNowPage />

      {/* WHAT IS PIN - Dark Section */}
      <section className="py-24 px-4" style={{ backgroundColor: '#0a0b0d' }}>
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 px-4 py-2 bg-[#bfa5ff] text-[#0a0b0d] border-0">
              <Fingerprint className="h-4 w-4 mr-2" />
              What is PIN?
            </Badge>
            <h2 className="text-4xl sm:text-5xl mb-6 text-white">
              A Verified Global PIN for Your Career
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              PIN transforms your professional experience into a globally recognized, Verified Global PIN
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Fingerprint,
                title: "Verified Identity",
                description: "Enterprise-grade verification of professional credentials, work history, and identity markers.",
                color: "#7bb8ff",
                gradient: "from-blue-500/10 to-blue-500/5"
              },
              {
                icon: Database,
                title: "Blockchain-Backed",
                description: "Decentralized, immutable ledger ensuring tamper-proof records and cryptographic authenticity.",
                color: "#bfa5ff",
                gradient: "from-purple-500/10 to-purple-500/5"
              },
              {
                icon: Globe,
                title: "Global Recognition",
                description: "A universal trust layer accepted by leading institutions across 195+ countries.",
                color: "#32f08c",
                gradient: "from-emerald-500/10 to-emerald-500/5"
              },
              {
                icon: Share2,
                title: "AI Skill Verification",
                description: "Algorithmic validation of technical contributions and professional competencies.",
                color: "#7bb8ff",
                gradient: "from-blue-500/10 to-blue-500/5"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
              >
                <Card className="p-6 h-full bg-white/5 backdrop-blur-xl border-white/10 hover:shadow-2xl transition-all duration-300">
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${feature.color}20` }}
                  >
                    <feature.icon className="h-7 w-7" style={{ color: feature.color }} />
                  </div>
                  <h3 className="text-lg mb-2 text-white">{feature.title}</h3>
                  <p className="text-sm text-white/80 leading-relaxed">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW PIN WORKS - Dark Section */}
      <section className="py-24 px-4 relative overflow-hidden" style={{ backgroundColor: '#0a0b0d' }}>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(191,165,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(191,165,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px]" />
        
        <div className="container mx-auto max-w-7xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 px-4 py-2 bg-white/10 text-white border-white/20">
              <Zap className="h-4 w-4 mr-2" />
              Simple Process
            </Badge>
            <h2 className="text-4xl sm:text-5xl mb-6 text-white">
              How PIN Works
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Get verified and start connecting with trusted opportunities in minutes
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-5 gap-6">
            {[
              {
                step: "01",
                icon: Users,
                title: "Create Your Profile",
                description: "Initiate your professional identity layer with basic organizational or individual credentials.",
                color: "#7bb8ff"
              },
              {
                step: "02",
                icon: LinkIcon,
                title: "Connect Your Systems",
                description: "Seamlessly integrate with existing ERP, HRIS, and professional toolsets via the PIN API.",
                color: "#bfa5ff"
              },
              {
                step: "03",
                icon: Brain,
                title: "AI Review & Protocol",
                description: "Automated cross-referencing of data points to generate a high-fidelity, verified trust score.",
                color: "#32f08c"
              },
              {
                step: "04",
                icon: ShieldCheck,
                title: "Immutable Ledger",
                description: "Verification outcomes are cryptographically signed and stored on a tamper-proof blockchain.",
                color: "#7bb8ff"
              },
              {
                step: "05",
                icon: Share2,
                title: "Global Distribution",
                description: "Deploy your verified PIN across any partner platform, employer, or jurisdiction instantly.",
                color: "#bfa5ff"
              }
            ].map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <Card className="bg-white/5 backdrop-blur-xl border-white/10 p-6 h-full hover:bg-white/10 transition-all duration-300">
                  <div className="text-6xl opacity-10 absolute top-4 right-4" style={{ color: step.color }}>
                    {step.step}
                  </div>
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${step.color}20` }}
                  >
                    <step.icon className="h-6 w-6" style={{ color: step.color }} />
                  </div>
                  <h3 className="text-base mb-2 text-white">{step.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{step.description}</p>
                </Card>

                {/* Connector line */}
                {index < 4 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-white/20 to-transparent" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS - Dark Section */}
      <section className="py-24 px-4" style={{ backgroundColor: '#0a0b0d' }}>
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl mb-6 text-white">
              Why Professionals Love Their Verified PIN
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Join thousands of verified professionals building their global careers with a Verified Global PIN
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Ijeoma A.",
                role: "Product Manager",
                company: "",
                avatar: "ijeoma-a",
                quote: "I no longer fill forms over and over. My PIN handles sign-ins, verification and access across every platform I use. It feels like a digital passport for my career.",
                rating: 5
              },
              {
                name: "CTO",
                role: "CTO",
                company: "CloudWorks",
                avatar: "cloudworks-cto",
                quote: "The PIN infrastructure solved our identity fragmentation problem. Finally, one ID that works across products, regions, and audits.",
                rating: 5
              },
              {
                name: "HR Compliance Officer",
                role: "HR Compliance Officer",
                company: "GlobalTalent Africa",
                avatar: "globaltalent-africa-hr",
                quote: "PIN aligned perfectly with our compliance needs — KYC, AML, and identity assurance without slowing down hiring.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <Card className="bg-white/5 backdrop-blur-xl border-white/10 p-6 h-full hover:bg-white/10 transition-all duration-300">
                  <div className="flex gap-2 mb-4">
                    <Twitter className="h-5 w-5" style={{ color: '#7bb8ff' }} />
                    <Linkedin className="h-5 w-5" style={{ color: '#bfa5ff' }} />
                    <Twitter className="h-5 w-5 rotate-180" style={{ color: '#32f08c' }} />
                  </div>
                  <p className="text-gray-300 mb-6 italic leading-relaxed">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center gap-3 mt-auto">
                    <Avatar className="h-12 w-12 border-2" style={{ borderColor: '#bfa5ff' }}>
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${testimonial.avatar}`} />
                      <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-white">{testimonial.name}</div>
                      <div className="text-sm text-gray-400">{testimonial.company ? `${testimonial.role} at ${testimonial.company}` : testimonial.role}</div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT YOU SEE ON YOUR DASHBOARD - Dark Section */}
      <section className="py-24 px-4 relative overflow-hidden" style={{ backgroundColor: '#0a0b0d' }}>
        {/* Abstract background ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#bfa5ff] rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#32f08c] rounded-full blur-[120px]" />
        </div>

        <div className="container mx-auto max-w-7xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl mb-6 text-white font-bold">
              Trusted by our global partners
            </h2>
            <p className="text-xl text-white/70 max-w-4xl mx-auto leading-relaxed">
              Leading organizations leverage the PIN protocol to automate cross-border trust, streamline KYC compliance, and unlock verified global opportunities for their workforce.
            </p>
          </motion.div>

          {/* Infinite Logo Marquee */}
          <div className="relative mb-24 before:absolute before:left-0 before:top-0 before:z-10 before:h-full before:w-20 before:bg-gradient-to-r before:from-[#0a0b0d] before:to-transparent after:absolute after:right-0 after:top-0 after:z-10 after:h-full after:w-20 after:bg-gradient-to-l after:from-[#0a0b0d] after:to-transparent">
            <div className="overflow-hidden">
              <div className="animate-marquee flex gap-12 items-center py-4">
                {[
                  { name: 'Paystack', logo: 'https://logo.clearbit.com/paystack.com', url: 'https://paystack.com' },
                  { name: 'Microsoft', logo: 'https://logo.clearbit.com/microsoft.com', url: 'https://www.microsoft.com' },
                  { name: 'AWS', logo: '/logos/Amazon Web Services_idS5TK0MYh_1.png', url: 'https://aws.amazon.com' },
                  { name: 'Moniepoint', logo: '/logos/idbS9qZH-q_1762893650692.png', url: 'https://moniepoint.com' },
                  { name: 'Stripe', logo: 'https://logo.clearbit.com/stripe.com', url: 'https://stripe.com' },
                  { name: '3MTT', logo: '/logos/Group-5.png', url: 'https://3mtt.nitda.gov.ng' },
                  { name: 'Google', logo: '/logos/icons8-google-logo-96.png', url: 'https://www.google.com' },
                  { name: 'LinkedIn', logo: '/logos/LI-Logo.png', url: 'https://www.linkedin.com' },
                  { name: 'Meta', logo: 'https://logo.clearbit.com/meta.com', url: 'https://www.meta.com' },
                  { name: 'Shopify', logo: 'https://logo.clearbit.com/shopify.com', url: 'https://www.shopify.com' },
                ].concat([
                  { name: 'Paystack', logo: 'https://logo.clearbit.com/paystack.com', url: 'https://paystack.com' },
                  { name: 'Microsoft', logo: 'https://logo.clearbit.com/microsoft.com', url: 'https://www.microsoft.com' },
                  { name: 'AWS', logo: '/logos/Amazon Web Services_idS5TK0MYh_1.png', url: 'https://aws.amazon.com' },
                  { name: 'Moniepoint', logo: '/logos/idbS9qZH-q_1762893650692.png', url: 'https://moniepoint.com' },
                  { name: 'Stripe', logo: 'https://logo.clearbit.com/stripe.com', url: 'https://stripe.com' },
                  { name: '3MTT', logo: '/logos/Group-5.png', url: 'https://3mtt.nitda.gov.ng' },
                  { name: 'Google', logo: '/logos/icons8-google-logo-96.png', url: 'https://www.google.com' },
                  { name: 'LinkedIn', logo: '/logos/LI-Logo.png', url: 'https://www.linkedin.com' },
                  { name: 'Meta', logo: 'https://logo.clearbit.com/meta.com', url: 'https://www.meta.com' },
                  { name: 'Shopify', logo: 'https://logo.clearbit.com/shopify.com', url: 'https://www.shopify.com' },
                ]).map((company, index) => (
                  <div key={`${company.name}-${index}`} className="flex-shrink-0">
                    <div className="px-8 py-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 hover:border-[#bfa5ff]/50 transition-all flex items-center justify-center group">
                      <img
                        src={company.logo}
                        alt={company.name}
                        className="h-8 sm:h-10 w-auto object-contain opacity-50 group-hover:opacity-100 transition-opacity grayscale group-hover:grayscale-0"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = `https://api.dicebear.com/7.x/identicon/svg?seed=${company.name.toLowerCase()}`;
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stats Grid - Enhanced */}
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { number: 128400, suffix: "+", label: "Active PIN Identities", icon: Fingerprint, color: "#32f08c" },
              { number: 3200, suffix: "+", label: "Connected Companies", icon: Building, color: "#bfa5ff" },
              { number: 2.8, suffix: "M+", label: "Instant Verifications Processed", icon: ShieldCheck, color: "#7bb8ff", decimals: 1 },
              { number: 60, suffix: "+", label: "Countries with PIN Coverage", icon: Globe, color: "#7bb8ff" }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card 
                  className="p-8 border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-xl relative overflow-hidden group h-full"
                  style={{ minHeight: '220px' }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-white/10 transition-colors" />
                  
                  <div 
                    className="w-12 h-12 rounded-xl mb-6 flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${stat.color}20`, border: `1px solid ${stat.color}40` }}
                  >
                    <stat.icon className="h-6 w-6" style={{ color: stat.color }} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>{stat.label}</div>
                    <div className="text-4xl font-bold text-white tabular-nums tracking-tighter">
                      <CountUp
                        end={stat.number}
                        duration={2.5}
                        separator=","
                        decimals={stat.decimals || 0}
                        enableScrollSpy
                        scrollSpyOnce
                      />
                      {stat.suffix}
                    </div>
                  </div>

                  <div className="mt-8 flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full" style={{ backgroundColor: stat.color }}>
                      <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full opacity-75" style={{ backgroundColor: stat.color }}></span>
                    </span>
                    <span 
                      className="text-[10px] uppercase tracking-widest font-bold font-mono"
                      style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                    >
                      Live Sync Active
                    </span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING PREVIEW - Dark Section */}
      <section className="py-24 px-4 relative overflow-hidden" style={{ backgroundColor: '#0a0b0d' }}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(191,165,255,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(50,240,140,0.1),transparent_50%)]" />
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 px-4 py-2 bg-white/10 text-white border-white/20">
              <DollarSign className="h-4 w-4 mr-2" />
              Simple Pricing
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl mb-4 text-white font-bold tracking-tight">
              Choose Your Plan
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-8">
              Start free, upgrade when you need more features
            </p>

            {/* Pricing Toggle */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 mb-10">
              <span className={cn("text-xs sm:text-sm transition-colors", billingCycle === 'monthly' ? "text-white" : "text-gray-500")}>Monthly</span>
              <button 
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                className="relative w-12 h-6 sm:w-14 sm:h-7 rounded-full bg-white/10 border border-white/20 p-1 transition-colors"
                aria-label="Toggle billing cycle"
              >
                <motion.div 
                   animate={{ x: billingCycle === 'monthly' ? 0 : (window.innerWidth < 640 ? 24 : 28) }}
                  className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#32f08c] shadow-[0_0_10px_rgba(50,240,140,0.5)]"
                />
              </button>
              <div className={cn("text-xs sm:text-sm transition-colors flex items-center gap-1.5", billingCycle === 'yearly' ? "text-white" : "text-gray-500")}>
                <span>Yearly</span>
                <Badge className="bg-[#32f08c]/20 text-[#32f08c] border-[#32f08c]/50 text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0 whitespace-nowrap">Save 20%</Badge>
              </div>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Starter",
                price: "Free",
                period: "Forever",
                description: "For individuals establishing a trusted, portable identity",
                features: [
                  "Create & activate your PIN",
                  "Basic phone-number verification",
                  "Identity profile link",
                  "PIN sign-in across supported apps",
                  "Entry-level analytics",
                  "Community support"
                ],
                cta: "Get Started Free",
                highlighted: false
              },
              {
                name: "Professional",
                price: billingCycle === 'monthly' ? "$9" : "$7",
                period: billingCycle === 'monthly' ? "per month" : "per month, billed yearly",
                description: "For professionals who want deeper trust, visibility, and control",
                features: [
                  "Everything in Starter, plus:",
                  "Priority verification engine",
                  "Full analytics dashboard",
                  "Verification triggers",
                  "Monthly activity report",
                  "Trusted ID badge",
                  "Employer visibility",
                  "Priority support"
                ],
                cta: "Upgrade to Pro",
                highlighted: true
              },
              {
                name: "Business",
                price: billingCycle === 'monthly' ? "$20" : "$16",
                period: billingCycle === 'monthly' ? "per seat/month" : "per seat/month, billed yearly",
                description: "For companies integrating PIN authentication & verification",
                features: [
                  "Everything in Professional, plus:",
                  "Verification API access",
                  "PIN Auth for onboarding",
                  "Activity webhooks",
                  "Team dashboard",
                  "Service-level analytics",
                  "Dedicated support"
                ],
                cta: "Contact Sales",
                highlighted: false
              }
            ].map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="relative"
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-black z-20" style={{ backgroundColor: '#32f08c' }}>
                    Most Popular
                  </div>
                )}
                <Card className={cn(
                  "p-6 sm:p-8 h-full transition-all duration-300 relative overflow-hidden",
                  plan.highlighted ? "border-[#32f08c]/50 bg-white/10 shadow-[0_0_40px_rgba(50,240,140,0.1)]" : "border-white/10 bg-white/5"
                )}>
                  {plan.highlighted && (
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#32f08c]/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                  )}
                  
                  <div className="text-center mb-8">
                    <h3 className="text-xl sm:text-2xl text-white font-bold mb-2">{plan.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-400 mb-6">{plan.description}</p>
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl sm:text-5xl font-bold text-white tracking-tighter">{plan.price}</span>
                      {plan.price !== "Free" && (
                        <span className="text-gray-500 ml-2 text-xs sm:text-sm">{plan.period}</span>
                      )}
                    </div>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-gray-300">
                        <CheckCheck className="h-5 w-5 flex-shrink-0 text-[#32f08c]" />
                        <span className="text-sm leading-tight">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={cn(
                      "w-full h-12 text-sm font-bold uppercase tracking-wider transition-all",
                      plan.highlighted 
                        ? "bg-[#32f08c] text-black hover:bg-[#28d97a] hover:scale-[1.02] shadow-lg shadow-[#32f08c]/20" 
                        : "bg-white/10 text-white hover:bg-white/20 border-white/10"
                    )}
                    onClick={() => setShowWaitlist(true)}
                  >
                    {plan.cta}
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA - High Intensity Section */}
      <section className="py-32 px-4 relative overflow-hidden" style={{ backgroundColor: '#0A0B0D' }}>
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 opacity-30 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-blue-600 via-purple-600 to-emerald-500 rounded-full blur-[120px] animate-pulse" />
        </div>

        <div className="container mx-auto max-w-5xl relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center space-y-8"
          >
            <Badge 
              className="px-4 py-1.5 border-0 text-xs font-bold uppercase tracking-widest"
              style={{ backgroundColor: 'rgba(50, 240, 140, 0.1)', color: '#32f08c' }}
            >
              Join the movement
            </Badge>
            
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.1] tracking-tighter" style={{ color: '#ffffff' }}>
              Ready to Claim Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#32f08c] to-[#7bb8ff]">Verified Global PIN?</span>
            </h2>
            
            <p 
              className="text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed"
              style={{ color: 'rgba(255, 255, 255, 0.7)' }}
            >
              Join 128,000+ verified professionals unlocking global opportunities with Gidi-PIN.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8 w-full max-w-xl mx-auto">
              <motion.div className="flex-1" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  onClick={() => setShowWaitlist(true)}
                  className="h-16 w-full text-black text-lg font-bold rounded-2xl shadow-[0_0_30px_rgba(50,240,140,0.4)] transition-all group border-0"
                  style={{ backgroundColor: '#32f08c' }}
                >
                  <Fingerprint className="h-6 w-6 mr-3 group-hover:rotate-12 transition-transform" />
                  Create Your PIN — Free
                  <ArrowRight className="h-6 w-6 ml-3 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
              
              <motion.div className="flex-1" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-16 w-full text-lg font-bold rounded-2xl hover:bg-white/10 transition-all"
                  style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#ffffff', backgroundColor: 'transparent' }}
                >
                  Schedule a Demo
                </Button>
              </motion.div>
            </div>
            
            <div 
              className="flex items-center justify-center gap-8 pt-12 text-sm font-medium tracking-wide"
              style={{ color: 'rgba(255, 255, 255, 0.4)' }}
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" style={{ color: '#32f08c' }} />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" style={{ color: '#32f08c' }} />
                Setup in 5 minutes
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer onNavigate={handleNavigate} />
      
      {showWaitlist && (
        <WaitlistForm onClose={() => setShowWaitlist(false)} />
      )}
    </div>
  );
}
