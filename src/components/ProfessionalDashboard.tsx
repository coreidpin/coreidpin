import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

import { 
  Phone, 
  Eye, 
  Shield, 
  Globe, 
  Building, 
  Download, 
  Share2, 
  Settings,
  Fingerprint,
  BadgeCheck,
  TrendingUp,
  Plus,
  Briefcase,
  Users,
  MoreHorizontal,
  ExternalLink,
  Calendar,
  Mail
} from 'lucide-react';
// Defer Recharts load until chart is visible
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import type * as RechartsTypes from 'recharts';

import { EmailVerificationModal } from './EmailVerificationModal';
import { PhoneVerification } from './PhoneVerification';
import { supabase } from '../utils/supabase/client';

export function ProfessionalDashboard() {
  const [phonePin] = useState('+234 802 555 3322');
  const [profileCompletion] = useState(85);
  const [activeTab, setActiveTab] = useState('overview');
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showEndorsementModal, setShowEndorsementModal] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userProfile, setUserProfile] = useState(null);

  const [projects, setProjects] = useState([
    {
      id: 1,
      title: 'E-commerce Platform',
      description: 'Built a full-stack e-commerce solution with React and Node.js',
      role: 'Lead Frontend Developer',
      timeline: 'Jan 2024 - Mar 2024',
      skills: ['React', 'TypeScript', 'Node.js'],
      links: ['https://github.com/example']
    }
  ]);
  const [endorsements, setEndorsements] = useState([
    {
      id: 1,
      endorserName: 'Sarah Johnson',
      role: 'Senior Engineering Manager',
      company: 'TechCorp',
      text: 'Adebayo is an exceptional developer with strong problem-solving skills.',
      date: '2024-01-15',
      verified: true,
      status: 'accepted'
    }
  ]);
  const [stats] = useState({
    profileViews: 247,
    pinUsage: 18,
    verifications: 12,
    apiCalls: 34,
    countries: 8,
    companies: 23,
    projects: 3,
    endorsements: 5
  });

  const chartData = [
    { day: 1, actions: 2 },
    { day: 7, actions: 5 },
    { day: 14, actions: 8 },
    { day: 21, actions: 12 },
    { day: 28, actions: 9 },
    { day: 30, actions: 15 }
  ];

  // Check email verification status on component mount
  useEffect(() => {
    const checkEmailVerification = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserEmail(user.email || '');
          let verified = !!user.email_confirmed_at;
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();
          if (profile) {
            setUserProfile(profile);
            if (profile.email_verified === true) {
              verified = true;
            }
          }
          if (!verified) {
            const flag = localStorage.getItem('emailVerified');
            if (flag === 'true') {
              verified = true;
            }
          }
          if (!verified) {
            setTimeout(() => setShowEmailVerification(true), 1500);
          }
          return;
        }
        try {
          const regEmail = localStorage.getItem('registrationEmail');
          const verifiedFlag = localStorage.getItem('emailVerified');
          if (regEmail && verifiedFlag !== 'true') {
            setUserEmail(regEmail);
            setTimeout(() => setShowEmailVerification(true), 1500);
          }
        } catch {}
      } catch (error) {
        console.error('Error checking verification status:', error);
      }
    };
    
    checkEmailVerification();
  }, []);

  // Reduced motion preference
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    try {
      const mq = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(!!mq && mq.matches);
    } catch {}
  }, []);

  // IntersectionObserver to detect chart visibility and lazy-load Recharts
  const chartRef = React.useRef<HTMLDivElement | null>(null);
  const [chartVisible, setChartVisible] = useState(false);
  const [Recharts, setRecharts] = useState<null | typeof RechartsTypes>(null);

  useEffect(() => {
    const el = chartRef.current;
    if (!el || chartVisible) return;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setChartVisible(true);
          observer.disconnect();
          break;
        }
      }
    }, { root: null, threshold: 0.2 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [chartVisible]);

  useEffect(() => {
    let cancelled = false;
    if (chartVisible && !Recharts) {
      import('recharts').then((mod) => {
        if (!cancelled) setRecharts(mod as any);
      }).catch(() => {});
    }
    return () => { cancelled = true };
  }, [chartVisible, Recharts]);

  // Inline minimal check-circle icon for repeated usage
  const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21.801 10A10 10 0 1 1 17 3.335" />
      <path d="m9 11 3 3L22 4" />
    </svg>
  );

  const notifications = [
    { text: "Company X verified your Core-ID PIN.", type: "verification" },
    { text: "Your identity was requested via API in Canada.", type: "api" },
    { text: "Profile viewed by 12 recruiters today.", type: "view" }
  ];

  return (
    <div className="min-h-screen bg-[#0A0B0D] text-white">
      <div className="container mx-auto px-6 py-8 space-y-8">
        
        {/* Header Section */}
        <motion.div 
          initial={reducedMotion ? undefined : { opacity: 0, y: 20 }}
          animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
            <Phone className="h-5 w-5 text-[#bfa5ff]" />
            <span className="text-xl font-mono tracking-wider text-white">{phonePin}</span>
            <Badge className="bg-[#32f08c]/20 text-[#32f08c] border-[#32f08c]/30">
              Your Core-ID PIN
            </Badge>
          </div>
          <p className="text-white text-sm">Your universal identity for work.</p>
          
          <div className="flex items-center justify-center gap-6 text-sm">
            <span className="text-white">Adebayo Olatunji</span>
            <span className="text-white">•</span>
            <span className="text-white">Senior Frontend Developer</span>
            <span className="text-white">•</span>
            <span className="text-white">Nigeria</span>
            <Badge className="bg-[#32f08c]/20 text-[#32f08c] border-[#32f08c]/30">
              <CheckCircleIcon className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          </div>
        </motion.div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/5 backdrop-blur-sm border border-white/10">
            <TabsTrigger value="overview" className="text-white data-[state=active]:bg-white/10">Overview</TabsTrigger>
            <TabsTrigger value="projects" className="text-white data-[state=active]:bg-white/10">Projects</TabsTrigger>
            <TabsTrigger value="endorsements" className="text-white data-[state=active]:bg-white/10">Endorsements</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Identity Stats Grid */}
            <motion.div 
              initial={reducedMotion ? undefined : { opacity: 0, y: 20 }}
              animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
              transition={reducedMotion ? undefined : { delay: 0.1 }}
              className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4"
            >
              <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all">
                <CardContent className="p-4 text-center text-white">
                  <div className="text-2xl font-bold text-[#bfa5ff]">{stats.profileViews}</div>
                  <div className="text-xs text-white mt-1">Profile Views</div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all">
                <CardContent className="p-4 text-center text-white">
                  <div className="text-2xl font-bold text-[#32f08c]">{stats.pinUsage}</div>
                  <div className="text-xs text-white mt-1">PIN Usage</div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all">
                <CardContent className="p-4 text-center text-white">
                  <div className="text-2xl font-bold text-[#7bb8ff]">{stats.verifications}</div>
                  <div className="text-xs text-white mt-1">Verifications</div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all">
                <CardContent className="p-4 text-center text-white">
                  <div className="text-2xl font-bold text-[#bfa5ff]">{stats.apiCalls}</div>
                  <div className="text-xs text-white mt-1">API Calls</div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all">
                <CardContent className="p-4 text-center text-white">
                  <div className="text-2xl font-bold text-[#32f08c]">{stats.countries}</div>
                  <div className="text-xs text-white mt-1">Countries</div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all">
                <CardContent className="p-4 text-center text-white">
                  <div className="text-2xl font-bold text-[#7bb8ff]">{stats.companies}</div>
                  <div className="text-xs text-white mt-1">Companies</div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all">
                <CardContent className="p-4 text-center text-white">
                  <div className="text-2xl font-bold text-[#bfa5ff]">{stats.projects}</div>
                  <div className="text-xs text-white mt-1">Projects</div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all">
                <CardContent className="p-4 text-center text-white">
                  <div className="text-2xl font-bold text-[#32f08c]">{stats.endorsements}</div>
                  <div className="text-xs text-white mt-1">Endorsements</div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Profile Completion & PIN Activity */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Profile Completion */}
              <motion.div
                initial={reducedMotion ? undefined : { opacity: 0, x: -20 }}
                animate={reducedMotion ? undefined : { opacity: 1, x: 0 }}
                transition={reducedMotion ? undefined : { delay: 0.2 }}
              >
                <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                  <CardContent className="p-6 text-white">
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <svg className="w-24 h-24 -rotate-90">
                          <circle cx="48" cy="48" r="40" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
                          <circle 
                            cx="48" 
                            cy="48" 
                            r="40" 
                            stroke="#32f08c" 
                            strokeWidth="8" 
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 40}`}
                            strokeDashoffset={`${2 * Math.PI * 40 * (1 - profileCompletion / 100)}`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-bold text-[#32f08c]">{profileCompletion}%</span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-white">Profile Completion</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                        <CheckCircleIcon className="h-4 w-4 text-[#32f08c]" />
                            <span className="text-white">Identity verification</span>
                          </div>
                          <div className="flex items-center gap-2">
                        <CheckCircleIcon className="h-4 w-4 text-[#32f08c]" />
                            <span className="text-white">Document verification</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 rounded-full border-2 border-white/30" />
                            <span className="text-white">Skills & experience</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* PIN Activity Chart */}
              <motion.div
                ref={chartRef}
                initial={reducedMotion ? undefined : { opacity: 0, x: 20 }}
                animate={reducedMotion ? undefined : { opacity: 1, x: 0 }}
                transition={reducedMotion ? undefined : { delay: 0.3 }}
              >
                <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                  <CardContent className="p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">PIN Activity Overview</h3>
                      <Badge className="bg-[#7bb8ff]/20 text-[#7bb8ff] border-[#7bb8ff]/30">30 days</Badge>
                    </div>
                    
                    <div className="h-32 mb-4">
                      {Recharts ? (
                        <Recharts.ResponsiveContainer width="100%" height="100%">
                          <Recharts.AreaChart data={chartData}>
                            <Recharts.XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#ffffff60' }} />
                            <Recharts.YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#ffffff60' }} />
                            <Recharts.Area 
                              type="monotone" 
                              dataKey="actions" 
                              stroke="#7bb8ff" 
                              fill="url(#gradient)" 
                              strokeWidth={2}
                            />
                            <defs>
                              <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#7bb8ff" stopOpacity={0.3} />
                                <stop offset="100%" stopColor="#7bb8ff" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                          </Recharts.AreaChart>
                        </Recharts.ResponsiveContainer>
                      ) : (
                        <div className="h-full w-full bg-white/5 rounded-md animate-pulse" aria-label="Loading chart" />
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-[#7bb8ff] font-semibold">42</div>
                        <div className="text-white">Total PIN actions</div>
                      </div>
                      <div>
                        <div className="text-[#32f08c] font-semibold">18</div>
                        <div className="text-white">Company verifications</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Recent Activity */}
            <motion.div
              initial={reducedMotion ? undefined : { opacity: 0, y: 20 }}
              animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
              transition={reducedMotion ? undefined : { delay: 0.5 }}
            >
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardContent className="p-6 text-white">
                  <h3 className="text-lg font-semibold mb-4 text-white">Recent Activity</h3>
                  <div className="space-y-3">
                    {notifications.map((notification, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                        {notification.type === 'verification' && <BadgeCheck className="h-4 w-4 text-[#32f08c]" />}
                        {notification.type === 'api' && <Globe className="h-4 w-4 text-[#7bb8ff]" />}
                        {notification.type === 'view' && <Eye className="h-4 w-4 text-[#bfa5ff]" />}
                        <span className="text-sm text-white">{notification.text}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

      {/* Quick Actions */}
            <motion.div
              initial={reducedMotion ? undefined : { opacity: 0, y: 20 }}
              animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
              transition={reducedMotion ? undefined : { delay: 0.4 }}
            >
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardContent className="p-6 text-white">
                  <h3 className="text-lg font-semibold mb-4 text-white">Quick Actions</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    <Button 
                      onClick={() => window.location.href = '/identity-management'}
                      variant="outline" 
                      className="h-auto p-4 flex-col gap-2 border-white/20 hover:bg-white/10 text-white"
                    >
                      <Fingerprint className="h-5 w-5 text-[#bfa5ff]" />
                      <span className="text-xs text-white">Manage Identity</span>
                    </Button>
                    
                    <Button variant="outline" className="h-auto p-4 flex-col gap-2 border-white/20 hover:bg-white/10 text-white">
                      <Eye className="h-5 w-5 text-[#32f08c]" />
                      <span className="text-xs text-white">View Public Profile</span>
                    </Button>
                    
                    <Button variant="outline" className="h-auto p-4 flex-col gap-2 border-white/20 hover:bg-white/10 text-white">
                      <Download className="h-5 w-5 text-[#7bb8ff]" />
                      <span className="text-xs text-white">Download Badge</span>
                    </Button>
                    
                    <Button variant="outline" className="h-auto p-4 flex-col gap-2 border-white/20 hover:bg-white/10 text-white">
                      <Phone className="h-5 w-5 text-[#bfa5ff]" />
                      <span className="text-xs text-white">Update Phone</span>
                    </Button>
                    
                    <Button variant="outline" className="h-auto p-4 flex-col gap-2 border-white/20 hover:bg-white/10 text-white">
                      <Share2 className="h-5 w-5 text-[#32f08c]" />
                      <span className="text-xs text-white">Share PIN</span>
                    </Button>
                    
                    <Button variant="outline" className="h-auto p-4 flex-col gap-2 border-white/20 hover:bg-white/10 text-white">
                      <Settings className="h-5 w-5 text-[#7bb8ff]" />
                      <span className="text-xs text-white">Security Settings</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Projects</h2>
              <Button className="bg-[#32f08c] hover:bg-[#32f08c]/90 text-black">
                <Plus className="h-4 w-4 mr-2" />
                Add Project
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {projects.map((project) => (
                <Card key={project.id} className="bg-white/5 backdrop-blur-sm border-white/10">
                  <CardContent className="p-6 text-white">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{project.title}</h3>
                        <p className="text-sm text-white/80">{project.role}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-white/80 mb-4">{project.description}</p>
                    <div className="flex items-center gap-2 mb-4">
                      <Calendar className="h-4 w-4 text-white/60" />
                      <span className="text-sm text-white/80">{project.timeline}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.skills.map((skill, index) => (
                        <Badge key={index} className="bg-[#7bb8ff]/20 text-[#7bb8ff] border-[#7bb8ff]/30">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Endorsements Tab */}
          <TabsContent value="endorsements" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Endorsements</h2>
              <Button className="bg-[#32f08c] hover:bg-[#32f08c]/90 text-black">
                <Plus className="h-4 w-4 mr-2" />
                Request Endorsement
              </Button>
            </div>

            <div className="space-y-4">
              {endorsements.map((endorsement) => (
                <Card key={endorsement.id} className="bg-white/5 backdrop-blur-sm border-white/10">
                  <CardContent className="p-6 text-white">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-white/60" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{endorsement.endorserName}</h3>
                          <p className="text-sm text-white/80">{endorsement.role} • {endorsement.company}</p>
                        </div>
                      </div>
                      <Badge className="bg-[#32f08c]/20 text-[#32f08c] border-[#32f08c]/30">
                        <CheckCircleIcon className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    </div>
                    <p className="text-white/90 mb-4">"{endorsement.text}"</p>
                    <p className="text-sm text-white/60">{new Date(endorsement.date).toLocaleDateString()}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
        </TabsContent>
      </Tabs>
      
      {/* Email Verification Modal */}
      <EmailVerificationModal
        isOpen={showEmailVerification}
        onClose={() => setShowEmailVerification(false)}
        userEmail={userEmail}
      />

      {userProfile && userProfile.email_verified === true && userProfile.phone_verified !== true && (
        <div className="mt-6">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Verify Phone to Activate PIN</h3>
                <Badge className="bg-[#bfa5ff]/20 text-[#bfa5ff] border-[#bfa5ff]/30">Required</Badge>
              </div>
              <div className="max-w-xl">
                <PhoneVerification 
                  initialPhone={(userProfile?.phone as string) || ''}
                  isVerified={false}
                  onVerificationComplete={() => {
                    try { setUserProfile({ ...(userProfile as any), phone_verified: true }); } catch {}
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      </div>
    </div>
  );
}
