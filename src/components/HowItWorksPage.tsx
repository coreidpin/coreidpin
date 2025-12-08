import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Shield, 
  UserPlus, 
  FileCheck, 
  Search,
  Building,
  UserCheck,
  GraduationCap,
  ArrowRight,
  CheckCircle,
  Clock,
  Globe,
  Award,
  Briefcase,
  CreditCard,
  FileText,
  Zap,
  Eye,
  Lock,
  Users
} from 'lucide-react';

interface HowItWorksPageProps {
  onNavigate: (page: string) => void;
  onLogin?: (userType: 'employer' | 'professional' | 'university') => void;
}

export function HowItWorksPage({ onNavigate, onLogin }: HowItWorksPageProps) {
  const [activeStep, setActiveStep] = useState(0);

  const overviewSteps = [
    {
      icon: UserPlus,
      title: 'Your Phone Number Becomes Your PIN',
      description: 'No usernames. No multiple accounts. A single PIN based on your phone number authenticates your identity everywhere.',
      details: 'We validate your PIN through secure verification protocols and bind it to your evolving professional profile.'
    },
    {
      icon: FileCheck,
      title: 'GidiPIN Infrastructure Layer Powers Everything',
      description: 'The PIN connects directly to our GidiPIN Infrastructure Layer — a scalable identity API.',
      details: 'CIL handles identity verification, profile enrichment, credential validation, trust scoring, consent management, and real-time updates.'
    },
    {
      icon: Search,
      title: 'Professionals Build Verified Identity Once',
      description: 'Your achievements, roles, credentials, and reputation follow you across platforms.',
      details: 'Every job you apply for. Every company you join. Every product that integrates GidiPIN.'
    },
    {
      icon: Building,
      title: 'Businesses Tap Into One Unified Identity Standard',
      description: 'Our API lets companies instantly onboard verified professionals and reduce fraud.',
      details: 'Access trusted career data, automate decision flows, and build smarter hiring tools. This creates a trust-first identity layer for everyone.'
    }
  ];

  const employerSteps = [
    {
      step: '01',
      title: 'Create Your Account',
      description: 'Register your company and complete business verification',
      features: ['Company KYC verification', 'Business registration validation', 'Compliance assessment'],
      time: '1-2 business days'
    },
    {
      step: '02',
      title: 'Post Job Requirements',
      description: 'Define your hiring needs with our AI-powered job description builder',
      features: ['Skill requirements mapping', 'Compliance requirements', 'Budget parameters'],
      time: '15 minutes'
    },
    {
      step: '03',
      title: 'Review Matched Candidates',
      description: 'Access pre-screened, verified candidates with detailed profiles',
      features: ['Verified credentials', 'Skill assessments', 'Compliance scores'],
      time: 'Real-time'
    },
    {
      step: '04',
      title: 'Hire with Confidence',
      description: 'Complete the hiring process with full EOR and compliance support',
      features: ['Contract generation', 'Payment processing', 'Ongoing compliance'],
      time: '2-3 business days'
    }
  ];

  const professionalSteps = [
    {
      step: '01',
      title: 'Complete Your Profile',
      description: 'Build a comprehensive profile with verified credentials',
      features: ['Personal KYC verification', 'Educational credential upload', 'Professional experience'],
      time: '30 minutes'
    },
    {
      step: '02',
      title: 'Credential Verification',
      description: 'We verify your credentials through blockchain technology',
      features: ['University verification', 'Professional certification', 'Skills assessment'],
      time: '48-72 hours'
    },
    {
      step: '03',
      title: 'Skill Testing & Assessment',
      description: 'Complete relevant skill tests to showcase your capabilities',
      features: ['Technical assessments', 'Soft skills evaluation', 'Industry-specific tests'],
      time: '1-2 hours'
    },
    {
      step: '04',
      title: 'Get Matched & Hired',
      description: 'Receive verified job opportunities from global employers',
      features: ['AI-powered matching', 'Interview coordination', 'Contract negotiation'],
      time: 'Ongoing'
    }
  ];

  const universitySteps = [
    {
      step: '01',
      title: 'Institution Registration',
      description: 'Register your institution and complete accreditation verification',
      features: ['Accreditation validation', 'Authority verification', 'System integration'],
      time: '3-5 business days'
    },
    {
      step: '02',
      title: 'Integration Setup',
      description: 'Integrate your systems with our blockchain credential platform',
      features: ['API integration', 'Data mapping', 'Security configuration'],
      time: '1-2 weeks'
    },
    {
      step: '03',
      title: 'Issue Digital Credentials',
      description: 'Start issuing tamper-proof, verifiable digital credentials',
      features: ['Blockchain certificates', 'Real-time verification', 'Batch processing'],
      time: 'Instant'
    },
    {
      step: '04',
      title: 'Monitor & Manage',
      description: 'Track credential usage and manage verification requests',
      features: ['Analytics dashboard', 'Verification tracking', 'Compliance reporting'],
      time: 'Ongoing'
    }
  ];

  const benefits = [
    {
      icon: Globe,
      title: 'Global',
      description: 'Works across countries and platforms with universal recognition'
    },
    {
      icon: Users,
      title: 'Portable',
      description: 'Owned and controlled by the individual, follows you everywhere'
    },
    {
      icon: Shield,
      title: 'Verified',
      description: 'Backed by secure identity and career data with blockchain protection'
    },
    {
      icon: Zap,
      title: 'Interoperable',
      description: 'A single standard for millions of products and platforms'
    }
  ];

  const technologies = [
    {
      name: 'Blockchain Verification',
      description: 'Immutable credential storage and verification',
      icon: FileCheck
    },
    {
      name: 'AI Matching Engine',
      description: 'Advanced algorithms for optimal talent-opportunity matching',
      icon: Search
    },
    {
      name: 'Compliance Automation',
      description: 'Automated KYC, AML, and regulatory compliance checks',
      icon: Shield
    },
    {
      name: 'EOR Integration',
      description: 'Seamless employer of record services integration',
      icon: Building
    }
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0b0d' }}>
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-4xl mx-auto"
        >
          <Badge className="mb-4 px-4 py-2 bg-white/10 text-white border-white/20">
            How It Works
          </Badge>
          <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-white">
            Your Phone Number Becomes Your PIN
          </h1>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Discover how GidiPIN creates a unified professional identity layer that powers trust, verification, and opportunity across the global workforce.
          </p>
        </motion.div>
      </section>

      {/* Overview Process */}
      <section className="py-16 lg:py-24" style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-white">
              How GidiPIN Infrastructure Layer Powers Everything
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Our PIN connects directly to the GidiPIN Infrastructure Layer — a scalable identity API that businesses and platforms integrate in minutes.
            </p>
          </motion.div>

          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {overviewSteps.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                  onMouseEnter={() => setActiveStep(index)}
                >
                  <Card className={`p-6 h-full transition-all duration-300 cursor-pointer bg-white/5 backdrop-blur-xl border-white/10 ${
                    activeStep === index ? 'shadow-lg scale-105' : 'hover:shadow-md'
                  }`} style={activeStep === index ? { borderColor: '#32f08c' } : {}}>
                    <CardContent className="p-0 text-center">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors`} style={activeStep === index ? { backgroundColor: '#32f08c', color: '#0a0b0d' } : { backgroundColor: 'rgba(50, 240, 140, 0.1)', color: '#32f08c' }}>
                        <step.icon className="h-8 w-8" />
                      </div>
                      <h3 className="font-semibold mb-2 text-white">{step.title}</h3>
                      <p className="text-sm text-gray-300 mb-3">{step.description}</p>
                      <p className="text-xs text-gray-400">{step.details}</p>
                    </CardContent>
                  </Card>
                  
                  {/* Arrow for desktop */}
                  {index < overviewSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                      <ArrowRight className="h-6 w-6" style={{ color: '#32f08c' }} />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Workflows */}
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-white">
            Solutions for Every User
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Explore how GidiPIN's unified identity infrastructure serves professionals, employers, and platforms.
          </p>
        </motion.div>

        <Tabs defaultValue="employers" className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-white/5 border-white/10">
            <TabsTrigger value="employers" className="flex items-center gap-2 data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-300">
              <Building className="h-4 w-4" />
              <span className="hidden sm:inline">Employers</span>
            </TabsTrigger>
            <TabsTrigger value="professionals" className="flex items-center gap-2 data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-300">
              <UserCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Professionals</span>
            </TabsTrigger>
            {/*
            <TabsTrigger value="universities" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              <span className="hidden sm:inline">Universities</span>
            </TabsTrigger>
            */}
          </TabsList>

          <TabsContent value="employers">
            <div className="space-y-6">
              {employerSteps.map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6">
                    <CardContent className="p-0">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                            {step.step}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                            <p className="text-muted-foreground">{step.description}</p>
                          </div>
                        </div>
                        
                        <div className="lg:w-1/3 space-y-3">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>Time: {step.time}</span>
                          </div>
                          <div className="space-y-1">
                            {step.features.map((feature, i) => (
                              <div key={i} className="flex items-center gap-2 text-sm">
                                <CheckCircle className="h-3 w-3 text-emerald-600" />
                                <span>{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
              
              <div className="text-center pt-6">
                <Button 
                  size="lg" 
                  onClick={() => onLogin?.('employer')}
                  className="group"
                >
                  Start Hiring Today
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="professionals">
            <div className="space-y-6">
              {professionalSteps.map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6">
                    <CardContent className="p-0">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                            {step.step}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                            <p className="text-muted-foreground">{step.description}</p>
                          </div>
                        </div>
                        
                        <div className="lg:w-1/3 space-y-3">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>Time: {step.time}</span>
                          </div>
                          <div className="space-y-1">
                            {step.features.map((feature, i) => (
                              <div key={i} className="flex items-center gap-2 text-sm">
                                <CheckCircle className="h-3 w-3 text-emerald-600" />
                                <span>{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
              
              <div className="text-center pt-6">
                <Button 
                  size="lg" 
                  onClick={() => onLogin?.('professional')}
                  className="group"
                >
                  Get Verified Today
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Universities tab hidden */}
          {false && (
            <TabsContent value="universities"></TabsContent>
          )}
        </Tabs>
      </section>

      {/* Benefits Section */}
      <section className="py-16 lg:py-24" style={{ backgroundColor: 'rgba(191, 165, 255, 0.05)' }}>
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-white">
              The Future We Are Building
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              GidiPIN is creating the professional identity layer the world needs — global, portable, verified, interoperable, and scalable.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 text-center h-full bg-white/5 backdrop-blur-xl border-white/10">
                  <CardContent className="p-0">
                    <benefit.icon className="h-12 w-12 mx-auto mb-4" style={{ color: '#32f08c' }} />
                    <h3 className="font-semibold mb-2 text-white">{benefit.title}</h3>
                    <p className="text-sm text-gray-300">{benefit.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-white">
            Powered by Advanced Technology
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Our platform leverages cutting-edge technology to ensure security, compliance, and efficiency.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {technologies.map((tech, index) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow bg-white/5 backdrop-blur-xl border-white/10">
                <CardContent className="p-0">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(50, 240, 140, 0.1)' }}>
                      <tech.icon className="h-6 w-6" style={{ color: '#32f08c' }} />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2 text-white">{tech.name}</h3>
                      <p className="text-sm text-gray-300">{tech.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24" style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-white">
              Ready to Build the Future?
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              The future of professional identity will not be fragmented. It will be unified, trusted, and API-driven — and GidiPIN is leading the way.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => onNavigate('our-story')}
                variant="outline"
              >
                Learn Our Story
              </Button>
              <Button 
                size="lg" 
                onClick={() => onNavigate('landing')}
                className="group"
              >
                Start Your Journey
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
