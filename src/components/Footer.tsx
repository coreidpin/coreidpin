import React from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Logo } from './Logo';
import { 
  Mail, 
  Phone, 
  MessageCircle, 
  Globe, 
  CheckCircle,
  Award,
  Lock,
  ExternalLink,
  Twitter,
  Linkedin,
  Facebook,
  BookOpen,
  Briefcase,
  UserCheck,
  School
} from 'lucide-react';
// Trust metrics banner removed from Footer

interface FooterProps {
  onNavigate?: (page: string) => void;
}

// Move data outside component to prevent recreation on each render
const quickLinkCategories = [
  {
    title: 'About',
    icon: BookOpen,
    colorClasses: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
    iconColor: 'text-blue-600',
    links: [
      { name: 'How It Works', href: '/how-it-works' },
      { name: 'Our Story', href: '/about' },
      { name: 'Trust & Safety', href: '/trust-safety' },
      { name: 'Compliance Center', href: '/compliance' },
      { name: 'Security', href: '/security' }
    ]
  },
  {
    title: 'For Employers',
    icon: Briefcase,
    colorClasses: 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100',
    iconColor: 'text-emerald-600',
    links: [
      { name: 'Hire Talent', href: '/employers/hire' },
      { name: 'EOR Services', href: '/employers/eor' },
      { name: 'Pricing', href: '/employers/pricing' },
      { name: 'Success Stories', href: '/employers/stories' },
      { name: 'Resources', href: '/employers/resources' }
    ]
  },
  {
    title: 'For Talents',
    icon: UserCheck,
    colorClasses: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
    iconColor: 'text-purple-600',
    links: [
      { name: 'Find Jobs', href: '/professionals/jobs' },
      { name: 'Get Verified', href: '/professionals/verify' },
      { name: 'Build Profile', href: '/professionals/profile' },
      { name: 'Skill Tests', href: '/professionals/tests' },
      { name: 'Career Resources', href: '/professionals/resources' }
    ]
  },
  {
    // title: 'For Universities',
    // icon: School,
    // colorClasses: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
    // iconColor: 'text-orange-600',
    // links: [
    //   { name: 'Partner Program', href: '/universities/partner' },
    //   { name: 'Issue Credentials', href: '/universities/credentials' },
    //   { name: 'Verification Tools', href: '/universities/tools' },
    //   { name: 'API Access', href: '/universities/api' },
    //   { name: 'Documentation', href: '/universities/docs' }
    // ]
  }
];

const certifications = [
  { name: 'ISO 27001', description: 'Information Security Management', verified: true },
  { name: 'GDPR Compliant', description: 'Data Protection & Privacy', verified: true },
  { name: 'SOC 2 Type II', description: 'Security & Availability', verified: true },
  { name: 'Nigeria Data Protection', description: 'NDPR Certified', verified: true }
];

const partnerships = [
  { name: 'National Universities Commission (NUC)', type: 'Education' },
  { name: 'Lagos Chamber of Commerce', type: 'Business' },
  { name: 'Nigeria Immigration Service', type: 'Government' },
  { name: 'Central Bank of Nigeria', type: 'Financial' },
  { name: 'NIMC', type: 'Identity Verification' },
  { name: 'FIRS', type: 'Tax Compliance' }
];

const trustMetrics = [
  { label: 'Verified Professionals', value: '50,000+', icon: Globe },
  { label: 'Global Employers', value: '2,500+', icon: Globe },
  // { label: 'Partner Universities', value: '150+', icon: Globe },
  { label: 'Countries Served', value: '45+', icon: Globe }
];

export function Footer({ onNavigate }: FooterProps = {}) {
  const handleNavigate = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
    }
  };
  const validCategories = quickLinkCategories.filter((c: any) => c && c.title && c.icon && Array.isArray(c.links));

  return (
    <footer className="bg-card border-t border-border mt-12">
      {/* Trust Banner removed from Footer to avoid duplication */}

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="space-y-6">
            <div>
              <Logo size="lg" showText={true} />
              <p className="text-muted-foreground leading-relaxed mt-4">
                The world's first social network where real skills, verified experience, and authentic people connect to create opportunity. CoreID. Verify. Match. Hire.
              </p>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Follow us:</span>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" asChild>
                  <a href="https://twitter.com/swipe" target="_blank" rel="noopener noreferrer">
                    <Twitter className="h-4 w-4" />
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href="https://linkedin.com/company/swipe" target="_blank" rel="noopener noreferrer">
                    <Linkedin className="h-4 w-4" />
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href="https://facebook.com/swipe" target="_blank" rel="noopener noreferrer">
                    <Facebook className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>

            {/* Contact & Support */}
            <div>
              <h4 className="font-semibold mb-4">Contact & Support</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-primary" />
                  <a href="mailto:support@COREID.work" className="text-muted-foreground hover:text-foreground transition-colors">
                    support@COREID.work
                  </a>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-primary" />
                  <a href="tel:+2348008556226" className="text-muted-foreground hover:text-foreground transition-colors">
                    +234 (0) 800-COREID
                  </a>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MessageCircle className="h-4 w-4 text-primary" />
                  <Button variant="link" className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground">
                    Live Chat Support
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h4 className="font-semibold mb-6">Quick Links</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {validCategories.map((category) => (
                <Card key={category.title} className={`transition-all duration-200 ${category.colorClasses}`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <category.icon className={`h-5 w-5 ${category.iconColor}`} />
                      {category.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-2">
                      {category.links.map((link) => (
                        <li key={link.name}>
                          <a 
                            href={link.href}
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 group"
                          >
                            <span>{link.name}</span>
                            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Certifications & Partnerships */}
        <div className="space-y-8">
          {/* Compliance Badges */}
          <div>
            <h4 className="font-semibold mb-4 text-center">Security & Compliance Certifications</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {certifications.map((cert) => (
                <div
                  key={cert.name}
                  className="flex flex-col items-center p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="h-5 w-5 text-primary" />
                    {cert.verified && <CheckCircle className="h-4 w-4 text-green-600" />}
                  </div>
                  <div className="font-medium text-sm text-center">{cert.name}</div>
                  <div className="text-xs text-muted-foreground text-center">{cert.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Partnership Badges */}
          <div>
            <h4 className="font-semibold mb-4 text-center">Trusted Partners & Regulatory Bodies</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {partnerships.map((partner) => (
                <div
                  key={partner.name}
                  className="flex flex-col items-center p-3 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <Award className="h-6 w-6 text-primary mb-2" />
                  <div className="font-medium text-xs text-center">{partner.name}</div>
                  <Badge variant="outline" className="text-xs mt-1">{partner.type}</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-muted-foreground">
            <span>© 2025 CoreID. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <button onClick={() => handleNavigate('privacy')} className="hover:text-foreground transition-colors">Privacy Policy</button>
              <button onClick={() => handleNavigate('terms')} className="hover:text-foreground transition-colors">Terms of Service</button>
              <button onClick={() => handleNavigate('cookies')} className="hover:text-foreground transition-colors">Cookie Policy</button>
              <button onClick={() => handleNavigate('gdpr')} className="hover:text-foreground transition-colors">GDPR</button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Globe className="h-4 w-4" />
            <span>Available in 45+ countries</span>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            <strong>Important:</strong> CoreID is the world's first social network where real skills meet verified opportunities. 
            We implement rigorous KYC, AML, and credential verification. All data collection and processing 
            comply with international data protection regulations including GDPR, NDPR, and other applicable privacy laws. 
            For sensitive data handling, please consult our detailed privacy policy and compliance documentation.
          </p>
        </div>
      </div>

      {/* Admin Access Section - Below Footer */}
      <div className="bg-muted/30 border-t border-border/50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigate('admin')}
              className="text-xs text-muted-foreground hover:text-foreground opacity-50 hover:opacity-100 transition-all"
            >
              <Lock className="h-3 w-3 mr-1" />
              Admin Access
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}