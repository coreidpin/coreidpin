import React from 'react';
import { motion } from 'motion/react';
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
      title: 'The Vision',
      description: 'Founded with the mission to bridge the gap between African talent and global opportunities through compliant, verifiable credentials.',
      icon: Lightbulb,
      color: 'bg-blue-500'
    },
    {
      year: '2023',
      title: 'First Partnership',
      description: 'Partnered with 5 Nigerian universities and established compliance frameworks with international regulatory bodies.',
      icon: Award,
      color: 'bg-emerald-500'
    },
    {
      year: '2024',
      title: 'Global Expansion',
      description: 'Expanded to serve 15+ countries with over 1,000 verified professionals and 100+ global employers.',
      icon: Globe,
      color: 'bg-purple-500'
    },
    {
      year: '2025',
      title: 'Market Leader',
      description: 'Became the leading platform for compliant African talent acquisition with 50,000+ verified professionals.',
      icon: TrendingUp,
      color: 'bg-orange-500'
    }
  ];

  const values = [
    {
      icon: Shield,
      title: 'Trust & Transparency',
      description: 'Every credential is verified through rigorous KYC, AML, and sanctions screening processes.'
    },
    {
      icon: Users,
      title: 'Inclusive Growth',
      description: 'Empowering African professionals with equal access to global opportunities and fair compensation.'
    },
    {
      icon: Target,
      title: 'Compliance First',
      description: 'Built from the ground up with international compliance standards and regulatory requirements.'
    },
    {
      icon: Heart,
      title: 'People-Centered',
      description: 'Focusing on human potential and creating meaningful connections between talent and opportunities.'
    }
  ];

  const team = [
    {
      name: 'Dr. Adebayo Ogundimu',
      role: 'Co-Founder & CEO',
      background: 'Former McKinsey Partner, Harvard MBA',
      expertise: 'Global Strategy & Compliance'
    },
    {
      name: 'Kemi Adeyemi',
      role: 'Co-Founder & CTO',
      background: 'Former Google Engineer, MIT Computer Science',
      expertise: 'Blockchain & Verification Systems'
    },
    {
      name: 'Prof. Chika Ezeilo',
      role: 'Chief Academic Officer',
      background: 'Former Registrar, University of Nigeria',
      expertise: 'Educational Standards & Accreditation'
    },
    {
      name: 'Samuel Okafor',
      role: 'Head of Compliance',
      background: 'Former CBN Regulatory Specialist',
      expertise: 'Financial Compliance & Risk Management'
    }
  ];

  const stats = [
    { label: 'Verified Professionals', value: '50,000+', growth: '+300% YoY' },
    { label: 'Global Employers', value: '2,500+', growth: '+250% YoY' },
    { label: 'Partner Universities', value: '150+', growth: '+400% YoY' },
    { label: 'Countries Served', value: '45+', growth: '+200% YoY' }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-4xl mx-auto"
        >
          <Badge variant="secondary" className="mb-4">
            Our Story
          </Badge>
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
            Bridging Africa to the World
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
 Born from the vision to unlock Africa's immense talent potential, CoreID is transforming
            how verified professionals connect with global opportunities through compliance-first technology.
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
      <section className="bg-primary/5 py-12">
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
                <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-sm lg:text-base text-muted-foreground mb-1">
                  {stat.label}
                </div>
                <div className="text-xs text-emerald-600 font-medium">
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
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Our Mission
          </h2>
          <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
            To create a transparent, compliant, and equitable ecosystem where African talent can seamlessly 
            access global opportunities while employers can confidently hire verified professionals with 
            complete regulatory compliance.
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
                <Card className="p-6 h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <value.icon className="h-8 w-8 text-primary mb-4" />
                    <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
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
      <section className="bg-muted/50 py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Our Journey
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From vision to reality - how we built the world's first unified platform 
              for compliant African talent acquisition.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-border md:transform md:-translate-x-0.5"></div>
              
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
                  <div className="absolute left-4 md:left-1/2 w-4 h-4 bg-primary rounded-full border-4 border-background md:transform md:-translate-x-1/2 z-10"></div>
                  
                  {/* Content */}
                  <div className={`ml-12 md:ml-0 md:w-1/2 ${index % 2 === 0 ? 'md:pr-8' : 'md:pl-8'}`}>
                    <Card className="p-6">
                      <CardContent className="p-0">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`p-2 rounded-lg ${milestone.color} text-white`}>
                            <milestone.icon className="h-5 w-5" />
                          </div>
                          <Badge variant="secondary">{milestone.year}</Badge>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">{milestone.title}</h3>
                        <p className="text-muted-foreground">{milestone.description}</p>
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
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Leadership Team
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
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
              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">{member.name}</h3>
                  <p className="text-sm text-primary mb-2">{member.role}</p>
                  <p className="text-xs text-muted-foreground mb-2">{member.background}</p>
                  <Badge variant="outline" className="text-xs">{member.expertise}</Badge>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Impact Section */}
      <section className="bg-primary/5 py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Our Impact
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Beyond numbers, we're creating real change in how African talent connects with global opportunities.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="p-6 text-center">
                <CardContent className="p-0">
                  <div className="text-2xl font-bold text-primary mb-2">$2.5B+</div>
                  <p className="text-sm text-muted-foreground">Economic value created for African professionals</p>
                </CardContent>
              </Card>
              <Card className="p-6 text-center">
                <CardContent className="p-0">
                  <div className="text-2xl font-bold text-primary mb-2">95%</div>
                  <p className="text-sm text-muted-foreground">Compliance success rate for international hiring</p>
                </CardContent>
              </Card>
              <Card className="p-6 text-center">
                <CardContent className="p-0">
                  <div className="text-2xl font-bold text-primary mb-2">48hrs</div>
                  <p className="text-sm text-muted-foreground">Average time for credential verification</p>
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