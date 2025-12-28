import React from 'react';
import { motion } from 'motion/react';
import { 
  Target, Heart, Users, Globe, Shield, Zap, 
  TrendingUp, Award, Linkedin, Twitter, Mail 
} from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

export function AboutPage() {
  const team = [
    {
      name: 'Adewale Ogunleye',
      role: 'Founder & CEO',
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=adewale',
      linkedin: '#',
      twitter: '#'
    },
    {
      name: 'Chinwe Okoro',
      role: 'CTO',
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chinwe',
      linkedin: '#',
      twitter: '#'
    },
    {
      name: 'Kwame Mensah',
      role: 'Head of Product',
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kwame',
      linkedin: '#',
      twitter: '#'
    },
    {
      name: 'Amara Nwosu',
      role: 'Head of Engineering',
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=amara',
      linkedin: '#',
      twitter: '#'
    }
  ];

  const values = [
    {
      icon: Shield,
      title: 'Trust First',
      description: 'We build products that prioritize security, privacy, and authentic verification.',
      color: '#7bb8ff'
    },
    {
      icon: Users,
      title: 'People-Centric',
      description: 'Every decision we make puts professionals and their opportunities at the center.',
      color: '#bfa5ff'
    },
    {
      icon: Globe,
      title: 'Global Mindset',
      description: 'We\'re building for Africa and the world, breaking down borders in professional identity.',
      color: '#32f08c'
    },
    {
      icon: Zap,
      title: 'Move Fast',
      description: 'Speed matters. We ship quickly, iterate constantly, and learn from every step.',
      color: '#7bb8ff'
    }
  ];

  const stats = [
    { number: '50K+', label: 'Verified Professionals' },
    { number: '1,200+', label: 'Companies Trust Us' },
    { number: '15+', label: 'Countries' },
    { number: '99.9%', label: 'Uptime SLA' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="py-24 px-4 relative overflow-hidden" style={{ backgroundColor: '#0a0b0d' }}>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(191,165,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(191,165,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px]" />
        
        <div className="container mx-auto max-w-7xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 px-4 py-2" style={{ backgroundColor: '#bfa5ff', color: '#0a0b0d', border: 'none' }}>
              About GidiPIN
            </Badge>
            <h1 className="text-5xl sm:text-6xl font-bold mb-6 text-white">
              Building Trust in the
              <br />
              <span style={{ color: '#32f08c' }}>Digital Economy</span>
            </h1>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              We're on a mission to create a world where professional identity is portable, 
              verifiable, and universally trusted.
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-bold mb-2" style={{ color: '#32f08c' }}>
                  {stat.number}
                </div>
                <div className="text-sm text-white/60">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6 text-center">Our Story</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                GidiPIN was born from a simple frustration: talented professionals across Africa 
                were struggling to prove their credentials when applying for opportunities across borders. 
                Every new platform, every new country, every new employer meant starting from scratch.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                We asked ourselves: <strong>What if your professional identity could travel with you?</strong>
              </p>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                Today, GidiPIN is transforming how professionals build trust in the digital economy. 
                We've created a phone-based verification system that turns your mobile number into a 
                verified professional passport—recognized by employers, platforms, and partners worldwide.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed">
                We're just getting started. Our vision is a world where trust is instant, borders are 
                invisible, and every professional has equal access to opportunities.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 px-4" style={{ backgroundColor: '#f9fafb' }}>
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-gray-200">
                <CardContent className="p-8">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: '#7bb8ff20' }}>
                    <Target className="w-8 h-8" style={{ color: '#7bb8ff' }} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                  <p className="text-gray-700 leading-relaxed">
                    To build a universal, privacy-preserving identity layer that turns phone numbers 
                    into trusted professional identities—empowering professionals, enabling businesses, 
                    and building trust in the digital economy.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-gray-200">
                <CardContent className="p-8">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: '#32f08c20' }}>
                    <TrendingUp className="w-8 h-8" style={{ color: '#32f08c' }} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
                  <p className="text-gray-700 leading-relaxed">
                    A world where professional identity is portable, verifiable, and universally trusted. 
                    Where borders don't limit opportunities. Where every talented person has equal access 
                    to the global digital economy.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we build
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full border-gray-200 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                      style={{ backgroundColor: `${value.color}20` }}
                    >
                      <value.icon className="w-6 h-6" style={{ color: value.color }} />
                    </div>
                    <h3 className="text-lg font-bold mb-2">{value.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 px-4" style={{ backgroundColor: '#0a0b0d' }}>
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4 text-white">Meet the Team</h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              We're a diverse team of builders, dreamers, and problem-solvers
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, i) => (
              <motion.div
               key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 transition-all">
                  <CardContent className="p-6 text-center">
                    <Avatar className="w-24 h-24 mx-auto mb-4">
                      <AvatarImage src={member.photo} />
                      <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <h3 className="font-bold text-lg text-white mb-1">{member.name}</h3>
                    <p className="text-white/60 text-sm mb-4">{member.role}</p>
                    <div className="flex justify-center gap-3">
                      <a href={member.linkedin} className="text-white/60 hover:text-white transition-colors">
                        <Linkedin className="w-5 h-5" />
                      </a>
                      <a href={member.twitter} className="text-white/60 hover:text-white transition-colors">
                        <Twitter className="w-5 h-5" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 bg-gradient-to-br from-purple-600 via-blue-600 to-emerald-600">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Award className="w-16 h-16 mx-auto mb-6 text-white" />
            <h2 className="text-4xl font-bold mb-6 text-white">
              Join Us on This Journey
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              We're always looking for talented people who want to build the future of professional identity
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/get-started"
                className="inline-block px-8 py-4 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Get Started Free
              </a>
              <a
                href="mailto:careers@gidipin.com"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors border-2 border-white"
              >
                <Mail className="w-5 h-5" />
                Join Our Team
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
