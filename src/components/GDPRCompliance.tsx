import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Shield, CheckCircle, FileText, Lock, Globe, UserCheck, AlertCircle, Download } from 'lucide-react';
import { Button } from './ui/button';

export function GDPRCompliance() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl">GDPR Compliance</h1>
              <p className="text-muted-foreground">General Data Protection Regulation</p>
            </div>
          </div>
          <Badge variant="secondary" className="mb-4">
            <Globe className="h-3 w-3 mr-1" />
            EU Data Protection Standards
          </Badge>
        </div>

        <div className="space-y-6">
          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Our Commitment to GDPR
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
  GidiPIN is committed to protecting the privacy and personal data of all users, including those in the European Union. We comply with the General Data Protection Regulation (GDPR) and have implemented comprehensive measures to ensure your data rights are respected and protected.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Legal Basis for Processing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground mb-3">
                We process your personal data based on the following legal grounds:
              </p>
              <div className="space-y-3">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold mb-1">Contractual Necessity</h4>
                      <p className="text-sm text-muted-foreground">
                        Processing is necessary to provide our EOR services, credential verification, and compliance checks as part of our service agreement with you.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold mb-1">Legal Obligation</h4>
                      <p className="text-sm text-muted-foreground">
                        Processing required to comply with KYC/AML regulations, tax laws, and other legal requirements in Nigeria and internationally.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold mb-1">Legitimate Interests</h4>
                      <p className="text-sm text-muted-foreground">
                        Processing necessary for fraud prevention, platform security, and improving our services, while respecting your rights and freedoms.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold mb-1">Consent</h4>
                      <p className="text-sm text-muted-foreground">
                        For marketing communications, optional cookies, and sharing data with third parties beyond our core services (consent can be withdrawn at any time).
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" />
                Your GDPR Rights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground mb-3">
                Under GDPR, you have the following rights regarding your personal data:
              </p>

              <div className="space-y-4">
                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs text-primary">1</span>
                    Right to Access
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    You can request a copy of all personal data we hold about you, including how it's being used and with whom it's being shared.
                  </p>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs text-primary">2</span>
                    Right to Rectification
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    You can request correction of inaccurate or incomplete personal data. You can update most information directly in your account settings.
                  </p>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs text-primary">3</span>
                    Right to Erasure ("Right to be Forgotten")
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    You can request deletion of your personal data, subject to legal obligations to retain certain records (e.g., tax compliance requires 7-year retention).
                  </p>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs text-primary">4</span>
                    Right to Restrict Processing
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    You can request that we limit how we use your data in certain circumstances, such as while we verify data accuracy.
                  </p>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs text-primary">5</span>
                    Right to Data Portability
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    You can request your personal data in a structured, commonly used, machine-readable format to transfer to another service provider.
                  </p>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs text-primary">6</span>
                    Right to Object
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    You can object to processing based on legitimate interests or for direct marketing purposes. We will stop processing unless we have compelling legitimate grounds.
                  </p>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs text-primary">7</span>
                    Right to Withdraw Consent
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Where processing is based on consent, you can withdraw it at any time. This won't affect the lawfulness of processing before withdrawal.
                  </p>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs text-primary">8</span>
                    Right to Lodge a Complaint
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    You have the right to file a complaint with your local data protection authority if you believe we've violated your GDPR rights.
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <h4 className="font-semibold mb-3">Exercise Your Rights</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  To exercise any of these rights, please contact our Data Protection Officer:
                </p>
                <Button className="w-full sm:w-auto">
                  <FileText className="h-4 w-4 mr-2" />
                  Submit Data Rights Request
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Data Protection Measures
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                We implement robust technical and organizational measures to protect your data:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-1 text-sm">Encryption</h4>
                  <p className="text-xs text-muted-foreground">
                    Data encrypted in transit (TLS 1.3) and at rest (AES-256)
                  </p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-1 text-sm">Access Controls</h4>
                  <p className="text-xs text-muted-foreground">
                    Role-based access with multi-factor authentication
                  </p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-1 text-sm">Regular Audits</h4>
                  <p className="text-xs text-muted-foreground">
                    Annual security audits and penetration testing
                  </p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-1 text-sm">Data Minimization</h4>
                  <p className="text-xs text-muted-foreground">
                    We only collect data necessary for our services
                  </p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-1 text-sm">Privacy by Design</h4>
                  <p className="text-xs text-muted-foreground">
                    Privacy considerations built into all new features
                  </p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-1 text-sm">Staff Training</h4>
                  <p className="text-xs text-muted-foreground">
                    Regular GDPR and data protection training for all staff
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                International Data Transfers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                When we transfer your data outside the EU/EEA, we ensure appropriate safeguards are in place:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Standard Contractual Clauses (SCCs) approved by the European Commission</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Data Processing Agreements with all third-party processors</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Transfers only to countries with adequate data protection levels</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Regular reviews of transfer mechanisms to ensure ongoing compliance</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                Data Breach Notification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-3">
                In the event of a data breach that is likely to result in a risk to your rights and freedoms:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>We will notify the relevant supervisory authority within 72 hours of becoming aware of the breach</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>We will notify affected individuals without undue delay if the breach poses a high risk</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>We will provide clear information about the breach, its likely consequences, and mitigation measures</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-primary" />
                Data Processing Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                We maintain detailed records of our data processing activities as required by GDPR Article 30. Upon request, we can provide:
              </p>
              <ul className="space-y-2 text-muted-foreground mb-4">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Categories of processing activities</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Categories of personal data processed</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Recipients of personal data</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Data retention periods</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Technical and organizational security measures</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Data Protection Officer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-3">
                Our Data Protection Officer is responsible for ensuring GDPR compliance and handling data protection inquiries:
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <strong>Email:</strong>
            <span className="text-muted-foreground">dpo@GidiPIN.work</span>
                </div>
                <div className="flex items-center gap-2">
                  <strong>Address:</strong>
            <span className="text-muted-foreground">Data Protection Officer, GidiPIN, Lagos, Nigeria</span>
                </div>
                <div className="flex items-center gap-2">
                  <strong>Response Time:</strong>
                  <span className="text-muted-foreground">Within 30 days of request</span>
                </div>
              </div>
              <div className="mt-4">
                <Button variant="outline" className="w-full sm:w-auto">
                  <FileText className="h-4 w-4 mr-2" />
                  Contact DPO
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Supervisory Authority</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-3">
                If you're not satisfied with our response to your data protection concerns, you have the right to lodge a complaint with your local supervisory authority:
              </p>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm">
                  <strong>For EU residents:</strong> Contact your national Data Protection Authority
                </p>
                <p className="text-sm mt-2">
                  <a href="https://edpb.europa.eu/about-edpb/about-edpb/members_en" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Find your Data Protection Authority →
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
