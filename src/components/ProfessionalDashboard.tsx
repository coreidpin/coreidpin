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
  Search,
  Fingerprint,
  BadgeCheck,
  TrendingUp,
  TrendingDown,
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
  Quote,
  Activity,
  Loader2
} from 'lucide-react';

import { supabase } from '../utils/supabase/client';
import { HeroProfileCard } from './dashboard/HeroProfileCard';
import { PINGenerationCard } from './dashboard/PINGenerationCard';
import { ProfileCompletionWidget } from './dashboard/ProfileCompletionWidget';
import { ActivityChart } from './dashboard/ActivityChart';
import { ActivityFeed } from './dashboard/ActivityFeed';
import { getSessionState, ensureValidSession } from '../utils/session';
import { toast } from 'sonner';
import { trackEvent } from '../utils/analytics';
import { Checkbox } from './ui/checkbox';
import { DialogFooter, DialogDescription } from './ui/dialog';

export function ProfessionalDashboard() {
  const [phonePin, setPhonePin] = useState<string | null>('Loading...');
  const [pinVisible, setPinVisible] = useState(true);  // ← ADD THIS LINE
  const [copiedPin, setCopiedPin] = useState(false);
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
  const [projectFormErrors, setProjectFormErrors] = useState<Record<string, string>>({});
  const [endorsementFormErrors, setEndorsementFormErrors] = useState<Record<string, string>>({});
  const [projectSearch, setProjectSearch] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('all');
  const [projectSort, setProjectSort] = useState('date-desc');
  const [endorsementFilter, setEndorsementFilter] = useState('all');
  const [projectFormDirty, setProjectFormDirty] = useState(false);
  const [endorsementFormDirty, setEndorsementFormDirty] = useState(false);
  
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
  const [statsTrends] = useState({
    profileViews: { change: 12, direction: 'up' as const },
    pinUsage: { change: 8, direction: 'up' as const },
    verifications: { change: 5, direction: 'up' as const },
    apiCalls: { change: -3, direction: 'down' as const },
    countries: { change: 15, direction: 'up' as const },
    companies: { change: 10, direction: 'up' as const },
    projects: { change: 0, direction: 'up' as const },
    endorsements: { change: 20, direction: 'up' as const }
  });

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

  const validateProjectForm = () => {
    const errors: Record<string, string> = {};
    
    if (!projectFormData.title || projectFormData.title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters';
    }
    
    if (!projectFormData.description || projectFormData.description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters';
    }
    
    setProjectFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProject = async () => {
    if (!validateProjectForm()) {
      toast.error('Please fix form errors');
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

  const validateEndorsementForm = () => {
    const errors: Record<string, string> = {};
    
    if (!endorsementFormData.endorser_name || endorsementFormData.endorser_name.trim().length < 2) {
      errors.endorser_name = 'Name must be at least 2 characters';
    }
    
    if (!endorsementFormData.endorser_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(endorsementFormData.endorser_email)) {
      errors.endorser_email = 'Please enter a valid email address';
    }
    
    if (!endorsementFormData.text || endorsementFormData.text.trim().length < 20) {
      errors.text = 'Endorsement text must be at least 20 characters';
    }
    
    setEndorsementFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveEndorsement = async () => {
    if (!validateEndorsementForm()) {
      toast.error('Please fix form errors');
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
        
        // Check email verification status from Auth
        const { data: { user } } = await supabase.auth.getUser();
        const isVerified = !!user?.email_confirmed_at;
        
        // Self-healing: If user is logged in but not verified, force verify
        if (user && !isVerified) {
          console.log('User logged in but not verified. Attempting self-healing...');
          try {
            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/server/pin/verify-email`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (response.ok) {
              console.log('Self-healing successful: Email verified');
              // Refresh user to get updated status
              await supabase.auth.refreshSession();
            }
          } catch (err) {
            console.error('Self-healing failed:', err);
          }
        }

        console.log('Profile fetch result:', { profile, profileError, isVerified });
        
        if (profileError) {
          console.error('Error fetching profile:', profileError);
        } else if (profile) {
          setUserProfile({
            ...profile,
            email_verified: isVerified || profile.email_verified // Fallback to profile if available
          });
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

  // Utility function for relative time
  const getRelativeTime = (dateString: string) => {
    const now = new Date();
    const then = new Date(dateString);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return then.toLocaleDateString();
  };

  // Stat card tooltip descriptions
  const statTooltips: Record<string, string> = {
    profileViews: 'Number of times your professional profile has been viewed',
    pinUsage: 'Total times your PIN has been used for verification',
    verifications: 'Number of successful identity verifications',
    apiCalls: 'Total API requests made to your professional data',
    countries: 'Number of different countries accessing your profile',
    companies: 'Number of unique companies that have viewed your profile',
    projects: 'Total projects added to your portfolio',
    endorsements: 'Number of professional endorsements received'
  };

  // Skeleton Components
  const StatCardSkeleton = () => (
    <Card className="bg-white border-gray-100 shadow-sm">
      <CardContent className="p-4 text-center">
        <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mx-auto mb-2"></div>
        <div className="h-4 w-20 bg-gray-200 animate-pulse rounded mx-auto"></div>
      </CardContent>
    </Card>
  );

  const ActivityItemSkeleton = () => (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
      <div className="h-4 w-4 bg-gray-200 animate-pulse rounded"></div>
      <div className="h-4 flex-1 bg-gray-200 animate-pulse rounded"></div>
    </div>
  );

  const ProjectCardSkeleton = () => (
    <Card className="bg-white border-gray-100 shadow-sm h-full">
      <CardContent className="p-6">
        <div className="h-10 w-10 bg-gray-200 animate-pulse rounded-lg mb-4"></div>
        <div className="h-6 w-3/4 bg-gray-200 animate-pulse rounded mb-2"></div>
        <div className="h-4 w-full bg-gray-200 animate-pulse rounded mb-4"></div>
        <div className="h-4 w-2/3 bg-gray-200 animate-pulse rounded"></div>
      </CardContent>
    </Card>
  );



  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header Profile Card */}
        <motion.div
          initial={reducedMotion ? undefined : { opacity: 0, y: 20 }}
          animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
        >
          <HeroProfileCard 
            userProfile={userProfile}
            profileCompletion={profileCompletion}
            onEditProfile={() => window.location.href = '/identity-management'}
            onShareProfile={() => {
              navigator.clipboard.writeText(`https://coreid.com/p/${phonePin}`);
              toast.success('Profile link copied!');
            }}
          />
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* PIN Generation/Display Card */}
            <motion.div
              initial={reducedMotion ? undefined : { opacity: 0, y: 20 }}
              animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
              transition={reducedMotion ? undefined : { delay: 0.1 }}
            >
              <PINGenerationCard 
                currentPin={phonePin}
                onGenerate={handleGeneratePin}
                onCopy={(pin) => {
                  navigator.clipboard.writeText(pin);
                  toast.success('PIN copied to clipboard');
                }}
                onShare={(pin) => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'My Professional PIN',
                      text: `Connect with me using my CoreID PIN: ${pin}`,
                      url: window.location.href
                    });
                  } else {
                    navigator.clipboard.writeText(pin);
                    toast.success('PIN copied to clipboard');
                  }
                }}
                onToggleVisibility={() => {}}
              />
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
              <div className="flex items-center gap-2">
                Endorsements
                {endorsements.filter(e => e.status === 'pending').length > 0 && (
                  <Badge className="bg-red-500 text-white h-5 w-5 p-0 flex items-center justify-center text-xs rounded-full">
                    {endorsements.filter(e => e.status === 'pending').length}
                  </Badge>
                )}
              </div>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <motion.div initial={reducedMotion ? undefined : { opacity: 0, y: 20 }} animate={reducedMotion ? undefined : { opacity: 1, y: 0 }} transition={reducedMotion ? undefined : { delay: 0.1 }}>
              <ActivityChart data={chartData.map(d => ({ date: `Day ${d.day}`, value: d.actions, label: `${d.actions} Actions` }))} period="30d" onPeriodChange={() => {}} />
            </motion.div>
            <div className="grid lg:grid-cols-2 gap-8">
              <motion.div initial={reducedMotion ? undefined : { opacity: 0, x: -20 }} animate={reducedMotion ? undefined : { opacity: 1, x: 0 }} transition={reducedMotion ? undefined : { delay: 0.2 }}>
                <ProfileCompletionWidget completionPercentage={profileCompletion} tasks={[{ id: '1', label: 'Identity verification', isCompleted: true }, { id: '2', label: 'Document verification', isCompleted: true }, { id: '3', label: 'Skills & experience', isCompleted: false }]} onTaskClick={() => setActiveTab('projects')} />
              </motion.div>
              <motion.div initial={reducedMotion ? undefined : { opacity: 0, x: 20 }} animate={reducedMotion ? undefined : { opacity: 1, x: 0 }} transition={reducedMotion ? undefined : { delay: 0.3 }}>
                <ActivityFeed activities={notifications.length > 0 ? notifications.map((n, i) => ({ id: i.toString(), type: (n.type === 'success' ? 'verification' : 'profile_update'), title: n.text, description: 'Activity recorded', timestamp: new Date(n.date || Date.now()), icon: n.type === 'success' ? 'check' : 'file' })) : [{ id: '1', type: 'verification', title: 'Account Created', description: 'Your professional identity was created', timestamp: new Date(), icon: 'shield' }]} />
              </motion.div>
            </div>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
                <p className="text-gray-500 text-sm mt-1">Showcase your professional work and contributions</p>
              </div>
              <Button onClick={handleAddProject} className="bg-black hover:bg-gray-800 text-white shadow-sm transition-all hover:scale-105" aria-label="Add new project">
                <Plus className="h-4 w-4 mr-2" />
                Add Project
              </Button>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search projects..."
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                  className="pl-10 bg-white border-gray-200"
                  aria-label="Search projects by title or description"
                />
              </div>
              <select
                value={projectSort}
                onChange={(e) => setProjectSort(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="title-asc">A-Z</option>
                <option value="title-desc">Z-A</option>
              </select>
            </div>

            {projectsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ProjectCardSkeleton />
                <ProjectCardSkeleton />
                <ProjectCardSkeleton />
              </div>
            ) : projects.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200"
              >
                <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
                  <Briefcase className="h-12 w-12 text-purple-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-4">Add your professional projects to showcase your experience and skills to potential clients.</p>
                <div className="text-sm text-gray-400 mb-6">
                  <p>💡 Tip: Add 3-5 projects for best results</p>
                </div>
                <Button onClick={handleAddProject} variant="outline">
                  Add Your First Project
                </Button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects
                  .filter((p: any) => {
                    const matchesSearch = p.title?.toLowerCase().includes(projectSearch.toLowerCase()) ||
                                        p.description?.toLowerCase().includes(projectSearch.toLowerCase());
                    return matchesSearch;
                  })
                  .sort((a: any, b: any) => {
                    switch(projectSort) {
                      case 'date-desc': return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
                      case 'date-asc': return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
                      case 'title-asc': return (a.title || '').localeCompare(b.title || '');
                      case 'title-desc': return (b.title || '').localeCompare(a.title || '');
                      default: return 0;
                    }
                  })
                  .map((project: any, index) => (
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
              <Button onClick={handleRequestEndorsement} className="bg-black hover:bg-gray-800 text-white shadow-sm transition-all hover:scale-105" aria-label="Request new endorsement">
                <Plus className="h-4 w-4 mr-2" />
                Request Endorsement
              </Button>
            </div>

            {/* Status Filter Pills */}
            <div className="flex gap-2">
              {['all', 'pending', 'accepted'].map(status => (
                <Button
                  key={status}
                  variant={endorsementFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setEndorsementFilter(status)}
                  className={endorsementFilter === status ? 'bg-black text-white' : ''}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>

            {endorsementsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ProjectCardSkeleton />
                <ProjectCardSkeleton />
              </div>
            ) : endorsements.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200"
              >
                <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-green-100 to-teal-100 rounded-full flex items-center justify-center">
                  <Users className="h-12 w-12 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No endorsements yet</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-4">Request endorsements from colleagues and clients to build trust and credibility.</p>
                <div className="text-sm text-gray-400 mb-6">
                  <p>💡 Tip: Endorsements boost your profile visibility</p>
                </div>
                <Button onClick={handleRequestEndorsement} variant="outline">
                  Request Your First Endorsement
                </Button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {endorsements
                  .filter((e: any) => endorsementFilter === 'all' || e.status === endorsementFilter)
                  .map((endorsement: any, index) => (
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
              <Label htmlFor="title">Project Title *</Label>
              <Input
                id="title"
                value={projectFormData.title}
                onChange={(e) => {
                  setProjectFormData({ ...projectFormData, title: e.target.value });
                  if (projectFormErrors.title) {
                    setProjectFormErrors({ ...projectFormErrors, title: '' });
                  }
                }}
                placeholder="e.g. E-commerce Platform"
                className={`bg-white border-gray-200 focus:border-black focus:ring-black ${projectFormErrors.title ? 'border-red-500' : ''}`}
              />
              {projectFormErrors.title && (
                <p className="text-xs text-red-600 mt-1">{projectFormErrors.title}</p>
              )}
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
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={projectFormData.description}
                onChange={(e) => {
                  setProjectFormData({ ...projectFormData, description: e.target.value });
                  if (projectFormErrors.description) {
                    setProjectFormErrors({ ...projectFormErrors, description: '' });
                  }
                }}
                placeholder="Describe the project and your contribution..."
                className={`bg-white border-gray-200 focus:border-black focus:ring-black ${projectFormErrors.description ? 'border-red-500' : ''}`}
                maxLength={500}
              />
              {projectFormErrors.description && (
                <p className="text-xs text-red-600 mt-1">{projectFormErrors.description}</p>
              )}
              <div className={`text-xs text-right mt-1 ${(projectFormData.description?.length || 0) > 450 ? 'text-red-600 font-medium' : 'text-gray-400'}`}>
                {projectFormData.description?.length || 0}/500 characters
              </div>
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
              {projectSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Project'
              )}
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
              <Label htmlFor="endorser_name">Endorser Name *</Label>
              <Input
                id="endorser_name"
                value={endorsementFormData.endorser_name}
                onChange={(e) => {
                  setEndorsementFormData({ ...endorsementFormData, endorser_name: e.target.value });
                  if (endorsementFormErrors.endorser_name) {
                    setEndorsementFormErrors({ ...endorsementFormErrors, endorser_name: '' });
                  }
                }}
                placeholder="e.g. John Doe"
                className={`bg-white border-gray-200 focus:border-black focus:ring-black ${endorsementFormErrors.endorser_name ? 'border-red-500' : ''}`}
              />
              {endorsementFormErrors.endorser_name && (
                <p className="text-xs text-red-600 mt-1">{endorsementFormErrors.endorser_name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="endorser_email">Endorser Email *</Label>
              <Input
                id="endorser_email"
                type="email"
                value={endorsementFormData.endorser_email}
                onChange={(e) => {
                  setEndorsementFormData({ ...endorsementFormData, endorser_email: e.target.value });
                  if (endorsementFormErrors.endorser_email) {
                    setEndorsementFormErrors({ ...endorsementFormErrors, endorser_email: '' });
                  }
                }}
                placeholder="e.g. john@company.com"
                className={`bg-white border-gray-200 focus:border-black focus:ring-black ${endorsementFormErrors.endorser_email ? 'border-red-500' : ''}`}
              />
              {endorsementFormErrors.endorser_email && (
                <p className="text-xs text-red-600 mt-1">{endorsementFormErrors.endorser_email}</p>
              )}
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
              <Label htmlFor="endorsement_text">Endorsement Text *</Label>
              <Textarea
                id="endorsement_text"
                value={endorsementFormData.text}
                onChange={(e) => {
                  setEndorsementFormData({ ...endorsementFormData, text: e.target.value });
                  if (endorsementFormErrors.text) {
                    setEndorsementFormErrors({ ...endorsementFormErrors, text: '' });
                  }
                }}
                placeholder="Enter the endorsement text..."
                className={`bg-white border-gray-200 focus:border-black focus:ring-black ${endorsementFormErrors.text ? 'border-red-500' : ''}`}
                maxLength={1000}
              />
              {endorsementFormErrors.text && (
                <p className="text-xs text-red-600 mt-1">{endorsementFormErrors.text}</p>
              )}
              <div className={`text-xs text-right mt-1 ${(endorsementFormData.text?.length || 0) > 900 ? 'text-red-600 font-medium' : 'text-gray-400'}`}>
                {endorsementFormData.text?.length || 0}/1000 characters
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowEndorsementModal(false)} className="border-gray-200 text-gray-700 hover:bg-gray-50">
              Cancel
            </Button>
            <Button onClick={handleSaveEndorsement} disabled={endorsementSaving} className="bg-black hover:bg-gray-800 text-white">
              {endorsementSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Request'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Phone Number Modal */}
      <Dialog open={showPhoneModal} onOpenChange={setShowPhoneModal}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Phone className="h-5 w-5 text-blue-600" />
              Use Phone Number as PIN
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-900 mt-2">
              {!otpSent 
                ? "Enter your phone number to receive an OTP."
                : "Enter the OTP code sent to your phone number."
              }
            </DialogDescription>
          </DialogHeader>
          
          {!otpSent ? (
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-900">
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    id="phone"
                    placeholder="+1234567890" 
                    value={phoneInput} 
                    onChange={(e) => setPhoneInput(e.target.value)}
                    className="pl-10 bg-white border-gray-200 focus:border-blue-600 focus:ring-blue-600"
                  />
                </div>
                <p className="text-xs text-gray-900">
                  Include country code (e.g., +1 for USA, +234 for Nigeria)
                </p>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowPhoneModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handlePhoneSubmit}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={!phoneInput}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send OTP
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-sm font-medium text-gray-900">
                  Verification Code
                </Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    id="otp"
                    placeholder="Enter 6-digit code" 
                    value={otpInput} 
                    onChange={(e) => setOtpInput(e.target.value)}
                    className="pl-10 bg-white border-gray-200 focus:border-blue-600 focus:ring-blue-600 text-center text-lg tracking-widest"
                    maxLength={6}
                  />
                </div>
                <p className="text-xs text-gray-900">
                  Didn't receive the code? <button className="text-blue-600 hover:underline font-medium" onClick={handlePhoneSubmit}>Resend OTP</button>
                </p>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setOtpSent(false);
                    setOtpInput('');
                  }}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleVerifyOtp}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={!otpInput || otpInput.length < 6}
                >
                  <BadgeCheck className="h-4 w-4 mr-2" />
                  Verify OTP
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Terms & Conditions Modal for Random PIN */}
      <Dialog open={showTermsModal} onOpenChange={setShowTermsModal}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">Generate Random PIN</DialogTitle>
            <DialogDescription className="text-sm text-gray-900 mt-2">
              Please review and accept the terms before generating your PIN.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 space-y-4">
            {/* Terms List with Icons */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Secure & Unique</p>
                  <p className="text-xs text-gray-900">Your PIN is automatically generated and unique to your account</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Fingerprint className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Your PIN becomes your passport</p>
                  <p className="text-xs text-gray-900">You can now share your PIN with anyone</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <BadgeCheck className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Authentication</p>
                  <p className="text-xs text-gray-900">Used solely for verifying your professional credentials</p>
                </div>
              </div>
            </div>
            
            {/* Acceptance Checkbox */}
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <Checkbox 
                id="terms" 
                checked={termsAccepted} 
                onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                className="mt-0.5"
              />
              <label htmlFor="terms" className="text-sm font-medium text-gray-900 cursor-pointer">
                I understand and accept these terms and conditions
              </label>
            </div>
          </div>
          
          <DialogFooter className="mt-6 gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowTermsModal(false)}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleRandomPinConfirm} 
              disabled={!termsAccepted || pinLoading}
              className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white"
            >
              {pinLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Fingerprint className="h-4 w-4 mr-2" />
                  Generate PIN
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
