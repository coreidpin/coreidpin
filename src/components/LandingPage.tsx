import React from "react";
import { motion } from "motion/react";
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

import { Snowfall, HolidayGiftWidget } from "./ui/christmas-effects";

import { WelcomeModal } from "./WelcomeModal";

export function LandingPage({ onLogin, onNavigate, isAuthenticated = false, userType }: LandingPageProps) {
  const [showWaitlist, setShowWaitlist] = React.useState(false);
  
  const handleNavigate = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
    }
  };


  return (
    <div className="min-h-screen" style={{ backgroundColor: '#ffffff' }}>
      <Snowfall />
      <HolidayGiftWidget />
      <WelcomeModal />
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
              A Passport for Your Career
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              PIN transforms your professional experience into a globally recognized, verified digital identity
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Fingerprint,
                title: "Verified Identity",
                description: "AI-powered verification of your skills, experience, and credentials",
                color: "#7bb8ff",
                gradient: "from-blue-500/10 to-blue-500/5"
              },
              {
                icon: Database,
                title: "Blockchain-Backed",
                description: "Immutable, tamper-proof records secured by blockchain technology",
                color: "#bfa5ff",
                gradient: "from-purple-500/10 to-purple-500/5"
              },
              {
                icon: Globe,
                title: "Global Recognition",
                description: "Accepted by employers worldwide across 195+ countries",
                color: "#32f08c",
                gradient: "from-emerald-500/10 to-emerald-500/5"
              },
              {
                icon: Share2,
                title: "AI Skill Verification",
                description: "Machine learning analyzes your work to certify real competencies",
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
                  <p className="text-sm text-white/70 leading-relaxed">{feature.description}</p>
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
                description: "Add your basic professional or business information to get started.",
                color: "#7bb8ff"
              },
              {
                step: "02",
                icon: LinkIcon,
                title: "Connect Your Systems",
                description: "Securely link the tools you already use — HR systems, project tools, or professional accounts.",
                color: "#bfa5ff"
              },
              {
                step: "03",
                icon: Brain,
                title: "AI Reviews & Verifies",
                description: "Our System checks your experience, activities, and contributions to validate your professional identity automatically.",
                color: "#32f08c"
              },
              {
                step: "04",
                icon: ShieldCheck,
                title: "Secure Blockchain Record",
                description: "Your verified identity is stored safely on the blockchain for authenticity and tamper-proof trust.",
                color: "#7bb8ff"
              },
              {
                step: "05",
                icon: Share2,
                title: "Share & Use Globally",
                description: "Use your PIN for seamless verification with employers, partners, or clients worldwide.",
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
              Why Professionals Love PIN
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Join thousands of verified professionals building their global careers
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
                    <Instagram className="h-5 w-5" style={{ color: '#32f08c' }} />
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

      {/* GLOBAL EMPLOYER TRUST - Dark Section with Map */}
      <section className="py-24 px-4" style={{ backgroundColor: '#ffffff' }}>
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl mb-6 text-black">
              Trusted by Global Employers
            </h2>
            <p className="text-xl text-black max-w-3xl mx-auto">
              Leading companies worldwide use PIN to discover and hire verified talent
            </p>
          </motion.div>

          {/* Company logos (prefers local brand assets; falls back to icons) */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-16">
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
              { name: 'Airbnb', logo: 'https://logo.clearbit.com/airbnb.com', url: 'https://www.airbnb.com' },
              { name: 'Oracle', logo: 'https://logo.clearbit.com/oracle.com', url: 'https://www.oracle.com' },
              { name: 'IBM', logo: 'https://logo.clearbit.com/ibm.com', url: 'https://www.ibm.com' }
            ].map((company, index) => (
              <motion.div
                key={company.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="flex items-center justify-center"
              >
                <a
                  href={company.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${company.name} website`}
                  title={`Visit ${company.name}`}
                  className="p-6 bg-white/5 backdrop-blur-xl border border-[#bfa5ff] rounded-xl hover:shadow-lg transition-all w-full flex items-center justify-center"
                >
                  <img
                    src={company.logo}
                    alt={`${company.name} logo`}
                    title={company.name}
                    loading="lazy"
                    decoding="async"
                    draggable="false"
                    className="h-10 sm:h-12 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
                    sizes="(min-width: 1024px) 16.6vw, (min-width: 768px) 33.3vw, 50vw"
                    onError={(e) => {
                      const fallback = `https://api.dicebear.com/7.x/identicon/svg?seed=${company.name.toLowerCase()}`;
                      if ((e.currentTarget as HTMLImageElement).src !== fallback) {
                        (e.currentTarget as HTMLImageElement).src = fallback;
                      }
                    }}
                  />
                </a>
              </motion.div>
            ))}
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { number: "195+", label: "Countries", icon: Globe, color: "#7bb8ff" },
              { number: "50K+", label: "Verified Professionals", icon: Users, color: "#bfa5ff" },
              { number: "1,200+", label: "Hiring Companies", icon: Briefcase, color: "#32f08c" },
              { number: "99.9%", label: "Verification Accuracy", icon: ShieldCheck, color: "#7bb8ff" }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 text-center bg-white/5 backdrop-blur-xl border-white/10 hover:shadow-xl transition-all">
                  <div 
                    className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{ backgroundColor: `${stat.color}20` }}
                  >
                    <stat.icon className="h-6 w-6" style={{ color: stat.color }} />
                  </div>
                  <div className="text-4xl font-bold mb-2 text-black">{stat.number}</div>
                  <div className="text-sm text-black">{stat.label}</div>
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
            <h2 className="text-4xl sm:text-5xl mb-6 text-white">
              Choose Your Plan
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Start free, upgrade when you need more features
            </p>
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
                  "Entry-level analytics (usage history, last verification)",
                  "Community support"
                ],
                comingSoon: "Multi-service PIN sync",
                cta: "Coming soon",
                highlighted: false
              },
              {
                name: "Professional",
                price: "$9",
                period: "per month",
                description: "For professionals who want deeper trust, visibility, and control",
                features: [
                  "Everything in Starter, plus:",
                  "Priority verification engine",
                  "Full analytics dashboard",
                  "PIN usage insights",
                  "Verification triggers",
                  "Service interactions",
                  "Monthly activity report",
                  "Trusted ID badge for businesses",
                  "Employer & platform visibility",
                  "Instant PIN support"
                ],
                comingSoon: "Verified service connections & cross-app privileges",
                cta: "Coming soon",
                highlighted: true
              },
              {
                name: "Business",
                price: "$20",
                period: "per month (per team / integration)",
                description: "For companies integrating PIN authentication & verification",
                features: [
                  "Everything in Professional, plus:",
                  "Phone-number-based identity verification API",
                  "PIN authentication for onboarding & login",
                  "Activity webhooks (sign-ins, triggers, checks)",
                  "Team dashboard",
                  "Service-level analytics",
                  "Priority integration support"
                ],
                comingSoon: "Risk scoring API & fraud detection",
                cta: "Coming soon",
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
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs text-black" style={{ backgroundColor: '#32f08c' }}>
                    Most Popular
                  </div>
                )}
                <Card className={`p-8 h-full ${plan.highlighted ? 'border-2 bg-white/10' : 'bg-white/5'} backdrop-blur-xl transition-all duration-300`} style={plan.highlighted ? { borderColor: '#32f08c' } : { borderColor: 'rgba(255,255,255,0.1)' }}>
                  <div className="text-center mb-6">
                    <h3 className="text-2xl text-white mb-2">{plan.name}</h3>
                    <p className="text-sm text-gray-400 mb-4">{plan.description}</p>
                    <div className="mb-2">
                      <span className="text-5xl text-white">{plan.price}</span>
                      {plan.period && (
                        <span className="text-gray-400 ml-2">/ {plan.period}</span>
                      )}
                    </div>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-300">
                        <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: '#32f08c' }} />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {plan.comingSoon && (
                    <div className="mb-6">
                      <div className="flex items-center gap-2">
                        <Badge className="px-2 py-1 bg-white/5 text-gray-300 border-white/10">Coming Soon</Badge>
                        <span className="text-xs text-gray-400">{plan.comingSoon}</span>
                      </div>
                    </div>
                  )}
                  <Button
                    className="w-full text-white hover:text-white"
                    variant={plan.highlighted ? "default" : "outline"}
                    style={plan.highlighted ? { backgroundColor: '#32f08c', color: '#0a0b0d' } : {}}
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

      {/* FINAL CTA - Gradient Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-blue-600 via-purple-600 to-emerald-600">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl mb-6 text-white">
              Ready to Own Your<br />Professional Future?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join 50,000+ verified professionals using PIN to unlock global opportunities
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => setShowWaitlist(true)}
                className="text-lg px-8 py-6 bg-white hover:bg-gray-100"
                style={{ color: '#0a0b0d' }}
              >
                <Fingerprint className="h-5 w-5 mr-2" />
                Create Your PIN — Free
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 border-2 border-white text-white hover:bg-white/10"
              >
                Schedule a Demo
              </Button>
            </div>
            <p className="text-sm text-white/70 mt-6">
              ✨ No credit card required • Get verified in 5 minutes
            </p>
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
