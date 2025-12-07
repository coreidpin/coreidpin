import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { 
  Shield, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Download, 
  Eye, 
  FileText, 
  Award, 
  Lock,
  BadgeCheck,
  Calendar,
  Fingerprint,
  CreditCard,
  Database,
  Globe,
  Zap
} from 'lucide-react';

interface CredentialStatusProps {
  userType: 'professional' | 'employer';
}

export function CredentialStatus({ userType }: CredentialStatusProps) {
  if (userType === 'professional') {
    return (
      <div className="space-y-6">
        {/* Compliance Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              Compliance Status
            </CardTitle>
            <CardDescription>
              Your credential verification and compliance readiness
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="font-semibold text-green-900 dark:text-green-100">Verified</div>
                <div className="text-sm text-green-700 dark:text-green-300">Ready to hire</div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="font-semibold text-blue-900 dark:text-blue-100">24-48hrs</div>
                <div className="text-sm text-blue-700 dark:text-blue-300">Expected hire time</div>
              </div>
              
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <AlertTriangle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <div className="font-semibold text-orange-900 dark:text-orange-100">Low Risk</div>
                <div className="text-sm text-orange-700 dark:text-orange-300">Compliance risk</div>
              </div>
            </div>
            
            {/* Trust Score */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Trust Score</span>
                <span className="text-sm text-muted-foreground">95/100</span>
              </div>
              <Progress value={95} className="h-2" />
              <p className="text-sm text-muted-foreground mt-1">
                Excellent • International employers can hire you with confidence
              </p>
            </div>
            
            {/* Government Verifications */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="flex items-center gap-2 p-3 bg-background rounded border">
                <Fingerprint className="h-4 w-4 text-green-600" />
                <div>
                  <div className="text-xs font-medium">NIN</div>
                  <Badge variant="secondary" className="h-5 text-xs">Verified</Badge>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-background rounded border">
                <CreditCard className="h-4 w-4 text-green-600" />
                <div>
                  <div className="text-xs font-medium">FIRS</div>
                  <Badge variant="secondary" className="h-5 text-xs">Verified</Badge>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-background rounded border">
                <Database className="h-4 w-4 text-green-600" />
                <div>
                  <div className="text-xs font-medium">PENCOM</div>
                  <Badge variant="secondary" className="h-5 text-xs">Verified</Badge>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-background rounded border">
                <Globe className="h-4 w-4 text-green-600" />
                <div>
                  <div className="text-xs font-medium">EFCC</div>
                  <Badge variant="secondary" className="h-5 text-xs">Clear</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Credentials Display */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-blue-600" />
              Digital Credentials
            </CardTitle>
            <CardDescription>
              Your verified certificates and achievements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sample Certificate 1 */}
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 hover:border-primary transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <Award className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">AWS Solutions Architect</h4>
                      <p className="text-xs text-muted-foreground">Amazon Web Services</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    <BadgeCheck className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                </div>
                
                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    Issued: Jan 2024
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Lock className="h-3 w-3" />
                    Blockchain Secured
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="text-xs h-7">
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs h-7">
                    <Download className="h-3 w-3 mr-1" />
                    Share
                  </Button>
                </div>
              </div>

              {/* Sample Certificate 2 */}
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 hover:border-primary transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Computer Science Degree</h4>
                      <p className="text-xs text-muted-foreground">University of Lagos</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    <BadgeCheck className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                </div>
                
                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    Graduated: 2022
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Lock className="h-3 w-3" />
                    Blockchain Secured
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="text-xs h-7">
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs h-7">
                    <Download className="h-3 w-3 mr-1" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trust Badges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Security & Compliance Badges
            </CardTitle>
            <CardDescription>
              Your security certifications and compliance status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-background rounded-lg border">
                <Lock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="font-medium text-sm">GDPR Compliant</div>
                <div className="text-xs text-muted-foreground">EU Data Protection</div>
              </div>
              
              <div className="text-center p-4 bg-background rounded-lg border">
                <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="font-medium text-sm">ISO 27001</div>
                <div className="text-xs text-muted-foreground">Security Standard</div>
              </div>
              
              <div className="text-center p-4 bg-background rounded-lg border">
                <Zap className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <div className="font-medium text-sm">Blockchain Verified</div>
                <div className="text-xs text-muted-foreground">Tamper-proof</div>
              </div>
              
              <div className="text-center p-4 bg-background rounded-lg border">
                <CheckCircle className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="font-medium text-sm">KYC Verified</div>
                <div className="text-xs text-muted-foreground">Identity Confirmed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Employer view
  return (
    <div className="space-y-6">
      {/* Hiring Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Compliance & Hiring Status
          </CardTitle>
          <CardDescription>
            Your platform compliance status and hiring readiness
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="font-semibold text-green-900 dark:text-green-100">Compliant</div>
              <div className="text-sm text-green-700 dark:text-green-300">Ready to hire</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="font-semibold text-blue-900 dark:text-blue-100">48hrs</div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Avg. verification time</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <Award className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="font-semibold text-purple-900 dark:text-purple-100">Premium</div>
              <div className="text-sm text-purple-700 dark:text-purple-300">EOR tier</div>
            </div>
          </div>
          
          {/* Company Compliance Score */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Company Compliance Score</span>
              <span className="text-sm text-muted-foreground">98/100</span>
            </div>
            <Progress value={98} className="h-2" />
            <p className="text-sm text-muted-foreground mt-1">
              Excellent • You can hire Nigerian professionals with full compliance
            </p>
          </div>
          
          {/* Regulatory Status */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex items-center gap-2 p-3 bg-background rounded border">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-xs font-medium">CBN</div>
                <Badge variant="secondary" className="h-5 text-xs">Approved</Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-background rounded border">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-xs font-medium">Tax</div>
                <Badge variant="secondary" className="h-5 text-xs">Compliant</Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-background rounded border">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-xs font-medium">EOR</div>
                <Badge variant="secondary" className="h-5 text-xs">Active</Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-background rounded border">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-xs font-medium">GDPR</div>
                <Badge variant="secondary" className="h-5 text-xs">Certified</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
