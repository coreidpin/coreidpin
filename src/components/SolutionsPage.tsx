import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Building,
  UserCheck,
  ArrowRight,
  Sparkles,
  Shield,
  TrendingUp,
  Users,
  Globe,
  Award,
  DollarSign,
  Clock,
  Target,
  Heart,
  BarChart,
  Briefcase,
  BadgeCheck
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface SolutionsPageProps {
  onNavigate: (page: string) => void;
  onLogin: (userType: 'employer' | 'professional' | 'university') => void;
}

export function SolutionsPage({ onNavigate, onLogin }: SolutionsPageProps) {
  const [activeTab, setActiveTab] = useState<'employers' | 'professionals' | 'universities'>('employers');
  const showUniversities = false;
  const isProd = import.meta.env.PROD;

  const employerFeatures = [
    {
      icon: Shield,
      title: 'Fraud-Proof Identity Checks',
      description: 'Every professional has a verified PIN tied to their phone number. No fake profiles, no identity fraud.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: Target,
      title: 'Verified Profiles You Can Trust',
      description: 'Access comprehensive professional data backed by GidiPIN Infrastructure Layer verification.',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: Clock,
      title: 'Instant Talent Onboarding',
      description: 'PIN-based identity means instant access to verified career history, skills, and credentials.',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50'
    },
    {
      icon: BarChart,
      title: 'Real-Time Professional Insights',
      description: 'Get live updates on professional achievements, role changes, and skill development.',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      icon: DollarSign,
      title: 'Reduced Hiring Time and Cost',
      description: 'GidiPIN gives companies confidence from the very first interaction, eliminating verification delays.',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      icon: Globe,
      title: 'API-Driven Integration',
      description: 'Seamlessly integrate professional identity into your existing hiring tools and workflows.',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    }
  ];

  const professionalFeatures = [
    {
      icon: Globe,
      title: 'Unlocks Global Opportunities',
      description: 'Your PIN works across countries and platforms, giving you access to opportunities worldwide.',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      icon: BadgeCheck,
      title: 'Proves Identity and Skills Instantly',
      description: 'No more lengthy verification processes. Your PIN instantly validates who you are and what you can do.',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      icon: TrendingUp,
      title: 'Tracks Experience and Achievements',
      description: 'Your professional journey follows you everywhere. Every job, every skill, every achievement.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: Award,
      title: 'Helps You Stand Out with Verified Credibility',
      description: 'Verified credentials and trust scoring help you stand out in a crowded marketplace.',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: Users,
      title: 'Works Across Multiple Platforms',
      description: 'One identity that works everywhere. No more creating multiple profiles or losing your professional history.',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50'
    },
    {
      icon: Sparkles,
      title: 'Gain Mobility, Proof, and Visibility',
      description: 'Professionals gain complete control over their identity with portable, verified professional data.',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50'
    }
  ];

  // const universityFeatures = [
  //   {
  //     icon: FileCheck,
  //     title: 'Issue Tamper-Proof Credentials',
  //     description: 'Issue blockchain-verified digital certificates that can\'t be forged or faked.',
  //     color: 'text-indigo-600',
  //     bgColor: 'bg-indigo-50'
  //   },
  //   {
  //     icon: Users,
  //     title: 'Track Alumni Success',
  //     description: 'Monitor your graduates\' career progress and employment outcomes in real-time.',
  //     color: 'text-green-600',
  //     bgColor: 'bg-green-50'
  //   },
  //   {
  //     icon: BarChart,
  //     title: 'Employability Analytics',
  //     description: 'Get insights into which skills employers seek and how your programs perform.',
  //     color: 'text-blue-600',
  //     bgColor: 'bg-blue-50'
  //   },
  //   {
  //     icon: Briefcase,
  //     title: 'Connect Students to Jobs',
  //     description: 'Help graduates get hired faster with verified credentials employers trust.',
  //     color: 'text-purple-600',
  //     bgColor: 'bg-purple-50'
  //   },
  //   {
  //     icon: Lock,
  //     title: 'Secure & Compliant',
  //     description: 'GDPR compliant, encrypted storage, and full audit trails for all credentials.',
  //     color: 'text-red-600',
  //     bgColor: 'bg-red-50'
  //   },
  //   {
  //     icon: Lightbulb,
  //     title: 'Institutional Branding',
  //     description: 'Enhance your reputation with modern, verifiable credentials that students value.',
  //     color: 'text-amber-600',
  //     bgColor: 'bg-amber-50'
  //   }
  // ];

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

  // const universityStats = [
  //   { label: 'Partner Universities', value: '50+', icon: GraduationCap },
  //   { label: 'Credentials Issued', value: '100,000+', icon: FileCheck },
  //   { label: 'Graduate Employment', value: '73%', icon: TrendingUp },
  //   { label: 'Employer Trust Score', value: '96%', icon: Star }
  // ];

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
    <div className="min-h-screen" style={{ backgroundColor: '#0a0b0d' }}>
      {/* Hero Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4" style={{ background: 'linear-gradient(135deg, rgba(191, 165, 255, 0.1) 0%, rgba(10, 11, 13, 1) 50%, rgba(123, 184, 255, 0.1) 100%)' }}>
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12 sm:mb-16"
          >
            <Badge className="mb-4 px-4 py-2 bg-white/10 text-white border-white/20">
              <Sparkles className="h-4 w-4 mr-2" />
              Our Solutions
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl mb-4 sm:mb-6 tracking-tight text-white">
              One PIN.
              <span className="block mt-2" style={{ color: '#32f08c' }}>Infinite Possibilities.</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-300 max-w-3xl mx-auto px-4">
              GidiPIN's unified identity infrastructure serves professionals, employers, and platforms with a single API-driven standard that creates trust-first interactions.
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
                {/*
                <TabsTrigger 
                  value="universities" 
                  className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700"
                >
                  <GraduationCap className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">For Universities</span>
                  <span className="sm:hidden">Universities</span>
                </TabsTrigger>
                */}
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
                      <h3 className="text-lg sm:text-2xl text-white mb-2">One API That Gives You Everything</h3>
                      <p className="text-sm sm:text-base text-white/90">
                        Fraud-proof identity checks, verified profiles you can trust, instant talent onboarding, and reduced hiring time and cost.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                {renderStats(employerStats)}

                {/* Features */}
                <div>
                  <h2 className="text-2xl sm:text-3xl mb-6 sm:mb-8 text-center text-white">Key Features for Employers</h2>
                  {renderFeatures(employerFeatures)}
                </div>

                {/* CTA */}
                <div className="text-center py-8 sm:py-12 rounded-2xl border-2 px-4 bg-white/5 backdrop-blur-xl border-white/10">
                  <h3 className="text-xl sm:text-2xl mb-3 sm:mb-4 text-white">Ready to Tap Into Unified Identity?</h3>
                  <p className="text-sm sm:text-base text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto">
                    Our API lets companies instantly onboard verified professionals, reduce fraud, and access trusted career data.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                    <Button 
                      size="lg" 
                      disabled={isProd}
                      onClick={() => { if (isProd) return; onLogin('employer'); }}
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
                      <h3 className="text-lg sm:text-2xl text-white mb-2">A Single PIN That Unlocks Everything</h3>
                      <p className="text-sm sm:text-base text-white/90">
                        Unlock global opportunities, prove your identity and skills instantly, track your achievements, and gain verified credibility.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                {renderStats(professionalStats)}

                {/* Features */}
                <div>
                  <h2 className="text-2xl sm:text-3xl mb-6 sm:mb-8 text-center text-white">Key Features for Professionals</h2>
                  {renderFeatures(professionalFeatures)}
                </div>

                {/* CTA */}
                <div className="text-center py-8 sm:py-12 rounded-2xl border-2 px-4 bg-white/5 backdrop-blur-xl border-white/10">
                  <h3 className="text-xl sm:text-2xl mb-3 sm:mb-4 text-white">Ready to Build Your Verified Identity?</h3>
                  <p className="text-sm sm:text-base text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto">
                    Professionals gain mobility, proof, and visibility — all from one identity that follows you everywhere.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                    <Button 
                      size="lg" 
                      disabled={isProd}
                      onClick={() => { if (isProd) return; onLogin('professional'); }}
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

            {/* Universities Tab hidden */}
            {showUniversities && (
              <TabsContent value="universities" className="space-y-12">
                {/* University content removed */}
              </TabsContent>
            )}
          </Tabs>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-12 sm:py-16 px-4" style={{ background: 'linear-gradient(135deg, #32f08c 0%, rgba(50, 240, 140, 0.8) 100%)' }}>
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl text-black mb-4 sm:mb-6">
              Ready to Build the Future of Identity?
            </h2>
            <p className="text-base sm:text-lg text-black/80 mb-6 sm:mb-8 px-4">
              GidiPIN is creating the professional identity layer the world needs — global, portable, verified, interoperable, and scalable.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button 
                size="lg" 
                disabled={isProd}
                onClick={() => { if (isProd) return; onLogin('professional'); }}
                className="w-full sm:w-auto px-6 sm:px-8 py-5 sm:py-6 bg-black hover:bg-black/90 text-white"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => onNavigate('how-it-works')}
                className="w-full sm:w-auto px-6 sm:px-8 py-5 sm:py-6 bg-transparent border-2 border-black text-black hover:bg-black/10"
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
