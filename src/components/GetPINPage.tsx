import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Phone, Shield, Zap, CheckCircle, ArrowRight, 
  Trophy, Globe, Briefcase, Star, Users 
} from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

export function GetPINPage() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');

  const handleGetStarted = () => {
    // Redirect to registration with phone pre-filled
    if (phone) {
      navigate(`/get-started?phone=${encodeURIComponent(phone)}`);
    } else {
      navigate('/get-started');
    }
  };

  const benefits = [
    {
      icon: Shield,
      title: 'Verified Identity',
      description: 'Prove who you are with a phone-verified professional identity',
      color: '#7bb8ff'
    },
    {
      icon: Globe,
      title: 'Work Anywhere',
      description: 'Your credentials travel with you across platforms and borders',
      color: '#32f08c'
    },
    {
      icon: Zap,
      title: 'Instant Trust',
      description: 'Skip lengthy verification processes with instant credential sharing',
      color: '#bfa5ff'
    },
    {
      icon: Trophy,
      title: 'Stand Out',
      description: 'Build your professional reputation with endorsements and badges',
      color: '#ffa500'
    }
  ];

  const useCases = [
    {
      icon: Briefcase,
      title: 'Job Applications',
      description: 'Apply faster with verified credentials',
      stat: '3x faster applications'
    },
    {
      icon: Users,
      title: 'Freelance Platforms',
      description: 'Build trust with clients instantly',
      stat: '60% more callbacks'
    },
    {
      icon: Star,
      title: 'Professional Networking',
      description: 'Connect with verified professionals',
      stat: '50K+ connections'
    }
  ];

  const steps = [
    {
      number: '1',
      title: 'Sign Up',
      description: 'Create your account with your phone number'
    },
    {
      number: '2',
      title: 'Verify',
      description: 'Confirm your identity via OTP'
    },
    {
      number: '3',
      title: 'Build Profile',
      description: 'Add your work history and skills'
    },
    {
      number: '4',
      title: 'Get Your PIN',
      description: 'Receive your unique GidiPIN and start using it'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="py-24 px-4 relative overflow-hidden" style={{ backgroundColor: '#0a0b0d' }}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(191,165,255,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(50,240,140,0.15),transparent_50%)]" />
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <Badge className="mb-6 px-6 py-2 text-base" style={{ backgroundColor: '#32f08c', color: '#0a0b0d', border: 'none' }}>
              <Phone className="w-4 h-4 mr-2" />
              Your Phone. Your Professional Identity.
            </Badge>
            
            <h1 className="text-5xl sm:text-7xl font-bold mb-6 text-white leading-tight">
              Get Your
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
                GidiPIN
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-white/80 max-w-3xl mx-auto mb-12">
              Turn your phone number into a verified professional passport.
              <br />
              One identity for all your career opportunities.
            </p>

            {/* Phone Input */}
            <div className="max-w-md mx-auto">
              <div className="flex gap-3 mb-6">
                <input
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1 px-6 py-4 rounded-lg text-lg border-2 border-white/20 bg-white/10 text-white placeholder-white/50 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                />
                <Button
                  onClick={handleGetStarted}
                  size="lg"
                  className="px-8 text-lg font-semibold"
                  style={{ backgroundColor: '#32f08c', color: '#0a0b0d' }}
                >
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
              
              <p className="text-sm text-white/60">
                ✓ Free forever  ✓ 2-minute setup  ✓ No credit card required
              </p>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto mt-16">
            {[
              { number: '50K+', label: 'Professionals' },
              { number: '1,200+', label: 'Companies' },
              { number: '15+', label: 'Countries' }
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
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

      {/* Benefits */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Why Get a GidiPIN?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              One verified identity that unlocks endless opportunities
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, i) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full border-gray-200 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div 
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                      style={{ backgroundColor: `${benefit.color}20` }}
                    >
                      <benefit.icon className="w-7 h-7" style={{ color: benefit.color }} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                    <p className="text-gray-600">{benefit.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Where You Can Use It</h2>
            <p className="text-xl text-gray-600">
              Your GidiPIN works everywhere you work
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {useCases.map((useCase, i) => (
              <motion.div
                key={useCase.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full border-gray-200">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center mx-auto mb-6">
                      <useCase.icon className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">{useCase.title}</h3>
                    <p className="text-gray-600 mb-4">{useCase.description}</p>
                    <Badge style={{ backgroundColor: '#32f08c20', color: '#059669', border: 'none' }}>
                      {useCase.stat}
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Get your GidiPIN in 4 simple steps</p>
          </motion.div>

          <div className="relative">
            {/* Connection Line */}
            <div className="absolute top-12 left-0 right-0 h-1 bg-gradient-to-r from-purple-200 via-blue-200 to-emerald-200 hidden md:block" style={{ top: '3rem' }} />
            
            <div className="grid md:grid-cols-4 gap-8 relative">
              {steps.map((step, i) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center relative"
                >
                  <div 
                    className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold relative z-10"
                    style={{ 
                      backgroundColor: i === 0 ? '#bfa5ff' : i === 1 ? '#7bb8ff' : i === 2 ? '#32f08c' : '#ffa500',
                      color: '#fff'
                    }}
                  >
                    {step.number}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm">{step.description}</p>
                </motion.div>
              ))}
            </div>
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
            <CheckCircle className="w-20 h-20 mx-auto mb-8 text-white" />
            <h2 className="text-5xl font-bold mb-6 text-white">
              Ready to Get Your GidiPIN?
            </h2>
            <p className="text-2xl text-white/90 mb-12">
              Join 50,000+ professionals already using GidiPIN
            </p>
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="text-xl px-12 py-6 h-auto"
              style={{ backgroundColor: '#fff', color: '#6366f1' }}
            >
              Get Started Now - It's Free
              <ArrowRight className="w-6 h-6 ml-3" />
            </Button>
            <p className="text-white/80 mt-6">
              Takes less than 2 minutes • No credit card required
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
