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
import { mockJobOpportunities } from './mockSwipeData';
import { toast } from 'sonner@2.0.3';
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
  Share2
} from 'lucide-react';
import { Sun, Moon } from 'lucide-react';

export function ProfessionalDashboard() {
  const [profileCompletion, setProfileCompletion] = useState(35); // Start at 35% after basic info
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
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [activeSection, setActiveSection] = useState<'summary' | 'portfolio' | 'endorsements' | 'opportunities' | 'activity' | 'settings'>('summary');
  const [isInitialLoading, setIsInitialLoading] = useState(true);

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

  // Mock user data
  const userProfile = {
    name: "Adebayo Olatunji",
    title: "Senior Frontend Developer",
    location: "Lagos, Nigeria",
    email: "adebayo.olatunji@email.com",
    hourlyRate: 45,
    availability: "Available",
    complianceScore: 0
  };

  // Load analysis on mount
  useEffect(() => {
    const loadAnalysis = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const accessToken = localStorage.getItem('accessToken');
        
        if (userId && accessToken) {
          const result = await api.getProfileAnalysis(userId, accessToken);
          if (result.success && result.analysis) {
            setAiAnalysis(result.analysis);
          }
        }
      } catch (error) {
        console.log('No analysis found');
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadAnalysis();
  }, []);

  // Initialize and persist theme, apply global dark class
  useEffect(() => {
    try {
      const saved = localStorage.getItem('theme');
      const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)');
      const initial = (saved === 'light' || saved === 'dark')
        ? saved
        : (prefersDark && prefersDark.matches ? 'dark' : 'light');
      setTheme(initial as 'dark' | 'light');
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('theme', theme);
    } catch {}
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  }, [theme]);

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
  };

  const handlePINCreated = (newPinData: any) => {
    setPinData(newPinData);
    setShowPINOnboarding(false);
    toast.success('🎉 Your PIN has been created! You can now share your verified identity.');
  };

  return (
    <div className={theme === 'dark' ? 'min-h-screen bg-[#0a0b0d] text-white' : 'min-h-screen bg-white text-slate-900'}>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Mobile Header: title, theme toggle, and scroll chips */}
        <div className={theme === 'dark' ? 'lg:hidden sticky top-0 z-20 -mx-4 px-4 py-3 backdrop-blur bg-black/30 border-b border-white/10' : 'lg:hidden sticky top-0 z-20 -mx-4 px-4 py-3 backdrop-blur bg-white/70 border-b border-slate-200'}>
          <div className="flex items-center justify-between">
            <span className={theme === 'dark' ? 'text-sm text-white/70' : 'text-sm text-slate-700'}>Dashboard</span>
            <Button
              variant="outline"
              size="sm"
              className={theme === 'dark' ? 'border-white/20 text-white hover:bg-white/10' : 'border-slate-300 text-slate-900 hover:bg-slate-50'}
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 mr-1" /> : <Moon className="h-4 w-4 mr-1" />}
              {theme === 'dark' ? 'Light' : 'Dark'}
            </Button>
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar" role="navigation" aria-label="Dashboard sections">
            <Button onClick={() => scrollTo(welcomeRef)} aria-controls="section-summary" aria-current={activeSection === 'summary' ? 'page' : undefined} variant="secondary" size="sm" className={activeSection === 'summary' ? (theme === 'dark' ? 'bg-[#bfa5ff]/20 border-[#bfa5ff]/40 text-[#bfa5ff]' : 'bg-slate-200 border-slate-300 text-slate-900') : (theme === 'dark' ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' : 'bg-slate-100 border-slate-300 text-slate-900 hover:bg-slate-200')}>
              Summary
            </Button>
            <Button onClick={() => scrollTo(portfolioRef)} aria-controls="section-portfolio" aria-current={activeSection === 'portfolio' ? 'page' : undefined} variant="secondary" size="sm" className={activeSection === 'portfolio' ? (theme === 'dark' ? 'bg-[#7bb8ff]/20 border-[#7bb8ff]/40 text-[#7bb8ff]' : 'bg-slate-200 border-slate-300 text-slate-900') : (theme === 'dark' ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' : 'bg-slate-100 border-slate-300 text-slate-900 hover:bg-slate-200')}>
              Portfolio
            </Button>
            <Button onClick={() => scrollTo(endorsementsRef)} aria-controls="section-endorsements" aria-current={activeSection === 'endorsements' ? 'page' : undefined} variant="secondary" size="sm" className={activeSection === 'endorsements' ? (theme === 'dark' ? 'bg-[#32f08c]/20 border-[#32f08c]/40 text-[#32f08c]' : 'bg-slate-200 border-slate-300 text-slate-900') : (theme === 'dark' ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' : 'bg-slate-100 border-slate-300 text-slate-900 hover:bg-slate-200')}>
              Endorsements
            </Button>
            <Button onClick={() => scrollTo(opportunitiesRef)} aria-controls="section-opportunities" aria-current={activeSection === 'opportunities' ? 'page' : undefined} variant="secondary" size="sm" className={activeSection === 'opportunities' ? (theme === 'dark' ? 'bg-[#bfa5ff]/20 border-[#bfa5ff]/40 text-[#bfa5ff]' : 'bg-slate-200 border-slate-300 text-slate-900') : (theme === 'dark' ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' : 'bg-slate-100 border-slate-300 text-slate-900 hover:bg-slate-200')}>
              Opportunities
            </Button>
            <Button onClick={() => scrollTo(activityRef)} aria-controls="section-activity" aria-current={activeSection === 'activity' ? 'page' : undefined} variant="secondary" size="sm" className={activeSection === 'activity' ? (theme === 'dark' ? 'bg-[#7bb8ff]/20 border-[#7bb8ff]/40 text-[#7bb8ff]' : 'bg-slate-200 border-slate-300 text-slate-900') : (theme === 'dark' ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' : 'bg-slate-100 border-slate-300 text-slate-900 hover:bg-slate-200')}>
              Activity
            </Button>
            <Button onClick={() => scrollTo(settingsRef)} aria-controls="section-settings" aria-current={activeSection === 'settings' ? 'page' : undefined} variant="secondary" size="sm" className={activeSection === 'settings' ? (theme === 'dark' ? 'bg-[#32f08c]/20 border-[#32f08c]/40 text-[#32f08c]' : 'bg-slate-200 border-slate-300 text-slate-900') : (theme === 'dark' ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' : 'bg-slate-100 border-slate-300 text-slate-900 hover:bg-slate-200')}>
              Settings
            </Button>
          </div>
        </div>
        {/* Split-view Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_320px] gap-6">
          {/* Left Sidebar */}
          <aside className="hidden lg:flex flex-col gap-2">
            <Card className={theme === 'dark' ? 'bg-black/40 border-[#bfa5ff]/30' : 'bg-white border-slate-200'}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm opacity-70">Navigation</span>
                  <Button 
                    variant="outline"
                    size="sm"
                    className={theme === 'dark' ? 'border-white/20 text-white hover:bg-white/10' : 'border-slate-300 text-slate-900 hover:bg-slate-50'}
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  >
                    {theme === 'dark' ? <Sun className="h-4 w-4 mr-1" /> : <Moon className="h-4 w-4 mr-1" />}
                    {theme === 'dark' ? 'Light' : 'Dark'}
                  </Button>
                </div>
                <div className="space-y-2">
                  <Button onClick={() => scrollTo(welcomeRef)} variant="ghost" className={activeSection === 'summary' ? (theme === 'dark' ? 'w-full justify-start text-[#bfa5ff] bg-[#bfa5ff]/15 ring-1 ring-[#bfa5ff]/40' : 'w-full justify-start text-slate-900 bg-slate-100 ring-1 ring-slate-300') : (theme === 'dark' ? 'w-full justify-start text-white hover:text-[#bfa5ff] hover:bg-[#bfa5ff]/10' : 'w-full justify-start text-slate-900 hover:bg-slate-50')}>
                    <Fingerprint className="h-4 w-4 mr-2 text-[#bfa5ff]" /> Dashboard Summary
                  </Button>
                  <Button onClick={() => scrollTo(portfolioRef)} variant="ghost" className={activeSection === 'portfolio' ? (theme === 'dark' ? 'w-full justify-start text-[#7bb8ff] bg-[#7bb8ff]/15 ring-1 ring-[#7bb8ff]/40' : 'w-full justify-start text-slate-900 bg-slate-100 ring-1 ring-slate-300') : (theme === 'dark' ? 'w-full justify-start text-white hover:text-[#bfa5ff] hover:bg-[#bfa5ff]/10' : 'w-full justify-start text-slate-900 hover:bg-slate-50')}>
                    <Briefcase className="h-4 w-4 mr-2 text-[#7bb8ff]" /> Portfolio
                  </Button>
                  <Button onClick={() => scrollTo(endorsementsRef)} variant="ghost" className={activeSection === 'endorsements' ? (theme === 'dark' ? 'w-full justify-start text-[#32f08c] bg-[#32f08c]/15 ring-1 ring-[#32f08c]/40' : 'w-full justify-start text-slate-900 bg-slate-100 ring-1 ring-slate-300') : (theme === 'dark' ? 'w-full justify-start text-white hover:text-[#bfa5ff] hover:bg-[#bfa5ff]/10' : 'w-full justify-start text-slate-900 hover:bg-slate-50')}>
                    <BadgeCheck className="h-4 w-4 mr-2 text-[#32f08c]" /> Endorsements
                  </Button>
                  <Button onClick={() => scrollTo(opportunitiesRef)} variant="ghost" className={activeSection === 'opportunities' ? (theme === 'dark' ? 'w-full justify-start text-[#bfa5ff] bg-[#bfa5ff]/15 ring-1 ring-[#bfa5ff]/40' : 'w-full justify-start text-slate-900 bg-slate-100 ring-1 ring-slate-300') : (theme === 'dark' ? 'w-full justify-start text-white hover:text-[#bfa5ff] hover:bg-[#bfa5ff]/10' : 'w-full justify-start text-slate-900 hover:bg-slate-50')}>
                    <Target className="h-4 w-4 mr-2 text-[#bfa5ff]" /> Opportunities
                  </Button>
                  <Button onClick={() => scrollTo(activityRef)} variant="ghost" className={activeSection === 'activity' ? (theme === 'dark' ? 'w-full justify-start text-[#7bb8ff] bg-[#7bb8ff]/15 ring-1 ring-[#7bb8ff]/40' : 'w-full justify-start text-slate-900 bg-slate-100 ring-1 ring-slate-300') : (theme === 'dark' ? 'w-full justify-start text-white hover:text-[#bfa5ff] hover:bg-[#bfa5ff]/10' : 'w-full justify-start text-slate-900 hover:bg-slate-50')}>
                    <Clock className="h-4 w-4 mr-2 text-[#7bb8ff]" /> Activity
                  </Button>
                  <Button onClick={() => scrollTo(settingsRef)} variant="ghost" className={activeSection === 'settings' ? (theme === 'dark' ? 'w-full justify-start text-[#32f08c] bg-[#32f08c]/15 ring-1 ring-[#32f08c]/40' : 'w-full justify-start text-slate-900 bg-slate-100 ring-1 ring-slate-300') : (theme === 'dark' ? 'w-full justify-start text-white hover:text-[#bfa5ff] hover:bg-[#bfa5ff]/10' : 'w-full justify-start text-slate-900 hover:bg-slate-50')}>
                    <Shield className="h-4 w-4 mr-2 text-[#32f08c]" /> Settings & Security
                  </Button>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="space-y-6">
            {/* Welcome + PIN Overview */}
            <motion.div ref={welcomeRef} id="section-summary" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className={theme === 'dark' ? 'bg-black/40 border-[#bfa5ff]/30' : 'bg-white border-slate-200'}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-2xl font-bold">Welcome back, {userProfile.name.split(' ')[0]}! 👋</h1>
                        <Badge variant="outline" className="border-[#32f08c]/40 text-[#32f08c] bg-[#32f08c]/10">Active</Badge>
                      </div>
                      <p className={theme === 'dark' ? 'text-sm text-white/70 mb-3' : 'text-sm text-slate-700 mb-3'}>{userProfile.title}</p>
                      <div className="space-y-2 max-w-md">
                        <div className="flex items-center justify-between text-xs">
                          <span className={theme === 'dark' ? 'text-white/70' : 'text-slate-700'}>Trust & Completion</span>
                          <span className="text-[#32f08c]">{profileCompletion}%</span>
                        </div>
                        <Progress value={profileCompletion} className="h-2 bg-white/10" />
                        <p className={theme === 'dark' ? 'text-xs text-white/50' : 'text-xs text-slate-500'}>Your PIN unlocks opportunities. Keep it active!</p>
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
                      <div className={theme === 'dark' ? 'p-4 rounded-lg bg-[#7bb8ff]/10 border border-[#7bb8ff]/30' : 'p-4 rounded-lg bg-blue-50 border border-blue-200'}>
                        <div className="flex items-center gap-2">
                          <Fingerprint className="h-5 w-5 text-[#7bb8ff]" />
                          <span className={theme === 'dark' ? 'text-sm text-white/80' : 'text-sm text-slate-800'}>No active PIN yet. Create one to boost trust.</span>
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
              <Card className={theme === 'dark' ? 'bg-black/40 border-[#bfa5ff]/30' : 'bg-white border-slate-200'}>
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
            <Card className={theme === 'dark' ? 'bg-black/40 border-[#bfa5ff]/30' : 'bg-white border-slate-200'}>
              <CardHeader>
                <CardTitle>Portfolio Showcase</CardTitle>
                <CardDescription className={theme === 'dark' ? 'text-white/60' : 'text-slate-600'}>Recent work and case studies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {isInitialLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className={theme === 'dark' ? 'rounded-lg overflow-hidden border border-white/10 bg-white/5' : 'rounded-lg overflow-hidden border border-slate-200 bg-slate-50'}>
                        <Skeleton className="h-28 w-full" />
                        <div className="p-3 space-y-2">
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-3 w-3/4" />
                        </div>
                      </div>
                    ))
                  ) : (
                    [1,2,3,4].map((i) => (
                      <motion.div key={i} whileHover={reducedMotion ? undefined : { scale: 1.02 }} className={theme === 'dark' ? 'rounded-lg overflow-hidden border border-white/10 bg-white/5' : 'rounded-lg overflow-hidden border border-slate-200 bg-slate-50'}>
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
                          <p className={theme === 'dark' ? 'text-xs text-white/60 mt-1' : 'text-xs text-slate-600 mt-1'}>Accessible image placeholder with alt text</p>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Endorsements & Recommendations */}
            <div ref={endorsementsRef} id="section-endorsements">
            <Card className={theme === 'dark' ? 'bg-black/40 border-[#bfa5ff]/30' : 'bg-white border-slate-200'}>
              <CardHeader>
                <CardTitle>Endorsements</CardTitle>
                <CardDescription className={theme === 'dark' ? 'text-white/60' : 'text-slate-600'}>What peers and employers say</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 overflow-x-auto no-scrollbar">
                  {["Exceptional UI work","Reliable and fast","Great communicator","High-quality code"].map((text, idx) => (
                    <motion.div key={idx} whileHover={{ y: -2 }} className={theme === 'dark' ? 'min-w-[220px] p-4 rounded-lg bg-white/5 border border-white/10' : 'min-w-[220px] p-4 rounded-lg bg-slate-50 border border-slate-200'}>
                      <div className="flex items-center gap-2 mb-2">
                        <BadgeCheck className="h-4 w-4 text-[#32f08c]" />
                        <span className="text-sm">Verified</span>
                      </div>
                      <p className={theme === 'dark' ? 'text-sm text-white/80' : 'text-sm text-slate-800'}>{text}</p>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-4">
                  <Button variant="outline" className={theme === 'dark' ? 'border-white/20 text-white hover:bg-white/10' : 'border-slate-300 text-slate-900 hover:bg-slate-50'}>Endorse More</Button>
                </div>
              </CardContent>
            </Card>
            </div>

            {/* Opportunities & Recommendations */}
            <div ref={opportunitiesRef} id="section-opportunities">
            <Card className={theme === 'dark' ? 'bg-black/40 border-[#bfa5ff]/30' : 'bg-white border-slate-200'}>
              <CardHeader>
                <CardTitle>Opportunities for You</CardTitle>
                <CardDescription className={theme === 'dark' ? 'text-white/60' : 'text-slate-600'}>Smart suggestions based on your profile</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {isInitialLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className={theme === 'dark' ? 'p-4 rounded-lg bg-white/5 border border-white/10' : 'p-4 rounded-lg bg-slate-50 border border-slate-200'}>
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
                      <motion.div key={job.id} whileHover={reducedMotion ? undefined : { scale: 1.02 }} className={theme === 'dark' ? 'p-4 rounded-lg bg-white/5 border border-white/10 cursor-pointer' : 'p-4 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer'}>
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">{job.title}</h4>
                            <p className={theme === 'dark' ? 'text-xs text-white/60' : 'text-xs text-slate-600'}>{job.company} • {job.location}</p>
                          </div>
                          <Badge className="bg-[#32f08c]/20 text-[#32f08c] border-[#32f08c]/30">{job.matchScore}%</Badge>
                        </div>
                        <p className={theme === 'dark' ? 'text-sm text-white/70 mt-2 line-clamp-2' : 'text-sm text-slate-700 mt-2 line-clamp-2'}>{job.description}</p>
                      </motion.div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
            </div>

            {/* Activity Feed */}
            <div ref={activityRef} id="section-activity">
            <Card className={theme === 'dark' ? 'bg-black/40 border-[#bfa5ff]/30' : 'bg-white border-slate-200'}>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[{t:'Portfolio item added', v:true},{t:'Endorsed by TechCorp', v:true},{t:'Viewed by FinanceHub', v:false}].map((item, i) => (
                     <div key={i} className="flex items-center gap-3 text-sm">
                       {item.v ? <BadgeCheck className="h-4 w-4 text-[#32f08c]" /> : <Eye className="h-4 w-4 text-[#7bb8ff]" />}
                      <span className={theme === 'dark' ? 'text-white/80' : 'text-slate-800'}>{item.t}</span>
                       {item.v && <Badge variant="outline" className="ml-auto border-[#32f08c]/40 text-[#32f08c]">PIN verified</Badge>}
                     </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            </div>

            {/* Settings & Security */}
            <div ref={settingsRef} id="section-settings">
            <Card className={theme === 'dark' ? 'bg-black/40 border-[#bfa5ff]/30' : 'bg-white border-slate-200'}>
              <CardHeader>
                <CardTitle>Settings & Security</CardTitle>
                <CardDescription className={theme === 'dark' ? 'text-white/60' : 'text-slate-600'}>Manage your PIN and account</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" className={theme === 'dark' ? 'border-white/20 text-white hover:bg-white/10' : 'border-slate-300 text-slate-900 hover:bg-slate-50'}>
                    <Shield className="h-4 w-4 mr-2" /> PIN Security Settings
                  </Button>
                  <Button variant="outline" className={theme === 'dark' ? 'border-white/20 text-white hover:bg-white/10' : 'border-slate-300 text-slate-900 hover:bg-slate-50'}>
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

          {/* Right Sidebar */}
          <aside className="hidden lg:block">
            <Card className={theme === 'dark' ? 'bg-black/40 border-[#bfa5ff]/30' : 'bg-white border-slate-200'}>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-3">Insights</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className={theme === 'dark' ? 'p-3 rounded-lg bg-white/5 border border-white/10 text-center' : 'p-3 rounded-lg bg-slate-50 border border-slate-200 text-center'}>
                    <div className="text-2xl text-[#32f08c]">{pinData?.trustScore ?? 72}%</div>
                    <div className={theme === 'dark' ? 'text-xs text-white/60' : 'text-xs text-slate-600'}>Trust Score</div>
                  </div>
                  <div className={theme === 'dark' ? 'p-3 rounded-lg bg-white/5 border border-white/10 text-center' : 'p-3 rounded-lg bg-slate-50 border border-slate-200 text-center'}>
                    <div className="text-2xl">124</div>
                    <div className={theme === 'dark' ? 'text-xs text-white/60' : 'text-xs text-slate-600'}>Views</div>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Target className="h-4 w-4 text-[#bfa5ff]" /> Improve match score by adding a new skill
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Share2 className="h-4 w-4 text-[#7bb8ff]" /> Share PIN to increase visibility
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>
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

        {/* Main Tabs (existing functionality retained) */}
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 bg-white/10 border border-white/10 text-white">
            <TabsTrigger value="dashboard" className="gap-2">
              <Fingerprint className="h-4 w-4" />
              <span className="hidden sm:inline">My PIN</span>
              {!pinData && <Badge variant="secondary" className="ml-auto hidden lg:inline-flex bg-yellow-100 text-yellow-800">New</Badge>}
            </TabsTrigger>
            <TabsTrigger value="swipe" className="gap-2">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Swipe Jobs</span>
              <Badge variant="secondary" className="ml-auto hidden lg:inline-flex">15</Badge>
            </TabsTrigger>
            <TabsTrigger value="matches" className="gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Matches</span>
              <Badge variant="secondary" className="ml-auto hidden lg:inline-flex">3</Badge>
            </TabsTrigger>
            <TabsTrigger value="setup" className="gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Setup</span>
            </TabsTrigger>
            <TabsTrigger value="verify" className="gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Verify</span>
            </TabsTrigger>
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
                <Card className="p-6 bg-gradient-to-br from-blue-50 via-purple-50 to-blue-50 border-2 border-primary/20">
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Fingerprint className="h-6 w-6 text-primary" />
                      <h2 className="text-2xl">Your Professional Identity</h2>
                    </div>
                    <p className="text-muted-foreground">
                      Your PIN is verified and active. Share it with employers worldwide.
                    </p>
                  </div>
                  
                  <PINIdentityCard data={pinData} variant="full" showActions={true} />
                </Card>

                {/* PIN Actions */}
                <div className="grid sm:grid-cols-3 gap-4">
                  <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-blue-200">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Share2 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Share Your PIN</h4>
                        <p className="text-sm text-muted-foreground">Copy link to share with employers</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-emerald-200">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <BadgeCheck className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Verify More Skills</h4>
                        <p className="text-sm text-muted-foreground">Add experiences to increase trust score</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-purple-200">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Eye className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">PIN Analytics</h4>
                        <p className="text-sm text-muted-foreground">See who viewed your PIN</p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* PIN Stats */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">PIN Performance</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl text-blue-600">247</div>
                      <div className="text-sm text-muted-foreground">PIN Views</div>
                    </div>
                    <div className="text-center p-4 bg-emerald-50 rounded-lg">
                      <div className="text-2xl text-emerald-600">{pinData.trustScore}%</div>
                      <div className="text-sm text-muted-foreground">Trust Score</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl text-purple-600">{pinData.endorsements}</div>
                      <div className="text-sm text-muted-foreground">Endorsements</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl text-orange-600">12</div>
                      <div className="text-sm text-muted-foreground">Employer Contacts</div>
                    </div>
                  </div>
                </Card>
              </div>
            ) : (
              <Card className="p-8 text-center bg-gradient-to-br from-blue-50 via-purple-50 to-blue-50 border-2 border-primary/20">
                <div className="max-w-2xl mx-auto space-y-6">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Fingerprint className="h-12 w-12 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-3xl mb-3">Create Your Professional Identity Number</h2>
                    <p className="text-lg text-muted-foreground">
                      Get a verified digital identity that employers trust globally. Your PIN proves your skills and experience.
                    </p>
                  </div>
                  
                  <div className="grid sm:grid-cols-3 gap-4 my-8">
                    <div className="p-4 bg-white rounded-lg border">
                      <CheckCircle className="h-8 w-8 text-blue-600 mb-2 mx-auto" />
                      <h4 className="font-semibold mb-1">Verified</h4>
                      <p className="text-xs text-muted-foreground">AI-powered verification</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg border">
                      <Shield className="h-8 w-8 text-emerald-600 mb-2 mx-auto" />
                      <h4 className="font-semibold mb-1">Secure</h4>
                      <p className="text-xs text-muted-foreground">Blockchain protected</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg border">
                      <Award className="h-8 w-8 text-purple-600 mb-2 mx-auto" />
                      <h4 className="font-semibold mb-1">Global</h4>
                      <p className="text-xs text-muted-foreground">Recognized worldwide</p>
                    </div>
                  </div>

                  <Button 
                    size="lg"
                    onClick={() => setShowPINOnboarding(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg"
                  >
                    <Fingerprint className="h-5 w-5 mr-2" />
                    Create My PIN — Free
                  </Button>
                  <p className="text-sm text-muted-foreground">
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
