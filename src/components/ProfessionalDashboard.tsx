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
  EyeOff,
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
  Mail,
  Pencil,
  Trash2,
  Check,
  X,
  Quote
} from 'lucide-react';
// Defer Recharts load until chart is visible
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import type * as RechartsTypes from 'recharts';

import { PhoneVerification } from './PhoneVerification';
import { supabase } from '../utils/supabase/client';
import { getSessionState, ensureValidSession } from '../utils/session';
import { toast } from 'sonner';
import { trackEvent } from '../utils/analytics';
import { Checkbox } from './ui/checkbox';
import { DialogFooter, DialogDescription } from './ui/dialog';

export function ProfessionalDashboard() {
  const [phonePin, setPhonePin] = useState<string | null>('Loading...');
  const [pinVisible, setPinVisible] = useState(true);  // ← ADD THIS LINE
  const [profileCompletion] = useState(85);
  const [activeTab, setActiveTab] = useState('overview');
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showEndorsementModal, setShowEndorsementModal] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  // PIN Generation State
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpRegToken, setOtpRegToken] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);

  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [endorsements, setEndorsements] = useState([]);
  const [endorsementsLoading, setEndorsementsLoading] = useState(true);
  
  // Stats state - now fetched from API
  const [stats, setStats] = useState({
    profileViews: 0,
    pinUsage: 0,
    verifications: 0,
    apiCalls: 0,
    countries: 0,
    companies: 0,
    projects: 0,
    endorsements: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Notifications state - now fetched from API
  const [notifications, setNotifications] = useState<Array<{text: string, type: string}>>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  // Chart data state - now fetched from API
  const [chartData, setChartData] = useState([
    { day: 1, actions: 0 },
    { day: 7, actions: 0 },
    { day: 14, actions: 0 },
    { day: 21, actions: 0 },
    { day: 28, actions: 0 },
    { day: 30, actions: 0 }
  ]);
  
  // Derived state for highlighting manage button
  const highlightManage = !userProfile || (userProfile as any)?.onboarding_complete !== true;

  // Project form state
  const [editingProject, setEditingProject] = useState(null);
  const [projectFormData, setProjectFormData] = useState({
    title: '',
    description: '',
    role: '',
    timeline: '',
    skills: '',
    links: ''
  });
  const [projectSaving, setProjectSaving] = useState(false);

  // Endorsement form state
  const [endorsementFormData, setEndorsementFormData] = useState({
    endorser_name: '',
    endorser_email: '',
    role: '',
    company: '',
    text: ''
  });
  const [endorsementSaving, setEndorsementSaving] = useState(false);

  // Project handlers
  const handleAddProject = () => {
    setEditingProject(null);
    setProjectFormData({
      title: '',
      description: '',
      role: '',
      timeline: '',
      skills: '',
      links: ''
    });
    setShowProjectModal(true);
  };

  const handleEditProject = (project: any) => {
    setEditingProject(project);
    setProjectFormData({
      title: project.title || '',
      description: project.description || '',
      role: project.role || '',
      timeline: project.timeline || '',
      skills: project.skills?.join(', ') || '',
      links: project.links?.join(', ') || ''
    });
    setShowProjectModal(true);
  };

  const handleSaveProject = async () => {
    if (!projectFormData.title) {
      alert('Please enter a project title');
      return;
    }

    setProjectSaving(true);
    try {
      const token = await ensureValidSession();
      if (!token) return;

      const body = {
        title: projectFormData.title,
        description: projectFormData.description,
        role: projectFormData.role,
        timeline: projectFormData.timeline,
        skills: projectFormData.skills ? projectFormData.skills.split(',').map(s => s.trim()) : [],
        links: projectFormData.links ? projectFormData.links.split(',').map(l => l.trim()) : []
      };

      const url = editingProject
        ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/server/projects/${editingProject.id}`
        : `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/server/projects`;

      const response = await fetch(url, {
        method: editingProject ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        setShowProjectModal(false);
        // Refresh projects list
        const listResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/server/projects`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (listResponse.ok) {
          const data = await listResponse.json();
          if (data.success) setProjects(data.projects);
        }
      } else {
        alert('Failed to save project');
      }
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Error saving project');
    } finally {
      setProjectSaving(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const token = await ensureValidSession();
      if (!token) return;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/server/projects/${projectId}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        // Refresh projects list
        const listResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/server/projects`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (listResponse.ok) {
          const data = await listResponse.json();
          if (data.success) setProjects(data.projects);
        }
      } else {
        alert('Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Error deleting project');
    }
  };

  // Endorsement handlers
  const handleRequestEndorsement = () => {
    setEndorsementFormData({
      endorser_name: '',
      endorser_email: '',
      role: '',
      company: '',
      text: ''
    });
    setShowEndorsementModal(true);
  };

  const handleSaveEndorsement = async () => {
    if (!endorsementFormData.endorser_name || !endorsementFormData.text || !endorsementFormData.endorser_email) {
      alert('Please enter endorser name, email, and endorsement text');
      return;
    }

    setEndorsementSaving(true);
    try {
      const token = await ensureValidSession();
      if (!token) return;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/server/endorsements/request`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(endorsementFormData)
        }
      );

      if (response.ok) {
        setShowEndorsementModal(false);
        // Refresh endorsements list
        const listResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/server/endorsements`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (listResponse.ok) {
          const data = await listResponse.json();
          if (data.success) {
            const formatted = data.endorsements.map((e: any) => ({
              id: e.id,
              endorserName: e.endorser_name,
              role: e.role,
              company: e.company,
              text: e.text,
              date: e.created_at,
              verified: e.verified,
              status: e.status
            }));
            setEndorsements(formatted);
          }
        }
      } else {
        alert('Failed to request endorsement');
      }
    } catch (error) {
      console.error('Error requesting endorsement:', error);
      alert('Error requesting endorsement');
    } finally {
      setEndorsementSaving(false);
    }
  };

  const handleRespondToEndorsement = async (endorsementId: string, status: 'accepted' | 'rejected') => {
    try {
      const token = await ensureValidSession();
      if (!token) return;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/server/endorsements/${endorsementId}/respond`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status })
        }
      );

      if (response.ok) {
        // Refresh endorsements list
        const listResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/server/endorsements`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (listResponse.ok) {
          const data = await listResponse.json();
          if (data.success) {
            const formatted = data.endorsements.map((e: any) => ({
              id: e.id,
              endorserName: e.endorser_name,
              role: e.role,
              company: e.company,
              text: e.text,
              date: e.created_at,
              verified: e.verified,
              status: e.status
            }));
            setEndorsements(formatted);
          }
        }
      } else {
        alert(`Failed to ${status === 'accepted' ? 'accept' : 'reject'} endorsement`);
      }
    } catch (error) {
      console.error('Error responding to endorsement:', error);
      alert('Error responding to endorsement');
    }
  };

  const handleDeleteEndorsement = async (endorsementId: string) => {
    if (!confirm('Are you sure you want to delete this endorsement?')) return;

    try {
      const token = await ensureValidSession();
      if (!token) return;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/server/endorsements/${endorsementId}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        // Refresh endorsements list
        const listResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/server/endorsements`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (listResponse.ok) {
          const data = await listResponse.json();
          if (data.success) {
            const formatted = data.endorsements.map((e: any) => ({
              id: e.id,
              endorserName: e.endorser_name,
              role: e.role,
              company: e.company,
              text: e.text,
              date: e.created_at,
              verified: e.verified,
              status: e.status
            }));
            setEndorsements(formatted);
          }
        }
      } else {
        alert('Failed to delete endorsement');
      }
    } catch (error) {
      console.error('Error deleting endorsement:', error);
      alert('Error deleting endorsement');
    }
  };




  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Ensure session is valid
        const token = await ensureValidSession();
        if (!token) {
          console.log('Session expired or invalid');
          return;
        }

        // Get user ID from session state
        const session = getSessionState();
        if (!session?.userId) {
          console.error('No user ID found in session');
          return;
        }

        // Fetch Profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.userId)
          .single();
        
        console.log('Profile fetch result:', { profile, profileError });
        
        if (profileError) {
          console.error('Error fetching profile:', profileError);
        } else if (profile) {
          console.log('Setting profile with data:', {
            name: profile.name,
            role: profile.role,
            email: profile.email,
            user_type: profile.user_type
          });
          setUserProfile(profile);
        } else {
          console.log('No profile data returned');
        }


        // Fetch PIN
        const { data: pinData, error: pinError } = await supabase
          .from('professional_pins')
          .select('pin_number')
          .eq('user_id', session.userId)
          .maybeSingle();

        if (pinError) {
          console.error('Error fetching PIN:', pinError);
          setPhonePin('Error loading PIN');
        } else if ((pinData as any)?.pin_number) {
          setPhonePin((pinData as any).pin_number);
        } else {
          // No PIN found - Show options to user instead of auto-generating
          setPhonePin(null); 
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    
    fetchProfile();

    // Refetch profile when window regains focus (user returns to tab)
    const handleFocus = () => {
      fetchProfile();
    };

    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = await ensureValidSession();
        if (!token) return;

        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/server/stats/dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success &&data.stats) {
            setStats(data.stats);
          }
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Fetch PIN analytics for chart
  useEffect(() => {
    const fetchPinAnalytics = async () => {
      try {
        const token = await ensureValidSession();
        if (!token) return;

        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/server/stats/pin-analytics`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.analytics?.chartData) {
            setChartData(data.analytics.chartData);
          }
        }
      } catch (error) {
        console.error('Error fetching PIN analytics:', error);
      }
    };

    fetchPinAnalytics();
  }, []);

  // Fetch activity feed
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const token = await ensureValidSession();
        if (!token) return;

        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/server/stats/activity`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.activities) {
            // Transform activities into notification format
            const formattedNotifications = data.activities.slice(0, 3).map((activity: any) => ({
              text: activity.text,
              type: activity.type
            }));
            setNotifications(formattedNotifications);
          }
        }
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setActivitiesLoading(false);
      }
    };

    fetchActivities();
  }, []);

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = await ensureValidSession();
        if (!token) return;

        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/server/projects`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.projects) {
            setProjects(data.projects);
          }
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setProjectsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Fetch endorsements
  useEffect(() => {
    const fetchEndorsements = async () => {
      try {
        const token = await ensureValidSession();
        if (!token) return;

        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/server/endorsements`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.endorsements) {
            // Transform backend format to match frontend expectations
            const formattedEndorsements = data.endorsements.map((e: any) => ({
              id: e.id,
              endorserName: e.endorser_name,
              role: e.role,
              company: e.company,
              text: e.text,
              date: e.created_at,
              verified: e.verified,
              status: e.status
            }));
            setEndorsements(formattedEndorsements);
          }
        }
      } catch (error) {
        console.error('Error fetching endorsements:', error);
      } finally {
        setEndorsementsLoading(false);
      }
    };

    fetchEndorsements();
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


  // PIN Generation Handlers
  const handleGeneratePin = (usePhone: boolean) => {
    if (usePhone) {
      setShowPhoneModal(true);
    } else {
      setShowTermsModal(true);
    }
  };

  const handlePhoneSubmit = async () => {
    if (!phoneInput) {
      toast.error('Please enter a phone number');
      return;
    }
    try {
      const token = await ensureValidSession();
      if (!token) return;

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auth-otp/request`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone: phoneInput })
      });

      if (response.ok) {
        const data = await response.json();
        setOtpRegToken(data.registration_token);
        setOtpSent(true);
        toast.success('OTP sent to your phone');
      } else {
        toast.error('Failed to send OTP');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast.error('Error sending OTP');
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpInput || !otpRegToken) {
      toast.error('Please enter OTP');
      return;
    }
    try {
      const token = await ensureValidSession();
      if (!token) return;

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auth-otp/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ registration_token: otpRegToken, otp: otpInput })
      });

      if (response.ok) {
        // OTP verified, assign phone as PIN
        const pinResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pin/issue`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ customPin: phoneInput })
        });
        if (pinResponse.ok) {
          const pinData = await pinResponse.json();
          setPhonePin(pinData.pin);
          toast.success('PIN assigned successfully');
        } else {
          toast.error('Failed to assign PIN');
        }
        setShowPhoneModal(false);
        setPhoneInput('');
        setOtpInput('');
        setOtpSent(false);
        setOtpRegToken('');
      } else {
        toast.error('Invalid OTP');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast.error('Error verifying OTP');
    }
  };

  const handleRandomPinConfirm = async () => {
    if (!termsAccepted) {
      toast.error('You must accept the terms to continue');
      return;
    }
    try {
      const token = await ensureValidSession();
      if (!token) return;

      setPinLoading(true);
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pin/issue`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setPhonePin(data.pin);
        toast.success('Random PIN generated');
        setShowTermsModal(false);
      } else {
        toast.error('Failed to generate PIN');
      }
    } catch (error) {
      console.error('Error generating random PIN:', error);
      toast.error('Error generating PIN');
    } finally {
      setPinLoading(false);
    }
  };

// Inline minimal check-circle icon for repeated usage
  const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21.801 10A10 10 0 1 1 17 3.335" />
      <path d="m9 11 3 3L22 4" />
    </svg>
  );



  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <div className="container mx-auto px-6 py-8 space-y-8">
        
        {/* Header Section - User Info Only */}
        <motion.div 
          initial={reducedMotion ? undefined : { opacity: 0, y: 20 }}
          animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6 text-sm">
            <span className="text-gray-900 text-lg font-bold tracking-tight">{userProfile?.name || 'Professional'}</span>
            <span className="text-gray-300 hidden md:inline">•</span>
            <span className="text-gray-600 font-medium">{userProfile?.role || 'Role Not Set'}</span>
            <span className="text-gray-300 hidden md:inline">•</span>
            <span className="text-gray-600">Nigeria</span>
            <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
              <CheckCircleIcon className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          </div>
        </motion.div>

        {/* CoreID PIN Display - PROMINENT */}
        <motion.div
          initial={reducedMotion ? undefined : { opacity: 0, y: 20 }}
          animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={reducedMotion ? undefined : { delay: 0.1 }}
        >
          <Card className="bg-white border border-gray-200 shadow-sm overflow-hidden relative">
            <CardContent className="p-8 relative z-10">
              <div className="grid md:grid-cols-2 gap-6 items-center">
                {/* Left: PIN Display */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                      <Fingerprint className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-gray-900 text-sm font-medium">Your CoreID PIN</h3>
                      <p className="text-gray-500 text-xs">Unique Professional Identity Number</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-4">
                    {!phonePin ? (
                      <div className="flex flex-col gap-3">
                        <p className="text-sm text-gray-600">You don't have a PIN yet. Choose how to generate it:</p>
                        <div className="flex gap-3">
                          <Button 
                            onClick={() => handleGeneratePin(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white h-12 px-6 text-base shadow-sm transition-all hover:scale-105"
                          >
                            <Phone className="h-5 w-5 mr-2" />
                            Use Phone Number
                          </Button>
                          <Button 
                            onClick={() => handleGeneratePin(false)}
                            variant="outline"
                            className="border-gray-300 hover:bg-gray-50 h-12 px-6 text-base shadow-sm transition-all hover:scale-105"
                          >
                            <Fingerprint className="h-5 w-5 mr-2" />
                            Generate Random
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        <div className="bg-gray-50 rounded-2xl px-6 py-4 border border-gray-200 min-w-[200px] flex justify-center">
                          <div className="text-gray-900 text-3xl md:text-4xl font-bold tracking-widest font-mono">
                            {pinVisible ? phonePin : '••••••'}
                          </div>
                        </div>
                        
                        <Button
                          onClick={() => setPinVisible(!pinVisible)}
                          className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 h-12 w-12 p-0 rounded-xl transition-all hover:scale-105 shadow-sm"
                          title={pinVisible ? "Hide PIN" : "Show PIN"}
                        >
                          {pinVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </Button>

                        <Button
                          onClick={() => {
                            if (phonePin && phonePin !== 'Loading...' && phonePin !== 'Generating...' && !phonePin.includes('Error') && !phonePin.includes('Failed')) {
                              navigator.clipboard.writeText(phonePin);
                              trackEvent('pin_copied', { pin: phonePin, source: 'dashboard' });
                              toast.success('PIN copied to clipboard!', {
                                description: 'Share it with employers to verify your credentials',
                                duration: 3000
                              });
                            }
                          }}
                          disabled={!phonePin || phonePin === 'Loading...' || phonePin === 'Generating...' || phonePin.includes('Error') || phonePin.includes('Failed')}
                          className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 h-12 w-12 p-0 rounded-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                          <Share2 className="h-5 w-5" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Right: PIN Info */}
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-gray-900 text-sm font-medium">Shareable Verification</p>
                          <p className="text-gray-500 text-xs">Employers can verify your credentials with this PIN</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Globe className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-gray-900 text-sm font-medium">Global Recognition</p>
                          <p className="text-gray-500 text-xs">Accepted by companies worldwide</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium h-11 rounded-xl transition-all shadow-sm"
                      onClick={() => window.open(`/pin/${phonePin}`, '_blank')}
                      disabled={!phonePin || phonePin === 'Loading...' || phonePin === 'Generating PIN...' || phonePin.includes('Error') || phonePin.includes('Failed')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Public Profile
                    </Button>
                    
                    {/* Social Sharing */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-white hover:bg-gray-50 text-gray-700 border-gray-200 h-9 text-xs"
                        onClick={() => {
                          if (phonePin && !phonePin.includes('Loading') && !phonePin.includes('Error')) {
                            const text = `Check out my CoreID Professional Profile! PIN: ${phonePin}`;
                            const url = `${window.location.origin}/pin/${phonePin}`;
                            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank', 'width=550,height=420');
                            trackEvent('pin_shared', { platform: 'twitter', pin: phonePin });
                            toast.success('Sharing on X (Twitter)');
                          }
                        }}
                        disabled={!phonePin || phonePin.includes('Loading') || phonePin.includes('Error')}
                      >
                        <svg className="h-3.5 w-3.5 mr-1.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                        Share
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-white hover:bg-gray-50 text-gray-700 border-gray-200 h-9 text-xs"
                        onClick={() => {
                          if (phonePin && !phonePin.includes('Loading') && !phonePin.includes('Error')) {
                            const url = `${window.location.origin}/pin/${phonePin}`;
                            window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank', 'width=550,height=420');
                            trackEvent('pin_shared', { platform: 'linkedin', pin: phonePin });
                            toast.success('Sharing on LinkedIn');
                          }
                        }}
                        disabled={!phonePin || phonePin.includes('Loading') || phonePin.includes('Error')}
                      >
                        <svg className="h-3.5 w-3.5 mr-1.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                        Share
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-xl">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-500 rounded-lg transition-all"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="projects" 
              className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-500 rounded-lg transition-all"
            >
              Projects
            </TabsTrigger>
            <TabsTrigger 
              value="endorsements" 
              className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-500 rounded-lg transition-all"
            >
              Endorsements
            </TabsTrigger>
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
              <Card className="bg-white border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{stats.profileViews}</div>
                  <div className="text-xs text-gray-500 mt-1 font-medium">Profile Views</div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.pinUsage}</div>
                  <div className="text-xs text-gray-500 mt-1 font-medium">PIN Usage</div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.verifications}</div>
                  <div className="text-xs text-gray-500 mt-1 font-medium">Verifications</div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{stats.apiCalls}</div>
                  <div className="text-xs text-gray-500 mt-1 font-medium">API Calls</div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.countries}</div>
                  <div className="text-xs text-gray-500 mt-1 font-medium">Countries</div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.companies}</div>
                  <div className="text-xs text-gray-500 mt-1 font-medium">Companies</div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{stats.projects}</div>
                  <div className="text-xs text-gray-500 mt-1 font-medium">Projects</div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.endorsements}</div>
                  <div className="text-xs text-gray-500 mt-1 font-medium">Endorsements</div>
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
                <Card className="bg-white border-gray-100 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <svg className="w-24 h-24 -rotate-90">
                          <circle cx="48" cy="48" r="40" stroke="rgba(0,0,0,0.05)" strokeWidth="8" fill="none" />
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
                          <span className="text-2xl font-bold text-gray-900">{profileCompletion}%</span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-gray-900">Profile Completion</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                        <CheckCircleIcon className="h-4 w-4 text-green-500" />
                            <span className="text-gray-600">Identity verification</span>
                          </div>
                          <div className="flex items-center gap-2">
                        <CheckCircleIcon className="h-4 w-4 text-green-500" />
                            <span className="text-gray-600">Document verification</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 rounded-full border-2 border-gray-200" />
                            <span className="text-gray-600">Skills & experience</span>
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
                <Card className="bg-white border-gray-100 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">PIN Activity Overview</h3>
                      <Badge className="bg-blue-50 text-blue-600 border-blue-100">30 days</Badge>
                    </div>
                    
                    <div className="h-32 mb-4">
                      {Recharts ? (
                        <Recharts.ResponsiveContainer width="100%" height="100%">
                          <Recharts.AreaChart data={chartData}>
                            <Recharts.XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                            <Recharts.YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                            <Recharts.Area 
                              type="monotone" 
                              dataKey="actions" 
                              stroke="#3b82f6" 
                              fill="url(#gradient)" 
                              strokeWidth={2}
                            />
                            <defs>
                              <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
                                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                          </Recharts.AreaChart>
                        </Recharts.ResponsiveContainer>
                      ) : (
                        <div className="h-full w-full bg-gray-100 rounded-md animate-pulse" aria-label="Loading chart" />
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-blue-600 font-semibold">42</div>
                        <div className="text-gray-500">Total PIN actions</div>
                      </div>
                      <div>
                        <div className="text-green-600 font-semibold">18</div>
                        <div className="text-gray-500">Company verifications</div>
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
              <Card className="bg-white border-gray-100 shadow-sm">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">Recent Activity</h3>
                  <div className="space-y-3">
                    {notifications.map((notification, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                        {notification.type === 'verification' && <BadgeCheck className="h-4 w-4 text-green-500" />}
                        {notification.type === 'api' && <Globe className="h-4 w-4 text-blue-500" />}
                        {notification.type === 'view' && <Eye className="h-4 w-4 text-purple-500" />}
                        <span className="text-sm text-gray-700">{notification.text}</span>
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
              <Card className="bg-white border-gray-100 shadow-sm">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">Quick Actions</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    <Button 
                      onClick={() => window.location.href = '/identity-management'}
                      variant="outline" 
                      className={`h-auto p-4 flex-col gap-2 border-gray-200 hover:bg-gray-50 text-gray-700 hover:text-gray-900 hover:shadow-md transition-all ${highlightManage ? 'ring-2 ring-green-400 shadow-md' : ''}`}
                    >
                      <Fingerprint className="h-5 w-5 text-purple-600" />
                      <span className="text-xs font-medium">Manage Identity</span>
                    </Button>
                    
                    <Button 
                      onClick={() => window.location.href = '/card'}
                      variant="outline" 
                      className="h-auto p-4 flex-col gap-2 border-gray-200 hover:bg-gray-50 text-gray-700 hover:text-gray-900 hover:shadow-md transition-all"
                    >
                      <Eye className="h-5 w-5 text-green-600" />
                      <span className="text-xs font-medium">View Public Profile</span>
                    </Button>
                    
                    <Button variant="outline" className="h-auto p-4 flex-col gap-2 border-gray-200 hover:bg-gray-50 text-gray-700 hover:text-gray-900 hover:shadow-md transition-all">
                      <Download className="h-5 w-5 text-blue-600" />
                      <span className="text-xs font-medium">Download Badge</span>
                    </Button>
                    
                    <Button variant="outline" className="h-auto p-4 flex-col gap-2 border-gray-200 hover:bg-gray-50 text-gray-700 hover:text-gray-900 hover:shadow-md transition-all">
                      <Phone className="h-5 w-5 text-purple-600" />
                      <span className="text-xs font-medium">Update Phone</span>
                    </Button>
                    
                    <Button variant="outline" className="h-auto p-4 flex-col gap-2 border-gray-200 hover:bg-gray-50 text-gray-700 hover:text-gray-900 hover:shadow-md transition-all">
                      <Share2 className="h-5 w-5 text-green-600" />
                      <span className="text-xs font-medium">Share PIN</span>
                    </Button>
                    
                    <Button variant="outline" className="h-auto p-4 flex-col gap-2 border-gray-200 hover:bg-gray-50 text-gray-700 hover:text-gray-900 hover:shadow-md transition-all">
                      <Settings className="h-5 w-5 text-blue-600" />
                      <span className="text-xs font-medium">Security Settings</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
                <p className="text-gray-500 text-sm mt-1">Showcase your professional work and contributions</p>
              </div>
              <Button onClick={handleAddProject} className="bg-black hover:bg-gray-800 text-white shadow-sm transition-all hover:scale-105">
                <Plus className="h-4 w-4 mr-2" />
                Add Project
              </Button>
            </div>

            {projects.length === 0 && !projectsLoading ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200"
              >
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">Add your professional projects to showcase your experience and skills to potential clients.</p>
                <Button onClick={handleAddProject} variant="outline">
                  Add Your First Project
                </Button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project: any, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-white border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col group">
                      <CardContent className="p-6 flex flex-col h-full">
                        <div className="flex items-start justify-between mb-4">
                          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <Briefcase className="h-5 w-5" />
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                              onClick={() => handleEditProject(project)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                              onClick={() => handleDeleteProject(project.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1" title={project.title}>{project.title}</h3>
                        <p className="text-sm font-medium text-blue-600 mb-3">{project.role}</p>
                        
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">{project.description}</p>
                        
                        <div className="space-y-4 mt-auto">
                          <div className="flex flex-wrap gap-2">
                            {(project.skills || []).slice(0, 3).map((skill: string, i: number) => (
                              <Badge key={i} variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200 font-normal">
                                {skill}
                              </Badge>
                            ))}
                            {(project.skills || []).length > 3 && (
                              <Badge variant="secondary" className="bg-gray-50 text-gray-500 font-normal">
                                +{(project.skills || []).length - 3}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{project.timeline}</span>
                            </div>
                            {project.links && project.links.length > 0 && (
                              <div className="flex items-center gap-1.5 text-blue-600">
                                <ExternalLink className="h-3.5 w-3.5" />
                                <span>View</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Endorsements Tab */}
          <TabsContent value="endorsements" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Endorsements</h2>
                <p className="text-gray-500 text-sm mt-1">Validations from your professional network</p>
              </div>
              <Button onClick={handleRequestEndorsement} className="bg-black hover:bg-gray-800 text-white shadow-sm transition-all hover:scale-105">
                <Plus className="h-4 w-4 mr-2" />
                Request Endorsement
              </Button>
            </div>

            {endorsements.length === 0 && !endorsementsLoading ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200"
              >
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No endorsements yet</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">Request endorsements from colleagues and clients to build trust and credibility.</p>
                <Button onClick={handleRequestEndorsement} variant="outline">
                  Request Your First Endorsement
                </Button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {endorsements.map((endorsement: any, index) => (
                  <motion.div
                    key={endorsement.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-white border-gray-100 shadow-sm hover:shadow-md transition-all h-full flex flex-col relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Quote className="h-16 w-16 text-gray-900 transform rotate-180" />
                      </div>
                      
                      <CardContent className="p-6 flex flex-col h-full relative z-10">
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-lg font-bold text-gray-600 border-2 border-white shadow-sm">
                              {(endorsement.endorserName || '?').charAt(0)}
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900">{endorsement.endorserName || 'Unknown'}</h3>
                              <p className="text-xs text-gray-500 font-medium">{endorsement.role}</p>
                              <p className="text-xs text-gray-400">{endorsement.company}</p>
                            </div>
                          </div>
                          {endorsement.status === 'accepted' && (
                            <Badge className="bg-green-50 text-green-600 border-green-100 hover:bg-green-100">
                              <CheckCircleIcon className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                          {endorsement.status === 'pending' && (
                            <Badge className="bg-yellow-50 text-yellow-600 border-yellow-100 hover:bg-yellow-100">
                              Pending
                            </Badge>
                          )}
                        </div>
                        
                        <div className="mb-6 flex-grow">
                          <p className="text-gray-700 italic leading-relaxed">"{endorsement.text}"</p>
                        </div>
                        
                        <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                          <span className="text-xs text-gray-400 font-medium">{new Date(endorsement.date).toLocaleDateString()}</span>
                          
                          <div className="flex gap-2">
                            {endorsement.status === 'pending' ? (
                              <>
                                <Button 
                                  size="sm" 
                                  className="bg-black hover:bg-gray-800 text-white h-8 px-3"
                                  onClick={() => handleRespondToEndorsement(endorsement.id, 'accepted')}
                                >
                                  <Check className="h-3.5 w-3.5 mr-1.5" />
                                  Accept
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="border-gray-200 text-red-600 hover:bg-red-50 h-8 px-3"
                                  onClick={() => handleRespondToEndorsement(endorsement.id, 'rejected')}
                                >
                                  <X className="h-3.5 w-3.5 mr-1.5" />
                                  Reject
                                </Button>
                              </>
                            ) : (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-gray-400 hover:text-red-600 hover:bg-red-50 h-8 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleDeleteEndorsement(endorsement.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      



      </div>

      {/* Project Modal */}
      <Dialog open={showProjectModal} onOpenChange={setShowProjectModal}>
        <DialogContent className="bg-white text-gray-900 border-gray-200 sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingProject ? 'Edit Project' : 'Add Project'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Project Title</Label>
              <Input
                id="title"
                value={projectFormData.title}
                onChange={(e) => setProjectFormData({ ...projectFormData, title: e.target.value })}
                placeholder="e.g. E-commerce Platform"
                className="bg-white border-gray-200 focus:border-black focus:ring-black"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Your Role</Label>
              <Input
                id="role"
                value={projectFormData.role}
                onChange={(e) => setProjectFormData({ ...projectFormData, role: e.target.value })}
                placeholder="e.g. Lead Developer"
                className="bg-white border-gray-200 focus:border-black focus:ring-black"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={projectFormData.description}
                onChange={(e) => setProjectFormData({ ...projectFormData, description: e.target.value })}
                placeholder="Describe the project and your contribution..."
                className="bg-white border-gray-200 focus:border-black focus:ring-black"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timeline">Timeline</Label>
                <Input
                  id="timeline"
                  value={projectFormData.timeline}
                  onChange={(e) => setProjectFormData({ ...projectFormData, timeline: e.target.value })}
                  placeholder="e.g. Jan 2023 - Present"
                  className="bg-white border-gray-200 focus:border-black focus:ring-black"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="skills">Skills (comma separated)</Label>
                <Input
                  id="skills"
                  value={projectFormData.skills}
                  onChange={(e) => setProjectFormData({ ...projectFormData, skills: e.target.value })}
                  placeholder="React, Node.js, AWS"
                  className="bg-white border-gray-200 focus:border-black focus:ring-black"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="links">Links (comma separated)</Label>
              <Input
                id="links"
                value={projectFormData.links}
                onChange={(e) => setProjectFormData({ ...projectFormData, links: e.target.value })}
                placeholder="https://github.com/..., https://demo.com"
                className="bg-white border-gray-200 focus:border-black focus:ring-black"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowProjectModal(false)} className="border-gray-200 text-gray-700 hover:bg-gray-50">
              Cancel
            </Button>
            <Button onClick={handleSaveProject} disabled={projectSaving} className="bg-black hover:bg-gray-800 text-white">
              {projectSaving ? 'Saving...' : 'Save Project'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Endorsement Modal */}
      <Dialog open={showEndorsementModal} onOpenChange={setShowEndorsementModal}>
        <DialogContent className="bg-white text-gray-900 border-gray-200 sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Request Endorsement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="endorser_name">Endorser Name</Label>
              <Input
                id="endorser_name"
                value={endorsementFormData.endorser_name}
                onChange={(e) => setEndorsementFormData({ ...endorsementFormData, endorser_name: e.target.value })}
                placeholder="e.g. John Doe"
                className="bg-white border-gray-200 focus:border-black focus:ring-black"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endorser_email">Endorser Email</Label>
              <Input
                id="endorser_email"
                type="email"
                value={endorsementFormData.endorser_email}
                onChange={(e) => setEndorsementFormData({ ...endorsementFormData, endorser_email: e.target.value })}
                placeholder="e.g. john@company.com"
                className="bg-white border-gray-200 focus:border-black focus:ring-black"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="endorser_role">Role</Label>
                <Input
                  id="endorser_role"
                  value={endorsementFormData.role}
                  onChange={(e) => setEndorsementFormData({ ...endorsementFormData, role: e.target.value })}
                  placeholder="e.g. CTO"
                  className="bg-white border-gray-200 focus:border-black focus:ring-black"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endorser_company">Company</Label>
                <Input
                  id="endorser_company"
                  value={endorsementFormData.company}
                  onChange={(e) => setEndorsementFormData({ ...endorsementFormData, company: e.target.value })}
                  placeholder="e.g. Tech Corp"
                  className="bg-white border-gray-200 focus:border-black focus:ring-black"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="endorsement_text">Endorsement Text</Label>
              <Textarea
                id="endorsement_text"
                value={endorsementFormData.text}
                onChange={(e) => setEndorsementFormData({ ...endorsementFormData, text: e.target.value })}
                placeholder="Enter the endorsement text..."
                className="bg-white border-gray-200 focus:border-black focus:ring-black"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowEndorsementModal(false)} className="border-gray-200 text-gray-700 hover:bg-gray-50">
              Cancel
            </Button>
            <Button onClick={handleSaveEndorsement} disabled={endorsementSaving} className="bg-black hover:bg-gray-800 text-white">
              {endorsementSaving ? 'Sending...' : 'Send Request'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Phone Number Modal */}
      <Dialog open={showPhoneModal} onOpenChange={setShowPhoneModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Use Phone Number as PIN</DialogTitle>
            <DialogDescription>Enter your phone number to receive an OTP.</DialogDescription>
          </DialogHeader>
          {!otpSent ? (
            <div className="space-y-4 mt-4">
              <Input placeholder="+1234567890" value={phoneInput} onChange={(e) => setPhoneInput(e.target.value)} />
              <Button onClick={handlePhoneSubmit}>Send OTP</Button>
            </div>
          ) : (
            <div className="space-y-4 mt-4">
              <Input placeholder="Enter OTP" value={otpInput} onChange={(e) => setOtpInput(e.target.value)} />
              <Button onClick={handleVerifyOtp}>Verify OTP</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Terms & Conditions Modal for Random PIN */}
      <Dialog open={showTermsModal} onOpenChange={setShowTermsModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Random PIN</DialogTitle>
            <DialogDescription>
              Please review and accept the terms and conditions before generating a random PIN. The PIN will be created automatically and assigned to your account.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-2">
            <p className="text-sm text-gray-600">• The PIN is a one‑time code valid for 1 minute.</p>
            <p className="text-sm text-gray-600">• You must keep the PIN confidential.</p>
            <p className="text-sm text-gray-600">• The PIN will be used for authentication purposes only.</p>
            <div className="flex items-center space-x-2 mt-2">
              <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(checked) => setTermsAccepted(checked as boolean)} />
              <label htmlFor="terms" className="text-sm font-medium text-gray-700">I accept the terms and conditions</label>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowTermsModal(false)}>Cancel</Button>
            <Button onClick={handleRandomPinConfirm} disabled={!termsAccepted || pinLoading}>{pinLoading ? 'Generating...' : 'Confirm'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
