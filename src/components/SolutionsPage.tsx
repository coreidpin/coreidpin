import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Building,
  UserCheck,
  GraduationCap,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Shield,
  TrendingUp,
  Users,
  Globe,
  Award,
  Zap,
  DollarSign,
  FileCheck,
  Clock,
  Lock,
  Search,
  Target,
  Heart,
  MessageSquare,
  Star,
  BarChart,
  Briefcase,
  BadgeCheck,
  Lightbulb
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface SolutionsPageProps {
  onNavigate: (page: string) => void;
  onLogin: (userType: 'employer' | 'professional' | 'university') => void;
}

export function SolutionsPage({ onNavigate, onLogin }: SolutionsPageProps) {
  const [activeTab, setActiveTab] = useState<'employers' | 'professionals' | 'universities'>('employers');

  const employerFeatures = [
    {
      icon: Target,
      title: 'Smart Job Description Parsing',
      description: 'Upload, paste, or link your JD. Our AI extracts requirements and matches qualified candidates instantly.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: Shield,
      title: 'AI-Verified Candidates',
      description: 'Every profile is verified through LinkedIn, GitHub, portfolios, and social proof. No fake credentials.',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: Heart,
      title: 'Swipe to Match',
      description: 'Tinder-style interface makes hiring fun. Swipe right on talent you love, match instantly.',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50'
    },
    {
      icon: Globe,
      title: 'Global Compliance & EOR',
      description: 'Hire across borders with built-in compliance, payroll, and employer-of-record services.',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      icon: Clock,
      title: 'Hire in Days, Not Months',
      description: 'Average time-to-hire is 12 days. Post today, start interviewing tomorrow.',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      icon: DollarSign,
      title: 'Transparent Pricing',
      description: 'Pay per hire with full cost breakdown. No hidden fees, no surprises.',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    }
  ];

  const professionalFeatures = [
    {
      icon: BadgeCheck,
      title: 'AI Skill Verification',
      description: 'Connect LinkedIn, GitHub, or portfolio. Get instant AI-verified skill badges that employers trust.',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      icon: Sparkles,
      title: 'Social + Professional Identity',
      description: 'Build a trusted profile that combines your work history with social verification.',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      icon: Users,
      title: 'Get Discovered by Employers',
      description: 'Top employers swipe through profiles daily. When you match, start conversations instantly.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: TrendingUp,
      title: 'Career Growth Tracking',
      description: 'Track your skill development, certifications, and career milestones in one place.',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: MessageSquare,
      title: 'Direct Employer Connections',
      description: 'No middlemen. Chat directly with hiring managers when you match.',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50'
    },
    {
      icon: Award,
      title: 'Shareable Credentials',
      description: 'Download and share your verified badges on social media, email signatures, and LinkedIn.',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50'
    }
  ];

  const universityFeatures = [
    {
      icon: FileCheck,
      title: 'Issue Tamper-Proof Credentials',
      description: 'Issue blockchain-verified digital certificates that can\'t be forged or faked.',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      icon: Users,
      title: 'Track Alumni Success',
      description: 'Monitor your graduates\' career progress and employment outcomes in real-time.',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: BarChart,
      title: 'Employability Analytics',
      description: 'Get insights into which skills employers seek and how your programs perform.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: Briefcase,
      title: 'Connect Students to Jobs',
      description: 'Help graduates get hired faster with verified credentials employers trust.',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      icon: Lock,
      title: 'Secure & Compliant',
      description: 'GDPR compliant, encrypted storage, and full audit trails for all credentials.',
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      icon: Lightbulb,
      title: 'Institutional Branding',
      description: 'Enhance your reputation with modern, verifiable credentials that students value.',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50'
    }
  ];

  const employerStats = [
    { label: 'Average Time to Hire', value: '12 days', icon: Clock },
    { label: 'Candidate Match Rate', value: '94%', icon: Target },
    { label: 'Verified Profiles', value: '10,000+', icon: Shield },
    { label: 'Global Countries', value: '30+', icon: Globe }
  ];

  const professionalStats = [
    { label: 'Active Job Listings', value: '5,000+', icon: Briefcase },
    { label: 'Avg. Profile Views', value: '250/mo', icon: Users },
    { label: 'Success Match Rate', value: '87%', icon: Heart },
    { label: 'Verified Employers', value: '500+', icon: Building }
  ];

  const universityStats = [
    { label: 'Partner Universities', value: '50+', icon: GraduationCap },
    { label: 'Credentials Issued', value: '100,000+', icon: FileCheck },
    { label: 'Graduate Employment', value: '73%', icon: TrendingUp },
    { label: 'Employer Trust Score', value: '96%', icon: Star }
  ];

  const renderFeatures = (features: typeof employerFeatures) => (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {features.map((feature, index) => (
        <motion.div
          key={feature.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="h-full hover:shadow-lg transition-shadow bg-white border-2 border-border hover:border-primary/30">
            <CardContent className="p-4 sm:p-6">
              <div className={`w-12 h-12 ${feature.bgColor} rounded-xl flex items-center justify-center mb-4`}>
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
              </div>
              <h3 className="text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );

  const renderStats = (stats: typeof employerStats) => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-12">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="bg-white border-2 border-primary/10 hover:border-primary/30 transition-colors">
            <CardContent className="p-3 sm:p-4 text-center">
              <stat.icon className="h-6 w-6 sm:h-8 sm:w-8 text-primary mx-auto mb-2" />
              <div className="text-xl sm:text-2xl text-primary mb-1">{stat.value}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-gradient-to-br from-primary/5 via-white to-purple-500/5">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12 sm:mb-16"
          >
            <Badge variant="secondary" className="mb-4 px-4 py-2">
              <Sparkles className="h-4 w-4 mr-2" />
              Our Solutions
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl mb-4 sm:mb-6 tracking-tight">
              Everything You Need to
              <span className="text-primary block mt-2">Hire, Get Hired, or Verify</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto px-4">
              Whether you're an employer looking for talent, a professional seeking opportunities, 
              or a university issuing credentials — CoreID has you covered.
            </p>
          </motion.div>

          {/* Solution Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
            <div className="flex justify-center mb-8 sm:mb-12">
              <TabsList className="grid grid-cols-3 gap-2 bg-white border-2 p-1 sm:p-2 w-full max-w-2xl">
                <TabsTrigger 
                  value="employers" 
                  className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                >
                  <Building className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">For Employers</span>
                  <span className="sm:hidden">Employers</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="professionals" 
                  className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  <UserCheck className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">For Professionals</span>
                  <span className="sm:hidden">Talent</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="universities" 
                  className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700"
                >
                  <GraduationCap className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">For Universities</span>
                  <span className="sm:hidden">Universities</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Employers Tab */}
            <TabsContent value="employers" className="space-y-12">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8 sm:space-y-12"
              >
                {/* Hero Image */}
                <div className="relative rounded-2xl overflow-hidden shadow-2xl max-w-5xl mx-auto">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1553877522-43269d4ea984?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwbWVldGluZyUyMG9mZmljZXxlbnwxfHx8fDE3NTkyMTk3OTR8MA&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="Employer hiring team"
                    className="w-full h-48 sm:h-64 lg:h-96 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                    <div className="p-4 sm:p-8 w-full">
                      <h3 className="text-lg sm:text-2xl text-white mb-2">Hire Faster. Hire Smarter.</h3>
                      <p className="text-sm sm:text-base text-white/90">
                        AI-powered matching connects you with pre-verified talent in minutes.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                {renderStats(employerStats)}

                {/* Features */}
                <div>
                  <h2 className="text-2xl sm:text-3xl mb-6 sm:mb-8 text-center">Key Features for Employers</h2>
                  {renderFeatures(employerFeatures)}
                </div>

                {/* CTA */}
                <div className="text-center py-8 sm:py-12 bg-gradient-to-br from-blue-50 to-white rounded-2xl border-2 border-blue-100 px-4">
                  <h3 className="text-xl sm:text-2xl mb-3 sm:mb-4">Ready to Find Your Next Hire?</h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto">
                    Join 500+ companies hiring verified talent from Africa and beyond.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                    <Button 
                      size="lg" 
                      onClick={() => onLogin('employer')}
                      className="w-full sm:w-auto px-6 sm:px-8 py-5 sm:py-6"
                    >
                      <Building className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      Start Hiring Now
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline"
                      onClick={() => onNavigate('how-it-works')}
                      className="w-full sm:w-auto px-6 sm:px-8 py-5 sm:py-6"
                    >
                      Learn How It Works
                    </Button>
                  </div>
                </div>
              </motion.div>
            </TabsContent>

            {/* Professionals Tab */}
            <TabsContent value="professionals" className="space-y-12">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8 sm:space-y-12"
              >
                {/* Hero Image */}
                <div className="relative rounded-2xl overflow-hidden shadow-2xl max-w-5xl mx-auto">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwcHJvZmVzc2lvbmFsJTIwd29tYW58ZW58MXx8fHwxNzU5MjE5Nzk0fDA&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="Professional talent"
                    className="w-full h-48 sm:h-64 lg:h-96 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                    <div className="p-4 sm:p-8 w-full">
                      <h3 className="text-lg sm:text-2xl text-white mb-2">Get Verified. Get Discovered. Get Hired.</h3>
                      <p className="text-sm sm:text-base text-white/90">
                        Prove your skills with AI verification and match with global employers.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                {renderStats(professionalStats)}

                {/* Features */}
                <div>
                  <h2 className="text-2xl sm:text-3xl mb-6 sm:mb-8 text-center">Key Features for Professionals</h2>
                  {renderFeatures(professionalFeatures)}
                </div>

                {/* CTA */}
                <div className="text-center py-8 sm:py-12 bg-gradient-to-br from-primary/5 to-white rounded-2xl border-2 border-primary/20 px-4">
                  <h3 className="text-xl sm:text-2xl mb-3 sm:mb-4">Ready to Showcase Your Skills?</h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto">
                    Join 10,000+ verified professionals getting matched with top employers.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                    <Button 
                      size="lg" 
                      onClick={() => onLogin('professional')}
                      className="w-full sm:w-auto px-6 sm:px-8 py-5 sm:py-6"
                    >
                      <UserCheck className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      Get Verified Now
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline"
                      onClick={() => onNavigate('how-it-works')}
                      className="w-full sm:w-auto px-6 sm:px-8 py-5 sm:py-6"
                    >
                      See How It Works
                    </Button>
                  </div>
                </div>
              </motion.div>
            </TabsContent>

            {/* Universities Tab */}
            <TabsContent value="universities" className="space-y-12">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8 sm:space-y-12"
              >
                {/* Hero Image */}
                <div className="relative rounded-2xl overflow-hidden shadow-2xl max-w-5xl mx-auto">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwZ3JhZHVhdGlvbnxlbnwxfHx8fDE3NTkyMTk3OTR8MA&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="University graduation"
                    className="w-full h-48 sm:h-64 lg:h-96 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                    <div className="p-4 sm:p-8 w-full">
                      <h3 className="text-lg sm:text-2xl text-white mb-2">Modern Credentials. Better Outcomes.</h3>
                      <p className="text-sm sm:text-base text-white/90">
                        Issue blockchain-verified credentials that employers trust.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                {renderStats(universityStats)}

                {/* Features */}
                <div>
                  <h2 className="text-2xl sm:text-3xl mb-6 sm:mb-8 text-center">Key Features for Universities</h2>
                  {renderFeatures(universityFeatures)}
                </div>

                {/* CTA */}
                <div className="text-center py-8 sm:py-12 bg-gradient-to-br from-purple-50 to-white rounded-2xl border-2 border-purple-100 px-4">
                  <h3 className="text-xl sm:text-2xl mb-3 sm:mb-4">Ready to Issue Verified Credentials?</h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto">
                    Join 50+ universities enhancing graduate employability with digital credentials.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                    <Button 
                      size="lg" 
                      onClick={() => onLogin('university')}
                      className="w-full sm:w-auto px-6 sm:px-8 py-5 sm:py-6"
                    >
                      <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      Partner With Us
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline"
                      onClick={() => onNavigate('contact')}
                      className="w-full sm:w-auto px-6 sm:px-8 py-5 sm:py-6"
                    >
                      Schedule a Demo
                    </Button>
                  </div>
                </div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-12 sm:py-16 px-4 bg-gradient-to-br from-primary to-primary/80">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl text-white mb-4 sm:mb-6">
              Ready to Transform How You Work?
            </h2>
            <p className="text-base sm:text-lg text-white/90 mb-6 sm:mb-8 px-4">
              Join thousands of employers, professionals, and universities using CoreID to build trust and create opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => onLogin('professional')}
                className="w-full sm:w-auto px-6 sm:px-8 py-5 sm:py-6 bg-white hover:bg-white/90"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => onNavigate('how-it-works')}
                className="w-full sm:w-auto px-6 sm:px-8 py-5 sm:py-6 bg-transparent border-2 border-white text-white hover:bg-white/10"
              >
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
