import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Check, 
  X,
  Shield, 
  Zap,
  Crown,
  Users,
  TrendingUp,
  Globe,
  ArrowRight,
  Sparkles,
  Lock,
  Headphones,
  Code,
  BarChart3,
  CheckCircle
} from 'lucide-react';

interface PricingPageProps {
  onNavigate: (page: string) => void;
}

export function PricingPage({ onNavigate }: PricingPageProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const plans = [
    {
      name: 'Free',
      icon: Shield,
      description: 'Perfect for individuals starting their professional journey',
      monthlyPrice: 0,
      annualPrice: 0,
      badge: null,
      color: '#7bb8ff',
      features: [
        { text: 'Create your Professional PIN', included: true },
        { text: 'Basic profile management', included: true },
        { text: 'Public PIN verification', included: true },
        { text: 'Mobile-optimized profile', included: true },
        { text: 'Up to 3 work experiences', included: true },
        { text: 'Up to 5 endorsements', included: true },
        { text: 'Community support', included: true },
        { text: 'Advanced analytics', included: false },
        { text: 'Custom PIN branding', included: false },
        { text: 'API access', included: false },
        { text: 'Priority verification', included: false }
      ],
      cta: 'Get Started Free',
      popular: false
    },
    {
      name: 'Professional',
      icon: Zap,
      description: 'For professionals who want to stand out',
      monthlyPrice: 9.99,
      annualPrice: 99,
      badge: 'MOST POPULAR',
      color: '#32f08c',
      features: [
        { text: 'Everything in Free', included: true },
        { text: 'Unlimited work experiences', included: true },
        { text: 'Unlimited endorsements', included: true },
        { text: 'Priority verification (24h)', included: true },
        { text: 'Custom PIN branding', included: true },
        { text: 'Advanced analytics dashboard', included: true },
        { text: 'Profile visitor insights', included: true },
        { text: 'Featured in search results', included: true },
        { text: 'Remove GidiPIN branding', included: true },
        { text: 'Export portfolio as PDF', included: true },
        { text: 'Email support', included: true }
      ],
      cta: 'Start Free Trial',
      popular: true
    },
    {
      name: 'Business',
      icon: Crown,
      description: 'For companies integrating professional verification',
      monthlyPrice: 49.99,
      annualPrice: 499,
      badge: 'BEST VALUE',
      color: '#bfa5ff',
      features: [
        { text: 'Everything in Professional', included: true },
        { text: 'API access (10,000 calls/mo)', included: true },
        { text: 'Bulk verification tools', included: true },
        { text: 'Team management (up to 10)', included: true },
        { text: 'Custom integrations', included: true },
        { text: 'Advanced security controls', included: true },
        { text: 'White-label options', included: true },
        { text: 'Dedicated account manager', included: true },
        { text: 'Priority phone support', included: true },
        { text: 'SLA guarantee (99.9%)', included: true },
        { text: 'Custom reporting', included: true }
      ],
      cta: 'Start 14-Day Trial',
      popular: false
    },
    {
      name: 'Enterprise',
      icon: Globe,
      description: 'For large organizations with custom needs',
      monthlyPrice: null,
      annualPrice: null,
      badge: 'CUSTOM',
      color: '#ffa500',
      features: [
        { text: 'Everything in Business', included: true },
        { text: 'Unlimited API calls', included: true },
        { text: 'Unlimited team members', included: true },
        { text: 'Custom SLA agreements', included: true },
        { text: 'On-premise deployment option', included: true },
        { text: 'Advanced compliance tools', included: true },
        { text: 'SAML/SSO integration', included: true },
        { text: 'Custom feature development', included: true },
        { text: 'Dedicated infrastructure', included: true },
        { text: '24/7 premium support', included: true },
        { text: 'Training & onboarding', included: true }
      ],
      cta: 'Contact Sales',
      popular: false
    }
  ];

  const features = [
    {
      icon: Shield,
      title: 'Enterprise-Grade Security',
      description: 'Bank-level encryption, GDPR compliant, ISO certified'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Global CDN, 99.9% uptime, sub-100ms response times'
    },
    {
      icon: Headphones,
      title: '24/7 Support',
      description: 'Expert support team available around the clock'
    },
    {
      icon: Lock,
      title: 'Privacy First',
      description: 'Your data is yours. We never sell or share your information'
    }
  ];

  const faqs = [
    {
      question: 'Can I change plans at any time?',
      answer: 'Yes! You can upgrade, downgrade, or cancel your plan at any time. Changes take effect immediately, and we prorate any billing differences.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, Amex), PayPal, bank transfers, and cryptocurrency for annual plans.'
    },
    {
      question: 'Is there a free trial?',
      answer: 'Yes! Professional and Business plans come with a 14-day free trial. No credit card required to start.'
    },
    {
      question: 'What happens to my data if I cancel?',
      answer: 'You can export all your data before canceling. We retain your data for 90 days after cancellation in case you want to return. After that, it\'s permanently deleted.'
    },
    {
      question: 'Do you offer discounts for nonprofits or education?',
      answer: 'Yes! We offer 50% discounts for verified nonprofits and educational institutions. Contact our sales team for details.'
    },
    {
      question: 'Can I get a refund?',
      answer: 'We offer a 30-day money-back guarantee on all paid plans. If you\'re not satisfied, we\'ll refund your payment, no questions asked.'
    }
  ];

  const getPrice = (plan: typeof plans[0]) => {
    if (plan.monthlyPrice === null) return 'Custom';
    const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
    const monthly = billingCycle === 'annual' ? price / 12 : price;
    return `$${monthly.toFixed(2)}`;
  };

  const getSavings = (plan: typeof plans[0]) => {
    if (plan.monthlyPrice === null || plan.monthlyPrice === 0) return null;
    const monthlyTotal = plan.monthlyPrice * 12;
    const savings = monthlyTotal - plan.annualPrice;
    const percentage = Math.round((savings / monthlyTotal) * 100);
    return billingCycle === 'annual' ? `Save ${percentage}%` : null;
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0b0d' }}>
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-4xl mx-auto"
        >
          <Badge className="mb-4 px-4 py-2" style={{ backgroundColor: '#7bb8ff', color: '#0a0b0d', border: 'none' }}>
            Transparent Pricing
          </Badge>
          <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-white">
            Choose Your Perfect Plan
          </h1>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Whether you're a professional building your brand or a business verifying identities at scale, 
            we have a plan that fits your needs. Start free, upgrade when you're ready.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-3 p-1 rounded-lg mb-12" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                billingCycle === 'monthly' 
                  ? 'text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
              style={billingCycle === 'monthly' ? { backgroundColor: '#7bb8ff' } : {}}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-2 rounded-lg font-medium transition-all relative ${
                billingCycle === 'annual' 
                  ? 'text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
              style={billingCycle === 'annual' ? { backgroundColor: '#32f08c' } : {}}
            >
              Annual
              <Badge className="absolute -top-2 -right-2 px-2 py-0.5 text-xs" style={{ backgroundColor: '#ffa500', color: '#fff', border: 'none' }}>
                Save 20%
              </Badge>
            </button>
          </div>
        </motion.div>
      </section>

      {/* Pricing Cards */}
      <section className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative ${plan.popular ? 'lg:-mt-4 lg:mb-4' : ''}`}
            >
              <Card 
                className={`h-full flex flex-col border-2 transition-all duration-300 hover:shadow-2xl ${
                  plan.popular 
                    ? 'shadow-xl scale-105' 
                    : ''
                }`}
                style={{
                  backgroundColor: plan.popular ? 'rgba(50, 240, 140, 0.05)' : 'rgba(255, 255, 255, 0.03)',
                  borderColor: plan.popular ? plan.color : 'rgba(255, 255, 255, 0.1)'
                }}
              >
                <CardContent className="p-6 flex-1 flex flex-col">
                  {/* Badge */}
                  {plan.badge && (
                    <Badge 
                      className="mb-4 w-fit px-3 py-1 text-xs font-bold border-none"
                      style={{ backgroundColor: plan.color, color: '#0a0b0d' }}
                    >
                      {plan.badge}
                    </Badge>
                  )}

                  {/* Icon & Name */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-lg" style={{ backgroundColor: `${plan.color}20` }}>
                      <plan.icon className="h-6 w-6" style={{ color: plan.color }} />
                    </div>
                    <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-400 mb-6">{plan.description}</p>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-white">{getPrice(plan)}</span>
                      {plan.monthlyPrice !== null && (
                        <span className="text-gray-400">
                          /{billingCycle === 'monthly' ? 'mo' : 'mo*'}
                        </span>
                      )}
                    </div>
                    {getSavings(plan) && (
                      <Badge className="mt-2 px-2 py-1 text-xs" style={{ backgroundColor: '#32f08c', color: '#0a0b0d', border: 'none' }}>
                        {getSavings(plan)}
                      </Badge>
                    )}
                    {billingCycle === 'annual' && plan.annualPrice > 0 && (
                      <p className="text-xs text-gray-500 mt-1">*Billed ${plan.annualPrice}/year</p>
                    )}
                  </div>

                  {/* CTA Button */}
                  <Button 
                    className="w-full mb-6 group"
                    onClick={() => onNavigate(plan.monthlyPrice === null ? 'contact' : 'register')}
                    style={plan.popular ? { backgroundColor: plan.color, color: '#0a0b0d' } : {}}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    {plan.cta}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>

                  {/* Features */}
                  <div className="space-y-3 flex-1">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-2">
                        {feature.included ? (
                          <Check className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: '#32f08c' }} />
                        ) : (
                          <X className="h-5 w-5 flex-shrink-0 mt-0.5 text-gray-600" />
                        )}
                        <span className={`text-sm ${feature.included ? 'text-gray-300' : 'text-gray-600'}`}>
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16" style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-white">
              Why Choose GidiPIN?
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              All plans include these core features to ensure the best experience
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 text-center h-full bg-white/5 backdrop-blur-xl border-white/10 hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(123, 184, 255, 0.1)' }}>
                      <feature.icon className="h-6 w-6" style={{ color: '#7bb8ff' }} />
                    </div>
                    <h3 className="font-semibold mb-2 text-white">{feature.title}</h3>
                    <p className="text-sm text-gray-400">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Got questions? We've got answers.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="bg-white/5 backdrop-blur-xl border-white/10 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 flex-shrink-0 mt-1" style={{ color: '#32f08c' }} />
                    <div>
                      <h3 className="font-semibold mb-2 text-white">{faq.question}</h3>
                      <p className="text-sm text-gray-400">{faq.answer}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24" style={{ backgroundColor: 'rgba(123, 184, 255, 0.05)' }}>
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-white">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              Join thousands of professionals and businesses already using GidiPIN
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => onNavigate('register')}
                className="group"
                style={{ backgroundColor: '#32f08c', color: '#0a0b0d' }}
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => onNavigate('contact')}
                className="text-white border-white/20"
              >
                Contact Sales
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
