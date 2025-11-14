import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import { LandingPage } from './components/LandingPage';
import { OurStoryPage } from './components/OurStoryPage';
import { HowItWorksPage } from './components/HowItWorksPage';
import { PlaceholderPage } from './components/PlaceholderPage';
import UnifiedFlow from './components/UnifiedFlow.tsx';
import { EmployerDashboard } from './components/EmployerDashboard';
import { ProfessionalDashboard } from './components/ProfessionalDashboard';
import { UniversityDashboard } from './components/UniversityDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { TermsOfService } from './components/TermsOfService';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { CookiesPolicy } from './components/CookiesPolicy';
import { GDPRCompliance } from './components/GDPRCompliance';
import { LoginDialog } from './components/LoginDialog';
import { AdminLoginDialog } from './components/AdminLoginDialog';
import { WelcomeToast } from './components/WelcomeToast';
import { SolutionsPage } from './components/SolutionsPage';
import { supabase } from './utils/supabase/client';
import { initAuth, isAuthenticated as authIsAuthed, onAuthChange } from './utils/auth';
import { api } from './utils/api';
import { 
  restoreSession, 
  setupAutoRefresh, 
  setupCrossTabSync, 
  updateActivity,
  saveSessionState,
  SessionState
} from './utils/session';
import { CheckCircle, Globe, Shield, Award, Users, Building, GraduationCap } from 'lucide-react';
import PasswordResetDialog from './components/PasswordResetDialog';
import { PublicPINPage } from './components/PublicPINPage';
import LoginPage from './components/LoginPage';
import { AuthVerifyEmail } from './components/AuthVerifyEmail';
import MonitoringPage from './pages/Monitoring';

type UserType = 'landing' | 'employer' | 'professional' | 'university';
type AppState = 'landing' | 'our-story' | 'how-it-works' | 'trust-safety' | 'employers' | 'professionals' | 'universities' | 'help' | 'contact' | 'docs' | 'terms' | 'privacy' | 'cookies' | 'gdpr' | 'onboarding' | 'dashboard' | 'login' | 'admin' | 'solutions' | 'public-pin' | 'verify-email' | 'monitoring' | 'admin-monitoring';

export default function App() {
  const [currentView, setCurrentView] = useState<UserType>('landing');
  const [appState, setAppState] = useState<AppState>('landing');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showAdminLoginDialog, setShowAdminLoginDialog] = useState(false);
  const [showWelcomeToast, setShowWelcomeToast] = useState(false);
  const [showPasswordResetDialog, setShowPasswordResetDialog] = useState(false);
  const [passwordRecoveryEmail, setPasswordRecoveryEmail] = useState<string | null>(null);
  const [viewingPinNumber, setViewingPinNumber] = useState<string | null>(null);

  // Check for existing session on mount and handle OAuth callback
  useEffect(() => {
    // Check for public PIN route first
    const path = window.location.pathname;
    const pinMatch = path.match(/^\/pin\/([A-Z0-9-]+)$/i);
    if (pinMatch) {
      const pinNumber = pinMatch[1];
      console.log('Detected public PIN route:', pinNumber);
      setViewingPinNumber(pinNumber);
      setAppState('public-pin');
      return; // Skip session check for public pages
    }

    // Basic path-based routing on initial load
    // Support both lowercase and capitalized 'Registeration' per requirement
    const normalized = path.toLowerCase();
    if (normalized === '/login') {
      setAppState('login');
    } else if (normalized === '/dashboard') {
      setAppState('dashboard');
    } else if (normalized.startsWith('/auth/verify-email')) {
      setAppState('verify-email');
    } else if (normalized === '/registeration' || normalized === '/registration' || normalized === '/get-started') {
      try {
        const persisted = sessionStorage.getItem('selectedUserType');
        setCurrentView((persisted as UserType) || 'professional');
      } catch {
        setCurrentView('professional');
      }
      setAppState('onboarding');
    }

    // Ensure CSRF token exists (double-submit token stored client-side)
    try {
      if (!localStorage.getItem('csrfToken')) {
        const bytes = new Uint8Array(16);
        (window.crypto || ({} as any)).getRandomValues?.(bytes);
        const token = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('') || Math.random().toString(36).slice(2);
        localStorage.setItem('csrfToken', token);
      }
    } catch {}

    initAuth();
    onAuthChange((authed) => {
      setIsAuthenticated(authed);
      if (authed) setAppState('dashboard');
    });
    const checkSession = async () => {
      // Check for OAuth callback
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session || authIsAuthed()) {
        // We have a session from OAuth or existing login
        const userType = (session?.user.user_metadata?.userType) || localStorage.getItem('pendingUserType') || 'professional';
        
        // Update user metadata if it was set during OAuth
        if (session && !session.user.user_metadata?.userType && localStorage.getItem('pendingUserType')) {
          await supabase.auth.updateUser({
            data: { userType }
          });
        }
        
        // Store session data (Phase 3 session management)
        if (session) {
          saveSessionState({
            accessToken: session.access_token,
            refreshToken: session.refresh_token,
            userId: session.user.id,
            userType: userType as 'employer' | 'professional' | 'university',
            expiresAt: Date.now() + (session.expires_in || 3600) * 1000
          });
        }
        
        localStorage.removeItem('pendingUserType');
        
        setIsAuthenticated(true);
        setCurrentView(userType as UserType);
        if (session) setUserData(session.user);
        
        // Check if user has completed onboarding
        const hasCompletedOnboarding = session?.user?.user_metadata?.hasCompletedOnboarding;
        
        if (!hasCompletedOnboarding) {
          // First time OAuth user - go to onboarding
          setAppState('onboarding');
          toast.success('Welcome! Let\'s complete your profile.');
        } else {
          // Returning user - go to dashboard
          setAppState('dashboard');
          setShowWelcomeToast(true);
        }
      } else {
        // No Supabase session - check if localStorage has stale data
        const accessToken = localStorage.getItem('accessToken');
        const userId = localStorage.getItem('userId');
        const userType = localStorage.getItem('userType');

        if (accessToken && userId && userType) {
          // Validate the token with Supabase
          const { data: { user }, error } = await supabase.auth.getUser(accessToken);
          
          if (user && !error) {
            // Valid session - restore it
            setIsAuthenticated(true);
            setCurrentView(userType as UserType);
            setUserData(user);
            setAppState('dashboard');
          } else {
            // Invalid/expired token - clear localStorage
            console.log('Invalid session, clearing localStorage');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('userId');
            localStorage.removeItem('userType');
            setIsAuthenticated(false);
            setAppState('landing');
          }
        }
      }
    };

    checkSession();

    // Initialize session management (Phase 3)
    let cleanupAutoRefresh: (() => void) | null = null;
    let cleanupCrossTab: (() => void) | null = null;

    const initializeSessionManagement = async () => {
      // Restore session from localStorage if available
      const restoredSession = await restoreSession();
      
      if (restoredSession) {
        console.log('Session restored from localStorage');
        setIsAuthenticated(true);
        setCurrentView(restoredSession.userType as UserType);
        setAppState('dashboard');
        
        // Setup auto-refresh interval (30 minutes)
        cleanupAutoRefresh = setupAutoRefresh();
        
        // Setup cross-tab synchronization
        cleanupCrossTab = setupCrossTabSync((session: SessionState | null) => {
          if (!session) {
            // Session cleared in another tab
            console.log('Session cleared in another tab');
            setIsAuthenticated(false);
            setAppState('landing');
            setUserData(null);
          } else {
            // Session updated in another tab
            console.log('Session updated in another tab');
            setIsAuthenticated(true);
            setCurrentView(session.userType as UserType);
          }
        });

        // Update activity on user interaction
        const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
        const handleActivity = () => updateActivity();
        activityEvents.forEach(event => {
          window.addEventListener(event, handleActivity, { passive: true });
        });
      }
    };

    initializeSessionManagement();

    try {
      const pathNow = typeof window !== 'undefined' ? window.location.pathname.toLowerCase() : '';
      if (!pathNow.startsWith('/auth/verify-email')) {
        const query = typeof window !== 'undefined' ? window.location.search || '' : '';
        const queryParams = new URLSearchParams(query);
        const token = queryParams.get('token');
        if (token) {
          (async () => {
            try {
              await api.verifyLinkToken(token);
              toast.success('Email verified');
            } catch (e: any) {
              toast.error(e?.message || 'Link verification failed');
            } finally {
              try {
                const url = new URL(window.location.href);
                url.searchParams.delete('token');
                window.history.replaceState(null, '', url.toString());
              } catch {}
            }
          })();
        }
      }
    } catch {}

    // Cleanup function for session management
    return () => {
      if (cleanupAutoRefresh) cleanupAutoRefresh();
      if (cleanupCrossTab) cleanupCrossTab();
      
      const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
      const handleActivity = () => updateActivity();
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };

    // Parse verification errors from Supabase redirect and offer resend
    const parseVerificationError = () => {
      try {
        const hash = typeof window !== 'undefined' ? window.location.hash || '' : '';
        const query = typeof window !== 'undefined' ? window.location.search || '' : '';
        const hashParams = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : '');
        const queryParams = new URLSearchParams(query);

        const error = hashParams.get('error') || hashParams.get('error_code') || queryParams.get('error') || queryParams.get('error_code');
        const description = hashParams.get('error_description') || queryParams.get('error_description');

        if (error || description) {
          const message = (description || error || 'Verification error').replace(/_/g, ' ');

          // Try to determine the email to resend to
          let email: string | null = null;
          try {
            email = localStorage.getItem('registrationEmail');
            if (!email) {
              const pending = JSON.parse(localStorage.getItem('pendingRegistrationData') || '{}');
              email = pending?.email || pending?.contactEmail || null;
            }
          } catch {}

          toast.error(`Email verification issue: ${message}`, {
            description: email ? 'You can resend the verification email.' : 'Please enter your email on the login page to resend.',
            action: email ? {
              label: 'Resend Email',
              onClick: async () => {
                try {
                  await api.sendVerificationEmail(email!);
                  toast.success('Verification email resent');
                } catch (err: any) {
                  toast.error(err?.message || 'Failed to resend verification email');
                }
              }
            } : undefined
          });

          // Clean error params from URL after notifying
          try {
            const url = new URL(window.location.href);
            url.hash = '';
            url.searchParams.delete('error');
            url.searchParams.delete('error_code');
            url.searchParams.delete('error_description');
            window.history.replaceState(null, '', url.toString());
          } catch {}
        }
      } catch {}
    };

    parseVerificationError();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const userType = session.user.user_metadata?.userType || 'professional';
        localStorage.setItem('accessToken', session.access_token);
        localStorage.setItem('userId', session.user.id);
        localStorage.setItem('userType', userType);

        // If email is confirmed, sync verification status to server profile (KV store)
        try {
          if (session.user.email_confirmed_at) {
            await api.updateProfile(session.user.id, session.access_token, { verificationStatus: 'verified' });
            toast.success('Email verified');
          }
        } catch (syncErr) {
          console.warn('Failed to sync verification status:', syncErr);
        }
      } else if (event === 'PASSWORD_RECOVERY') {
        // Supabase redirects after reset email; show dialog to set new password
        setPasswordRecoveryEmail(session?.user?.email ?? null);
        setShowPasswordResetDialog(true);
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('userType');
        setIsAuthenticated(false);
        setUserData(null);
        setAppState('landing');
        setCurrentView('landing');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogin = (userType: UserType) => {
    try {
      sessionStorage.setItem('selectedUserType', userType);
      localStorage.setItem('pendingUserType', userType);
      setCurrentView(userType);
      setAppState('onboarding');
      try {
        const url = new URL(window.location.href);
        url.pathname = '/get-started';
        window.history.pushState(null, '', url.toString());
      } catch (navErr) {
        console.error('Navigation URL update failed:', navErr);
      }
    } catch (err) {
      console.error('Navigation to Get Started failed:', err);
      toast.error('Navigation failed. Please try again.', {
        action: {
          label: 'Retry',
          onClick: () => handleLogin(userType)
        }
      });
    }
  };

  useEffect(() => {
    // Listen for custom navigation events from child components
    const handleCustomNavigate = (event: CustomEvent) => {
      const page = event.detail;
      if (page && validPages.includes(page)) {
        handleNavigate(page);
      }
    };

    window.addEventListener('navigate', handleCustomNavigate as EventListener);
    
    return () => {
      window.removeEventListener('navigate', handleCustomNavigate as EventListener);
    };
  }, []);

  const handleNavigate = (page: AppState | string) => {
    const validPages: AppState[] = [
      'landing', 'our-story', 'how-it-works', 'trust-safety', 
      'employers', 'professionals', 'universities', 'help', 'contact', 'docs',
      'terms', 'privacy', 'cookies', 'gdpr', 'login', 'dashboard', 'admin', 'solutions',
      'monitoring', 'admin-monitoring'
    ];
    
    // Handle public PIN navigation
    if (page.startsWith('pin/')) {
      const pinNumber = page.replace('pin/', '');
      setViewingPinNumber(pinNumber);
      setAppState('public-pin');
      try {
        const url = new URL(window.location.href);
        url.pathname = `/pin/${pinNumber}`;
        window.history.pushState(null, '', url.toString());
      } catch {}
      return;
    }
    
    if (page === 'login') {
      setShowLoginDialog(false);
      setAppState('login');
      try {
        const url = new URL(window.location.href);
        url.pathname = '/login';
        window.history.pushState(null, '', url.toString());
      } catch {}
      return;
    }
    
    if (page === 'admin') {
      // Check if already admin
      const isAdmin = localStorage.getItem('isAdmin') === 'true';
      if (isAdmin) {
        setAppState('admin');
      } else {
        setShowAdminLoginDialog(true);
      }
      return;
    }
    
    if (page === 'dashboard' && isAuthenticated) {
      setAppState('dashboard');
      return;
    }
    
    if (validPages.includes(page as AppState)) {
      setAppState(page as AppState);
    } else {
      setAppState('landing');
    }
  };

  const handleAdminLoginSuccess = () => {
    setAppState('admin');
  };

  const handleLoginSuccess = async (userType: 'employer' | 'professional' | 'university', user: any) => {
    setIsAuthenticated(true);
    setCurrentView(userType);
    setUserData(user);
    setShowLoginDialog(false);
    
    // Get the current Supabase session to persist (Phase 3)
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      saveSessionState({
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        userId: session.user.id,
        userType: userType,
        expiresAt: Date.now() + (session.expires_in || 3600) * 1000
      });
    }
    
    // Store legacy session data (for backwards compatibility)
    if (user?.id) {
      localStorage.setItem('userId', user.id);
    }
    
    // Always redirect to dashboard on successful login per requirements
    toast.success('You have successfully logged in');
    setAppState('dashboard');
    setShowWelcomeToast(true);
    try {
      const url = new URL(window.location.href);
      url.pathname = '/dashboard';
      window.history.pushState(null, '', url.toString());
    } catch {}
  };

  const handleOnboardingComplete = async () => {
    // Mark onboarding as complete
    try {
      await supabase.auth.updateUser({
        data: { hasCompletedOnboarding: true }
      });
    } catch (error) {
      console.error('Error updating onboarding status:', error);
    }
    
    // Reflect onboarding complete in public.profiles
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        await supabase.from('profiles').update({ onboarding_complete: true }).eq('user_id', user.id);
      }
    } catch (err) {
      console.error('Error syncing onboarding_complete to profiles:', err);
    }

    // Inject access token into URL for dashboard deep-linking
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || localStorage.getItem('accessToken');
      if (token && typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('token', token);
        url.searchParams.set('view', String(currentView));
        window.history.replaceState(null, '', url.toString());
      }
    } catch (err) {
      console.error('Error injecting token into URL:', err);
    }

    setIsAuthenticated(true);
    setAppState('dashboard');
    setShowWelcomeToast(true);
  };

  const handleLogout = async () => {
    try {
      // Sign out from Supabase first
      await supabase.auth.signOut();
      
      // Clear all session data (Phase 3 session management)
      const { clearSessionState } = await import('./utils/session');
      clearSessionState();
      
      // Clear legacy localStorage items
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('adminSession');
      
      // Reset state
      setIsAuthenticated(false);
      setUserData(null);
      setAppState('landing');
      setCurrentView('landing');
      
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      
      // Still clear everything even if Supabase signout fails
      const { clearSessionState } = await import('./utils/session');
      clearSessionState();
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('adminSession');
      
      setIsAuthenticated(false);
      setUserData(null);
      setAppState('landing');
      setCurrentView('landing');
      
      toast.error('Signed out (with errors)');
    }
  };

  const handlePasswordResetConfirm = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    toast.success('Password updated. Please sign in with your new password.');
    setShowPasswordResetDialog(false);
    await supabase.auth.signOut();
  };

  // Public PIN Page - No authentication required
  if (appState === 'public-pin' && viewingPinNumber) {
    return (
      <>
        <PublicPINPage pinNumber={viewingPinNumber} onNavigate={handleNavigate} />
        <Toaster position="top-right" />
      </>
    );
  }

  // Email Verification Page - Handles verification token from email link
  if (appState === 'verify-email') {
    return (
      <>
        <AuthVerifyEmail />
        <Toaster position="top-right" />
      </>
    );
  }

  if (appState === 'landing') {
    return (
      <>
        <LandingPage 
          onLogin={handleLogin} 
          onNavigate={handleNavigate}
          isAuthenticated={isAuthenticated}
          userType={currentView}
        />
        <LoginDialog
          open={showLoginDialog}
          onOpenChange={setShowLoginDialog}
          onLoginSuccess={handleLoginSuccess}
        />
        <PasswordResetDialog
          open={showPasswordResetDialog}
          email={passwordRecoveryEmail}
          onClose={() => setShowPasswordResetDialog(false)}
          onReset={handlePasswordResetConfirm}
        />
        <Toaster position="top-right" />
      </>
    );
  }

  if (appState === 'our-story') {
    return (
      <>
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0a0b0d' }}>
          <Navbar 
            currentPage="our-story"
            onNavigate={handleNavigate}
            onLogin={handleLogin}
            onLogout={handleLogout}
            isAuthenticated={isAuthenticated}
            userType={currentView}
          />
          <OurStoryPage onNavigate={handleNavigate} />
          <Footer onNavigate={handleNavigate} />
        </div>
        <LoginDialog
          open={showLoginDialog}
          onOpenChange={setShowLoginDialog}
          onLoginSuccess={handleLoginSuccess}
        />
        <Toaster position="top-right" />
      </>
    );
  }

  if (appState === 'how-it-works') {
    return (
      <>
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0a0b0d' }}>
          <Navbar 
            currentPage="how-it-works"
            onNavigate={handleNavigate}
            onLogin={handleLogin}
            onLogout={handleLogout}
            isAuthenticated={isAuthenticated}
            userType={currentView}
          />
          <HowItWorksPage onNavigate={handleNavigate} onLogin={handleLogin} />
          <Footer onNavigate={handleNavigate} />
        </div>
        <LoginDialog
          open={showLoginDialog}
          onOpenChange={setShowLoginDialog}
          onLoginSuccess={handleLoginSuccess}
        />
        <Toaster position="top-right" />
      </>
    );
  }

  // Handle legal pages
  if (appState === 'terms') {
    return (
      <>
        <div className="min-h-screen bg-background flex flex-col">
          <Navbar 
            currentPage="terms"
            onNavigate={handleNavigate}
            onLogin={handleLogin}
            onLogout={handleLogout}
            isAuthenticated={isAuthenticated}
            userType={currentView}
          />
          <TermsOfService />
          <Footer onNavigate={handleNavigate} />
        </div>
        <LoginDialog
          open={showLoginDialog}
          onOpenChange={setShowLoginDialog}
          onLoginSuccess={handleLoginSuccess}
        />
      </>
    );
  }

  if (appState === 'privacy') {
    return (
      <>
        <div className="min-h-screen bg-background flex flex-col">
          <Navbar 
            currentPage="privacy"
            onNavigate={handleNavigate}
            onLogin={handleLogin}
            onLogout={handleLogout}
            isAuthenticated={isAuthenticated}
            userType={currentView}
          />
          <PrivacyPolicy />
          <Footer onNavigate={handleNavigate} />
        </div>
        <LoginDialog
          open={showLoginDialog}
          onOpenChange={setShowLoginDialog}
          onLoginSuccess={handleLoginSuccess}
        />
      </>
    );
  }

  if (appState === 'cookies') {
    return (
      <>
        <div className="min-h-screen bg-background flex flex-col">
          <Navbar 
            currentPage="cookies"
            onNavigate={handleNavigate}
            onLogin={handleLogin}
            onLogout={handleLogout}
            isAuthenticated={isAuthenticated}
            userType={currentView}
          />
          <CookiesPolicy />
          <Footer onNavigate={handleNavigate} />
        </div>
        <LoginDialog
          open={showLoginDialog}
          onOpenChange={setShowLoginDialog}
          onLoginSuccess={handleLoginSuccess}
        />
      </>
    );
  }

  if (appState === 'gdpr') {
    return (
      <>
        <div className="min-h-screen bg-background flex flex-col">
          <Navbar 
            currentPage="gdpr"
            onNavigate={handleNavigate}
            onLogin={handleLogin}
            onLogout={handleLogout}
            isAuthenticated={isAuthenticated}
            userType={currentView}
          />
          <GDPRCompliance />
          <Footer onNavigate={handleNavigate} />
        </div>
        <LoginDialog
          open={showLoginDialog}
          onOpenChange={setShowLoginDialog}
          onLoginSuccess={handleLoginSuccess}
        />
      </>
    );
  }

  // Handle Solutions page with dedicated component
  if (['employers', 'professionals', 'universities'].includes(appState)) {
    return (
      <>
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0a0b0d' }}>
          <Navbar 
            currentPage={appState}
            onNavigate={handleNavigate}
            onLogin={handleLogin}
            onLogout={handleLogout}
            isAuthenticated={isAuthenticated}
            userType={currentView}
          />
          <SolutionsPage onNavigate={handleNavigate} onLogin={handleLogin} />
          <Footer onNavigate={handleNavigate} />
        </div>
        <LoginDialog
          open={showLoginDialog}
          onOpenChange={setShowLoginDialog}
          onLoginSuccess={handleLoginSuccess}
        />
        <Toaster position="top-right" />
      </>
    );
  }

  // Dedicated Login page route
  if (appState === 'login') {
    return (
      <>
        <div className="min-h-screen bg-[#0a0b0d] flex flex-col">
          <Navbar 
            currentPage="login"
            onNavigate={handleNavigate}
            onLogin={handleLogin}
            onLogout={handleLogout}
            isAuthenticated={isAuthenticated}
            userType={currentView}
          />
          <main className="flex-1 flex items-center justify-center py-16">
            <LoginPage onLoginSuccess={handleLoginSuccess} />
          </main>
          <Footer onNavigate={handleNavigate} />
        </div>
        <Toaster position="top-right" />
      </>
    );
  }

  // Handle all other static pages with placeholders
  if (['trust-safety', 'help', 'contact', 'docs'].includes(appState)) {
    const pageConfig = {
      'trust-safety': {
        title: 'Trust & Safety',
        description: 'Trust is the core of CoreID — it\'s in our name. We build infrastructure designed to protect users, secure data, and enable safe interactions. Your PIN belongs to you. Your data is never shared without explicit consent. You decide where your identity appears and who sees what. We use secure verification, encrypted storage, risk scoring, anomaly detection, and hashed identity attributes. CoreID is compliant with GDPR, NDPR, CCPA, and ISO security standards. Trust is not a feature — it\'s the foundation.'
      },
      'help': {
        title: 'Help Center',
        description: 'Find answers to common questions and get support for using the CoreID platform.'
      },
      'contact': {
        title: 'Contact Us',
        description: 'Get in touch with our team for partnerships, support, or general inquiries.'
      },
      'docs': {
        title: 'Documentation',
        description: 'Access technical documentation, API references, and integration guides for developers.'
      }
    };

    const config = pageConfig[appState as keyof typeof pageConfig];
    
    return (
      <>
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0a0b0d' }}>
          <Navbar 
            currentPage={appState}
            onNavigate={handleNavigate}
            onLogin={handleLogin}
            onLogout={handleLogout}
            isAuthenticated={isAuthenticated}
            userType={currentView}
          />
          <PlaceholderPage 
            title={config.title}
            description={config.description}
            onNavigate={handleNavigate}
          />
          <Footer onNavigate={handleNavigate} />
        </div>
        <LoginDialog
          open={showLoginDialog}
          onOpenChange={setShowLoginDialog}
          onLoginSuccess={handleLoginSuccess}
        />
      </>
    );
  }

  if (appState === 'onboarding') {
    return (
      <>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <UnifiedFlow 
            userType={currentView as Exclude<UserType, 'landing'>}
            onComplete={handleOnboardingComplete}
            onBack={() => setAppState('landing')}
          />
        </motion.div>
        <Toaster position="top-right" />
      </>
    );
  }

  if (appState === 'admin') {
    return (
      <>
        <div className="min-h-screen bg-background flex flex-col">
          <Navbar 
            currentPage="admin"
            onNavigate={handleNavigate}
            onLogout={handleLogout}
            isAuthenticated={isAuthenticated}
            userType={currentView}
          />
          <main className="flex-1 container mx-auto px-4 py-6 sm:py-8">
            <AdminDashboard />
          </main>
          <Footer onNavigate={handleNavigate} />
        </div>
        <Toaster position="top-right" />
      </>
    );
  }

  if (appState === 'monitoring') {
    return (
      <>
        <div className="min-h-screen bg-background flex flex-col">
          <Navbar 
            currentPage="monitoring"
            onNavigate={handleNavigate}
            onLogout={handleLogout}
            isAuthenticated={isAuthenticated}
            userType={currentView}
          />
          <main className="flex-1">
            <MonitoringPage />
          </main>
          <Footer onNavigate={handleNavigate} />
        </div>
        <Toaster position="top-right" />
      </>
    );
  }

  // Admin-only monitoring route
  if (appState === 'admin-monitoring') {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    if (!isAdmin) {
      setAppState('landing');
      return null;
    }
    return (
      <>
        <div className="min-h-screen bg-background flex flex-col">
          <Navbar 
            currentPage="admin-monitoring"
            onNavigate={handleNavigate}
            onLogout={handleLogout}
            isAuthenticated={isAuthenticated}
            userType={currentView}
          />
          <main className="flex-1">
            <MonitoringPage />
          </main>
          <Footer onNavigate={handleNavigate} />
        </div>
        <Toaster position="top-right" />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar 
          currentPage="dashboard"
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          isAuthenticated={isAuthenticated}
          userType={currentView}
        />

        {/* Dashboard Content */}
        <main className="flex-1 container mx-auto px-4 py-6 sm:py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {currentView === 'employer' && <EmployerDashboard />}
            {currentView === 'professional' && <ProfessionalDashboard />}
            {currentView === 'university' && <UniversityDashboard />}
          </motion.div>
        </main>

        <Footer onNavigate={handleNavigate} />
      </div>

      {/* Welcome Toast for first-time login */}
      {currentView !== 'landing' && (
        <WelcomeToast
          userType={currentView as 'employer' | 'professional' | 'university'}
          userName={userData?.user_metadata?.name}
          show={showWelcomeToast}
          onDismiss={() => setShowWelcomeToast(false)}
        />
      )}

      {/* Admin Login Dialog - Only show when explicitly requested */}
      {showAdminLoginDialog && (
        <AdminLoginDialog
          open={showAdminLoginDialog}
          onOpenChange={setShowAdminLoginDialog}
          onLoginSuccess={handleAdminLoginSuccess}
        />
      )}
      
      <Toaster position="top-right" />
    </>
  );
}
