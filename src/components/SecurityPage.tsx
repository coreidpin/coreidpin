import React from 'react';
import { motion } from 'motion/react';
import { 
  Shield, Lock, Eye, Database, Server, Key, 
  CheckCircle, FileText, AlertCircle, Users,
  Fingerprint, Cloud, Globe, Award
} from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';

export function SecurityPage() {
  const securityFeatures = [
    {
      icon: Lock,
      title: 'End-to-End Encryption',
      description: 'All data transmitted between your device and our servers is encrypted using industry-standard TLS 1.3 protocol.',
      color: '#7bb8ff'
    },
    {
      icon: Key,
      title: 'API Key Security',
      description: 'API keys are hashed using bcrypt with per-key salts. Keys are never stored or logged in plain text.',
      color: '#bfa5ff'
    },
    {
      icon: Database,
      title: 'Encrypted at Rest',
      description: 'All sensitive data is encrypted at rest using AES-256 encryption in our secure database infrastructure.',
      color: '#32f08c'
    },
    {
      icon: Fingerprint,
      title: 'Multi-Factor Authentication',
      description: 'Protect your account with SMS-based OTP verification and optional authenticator app support.',
      color: '#ffa500'
    },
    {
      icon: Server,
      title: 'Secure Infrastructure',
      description: 'Hosted on enterprise-grade Supabase infrastructure with automatic backups and 99.9% uptime SLA.',
      color: '#7bb8ff'
    },
    {
      icon: Eye,
      title: 'Privacy by Design',
      description: 'We collect only what we need. You control who sees your data and can revoke access anytime.',
      color: '#bfa5ff'
    }
  ];

  const compliance = [
    {
      icon: Shield,
      title: 'GDPR Compliant',
      description: 'Full compliance with EU General Data Protection Regulation',
      status: 'Certified'
    },
    {
      icon: FileText,
      title: 'SOC 2 Type II',
      description: 'Annual third-party audits of security controls',
      status: 'In Progress'
    },
    {
      icon: Globe,
      title: 'ISO 27001',
      description: 'Information security management certification',
      status: 'Planned 2024'
    },
    {
      icon: Award,
      title: 'NDPR',
      description: 'Nigeria Data Protection Regulation compliance',
      status: 'Certified'
    }
  ];

  const dataProtection = [
    {
      title: 'Data Minimization',
      description: 'We only collect data necessary to provide our services. No tracking, no unnecessary data collection.'
    },
    {
      title: 'User Control',
      description: 'You own your data. Download, delete, or export your information anytime from your dashboard.'
    },
    {
      title: 'Consent Management',
      description: 'Granular consent controls for sharing your professional data with third parties.'
    },
    {
      title: 'Data Retention',
      description: 'Inactive accounts are automatically deleted after 24 months. Active data is retained as per your preferences.'
    }
  ];

  const trustIndicators = [
    { metric: '99.9%', label: 'Uptime SLA' },
    { metric: '< 2hrs', label: 'Incident Response' },
    { metric: '256-bit', label: 'Encryption Standard' },
    { metric: '24/7', label: 'Security Monitoring' }
  ];

  const securityPractices = [
    {
      icon: Users,
      title: 'Access Control',
      items: [
        'Role-based access control (RBAC)',
        'Principle of least privilege',
        'Regular access reviews',
        'Session management and automatic logout'
      ]
    },
    {
      icon: Cloud,
      title: 'Infrastructure Security',
      items: [
        'DDoS protection via Cloudflare',
        'Web application firewall (WAF)',
        'Regular security patches and updates',
        'Isolated production environments'
      ]
    },
    {
      icon: AlertCircle,
      title: 'Incident Response',
      items: [
        '24/7 security monitoring',
        'Automated threat detection',
        'Incident response playbooks',
        'Transparent breach notification'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="py-24 px-4" style={{ backgroundColor: '#0a0b0d' }}>
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 px-4 py-2" style={{ backgroundColor: '#7bb8ff', color: '#0a0b0d', border: 'none' }}>
              <Shield className="w-4 h-4 mr-2" />
              Security & Privacy
            </Badge>
            <h1 className="text-5xl sm:text-6xl font-bold mb-6 text-white">
              Your Security is
              <br />
              <span style={{ color: '#32f08c' }}>Our Priority</span>
            </h1>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              We use enterprise-grade security to protect your professional identity and personal data
            </p>
          </motion.div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {trustIndicators.map((indicator, i) => (
              <motion.div
                key={indicator.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold mb-2" style={{ color: '#32f08c' }}>
                      {indicator.metric}
                    </div>
                    <div className="text-sm text-white/60">{indicator.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Security Features</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Multiple layers of protection to keep your data safe
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {securityFeatures.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full border-gray-200 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                      style={{ backgroundColor: `${feature.color}20` }}
                    >
                      <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
                    </div>
                    <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Compliance & Certifications</h2>
            <p className="text-xl text-gray-600">
              Meeting international standards for data protection and security
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {compliance.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full border-gray-200">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mx-auto mb-4">
                      <item.icon className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="font-bold mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                    <Badge
                      style={{
                        backgroundColor: item.status === 'Certified' ? '#32f08c20' : '#ffa50020',
                        color: item.status === 'Certified' ? '#059669' : '#d97706',
                        border: 'none'
                      }}
                    >
                      {item.status}
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Protection */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Data Protection Principles</h2>
            <p className="text-xl text-gray-600">
              How we handle and protect your information
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {dataProtection.map((principle, i) => (
              <motion.div
                key={principle.title}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 flex-shrink-0 mt-1" style={{ color: '#32f08c' }} />
                      <div>
                        <h3 className="font-bold mb-2">{principle.title}</h3>
                        <p className="text-gray-600 text-sm">{principle.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Practices */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Security Practices</h2>
            <p className="text-xl text-gray-600">
              Industry best practices we follow every day
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {securityPractices.map((practice, i) => (
              <motion.div
                key={practice.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full border-gray-200">
                  <CardContent className="p-6">
                    <practice.icon className="w-10 h-10 mb-4" style={{ color: '#7bb8ff' }} />
                    <h3 className="text-xl font-bold mb-4">{practice.title}</h3>
                    <ul className="space-y-2">
                      {practice.items.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#32f08c' }} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Responsible Disclosure */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="border-2" style={{ borderColor: '#7bb8ff' }}>
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#7bb8ff20' }}>
                  <AlertCircle className="w-6 h-6" style={{ color: '#7bb8ff' }} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3">Responsible Disclosure</h3>
                  <p className="text-gray-700 mb-4">
                    Found a security vulnerability? We appreciate responsible disclosure and will work with
                    security researchers to verify and address issues promptly.
                  </p>
                  <p className="text-gray-700 mb-4">
                    <strong>Please report security issues to:</strong>
                    <br />
                    <a href="mailto:security@gidipin.com" className="text-blue-600 hover:underline">
                      security@gidipin.com
                    </a>
                  </p>
                  <p className="text-sm text-gray-600">
                    We commit to acknowledging reports within 48 hours and providing updates every 7 days
                    until resolution.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 bg-gradient-to-br from-blue-600 to-purple-600">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Shield className="w-16 h-16 mx-auto mb-6 text-white" />
            <h2 className="text-4xl font-bold mb-6 text-white">
              Questions About Security?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Our security team is here to help answer your questions
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/contact">
                <button className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
                  Contact Security Team
                </button>
              </a>
              <a href="/docs">
                <button className="px-8 py-4 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors border-2 border-white">
                  View Documentation
                </button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
