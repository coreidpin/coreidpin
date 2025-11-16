import React from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Logo } from './Logo';
import { 
  Shield, 
  Mail, 
  Phone, 
  MessageCircle, 
  Globe, 
  CheckCircle,
  Award,
  Lock,
  Users,
  Building,
  GraduationCap,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  CreditCard,
  Sparkles,
  ArrowRight,
  FileText,
  BookOpen,
  Briefcase,
  UserCheck,
  School,
  Zap,
  Target,
  TrendingUp
} from 'lucide-react';

interface FooterProps {
  onNavigate?: (page: string) => void;
}

// PIN-focused trust metrics with brand colors
const pinMetrics = [
  { label: 'Verified PINs', value: '50K+', icon: CreditCard, color: '#7bb8ff' },
  { label: 'Global Employers', value: '2.5K+', icon: Building, color: '#32f08c' },
  { label: 'Partner Institutions', value: '150+', icon: GraduationCap, color: '#bfa5ff' },
  { label: 'Countries Active', value: '45+', icon: Globe, color: '#7bb8ff' }
];

// Navigation sections with cleaner structure
const navSections = [
  {
    title: 'Product',
    links: [
      { name: 'How It Works', href: '/how-it-works' },
      { name: 'Get Your PIN', href: '/get-pin' },
      { name: 'Verify PIN', href: '/verify' },
      { name: 'Pricing', href: '/pricing' }
    ]
  },
  {
    title: 'For Users',
    links: [
      { name: 'Professionals', href: '/professionals' },
      { name: 'Employers', href: '/employers' },
      { name: 'Universities', href: '/universities' },
      { name: 'Success Stories', href: '/stories' }
    ]
  },
  {
    title: 'Company',
    links: [
      { name: 'About Us', href: '/about' },
      { name: 'Compliance', href: '/compliance' },
      { name: 'Security', href: '/security' },
      { name: 'Contact', href: '/contact' }
    ]
  },
  {
    title: 'Resources',
    links: [
      { name: 'Documentation', href: '/docs' },
      { name: 'API Access', href: '/api' },
      { name: 'Support Center', href: '/support' },
      { name: 'Blog', href: '/blog' }
    ]
  }
];

// Nigerian partnerships and certifications
const certifications = [
  { name: 'NDPR', description: 'Nigeria Data Protection', icon: Shield },
  { name: 'NIMC', description: 'Identity Verified', icon: CheckCircle },
  { name: 'NUC', description: 'Education Partner', icon: GraduationCap },
  { name: 'ISO 27001', description: 'Security Certified', icon: Lock },
  { name: 'GDPR', description: 'EU Compliant', icon: Globe },
  { name: 'SOC 2', description: 'Type II Certified', icon: Award }
];

export function Footer({ onNavigate }: FooterProps = {}) {
  const handleNavigate = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
    }
  };

  return (
    <footer className="relative text-white overflow-hidden" style={{ backgroundColor: '#0a0b0d' }}>
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0b0d] to-[#0a0b0d]" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#bfa5ff]/5 rounded-full blur-3xl" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#7bb8ff]/5 rounded-full blur-3xl" />
      
      <div className="relative">
        {/* PIN Showcase Section - The Centerpiece */}
        <div className="border-b border-white/10">
          <div className="container mx-auto px-4 py-16">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto text-center space-y-6"
            >
              {/* PIN Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-surface backdrop-blur-xl">
                <CreditCard className="h-4 w-4 text-[#bfa5ff]" />
                <span className="text-sm text-white/80">Professional Identity Number</span>
                <Sparkles className="h-4 w-4 text-[#32f08c]" />
              </div>

              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-medium text-white">
                  Your Career Passport,<br />Verified & Trusted Globally
                </h2>
                <p className="text-lg text-white/60 max-w-2xl mx-auto">
                  Join 50,000+ verified professionals using PIN as their digital career identity. 
                  Blockchain-secured, AI-verified, globally recognized.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-[#bfa5ff] to-[#7bb8ff] hover:from-[#a88fe6] hover:to-[#6aa5e6] text-white border-0"
                >
                  Get Your PIN
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-surface text-white hover:bg-surface hover:border-surface"
                >
                  Verify a PIN
                  <Shield className="ml-2 h-5 w-5" />
                </Button>
              </div>

              {/* Trust Metrics with Glassmorphism */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
                {pinMetrics.map((metric, index) => (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="relative group"
                  >
                    <div className="relative p-6 rounded-2xl bg-surface border border-surface backdrop-blur-xl hover:bg-surface transition-all duration-300">
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <metric.icon 
                        className="h-8 w-8 mx-auto mb-3 transition-transform group-hover:scale-110" 
                        style={{ color: metric.color }}
                      />
                      <div className="text-2xl font-medium text-white">{metric.value}</div>
                      <div className="text-sm text-white/60 mt-1">{metric.label}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="border-b border-white/10">
          <div className="container mx-auto px-4 py-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              {/* Brand Section */}
              <div className="lg:col-span-4 space-y-6">
                <div>
                  <Logo size="lg" showText={true} />
                  <p className="text-white/60 leading-relaxed mt-4">
                    Our vision is to create the world’s most trusted infrastructure for professional identity—an intelligent verification layer that powers careers, businesses, and global talent mobility. We aim to eliminate doubt, fraud, and friction from hiring by giving every individual a secure, An identity that proves who they are and what they can do, instantly
                  </p>
                </div>

                {/* Social Links with brand colors */}
                <div className="space-y-3">
                  <span className="text-sm text-white/40">Connect with us</span>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-surface bg-surface hover:bg-[#7bb8ff]/20 hover:border-[#7bb8ff]/40 text-white"
                      asChild
                    >
                      <a href="https://twitter.com/swipe" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Twitter">
                        <Twitter className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-surface bg-surface hover:bg-[#bfa5ff]/20 hover:border-[#bfa5ff]/40 text-white"
                      asChild
                    >
                      <a href="https://linkedin.com/company/swipe" target="_blank" rel="noopener noreferrer" aria-label="Connect on LinkedIn">
                        <Linkedin className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-surface bg-surface hover:bg-[#32f08c]/20 hover:border-[#32f08c]/40 text-white"
                      asChild
                    >
                      <a href="https://instagram.com/swipe" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Instagram">
                        <Instagram className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-surface bg-surface hover:bg-[#7bb8ff]/20 hover:border-[#7bb8ff]/40 text-white"
                      asChild
                    >
                      <a href="https://facebook.com/swipe" target="_blank" rel="noopener noreferrer" aria-label="Like us on Facebook">
                        <Facebook className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-3 pt-4">
                  <div className="flex items-center gap-3 text-sm group cursor-pointer">
                    <div className="p-2 rounded-lg bg-surface group-hover:bg-[#bfa5ff]/20 transition-colors">
                      <Mail className="h-4 w-4 text-[#bfa5ff]" />
                    </div>
                    <a href="mailto:support@usepin.xyz" className="text-white/60 hover:text-white transition-colors">
                      support@usepin.xyz
                    </a>
                  </div>
                  <div className="flex items-center gap-3 text-sm group cursor-pointer">
                    <div className="p-2 rounded-lg bg-surface group-hover:bg-[#32f08c]/20 transition-colors">
                      <Phone className="h-4 w-4 text-[#32f08c]" />
                    </div>
                    <a href="tel:+2348008556226" className="text-white/60 hover:text-white transition-colors">
                      +234 (0) 800-coreID
                    </a>
                  </div>
                  <div className="flex items-center gap-3 text-sm group cursor-pointer">
                    <div className="p-2 rounded-lg bg-surface group-hover:bg-[#7bb8ff]/20 transition-colors">
                      <MessageCircle className="h-4 w-4 text-[#7bb8ff]" />
                    </div>
                    <span className="text-white/60 group-hover:text-white transition-colors">
                      24/7 Live Support
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="lg:col-span-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {navSections.map((section) => (
                    <div key={section.title}>
                      <h4 className="text-white mb-4">{section.title}</h4>
                      <ul className="space-y-3">
                        {section.links.map((link) => (
                          <li key={link.name}>
                            <a 
                              href={link.href}
                              className="text-sm text-white/60 hover:text-white transition-colors inline-flex items-center group"
                            >
                              <span>{link.name}</span>
                              <ArrowRight className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Certifications & Compliance */}
        <div className="border-b border-white/10">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-surface backdrop-blur-xl mb-4">
                <Shield className="h-4 w-4 text-[#32f08c]" />
                <span className="text-sm text-white/80">Trusted & Compliant</span>
              </div>
              <h3 className="text-xl text-white/90">Security & Compliance Certifications</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {certifications.map((cert, index) => (
                <motion.div
                  key={cert.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="relative group"
                >
                  <div className="p-4 rounded-xl bg-surface border border-surface backdrop-blur-xl hover:bg-surface hover:border-[#bfa5ff]/30 transition-all duration-300 text-center">
                    <cert.icon className="h-6 w-6 mx-auto mb-2 text-[#bfa5ff] group-hover:text-[#32f08c] transition-colors" />
                    <div className="text-sm text-white mb-1">{cert.name}</div>
                    <div className="text-xs text-white/50">{cert.description}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col md:flex-row items-center gap-6 text-sm text-white/60">
              <span>© {new Date().getFullYear()} CoreID. All rights reserved.</span>
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => handleNavigate('privacy')} 
                  className="text-white/60 hover:text-white transition-colors"
                >
                  Privacy
                </button>
                <button 
                  onClick={() => handleNavigate('terms')} 
                  className="text-white/60 hover:text-white transition-colors"
                >
                  Terms
                </button>
                <button 
                  onClick={() => handleNavigate('cookies')} 
                  className="text-white/60 hover:text-white transition-colors"
                >
                  Cookies
                </button>
                <button 
                  onClick={() => handleNavigate('gdpr')} 
                  className="text-white/60 hover:text-white transition-colors"
                >
                  GDPR
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <div className="px-3 py-1.5 rounded-lg bg-surface border border-surface text-white/60 flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>45+ Countries</span>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#bfa5ff]/10 to-[#7bb8ff]/10 border border-[#bfa5ff]/20 text-white/80 flex items-center gap-2">
                <Zap className="h-4 w-4 text-[#32f08c]" />
                <span>Powered by AI</span>
              </div>
            </div>
          </div>

          {/* Nigerian Pride Badge */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="text-center">
              <p className="text-sm text-white/40">
                🇳🇬 Built with pride in Nigeria · Serving the world
              </p>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-6 p-4 rounded-xl bg-surface border border-surface backdrop-blur-xl">
            <p className="text-xs text-white/40 text-center leading-relaxed">
              <strong className="text-white/60">Important:</strong> swipe implements rigorous KYC, AML, and credential verification. 
              All data processing complies with GDPR, NDPR, and international privacy regulations. 
              Professional Identity Numbers (PINs) are blockchain-secured and AI-verified for maximum trust and authenticity.
            </p>
          </div>
        </div>

        {/* Admin Access - Hidden but accessible */}
        <div className="border-t border-white/5">
          <div className="container mx-auto px-4 py-3">
            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavigate('admin')}
                className="text-xs text-white/20 hover:text-white/60 hover:bg-surface transition-all"
              >
                <Lock className="h-3 w-3 mr-1" />
                Admin
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
