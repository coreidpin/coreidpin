import React from 'react';
import { motion } from 'motion/react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Shield, 
  Lock,
  CheckCircle,
  FileText,
  Globe,
  Users,
  Eye,
  Database,
  Key,
  AlertCircle,
  Award,
  Clock,
  ArrowRight,
  Download,
  Scale,
  Fingerprint,
  ServerCog,
  ShieldCheck,
  BookOpen,
  Building
} from 'lucide-react';

interface CompliancePageProps {
  onNavigate: (page: string) => void;
}

export function CompliancePage({ onNavigate }: CompliancePageProps) {
  const certifications = [
    {
      icon: ShieldCheck,
      title: 'GDPR Compliant',
      description: 'Full compliance with EU General Data Protection Regulation',
      status: 'Active',
      color: '#32f08c',
      details: [
        'Data subject rights implementation',
        'Privacy by design and default',
        'Right to be forgotten',
        'Data portability',
        'Consent management'
      ]
    },
    {
      icon: Scale,
      title: 'NDPR Compliant',
      description: 'Nigeria Data Protection Regulation compliance',
      status: 'Active',
      color: '#7bb8ff',
      details: [
        'Local data protection laws',
        'Cross-border data transfer',
        'Nigerian regulatory standards',
        'NITDA compliance',
        'Local data residency options'
      ]
    },
    {
      icon: Award,
      title: 'ISO 27001',
      description: 'Information Security Management System certification',
      status: 'Certified',
      color: '#bfa5ff',
      details: [
        'Risk assessment procedures',
        'Security controls',
        'Incident management',
        'Business continuity',
        'Regular audits'
      ]
    },
    {
      icon: Lock,
      title: 'SOC 2 Type II',
      description: 'Service Organization Control 2 certification',
      status: 'In Progress',
      color: '#ffa500',
      details: [
        'Security controls',
        'Availability monitoring',
        'Processing integrity',
        'Confidentiality measures',
        'Privacy protection'
      ]
    }
  ];

  const securityMeasures = [
    {
      icon: Database,
      title: 'Data Encryption',
      description: 'End-to-end encryption for all data in transit and at rest using AES-256 and TLS 1.3'
    },
    {
      icon: Key,
      title: 'Access Control',
      description: 'Multi-factor authentication, role-based access control, and principle of least privilege'
    },
    {
      icon: Eye,
      title: 'Audit Logging',
      description: 'Comprehensive logging of all system activities, data access, and administrative actions'
    },
    {
      icon: ServerCog,
      title: 'Infrastructure Security',
      description: 'Cloud-native architecture with DDoS protection, WAF, and continuous monitoring'
    },
    {
      icon: Fingerprint,
      title: 'Identity Verification',
      description: 'Multi-layer identity verification with biometric options and fraud detection'
    },
    {
      icon: Clock,
      title: 'Regular Audits',
      description: 'Quarterly security audits, penetration testing, and vulnerability assessments'
    }
  ];

  const privacyPrinciples = [
    {
      title: 'Data Minimization',
      description: 'We collect only the data necessary to provide our services. No excessive data collection.',
      icon: Shield
    },
    {
      title: 'Purpose Limitation',
      description: 'Data is used only for the purposes explicitly stated and agreed upon by users.',
      icon: FileText
    },
    {
      title: 'Transparency',
      description: 'Clear, accessible privacy policies and communications about data handling practices.',
      icon: Eye
    },
    {
      title: 'User Control',
      description: 'Users have full control over their data with easy access, export, and deletion options.',
      icon: Users
    }
  ];

  const compliance_frameworks = [
    { name: 'GDPR', region: 'European Union', status: 'Compliant' },
    { name: 'NDPR', region: 'Nigeria', status: 'Compliant' },
    { name: 'CCPA', region: 'California, USA', status: 'Compliant' },
    { name: 'POPIA', region: 'South Africa', status: 'Compliant' },
    { name: 'LGPD', region: 'Brazil', status: 'In Progress' },
    { name: 'PDPA', region: 'Singapore', status: 'In Progress' }
  ];

  const dataRights = [
    {
      icon: Eye,
      title: 'Right to Access',
      description: 'Request and receive a copy of all personal data we hold about you'
    },
    {
      icon: FileText,
      title: 'Right to Rectification',
      description: 'Correct inaccurate or incomplete personal data at any time'
    },
    {
      icon: AlertCircle,
      title: 'Right to Erasure',
      description: 'Request deletion of your personal data (right to be forgotten)'
    },
    {
      icon: Download,
      title: 'Right to Portability',
      description: 'Export your data in a structured, machine-readable format'
    },
    {
      icon: Shield,
      title: 'Right to Object',
      description: 'Object to processing of your personal data for specific purposes'
    },
    {
      icon: Lock,
      title: 'Right to Restrict',
      description: 'Request restriction of processing under certain circumstances'
    }
  ];

  const documents = [
    {
      title: 'Privacy Policy',
      description: 'Comprehensive overview of how we collect, use, and protect your data',
      link: '/privacy',
      icon: FileText,
      updated: '2025-01-15'
    },
    {
      title: 'Terms of Service',
      description: 'Legal terms and conditions governing the use of GidiPIN services',
      link: '/terms',
      icon: BookOpen,
      updated: '2025-01-15'
    },
    {
      title: 'Cookie Policy',
      description: 'Details about cookies and tracking technologies we use',
      link: '/cookies',
      icon: Globe,
      updated: '2025-01-10'
    },
    {
      title: 'Data Processing Agreement',
      description: 'DPA for business customers and partners (GDPR Article 28)',
      link: '/dpa',
      icon: Building,
      updated: '2025-01-01'
    },
    {
      title: 'Security White Paper',
      description: 'Technical documentation of our security architecture and practices',
      link: '/security',
      icon: Shield,
      updated: '2024-12-20'
    },
    {
      title: 'Compliance Certifications',
      description: 'Download our compliance certificates and audit reports',
      link: '/certifications',
      icon: Award,
      updated: '2024-12-15'
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
          <Badge className="mb-4 px-4 py-2" style={{ backgroundColor: '#32f08c', color: '#0a0b0d', border: 'none' }}>
            <Shield className="w-4 h-4 mr-2 inline" />
            Trust & Compliance
          </Badge>
          <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-white">
            Security & Compliance You Can Trust
          </h1>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            GidiPIN is committed to the highest standards of data protection, privacy, and security. 
            We maintain compliance with global regulations to ensure your data is always safe.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => onNavigate('contact')}
              className="group"
              style={{ backgroundColor: '#32f08c', color: '#0a0b0d' }}
            >
              Contact Our Security Team
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => onNavigate('security')}
              className="text-white border-white/20"
            >
              View Security Details
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Certifications Section */}
      <section className="py-16" style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-white">
              Our Certifications & Standards
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              We maintain the highest industry certifications to ensure your data security and privacy
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {certifications.map((cert, index) => (
              <motion.div
                key={cert.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full bg-white/5 backdrop-blur-xl border-white/10 hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-lg" style={{ backgroundColor: `${cert.color}20` }}>
                        <cert.icon className="h-6 w-6" style={{ color: cert.color }} />
                      </div>
                      <Badge 
                        className="px-2 py-1 text-xs border-none"
                        style={{ 
                          backgroundColor: cert.status === 'Active' || cert.status === 'Certified' 
                            ? '#32f08c' 
                            : '#ffa500',
                          color: '#0a0b0d'
                        }}
                      >
                        {cert.status}
                      </Badge>
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-white">{cert.title}</h3>
                    <p className="text-sm text-gray-400 mb-4">{cert.description}</p>
                    <ul className="space-y-2">
                      {cert.details.map((detail, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-gray-400">
                          <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: cert.color }} />
                          <span>{detail}</span>
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

      {/* Security Measures Section */}
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-white">
            Enterprise-Grade Security Measures
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Multi-layered security architecture protecting your data at every level
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {securityMeasures.map((measure, index) => (
            <motion.div
              key={measure.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 h-full bg-white/5 backdrop-blur-xl border-white/10 hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(123, 184, 255, 0.1)' }}>
                    <measure.icon className="h-6 w-6" style={{ color: '#7bb8ff' }} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-white">{measure.title}</h3>
                  <p className="text-sm text-gray-400">{measure.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Privacy Principles Section */}
      <section className="py-16" style={{ backgroundColor: 'rgba(191, 165, 255, 0.05)' }}>
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-white">
              Our Privacy Principles
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              We're committed to protecting your privacy at every step
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {privacyPrinciples.map((principle, index) => (
              <motion.div
                key={principle.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 text-center h-full bg-white/5 backdrop-blur-xl border-white/10">
                  <CardContent className="p-0">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(191, 165, 255, 0.1)' }}>
                      <principle.icon className="h-6 w-6" style={{ color: '#bfa5ff' }} />
                    </div>
                    <h3 className="font-semibold mb-2 text-white">{principle.title}</h3>
                    <p className="text-sm text-gray-400">{principle.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Global Compliance Section */}
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-white">
            Global Regulatory Compliance
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Meeting data protection standards across multiple jurisdictions
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/5 backdrop-blur-xl border-white/10 overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white">Framework</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white">Region</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {compliance_frameworks.map((framework, index) => (
                      <motion.tr
                        key={framework.name}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4 text-gray-300 font-medium">{framework.name}</td>
                        <td className="px-6 py-4 text-gray-400">{framework.region}</td>
                        <td className="px-6 py-4">
                          <Badge 
                            className="px-2 py-1 text-xs border-none"
                            style={{ 
                              backgroundColor: framework.status === 'Compliant' ? '#32f08c' : '#ffa500',
                              color: '#0a0b0d'
                            }}
                          >
                            {framework.status}
                          </Badge>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Data Rights Section */}
      <section className="py-16" style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-white">
              Your Data Rights
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              You have full control over your personal data
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {dataRights.map((right, index) => (
              <motion.div
                key={right.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 h-full bg-white/5 backdrop-blur-xl border-white/10 hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <right.icon className="h-8 w-8 mb-3" style={{ color: '#32f08c' }} />
                    <h3 className="text-lg font-semibold mb-2 text-white">{right.title}</h3>
                    <p className="text-sm text-gray-400">{right.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-8"
          >
            <p className="text-gray-400 mb-4">
              To exercise any of these rights, contact our Data Protection Officer
            </p>
            <Button 
              onClick={() => onNavigate('contact')}
              style={{ backgroundColor: '#7bb8ff', color: '#fff' }}
            >
              Submit Data Request
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Documentation Section */}
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-white">
            Legal & Compliance Documentation
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Access our complete legal and compliance documentation
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {documents.map((doc, index) => (
            <motion.div
              key={doc.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 h-full bg-white/5 backdrop-blur-xl border-white/10 hover:shadow-lg transition-all duration-300 group cursor-pointer">
                <CardContent className="p-0">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(123, 184, 255, 0.1)' }}>
                      <doc.icon className="h-5 w-5" style={{ color: '#7bb8ff' }} />
                    </div>
                    <Download className="h-4 w-4 text-gray-500 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-white group-hover:text-blue-400 transition-colors">
                    {doc.title}
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">{doc.description}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>Updated {doc.updated}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24" style={{ backgroundColor: 'rgba(50, 240, 140, 0.05)' }}>
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-white">
              Questions About Our Compliance?
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              Our compliance and security teams are here to answer your questions and provide 
              detailed information about our data protection practices.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => onNavigate('contact')}
                className="group"
                style={{ backgroundColor: '#32f08c', color: '#0a0b0d' }}
              >
                Contact Compliance Team
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => onNavigate('privacy')}
                className="text-white border-white/20"
              >
                Read Privacy Policy
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
