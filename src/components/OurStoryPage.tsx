import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Shield, 
  Users, 
  Globe, 
  Award,
  Target,
  Heart,
  Lightbulb,
  TrendingUp,
  MapPin,
  Calendar,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

interface OurStoryPageProps {
  onNavigate: (page: string) => void;
}

export function OurStoryPage({ onNavigate }: OurStoryPageProps) {
  const milestones = [
    {
      year: '2022',
      title: 'The Problem Identified',
      description: 'Professional identity online is broken. Multiple profiles, trust issues, identity fraud, and lack of portable proof especially in developing markets.',
      icon: Lightbulb,
      color: 'bg-blue-500'
    },
    {
      year: '2023',
      title: 'The PIN Solution',
      description: 'Created the Professional Identity Number (PIN) — a universal identifier tied to your phone number, the most accessible digital credential.',
      icon: Award,
      color: 'bg-emerald-500'
    },
    {
      year: '2024',
      title: 'Infrastructure Layer Built',
      description: 'Developed the CoreID Infrastructure Layer (CIL) — a scalable identity API that businesses and platforms integrate in minutes.',
      icon: Globe,
      color: 'bg-purple-500'
    },
    {
      year: '2025',
      title: 'Global Identity Standard',
      description: 'Building the underlying infrastructure that will power trusted identity for 1 billion professionals worldwide.',
      icon: TrendingUp,
      color: 'bg-orange-500'
    }
  ];

  const values = [
    {
      icon: Shield,
      title: 'Identity You Control',
      description: 'Your PIN belongs to you. Your data is never shared without explicit consent. You decide where your identity appears and who sees what.'
    },
    {
      icon: Users,
      title: 'Security by Design',
      description: 'We use secure verification, encrypted storage, risk scoring, anomaly detection, and hashed identity attributes to ensure the integrity of every PIN.'
    },
    {
      icon: Target,
      title: 'Global Compliance',
      description: 'CoreID is compliant with GDPR, NDPR, CCPA, and ISO security standards with transparent, fair, and open practices.'
    },
    {
      icon: Heart,
      title: 'Trust is the Foundation',
      description: 'Every identity action is permission-based. Every integration respects user rights. Every API interaction is logged and auditable.'
    }
  ];

  const team = [
    {
      name: 'Akinrodolu Oluwaseun',
      role: 'Founder and CEO',
      background: 'Former 3mtt, Thrive agric',
      expertise: 'Product and AI expert'
    },
    {
      name: 'OLUWASEUN AIYEJOTO ALABI',
      role: 'Chief Business Intelligence Officer',
      background: 'Former COO, Credlanche/Sixth Element Analytics.',
      expertise: 'Business Intelligence & Analytics'
    },
    {
      name: 'Oware Michael Paul',
      role: 'Chief Operations Officer',
      background: 'Former PM/CIO, Max Protocol',
      expertise: 'Operations & Strategy'
    },
    {
      name: 'Adeola Josephine Balogun',
      role: 'Chief Marketing Officer',
      background: 'Former CMO, Dallas Group',
      expertise: 'Brand & Growth Strategy'
    }
  ];

  const stats = [
    { label: 'Verified Professionals', value: '50,000+', growth: '+300% YoY' },
    { label: 'Global Employers', value: '2,500+', growth: '+250% YoY' },
    { label: 'Partner Universities', value: '150+', growth: '+400% YoY' },
    { label: 'Countries Served', value: '45+', growth: '+200% YoY' }
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
            Our Story
          </Badge>
          <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-white">
            Professional Identity Online is Broken
          </h1>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            CoreID was founded with a simple observation: People create multiple profiles across platforms. Employers struggle to trust resumes. Identity fraud is rising. And professionals lack portable proof of who they are and what they can do.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => onNavigate('how-it-works')}
              className="group"
            >
              See How It Works
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => onNavigate('contact')}
            >
              Get in Touch
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-12" style={{ backgroundColor: 'rgba(191, 165, 255, 0.05)' }}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl lg:text-4xl font-bold mb-2" style={{ color: '#32f08c' }}>
                  {stat.value}
                </div>
                <div className="text-sm lg:text-base text-gray-300 mb-1">
                  {stat.label}
                </div>
                <div className="text-xs font-medium" style={{ color: '#32f08c' }}>
                  {stat.growth}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-white">
            We Set Out to Solve This
          </h2>
          <p className="text-lg text-gray-300 mb-12 leading-relaxed">
            We asked: What if professional identity could be unified? What if people could own their data? What if trust could be verified instantly? The answer became the Professional Identity Number (PIN) — a universal identifier tied to the most widely accessible digital credential: your phone number.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 h-full hover:shadow-lg transition-shadow bg-white/5 backdrop-blur-xl border-white/10">
                  <CardContent className="p-0">
                    <value.icon className="h-8 w-8 mb-4" style={{ color: '#32f08c' }} />
                    <h3 className="text-xl font-semibold mb-3 text-white">{value.title}</h3>
                    <p className="text-gray-300 leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 lg:py-24" style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-white">
              Our Story is Just Beginning
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Today, CoreID is building the underlying infrastructure that will power trusted identity for 1 billion professionals worldwide. But the foundation we're building will power the next generation of work, trust, and opportunity.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-white/20 md:transform md:-translate-x-0.5"></div>
              
              {milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.year}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className={`relative flex items-center mb-8 ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Timeline Dot */}
                  <div className="absolute left-4 md:left-1/2 w-4 h-4 rounded-full border-4 md:transform md:-translate-x-1/2 z-10" style={{ backgroundColor: '#32f08c', borderColor: '#0a0b0d' }}></div>
                  
                  {/* Content */}
                  <div className={`ml-12 md:ml-0 md:w-1/2 ${index % 2 === 0 ? 'md:pr-8' : 'md:pl-8'}`}>
                    <Card className="p-6 bg-white/5 backdrop-blur-xl border-white/10">
                      <CardContent className="p-0">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`p-2 rounded-lg ${milestone.color} text-white`}>
                            <milestone.icon className="h-5 w-5" />
                          </div>
                          <Badge className="bg-white/10 text-white border-white/20">{milestone.year}</Badge>
                        </div>
                        <h3 className="text-xl font-semibold mb-2 text-white">{milestone.title}</h3>
                        <p className="text-gray-300">{milestone.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-white">
            Leadership Team
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Our diverse leadership team brings together expertise in technology, compliance, 
            education, and global business development.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 text-center hover:shadow-lg transition-shadow bg-white/5 backdrop-blur-xl border-white/10">
                <CardContent className="p-0">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(50, 240, 140, 0.1)' }}>
                    <Users className="h-8 w-8" style={{ color: '#32f08c' }} />
                  </div>
                  <h3 className="font-semibold mb-1 text-white">{member.name}</h3>
                  <p className="text-sm mb-2" style={{ color: '#32f08c' }}>{member.role}</p>
                  <p className="text-xs text-gray-300 mb-2">{member.background}</p>
                  <Badge className="text-xs bg-white/10 text-white border-white/20">{member.expertise}</Badge>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-16 lg:py-24" style={{ backgroundColor: 'rgba(191, 165, 255, 0.05)' }}>
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-white">
              The Future We Are Building
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              CoreID is creating the professional identity layer the world needs: Global, Portable, Verified, Interoperable, and Scalable.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="p-6 text-center bg-white/5 backdrop-blur-xl border-white/10">
                <CardContent className="p-0">
                  <div className="text-2xl font-bold mb-2" style={{ color: '#32f08c' }}>Global</div>
                  <p className="text-sm text-gray-300">Works across countries and platforms</p>
                </CardContent>
              </Card>
              <Card className="p-6 text-center bg-white/5 backdrop-blur-xl border-white/10">
                <CardContent className="p-0">
                  <div className="text-2xl font-bold mb-2" style={{ color: '#32f08c' }}>Unified</div>
                  <p className="text-sm text-gray-300">Single standard for millions of products</p>
                </CardContent>
              </Card>
              <Card className="p-6 text-center bg-white/5 backdrop-blur-xl border-white/10">
                <CardContent className="p-0">
                  <div className="text-2xl font-bold mb-2" style={{ color: '#32f08c' }}>API-Driven</div>
                  <p className="text-sm text-gray-300">Infrastructure-first architecture</p>
                </CardContent>
              </Card>
            </div>

            <Button 
              size="lg" 
              onClick={() => onNavigate('landing')}
              className="group"
            >
              Join Our Mission
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
