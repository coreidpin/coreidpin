import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { ProfileCompletionForm } from './ProfileCompletionForm';
import { AIAnalysisModal } from './AIAnalysisModal';
import { AIBadge, getExperienceLevelFromAnalysis } from './AIBadge';
import { SwipeInterface } from './SwipeInterface';
import { MatchesView } from './MatchesView';
import { ComplianceChecks } from './ComplianceChecks';
import { ProfileViewModal } from './ProfileViewModal';
import { PINIdentityCard, generateMockPINData } from './PINIdentityCard';
import { PINOnboarding } from './PINOnboarding';
import { api } from '../utils/api';
import { supabase } from '../utils/supabase/client';
import { mockJobOpportunities } from './mockSwipeData';
import { toast } from 'sonner';
import { 
  Award, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  Upload,
  Eye,
  MapPin,
  Shield,
  Brain,
  Target,
  BadgeCheck,
  Sparkles,
  Heart,
  Briefcase,
  AlertTriangle,
  TrendingUp,
  Fingerprint,
  Share2,
  Globe,
  Building,
  ShieldCheck
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { Lock } from 'lucide-react';

const TASKBAR_DISABLED = (import.meta.env.VITE_BETA_DISABLE_TASKBAR ?? 'true') === 'true';

export function ProfessionalDashboard() {
  const [profileCompletion, setProfileCompletion] = useState(0); // Will be loaded from backend
  const [setupSteps, setSetupSteps] = useState<any>({});
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [savedProfile, setSavedProfile] = useState<any>(null);
  const [matchedJob, setMatchedJob] = useState<any>(null);
  const [showMatchNotification, setShowMatchNotification] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedEmployer, setSelectedEmployer] = useState<any>(null);
  const [pinData, setPinData] = useState<any>(null);
  const [showPINOnboarding, setShowPINOnboarding] = useState(false);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [activeSection, setActiveSection] = useState<'summary' | 'portfolio' | 'endorsements' | 'opportunities' | 'activity' | 'settings'>('summary');
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [registrationSummary, setRegistrationSummary] = useState<any>(null);

  // Section refs for smooth-scroll wiring
  const welcomeRef = useRef<HTMLDivElement>(null);
  const portfolioRef = useRef<HTMLDivElement>(null);
  const endorsementsRef = useRef<HTMLDivElement>(null);
  const opportunitiesRef = useRef<HTMLDivElement>(null);
  const activityRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  const scrollTo = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleViewEmployer = (employerId: string) => {
    // Mock employer data - in production this would fetch from API
    const employer = {
      id: employerId,
      name: "TechCorp Global",
      industry: "Technology / SaaS"
    };
    setSelectedEmployer(employer);
    setShowProfileModal(true);
  };

  // User display data with sensible defaults; updated from metadata/profile
  const [userProfile, setUserProfile] = useState({
    name: "Adebayo Olatunji",
    title: "Senior Frontend Developer",
    location: "Lagos, Nigeria",
    email: "adebayo.olatunji@email.com",
    hourlyRate: 45,
    availability: "Available",
    complianceScore: 0
  });

  // Load analysis and profile completion on mount
  useEffect(() => {
    const loadAnalysisAndCompletion = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const accessToken = localStorage.getItem('accessToken');
        if (userId && accessToken) {
          // Fetch profile completion from backend
          const profileRes = await api.getProfile(userId, accessToken);
          if (profileRes.success && profileRes.profile) {
            setProfileCompletion(profileRes.profile.completionPercentage || 0);
            setSetupSteps(profileRes.profile.setup_steps || {});
          }
          // Fetch AI analysis
          const result = await api.getProfileAnalysis(userId, accessToken);
          if (result.success && result.analysis) {
            setAiAnalysis(result.analysis);
          }
        }
      } catch (error) {
        console.log('No analysis or profile completion found');
      } finally {
        setIsInitialLoading(false);
      }
    };
    loadAnalysisAndCompletion();
  }, []);

  // Load PIN data on mount
  useEffect(() => {
    const loadPINData = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const accessToken = localStorage.getItem('accessToken');
        
        if (userId && accessToken) {
          console.log('Loading PIN data for user:', userId);
          const result = await api.getUserPIN(userId, accessToken);
          
          if (result.success && result.data) {
            console.log('PIN data loaded successfully:', result.data.pinNumber);
            setPinData(result.data);
          } else {
            console.log('No PIN found for user');
          }
        }
      } catch (error) {
        console.log('Failed to load PIN:', error);
        // User doesn't have a PIN yet, that's okay
      }
    };

    loadPINData();
  }, []);

  // Load pending registration summary from localStorage (set by RegistrationFlow)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('pendingRegistrationData');
      if (raw) {
        const data = JSON.parse(raw);
        setRegistrationSummary(data);
      }
    } catch {}
  }, []);

  // Show persistent profile completion prompt if incomplete
  const showProfileCompletionPrompt = profileCompletion < 100;

  // Load name/title from Supabase metadata; prefer savedProfile title when available
  useEffect(() => {
    const applyUserMetadata = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const name = (user.user_metadata as any)?.name || user.email || userProfile.name;
          const titleFromSaved = (savedProfile && (savedProfile.title || savedProfile.professionalTitle)) || null;
          const titleFromMeta = (user.user_metadata as any)?.title || null;
          const title = titleFromSaved || titleFromMeta || userProfile.title;
          setUserProfile((prev) => ({ ...prev, name, title }));
        }
      } catch (err) {
        // Non-fatal: keep defaults
      }
    };
    applyUserMetadata();
  }, [savedProfile]);

  // Set dark mode permanently
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Reduced motion guard
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = (e: MediaQueryList | MediaQueryListEvent) => setReducedMotion('matches' in e ? e.matches : mq.matches);
    update(mq);
    mq.addEventListener?.('change', update as any);
    return () => mq.removeEventListener?.('change', update as any);
  }, []);

  // Scroll-spy for active section highlighting
  useEffect(() => {
    const map: { el: HTMLElement | null; id: typeof activeSection }[] = [
      { el: welcomeRef.current, id: 'summary' },
      { el: portfolioRef.current, id: 'portfolio' },
      { el: endorsementsRef.current, id: 'endorsements' },
      { el: opportunitiesRef.current, id: 'opportunities' },
      { el: activityRef.current, id: 'activity' },
      { el: settingsRef.current, id: 'settings' },
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const target = map.find((m) => m.el === entry.target);
          if (target && entry.isIntersecting) {
            setActiveSection(target.id);
          }
        }
      },
      { rootMargin: '-55% 0px -35% 0px', threshold: 0.01 }
    );

    map.forEach((m) => m.el && observer.observe(m.el));
    return () => observer.disconnect();
  }, []);

  const handleAnalysisComplete = (analysis: any) => {
    setAiAnalysis(analysis);
    setShowAnalysisModal(true);
  };

  const handleProfileSaved = (profile: any) => {
    setSavedProfile(profile);
    setProfileCompletion(profile.completionPercentage || 100);
    setSetupSteps(profile.setup_steps || {});
    // Optionally, update backend public.profiles setup_progress/setup_steps here if needed
  };

  const handlePINCreated = (newPinData: any) => {
    setPinData(newPinData);
    setShowPINOnboarding(false);
    toast.success('🎉 Your PIN has been created! You can now share your verified identity.');
  };

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-white" style={{ backgroundColor: '#0a0b0d' }}>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Registration Summary Banner */}
        {registrationSummary && (
          <Card className="bg-[#32f08c]/10 border-[#32f08c]/30">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="h-4 w-4 text-[#32f08c]" />
                    <span className="text-sm text-white/80">
                      Registration complete — here’s your summary
                    </span>
                  </div>
                  <div className="text-xs text-white/70">
                    <span className="font-medium">{registrationSummary?.name}</span>
                    {registrationSummary?.title ? ` • ${registrationSummary.title}` : ''}
                    {registrationSummary?.resumeFileName ? ` • Resume: ${registrationSummary.resumeFileName}` : ''}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/20 text-white hover:bg-white/10"
                    onClick={() => setCurrentTab('setup')}
                  >
                    Edit Profile
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white/70 hover:text-white"
                    onClick={() => {
                      try { localStorage.removeItem('pendingRegistrationData'); } catch {}
                      setRegistrationSummary(null);
                    }}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Persistent Profile Completion Prompt */}
        {showProfileCompletionPrompt && (
          <Card className="bg-yellow-100/10 border-yellow-300/30 mb-4">
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
                <span className="text-sm text-yellow-200">
                  Your profile is {profileCompletion}% complete. Finish setup to unlock more features!
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-yellow-300 text-yellow-300 hover:bg-yellow-100/20"
                onClick={() => setCurrentTab('setup')}
              >
                Complete Profile
              </Button>
            </CardContent>
          </Card>
        )}
        {/* Mobile Header: title and scroll chips */}
        <div className="lg:hidden sticky top-0 z-20 -mx-4 px-4 py-3 backdrop-blur bg-black/30 border-b border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/70">Dashboard</span>
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar" role="navigation" aria-label="Dashboard sections">
            <Button onClick={() => scrollTo(welcomeRef)} aria-controls="section-summary" aria-current={activeSection === 'summary' ? 'page' : undefined} variant="secondary" size="sm" className={activeSection === 'summary' ? 'bg-[#bfa5ff]/20 border-[#bfa5ff]/40 text-[#bfa5ff]' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}>
              Summary
            </Button>
            <Button onClick={() => scrollTo(portfolioRef)} aria-controls="section-portfolio" aria-current={activeSection === 'portfolio' ? 'page' : undefined} variant="secondary" size="sm" className={activeSection === 'portfolio' ? 'bg-[#7bb8ff]/20 border-[#7bb8ff]/40 text-[#7bb8ff]' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}>
              Portfolio
            </Button>
            <Button onClick={() => scrollTo(endorsementsRef)} aria-controls="section-endorsements" aria-current={activeSection === 'endorsements' ? 'page' : undefined} variant="secondary" size="sm" className={activeSection === 'endorsements' ? 'bg-[#32f08c]/20 border-[#32f08c]/40 text-[#32f08c]' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}>
              Endorsements
            </Button>
            <Button onClick={() => scrollTo(opportunitiesRef)} aria-controls="section-opportunities" aria-current={activeSection === 'opportunities' ? 'page' : undefined} variant="secondary" size="sm" className={activeSection === 'opportunities' ? 'bg-[#bfa5ff]/20 border-[#bfa5ff]/40 text-[#bfa5ff]' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}>
              Opportunities
            </Button>
            <Button onClick={() => scrollTo(activityRef)} aria-controls="section-activity" aria-current={activeSection === 'activity' ? 'page' : undefined} variant="secondary" size="sm" className={activeSection === 'activity' ? 'bg-[#7bb8ff]/20 border-[#7bb8ff]/40 text-[#7bb8ff]' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}>
              Activity
            </Button>
            <Button onClick={() => scrollTo(settingsRef)} aria-controls="section-settings" aria-current={activeSection === 'settings' ? 'page' : undefined} variant="secondary" size="sm" className={activeSection === 'settings' ? 'bg-[#32f08c]/20 border-[#32f08c]/40 text-[#32f08c]' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}>
              Settings
            </Button>
          </div>
        </div>
        {/* Split-view Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr] gap-6">
          {/* Left Sidebar - Temporarily hidden for dark theme migration */}
          {/* <aside className="hidden lg:flex flex-col gap-2">
            ...sidebar content removed...
          </aside> */}

          {/* Main Content */}
          <main className="space-y-6">
            {/* Welcome + PIN Overview */}
            <motion.div ref={welcomeRef} id="section-summary" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="bg-black/40 border-[#bfa5ff]/30">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-2xl font-bold">Welcome back, {userProfile.name.split(' ')[0]}! 👋</h1>
                        <Badge variant="outline" className="border-[#32f08c]/40 text-[#32f08c] bg-[#32f08c]/10">Active</Badge>
                      </div>
                      <p className="text-sm text-white/70 mb-3">{userProfile.title}</p>
                      <div className="space-y-2 max-w-md">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-white/70">Trust & Completion</span>
                          <span className="text-[#32f08c]">{profileCompletion}%</span>
                        </div>
                        <Progress value={profileCompletion} className="h-2 bg-white/10" />
                        <p className="text-xs text-white/50">Your PIN unlocks opportunities. Keep it active!</p>
                      </div>
                    </div>
                    <div className="relative w-24 h-24 rounded-xl bg-[#bfa5ff]/10 border border-[#bfa5ff]/30 flex items-center justify-center shadow-[0_0_20px_#bfa5ff40] overflow-hidden" aria-live="polite">
                      {/* Lottie Glow behind trust score with reduced-motion guard */}
                      {!reducedMotion ? (
                        <lottie-player
                          src="https://assets9.lottiefiles.com/packages/lf20_tQOS7h.json"
                          background="transparent"
                          speed="1"
                          style={{ position: 'absolute', inset: 0, transform: 'scale(1.6)' }}
                          loop
                          autoplay
                        ></lottie-player>
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-[#bfa5ff]/20 to-transparent" aria-hidden="true" />
                      )}
                      <span className="relative z-10 text-3xl font-mono text-[#bfa5ff]">{pinData?.trustScore ?? 72}%</span>
                    </div>
                  </div>
                  <div className="mt-6">
                    {pinData ? (
                      <PINIdentityCard data={pinData} variant="preview" />
                    ) : (
                      <div className="p-4 rounded-lg bg-[#7bb8ff]/10 border border-[#7bb8ff]/30">
                        <div className="flex items-center gap-2">
                          <Fingerprint className="h-5 w-5 text-[#7bb8ff]" />
                          <span className="text-sm text-white/80">No active PIN yet. Create one to boost trust.</span>
                        </div>
                        <Button size="sm" onClick={() => setShowPINOnboarding(true)} className="mt-3 bg-gradient-to-r from-[#7bb8ff] to-[#bfa5ff] text-black hover:opacity-90">Create PIN</Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Profile Snapshot */}
            <div ref={portfolioRef}>
              <Card className="bg-black/40 border-[#bfa5ff]/30">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                      <div className="text-xl">$12.5k</div>
                      <div className="text-xs text-white/60">Total Earned</div>
                    </div>
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="text-xl text-[#32f08c]">3</div>
                    <div className="text-xs text-white/60">New Matches</div>
                  </div>
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="text-xl text-[#7bb8ff]">15</div>
                    <div className="text-xs text-white/60">New Jobs</div>
                  </div>
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="text-xl text-[#bfa5ff]">87%</div>
                    <div className="text-xs text-white/60">Match Score</div>
                  </div>
                </div>
                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">Update Profile</Button>
                  <Button className="bg-gradient-to-r from-[#bfa5ff] to-[#7bb8ff] text-black hover:opacity-90">Add New Skill</Button>
                </div>
              </CardContent>
              </Card>
            </div>

            {/* Portfolio Showcase */}
            <Card className="bg-black/40 border-[#bfa5ff]/30">
              <CardHeader>
                <CardTitle>Portfolio Showcase</CardTitle>
                <CardDescription className="text-white/60">Recent work and case studies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {isInitialLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="rounded-lg overflow-hidden border border-white/10 bg-white/5">
                        <Skeleton className="h-28 w-full" />
                        <div className="p-3 space-y-2">
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-3 w-3/4" />
                        </div>
                      </div>
                    ))
                  ) : (
                    [1,2,3,4].map((i) => (
                      <motion.div key={i} whileHover={reducedMotion ? undefined : { scale: 1.02 }} className="rounded-lg overflow-hidden border border-white/10 bg-white/5">
                        <div className="aspect-[16/9] bg-black/5">
                          <img
                            src={`https://placehold.co/600x338?text=Project+%23${i}`}
                            alt={`Preview of Project ${i}`}
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Project #{i}</span>
                            {i === 1 && (
                              <Badge className="bg-[#bfa5ff]/20 text-[#bfa5ff] border-[#bfa5ff]/30">Highlight</Badge>
                            )}
                          </div>
                          <p className="text-xs text-white/60 mt-1">Accessible image placeholder with alt text</p>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Endorsements & Recommendations */}
            <div ref={endorsementsRef} id="section-endorsements">
            <Card className="bg-black/40 border-[#bfa5ff]/30">
              <CardHeader>
                <CardTitle>Endorsements</CardTitle>
                <CardDescription className="text-white/60">What peers and employers say</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 overflow-x-auto no-scrollbar">
                  {["Exceptional UI work","Reliable and fast","Great communicator","High-quality code"].map((text, idx) => (
                    <motion.div key={idx} whileHover={{ y: -2 }} className="min-w-[220px] p-4 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-center gap-2 mb-2">
                        <BadgeCheck className="h-4 w-4 text-[#32f08c]" />
                        <span className="text-sm">Verified</span>
                      </div>
                      <p className="text-sm text-white/80">{text}</p>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-4">
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">Endorse More</Button>
                </div>
              </CardContent>
            </Card>
            </div>

            {/* Opportunities & Recommendations */}
            <div ref={opportunitiesRef} id="section-opportunities">
            <Card className="bg-black/40 border-[#bfa5ff]/30">
              <CardHeader>
                <CardTitle>Opportunities for You</CardTitle>
                <CardDescription className="text-white/60">Smart suggestions based on your profile</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {isInitialLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="p-4 rounded-lg bg-white/5 border border-white/10">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-2/3" />
                            <Skeleton className="h-3 w-1/3" />
                          </div>
                          <Skeleton className="h-6 w-14" />
                        </div>
                        <div className="mt-3 space-y-2">
                          <Skeleton className="h-3 w-full" />
                          <Skeleton className="h-3 w-5/6" />
                        </div>
                      </div>
                    ))
                  ) : (
                    mockJobOpportunities.slice(0,4).map((job) => (
                      <motion.div key={job.id} whileHover={reducedMotion ? undefined : { scale: 1.02 }} className="p-4 rounded-lg bg-white/5 border border-white/10 cursor-pointer">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">{job.title}</h4>
                            <p className="text-xs text-white/60">{job.company} • {job.location}</p>
                          </div>
                          <Badge className="bg-[#32f08c]/20 text-[#32f08c] border-[#32f08c]/30">{job.matchScore}%</Badge>
                        </div>
                        <p className="text-sm text-white/70 mt-2 line-clamp-2">{job.description}</p>
                      </motion.div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
            </div>

            {/* Activity Feed */}
            <div ref={activityRef} id="section-activity">
            <Card className="bg-black/40 border-[#bfa5ff]/30">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[{t:'Portfolio item added', v:true},{t:'Endorsed by TechCorp', v:true},{t:'Viewed by FinanceHub', v:false}].map((item, i) => (
                     <div key={i} className="flex items-center gap-3 text-sm">
                       {item.v ? <BadgeCheck className="h-4 w-4 text-[#32f08c]" /> : <Eye className="h-4 w-4 text-[#7bb8ff]" />}
                      <span className="text-white/80">{item.t}</span>
                       {item.v && <Badge variant="outline" className="ml-auto border-[#32f08c]/40 text-[#32f08c]">PIN verified</Badge>}
                     </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            </div>

            {/* Settings & Security */}
            <div ref={settingsRef} id="section-settings">
            <Card className="bg-black/40 border-[#bfa5ff]/30">
              <CardHeader>
                <CardTitle>Settings & Security</CardTitle>
                <CardDescription className="text-white/60">Manage your PIN and account</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <Shield className="h-4 w-4 mr-2" /> PIN Security Settings
                  </Button>
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <Fingerprint className="h-4 w-4 mr-2" /> Regenerate PIN
                  </Button>
                  <Button className="bg-gradient-to-r from-[#bfa5ff] to-[#7bb8ff] text-black hover:opacity-90">
                    <Briefcase className="h-4 w-4 mr-2" /> Link to Employer
                  </Button>
                </div>
              </CardContent>
            </Card>
            </div>
          </main>

          {/* Right Sidebar - Temporarily hidden for dark theme migration */}
          {/* <aside className="hidden lg:block">
            ...right sidebar content removed...
          </aside> */}
        </div>

        {/* AI Badge if available */}
        {aiAnalysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AIBadge
              experienceLevel={getExperienceLevelFromAnalysis(aiAnalysis.nigerianResponse || aiAnalysis.experienceLevel || 'mid')}
              industry="tech"
              analysisDate={aiAnalysis.analyzedAt ? new Date(aiAnalysis.analyzedAt).toLocaleDateString() : undefined}
              show={true}
            />
          </motion.div>
        )}

        {/* Main Tabs (existing functionality retained; taskbar items disabled in beta) */}
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
          <TabsList className="flex w-full gap-2 overflow-x-auto no-scrollbar px-1 bg-white/10 border border-white/10 text-white md:flex-wrap md:justify-between md:overflow-visible snap-x snap-mandatory scroll-smooth">
            <TabsTrigger value="dashboard" className="gap-2 flex-shrink-0 snap-start min-w-[120px] sm:min-w-[140px] px-3 py-2 sm:px-4 sm:py-2 rounded-full">
              <Fingerprint className="h-4 w-4" />
              <span className="hidden sm:inline">My PIN</span>
              {!pinData && <Badge variant="secondary" className="ml-auto hidden lg:inline-flex bg-yellow-100 text-yellow-800">New</Badge>}
            </TabsTrigger>
            {TASKBAR_DISABLED ? (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      role="button"
                      aria-disabled="true"
                      title="Coming soon"
                      className="gap-2 inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 rounded-full opacity-50 cursor-not-allowed select-none flex-shrink-0 snap-start min-w-[120px] sm:min-w-[140px]"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); console.info('[Beta] Disabled taskbar click: Swipe Jobs'); }}
                    >
                      <Heart className="h-4 w-4" />
                      <span className="hidden sm:inline">Swipe Jobs</span>
                      <Badge variant="secondary" className="ml-auto hidden lg:inline-flex">15</Badge>
                      <Lock className="h-3 w-3 ml-2 opacity-70" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent sideOffset={6}>Swipe Jobs is unavailable in beta</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      role="button"
                      aria-disabled="true"
                      title="Coming soon"
                      className="gap-2 inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 rounded-full opacity-50 cursor-not-allowed select-none flex-shrink-0 snap-start min-w-[120px] sm:min-w-[140px]"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); console.info('[Beta] Disabled taskbar click: Matches'); }}
                    >
                      <Target className="h-4 w-4" />
                      <span className="hidden sm:inline">Matches</span>
                      <Badge variant="secondary" className="ml-auto hidden lg:inline-flex">3</Badge>
                      <Lock className="h-3 w-3 ml-2 opacity-70" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent sideOffset={6}>Matches are unavailable in beta</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      role="button"
                      aria-disabled="true"
                      title="Coming soon"
                      className="gap-2 inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 rounded-full opacity-50 cursor-not-allowed select-none flex-shrink-0 snap-start min-w-[120px] sm:min-w-[140px]"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); console.info('[Beta] Disabled taskbar click: Setup'); }}
                    >
                      <Sparkles className="h-4 w-4" />
                      <span className="hidden sm:inline">Setup</span>
                      <Lock className="h-3 w-3 ml-2 opacity-70" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent sideOffset={6}>Setup is unavailable in beta</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      role="button"
                      aria-disabled="true"
                      title="Coming soon"
                      className="gap-2 inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 rounded-full opacity-50 cursor-not-allowed select-none flex-shrink-0 snap-start min-w-[120px] sm:min-w-[140px]"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); console.info('[Beta] Disabled taskbar click: Verify'); }}
                    >
                      <Shield className="h-4 w-4" />
                      <span className="hidden sm:inline">Verify</span>
                      <Lock className="h-3 w-3 ml-2 opacity-70" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent sideOffset={6}>Verification is unavailable in beta</TooltipContent>
                </Tooltip>
              </>
            ) : (
              <>
                <TabsTrigger value="swipe" className="gap-2 flex-shrink-0 snap-start min-w-[120px] sm:min-w-[140px] px-3 py-2 sm:px-4 sm:py-2 rounded-full">
                  <Heart className="h-4 w-4" />
                  <span className="hidden sm:inline">Swipe Jobs</span>
                  <Badge variant="secondary" className="ml-auto hidden lg:inline-flex">15</Badge>
                </TabsTrigger>
                <TabsTrigger value="matches" className="gap-2 flex-shrink-0 snap-start min-w-[120px] sm:min-w-[140px] px-3 py-2 sm:px-4 sm:py-2 rounded-full">
                  <Target className="h-4 w-4" />
                  <span className="hidden sm:inline">Matches</span>
                  <Badge variant="secondary" className="ml-auto hidden lg:inline-flex">3</Badge>
                </TabsTrigger>
                <TabsTrigger value="setup" className="gap-2 flex-shrink-0 snap-start min-w-[120px] sm:min-w-[140px] px-3 py-2 sm:px-4 sm:py-2 rounded-full">
                  <Sparkles className="h-4 w-4" />
                  <span className="hidden sm:inline">Setup</span>
                </TabsTrigger>
                <TabsTrigger value="verify" className="gap-2 flex-shrink-0 snap-start min-w-[120px] sm:min-w-[140px] px-3 py-2 sm:px-4 sm:py-2 rounded-full">
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">Verify</span>
                </TabsTrigger>
              </>
            )}
          </TabsList>

          {/* My PIN Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {showPINOnboarding ? (
              <PINOnboarding 
                onComplete={handlePINCreated}
                onSkip={() => setShowPINOnboarding(false)}
              />
            ) : pinData ? (
              <div className="space-y-6">
                {/* PIN Card Display */}
                <Card className="p-6 bg-gradient-to-br from-[#bfa5ff]/10 via-[#7bb8ff]/10 to-[#bfa5ff]/10 border-2 border-[#bfa5ff]/20">
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Fingerprint className="h-6 w-6 text-[#bfa5ff]" />
                      <h2 className="text-2xl text-white">Your Professional Identity</h2>
                    </div>
                    <p className="text-white/70">
                      Your PIN is verified and active. Share it with employers worldwide.
                    </p>
                  </div>
                  
                  <PINIdentityCard data={pinData} variant="full" showActions={true} />
                </Card>

                {/* PIN Actions */}
                <div className="grid sm:grid-cols-3 gap-4">
                  <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-[#7bb8ff]/20 bg-[#7bb8ff]/5">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-[#7bb8ff]/20 rounded-lg">
                        <Share2 className="h-5 w-5 text-[#7bb8ff]" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1 text-white">Share Your PIN</h4>
                        <p className="text-sm text-white/70">Copy link to share with employers</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-[#32f08c]/20 bg-[#32f08c]/5">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-[#32f08c]/20 rounded-lg">
                        <BadgeCheck className="h-5 w-5 text-[#32f08c]" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1 text-white">Verify More Skills</h4>
                        <p className="text-sm text-white/70">Add experiences to increase trust score</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-[#bfa5ff]/20 bg-[#bfa5ff]/5">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-[#bfa5ff]/20 rounded-lg">
                        <Eye className="h-5 w-5 text-[#bfa5ff]" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1 text-white">PIN Analytics</h4>
                        <p className="text-sm text-white/70">See who viewed your PIN</p>
                      </div>
                    </div>
                  </Card>
                </div>

                <Card className="relative p-8 bg-[#0a0b0d] rounded-3xl border-white/10 overflow-hidden">
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(191,165,255,0.08)' }} />
                    <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(50,240,140,0.08)' }} />
                  </div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xl font-semibold text-white">Identity Control Panel</h3>
                      <Badge className="bg-white/10 text-white border-white/20">Live</Badge>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      <motion.div whileHover={{ y: -4 }} className="group relative rounded-2xl p-6 bg-white/5 backdrop-blur-sm border border-white/10 transition-all">
                        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" style={{ boxShadow: '0 0 24px rgba(50,240,140,0.25)' }} />
                        <div className="relative flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Fingerprint className="h-6 w-6" style={{ color: '#32f08c' }} />
                            <span className="text-white/70 text-xs">PIN</span>
                          </div>
                          <BadgeCheck className="h-5 w-5" style={{ color: '#32f08c' }} />
                        </div>
                        <div className="font-mono text-2xl sm:text-3xl tracking-wider text-white">{pinData?.pinNumber ?? 'PIN-XXX-XXXX'}</div>
                        <div className="text-xs text-white/50 mt-2">Verified</div>
                      </motion.div>

                      <motion.div whileHover={{ y: -4 }} className="group relative rounded-2xl p-6 bg-white/5 backdrop-blur-sm border border-white/10 transition-all">
                        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" style={{ boxShadow: '0 0 24px rgba(123,184,255,0.25)' }} />
                        <div className="relative flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Globe className="h-6 w-6" style={{ color: '#7bb8ff' }} />
                            <span className="text-white/70 text-xs">Countries Verified</span>
                          </div>
                        </div>
                        <div className="text-3xl font-extrabold text-white">{(pinData as any)?.verificationCountries?.length ?? 0}</div>
                        <div className="text-xs text-white/50 mt-2">Global Reach</div>
                      </motion.div>

                      <motion.div whileHover={{ y: -4 }} className="group relative rounded-2xl p-6 bg-white/5 backdrop-blur-sm border border-white/10 transition-all">
                        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" style={{ boxShadow: '0 0 24px rgba(191,165,255,0.25)' }} />
                        <div className="relative flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Building className="h-6 w-6" style={{ color: '#bfa5ff' }} />
                            <span className="text-white/70 text-xs">Companies Connected</span>
                          </div>
                        </div>
                        <div className="text-3xl font-extrabold text-white">{(pinData as any)?.linkedCompanies?.length ?? 0}</div>
                        <div className="text-xs text-white/50 mt-2">Hiring Access</div>
                      </motion.div>

                      <motion.div whileHover={{ y: -4 }} className="group relative rounded-2xl p-6 bg-white/5 backdrop-blur-sm border border-white/10 transition-all">
                        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" style={{ boxShadow: '0 0 24px rgba(50,240,140,0.25)' }} />
                        <div className="relative flex items-center gap-3 mb-4">
                          <ShieldCheck className="h-6 w-6" style={{ color: '#32f08c' }} />
                          <span className="text-white/70 text-xs">Passed Verifications</span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs" style={{ backgroundColor: 'rgba(50,240,140,0.12)', color: '#32f08c', border: '1px solid rgba(50,240,140,0.3)' }}>
                            <CheckCircle className="h-3 w-3" /> KYC
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs" style={{ backgroundColor: 'rgba(123,184,255,0.12)', color: '#7bb8ff', border: '1px solid rgba(123,184,255,0.3)' }}>
                            <CheckCircle className="h-3 w-3" /> Skills
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs" style={{ backgroundColor: 'rgba(191,165,255,0.12)', color: '#bfa5ff', border: '1px solid rgba(191,165,255,0.3)' }}>
                            <CheckCircle className="h-3 w-3" /> Identity
                          </span>
                        </div>
                      </motion.div>

                      <motion.div whileHover={{ y: -4 }} className="group relative rounded-2xl p-6 bg-white/5 backdrop-blur-sm border border-white/10 transition-all">
                        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" style={{ boxShadow: '0 0 24px rgba(123,184,255,0.25)' }} />
                        <div className="relative flex items-center justify-between mb-4">
                          <span className="text-white/70 text-xs">Profile Trust Score</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <svg width="72" height="72" viewBox="0 0 36 36" className="-rotate-90">
                            <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
                            <circle cx="18" cy="18" r="16" fill="none" stroke="#7bb8ff" strokeWidth="2.8" strokeDasharray={100} strokeDashoffset={100 - (pinData?.trustScore ?? 0)} strokeLinecap="round" />
                          </svg>
                          <div>
                            <div className="text-3xl font-extrabold text-white">{pinData?.trustScore ?? 0}%</div>
                            <div className="text-xs text-white/50">Neon-secured</div>
                          </div>
                        </div>
                      </motion.div>

                      <motion.div whileHover={{ y: -4 }} className="group relative rounded-2xl p-6 bg-white/5 backdrop-blur-sm border border-white/10 transition-all">
                        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" style={{ boxShadow: '0 0 24px rgba(50,240,140,0.25)' }} />
                        <div className="relative flex items-center justify-between mb-3">
                          <span className="text-white/70 text-xs">Profile Completion</span>
                          <span className="text-xs" style={{ color: '#32f08c' }}>{profileCompletion}%</span>
                        </div>
                        <Progress value={profileCompletion} className="h-2 bg-white/10" />
                        <div className="text-xs text-white/50 mt-2">Complete to unlock features</div>
                      </motion.div>
                    </div>
                  </div>
                </Card>
              </div>
            ) : (
              <Card className="p-8 text-center bg-gradient-to-br from-[#7bb8ff]/10 via-[#bfa5ff]/10 to-[#7bb8ff]/10 border-2 border-[#bfa5ff]/20">
                <div className="max-w-2xl mx-auto space-y-6">
                  <div className="w-20 h-20 bg-[#bfa5ff]/10 rounded-full flex items-center justify-center mx-auto">
                    <Fingerprint className="h-12 w-12 text-[#bfa5ff]" />
                  </div>
                  <div>
                    <h2 className="text-3xl mb-3 text-white">Create Your Professional Identity Number</h2>
                    <p className="text-lg text-white/70">
                      Get a verified digital identity that employers trust globally. Your PIN proves your skills and experience.
                    </p>
                  </div>
                  
                  <div className="grid sm:grid-cols-3 gap-4 my-8">
                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <CheckCircle className="h-8 w-8 text-[#7bb8ff] mb-2 mx-auto" />
                      <h4 className="font-semibold mb-1 text-white">Verified</h4>
                      <p className="text-xs text-white/70">AI-powered verification</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <Shield className="h-8 w-8 text-[#32f08c] mb-2 mx-auto" />
                      <h4 className="font-semibold mb-1 text-white">Secure</h4>
                      <p className="text-xs text-white/70">Blockchain protected</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <Award className="h-8 w-8 text-[#bfa5ff] mb-2 mx-auto" />
                      <h4 className="font-semibold mb-1 text-white">Global</h4>
                      <p className="text-xs text-white/70">Recognized worldwide</p>
                    </div>
                  </div>

                  <Button 
                    size="lg"
                    onClick={() => setShowPINOnboarding(true)}
                    className="bg-gradient-to-r from-[#7bb8ff] to-[#bfa5ff] hover:from-[#7bb8ff]/90 hover:to-[#bfa5ff]/90 text-white px-8 py-6 text-lg"
                  >
                    <Fingerprint className="h-5 w-5 mr-2" />
                    Create My PIN — Free
                  </Button>
                  <p className="text-sm text-white/70">
                    ✨ Takes 5 minutes • Increases visibility by 10x
                  </p>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Swipe Jobs Tab */}
          <TabsContent value="swipe" className="space-y-6">
            <SwipeInterface
              type="professional"
              jobs={mockJobOpportunities}
              onMatch={(jobId) => {
                setMatchedJob(jobId);
                setShowMatchNotification(true);
                setTimeout(() => setShowMatchNotification(false), 5000);
              }}
            />

            {/* Related Search and Employer Profiles */}
            <div className="space-y-4 mt-8">
              <div className="flex items-center justify-between">
                <h3 className="text-xl">Companies Hiring Now</h3>
                <div className="relative flex-1 max-w-md ml-4">
                  <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search companies..." 
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Employer Profile Cards */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { id: '1', name: 'TechCorp Global', industry: 'Technology / SaaS', location: 'San Francisco, CA', logo: 'techcorp' },
                  { id: '2', name: 'FinanceHub Ltd', industry: 'FinTech', location: 'Lagos, Nigeria', logo: 'financehub' },
                  { id: '3', name: 'CloudNine Solutions', industry: 'Cloud Computing', location: 'Austin, TX', logo: 'cloudnine' },
                  { id: '4', name: 'DataStream Inc', industry: 'Data Analytics', location: 'London, UK', logo: 'datastream' },
                  { id: '5', name: 'WebFlow Design', industry: 'Web Development', location: 'Remote', logo: 'webflow' },
                  { id: '6', name: 'AI Innovations', industry: 'Artificial Intelligence', location: 'Berlin, Germany', logo: 'aiinnovations' }
                ].map((employer) => (
                  <Card key={employer.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleViewEmployer(employer.id)}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-12 w-12 rounded-lg">
                          <AvatarImage src={`https://api.dicebear.com/7.x/identicon/svg?seed=${employer.logo}`} />
                          <AvatarFallback className="rounded-lg">{employer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-sm truncate">{employer.name}</h4>
                            <BadgeCheck className="h-4 w-4 text-primary flex-shrink-0" />
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{employer.industry}</p>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                            <Briefcase className="h-3 w-3 mr-1" />
                            Currently Hiring
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{employer.location}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Matches Tab */}
          <TabsContent value="matches" className="space-y-6">
            <MatchesView
              type="professional"
              matches={matches}
              onMessage={(matchId) => {
                console.log('Opening message for:', matchId);
              }}
              onScheduleInterview={(matchId) => {
                console.log('Scheduling interview for:', matchId);
              }}
              onSendOffer={(matchId) => {
                console.log('Viewing offer from:', matchId);
              }}
            />
          </TabsContent>

          {/* Setup Tab - Profile Completion with LinkedIn/GitHub */}
          <TabsContent value="setup" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl mb-2">Connect Your Professional Profiles</h2>
              <p className="text-muted-foreground">
                Add your LinkedIn, GitHub, or portfolio for AI-powered verification and skill analysis. This helps employers discover your verified skills and increases your match quality.
              </p>
            </div>
            <ProfileCompletionForm
              onAnalysisComplete={handleAnalysisComplete}
              onProfileSaved={handleProfileSaved}
            />
          </TabsContent>

          {/* Verify Tab - Compliance & Documentation */}
          <TabsContent value="verify" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl mb-2">Verification & Compliance</h2>
              <p className="text-muted-foreground">
                Complete identity verification to unlock global opportunities and increase trust with employers.
              </p>
            </div>

            <ComplianceChecks
              userType="professional"
              onVerificationComplete={() => {
                console.log('Verification completed');
              }}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* AI Analysis Modal */}
      <AIAnalysisModal
        open={showAnalysisModal}
        onOpenChange={setShowAnalysisModal}
        analysis={aiAnalysis}
        isLoading={false}
      />

      {/* Profile View Modal for Viewing Employer Details */}
      <ProfileViewModal
        profile={selectedEmployer}
        userType="professional"
        open={showProfileModal}
        onClose={() => {
          setShowProfileModal(false);
          setSelectedEmployer(null);
        }}
      />
    </div>
  );
}
