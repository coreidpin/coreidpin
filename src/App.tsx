import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { AppRouter } from './components/Router';
import { LoginDialog } from './components/LoginDialog';
import { AdminLoginDialog } from './components/AdminLoginDialog';
import { WelcomeToast } from './components/WelcomeToast';
import PasswordResetDialog from './components/PasswordResetDialog';
import { VerificationSuccessModal } from './components/VerificationSuccessModal.tsx';
import { supabase } from './utils/supabase/client';
import { isAuthenticated as authIsAuthed } from './utils/auth';
import { api } from './utils/api';
import { 
  restoreSession, 
  setupAutoRefresh, 
  setupCrossTabSync, 
  updateActivity,
  saveSessionState,
  SessionState
} from './utils/session';

type UserType = 'landing' | 'employer' | 'professional' | 'university';

export default function App() {
  const [currentView, setCurrentView] = useState<UserType>('professional');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showAdminLoginDialog, setShowAdminLoginDialog] = useState(false);
  const [showWelcomeToast, setShowWelcomeToast] = useState(false);
  const [showPasswordResetDialog, setShowPasswordResetDialog] = useState(false);
  const [passwordRecoveryEmail, setPasswordRecoveryEmail] = useState<string | null>(null);
  const [showVerificationSuccess, setShowVerificationSuccess] = useState(false);

  // Check for existing session on mount and handle OAuth callback
  useEffect(() => {
    // Check authentication state
    const isAuth = localStorage.getItem('isAuthenticated') === 'true';
    const userType = localStorage.getItem('userType') || 'professional';
    
    if (isAuth) {
      setIsAuthenticated(true);
      setCurrentView(userType as UserType);
    }
    
    // Handle get-started route
    const path = window.location.pathname;
    if (path === '/get-started') {
      try {
        const persisted = sessionStorage.getItem('selectedUserType');
        setCurrentView((persisted as UserType) || 'professional');
      } catch {
        setCurrentView('professional');
      }
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

    // Skip initAuth to avoid 401 errors
    // onAuthChange((authed) => {
    //   setIsAuthenticated(authed);
    //   if (authed) setAppState('dashboard');
    // });
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
      } else {
        // Simple localStorage-based authentication check
        const isAuth = localStorage.getItem('isAuthenticated') === 'true';
        const userId = localStorage.getItem('userId');
        const userType = localStorage.getItem('userType');

        if (isAuth && userId && userType) {
          setIsAuthenticated(true);
          setCurrentView(userType as UserType);
        }
      }
    };

    checkSession();

    // Simple activity tracking without timeout
    const updateActivity = () => {
      localStorage.setItem('lastActivity', Date.now().toString());
    };
    updateActivity();

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
        
        // Setup auto-refresh interval (30 minutes)
        cleanupAutoRefresh = setupAutoRefresh();
        
        // Setup cross-tab synchronization
        cleanupCrossTab = setupCrossTabSync((session: SessionState | null) => {
          if (!session) {
            // Session cleared in another tab
            console.log('Session cleared in another tab');
            setIsAuthenticated(false);
            setCurrentView('landing');
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
              const result = await api.verifyLinkToken(token);
              if (result.success) {
                // Show verification success modal
                setShowVerificationSuccess(true);
                
                // Auto-authenticate user after successful verification
                if (result.user) {
                  setIsAuthenticated(true);
                  setCurrentView(result.user.user_metadata?.userType || 'professional');
                  setUserData(result.user);
                  
                  // Store session data
                  localStorage.setItem('isAuthenticated', 'true');
                  localStorage.setItem('userType', result.user.user_metadata?.userType || 'professional');
                  localStorage.setItem('userId', result.user.id);
                  localStorage.setItem('emailVerified', 'true');
                  
                  // Log verification event
                  try {
                    await supabase.from('verification_logs').insert({
                      user_id: result.user.id,
                      event_type: 'email_verified',
                      email: result.user.email,
                      timestamp: new Date().toISOString(),
                      user_agent: navigator.userAgent.substring(0, 255),
                      session_id: localStorage.getItem('csrfToken')
                    });
                  } catch (logErr) {
                    console.warn('Verification logging failed:', logErr);
                  }
                }
              }
            } catch (e: any) {
              const errorMsg = e?.message || 'Link verification failed';
              if (errorMsg.includes('expired')) {
                toast.error('Verification link has expired. Please request a new one.');
              } else if (errorMsg.includes('invalid')) {
                toast.error('Invalid verification link. Please check your email for the correct link.');
              } else {
                toast.error(errorMsg);
              }
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
      // Cleanup handled by other listeners
      
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

        // Update verification status locally
        if (session.user.email_confirmed_at) {
          localStorage.setItem('emailVerified', 'true');
          localStorage.removeItem('tempSession');
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
      // Navigation handled by React Router
      window.location.href = '/get-started';
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

  // Admin login handler
  const handleAdminLogin = () => {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    if (isAdmin) {
      window.location.href = '/admin';
    } else {
      setShowAdminLoginDialog(true);
    }
  };

  const handleAdminLoginSuccess = () => {
    setShowAdminLoginDialog(false);
    window.location.href = '/admin';
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
    
    // Store session data
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userType', userType);
    if (user?.id) {
      localStorage.setItem('userId', user.id);
    }
    
    // Immediate redirect to dashboard
    setShowWelcomeToast(true);
    
    // Let Router handle navigation - no redirect
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
    setShowWelcomeToast(true);
    window.location.href = '/dashboard';
  };

  const handleLogout = async () => {
    try {
      // Sign out from Supabase first
      await supabase.auth.signOut();
      
      // Clear all session data (Phase 3 session management)
      const { clearSessionState } = await import('./utils/session');
      clearSessionState();
      
      // Clear all authentication data
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('adminSession');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('userType');
      localStorage.removeItem('emailVerified');
      localStorage.removeItem('tempSession');
      
      // Reset state
      setIsAuthenticated(false);
      setUserData(null);
      setCurrentView('landing');
      
      toast.success('Signed out successfully');
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
      
      // Still clear everything even if Supabase signout fails
      const { clearSessionState } = await import('./utils/session');
      clearSessionState();
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('adminSession');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('userType');
      localStorage.removeItem('emailVerified');
      localStorage.removeItem('tempSession');
      
      setIsAuthenticated(false);
      setUserData(null);
      setCurrentView('landing');
      
      toast.error('Signed out (with errors)');
      window.location.href = '/';
    }
  };

  const handlePasswordResetConfirm = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    toast.success('Password updated. Please sign in with your new password.');
    setShowPasswordResetDialog(false);
    await supabase.auth.signOut();
  };

  return (
    <>
      <AppRouter
        isAuthenticated={isAuthenticated}
        userType={currentView}
        userData={userData}
        onLogin={handleLogin}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
        onOnboardingComplete={handleOnboardingComplete}
      />
      
      {/* Global Dialogs */}
      <LoginDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
        onLoginSuccess={handleLoginSuccess}
      />
      
      <AdminLoginDialog
        open={showAdminLoginDialog}
        onOpenChange={setShowAdminLoginDialog}
        onLoginSuccess={handleAdminLoginSuccess}
      />
      
      <PasswordResetDialog
        open={showPasswordResetDialog}
        email={passwordRecoveryEmail}
        onClose={() => setShowPasswordResetDialog(false)}
        onReset={handlePasswordResetConfirm}
      />
      
      {/* Welcome Toast */}
      {currentView !== 'landing' && (
        <WelcomeToast
          userType={currentView as 'employer' | 'professional' | 'university'}
          userName={userData?.user_metadata?.name}
          show={showWelcomeToast}
          onDismiss={() => setShowWelcomeToast(false)}
        />
      )}
      
      {/* Verification Success Modal */}
      <VerificationSuccessModal
        open={showVerificationSuccess}
        onClose={() => {
          setShowVerificationSuccess(false);
          // Navigate to dashboard after closing modal
          window.location.href = '/dashboard';
        }}
        userType={currentView as 'employer' | 'professional' | 'university'}
      />
    </>
  );
}
