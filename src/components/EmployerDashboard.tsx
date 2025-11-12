import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { SwipeInterface } from './SwipeInterface';
import { MatchesView } from './MatchesView';
import { ContractTemplates } from './ContractTemplates';
import { PaymentBreakdown } from './PaymentBreakdown';
import { JDParserAndMatcher } from './JDParserAndMatcher';
import { ProfileViewModal } from './ProfileViewModal';
import { PINIdentityCard, generateMockPINData } from './PINIdentityCard';
import { mockTalentProfiles } from './mockSwipeData';
import { 
  Users, 
  Shield, 
  CheckCircle, 
  DollarSign, 
  FileText, 
  Search,
  Plus,
  Eye,
  Sparkles,
  Building,
  MapPin,
  Target,
  Heart,
  TrendingUp,
  Edit,
  Mail,
  Phone,
  Globe,
  Briefcase,
  BadgeCheck,
  Fingerprint,
  QrCode
} from 'lucide-react';

interface VerificationStatus {
  status: 'verified' | 'pending' | 'required' | 'failed';
  completionPercentage: number;
  lastUpdated: string;
}

export function EmployerDashboard() {
  const [matchedProfile, setMatchedProfile] = useState<any>(null);
  const [showMatchNotification, setShowMatchNotification] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);

  const handleViewProfile = (profileId: string) => {
    const profile = mockTalentProfiles.find(p => p.id === profileId);
    if (profile) {
      setSelectedProfile(profile);
      setShowProfileModal(true);
    }
  };

  // Mock company data
  const companyProfile = {
    name: "TechCorp Global",
    industry: "Technology / SaaS",
    location: "San Francisco, CA",
    website: "www.techcorp-global.com",
    email: "hiring@techcorp-global.com",
    phone: "+1 (415) 555-0123",
    description: "Leading SaaS platform provider focused on enterprise solutions.",
    verified: true,
    totalHires: 24,
    activeMatches: 3,
    profileViews: 156,
    complianceScore: 94
  };

  const hiredEmployees = [
    {
      id: 1,
      name: "Folake Adelstein",
      role: "Senior React Developer",
      startDate: "2025-01-15",
      monthlyRate: 4500,
      status: "active"
    },
    {
      id: 2,
      name: "Chidi Okonkwo",
      role: "DevOps Engineer", 
      startDate: "2024-12-01",
      monthlyRate: 5200,
      status: "active"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-2 border-primary/10 bg-gradient-to-br from-primary/5 to-white">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                <div className="flex-1 space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                    <Sparkles className="h-4 w-4" />
                    <span>Swipe. Verify. Match. Hire.</span>
                  </div>
                  <h1 className="text-3xl tracking-tight">
                    Find Verified Nigerian Talent
                  </h1>
                  <p className="text-base text-muted-foreground">
                    Swipe through pre-verified professionals. Match instantly. Hire with confidence.
                  </p>
                  <div className="flex items-center gap-4 pt-2 flex-wrap text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-success animate-pulse"></div>
                      <span className="text-muted-foreground">2,500+ Active Professionals</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">100% Verified</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-white/50 rounded-lg border border-primary/10">
                    <div className="text-2xl text-primary">94%</div>
                    <div className="text-xs text-muted-foreground">Match Rate</div>
                  </div>
                  <div className="text-center p-3 bg-white/50 rounded-lg border border-primary/10">
                    <div className="text-2xl text-success">12d</div>
                    <div className="text-xs text-muted-foreground">Avg Hire</div>
                  </div>
                  <div className="text-center p-3 bg-white/50 rounded-lg border border-primary/10">
                    <div className="text-2xl text-warning">{companyProfile.totalHires}</div>
                    <div className="text-xs text-muted-foreground">Your Hires</div>
                  </div>
                  <div className="text-center p-3 bg-white/50 rounded-lg border border-primary/10">
                    <div className="text-2xl">$9.7k</div>
                    <div className="text-xs text-muted-foreground">Monthly</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl">{companyProfile.totalHires}</div>
                  <div className="text-xs text-muted-foreground mt-1">Total Hires</div>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl">{companyProfile.activeMatches}</div>
                  <div className="text-xs text-muted-foreground mt-1">Active Matches</div>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <Target className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl">{companyProfile.profileViews}</div>
                  <div className="text-xs text-muted-foreground mt-1">Profile Views</div>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Eye className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl">{companyProfile.complianceScore}%</div>
                  <div className="text-xs text-muted-foreground mt-1">Compliance</div>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="post-job" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1 sm:gap-2 bg-white border p-1">
            <TabsTrigger value="post-job" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Post Job</span>
              <span className="sm:hidden">Post</span>
            </TabsTrigger>
            <TabsTrigger value="discover" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
              <Target className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Swipe</span>
              <span className="sm:hidden">Swipe</span>
            </TabsTrigger>
            <TabsTrigger value="matches" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
              <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Matches</span>
              <span className="sm:hidden">Match</span>
              <Badge variant="secondary" className="ml-auto hidden lg:inline-flex text-xs">3</Badge>
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
              <Building className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Company</span>
              <span className="sm:hidden">Co.</span>
            </TabsTrigger>
            <TabsTrigger value="team" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Team</span>
              <span className="sm:hidden">Team</span>
            </TabsTrigger>
            <TabsTrigger value="payroll" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Payroll</span>
              <span className="sm:hidden">Pay</span>
            </TabsTrigger>
          </TabsList>

          {/* Post Job Tab */}
          <TabsContent value="post-job" className="space-y-6">
            <JDParserAndMatcher onViewProfile={handleViewProfile} />
            
            {/* Related Search and User Profiles */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl">Related Professionals</h3>
                <div className="relative flex-1 max-w-md ml-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search professionals..." 
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Professional Profile Cards */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockTalentProfiles.slice(0, 6).map((profile) => (
                  <Card key={profile.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleViewProfile(profile.id)}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name}`} />
                          <AvatarFallback>{profile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-sm truncate">{profile.name}</h4>
                            {profile.verified && (
                              <BadgeCheck className="h-4 w-4 text-primary flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{profile.title}</p>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                            <Briefcase className="h-3 w-3 mr-1" />
                            Currently Open for Roles
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
                        <span>{profile.location}</span>
                        <span className="text-primary font-semibold">{profile.matchScore}% Match</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Swipe Tab */}
          <TabsContent value="discover" className="space-y-6">
            <div className="mb-4">
              <h2 className="text-2xl mb-2">Discover Talent</h2>
              <p className="text-muted-foreground">
                Swipe right to match with verified professionals who fit your needs.
              </p>
            </div>
            <SwipeInterface
              type="employer"
              profiles={mockTalentProfiles}
              onMatch={(profile) => {
                setMatchedProfile(profile);
                setShowMatchNotification(true);
                setTimeout(() => setShowMatchNotification(false), 5000);
              }}
            />
          </TabsContent>

          {/* Matches Tab */}
          <TabsContent value="matches" className="space-y-6">
            <div className="mb-4">
              <h2 className="text-2xl mb-2">Your Matches</h2>
              <p className="text-muted-foreground">
                Connect with professionals you've matched with and move forward with hiring.
              </p>
            </div>
            <MatchesView
              type="employer"
              matches={matches}
              onMessage={(matchId) => {
                console.log('Opening message for:', matchId);
              }}
              onScheduleInterview={(matchId) => {
                console.log('Scheduling interview for:', matchId);
              }}
              onSendOffer={(matchId) => {
                console.log('Sending offer to:', matchId);
              }}
            />
          </TabsContent>

          {/* Company Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="mb-4">
              <h2 className="text-2xl mb-2">Company Profile</h2>
              <p className="text-muted-foreground">
                Manage your company information and public profile.
              </p>
            </div>

            {/* Profile Header */}
            <Card className="bg-white border-2 border-primary/10">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row items-start gap-6">
                  <Avatar className="h-24 w-24 border-4 border-background shadow-lg rounded-xl">
                    <AvatarImage src={`https://api.dicebear.com/7.x/identicon/svg?seed=${companyProfile.name}`} />
                    <AvatarFallback className="text-xl rounded-xl">
                      {companyProfile.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="text-2xl">{companyProfile.name}</h2>
                      {companyProfile.verified && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-lg text-muted-foreground">{companyProfile.industry}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 flex-wrap">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {companyProfile.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Shield className="h-4 w-4" />
                        {companyProfile.complianceScore}% Compliance
                      </div>
                    </div>
                  </div>

                  <Button variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Company Details */}
            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2 bg-white">
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                  <CardDescription>Your public company profile</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Description</Label>
                    <p className="text-sm">{companyProfile.description}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Industry</Label>
                      <p className="text-sm">{companyProfile.industry}</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Location</Label>
                      <p className="text-sm">{companyProfile.location}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="text-base">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{companyProfile.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm">{companyProfile.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm">{companyProfile.website}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl mb-2">Your Team</h2>
                <p className="text-muted-foreground">
                  Manage your hired professionals and team members.
                </p>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </div>

            <div className="grid gap-4">
              {hiredEmployees.map((employee) => (
                <Card key={employee.id} className="bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${employee.name}`} />
                          <AvatarFallback>{employee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{employee.name}</h3>
                          <p className="text-sm text-muted-foreground">{employee.role}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-xs text-muted-foreground">
                              Started {employee.startDate}
                            </span>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              {employee.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${employee.monthlyRate}/mo</p>
                        <Button variant="ghost" size="sm" className="mt-2">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Payroll Tab */}
          <TabsContent value="payroll" className="space-y-6">
            <div className="mb-4">
              <h2 className="text-2xl mb-2">Payroll & Payments</h2>
              <p className="text-muted-foreground">
                Manage payments and view detailed breakdowns for your team.
              </p>
            </div>

            <PaymentBreakdown
              baseSalary={450000}
              allowances={50000}
              onApprove={(breakdown) => console.log('Approved:', breakdown)}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Profile View Modal */}
      <ProfileViewModal
        profile={selectedProfile}
        userType="employer"
        open={showProfileModal}
        onClose={() => {
          setShowProfileModal(false);
          setSelectedProfile(null);
        }}
      />
    </div>
  );
}
