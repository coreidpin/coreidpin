import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner@2.0.3';
import { LandingPage } from './components/LandingPage';
import { OurStoryPage } from './components/OurStoryPage';
import { HowItWorksPage } from './components/HowItWorksPage';
import { PlaceholderPage } from './components/PlaceholderPage';
import { OnboardingFlow } from './components/OnboardingFlow';
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
import { api } from './utils/api';
import { CheckCircle, Globe, Shield, Award, Users, Building, GraduationCap } from 'lucide-react';
import PasswordResetDialog from './components/PasswordResetDialog';
import { EmailVerificationGate } from './components/EmailVerificationGate';

type UserType = 'landing' | 'employer' | 'professional' | 'university';
type AppState = 'landing' | 'our-story' | 'how-it-works' | 'trust-safety' | 'employers' | 'professionals' | 'universities' | 'help' | 'contact' | 'docs' | 'terms' | 'privacy' | 'cookies' | 'gdpr' | 'onboarding' | 'dashboard' | 'login' | 'admin' | 'solutions';

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

  // Check for existing session on mount and handle OAuth callback
  useEffect(() => {
    // Ensure CSRF token exists (double-submit token stored client-side)
    try {
      if (!localStorage.getItem('csrfToken')) {
        const bytes = new Uint8Array(16);
        (window.crypto || ({} as any)).getRandomValues?.(bytes);
        const token = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('') || Math.random().toString(36).slice(2);
        localStorage.setItem('csrfToken', token);
      }
    } catch {}

    const checkSession = async () => {
      // Check for OAuth callback
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // We have a session from OAuth or existing login
        const userType = session.user.user_metadata?.userType || localStorage.getItem('pendingUserType') || 'professional';
        
        // Update user metadata if it was set during OAuth
        if (!session.user.user_metadata?.userType && localStorage.getItem('pendingUserType')) {
          await supabase.auth.updateUser({
            data: { userType }
          });
        }
        
        // Store session data
        localStorage.setItem('accessToken', session.access_token);
        localStorage.setItem('userId', session.user.id);
        localStorage.setItem('userType', userType);
        localStorage.removeItem('pendingUserType');
        
        setIsAuthenticated(true);
        setCurrentView(userType as UserType);
        setUserData(session.user);
        
        // Check if user has completed onboarding
        const hasCompletedOnboarding = session.user.user_metadata?.hasCompletedOnboarding;
        
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
        // Check localStorage for existing session
        const accessToken = localStorage.getItem('accessToken');
        const userId = localStorage.getItem('userId');
        const userType = localStorage.getItem('userType');

        if (accessToken && userId && userType) {
          setIsAuthenticated(true);
          setCurrentView(userType as UserType);
          setAppState('dashboard');
        }
      }
    };

    checkSession();

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
                  await api.resendVerificationLink(email!);
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
    setCurrentView(userType);
    setAppState('onboarding');
  };

  const handleNavigate = (page: string) => {
    const validPages: AppState[] = [
      'landing', 'our-story', 'how-it-works', 'trust-safety', 
      'employers', 'professionals', 'universities', 'help', 'contact', 'docs',
      'terms', 'privacy', 'cookies', 'gdpr', 'login', 'dashboard', 'admin', 'solutions'
    ];
    
    if (page === 'login') {
      setShowLoginDialog(true);
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
    
    // Store session data
    if (user?.id) {
      localStorage.setItem('userId', user.id);
    }
    
    // Check if user has completed onboarding
    const hasCompletedOnboarding = user?.user_metadata?.hasCompletedOnboarding;
    
    if (!hasCompletedOnboarding) {
      // New user - go to onboarding
      setAppState('onboarding');
      toast.success('Welcome! Let\'s complete your profile.');
    } else {
      // Returning user - go to dashboard
      setAppState('dashboard');
      setShowWelcomeToast(true);
    }
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
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
    
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userType');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminSession');
    setIsAuthenticated(false);
    setUserData(null);
    setAppState('landing');
    setCurrentView('landing');
    toast.success('Signed out successfully');
  };

  const handlePasswordResetConfirm = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    toast.success('Password updated. Please sign in with your new password.');
    setShowPasswordResetDialog(false);
    await supabase.auth.signOut();
  };

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
        <div className="min-h-screen bg-background flex flex-col">
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
        <div className="min-h-screen bg-background flex flex-col">
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
        <div className="min-h-screen bg-white flex flex-col">
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

  // Handle all other static pages with placeholders
  if (['trust-safety', 'help', 'contact', 'docs'].includes(appState)) {
    const pageConfig = {
      'trust-safety': {
        title: 'Trust & Safety',
        description: 'Learn about our comprehensive security measures and compliance protocols that protect all users on the CoreID platform.'
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
        <div className="min-h-screen bg-background flex flex-col">
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
        <OnboardingFlow 
          userType={currentView as Exclude<UserType, 'landing'>}
          onComplete={handleOnboardingComplete}
          onBack={() => setAppState('landing')}
        />
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
            isAuthenticated={true}
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

  return (
    <>
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar 
          currentPage="dashboard"
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          isAuthenticated={true}
          userType={currentView}
        />

        {/* Dashboard Content */}
        <main className="flex-1 container mx-auto px-4 py-6 sm:py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {/* Email verification gate: block dashboards until email is confirmed */}
            {isAuthenticated && currentView !== 'landing' && userData && !userData?.email_confirmed_at ? (
              <EmailVerificationGate
                email={userData?.email}
                userId={userData?.id}
                accessToken={localStorage.getItem('accessToken') || ''}
                onVerified={async () => {
                  try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session?.user) {
                      setUserData(session.user);
                      setShowWelcomeToast(true);
                      try {
                        await api.updateProfile(session.user.id, session.access_token, { verificationStatus: 'verified' });
                      } catch {}
                    }
                  } catch {}
                }}
              />
            ) : (
              {currentView === 'employer' && <EmployerDashboard />}
              {currentView === 'professional' && <ProfessionalDashboard />}
              {currentView === 'university' && <UniversityDashboard />}
            )}
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