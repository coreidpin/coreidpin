import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ShieldCheck, Lock, Eye, Database, UserCheck, Globe } from 'lucide-react';

export function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl">Privacy Policy</h1>
              <p className="text-muted-foreground">Last updated: January 2025</p>
            </div>
          </div>
          <Badge variant="secondary" className="mb-4">
            <Lock className="h-3 w-3 mr-1" />
            Your Privacy Matters
          </Badge>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                Introduction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
At CoreID, we are committed to protecting your privacy and personal data. This Privacy Policy explains how we collect, use, share, and protect your information when you use our platform. We comply with the Nigeria Data Protection Regulation (NDPR), GDPR, and other applicable data protection laws.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Personal Information</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Name, email address, phone number</li>
                  <li>Professional credentials and educational certificates</li>
                  <li>Employment history and work experience</li>
                  <li>Government-issued identification documents (for KYC)</li>
                  <li>Tax identification numbers and banking information (for payroll)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Company Information (For Employers)</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Company name, registration number, and tax ID</li>
                  <li>Business address and contact information</li>
                  <li>Authorized representatives and their credentials</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Technical Information</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>IP address, browser type, and device information</li>
                  <li>Usage data and platform interactions</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Identity Verification:</strong> Conduct KYC/AML checks and sanctions screening to ensure compliance with regulatory requirements.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Employment Services:</strong> Facilitate hiring, payroll processing, and benefits administration through our EOR services.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Credential Verification:</strong> Issue, store, and verify blockchain-based digital credentials.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Platform Improvement:</strong> Analyze usage patterns to enhance user experience and develop new features.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Communication:</strong> Send service updates, security alerts, and marketing communications (with your consent).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Legal Compliance:</strong> Meet regulatory obligations and respond to legal requests from authorities.</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Information Sharing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We may share your information with:
              </p>
              <div className="space-y-3">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-1">Service Providers</h4>
                  <p className="text-sm text-muted-foreground">
                    Third-party vendors who assist with KYC verification, payment processing, cloud hosting, and other essential services.
                  </p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-1">Regulatory Authorities</h4>
                  <p className="text-sm text-muted-foreground">
                    Nigerian and international regulatory bodies as required by law (CBN, NIMC, FIRS, EFCC, etc.).
                  </p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-1">Employers and Professionals</h4>
                  <p className="text-sm text-muted-foreground">
                    With your explicit consent, we share verified credentials and compliance status with potential employers.
                  </p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-1">Business Transfers</h4>
                  <p className="text-sm text-muted-foreground">
                    In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Data Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We implement industry-standard security measures to protect your data:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>End-to-end encryption for sensitive data transmission</li>
                <li>Blockchain technology for credential immutability</li>
                <li>Multi-factor authentication for account access</li>
                <li>Regular security audits and penetration testing</li>
                <li>ISO 27001 and SOC 2 Type II compliance</li>
                <li>Secure data centers with 24/7 monitoring</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" />
                Your Rights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-3">
                Under NDPR and GDPR, you have the following rights:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Access:</strong> Request a copy of your personal data we hold</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Rectification:</strong> Correct inaccurate or incomplete data</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Erasure:</strong> Request deletion of your data (subject to legal obligations)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Portability:</strong> Receive your data in a machine-readable format</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Objection:</strong> Object to processing for marketing purposes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Restriction:</strong> Request limitation of processing in certain circumstances</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Data Retention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We retain your personal data for as long as necessary to provide our services and comply with legal obligations:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mt-3">
                <li>Active account data: Duration of account plus 7 years for tax compliance</li>
                <li>Credential verification records: Permanent (blockchain-based)</li>
                <li>Compliance and KYC records: 7 years after account closure</li>
                <li>Marketing data: Until consent is withdrawn</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                International Data Transfers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Your data may be transferred to and processed in countries outside Nigeria. We ensure appropriate safeguards are in place through:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mt-3">
                <li>Standard Contractual Clauses (SCCs) approved by relevant authorities</li>
                <li>Data Processing Agreements with all third-party vendors</li>
                <li>Adequate data protection mechanisms as required by NDPR and GDPR</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Our services are not intended for individuals under 18 years of age. We do not knowingly collect personal information from children. If you believe we have collected data from a child, please contact us immediately.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Contact Our Data Protection Officer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-2">
                For privacy-related questions or to exercise your rights:
              </p>
              <ul className="space-y-1 text-sm">
            <li><strong>Email:</strong> dpo@CoreID.work</li>
            <li><strong>Address:</strong> Data Protection Officer, CoreID, Lagos, Nigeria</li>
                <li><strong>Phone:</strong> +234 XXX XXX XXXX</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
