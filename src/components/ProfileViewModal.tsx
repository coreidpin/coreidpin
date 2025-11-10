import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import {
  X,
  MapPin,
  Briefcase,
  DollarSign,
  Shield,
  Star,
  Github,
  Linkedin,
  Globe,
  Mail,
  Phone,
  CheckCircle,
  Award,
  Calendar,
  TrendingUp,
  Code,
  Heart,
  MessageSquare,
  Download,
  ExternalLink,
  Building
} from 'lucide-react';

interface ProfileViewModalProps {
  profile: any;
  userType: 'employer' | 'professional';
  open: boolean;
  onClose: () => void;
}

export function ProfileViewModal({ profile, userType, open, onClose }: ProfileViewModalProps) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!profile) return null;

  // Mock company profile for when professionals view employers
  const companyProfile = userType === 'professional' ? {
    name: "TechCorp Global",
    industry: "Technology / SaaS",
    size: "50-200 employees",
    location: "San Francisco, CA",
    website: "www.techcorp-global.com",
    email: "careers@techcorp-global.com",
    phone: "+1 (415) 555-0123",
    description: "Leading SaaS platform provider focused on enterprise solutions. We're building the future of workplace collaboration.",
    verified: true,
    founded: "2018",
    culture: ["Remote-first", "Diverse team", "Growth mindset", "Work-life balance"],
    benefits: [
      "Competitive salary + equity",
      "Health insurance",
      "Remote work",
      "Learning budget",
      "401k matching"
    ],
    openRoles: 12,
    teamSize: 85,
    fundingStage: "Series B"
  } : null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        {userType === 'employer' ? (
          // Employer viewing Professional Profile
          <>
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-border p-4 sm:p-6 z-10">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-4 border-background shadow-lg flex-shrink-0">
                  <AvatarImage src={profile.avatar} />
                  <AvatarFallback>{profile.name?.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
                    <div className="min-w-0 flex-1">
                      <h2 className="text-xl sm:text-2xl mb-1 truncate">{profile.name}</h2>
                      <p className="text-base sm:text-lg text-muted-foreground">{profile.role}</p>
                    </div>
                    {profile.verified && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex-shrink-0">
                        <Shield className="h-3 w-3 mr-1" />
                        AI Verified
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground flex-wrap">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>{profile.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>{profile.experience}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>${profile.rate || profile.hourlyRate}/mo</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4 flex-wrap">
                <Button className="flex-1 sm:flex-initial">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
                <Button variant="outline" className="flex-1 sm:flex-initial">
                  <Heart className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export CV
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
                  <TabsTrigger value="experience" className="text-xs sm:text-sm">Experience</TabsTrigger>
                  <TabsTrigger value="skills" className="text-xs sm:text-sm">Skills</TabsTrigger>
                  <TabsTrigger value="portfolio" className="text-xs sm:text-sm">Portfolio</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  {/* Bio */}
                  <div>
                    <h3 className="text-lg mb-3">About</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {profile.bio || "Experienced professional with a proven track record of delivering high-quality results. Passionate about technology and continuous learning."}
                    </p>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <Card className="p-3 sm:p-4 text-center bg-primary/5">
                      <Star className="h-5 w-5 sm:h-6 sm:w-6 text-primary mx-auto mb-2" />
                      <div className="text-lg sm:text-xl">{profile.rating || 4.9}</div>
                      <div className="text-xs text-muted-foreground">Rating</div>
                    </Card>
                    <Card className="p-3 sm:p-4 text-center bg-success/5">
                      <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-success mx-auto mb-2" />
                      <div className="text-lg sm:text-xl">{profile.completedProjects || 45}</div>
                      <div className="text-xs text-muted-foreground">Projects</div>
                    </Card>
                    <Card className="p-3 sm:p-4 text-center bg-blue-500/5">
                      <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mx-auto mb-2" />
                      <div className="text-lg sm:text-xl">{profile.successRate || 98}%</div>
                      <div className="text-xs text-muted-foreground">Success</div>
                    </Card>
                    <Card className="p-3 sm:p-4 text-center bg-purple-500/5">
                      <Award className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 mx-auto mb-2" />
                      <div className="text-lg sm:text-xl">{profile.certifications?.length || 5}</div>
                      <div className="text-xs text-muted-foreground">Certs</div>
                    </Card>
                  </div>

                  {/* Links */}
                  <div>
                    <h3 className="text-lg mb-3">Links & Contact</h3>
                    <div className="space-y-2">
                      {profile.linkedin && (
                        <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                          <Linkedin className="h-5 w-5 text-blue-600" />
                          <span className="text-sm">LinkedIn Profile</span>
                          <ExternalLink className="h-4 w-4 ml-auto text-muted-foreground" />
                        </a>
                      )}
                      {profile.github && (
                        <a href={profile.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                          <Github className="h-5 w-5" />
                          <span className="text-sm">GitHub Profile</span>
                          <ExternalLink className="h-4 w-4 ml-auto text-muted-foreground" />
                        </a>
                      )}
                      {profile.portfolio && (
                        <a href={profile.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                          <Globe className="h-5 w-5 text-primary" />
                          <span className="text-sm">Portfolio Website</span>
                          <ExternalLink className="h-4 w-4 ml-auto text-muted-foreground" />
                        </a>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="experience" className="space-y-4">
                  <h3 className="text-lg mb-4">Work History</h3>
                  {(profile.workHistory || [
                    {
                      company: "Tech Startup Inc.",
                      role: "Senior Developer",
                      duration: "2021 - Present",
                      description: "Led development of core platform features using React and Node.js"
                    },
                    {
                      company: "Digital Agency",
                      role: "Full Stack Developer",
                      duration: "2019 - 2021",
                      description: "Built responsive web applications for various clients"
                    }
                  ]).map((work: any, index: number) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-start justify-between mb-2 flex-wrap gap-2">
                        <div>
                          <h4 className="font-semibold">{work.role}</h4>
                          <p className="text-sm text-muted-foreground">{work.company}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">{work.duration}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{work.description}</p>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="skills" className="space-y-6">
                  <div>
                    <h3 className="text-lg mb-4">Technical Skills</h3>
                    <div className="space-y-4">
                      {(profile.skills || ['React', 'Node.js', 'TypeScript', 'AWS']).map((skill: string, index: number) => (
                        <div key={skill}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Code className="h-4 w-4 text-primary" />
                              <span className="text-sm font-medium">{skill}</span>
                            </div>
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                              <Shield className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          </div>
                          <Progress value={95 - (index * 5)} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg mb-4">Certifications</h3>
                    <div className="space-y-3">
                      {(profile.certifications || [
                        { name: "AWS Solutions Architect", issuer: "Amazon Web Services", date: "2024", verified: true },
                        { name: "Professional Scrum Master", issuer: "Scrum.org", date: "2023", verified: true }
                      ]).map((cert: any, index: number) => (
                        <Card key={index} className="p-4">
                          <div className="flex items-start justify-between gap-2 flex-wrap">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Award className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold mb-1">{cert.name}</h4>
                                <p className="text-xs text-muted-foreground">{cert.issuer} • {cert.date}</p>
                              </div>
                            </div>
                            {cert.verified && (
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 flex-shrink-0">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="portfolio" className="space-y-4">
                  <h3 className="text-lg mb-4">Recent Projects</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((project) => (
                      <Card key={project} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="h-40 bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                          <Code className="h-12 w-12 text-primary" />
                        </div>
                        <CardContent className="p-4">
                          <h4 className="font-semibold mb-2">Project {project}</h4>
                          <p className="text-xs text-muted-foreground mb-3">Full-stack web application with modern tech stack</p>
                          <Button variant="outline" size="sm" className="w-full">
                            <ExternalLink className="h-3 w-3 mr-2" />
                            View Project
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </>
        ) : (
          // Professional viewing Company Profile
          <>
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-border p-4 sm:p-6 z-10">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-4 border-background shadow-lg rounded-xl flex-shrink-0">
                  <AvatarImage src={`https://api.dicebear.com/7.x/identicon/svg?seed=${companyProfile?.name}`} />
                  <AvatarFallback className="rounded-xl">
                    {companyProfile?.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
                    <div className="min-w-0 flex-1">
                      <h2 className="text-xl sm:text-2xl mb-1 truncate">{companyProfile?.name}</h2>
                      <p className="text-base sm:text-lg text-muted-foreground">{companyProfile?.industry}</p>
                    </div>
                    {companyProfile?.verified && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex-shrink-0">
                        <Shield className="h-3 w-3 mr-1" />
                        Verified Company
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground flex-wrap">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>{companyProfile?.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Building className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>{companyProfile?.size}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>Founded {companyProfile?.founded}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4 flex-wrap">
                <Button className="flex-1 sm:flex-initial">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Hiring Team
                </Button>
                <Button variant="outline" className="flex-1 sm:flex-initial">
                  <Heart className="h-4 w-4 mr-2" />
                  Follow Company
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 space-y-6">
              {/* About */}
              <div>
                <h3 className="text-lg mb-3">About the Company</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {companyProfile?.description}
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                <Card className="p-3 sm:p-4 text-center bg-primary/5">
                  <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 text-primary mx-auto mb-2" />
                  <div className="text-lg sm:text-xl">{companyProfile?.openRoles}</div>
                  <div className="text-xs text-muted-foreground">Open Roles</div>
                </Card>
                <Card className="p-3 sm:p-4 text-center bg-blue-500/5">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-lg sm:text-xl">{companyProfile?.teamSize}</div>
                  <div className="text-xs text-muted-foreground">Team Size</div>
                </Card>
                <Card className="p-3 sm:p-4 text-center bg-purple-500/5">
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 mx-auto mb-2" />
                  <div className="text-lg sm:text-xl">{companyProfile?.fundingStage}</div>
                  <div className="text-xs text-muted-foreground">Stage</div>
                </Card>
              </div>

              {/* Culture */}
              <div>
                <h3 className="text-lg mb-3">Company Culture</h3>
                <div className="flex flex-wrap gap-2">
                  {companyProfile?.culture.map((value) => (
                    <Badge key={value} variant="secondary" className="text-xs">
                      {value}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Benefits */}
              <div>
                <h3 className="text-lg mb-3">Benefits & Perks</h3>
                <div className="grid sm:grid-cols-2 gap-2">
                  {companyProfile?.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                      <span className="text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact */}
              <div>
                <h3 className="text-lg mb-3">Contact Information</h3>
                <div className="space-y-2">
                  <a href={`mailto:${companyProfile?.email}`} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                    <Mail className="h-5 w-5 text-primary" />
                    <span className="text-sm">{companyProfile?.email}</span>
                  </a>
                  <a href={`tel:${companyProfile?.phone}`} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                    <Phone className="h-5 w-5 text-primary" />
                    <span className="text-sm">{companyProfile?.phone}</span>
                  </a>
                  <a href={`https://${companyProfile?.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                    <Globe className="h-5 w-5 text-primary" />
                    <span className="text-sm">{companyProfile?.website}</span>
                    <ExternalLink className="h-4 w-4 ml-auto text-muted-foreground" />
                  </a>
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
