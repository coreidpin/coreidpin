import React from "react";
import { motion } from "motion/react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { PINIdentityCard, generateMockPINData } from "./PINIdentityCard";
import {
  CheckCircle,
  Globe,
  Shield,
  Award,
  ArrowRight,
  Star,
  BadgeCheck,
  Eye,
  FileText,
  Brain,
  Sparkles,
  Target,
  TrendingUp,
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
  Lock,
  Github,
  Linkedin,
  Code,
  Briefcase,
  XCircle,
  CheckCheck
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import TrustBanner from "./TrustBanner";
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
  const handleNavigate = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
    }
  };

  // Mock PIN data for showcase
  const mockPINData = generateMockPINData();

  return (
    <div className="min-h-screen bg-white">
      <Navbar 
        currentPage="landing"
        onNavigate={handleNavigate}
        onLogin={onLogin}
        isAuthenticated={isAuthenticated}
        userType={userType}
      />

      {/* HERO SECTION - Premium Dark (mobile-first) */}
      <section className="relative min-h-[85vh] sm:min-h-screen flex items-center justify-center overflow-hidden" style={{ backgroundColor: '#0a0b0d' }}>
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 opacity-20 sm:opacity-30">
          <div className="absolute top-0 left-1/4 w-[50vw] h-[50vw] sm:w-96 sm:h-96 bg-purple-500/20 rounded-full blur-xl sm:blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute bottom-0 right-1/4 w-[50vw] h-[50vw] sm:w-96 sm:h-96 bg-blue-500/20 rounded-full blur-xl sm:blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] sm:w-96 sm:h-96 bg-emerald-500/10 rounded-full blur-xl sm:blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '2s' }} />
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(191,165,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(191,165,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] sm:bg-[size:64px_64px]" />

        <div className="container mx-auto px-4 py-12 sm:py-20 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Hero Content */}
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center hero-grid">
              {/* Left: Text Content */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center lg:text-left hero-mobile hero-text"
                data-testid="hero-text"
              >
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 sm:mb-6 border border-white/10"
                  style={{ backgroundColor: 'rgba(191, 165, 255, 0.1)' }}
                >
                  <Sparkles className="h-4 w-4" style={{ color: '#bfa5ff' }} />
                  <span className="text-white text-xs sm:text-sm">Introducing PIN</span>
                  <Badge className="ml-1 text-xs" style={{ backgroundColor: '#32f08c', color: '#0a0b0d' }}>New</Badge>
                </motion.div>

                {/* Main Headline */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-5xl sm:text-6xl lg:text-7xl mb-6 text-white leading-tight"
                >
                  Your Global<br />
                  <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
                    Professional Identity
                  </span>
                  <br />Number
                </motion.h1>


                {/* Subheadline */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-[clamp(1rem,3.5vw,1.25rem)] text-gray-300 mb-6 sm:mb-8 max-w-[90vw] sm:max-w-2xl mx-auto lg:mx-0"
                >
                  Own a secure, verifiable, blockchain-backed identity trusted across borders and employers.
                </motion.p>

                {/* CTAs */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8"
                >
                  <Button
                    size="lg"
                    onClick={() => onLogin("professional")}
                    className="text-base sm:text-lg px-5 py-4 sm:px-8 sm:py-6 group min-h-[48px]"
                    style={{ backgroundColor: '#32f08c', color: '#0a0b0d' }}
                  >
                    <Fingerprint className="h-5 w-5 mr-2" />
                    Get Your PIN
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-base sm:text-lg px-5 py-4 sm:px-8 sm:py-6 border-white/20 text-white hover:bg-white/10 min-h-[48px]"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    See How It Works
                  </Button>
                </motion.div>

                {/* Social proof */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs sm:text-sm text-gray-400"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" style={{ color: '#32f08c' }} />
                    <span>Free forever</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" style={{ color: '#7bb8ff' }} />
                    <span>5 min setup</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" style={{ color: '#bfa5ff' }} />
                    <span>Blockchain secured</span>
                  </div>
                </motion.div>
              </motion.div>

              {/* Right: PIN Card Mockup */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="relative max-w-[min(90vw,520px)] mx-auto"
              >
                {/* Glow effect behind card */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 via-blue-500/30 to-emerald-500/30 blur-3xl rounded-3xl" />
                
                {/* PIN Card */}
                <div className="relative z-10 transform hover:scale-105 transition-transform duration-500">
                  <PINIdentityCard 
                    data={mockPINData} 
                    variant="full"
                    showActions={false}
                  />
                </div>

                {/* Floating stats */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                  className="hidden md:block absolute -left-4 top-1/4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#32f08c' }}>
                      <CheckCheck className="h-5 w-5 text-black" />
                    </div>
                    <div>
                      <div className="text-white text-sm">Verified</div>
                      <div className="text-gray-400 text-xs">AI + Blockchain</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 }}
                  className="hidden md:block absolute -right-4 bottom-1/4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#7bb8ff' }}>
                      <Globe className="h-5 w-5 text-black" />
                    </div>
                    <div>
                      <div className="text-white text-sm">Global</div>
                      <div className="text-gray-400 text-xs">195+ countries</div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <ChevronRight className="h-6 w-6 text-white/40 rotate-90" />
        </motion.div>
      </section>

      {/* Trust & Compliance Banner */}
      <section>
        <TrustBanner />
      </section>

      {/* WHAT IS PIN - Light Section */}
      <section className="py-24 px-4 bg-white">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 px-4 py-2" style={{ backgroundColor: '#bfa5ff', color: '#0a0b0d' }}>
              <Fingerprint className="h-4 w-4 mr-2" />
              What is PIN?
            </Badge>
            <h2 className="text-4xl sm:text-5xl mb-6 text-gray-900">
              A Passport for Your Career
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
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
                <Card className={`p-6 h-full border-2 hover:shadow-2xl transition-all duration-300 bg-gradient-to-br ${feature.gradient}`}>
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${feature.color}20` }}
                  >
                    <feature.icon className="h-7 w-7" style={{ color: feature.color }} />
                  </div>
                  <h3 className="text-lg mb-2 text-gray-900">{feature.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
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
              Get verified and start matching with global opportunities in minutes
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-5 gap-6">
            {[
              {
                step: "01",
                icon: Users,
                title: "Create Your Profile",
                description: "Sign up and add your basic professional information",
                color: "#7bb8ff"
              },
              {
                step: "02",
                icon: LinkIcon,
                title: "Connect Accounts",
                description: "Link LinkedIn, GitHub, portfolio, or upload resume",
                color: "#bfa5ff"
              },
              {
                step: "03",
                icon: Brain,
                title: "AI Analyzes",
                description: "Our AI verifies your skills and experience automatically",
                color: "#32f08c"
              },
              {
                step: "04",
                icon: ShieldCheck,
                title: "Blockchain Records",
                description: "Your verified identity is secured on the blockchain",
                color: "#7bb8ff"
              },
              {
                step: "05",
                icon: Share2,
                title: "Share Globally",
                description: "Use your PIN to apply for jobs worldwide instantly",
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

      {/* PIN VS PORTFOLIO VS CV - Light Comparison Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl mb-6 text-gray-900">
              PIN vs Traditional Methods
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See why PIN is the superior choice for modern professionals
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="overflow-hidden rounded-2xl border-2 shadow-2xl"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-600 to-purple-600">
                  <tr>
                    <th className="text-left p-6 text-white text-lg">Feature</th>
                    <th className="text-center p-6 text-white text-lg">
                      <div className="flex items-center justify-center gap-2">
                        <Fingerprint className="h-5 w-5" />
                        PIN
                      </div>
                    </th>
                    <th className="text-center p-6 text-white/70 text-lg">Portfolio</th>
                    <th className="text-center p-6 text-white/70 text-lg">CV/Resume</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {[
                    { feature: "Verified Identity", pin: true, portfolio: false, cv: false },
                    { feature: "Blockchain Secured", pin: true, portfolio: false, cv: false },
                    { feature: "AI-Powered Analysis", pin: true, portfolio: false, cv: false },
                    { feature: "Global Recognition", pin: true, portfolio: false, cv: false },
                    { feature: "One-Click Sharing", pin: true, portfolio: true, cv: false },
                    { feature: "Real-time Updates", pin: true, portfolio: true, cv: false },
                    { feature: "Employer Trust Score", pin: true, portfolio: false, cv: false },
                    { feature: "Automatic Compliance", pin: true, portfolio: false, cv: false }
                  ].map((row, index) => (
                    <tr key={row.feature} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="p-4 text-gray-900 border-b border-gray-200">{row.feature}</td>
                      <td className="p-4 text-center border-b border-gray-200">
                        {row.pin ? (
                          <CheckCircle className="h-6 w-6 mx-auto" style={{ color: '#32f08c' }} />
                        ) : (
                          <XCircle className="h-6 w-6 text-gray-300 mx-auto" />
                        )}
                      </td>
                      <td className="p-4 text-center border-b border-gray-200">
                        {row.portfolio ? (
                          <CheckCircle className="h-6 w-6 text-gray-400 mx-auto" />
                        ) : (
                          <XCircle className="h-6 w-6 text-gray-300 mx-auto" />
                        )}
                      </td>
                      <td className="p-4 text-center border-b border-gray-200">
                        {row.cv ? (
                          <CheckCircle className="h-6 w-6 text-gray-400 mx-auto" />
                        ) : (
                          <XCircle className="h-6 w-6 text-gray-300 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Button
              size="lg"
              onClick={() => onLogin("professional")}
              className="text-lg px-8 py-6"
              style={{ backgroundColor: '#32f08c', color: '#0a0b0d' }}
            >
              Start Your PIN Journey
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </motion.div>
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
                name: "Sarah Chen",
                role: "Senior Developer",
                company: "TechCorp",
                avatar: "sarah-chen",
                quote: "PIN helped me land my dream remote job in under a week. The verification process gave employers instant confidence in my skills.",
                rating: 5
              },
              {
                name: "David Okonkwo",
                role: "Product Designer",
                company: "DesignHub",
                avatar: "david-okonkwo",
                quote: "As a Nigerian professional, PIN opened doors to global opportunities I never thought possible. True game-changer.",
                rating: 5
              },
              {
                name: "Maria Garcia",
                role: "Data Scientist",
                company: "DataFlow",
                avatar: "maria-garcia",
                quote: "The blockchain verification means I don't have to prove myself repeatedly. One PIN, unlimited opportunities.",
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
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
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
                      <div className="text-sm text-gray-400">{testimonial.role} at {testimonial.company}</div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* GLOBAL EMPLOYER TRUST - Light Section with Map */}
      <section className="py-24 px-4 bg-white">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl mb-6 text-gray-900">
              Trusted by Global Employers
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Leading companies worldwide use PIN to discover and hire verified talent
            </p>
          </motion.div>

          {/* Company logos (prefers local brand assets; falls back to icons) */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-16">
            {[
              { name: 'Paystack', logo: '/logos/Paystack_idSL4BuSLF_1.png', url: 'https://paystack.com' },
              { name: 'Microsoft', logo: '/logos/Microsoft_Logo_512px.png', url: 'https://www.microsoft.com' },
              { name: 'AWS', logo: '/logos/Amazon Web Services_idS5TK0MYh_1.png', url: 'https://aws.amazon.com' },
              { name: 'Moniepoint', logo: '/logos/idbS9qZH-q_1762893650692.png', url: 'https://moniepoint.com' },
              { name: 'Stripe', logo: 'https://logo.clearbit.com/stripe.com', url: 'https://stripe.com' },
              { name: '3MTT', logo: '/logos/Group-5.png', url: 'https://3mtt.nitda.gov.ng' },
              { name: 'Google', logo: 'https://logo.clearbit.com/google.com', url: 'https://www.google.com' },
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
                  className="p-6 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-lg transition-all w-full flex items-center justify-center"
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
                <Card className="p-6 text-center border-2 hover:shadow-xl transition-all">
                  <div 
                    className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{ backgroundColor: `${stat.color}20` }}
                  >
                    <stat.icon className="h-6 w-6" style={{ color: stat.color }} />
                  </div>
                  <div className="text-4xl mb-2 text-gray-900">{stat.number}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
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
                name: "Basic",
                price: "Free",
                period: "forever",
                description: "Perfect for getting started",
                features: [
                  "Create your PIN",
                  "Basic verification",
                  "Profile page",
                  "Apply to unlimited jobs",
                  "Community support"
                ],
                cta: "Get Started",
                highlighted: false
              },
              {
                name: "Professional",
                price: "$9",
                period: "per month",
                description: "For serious career builders",
                features: [
                  "Everything in Basic",
                  "Priority verification",
                  "Advanced analytics",
                  "Featured profile",
                  "Direct employer messaging",
                  "Priority support"
                ],
                cta: "Start Free Trial",
                highlighted: true
              },
              {
                name: "Enterprise",
                price: "Custom",
                period: "contact us",
                description: "For teams and organizations",
                features: [
                  "Everything in Professional",
                  "Team management",
                  "Custom branding",
                  "API access",
                  "Dedicated success manager",
                  "Custom integrations"
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
                  <Button
                    className="w-full"
                    variant={plan.highlighted ? "default" : "outline"}
                    style={plan.highlighted ? { backgroundColor: '#32f08c', color: '#0a0b0d' } : {}}
                    onClick={() => onLogin("professional")}
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
                onClick={() => onLogin("professional")}
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
    </div>
  );
}
