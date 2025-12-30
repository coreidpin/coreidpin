import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
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
  Loader2,
  Bell,
  Edit
} from 'lucide-react';
import { requestEndorsementViaServer } from '@/utils/requestEndorsementServer';
import type { AvailabilityStatus, WorkPreference } from '../types/availability';
import { AVAILABILITY_LABELS, WORK_PREFERENCE_LABELS } from '../types/availability';

import { supabase, supabaseUrl } from '../utils/supabase/client';
import { HeroProfileCard } from './dashboard/HeroProfileCard';
import { EndorsementRequestForm } from './dashboard/EndorsementRequestForm';
import { PINGenerationCard } from './dashboard/PINGenerationCard';
import { ProfileCompletionWidget } from './dashboard/ProfileCompletionWidget';
import { ActivityChart } from './dashboard/ActivityChart';
import { ActivityFeed } from './dashboard/ActivityFeed';
import { QuickActions } from './dashboard/QuickActions';
import { CaseStudyForm } from './dashboard/CaseStudyForm';
import { MarketValueCard } from './dashboard/MarketValueCard';
import { ResumeGenerator } from './dashboard/ResumeGenerator';
import { LeadsWidget } from './dashboard/LeadsWidget';
import { ProfileCompletionBanner } from './ProfileCompletionBanner';
import { LiveAnnouncementBanner } from './LiveAnnouncementBanner';
import { PhoneToPinWidget } from './dashboard/PhoneToPinWidget';
import { ErrorBoundary } from './ui/error-boundary';
import { OverviewSkeleton } from './dashboard/OverviewSkeleton';
import { DigitalBusinessCard } from './dashboard/DigitalBusinessCard';
import type { UserProfile } from '../types/profile';
import type { Project } from '../types/dashboard';
import { calculateProfileCompletion } from '../utils/profileCompletion';

import { WelcomeModal } from './onboarding/WelcomeModal';
import { NotificationPermissionModal } from './onboarding/NotificationPermissionModal';
import { useOnboarding } from '../hooks/useOnboarding';
import { getSessionState, ensureValidSession } from '../utils/session';
import { toast } from 'sonner';
import { trackEvent } from '../utils/analytics';
import { Checkbox } from './ui/checkbox';
import { DialogFooter, DialogDescription } from './ui/dialog';
import { NotificationCenter, ToastContainer } from './notifications';
import { useNotifications } from '../hooks/useNotifications';
import { EndorsementAPI } from '../utils/endorsementAPI';
import { ActivityTracker, getActivitySummary, getTrend } from '../utils/activityTracker';
import type { DisplayEndorsement, RequestEndorsementForm, RelationshipType } from '../types/endorsement';

import { ProductTour } from './dashboard/ProductTour';
import { professionalDashboardTour } from './dashboard/tourSteps';
import { NoProjects, NoEndorsements, NoActivity } from './dashboard/EmptyStates';
import { ExportActions } from './dashboard/ExportActions';
import { ProjectCardSkeleton, EndorsementCardSkeleton, StatsCardSkeleton } from './dashboard/LoadingSkeletons';
// import { useRealtime } from '../hooks/useRealtime'; // DISABLED - causing connection issues
// import { RealtimeStatus } from './RealtimeStatus'; // DISABLED - real-time is off
import { NetworkStatus } from './NetworkStatus';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { GlobalSearch } from './GlobalSearch';
import type { SearchableItem } from '../utils/searchUtils';
import { FeaturedSection, AddFeaturedItemModal, TechStackManager, AddTechSkillModal, CaseStudyCreator, CaseStudyList, CaseStudyViewer, ProjectCreator, ProjectList, ContributionGraph, PortfolioSearch, FeaturedShowcase, PortfolioAnalytics, PortfolioHealth, SkillsGap, SocialShare } from './portfolio';
import { addFeaturedItem } from '../utils/portfolio-api';
import { addTechSkill, updateTechSkill } from '../utils/tech-stack-api';
import { createCaseStudy } from '../utils/case-study-api';
import { createProject } from '../utils/project-api';
import { PortfolioExporter } from '../utils/portfolio-export';
import { QuickStats } from './dashboard/QuickStats';
import { ActivityHeatmap } from './dashboard/ActivityHeatmap';


export function ProfessionalDashboard() {
  // Notifications hook
  const { notifications: hookNotifications, unreadCount, loading: notificationsLoadingHook } = useNotifications();
  
  const [phonePin, setPhonePin] = useState<string | null>('Loading...');
  const [pinVisible, setPinVisible] = useState(true);  // ← ADD THIS LINE
  const [copiedPin, setCopiedPin] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showCaseStudyModal, setShowCaseStudyModal] = useState(false);
  const [showEndorsementModal, setShowEndorsementModal] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [activityPeriod, setActivityPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const loading = profileLoading;
  
  // Onboarding modals
  const {
    showWelcome,
    showNotificationPermission,
    completeWelcome,
    handleNotificationAllow,
    handleNotificationDeny,
    closeWelcome,
    closeNotification,
  } = useOnboarding();

  // Calculate profile completion dynamically
  const profileCompletion = React.useMemo(() => {
    if (!userProfile) return 0;
    const { completion } = calculateProfileCompletion(userProfile);
    return completion;
  }, [userProfile]);

  const location = useLocation();

  useEffect(() => {
    if (location.state?.openPinGeneration) {
      setShowTermsModal(true);
      // Clear state to prevent reopening on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Profile Completion Celebration
  useEffect(() => {
    const hasSeenCompletion = localStorage.getItem('has_seen_completion_100');
    const userId = localStorage.getItem('userId');
    
    if (profileCompletion === 100 && !hasSeenCompletion && userId) {
      // Show celebration toast
      toast.success('🎉 Profile Complete! All features unlocked!', {
        duration: 5000,
        description: 'You now have full access to API features, analytics, and priority search ranking.'
      });
      
      // Update database
      (async () => {
        try {
          await supabase
            .from('profiles')
            .update({ 
              profile_complete: true,
              completed_at: new Date().toISOString(),
              completion_percentage: 100
            })
            .eq('user_id', userId);
          
          console.log('✅ Profile completion tracked in database');
        } catch (error) {
          console.error('Failed to update profile completion:', error);
        }
      })();
      
      // Mark as seen
      localStorage.setItem('has_seen_completion_100', 'true');
      
      // Track analytics
      trackEvent('profile_completed', { 
        userId,
        timestamp: new Date().toISOString()
      });
    }
  }, [profileCompletion]);

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
  const [viewingProject, setViewingProject] = useState<Project | null>(null);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [endorsements, setEndorsements] = useState<DisplayEndorsement[]>([]);
  const [endorsementsLoading, setEndorsementsLoading] = useState(true);
  const [projectFormErrors, setProjectFormErrors] = useState<Record<string, string>>({});
  const [endorsementFormErrors, setEndorsementFormErrors] = useState<Record<string, string>>({});
  const [projectSearch, setProjectSearch] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('all');
  const [projectSort, setProjectSort] = useState('date-desc');
  const [endorsementFilter, setEndorsementFilter] = useState('all');
  const [projectFormDirty, setProjectFormDirty] = useState(false);
  const [endorsementFormDirty, setEndorsementFormDirty] = useState(false);
  
  // Notification system state
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);
  const [toasts, setToasts] = useState<Array<{ id: string; type: 'success' | 'error' | 'info' | 'warning'; message: string }>>([]);
  const [realTimeNotifications, setRealTimeNotifications] = useState<Array<any>>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  
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
  const [statsTrends, setStatsTrends] = useState({
    profileViews: { change: 0, direction: 'up' as const },
    pinUsage: { change: 0, direction: 'up' as const },
    verifications: { change: 0, direction: 'up' as const },
    apiCalls: { change: 0, direction: 'up' as const },
    countries: { change: 0, direction: 'up' as const },
    companies: { change: 0, direction: 'up' as const },
    projects: { change: 0, direction: 'up' as const },
    endorsements: { change: 0, direction: 'up' as const }
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

  // ✨ Phase 1: Error Handling
  const { handleError } = useErrorHandler();

  // ✨ Phase 1: Real-time Profile Updates
  const userId = localStorage.getItem('userId');
  // ✨ Real-time updates DISABLED to prevent connection issues
  // You can enable this later when connection is stable
  // const { status: profileRealtimeStatus } = useRealtime({
  //   table: 'profiles',
  //   filter: userId ? `user_id=eq.${userId}` : undefined,
  //   onUpdate: (payload) => {
  //     console.log('✨ Profile updated in real-time:', payload.new);
  //     setUserProfile(payload.new);
  //     toast.success('Profile updated');
  //   }
  // });

  // ✨ Phase 1: Real-time Endorsements Updates DISABLED
  // const { status: endorsementsRealtimeStatus } = useRealtime({
  //   table: 'endorsements',
  //   filter: userId ? `professional_id=eq.${userId}` : undefined,
  //   onInsert: (payload) => {
  //     console.log('✨ New endorsement received!', payload.new);
  //     setEndorsements(prev => [payload.new as DisplayEndorsement, ...prev]);
  //     toast.success('🎉 New endorsement received!');
  //   },
  //   onUpdate: (payload) => {
  //     console.log('✨ Endorsement updated:', payload.new);
  //     setEndorsements(prev => 
  //       prev.map(e => e.id === payload.new.id ? payload.new as DisplayEndorsement : e)
  //     );
  //   }
  // });

  // ✨ Phase 2: Global Search
  const [showSearch, setShowSearch] = React.useState(false);
  const [searchableItems, setSearchableItems] = React.useState<SearchableItem[]>([]);

  // ✨ Featured Section State
  const [showAddFeaturedModal, setShowAddFeaturedModal] = React.useState(false);
  const [featuredRefresh, setFeaturedRefresh] = React.useState(0);

  // ✨ Tech Stack State
  const [showAddSkillModal, setShowAddSkillModal] = React.useState(false);
  const [editingSkill, setEditingSkill] = React.useState<any | null>(null);
  const [techStackRefresh, setTechStackRefresh] = React.useState(0);

  // ✨ Case Study State
  const [showCaseStudyCreator, setShowCaseStudyCreator] = React.useState(false);
  const [caseStudyRefresh, setCaseStudyRefresh] = React.useState(0);

  // ✨ Engineering Project State
  const [showProjectCreator, setShowProjectCreator] = React.useState(false);
  const [projectRefresh, setProjectRefresh] = React.useState(0);

  // ✨ Portfolio Search & Analytics State
  const [portfolioSearchQuery, setPortfolioSearchQuery] = React.useState('');
  const [portfolioFilters, setPortfolioFilters] = React.useState<any>({
    query: '',
    type: 'all',
    tags: [],
    featured: false,
  });

  // ✨ Heatmap State
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [heatmapLoading, setHeatmapLoading] = useState(true);

  // Fetch heatmap data
  useEffect(() => {
    const fetchHeatmap = async () => {
      if (!userId) return;
      try {
        const data = await getActivitySummary(userId);
        
        // Calculate levels based on max activity
        const maxCount = Math.max(...data.map((d: any) => d.count), 1);
        
        const formattedData = data.map((d: any) => ({
           date: d.date,
           count: d.count,
           level: Math.min(Math.ceil((d.count / maxCount) * 4), 4) as 0|1|2|3|4
        }));
        
        setHeatmapData(formattedData);
      } catch (err) {
        console.error('Error fetching heatmap:', err);
      } finally {
        setHeatmapLoading(false);
      }
    };
    
    fetchHeatmap();
  }, [userId]);

  // Prepare searchable data
  React.useEffect(() => {
    const items: SearchableItem[] = [
      // Projects
      ...projects.map((p: any) => ({
        id: p.id,
        title: p.title || p.name,
        description: p.description,
        tags: p.skills || [],
        type: 'project' as const,
        metadata: p
      })),
      // Endorsements
      ...endorsements.map((e: any) => ({
        id: e.id,
        title: `Endorsement from ${e.endorser_name}`,
        description: e.message,
        tags: e.skills || [],
        type: 'endorsement' as const,
        metadata: e
      }))
    ];
    setSearchableItems(items);
  }, [projects, endorsements]);

  // Cmd+K / Ctrl+K keyboard shortcut
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectSearchItem = (item: SearchableItem) => {
    console.log('Selected:', item);
    // Navigate or show details based on item type
    if (item.type === 'project') {
      // Could scroll to project or open modal
      toast.success(`Opening: ${item.title}`);
    } else if (item.type === 'endorsement') {
      toast.success(`Viewing endorsement: ${item.title}`);
    }
  };

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
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);

  // Enhanced Endorsement form state
  const [endorsementFormData, setEndorsementFormData] = useState<RequestEndorsementForm>({
    endorser_name: '',
    endorser_email: '',
    endorser_role: '',
    endorser_company: '',
    endorser_linkedin_url: '',
    relationship_type: undefined,
    company_worked_together: '',
    time_worked_together_start: '',
    time_worked_together_end: '',
    project_context: '',
    suggested_skills: [],
    custom_message: ''
  });
  const [endorsementSaving, setEndorsementSaving] = useState(false);
  const [respondingEndorsementId, setRespondingEndorsementId] = useState<string | null>(null);
  const [deletingEndorsementId, setDeletingEndorsementId] = useState<string | null>(null);

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
        ? `${supabaseUrl}/functions/v1/server/projects/${editingProject.id}`
        : `${supabaseUrl}/functions/v1/server/projects`;

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
        const listResponse = await fetch(`${supabaseUrl}/functions/v1/server/projects`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (listResponse.ok) {
          const data = await listResponse.json();
          if (data.success) setProjects(data.projects);
        }
        fetchStats(); // Refresh stats
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

    setDeletingProjectId(projectId);
    try {
      const token = await ensureValidSession();
      if (!token) return;

      const response = await fetch(
        `${supabaseUrl}/functions/v1/server/projects/${projectId}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        toast.success('Project deleted successfully');
        // Refresh projects list
        const listResponse = await fetch(`${supabaseUrl}/functions/v1/server/projects`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (listResponse.ok) {
          const data = await listResponse.json();
          if (data.success) setProjects(data.projects);
        }
        fetchStats(); // Refresh stats
      } else {
        toast.error('Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Error deleting project');
    } finally {
      setDeletingProjectId(null);
    }
  };

  // Case Study handler
  const handleAddCaseStudy = () => {
    setShowCaseStudyModal(true);
  };

  const handleShareProfile = () => {
    console.log('Opening Share Profile Dialog');
    setShowShareDialog(true);
  };

  const handleCaseStudySubmit = async (data: any) => {
    try {
      const token = await ensureValidSession();
      if (!token) return;

      const response = await fetch(`${supabaseUrl}/functions/v1/server/projects`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        toast.success('Case study created successfully!');
        setShowCaseStudyModal(false);
        
        // Refresh projects list
        const listResponse = await fetch(`${supabaseUrl}/functions/v1/server/projects`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (listResponse.ok) {
          const responseData = await listResponse.json();
          if (responseData.success) setProjects(responseData.projects);
        }
        fetchStats();
      } else {
        toast.error('Failed to create case study');
      }
    } catch (error) {
      console.error('Error creating case study:', error);
      toast.error('Error creating case study');
    }
  };


  // Endorsement handlers
  const handleRequestEndorsement = () => {
    setEndorsementFormData({
      endorser_name: '',
      endorser_email: '',
      endorser_role: '',
      endorser_company: '',
      endorser_linkedin_url: '',
      relationship_type: undefined,
      company_worked_together: '',
      time_worked_together_start: '',
      time_worked_together_end: '',
      project_context: '',
      suggested_skills: [],
      custom_message: ''
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
      const result = await requestEndorsementViaServer(endorsementFormData);

      if (result.success) {
        toast.success('Endorsement request sent successfully!');
        setShowEndorsementModal(false);
        
        // Refresh endorsements list
        await fetchEndorsements();
        await fetchStats();
        
        // Track activity
        if (result.endorsement) {
          await ActivityTracker.endorsementRequested(endorsementFormData.endorser_name);
        }
      } else {
        toast.error(result.error || 'Failed to request endorsement');
      }
    } catch (error: any) {
      console.error('Error requesting endorsement:', error);
      toast.error('Error requesting endorsement');
    } finally {
      setEndorsementSaving(false);
    }
  };

  const handleRespondToEndorsement = async (endorsementId: string, action: 'accept' | 'reject') => {
    setRespondingEndorsementId(endorsementId);
    try {
      const result = await EndorsementAPI.respondToEndorsement(endorsementId, action);

      if (result.success) {
        toast.success(`Endorsement ${action === 'accept' ? 'accepted' : 'rejected'} successfully`);
        
        // Refresh endorsements list
        await fetchEndorsements();
        await fetchStats();
        
        // Track activity
        const endorsement = endorsements.find(e => e.id === endorsementId);
        if (endorsement) {
          if (action === 'accept') {
            await ActivityTracker.endorsementApproved(endorsement.endorser_name);
          } else {
            await ActivityTracker.endorsementRejected(endorsement.endorser_name);
          }
        }
      } else {
        toast.error(result.error || `Failed to ${action} endorsement`);
      }
    } catch (error: any) {
      console.error('Error responding to endorsement:', error);
      toast.error('Error responding to endorsement');
    } finally {
      setRespondingEndorsementId(null);
    }
  };

  const handleDeleteEndorsement = async (endorsementId: string) => {
    if (!confirm('Are you sure you want to delete this endorsement?')) return;

    setDeletingEndorsementId(endorsementId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('professional_endorsements_v2')
        .delete()
        .eq('id', endorsementId)
        .eq('professional_id', user.id);

      if (error) throw error;

      toast.success('Endorsement deleted successfully');
      
      // Refresh endorsements list
      await fetchEndorsements();
      await fetchStats();
    } catch (error: any) {
      console.error('Error deleting endorsement:', error);
      toast.error('Failed to delete endorsement');
    } finally {
      setDeletingEndorsementId(null);
    }
  };

  const handleToggleFeatured = async (endorsementId: string, featured: boolean) => {
    try {
      const result = await EndorsementAPI.toggleFeatured(endorsementId, featured);

      if (result.success) {
        toast.success(`Endorsement ${featured ? 'featured' : 'unfeatured'} successfully`);
        await fetchEndorsements();
      } else {
        toast.error(result.error || 'Failed to update endorsement');
      }
    } catch (error: any) {
      console.error('Error toggling featured:', error);
      toast.error('Failed to update endorsement');
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
          setProfileLoading(false);
          return;
        }

        // Add minimum delay to prevent flicker
        const minDelay = new Promise(resolve => setTimeout(resolve, 800));
        const fetchPromise = (async () => {
          // Fetch Profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.userId)
            .single();
          return { profile, profileError };
        })();
        
        const [_, { profile, profileError }] = await Promise.all([minDelay, fetchPromise]);
        
        // Check email verification status from Auth
        const { data: { user } } = await supabase.auth.getUser();
        const isVerified = !!user?.email_confirmed_at;
        
        // Self-healing: If user is logged in but not verified, force verify
        if (user && !isVerified) {
          console.log('User logged in but not verified. Attempting self-healing...');
          try {
            const response = await fetch(`${supabaseUrl}/functions/v1/server/pin/verify-email`, {
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
        console.log('Profile data fields:', profile ? Object.keys(profile) : 'none');
        console.log('Location-related fields:', {
          location: (profile as any)?.location,
          country: (profile as any)?.country,
          city: (profile as any)?.city,
          state: (profile as any)?.state,
          address: (profile as any)?.address,
          residence: (profile as any)?.residence,
          nationality: (profile as any)?.nationality
        });
        console.log('All profile data:', profile);
        
        if (profileError) {
          console.error('Error fetching profile:', profileError);
        } else if (profile) {
          console.log('Setting profile with data:', profile);
          setUserProfile({
            ...(profile as any),
            email_verified: isVerified || (profile as any).email_verified
          });
        } else {
          console.log('No profile data returned');
        }

        // Fetch PIN via Edge Function (bypasses RLS)
        console.log('Fetching PIN for user:', session.userId);
        try {
          const pinResponse = await fetch(`${supabaseUrl}/functions/v1/server/pin/current`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (pinResponse.ok) {
            const pinData = await pinResponse.json();
            if (pinData.success && pinData.pin) {
              console.log('Setting PIN:', pinData.pin);
              setPhonePin(pinData.pin);
            } else {
              console.log('No PIN found');
              setPhonePin(null);
            }
          } else {
            console.log('PIN not found (404)');
            setPhonePin(null);
          }
        } catch (error) {
          console.error('Error fetching PIN:', error);
          setPhonePin(null);
        }
      } catch (error) {
        console.error('Profile fetch unexpected error:', error);
      } finally {
        setProfileLoading(false);
      }
    };
    
    fetchProfile();
  }, [location.pathname]);

  // Fetch dashboard stats
  const fetchStats = async () => {
    try {
      const token = await ensureValidSession();
      if (!token) return;

      const response = await fetch(`${supabaseUrl}/functions/v1/server/stats/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          if (data.success && data.stats) {
            setStats(data.stats);

            // Fetch real trends if user is logged in
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              const [endorsementsTrend, viewsTrend, pinTrend] = await Promise.all([
                 getTrend('professional_endorsements_v2', 'professional_id', user.id),
                 getTrend('profile_views', 'profile_user_id', user.id),
                 getTrend('pin_verifications', 'professional_id', user.id) // Assuming we have this table or similar
              ]);

              setStatsTrends(prev => ({
                ...prev,
                endorsements: { change: endorsementsTrend, direction: endorsementsTrend >= 0 ? 'up' : 'down' },
                profileViews: { change: viewsTrend, direction: viewsTrend >= 0 ? 'up' : 'down' },
                pinUsage: { change: pinTrend, direction: pinTrend >= 0 ? 'up' : 'down' },
                // Keep others as 0 for now until tracking is implemented for them
              }));
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Fetch PIN analytics for chart
  useEffect(() => {
    const fetchPinAnalytics = async () => {
      try {
        const token = await ensureValidSession();
        if (!token) return;

        const response = await fetch(`${supabaseUrl}/functions/v1/server/stats/pin-analytics`, {
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

  // Fetch activity feed and notifications
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const token = await ensureValidSession();
        if (!token) return;

        const response = await fetch(`${supabaseUrl}/functions/v1/server/stats/activity`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.activities) {
            // Transform activities into notification format for activity feed
            const formattedNotifications = data.activities.slice(0, 3).map((activity: any) => ({
              text: activity.text,
              type: activity.type
            }));
            setNotifications(formattedNotifications);
            
            // Transform activities into notification center format
            const notificationCenterData = data.activities.map((activity: any, index: number) => ({
              id: `activity-${index}`,
              type: activity.type === 'verification' ? 'success' : activity.type === 'view' ? 'info' : 'info',
              title: activity.type === 'verification' ? 'Verification' : activity.type === 'view' ? 'Profile View' : 'Activity',
              message: activity.text,
              timestamp: getRelativeTime(activity.timestamp || new Date().toISOString()),
              isNew: index < 2,
              category: 'notification' as const,
            }));
            setRealTimeNotifications(notificationCenterData);
          }
        }
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setActivitiesLoading(false);
        setNotificationsLoading(false);
      }
    };

    fetchActivities();
    const interval = setInterval(fetchActivities, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = await ensureValidSession();
        if (!token) return;

        const response = await fetch(`${supabaseUrl}/functions/v1/server/projects`, {
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
  const fetchEndorsements = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const result = await EndorsementAPI.getEndorsements(user.id, {
        status: ['requested', 'pending_professional', 'accepted', 'rejected']
      });

      if (result.success && result.endorsements) {
        console.log('Fetched endorsements:', result.endorsements);
        setEndorsements(result.endorsements);
      } else {
        console.log('No endorsements found or error:', result);
      }
    } catch (error) {
      console.error('Error fetching endorsements:', error);
    } finally {
      setEndorsementsLoading(false);
    }
  };

  useEffect(() => {
    fetchEndorsements();

    // Refresh on window focus to catch external updates (e.g. endorsements submitted)
    const onFocus = () => {
      fetchEndorsements();
    };

    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
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
  const [Recharts, setRecharts] = useState<null | any>(null);

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

      const response = await fetch(`${supabaseUrl}/functions/v1/auth-otp/request`, {
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

      const response = await fetch(`${supabaseUrl}/functions/v1/auth-otp/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ registration_token: otpRegToken, otp: otpInput })
      });

      if (response.ok) {
        // OTP verified, assign phone as PIN
        const pinResponse = await fetch(`${supabaseUrl}/functions/v1/pin/issue`, {
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
      setPinLoading(true);
      
      const token = await ensureValidSession();
      if (!token) {
        toast.error('Session expired. Please login again.');
        return;
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/server/pin/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setPhonePin(data.pin);
        toast.success(`PIN: ${data.pin}`, { duration: 10000 });
        setShowTermsModal(false);
      } else {
        console.error('PIN generation error:', data);
        toast.error(data.error || 'Failed to generate PIN');
      }
    } catch (error: any) {
      console.error('Error generating random PIN:', error);
      toast.error(`Error generating PIN: ${error.message || 'Unknown error'}`);
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
    <div className="min-h-screen bg-white scroll-smooth overflow-x-hidden pt-20 sm:pt-24 w-full">
      {/* ✨ Phase 1: Network & Realtime Status Indicators */}
      <NetworkStatus showWhenOnline position="top" />
      {/* RealtimeStatus disabled since real-time is turned off */}
      {/* <RealtimeStatus 
        status={profileRealtimeStatus} 
        position="top-right" 
        compact 
        showWhenConnected
      /> */}

      {/* ✨ Phase 2: Global Search (Cmd+K) */}
      <GlobalSearch
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        items={searchableItems}
        onSelectItem={handleSelectSearchItem}
      />

      <ErrorBoundary name="DashboardContent">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 space-y-6 sm:space-y-8">
        
        {/* Profile Completion Progress - High Visibility at Top */}
        <AnimatePresence>
          {userProfile && (
            <div id="identity-completion">
              <ProfileCompletionBanner 
                {...calculateProfileCompletion(userProfile)}
                userName={(userProfile as any)?.full_name?.split(' ')[0] || (userProfile as any)?.name?.split(' ')[0]}
              />
            </div>
          )}
        </AnimatePresence>

        {/* Live Announcements from Admin */}
        <LiveAnnouncementBanner />

        {/* Welcome Section - Mobile: Stack, Desktop: Side-by-side */}

        <div className="mb-6 mt-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-gray-100 pb-6">
          <div className="space-y-2 sm:space-y-4 flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight break-words">
              Welcome back, <span className="text-slate-500">{(userProfile as any)?.full_name?.split(' ')[0] || (userProfile as any)?.name?.split(' ')[0] || 'Professional'}</span>
              <span className="ml-2 text-base font-normal text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">Happy Holidays! 🎄</span>
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-100 w-fit">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-sm font-medium text-green-700">Identity Active</span>
              </div>
              <p className="text-slate-400 text-sm">
                Here's what's happening with your profile today.
              </p>
            </div>
          </div>
          <button
            onClick={() => setNotificationCenterOpen(true)}
            className="relative p-3 rounded-full bg-gray-50 hover:bg-gray-100 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center flex-shrink-0"
            aria-label="Open notifications"
          >
            <Bell className="w-5 h-5 text-gray-700" />
            {!notificationsLoadingHook && unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Header Profile Card */}
        <motion.div
          initial={reducedMotion ? undefined : { opacity: 0, y: 20 }}
          animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          className="px-4"
          style={{
            width: '100vw',
            marginLeft: 'calc(-50vw + 50%)',
            marginRight: 'calc(-50vw + 50%)'
          }}
        >
          <HeroProfileCard 
            name={(userProfile as any)?.full_name || (userProfile as any)?.name || 'Professional User'}
            role={(userProfile as any)?.role || (userProfile as any)?.job_title || 'Professional'}
            country={(userProfile as any)?.city || (userProfile as any)?.nationality || 'Location not set'}
            isVerified={(userProfile as any)?.email_verified || false}
            isBetaTester={true}
          />
        </motion.div>

        {/* Availability Status Card */}
        {userProfile && (userProfile as any)?.availability_status && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${
                      (userProfile as any).availability_status === 'actively_working' ? 'bg-blue-500' :
                      (userProfile as any).availability_status === 'open_to_work_fulltime' ? 'bg-green-500 animate-pulse' :
                      (userProfile as any).availability_status === 'open_to_contract' ? 'bg-purple-500' :
                      'bg-gray-400'
                    }`}></div>
                    <div>
                      <p className="text-sm text-slate-600">Current Status</p>
                      <p className="font-semibold text-slate-900">
                        {AVAILABILITY_LABELS[(userProfile as any).availability_status as AvailabilityStatus] || 'Actively Working'}
                      </p>
                    </div>
                  </div>
                  {(userProfile as any).work_preference && (
                    <Badge variant="outline" className="bg-white text-gray-900 border-gray-300">
                      {WORK_PREFERENCE_LABELS[(userProfile as any).work_preference as WorkPreference] || 'Remote'}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Market Value Card */}
        <MarketValueCard />

        {/* ✨ Phase 2: QuickStats Analytics */}
        <QuickStats 
          stats={{
            profileViews: stats.profileViews || 0,
            profileViewsChange: statsTrends.profileViews?.change || 0,
            endorsements: endorsements.length || stats.endorsements || 0,
            endorsementsChange: statsTrends.endorsements?.change || 0,
            pinUsage: stats.pinUsage || 0,
            pinUsageChange: statsTrends.pinUsage?.change || 0,
            verifications: stats.verifications || 0,
            verificationsChange: statsTrends.verifications?.change || 0
          }}
        />

        {/* ✨ Featured Section - Showcase best work */}
        {userId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <FeaturedSection
              userId={userId}
              editable={true}
              onAddClick={() => setShowAddFeaturedModal(true)}
              refreshTrigger={featuredRefresh}
            />
          </motion.div>
        )}

        {/* ✨ Tech Stack Manager */}
        {userId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <TechStackManager
              userId={userId}
              editable={true}
              onAddClick={() => setShowAddSkillModal(true)}
              onEditClick={(skill) => {
                setEditingSkill(skill);
                setShowAddSkillModal(true);
              }}
            />
          </motion.div>
        )}

        {/* ✨ Case Studies Section */}
        {userId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Case Studies</h2>
              <button
                onClick={() => setShowCaseStudyCreator(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" />
                Create Case Study
              </button>
            </div>
            <p className="text-sm text-gray-600">
              Showcase your design work with detailed case studies
            </p>
          </motion.div>
        )}

        {/* ✨ Phase 3: Activity Heatmap */}
        <div 
          className="px-4"
          style={{
            width: '100vw',
            marginLeft: 'calc(-50vw + 50%)',
            marginRight: 'calc(-50vw + 50%)'
          }}
        >
          <ActivityHeatmap 
            data={heatmapLoading ? [] : heatmapData}
            onDayClick={(day) => {
              if (day.count > 0) {
                toast.info(`${day.count} activities on ${new Date(day.date).toLocaleDateString()}`);
              } else {
                 toast.info(`No activity on ${new Date(day.date).toLocaleDateString()}`);
              }
            }}
          />
        </div>

        {/* ✨ Portfolio Search */}
        {userId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <PortfolioSearch
              onSearch={(query, filters) => {
                setPortfolioSearchQuery(query);
                setPortfolioFilters(filters);
              }}
              availableTags={[
                'React', 'TypeScript', 'Node.js', 'Python', 'Design', 
                'UI/UX', 'Mobile', 'Web', 'API', 'Cloud'
              ]}
            />
          </motion.div>
        )}

        {/* ✨ Featured Projects Showcase */}
        {userId && projects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32 }}
            className="mb-8"
          >
            <FeaturedShowcase
              projects={projects
                .filter((p: any) => p.featured || p.is_featured)
                .slice(0, 5)
                .map((p: any) => ({
                  id: p.id,
                  title: p.title || p.name,
                  description: p.description || '',
                  imageUrl: p.image_url || p.cover_image || p.featured_image_url,
                  type: p.project_type || 'portfolio_item',
                  tags: p.tags || p.tech_stack || p.skills || [],
                  link: p.links?.[0],
                }))}
              onProjectClick={(id) => {
                const project = projects.find((p: any) => p.id === id);
                if (project) {
                  // View project logic here
                  toast.info(`Opening project: ${project.title || project.name}`);
                }
              }}
            />
          </motion.div>
        )}

        {/* ✨ GitHub-style Contribution Graph (for engineers) */}
        {userId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mb-8"
          >
            <ContributionGraph
              data={heatmapData.map(day => ({
                date: day.date,
                count: day.count,
                level: day.level as 0 | 1 | 2 | 3 | 4
              }))}
            />
          </motion.div>
        )}

        {/* ✨ Case Studies List */}
        {userId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <CaseStudyList
              userId={userId}
              editable={true}
              onAddClick={() => setShowCaseStudyCreator(true)}
              onEditClick={(caseStudy) => {
                const projectMapper: Project = {
                  id: caseStudy.id,
                  title: caseStudy.title,
                  description: `Client: ${caseStudy.client}`,
                  role: caseStudy.role,
                  timeline: caseStudy.year,
                  skills: caseStudy.tags,
                  links: [],
                  challenge: caseStudy.problem?.statement || '',
                  solution: caseStudy.solution?.prototype || '',
                  result: caseStudy.impact?.metrics?.map((m: any) => `${m.label}: ${m.value}`).join('\n') || '',
                  media_urls: caseStudy.solution?.finalDesigns?.map((img: any) => img.url) || [],
                  featured_image_url: caseStudy.coverImage,
                  video_url: caseStudy.solution?.videoUrl,
                  project_type: 'case_study' as const
                };
                setViewingProject(projectMapper);
              }}
              refreshTrigger={caseStudyRefresh}
            />
          </motion.div>
        )}

        {/* ✨ Engineering Projects List */}
        {userId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <ProjectList
              userId={userId}
              editable={true}
              onAddClick={() => setShowProjectCreator(true)}
              onEditClick={(project) => {
                // Map EngineeringProject to Project for viewer
                const projectMapper: Project = {
                  id: project.id,
                  title: project.name,
                  description: project.description,
                  role: project.role,
                  timeline: project.duration,
                  skills: project.techStack,
                  links: [project.repositoryUrl, project.liveDemoUrl].filter(Boolean) as string[],
                  challenge: '',
                  solution: '',
                  result: `Users: ${project.impact?.usersServed || 'N/A'}\nPerformance: ${project.impact?.performanceGain || 'N/A'}`,
                  media_urls: project.screenshots,
                  featured_image_url: project.coverImage,
                  video_url: undefined,
                  project_type: 'portfolio_item' as const
                };
                setViewingProject(projectMapper);
              }}
              refreshTrigger={projectRefresh}
            />
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            


        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 w-full overflow-x-hidden">
          <TabsList className="inline-flex w-full bg-slate-100 p-1 rounded-xl gap-1 overflow-x-auto scrollbar-hide" style={{ flexWrap: 'nowrap', WebkitOverflowScrolling: 'touch' }}>
            <TabsTrigger 
              value="overview"
              className="text-xs sm:text-sm md:text-base px-3 sm:px-4 py-2"
              style={{
                color: activeTab === 'overview' ? '#ffffff' : '#334155',
                backgroundColor: activeTab === 'overview' ? '#000000' : 'transparent',
                fontWeight: '600',
                whiteSpace: 'nowrap',
                flex: '0 0 auto'
              }}
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="projects"
              className="text-xs sm:text-sm md:text-base px-3 sm:px-4 py-2"
              style={{
                color: activeTab === 'projects' ? '#ffffff' : '#334155',
                backgroundColor: activeTab === 'projects' ? '#000000' : 'transparent',
                fontWeight: '600',
                whiteSpace: 'nowrap',
                flex: '0 0 auto'
              }}
            >
              Projects
            </TabsTrigger>
            <TabsTrigger 
              value="endorsements"
              className="text-xs sm:text-sm md:text-base px-3 sm:px-4 py-2"
              style={{
                color: activeTab === 'endorsements' ? '#ffffff' : '#334155',
                backgroundColor: activeTab === 'endorsements' ? '#000000' : 'transparent',
                fontWeight: '600',
                whiteSpace: 'nowrap',
                flex: '0 0 auto'
              }}
            >
              Endorsements
            </TabsTrigger>
            <TabsTrigger 
              value="inquiries"
              className="text-xs sm:text-sm md:text-base px-3 sm:px-4 py-2"
              style={{
                color: activeTab === 'inquiries' ? '#ffffff' : '#334155',
                backgroundColor: activeTab === 'inquiries' ? '#000000' : 'transparent',
                fontWeight: '600',
                whiteSpace: 'nowrap',
                flex: '0 0 auto'
              }}
            >
              Inquiries
            </TabsTrigger>
            <TabsTrigger 
              value="analytics"
              className="text-xs sm:text-sm md:text-base px-3 sm:px-4 py-2"
              style={{
                color: activeTab === 'analytics' ? '#ffffff' : '#334155',
                backgroundColor: activeTab === 'analytics' ? '#000000' : 'transparent',
                fontWeight: '600',
                whiteSpace: 'nowrap',
                flex: '0 0 auto'
              }}
            >
              Analytics
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={reducedMotion ? undefined : { opacity: 0, x: 20 }}
                animate={reducedMotion ? undefined : { opacity: 1, x: 0 }}
                exit={reducedMotion ? undefined : { opacity: 0, x: -20 }}
                transition={reducedMotion ? undefined : { duration: 0.2 }}
              >

                <TabsContent value="overview" className="space-y-4 sm:space-y-6 md:space-y-8 overflow-x-hidden">
                  
                  {loading ? (
                    <OverviewSkeleton />
                  ) : (
                    <>
                      {/* Phone to PIN Conversion Widget */}
                      {phonePin && phonePin !== 'Loading...' && (activeTab === 'overview') && (
                        <ErrorBoundary name="PhoneToPinWidget">
                          <div id="professional-pin-card">
                            <PhoneToPinWidget
                              currentPin={phonePin}
                              phoneNumber={userProfile?.phone || userProfile?.mobile}
                              onSuccess={(newPin) => {
                                setPhonePin(newPin);
                              }}
                            />
                          </div>
                        </ErrorBoundary>
                      )}
                      
                      <div id="quick-actions">
                        <QuickActions 
                        onAddProject={handleAddProject}
                        onRequestEndorsement={handleRequestEndorsement}
                        onAddCaseStudy={handleAddCaseStudy}
                        reducedMotion={reducedMotion}
                        userPin={phonePin || undefined}
                        isVerified={userProfile?.email_verified ?? false}
                        jobTitle={userProfile?.job_title}
                        onDownloadBadge={handleShareProfile}
                        onGenerateResume={() => setShowResumeModal(true)}
                      />
                      </div>

                      <div className="mt-6 mb-6">
                        <ExportActions 
                          userId={userProfile?.id || userProfile?.user_id || ''}
                          userName={userProfile?.full_name || 'Professional'}
                          userRole={userProfile?.job_title || userProfile?.role || 'Member'}
                          userSkills={userProfile?.skills || []}
                          pinNumber={phonePin || undefined}
                        />
                      </div>
                      
                      {/* Stats Grid - Mobile: 2 cols, Tablet: 3 cols, Desktop: 4 cols */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                        {statsLoading ? (
// ... rest of code
                      Array(8).fill(0).map((_, i) => <StatCardSkeleton key={i} />)
                    ) : (
                      [
                        { key: 'profileViews', label: 'Profile Views', color: 'purple', value: stats.profileViews },
                        { key: 'pinUsage', label: 'PIN Usage', color: 'green', value: stats.pinUsage },
                        { key: 'verifications', label: 'Verifications', color: 'blue', value: stats.verifications },
                        { key: 'apiCalls', label: 'API Calls', color: 'purple', value: stats.apiCalls },
                        { key: 'countries', label: 'Countries', color: 'purple', value: stats.countries },
                        { key: 'companies', label: 'Companies', color: 'blue', value: stats.companies },
                        { key: 'projects', label: 'Projects', color: 'purple', value: stats.projects },
                        { key: 'endorsements', label: 'Endorsements', color: 'green', value: endorsements.length > 0 ? endorsements.length : stats.endorsements }
                      ].map((stat, index) => {
                        const trend = statsTrends[stat.key as keyof typeof statsTrends];
                        return (
                          <motion.div
                            key={stat.key}
                            initial={reducedMotion ? undefined : { opacity: 0, y: 20 }}
                            animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                            whileHover={reducedMotion ? undefined : { y: -4, transition: { duration: 0.2 } }}
                            transition={reducedMotion ? undefined : { delay: index * 0.1, duration: 0.3 }}
                          >
                            <Card className="bg-white border-gray-100 shadow-sm hover:shadow-lg transition-shadow duration-200 group">
                              <CardContent className="p-4 md:p-6 text-center relative">
                                <button
                                  className="absolute top-2 md:top-3 right-2 md:right-3 opacity-40 hover:opacity-100 transition-opacity"
                                  title={statTooltips[stat.key as keyof typeof statTooltips]}
                                >
                                  <div className="h-4 w-4 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">i</div>
                                </button>
                                <div className={`text-2xl md:text-3xl lg:text-4xl font-bold mb-2 ${stat.color === 'purple' ? 'text-purple-600' : stat.color === 'green' ? 'text-green-600' : 'text-blue-600'}`}>
                                  {reducedMotion ? (
                                    stat.value
                                  ) : (
                                    <CountUp
                                      end={stat.value}
                                      duration={1.5}
                                      separator=","
                                      delay={index * 0.1}
                                    />
                                  )}
                                </div>
                                <div className={`flex items-center justify-center gap-1 text-xs font-medium mb-2 ${
                                  trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {trend.direction === 'up' ? (
                                    <TrendingUp className="h-3 w-3" />
                                  ) : (
                                    <TrendingDown className="h-3 w-3" />
                                  )}
                                  <span>{trend.change}%</span>
                                </div>
                                <div className="text-xs md:text-sm text-gray-600 font-medium">{stat.label}</div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })
                    )}
                  </div>
                  
                  <motion.div initial={reducedMotion ? undefined : { opacity: 0, y: 20 }} animate={reducedMotion ? undefined : { opacity: 1, y: 0 }} transition={reducedMotion ? undefined : { delay: 0.1 }}>
                    <ActivityChart 
                      data={chartData.map(d => ({ day: `Day ${d.day}`, value: d.actions }))} 
                      period={activityPeriod} 
                      onPeriodChange={setActivityPeriod} 
                    />
                  </motion.div>
                    </>
                  )}
                </TabsContent>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Projects Tab */}
          <AnimatePresence mode="wait">
            {activeTab === 'projects' && (
              <motion.div
                key="projects"
                initial={reducedMotion ? undefined : { opacity: 0, x: 20 }}
                animate={reducedMotion ? undefined : { opacity: 1, x: 0 }}
                exit={reducedMotion ? undefined : { opacity: 0, x: -20 }}
                transition={reducedMotion ? undefined : { duration: 0.2 }}
              >
                <TabsContent value="projects" className="space-y-6 overflow-x-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
                <p className="text-gray-500 text-sm mt-1">Showcase your professional work and contributions</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button 
                  onClick={handleAddProject} 
                  variant="outline"
                  className="!bg-white hover:!bg-gray-100 !text-black border-2 !border-black shadow-sm transition-all hover:scale-105 whitespace-nowrap font-semibold" 
                  style={{ color: 'black', backgroundColor: 'white', borderColor: 'black' }}
                  aria-label="Add new project"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="text-black font-semibold">Add Project</span>
                </Button>
                <Button 
                  onClick={handleAddCaseStudy} 
                  className="!bg-black hover:!bg-gray-900 !text-white font-semibold shadow-md hover:shadow-lg transition-all hover:scale-105 whitespace-nowrap border-0" 
                  style={{ color: 'white', backgroundColor: 'black' }}
                  aria-label="Create case study"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="text-white font-semibold">Create Case Study</span>
                </Button>
              </div>
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
                className="w-full sm:w-auto px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="title-asc">A-Z</option>
                <option value="title-desc">Z-A</option>
              </select>
            </div>

            {projectsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                <div className="flex items-center gap-2">
                   <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleShareProfile}
                      className="hidden sm:flex items-center gap-2 h-9"
                   >
                    <Share2 className="w-4 h-4" />
                    <span>Share Profile</span>
                  </Button>
                  
                  <Button variant="outline" size="icon" className="h-9 w-9">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                              disabled={deletingProjectId === project.id}
                            >
                              {deletingProjectId === project.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
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
        </motion.div>
      )}
    </AnimatePresence>

          {/* Endorsements Tab */}
          <AnimatePresence mode="wait">
            {activeTab === 'endorsements' && (
              <motion.div
                key="endorsements"
                initial={reducedMotion ? undefined : { opacity: 0, x: 20 }}
                animate={reducedMotion ? undefined : { opacity: 1, x: 0 }}
                exit={reducedMotion ? undefined : { opacity: 0, x: -20 }}
                transition={reducedMotion ? undefined : { duration: 0.2 }}
              >
                <TabsContent value="endorsements" className="space-y-4 sm:space-y-6 overflow-x-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Endorsements</h2>
                <p className="text-gray-500 text-sm mt-1">Validations from your professional network</p>
              </div>
              <Button onClick={handleRequestEndorsement} className="!bg-black hover:!bg-gray-900 !text-white font-semibold shadow-md hover:shadow-lg transition-all hover:scale-105 w-full sm:w-auto whitespace-nowrap border-0" style={{ color: 'white', backgroundColor: 'black' }} aria-label="Request new endorsement">
                <Plus className="h-4 w-4 mr-2" />
                <span className="text-white font-semibold">Request Endorsement</span>
              </Button>
            </div>

            {/* Status Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'All' },
                { value: 'requested', label: 'Sent' },
                { value: 'pending_professional', label: 'To Review' },
                { value: 'accepted', label: 'Verified' }
              ].map(filter => (
                <Button
                  key={filter.value}
                  variant={endorsementFilter === filter.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setEndorsementFilter(filter.value)}
                  className={endorsementFilter === filter.value ? 'bg-black text-white' : ''}
                >
                  {filter.label}
                </Button>
              ))}
            </div>

            {endorsementsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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
                          {endorsement.status === 'pending_professional' && (
                            <Badge className="bg-yellow-50 text-yellow-600 border-yellow-100 hover:bg-yellow-100">
                              Review Needed
                            </Badge>
                          )}
                          {endorsement.status === 'requested' && (
                            <Badge className="bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100">
                              Request Sent
                            </Badge>
                          )}
                          {endorsement.status === 'rejected' && (
                            <Badge className="bg-red-50 text-red-600 border-red-100 hover:bg-red-100">
                              Rejected
                            </Badge>
                          )}
                        </div>
                        
                        <div className="mb-6 flex-grow">
                          {endorsement.status === 'requested' ? (
                            <p className="text-gray-400 italic text-sm">Waiting for response...</p>
                          ) : (
                            <p className="text-gray-700 italic leading-relaxed">"{endorsement.text}"</p>
                          )}
                        </div>
                        
                        <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                          <span className="text-xs text-gray-400 font-medium">{new Date(endorsement.date).toLocaleDateString()}</span>
                          
                          <div className="flex gap-2">
                            {endorsement.status === 'pending_professional' ? (
                              <>
                                <Button 
                                  size="sm" 
                                  className="bg-black hover:bg-gray-800 text-white h-8 px-3"
                                  onClick={() => handleRespondToEndorsement(endorsement.id, 'accept')}
                                  disabled={respondingEndorsementId === endorsement.id}
                                >
                                  {respondingEndorsementId === endorsement.id ? (
                                    <>
                                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                                      Processing...
                                    </>
                                  ) : (
                                    <>
                                      <Check className="h-3.5 w-3.5 mr-1.5" />
                                      Accept
                                    </>
                                  )}
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="border-gray-200 text-red-600 hover:bg-red-50 h-8 px-3"
                                  onClick={() => handleRespondToEndorsement(endorsement.id, 'reject')}
                                  disabled={respondingEndorsementId === endorsement.id}
                                >
                                  {respondingEndorsementId === endorsement.id ? (
                                    <>
                                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                                      Processing...
                                    </>
                                  ) : (
                                    <>
                                      <X className="h-3.5 w-3.5 mr-1.5" />
                                      Reject
                                    </>
                                  )}
                                </Button>
                              </>
                            ) : (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-gray-400 hover:text-red-600 hover:bg-red-50 h-8 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleDeleteEndorsement(endorsement.id)}
                                disabled={deletingEndorsementId === endorsement.id}
                              >
                                {deletingEndorsementId === endorsement.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
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
        </motion.div>
      )}

      {activeTab === 'inquiries' && (
        <motion.div
          key="inquiries"
          initial={reducedMotion ? undefined : { opacity: 0, x: 20 }}
          animate={reducedMotion ? undefined : { opacity: 1, x: 0 }}
          exit={reducedMotion ? undefined : { opacity: 0, x: -20 }}
          transition={reducedMotion ? undefined : { duration: 0.2 }}
        >
          <TabsContent value="inquiries" className="space-y-6">
             <LeadsWidget 
               professionalId={userProfile?.id || userProfile?.user_id} 
               currentPin={phonePin} 
             />
          </TabsContent>
        </motion.div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <motion.div
          key="analytics"
          initial={reducedMotion ? undefined : { opacity: 0, x: 20 }}
          animate={reducedMotion ? undefined : { opacity: 1, x: 0 }}
          exit={reducedMotion ? undefined : { opacity: 0, x: -20 }}
          transition={reducedMotion ? undefined : { duration: 0.2 }}
        >
          <TabsContent value="analytics" className="space-y-6">
            {/* Portfolio Analytics Overview */}
            <PortfolioAnalytics
              stats={{
                totalViews: stats.profileViews,
                totalProjects: projects.length,
                featuredProjects: projects.filter((p: any) => p.featured || p.is_featured).length,
                totalEngagement: stats.apiCalls + stats.pinUsage,
                topProject: {
                  title: projects[0]?.title || projects[0]?.name || 'No projects yet',
                  views: projects[0]?.view_count || 0,
                },
                recentViews: [
                  { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), count: 12 },
                  { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), count: 19 },
                  { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), count: 8 },
                  { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), count: 24 },
                  { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), count: 16 },
                  { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), count: 21 },
                  { date: new Date().toISOString(), count: 15 },
                ],
              }}
            />

            {/* Two Column Layout for Intelligence Features */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Portfolio Health Score */}
              <PortfolioHealth
                metrics={{
                  hasProjects: projects.length > 0,
                  projectCount: projects.length,
                  hasFeaturedProjects: projects.some((p: any) => p.featured || p.is_featured),
                  hasDescription: !!userProfile?.bio,
                  hasSkills: (userProfile?.skills?.length || 0) > 0,
                  skillCount: userProfile?.skills?.length || 0,
                  hasProfileImage: !!userProfile?.avatar_url,
                  hasContact: !!userProfile?.email,
                  hasLinks: !!userProfile?.linkedin_url || !!userProfile?.github_url,
                  projectsWithImages: projects.filter((p: any) => p.image_url || p.cover_image || p.featured_image_url).length,
                  projectsWithDescriptions: projects.filter((p: any) => p.description).length,
                }}
              />

              {/* Skills Gap Analysis */}
              <SkillsGap
                userSkills={userProfile?.skills || []}
              />
            </div>

            {/* Social Share */}
            <SocialShare
              portfolioUrl={`${window.location.origin}/profile/${userProfile?.id || userProfile?.user_id}`}
              userName={userProfile?.full_name || 'Professional'}
              userTitle={userProfile?.job_title || userProfile?.role || 'Professional'}
            />
          </TabsContent>
        </motion.div>
      )}

    </AnimatePresence>
  </Tabs>
</div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div 
              initial={reducedMotion ? undefined : { opacity: 0, x: 20 }}
              animate={reducedMotion ? undefined : { opacity: 1, x: 0 }}
              transition={reducedMotion ? undefined : { delay: 0.1 }}
            >
              <PINGenerationCard 
                currentPin={phonePin || undefined}
                onGenerateWithPhone={() => handleGeneratePin(true)}
                onGenerateRandom={() => handleGeneratePin(false)}
                onCopyPin={() => {
                  if (phonePin) {
                    navigator.clipboard.writeText(phonePin);
                    toast.success('PIN copied to clipboard');
                  }
                }}
                onSharePin={(platform) => {
                  if (phonePin) {
                    if (navigator.share) {
                      navigator.share({
                        title: 'My Professional PIN',
                        text: `Connect with me using my GidiPIN PIN: ${phonePin}`,
                        url: window.location.href
                      });
                    } else {
                      navigator.clipboard.writeText(phonePin);
                      toast.success('PIN copied to clipboard');
                    }
                  }
                }}
                pinVisible={pinVisible}
                onTogglePinVisibility={() => setPinVisible(!pinVisible)}
              />
            </motion.div>
            <motion.div initial={reducedMotion ? undefined : { opacity: 0, x: 20 }} animate={reducedMotion ? undefined : { opacity: 1, x: 0 }} transition={reducedMotion ? undefined : { delay: 0.2 }}>
              <ProfileCompletionWidget 
                percentage={profileCompletion} 
                checklist={[
                  {
                    id: 'email_verified',
                    label: 'Email verification',
                    completed: !!((userProfile as any)?.email_verified)
                  },
                  {
                    id: 'pin_generated',
                    label: 'PIN generated',
                    completed: !!(phonePin && phonePin !== 'Loading...')
                  },
                  {
                    id: 'profile_picture',
                    label: 'Profile picture',
                    completed: !!((userProfile as any)?.profile_picture_url)
                  },
                  {
                    id: 'work_experience',
                    label: 'Work experience',
                    completed: !!((userProfile as any)?.work_experience && (userProfile as any)?.work_experience?.length > 0)
                  },
                  {
                    id: 'skills',
                    label: 'Skills & tools',
                    completed: !!((userProfile as any)?.skills && (userProfile as any)?.skills?.length > 0)
                  }
                ]} 
                onItemClick={(itemId) => {
                  if (itemId === 'email_verified' || itemId === 'profile_picture' || itemId === 'work_experience' || itemId === 'skills') {
                    // Navigate to identity management
                    window.location.href = '/identity';
                  } else if (itemId === 'pin_generated') {
                    // Trigger PIN generation
                    handleGeneratePin(true);
                  }
                }} 
              />
            </motion.div>
            <motion.div initial={reducedMotion ? undefined : { opacity: 0, x: 20 }} animate={reducedMotion ? undefined : { opacity: 1, x: 0 }} transition={reducedMotion ? undefined : { delay: 0.3 }}>
              <ActivityFeed activities={notifications.length > 0 ? notifications.map((n, i) => ({ type: (n.type === 'success' ? 'verification' : 'view'), text: n.text })) : [{ type: 'verification', text: 'Account Created' }]} />
            </motion.div>
          </div>
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
      <EndorsementRequestForm
        open={showEndorsementModal}
        onOpenChange={setShowEndorsementModal}
        onSubmit={async (data) => {
          setEndorsementSaving(true);
          try {
            const result = await requestEndorsementViaServer(data as any);
            if (result.success) {
              if (result.error) {
                toast.warning('Request saved, but email failed: ' + result.error);
              } else {
                toast.success('Endorsement request sent successfully!');
              }
              await fetchEndorsements();
              await fetchStats();
              if (result.endorsement) {
                await ActivityTracker.endorsementRequested(data.endorser_name);
              }
            } else {
              toast.error(result.error || 'Failed to request endorsement');
            }
          } catch (error) {
            console.error('Error requesting endorsement:', error);
            toast.error('Error requesting endorsement');
          } finally {
            setEndorsementSaving(false);
          }
        }}
        isLoading={endorsementSaving}
      />
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

      {/* Notification Center */}
      <NotificationCenter
        isOpen={notificationCenterOpen}
        onClose={() => setNotificationCenterOpen(false)}
        notifications={realTimeNotifications}
        onNotificationClick={(notification) => {
          console.log('Notification clicked:', notification);
          toast.success('Notification opened');
        }}
        onMarkAsRead={(id) => {
          setRealTimeNotifications(prev => 
            prev.map(n => n.id === id ? { ...n, isNew: false } : n)
          );
        }}
      />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={(id) => setToasts(prev => prev.filter(t => t.id !== id))} position="bottom-right" />
      <CaseStudyForm open={showCaseStudyModal} onOpenChange={setShowCaseStudyModal} onSubmit={handleCaseStudySubmit} userId={userProfile?.user_id || ''} isLoading={false} caseStudy={null} />
      
      {/* Share Profile Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle>Share Your Profile</DialogTitle>
            <DialogDescription>
              Share your digital business card or copy your unique profile link.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 flex justify-center w-full">
             <DigitalBusinessCard userProfile={userProfile} pin={phonePin} />
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Onboarding Modals */}
      <WelcomeModal
        isOpen={showWelcome}
        onClose={closeWelcome}
        onGetStarted={completeWelcome}
        userName={userProfile?.full_name?.split(' ')[0]}
      />

      <NotificationPermissionModal
        isOpen={showNotificationPermission}
        onClose={closeNotification}
        onAllow={handleNotificationAllow}
        onDeny={handleNotificationDeny}
      />

      

      
      <ResumeGenerator 
        isOpen={showResumeModal} 
        onClose={() => setShowResumeModal(false)} 
        profile={userProfile} 
      />

      {/* Product Walkthrough Tour */}
      <ProductTour
        steps={professionalDashboardTour}
        onComplete={() => {
          console.log('✅ Product tour completed!');
          trackEvent('product_tour_completed', { tour: 'professional-dashboard' });
        }}
        onSkip={() => {
          console.log('⏩ Product tour skipped');
          trackEvent('product_tour_skipped', { tour: 'professional-dashboard' });
        }}
        storageKey="professional-dashboard-tour-v1"
      />

      {/* Dev Tool: Restart Tour (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <button
          onClick={() => {
            localStorage.removeItem('professional-dashboard-tour-v1');
            window.location.reload();
          }}
          className="fixed bottom-20 right-4 bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg text-sm hover:bg-blue-700 transition-colors z-50 flex items-center gap-2"
          title="Restart Product Tour (Dev Only)"
        >
          📖 Restart Tour
        </button>
      )}

      {/* Add Featured Item Modal */}
      <AddFeaturedItemModal
        isOpen={showAddFeaturedModal}
        onClose={() => setShowAddFeaturedModal(false)}
        onAdd={async (item) => {
          if (!userId) return;
          await addFeaturedItem(userId, {
            itemType: 'custom',
            customTitle: item.customTitle,
            customDescription: item.customDescription,
            customLink: item.customLink,
            customImage: item.customImage
          });
        }}
      />

      {/* Add/Edit Tech Skill Modal */}
      <AddTechSkillModal
        isOpen={showAddSkillModal}
        onClose={() => {
          setShowAddSkillModal(false);
          setEditingSkill(null);
        }}
        onSave={async (skill) => {
          if (!userId) return;
          
          if (editingSkill) {
            await updateTechSkill(editingSkill.id, skill);
          } else {
            await addTechSkill(userId, skill);
          }
        }}
        editingSkill={editingSkill}
      />

      {/* Featured Items Modal */}
      <AddFeaturedItemModal
        isOpen={showAddFeaturedModal}
        onClose={() => setShowAddFeaturedModal(false)}
        onAdd={async (item) => {
          if (!userId) return;
          await addFeaturedItem(userId, item);
          setFeaturedRefresh(prev => prev + 1); // Trigger auto-refresh!
        }}
      />

      {/* Case Study Creator Modal */}
      <CaseStudyCreator
        isOpen={showCaseStudyCreator}
        onClose={() => setShowCaseStudyCreator(false)}
        onSave={async (caseStudy) => {
          if (!userId) return;
          await createCaseStudy(userId, caseStudy);
          setCaseStudyRefresh(prev => prev + 1); // Auto-refresh!
        }}
      />

      {/* Case Study Viewer */}
      <CaseStudyViewer
        project={viewingProject}
        open={!!viewingProject}
        onClose={() => setViewingProject(null)}
      />

      {/* Engineering Project Creator Modal */}
      <ProjectCreator
        isOpen={showProjectCreator}
        onClose={() => setShowProjectCreator(false)}
        onSave={async (project) => {
          if (!userId) return;
          await createProject(userId, project);
          setProjectRefresh(prev => prev + 1); // Auto-refresh!
        }}
      />

      </div>
      </ErrorBoundary>
    </div>
  );
};
