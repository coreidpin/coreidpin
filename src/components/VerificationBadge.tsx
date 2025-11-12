import React, { useState } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { 
  Shield, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  XCircle,
  Eye,
  Calendar,
  FileText,
  Globe,
  Lock,
  BadgeCheck,
  Award,
  RefreshCw
} from 'lucide-react';

export type VerificationStatus = 'verified' | 'pending' | 'required' | 'expired' | 'rejected';

interface VerificationData {
  status: VerificationStatus;
  completionPercentage: number;
  lastUpdated: string;
  expiryDate?: string;
  checks: {
    kyc: { status: 'pass' | 'fail' | 'pending'; completedAt?: string; };
    aml: { status: 'pass' | 'fail' | 'pending'; completedAt?: string; };
    sanctions: { status: 'pass' | 'fail' | 'pending'; completedAt?: string; };
    background: { status: 'pass' | 'fail' | 'pending'; completedAt?: string; };
    tax: { status: 'pass' | 'fail' | 'pending'; completedAt?: string; };
    workEligibility: { status: 'pass' | 'fail' | 'pending'; completedAt?: string; };
  };
  documents: {
    passport: { status: 'verified' | 'pending' | 'required'; uploadedAt?: string; };
    bankStatement: { status: 'verified' | 'pending' | 'required'; uploadedAt?: string; };
    proofOfAddress: { status: 'verified' | 'pending' | 'required'; uploadedAt?: string; };
    taxCertificate: { status: 'verified' | 'pending' | 'required'; uploadedAt?: string; };
  };
  certifications?: {
    name: string;
    issuer: string;
    verified: boolean;
    expiryDate?: string;
  }[];
}

interface VerificationBadgeProps {
  data: VerificationData;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  onRefresh?: () => void;
}

export function VerificationBadge({ data, size = 'md', showDetails = true, onRefresh }: VerificationBadgeProps) {
  const [showDialog, setShowDialog] = useState(false);

  const getBadgeConfig = (status: VerificationStatus) => {
    switch (status) {
      case 'verified':
        return {
          icon: Shield,
          text: 'Compliance Verified',
          variant: 'default' as const,
          className: 'bg-green-100 text-green-800 border-green-200',
          description: 'All regulatory requirements met for international employment'
        };
      case 'pending':
        return {
          icon: Clock,
          text: 'Verification Pending',
          variant: 'secondary' as const,
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          description: 'Compliance checks in progress'
        };
      case 'required':
        return {
          icon: AlertTriangle,
          text: 'Verification Required',
          variant: 'outline' as const,
          className: 'bg-orange-100 text-orange-800 border-orange-200',
          description: 'Additional documentation needed'
        };
      case 'expired':
        return {
          icon: RefreshCw,
          text: 'Verification Expired',
          variant: 'destructive' as const,
          className: 'bg-red-100 text-red-800 border-red-200',
          description: 'Verification needs renewal'
        };
      case 'rejected':
        return {
          icon: XCircle,
          text: 'Verification Failed',
          variant: 'destructive' as const,
          className: 'bg-red-100 text-red-800 border-red-200',
          description: 'Compliance requirements not met'
        };
      default:
        return {
          icon: Shield,
          text: 'Unknown Status',
          variant: 'outline' as const,
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          description: 'Status unknown'
        };
    }
  };

  const config = getBadgeConfig(data.status);
  const IconComponent = config.icon;

  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'text-xs px-2 py-1';
      case 'lg': return 'text-sm px-4 py-2';
      default: return 'text-sm px-3 py-1.5';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm': return 'h-3 w-3';
      case 'lg': return 'h-5 w-5';
      default: return 'h-4 w-4';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getCheckIcon = (status: 'pass' | 'fail' | 'pending') => {
    switch (status) {
      case 'pass': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'fail': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getDocumentIcon = (status: 'verified' | 'pending' | 'required') => {
    switch (status) {
      case 'verified': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'required': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
    }
  };

  const badgeContent = (
    <div className={`inline-flex items-center gap-2 rounded-full border font-medium ${config.className} ${getSizeClass()}`}>
      <IconComponent className={getIconSize()} />
      <span>{config.text}</span>
      {data.status === 'verified' && size !== 'sm' && (
        <BadgeCheck className="h-4 w-4" />
      )}
    </div>
  );

  if (!showDetails) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {badgeContent}
          </TooltipTrigger>
          <TooltipContent>
            <p>{config.description}</p>
            <p className="text-xs text-muted-foreground">
              {data.completionPercentage}% complete • Updated {formatDate(data.lastUpdated)}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <button className="inline-block">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                {badgeContent}
              </TooltipTrigger>
              <TooltipContent>
                <p>{config.description}</p>
                <p className="text-xs text-muted-foreground">Click for details</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Compliance Verification Details
          </DialogTitle>
          <DialogDescription>
            Comprehensive regulatory compliance status for international employment
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Status Overview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Verification Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IconComponent className="h-5 w-5" />
                  <span className="font-medium">{config.text}</span>
                </div>
                {onRefresh && (
                  <Button variant="outline" size="sm" onClick={onRefresh}>
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Refresh
                  </Button>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Completion Progress</span>
                  <span>{data.completionPercentage}%</span>
                </div>
                <Progress value={data.completionPercentage} className="h-2" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Last Updated:</span>
                  <div className="font-medium">{formatDate(data.lastUpdated)}</div>
                </div>
                {data.expiryDate && (
                  <div>
                    <span className="text-muted-foreground">Expires:</span>
                    <div className="font-medium">{formatDate(data.expiryDate)}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Compliance Checks */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Regulatory Compliance Checks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    {getCheckIcon(data.checks.kyc.status)}
                    <span className="text-sm">KYC Verification</span>
                  </div>
                  {data.checks.kyc.completedAt && (
                    <span className="text-xs text-muted-foreground">
                      {formatDate(data.checks.kyc.completedAt)}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    {getCheckIcon(data.checks.aml.status)}
                    <span className="text-sm">AML Screening</span>
                  </div>
                  {data.checks.aml.completedAt && (
                    <span className="text-xs text-muted-foreground">
                      {formatDate(data.checks.aml.completedAt)}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    {getCheckIcon(data.checks.sanctions.status)}
                    <span className="text-sm">Sanctions Check</span>
                  </div>
                  {data.checks.sanctions.completedAt && (
                    <span className="text-xs text-muted-foreground">
                      {formatDate(data.checks.sanctions.completedAt)}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    {getCheckIcon(data.checks.background.status)}
                    <span className="text-sm">Background Check</span>
                  </div>
                  {data.checks.background.completedAt && (
                    <span className="text-xs text-muted-foreground">
                      {formatDate(data.checks.background.completedAt)}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    {getCheckIcon(data.checks.tax.status)}
                    <span className="text-sm">Tax Compliance</span>
                  </div>
                  {data.checks.tax.completedAt && (
                    <span className="text-xs text-muted-foreground">
                      {formatDate(data.checks.tax.completedAt)}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    {getCheckIcon(data.checks.workEligibility.status)}
                    <span className="text-sm">Work Eligibility</span>
                  </div>
                  {data.checks.workEligibility.completedAt && (
                    <span className="text-xs text-muted-foreground">
                      {formatDate(data.checks.workEligibility.completedAt)}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Required Documents */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Required Documentation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    {getDocumentIcon(data.documents.passport.status)}
                    <span className="text-sm">Passport/ID Document</span>
                  </div>
                  <span className="text-xs text-muted-foreground capitalize">
                    {data.documents.passport.status}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    {getDocumentIcon(data.documents.bankStatement.status)}
                    <span className="text-sm">Bank Statement</span>
                  </div>
                  <span className="text-xs text-muted-foreground capitalize">
                    {data.documents.bankStatement.status}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    {getDocumentIcon(data.documents.proofOfAddress.status)}
                    <span className="text-sm">Proof of Address</span>
                  </div>
                  <span className="text-xs text-muted-foreground capitalize">
                    {data.documents.proofOfAddress.status}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    {getDocumentIcon(data.documents.taxCertificate.status)}
                    <span className="text-sm">Tax Certificate</span>
                  </div>
                  <span className="text-xs text-muted-foreground capitalize">
                    {data.documents.taxCertificate.status}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Certifications */}
          {data.certifications && data.certifications.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Verified Certifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.certifications.map((cert, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        {cert.verified ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Clock className="h-4 w-4 text-yellow-600" />
                        )}
                        <div>
                          <div className="text-sm font-medium">{cert.name}</div>
                          <div className="text-xs text-muted-foreground">{cert.issuer}</div>
                        </div>
                      </div>
                      {cert.expiryDate && (
                        <span className="text-xs text-muted-foreground">
                          Expires: {formatDate(cert.expiryDate)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Compliance Summary */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Globe className="h-4 w-4" />
              International Employment Readiness
            </h4>
            <p className="text-sm text-muted-foreground mb-3">
              This verification badge confirms compliance with international employment regulations, 
              including anti-money laundering, sanctions screening, tax compliance, and work eligibility 
              requirements for global remote work.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              Verification valid for 12 months from issue date
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Quick verification status component for lists/cards
export function QuickVerificationStatus({ status, size = 'sm' }: { status: VerificationStatus; size?: 'sm' | 'md' }) {
  const config = {
    verified: { icon: Shield, color: 'text-green-600', bg: 'bg-green-100' },
    pending: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    required: { icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-100' },
    expired: { icon: RefreshCw, color: 'text-red-600', bg: 'bg-red-100' },
    rejected: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' }
  }[status];

  const IconComponent = config.icon;
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
  const containerSize = size === 'sm' ? 'w-6 h-6' : 'w-8 h-8';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`${config.bg} ${containerSize} rounded-full flex items-center justify-center`}>
            <IconComponent className={`${iconSize} ${config.color}`} />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="capitalize">{status} Verification</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}