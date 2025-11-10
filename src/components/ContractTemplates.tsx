import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  FileText, 
  Download, 
  Eye, 
  Edit, 
  Shield, 
  CheckCircle, 
  Clock, 
  DollarSign,
  Users,
  Building,
  Scale,
  Gavel,
  AlertTriangle,
  Info
} from 'lucide-react';

interface ContractTemplatesProps {
  userType: 'professional' | 'employer';
}

export function ContractTemplates({ userType }: ContractTemplatesProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const templates = [
    {
      id: 'standard-employment',
      title: 'Standard Employment Contract',
      description: 'Full-time employment with Nigerian compliance',
      type: 'Employment',
      duration: 'Permanent',
      compliance: ['CBN', 'FIRS', 'PENCOM', 'Labour Act'],
      features: ['Pension contributions', 'Tax withholding', 'Leave provisions', 'Termination clauses']
    },
    {
      id: 'contractor-agreement',
      title: 'Independent Contractor Agreement',
      description: 'Project-based work with compliance clauses',
      type: 'Contract',
      duration: 'Project-based',
      compliance: ['Tax obligations', 'IP protection', 'GDPR'],
      features: ['Milestone payments', 'IP assignment', 'Confidentiality', 'Dispute resolution']
    },
    {
      id: 'consulting-agreement',
      title: 'Consulting Services Agreement',
      description: 'Professional services with international compliance',
      type: 'Consulting',
      duration: 'Term-based',
      compliance: ['International tax', 'Service export', 'Professional liability'],
      features: ['Hourly billing', 'Expense reimbursement', 'Liability limits', 'Renewal clauses']
    }
  ];

  const complianceClauses = [
    {
      section: 'Tax Compliance',
      icon: <DollarSign className="h-4 w-4 text-green-600" />,
      clauses: [
        'Employee tax withholding as per FIRS regulations',
        'Employer contributions to pension scheme (PENCOM)',
        'VAT obligations for service exports',
        'Annual tax filing requirements'
      ]
    },
    {
      section: 'Labour Law',
      icon: <Scale className="h-4 w-4 text-blue-600" />,
      clauses: [
        'Minimum wage compliance',
        'Working hours and overtime provisions',
        'Annual leave entitlements (21 working days)',
        'Maternity/paternity leave provisions',
        'Termination notice periods'
      ]
    },
    {
      section: 'Data Protection',
      icon: <Shield className="h-4 w-4 text-purple-600" />,
      clauses: [
        'GDPR compliance for EU data processing',
        'Nigeria Data Protection Regulation (NDPR)',
        'Data transfer agreements',
        'Employee privacy rights'
      ]
    },
    {
      section: 'Financial Regulations',
      icon: <Building className="h-4 w-4 text-orange-600" />,
      clauses: [
        'Central Bank of Nigeria (CBN) forex regulations',
        'Export proceeds repatriation',
        'Anti-money laundering compliance',
        'Know Your Customer (KYC) requirements'
      ]
    }
  ];

  if (userType === 'professional') {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Contract Templates & Compliance
            </CardTitle>
            <CardDescription>
              Review contract templates and understand your rights and obligations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="templates" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="templates">Contract Templates</TabsTrigger>
                <TabsTrigger value="compliance">Compliance Guide</TabsTrigger>
              </TabsList>
              
              <TabsContent value="templates" className="space-y-4 mt-4">
                <div className="grid gap-4">
                  {templates.map((template) => (
                    <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                              <FileText className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-medium">{template.title}</h4>
                              <p className="text-sm text-muted-foreground">{template.description}</p>
                            </div>
                          </div>
                          <Badge variant="outline">{template.type}</Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                          <div>
                            <span className="text-muted-foreground">Duration:</span>
                            <span className="ml-2 font-medium">{template.duration}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Compliance:</span>
                            <span className="ml-2 font-medium">{template.compliance.length} requirements</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              Preview
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-green-600">
                            <CheckCircle className="h-3 w-3" />
                            Compliant
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="compliance" className="space-y-4 mt-4">
                <div className="space-y-4">
                  {complianceClauses.map((section, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          {section.icon}
                          <h4 className="font-medium">{section.section}</h4>
                        </div>
                        <ul className="space-y-2">
                          {section.clauses.map((clause, clauseIndex) => (
                            <li key={clauseIndex} className="flex items-start gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span>{clause}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Employer view
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Contract Management
          </CardTitle>
          <CardDescription>
            Generate compliant contracts for Nigerian professionals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="templates" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="active">Active Contracts</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
            </TabsList>
            
            <TabsContent value="templates" className="space-y-4 mt-4">
              <div className="grid gap-4">
                {templates.map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">{template.title}</h4>
                            <p className="text-sm text-muted-foreground">{template.description}</p>
                          </div>
                        </div>
                        <Badge variant="outline">{template.type}</Badge>
                      </div>
                      
                      <div className="space-y-2 mb-3">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Key Features:</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {template.features.map((feature, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Preview
                          </Button>
                          <Button size="sm">
                            <Edit className="h-4 w-4 mr-1" />
                            Use Template
                          </Button>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-green-600">
                          <Shield className="h-3 w-3" />
                          {template.compliance.length} compliance checks
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="active" className="space-y-4 mt-4">
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                          <Users className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">John Doe - Senior Developer</h4>
                          <p className="text-sm text-muted-foreground">Employment Contract</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-muted-foreground">Start Date:</span>
                        <div className="font-medium">Jan 15, 2024</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Salary:</span>
                        <div className="font-medium">₦500,000/month</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Status:</span>
                        <div className="font-medium text-green-600">Compliant</div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View Contract
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Amend
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="compliance" className="space-y-4 mt-4">
              <div className="grid gap-4">
                <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-900 dark:text-green-100">Fully Compliant</span>
                  </div>
                  <p className="text-sm text-green-800 dark:text-green-200">
                    All contracts meet Nigerian labour law and international employment standards.
                  </p>
                </div>
                
                {complianceClauses.map((section, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        {section.icon}
                        <h4 className="font-medium">{section.section}</h4>
                      </div>
                      <ul className="space-y-2">
                        {section.clauses.map((clause, clauseIndex) => (
                          <li key={clauseIndex} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{clause}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}