import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { AIRecommendationsEngine, AIInsights } from './AIRecommendationsEngine';
import VerificationBanner from './VerificationBanner';
import { supabase } from '../utils/supabase/client';
import { 
  GraduationCap, 
  CheckCircle, 
  Clock, 
  Award, 
  Users, 
  FileText, 
  Plus,
  Eye,
  Download,
  Send,
  Shield,
  Building,
  Calendar,
  Search,
  Brain,
  TrendingUp,
  Target,
  BarChart3
} from 'lucide-react';

export function UniversityDashboard() {
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [emailVerified, setEmailVerified] = useState(true);
  const [userEmail, setUserEmail] = useState('');

  // Mock data
  const universityInfo = {
    name: "University of Lagos",
    location: "Lagos, Nigeria",
    established: "1962",
    accreditation: "NUC Accredited",
    studentCount: 45000,
    credentialsIssued: 1247,
    verificationId: "UNILAG-VERIFY-2025"
  };

  const credentialTemplates = [
    {
      id: 1,
      name: "Bachelor's Degree Template",
      type: "Academic",
      fields: ["Student Name", "Degree Type", "Major", "Graduation Date", "GPA", "Honours"],
      issuedCount: 850,
      lastUsed: "2025-01-15"
    },
    {
      id: 2,
      name: "Master's Degree Template",
      type: "Academic", 
      fields: ["Student Name", "Degree Type", "Major", "Graduation Date", "Thesis Title", "GPA"],
      issuedCount: 320,
      lastUsed: "2025-01-10"
    },
    {
      id: 3,
      name: "Certificate Template",
      type: "Professional",
      fields: ["Participant Name", "Certificate Title", "Completion Date", "Duration", "Skills"],
      issuedCount: 77,
      lastUsed: "2024-12-20"
    }
  ];

  const recentCredentials = [
    {
      id: 1,
      studentName: "Adebayo Olatunji",
      credentialType: "B.Sc Computer Science",
      issueDate: "2025-01-15",
      status: "issued",
      verificationId: "UNILAG-CS-2025-4563",
      studentId: "17/1234567"
    },
    {
      id: 2,
      studentName: "Ngozi Okwu",
      credentialType: "M.Sc Data Science",
      issueDate: "2025-01-14",
      status: "pending",
      verificationId: "PENDING",
      studentId: "20/2345678"
    },
    {
      id: 3,
      studentName: "Kwame Asante",
      credentialType: "Certificate in AI",
      issueDate: "2025-01-12",
      status: "issued",
      verificationId: "UNILAG-AI-2025-1234",
      studentId: "21/3456789"
    },
    {
      id: 4,
      studentName: "Fatima Aliyu",
      credentialType: "B.Eng Software Engineering",
      issueDate: "2025-01-10",
      status: "revoked",
      verificationId: "UNILAG-SE-2025-7890",
      studentId: "18/4567890"
    }
  ];

  const students = [
    {
      id: 1,
      name: "Adebayo Olatunji",
      studentId: "17/1234567",
      program: "Computer Science",
      year: "Final Year",
      gpa: 4.2,
      status: "active",
      email: "adebayo.olatunji@student.unilag.edu.ng"
    },
    {
      id: 2,
      name: "Ngozi Okwu",
      studentId: "20/2345678",
      program: "Data Science",
      year: "2nd Year Masters",
      gpa: 3.8,
      status: "active",
      email: "ngozi.okwu@student.unilag.edu.ng"
    },
    {
      id: 3,
      name: "Kwame Asante",
      studentId: "21/3456789",
      program: "Artificial Intelligence",
      year: "Certificate Program",
      gpa: 3.9,
      status: "graduated",
      email: "kwame.asante@student.unilag.edu.ng"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'issued': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'revoked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Check email verification status
  useEffect(() => {
    const checkVerificationStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserEmail(user.email || '');
          const isVerified = user.email_confirmed_at || localStorage.getItem('emailVerified') === 'true';
          const isTempSession = localStorage.getItem('tempSession') === 'true';
          setEmailVerified(!!isVerified && !isTempSession);
        }
      } catch (err) {
        console.error('Error checking verification status:', err);
      }
    };
    
    checkVerificationStatus();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const isVerified = session.user.email_confirmed_at || localStorage.getItem('emailVerified') === 'true';
        const isTempSession = localStorage.getItem('tempSession') === 'true';
        setEmailVerified(!!isVerified && !isTempSession);
        if (isVerified && !isTempSession) {
          sessionStorage.removeItem('verificationModalDismissed');
          localStorage.setItem('emailVerified', 'true');
          localStorage.removeItem('tempSession');
        } else {
          localStorage.setItem('emailVerified', 'false');
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="space-y-6">
      {/* Email Verification Modal */}
      {!emailVerified && userEmail && (
        <VerificationBanner 
          userEmail={userEmail} 
          onDismiss={() => {
            console.log('Verification modal dismissed temporarily');
          }}
        />
      )}
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{universityInfo.studentCount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +2,500 this academic year
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Credentials Issued</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{universityInfo.credentialsIssued}</div>
            <p className="text-xs text-muted-foreground">
              +127 this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Active Templates</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{credentialTemplates.length}</div>
            <p className="text-xs text-muted-foreground">
              3 categories available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Verification Trust</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">99.8%</div>
            <p className="text-xs text-muted-foreground">
              Blockchain verified
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AIRecommendationsEngine 
            userType="university"
            onRecommendationAction={(rec, action) => {
              console.log('University recommendation action:', rec.title, action);
            }}
          />
        </div>
        <div>
          <AIInsights
            userType="university"
            insights={[
              {
                title: 'Graduate Employment',
                value: '94%',
                trend: 'up',
                description: 'Within 6 months of graduation'
              },
              {
                title: 'Employer Demand',
                value: 'CS Programs',
                trend: 'up',
                description: 'Highest demand from employers'
              },
              {
                title: 'Credential Trust',
                value: '99.2%',
                trend: 'stable',
                description: 'Employer verification rate'
              },
              {
                title: 'Market Value',
                value: '+25%',
                trend: 'up',
                description: 'Salary premium for digital credentials'
              }
            ]}
          />
        </div>
      </div>

      {/* Main Dashboard */}
      <Tabs defaultValue="overview" className="space-y-4 mt-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="credentials">Issue Credentials</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="analytics">AI Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>University Profile</CardTitle>
                <CardDescription>
                  Your institution's verified information on the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label>Institution Name</Label>
                      <div className="text-lg font-semibold">{universityInfo.name}</div>
                    </div>
                    <div>
                      <Label>Location</Label>
                      <div className="text-muted-foreground">{universityInfo.location}</div>
                    </div>
                    <div>
                      <Label>Established</Label>
                      <div className="text-muted-foreground">{universityInfo.established}</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label>Accreditation</Label>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {universityInfo.accreditation}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label>Verification ID</Label>
                      <div className="text-muted-foreground font-mono text-sm">
                        {universityInfo.verificationId}
                      </div>
                    </div>
                    <div>
                      <Label>Platform Status</Label>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified Institution
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Credential Activity</CardTitle>
                <CardDescription>
                  Latest credentials issued to students
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentCredentials.map((credential) => (
                    <div key={credential.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${credential.studentName}`} />
                          <AvatarFallback>{credential.studentName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold">{credential.studentName}</div>
                          <div className="text-sm text-muted-foreground">{credential.credentialType}</div>
                          <div className="text-xs text-muted-foreground">
                            ID: {credential.studentId} • Issued: {new Date(credential.issueDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <Badge className={getStatusColor(credential.status)}>
                          {credential.status === 'issued' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {credential.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                          {credential.status.charAt(0).toUpperCase() + credential.status.slice(1)}
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          {credential.verificationId}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Credentials Tab */}
        <TabsContent value="credentials" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Issue New Credential</CardTitle>
              <CardDescription>
                Create and issue digital credentials to students
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="template">Credential Template</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select template..." />
                    </SelectTrigger>
                    <SelectContent>
                      {credentialTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id.toString()}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="student">Student ID</Label>
                  <Input id="student" placeholder="Enter student ID..." />
                </div>
              </div>

              {selectedTemplate && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                  <h4 className="font-semibold">Credential Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="studentName">Student Name</Label>
                      <Input id="studentName" placeholder="Full name..." />
                    </div>
                    <div>
                      <Label htmlFor="degreeType">Degree Type</Label>
                      <Input id="degreeType" placeholder="e.g., Bachelor of Science" />
                    </div>
                    <div>
                      <Label htmlFor="major">Major/Field of Study</Label>
                      <Input id="major" placeholder="e.g., Computer Science" />
                    </div>
                    <div>
                      <Label htmlFor="graduationDate">Graduation Date</Label>
                      <Input id="graduationDate" type="date" />
                    </div>
                    <div>
                      <Label htmlFor="gpa">GPA/Grade</Label>
                      <Input id="gpa" placeholder="e.g., 3.75" />
                    </div>
                    <div>
                      <Label htmlFor="honours">Honours/Distinction</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select honours..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="first-class">First Class Honours</SelectItem>
                          <SelectItem value="second-upper">Second Class Upper</SelectItem>
                          <SelectItem value="second-lower">Second Class Lower</SelectItem>
                          <SelectItem value="third-class">Third Class</SelectItem>
                          <SelectItem value="pass">Pass</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline">Preview</Button>
                <Button>
                  <Send className="h-4 w-4 mr-2" />
                  Issue Credential
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Credential Templates
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </CardTitle>
              <CardDescription>
                Manage reusable templates for different types of credentials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {credentialTemplates.map((template) => (
                  <Card key={template.id} className="border-l-4 border-l-primary">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{template.name}</h4>
                            <Badge variant="outline">{template.type}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Fields: {template.fields.join(', ')}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Used {template.issuedCount} times • Last used: {new Date(template.lastUsed).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            Preview
                          </Button>
                          <Button size="sm" variant="outline">
                            Edit
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Directory</CardTitle>
              <CardDescription>
                Manage student records and credential issuance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Input placeholder="Search students..." className="flex-1" />
                  <Select>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by program..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cs">Computer Science</SelectItem>
                      <SelectItem value="ds">Data Science</SelectItem>
                      <SelectItem value="ai">Artificial Intelligence</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-4">
                  {students.map((student) => (
                    <Card key={student.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`} />
                              <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold">{student.name}</h3>
                              <div className="text-sm text-muted-foreground">
                                {student.studentId} • {student.program}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {student.year} • GPA: {student.gpa} • {student.email}
                              </div>
                            </div>
                          </div>
                          <div className="text-right space-y-2">
                            <Badge className={student.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                              {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                            </Badge>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                View Records
                              </Button>
                              <Button size="sm">
                                Issue Credential
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Institution Settings</CardTitle>
                <CardDescription>
                  Configure your institution's profile and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="institution-name">Institution Name</Label>
                    <Input id="institution-name" defaultValue={universityInfo.name} />
                  </div>
                  <div>
                    <Label htmlFor="institution-location">Location</Label>
                    <Input id="institution-location" defaultValue={universityInfo.location} />
                  </div>
                  <div>
                    <Label htmlFor="accreditation">Accreditation Body</Label>
                    <Input id="accreditation" defaultValue={universityInfo.accreditation} />
                  </div>
                  <div>
                    <Label htmlFor="established">Year Established</Label>
                    <Input id="established" defaultValue={universityInfo.established} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Institution Description</Label>
                  <Textarea id="description" placeholder="Brief description of your institution..." />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Verification Settings</CardTitle>
                <CardDescription>
                  Configure how credentials are verified and shared
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto-issue credentials upon graduation</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically issue credentials when students complete their programs
                      </p>
                    </div>
                    <input type="checkbox" className="ml-4" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Require manual verification</Label>
                      <p className="text-sm text-muted-foreground">
                        All credentials require manual approval before issuance
                      </p>
                    </div>
                    <input type="checkbox" className="ml-4" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable credential revocation</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow revoking credentials if needed (e.g., academic misconduct)
                      </p>
                    </div>
                    <input type="checkbox" className="ml-4" defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button>Save Settings</Button>
            </div>
          </div>
        </TabsContent>

        {/* AI Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Institutional Analytics Dashboard
                </CardTitle>
                <CardDescription>
                  AI-powered insights into your graduates' success and market trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm text-muted-foreground">Graduate Success Rate</div>
                      <div className="text-2xl font-semibold">94.2%</div>
                      <div className="text-xs text-green-600">↗ +2.1% vs last year</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm text-muted-foreground">Avg. Time to Employment</div>
                      <div className="text-2xl font-semibold">45 days</div>
                      <div className="text-xs text-green-600">↘ 15 days improvement</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm text-muted-foreground">Salary Premium</div>
                      <div className="text-2xl font-semibold">+28%</div>
                      <div className="text-xs text-green-600">↗ Digital credentials impact</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm text-muted-foreground">Employer Trust Score</div>
                      <div className="text-2xl font-semibold">9.6/10</div>
                      <div className="text-xs text-green-600">↗ Industry leading</div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-4">Program Performance</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <div className="font-medium">Computer Science</div>
                          <div className="text-sm text-muted-foreground">Employment: 98% • Avg. Salary: $75k</div>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Top Performer</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <div className="font-medium">Data Science</div>
                          <div className="text-sm text-muted-foreground">Employment: 95% • Avg. Salary: $82k</div>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">High Demand</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <div className="font-medium">Engineering</div>
                          <div className="text-sm text-muted-foreground">Employment: 89% • Avg. Salary: $68k</div>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-800">Stable</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-4">AI Recommendations</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-50 border-l-4 border-l-blue-500 rounded">
                        <h5 className="font-medium">Expand Cybersecurity Program</h5>
                        <p className="text-sm text-muted-foreground">
                          300% increase in employer demand. Projected ROI: $2.4M
                        </p>
                        <Button size="sm" className="mt-2">Explore</Button>
                      </div>
                      
                      <div className="p-3 bg-green-50 border-l-4 border-l-green-500 rounded">
                        <h5 className="font-medium">Partner with Tech Companies</h5>
                        <p className="text-sm text-muted-foreground">
                          Direct hiring partnerships could improve placement by 15%
                        </p>
                        <Button size="sm" className="mt-2">Connect</Button>
                      </div>
                      
                      <div className="p-3 bg-purple-50 border-l-4 border-l-purple-500 rounded">
                        <h5 className="font-medium">AI & ML Curriculum</h5>
                        <p className="text-sm text-muted-foreground">
                          Adding AI courses could increase graduate salaries by $12k
                        </p>
                        <Button size="sm" className="mt-2">Plan</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Market Intelligence
                </CardTitle>
                <CardDescription>
                  Industry trends and insights for strategic planning
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-3">Skills in Demand</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Cloud Computing</span>
                        <span className="text-green-600">↑ 45%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Machine Learning</span>
                        <span className="text-green-600">↑ 38%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Cybersecurity</span>
                        <span className="text-green-600">↑ 32%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>DevOps</span>
                        <span className="text-green-600">↑ 28%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-3">Employer Preferences</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Digital Credentials</span>
                        <span className="font-medium">92%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Portfolio Projects</span>
                        <span className="font-medium">87%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Industry Certification</span>
                        <span className="font-medium">84%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Internship Experience</span>
                        <span className="font-medium">79%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-3">Geographic Trends</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Remote Opportunities</span>
                        <span className="text-blue-600">68%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>International Hiring</span>
                        <span className="text-blue-600">34%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Local Partnerships</span>
                        <span className="text-blue-600">89%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Cross-border Projects</span>
                        <span className="text-blue-600">42%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
