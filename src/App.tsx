// Force rebuild - v1.0.1
import React, { useState, useEffect } from 'react';
import { toast, Toaster } from 'sonner';
import { AppRouter } from './components/Router';
import { ErrorBoundary } from './components/ErrorBoundary';


import PasswordResetDialog from './components/PasswordResetDialog';
import { VerificationSuccessModal } from './components/VerificationSuccessModal';
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
import { initAmplitude, identifyUser, resetAmplitude, trackEvent } from './utils/amplitude';
import { sessionManager } from './utils/session-manager';

type UserType = 'landing' | 'employer' | 'professional' | 'university' | 'business';

export default function App() {
  const [currentView, setCurrentView] = useState<UserType>('professional');
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Initialize from localStorage to prevent race conditions with protected routes
    if (typeof window !== 'undefined') {
      return localStorage.getItem('isAuthenticated') === 'true' && 
             !!localStorage.getItem('accessToken') && 
             !!localStorage.getItem('userId');
    }
    return false;
  });
  const [userData, setUserData] = useState<any>(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);


  const [showPasswordResetDialog, setShowPasswordResetDialog] = useState(false);
  const [passwordRecoveryEmail, setPasswordRecoveryEmail] = useState<string | null>(null);
  const [showVerificationSuccess, setShowVerificationSuccess] = useState(false);

  // Check for existing session on mount and handle OAuth callback
  useEffect(() => {
    // Check authentication state with all required tokens
    const isAuth = localStorage.getItem('isAuthenticated') === 'true';
    const hasToken = !!localStorage.getItem('accessToken');
    const hasUserId = !!localStorage.getItem('userId');
    const userType = localStorage.getItem('userType') || 'professional';
    
    if (isAuth && hasToken && hasUserId) {
      setIsAuthenticated(true);
      setCurrentView(userType as UserType);
    } else if (isAuth && (!hasToken || !hasUserId)) {
      // Clear incomplete auth state
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('userType');
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

    // Initialize Amplitude Analytics
    initAmplitude();

    // Initialize auth to restore session from localStorage
    const initializeAuth = async () => {
      try {
        const { initAuth } = await import('./utils/auth');
        await initAuth();
      } catch (error) {
        console.warn('Failed to initialize auth:', error);
      }
    };
    
    initializeAuth();

    // Initialize new SessionManager for token refresh (Phase 1 - Day 2)
    const initializeSessionManager = async () => {
      try {
        const initialized = await sessionManager.init();
        if (initialized) {
          console.log('✅ SessionManager initialized - auto-refresh enabled');
        } else {
          console.log('ℹ️ No active session for SessionManager');
        }
      } catch (error) {
        console.warn('Failed to initialize SessionManager:', error);
      }
    };
    
    initializeSessionManager();

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
                  trackEvent('Verification Success', { userId: result.user.id });
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
      // Clean up SessionManager
      sessionManager.destroy();
      
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
    } catch (err) {
      console.error('Failed to set user type:', err);
    }
  };



  const handleLoginSuccess = async (userType: 'employer' | 'professional' | 'university' | 'business', user: any) => {
    setIsAuthenticated(true);
    setCurrentView(userType);
    setUserData(user);
    setShowLoginDialog(false);
    
    // Get the current Supabase session to persist
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      saveSessionState({
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        userId: session.user.id,
        userType: userType,
        expiresAt: Date.now() + (session.expires_in || 3600) * 1000
      });
      
      // Store all required auth data
      localStorage.setItem('accessToken', session.access_token);
      localStorage.setItem('refreshToken', session.refresh_token);
      localStorage.setItem('userId', session.user.id);
    }
    
    // Store session data
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userType', userType);
    if (user?.id) {
      localStorage.setItem('userId', user.id);
    }
    
    // Track login in Amplitude
    identifyUser(user?.id || session?.user.id, {
      userType,
      email: user?.email || session?.user.email,
      name: user?.user_metadata?.name
    });
    trackEvent('User Logged In', { userType });
    

    
    // Navigate to correct dashboard based on user type
    if (userType === 'business') {
      window.location.href = '/developer';
    } else if (userType === 'employer') {
      window.location.href = '/employers';
    } else {
      window.location.href = '/dashboard';
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
        // @ts-ignore
        await supabase.from('profiles').update({ onboarding_complete: true } as any).eq('user_id', user.id);
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

    window.location.href = '/dashboard';
  };

  const handleLogout = async () => {
    try {
      // Track logout in Amplitude
      trackEvent('User Logged Out');
      
      // Clear SessionManager
      sessionManager.clearSession();
      
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
      
      // Reset Amplitude user
      resetAmplitude();
      
      // Reset state
      setIsAuthenticated(false);
      setUserData(null);
      setCurrentView('landing');
      
      toast.success('Signed out successfully');
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
      
      // Still clear everything even if Supabase signout fails
      sessionManager.clearSession();
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
      
      // Reset Amplitude user
      resetAmplitude();
      
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
    <ErrorBoundary>
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

      

      
      {/* Temporarily disabled due to React import issues */}
      {/* <PasswordResetDialog
        open={showPasswordResetDialog}
        email={passwordRecoveryEmail}
        onClose={() => setShowPasswordResetDialog(false)}
        onReset={handlePasswordResetConfirm}
      /> */}
      

      
      {/* Verification Success Modal */}
      {/* Temporarily disabled due to React import issues */}
      {/* <VerificationSuccessModal
        open={showVerificationSuccess}
        onClose={() => {
          setShowVerificationSuccess(false);
          // Navigate to dashboard after closing modal
          window.location.href = '/dashboard';
        }}
        userType={currentView as 'employer' | 'professional' | 'university' | 'business'}
      /> */}
      <Toaster />
    </ErrorBoundary>
  );
}
