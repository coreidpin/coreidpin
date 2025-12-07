import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Shield, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Upload,
  FileCheck,
  User,
  CreditCard,
  FileText,
  Building,
  Calendar,
  MapPin,
  Info,
  Loader2,
  Eye,
  Download,
  X,
  Camera
} from 'lucide-react';
import { toast } from 'sonner';

type VerificationStatus = 'not_started' | 'pending' | 'verified' | 'rejected';

interface ComplianceCheck {
  id: string;
  title: string;
  description: string;
  status: VerificationStatus;
  completedAt?: string;
  expiryDate?: string;
  documents?: Document[];
}

interface Document {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
  status: VerificationStatus;
}

export function ComplianceChecks() {
  const [activeTab, setActiveTab] = useState('identity');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Identity Verification State
  const [identityData, setIdentityData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    nationality: 'Nigeria',
    idType: 'nin',
    idNumber: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
  });

  // Background Check State
  const [backgroundData, setBackgroundData] = useState({
    previousEmployer1: '',
    position1: '',
    duration1: '',
    previousEmployer2: '',
    position2: '',
    duration2: '',
    criminalRecord: 'no',
    educationLevel: '',
    institution: '',
    graduationYear: '',
  });

  // Tax Compliance State
  const [taxData, setTaxData] = useState({
    taxIdNumber: '',
    taxCountry: 'Nigeria',
    taxResidency: 'yes',
    hasW8BEN: 'no',
    hasW9: 'no',
    bankName: '',
    accountNumber: '',
    swiftCode: '',
  });

  // Mock compliance checks data
  const [complianceChecks, setComplianceChecks] = useState<ComplianceCheck[]>([
    {
      id: 'identity',
      title: 'Identity Verification',
      description: 'Verify your identity with government-issued ID',
      status: 'not_started',
    },
    {
      id: 'background',
      title: 'Background Check',
      description: 'Professional and criminal background verification',
      status: 'not_started',
    },
    {
      id: 'tax',
      title: 'Tax Compliance',
      description: 'Tax information and payment setup',
      status: 'not_started',
    },
  ]);

  // Mock uploaded documents
  const [uploadedDocuments, setUploadedDocuments] = useState<Document[]>([]);

  const getStatusIcon = (status: VerificationStatus) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'rejected':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Info className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: VerificationStatus) => {
    const config = {
      verified: { text: 'Verified', className: 'bg-green-100 text-green-800' },
      pending: { text: 'Pending Review', className: 'bg-yellow-100 text-yellow-800' },
      rejected: { text: 'Rejected', className: 'bg-red-100 text-red-800' },
      not_started: { text: 'Not Started', className: 'bg-gray-100 text-gray-600' },
    };

    const { text, className } = config[status];
    return <Badge className={className}>{text}</Badge>;
  };

  const calculateOverallProgress = () => {
    const verified = complianceChecks.filter(c => c.status === 'verified').length;
    const total = complianceChecks.length;
    return Math.round((verified / total) * 100);
  };

  const handleFileUpload = async (checkId: string) => {
    setIsUploading(true);
    
    // Simulate file upload
    setTimeout(() => {
      const newDoc: Document = {
        id: Date.now().toString(),
        name: `${checkId}_document.pdf`,
        type: 'application/pdf',
        uploadedAt: new Date().toISOString(),
        status: 'pending',
      };
      
      setUploadedDocuments([...uploadedDocuments, newDoc]);
      toast.success('Document uploaded successfully');
      setIsUploading(false);
    }, 1500);
  };

  const handleSubmitIdentity = async () => {
    if (!identityData.firstName || !identityData.lastName || !identityData.idNumber) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setComplianceChecks(prev => 
        prev.map(check => 
          check.id === 'identity' 
            ? { ...check, status: 'pending' as VerificationStatus }
            : check
        )
      );
      toast.success('Identity verification submitted for review');
      setIsSubmitting(false);
    }, 1500);
  };

  const handleSubmitBackground = async () => {
    if (!backgroundData.previousEmployer1 || !backgroundData.educationLevel) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    setTimeout(() => {
      setComplianceChecks(prev => 
        prev.map(check => 
          check.id === 'background' 
            ? { ...check, status: 'pending' as VerificationStatus }
            : check
        )
      );
      toast.success('Background check submitted for review');
      setIsSubmitting(false);
    }, 1500);
  };

  const handleSubmitTax = async () => {
    if (!taxData.taxIdNumber || !taxData.bankName) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    setTimeout(() => {
      setComplianceChecks(prev => 
        prev.map(check => 
          check.id === 'tax' 
            ? { ...check, status: 'pending' as VerificationStatus }
            : check
        )
      );
      toast.success('Tax compliance information submitted for review');
      setIsSubmitting(false);
    }, 1500);
  };

  const overallProgress = calculateOverallProgress();

  return (
    <div className="space-y-6">
      {/* Overall Compliance Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Compliance Overview</CardTitle>
                  <CardDescription>
                    Complete your compliance checks to access global opportunities
                  </CardDescription>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl text-primary">{overallProgress}%</div>
                <p className="text-sm text-muted-foreground">Complete</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={overallProgress} className="h-3 mb-4" />
            
            <div className="grid md:grid-cols-3 gap-4">
              {complianceChecks.map((check) => (
                <Card key={check.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {getStatusIcon(check.status)}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div>
                          <h4>{check.title}</h4>
                          <p className="text-sm text-muted-foreground">{check.description}</p>
                        </div>
                        {getStatusBadge(check.status)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Compliance Details Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="identity" className="gap-2">
            <User className="h-4 w-4" />
            Identity
          </TabsTrigger>
          <TabsTrigger value="background" className="gap-2">
            <FileCheck className="h-4 w-4" />
            Background
          </TabsTrigger>
          <TabsTrigger value="tax" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Tax
          </TabsTrigger>
        </TabsList>

        {/* Identity Verification Tab */}
        <TabsContent value="identity" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Identity Verification</CardTitle>
                  <CardDescription>
                    Provide your identification documents for verification
                  </CardDescription>
                </div>
                {getStatusBadge(complianceChecks.find(c => c.id === 'identity')?.status || 'not_started')}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Personal Information */}
              <div>
                <h4 className="mb-4 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Personal Information
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">
                      First Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      value={identityData.firstName}
                      onChange={(e) => setIdentityData({...identityData, firstName: e.target.value})}
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">
                      Last Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="lastName"
                      value={identityData.lastName}
                      onChange={(e) => setIdentityData({...identityData, lastName: e.target.value})}
                      placeholder="Enter your last name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={identityData.dateOfBirth}
                      onChange={(e) => setIdentityData({...identityData, dateOfBirth: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="nationality">Nationality</Label>
                    <Input
                      id="nationality"
                      value={identityData.nationality}
                      onChange={(e) => setIdentityData({...identityData, nationality: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* ID Information */}
              <div>
                <h4 className="mb-4 flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Identification Document
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="idType">ID Type</Label>
                    <select
                      id="idType"
                      value={identityData.idType}
                      onChange={(e) => setIdentityData({...identityData, idType: e.target.value})}
                      className="w-full h-10 px-3 rounded-md border border-input bg-input-background"
                    >
                      <option value="nin">National ID (NIN)</option>
                      <option value="passport">International Passport</option>
                      <option value="drivers">Driver's License</option>
                      <option value="voters">Voter's Card</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="idNumber">
                      ID Number <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="idNumber"
                      value={identityData.idNumber}
                      onChange={(e) => setIdentityData({...identityData, idNumber: e.target.value})}
                      placeholder="Enter ID number"
                    />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h4 className="mb-4 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Address Information
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      value={identityData.address}
                      onChange={(e) => setIdentityData({...identityData, address: e.target.value})}
                      placeholder="Enter your street address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={identityData.city}
                      onChange={(e) => setIdentityData({...identityData, city: e.target.value})}
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={identityData.state}
                      onChange={(e) => setIdentityData({...identityData, state: e.target.value})}
                      placeholder="State"
                    />
                  </div>
                </div>
              </div>

              {/* Document Upload */}
              <div>
                <h4 className="mb-4 flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Documents
                </h4>
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                  <Camera className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="mb-2">Upload a clear photo of your ID document</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Supported formats: JPG, PNG, PDF (Max 10MB)
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => handleFileUpload('identity')}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Choose File
                      </>
                    )}
                  </Button>
                </div>

                {/* Uploaded Documents List */}
                {uploadedDocuments.filter(doc => doc.name.includes('identity')).length > 0 && (
                  <div className="mt-4 space-y-2">
                    {uploadedDocuments.filter(doc => doc.name.includes('identity')).map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-primary" />
                          <div>
                            <p>{doc.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(doc.status)}
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Your information will be securely stored and verified by our compliance team within 24-48 hours.
                </AlertDescription>
              </Alert>

              <Button 
                onClick={handleSubmitIdentity}
                disabled={isSubmitting}
                className="w-full"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Submit for Verification
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Background Check Tab */}
        <TabsContent value="background" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Background Check</CardTitle>
                  <CardDescription>
                    Professional history and educational background verification
                  </CardDescription>
                </div>
                {getStatusBadge(complianceChecks.find(c => c.id === 'background')?.status || 'not_started')}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Employment History */}
              <div>
                <h4 className="mb-4 flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Employment History
                </h4>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4 p-4 border rounded-lg">
                    <div className="md:col-span-3">
                      <Label>Previous Employer 1 <span className="text-destructive">*</span></Label>
                      <Input
                        value={backgroundData.previousEmployer1}
                        onChange={(e) => setBackgroundData({...backgroundData, previousEmployer1: e.target.value})}
                        placeholder="Company name"
                      />
                    </div>
                    <div>
                      <Label>Position</Label>
                      <Input
                        value={backgroundData.position1}
                        onChange={(e) => setBackgroundData({...backgroundData, position1: e.target.value})}
                        placeholder="Job title"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Duration</Label>
                      <Input
                        value={backgroundData.duration1}
                        onChange={(e) => setBackgroundData({...backgroundData, duration1: e.target.value})}
                        placeholder="e.g., Jan 2020 - Dec 2022"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 p-4 border rounded-lg">
                    <div className="md:col-span-3">
                      <Label>Previous Employer 2 (Optional)</Label>
                      <Input
                        value={backgroundData.previousEmployer2}
                        onChange={(e) => setBackgroundData({...backgroundData, previousEmployer2: e.target.value})}
                        placeholder="Company name"
                      />
                    </div>
                    <div>
                      <Label>Position</Label>
                      <Input
                        value={backgroundData.position2}
                        onChange={(e) => setBackgroundData({...backgroundData, position2: e.target.value})}
                        placeholder="Job title"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Duration</Label>
                      <Input
                        value={backgroundData.duration2}
                        onChange={(e) => setBackgroundData({...backgroundData, duration2: e.target.value})}
                        placeholder="e.g., Jan 2018 - Dec 2019"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Education */}
              <div>
                <h4 className="mb-4 flex items-center gap-2">
                  <FileCheck className="h-4 w-4" />
                  Educational Background
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>
                      Highest Education Level <span className="text-destructive">*</span>
                    </Label>
                    <select
                      value={backgroundData.educationLevel}
                      onChange={(e) => setBackgroundData({...backgroundData, educationLevel: e.target.value})}
                      className="w-full h-10 px-3 rounded-md border border-input bg-input-background"
                    >
                      <option value="">Select education level</option>
                      <option value="secondary">Secondary School</option>
                      <option value="diploma">Diploma/Certificate</option>
                      <option value="bachelors">Bachelor's Degree</option>
                      <option value="masters">Master's Degree</option>
                      <option value="phd">PhD/Doctorate</option>
                    </select>
                  </div>
                  <div>
                    <Label>Institution</Label>
                    <Input
                      value={backgroundData.institution}
                      onChange={(e) => setBackgroundData({...backgroundData, institution: e.target.value})}
                      placeholder="University/Institution name"
                    />
                  </div>
                  <div>
                    <Label>Graduation Year</Label>
                    <Input
                      type="number"
                      value={backgroundData.graduationYear}
                      onChange={(e) => setBackgroundData({...backgroundData, graduationYear: e.target.value})}
                      placeholder="YYYY"
                    />
                  </div>
                </div>
              </div>

              {/* Criminal Record */}
              <div>
                <h4 className="mb-4 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Criminal Background
                </h4>
                <div className="space-y-3">
                  <Label>Do you have any criminal record?</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="criminalRecord"
                        value="no"
                        checked={backgroundData.criminalRecord === 'no'}
                        onChange={(e) => setBackgroundData({...backgroundData, criminalRecord: e.target.value})}
                        className="h-4 w-4"
                      />
                      <span>No</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="criminalRecord"
                        value="yes"
                        checked={backgroundData.criminalRecord === 'yes'}
                        onChange={(e) => setBackgroundData({...backgroundData, criminalRecord: e.target.value})}
                        className="h-4 w-4"
                      />
                      <span>Yes</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Document Upload */}
              <div>
                <h4 className="mb-4 flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Supporting Documents
                </h4>
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="mb-2">Upload certificates, references, or other supporting documents</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    PDF, DOC, or image files (Max 10MB each)
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => handleFileUpload('background')}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Documents
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Background checks typically take 3-5 business days to complete.
                </AlertDescription>
              </Alert>

              <Button 
                onClick={handleSubmitBackground}
                disabled={isSubmitting}
                className="w-full"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Submit Background Check
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tax Compliance Tab */}
        <TabsContent value="tax" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Tax Compliance</CardTitle>
                  <CardDescription>
                    Tax information and payment setup for international work
                  </CardDescription>
                </div>
                {getStatusBadge(complianceChecks.find(c => c.id === 'tax')?.status || 'not_started')}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Tax Information */}
              <div>
                <h4 className="mb-4 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Tax Information
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>
                      Tax ID Number (TIN) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      value={taxData.taxIdNumber}
                      onChange={(e) => setTaxData({...taxData, taxIdNumber: e.target.value})}
                      placeholder="Enter your TIN"
                    />
                  </div>
                  <div>
                    <Label>Tax Country</Label>
                    <Input
                      value={taxData.taxCountry}
                      onChange={(e) => setTaxData({...taxData, taxCountry: e.target.value})}
                      placeholder="Country"
                    />
                  </div>
                </div>
              </div>

              {/* Tax Residency */}
              <div>
                <h4 className="mb-4 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Tax Residency
                </h4>
                <div className="space-y-4">
                  <div>
                    <Label>Are you a tax resident of Nigeria?</Label>
                    <div className="flex gap-4 mt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="taxResidency"
                          value="yes"
                          checked={taxData.taxResidency === 'yes'}
                          onChange={(e) => setTaxData({...taxData, taxResidency: e.target.value})}
                          className="h-4 w-4"
                        />
                        <span>Yes</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="taxResidency"
                          value="no"
                          checked={taxData.taxResidency === 'no'}
                          onChange={(e) => setTaxData({...taxData, taxResidency: e.target.value})}
                          className="h-4 w-4"
                        />
                        <span>No</span>
                      </label>
                    </div>
                  </div>

                  <Alert className="bg-blue-50 border-blue-200">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-900">
                      For US-based employers, you may need to complete Form W-8BEN or W-9
                    </AlertDescription>
                  </Alert>
                </div>
              </div>

              {/* Banking Information */}
              <div>
                <h4 className="mb-4 flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Banking Information
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>
                      Bank Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      value={taxData.bankName}
                      onChange={(e) => setTaxData({...taxData, bankName: e.target.value})}
                      placeholder="Your bank name"
                    />
                  </div>
                  <div>
                    <Label>Account Number</Label>
                    <Input
                      value={taxData.accountNumber}
                      onChange={(e) => setTaxData({...taxData, accountNumber: e.target.value})}
                      placeholder="Account number"
                      type="password"
                    />
                  </div>
                  <div>
                    <Label>SWIFT/BIC Code</Label>
                    <Input
                      value={taxData.swiftCode}
                      onChange={(e) => setTaxData({...taxData, swiftCode: e.target.value})}
                      placeholder="For international transfers"
                    />
                  </div>
                </div>
              </div>

              {/* Document Upload */}
              <div>
                <h4 className="mb-4 flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Tax Documents
                </h4>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Upload relevant tax documents such as:
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                    <li>Tax Identification Certificate</li>
                    <li>W-8BEN form (for US employers)</li>
                    <li>Bank verification documents</li>
                  </ul>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                    <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                    <Button
                      variant="outline"
                      onClick={() => handleFileUpload('tax')}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Tax Documents
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  All tax information is encrypted and stored securely. We comply with international tax regulations.
                </AlertDescription>
              </Alert>

              <Button 
                onClick={handleSubmitTax}
                disabled={isSubmitting}
                className="w-full"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Submit Tax Information
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
