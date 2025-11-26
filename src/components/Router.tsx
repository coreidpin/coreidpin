import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { supabase } from '../utils/supabase/client';

// Wrapper for PublicPINPage to handle URL parameters
const PublicPINPageWrapper: React.FC = () => {
  const { pinNumber } = useParams<{ pinNumber: string }>();
  return <PublicPINPage pinNumber={pinNumber || ''} onNavigate={() => {}} />;
};
const LandingPage = lazy(() => import('./LandingPage').then(m => ({ default: m.LandingPage })));
const OurStoryPage = lazy(() => import('./OurStoryPage').then(m => ({ default: m.OurStoryPage })));
const HowItWorksPage = lazy(() => import('./HowItWorksPage').then(m => ({ default: m.HowItWorksPage })));
const SolutionsPage = lazy(() => import('./SolutionsPage').then(m => ({ default: m.SolutionsPage })));
const PlaceholderPage = lazy(() => import('./PlaceholderPage').then(m => ({ default: m.PlaceholderPage })));
const TermsOfService = lazy(() => import('./TermsOfService').then(m => ({ default: m.TermsOfService })));
const PrivacyPolicy = lazy(() => import('./PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));
const CookiesPolicy = lazy(() => import('./CookiesPolicy').then(m => ({ default: m.CookiesPolicy })));
const GDPRCompliance = lazy(() => import('./GDPRCompliance').then(m => ({ default: m.GDPRCompliance })));
const EmployerDashboard = lazy(() => import('./EmployerDashboard').then(m => ({ default: m.EmployerDashboard })));
const ProfessionalDashboard = lazy(() => import('./ProfessionalDashboard').then(m => ({ default: m.ProfessionalDashboard })));
const Navbar = lazy(() => import('./Navbar').then(m => ({ default: m.Navbar })));
const Footer = lazy(() => import('./Footer').then(m => ({ default: m.Footer })));
const LoginPage = lazy(() => import('./LoginPage'));
const SimpleRegistration = lazy(() => import('./SimpleRegistration'));
const AuthVerifyEmail = lazy(() => import('./AuthVerifyEmail'));
const EmailVerificationCallback = lazy(() => import('./EmailVerificationCallback'));
const PublicPINPage = lazy(() => import('./PublicPINPage'));
const UniversityDashboard = lazy(() => import('./UniversityDashboard').then(m => ({ default: m.UniversityDashboard })));
const AdminDashboard = lazy(() => import('../admin/pages/Dashboard').then(m => ({ default: m.AdminDashboard })));
const UsersPage = lazy(() => import('../admin/pages/Users').then(m => ({ default: m.UsersPage })));
const ProjectsPage = lazy(() => import('../admin/pages/Projects').then(m => ({ default: m.ProjectsPage })));
const EndorsementsPage = lazy(() => import('../admin/pages/Endorsements').then(m => ({ default: m.EndorsementsPage })));
const AuthLogsPage = lazy(() => import('../admin/pages/logs/AuthLogs').then(m => ({ default: m.AuthLogsPage })));
const PINLoginLogsPage = lazy(() => import('../admin/pages/logs/PINLoginLogs').then(m => ({ default: m.PINLoginLogsPage })));
const EmailVerificationLogsPage = lazy(() => import('../admin/pages/logs/EmailVerificationLogs').then(m => ({ default: m.EmailVerificationLogsPage })));
const APIKeysPage = lazy(() => import('../admin/pages/integrations/APIKeys').then(m => ({ default: m.APIKeysPage })));
const SettingsPage = lazy(() => import('../admin/pages/Settings'));
const AcceptInvitationPage = lazy(() => import('../admin/pages/AcceptInvitation').then(m => ({ default: m.AcceptInvitation })));
const IdentityManagementPage = lazy(() => import('./IdentityManagementPage').then(m => ({ default: m.IdentityManagementPage })));
const IdentityCard = lazy(() => import('./IdentityCard').then(m => ({ default: m.IdentityCard })));
const PublicProfile = lazy(() => import('./PublicProfile').then(m => ({ default: m.PublicProfile })));
const MonitoringPage = lazy(() => import('../pages/Monitoring'));

const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center py-16">
    <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  </div>
);

const DashboardSkeleton: React.FC = () => (
  <div className="min-h-screen bg-[#0a0b0d] flex flex-col">
    <div className="flex-1 container mx-auto px-4 py-6 sm:py-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-white/10 rounded-md animate-pulse" />
          <div className="h-10 w-32 bg-white/10 rounded-md animate-pulse" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white/10 rounded-xl border border-white/10">
              <div className="p-4">
                <div className="h-6 w-16 bg-white/10 rounded-md animate-pulse mb-2" />
                <div className="h-4 w-24 bg-white/10 rounded-md animate-pulse" />
              </div>
            </div>
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white/10 rounded-xl border border-white/10">
            <div className="p-6 space-y-4">
              <div className="h-6 w-40 bg-white/10 rounded-md animate-pulse" />
              <div className="h-24 w-full bg-white/10 rounded-md animate-pulse" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-4 w-24 bg-white/10 rounded-md animate-pulse" />
                <div className="h-4 w-24 bg-white/10 rounded-md animate-pulse" />
              </div>
            </div>
          </div>
          <div className="bg-white/10 rounded-xl border border-white/10">
            <div className="p-6">
              <div className="h-6 w-48 bg-white/10 rounded-md animate-pulse mb-4" />
              <div className="h-32 w-full bg-white/10 rounded-md animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

interface RouterProps {
  isAuthenticated: boolean;
  userType: string;
  userData: any;
  onLogin: (userType: 'employer' | 'professional' | 'university') => void;
  onLoginSuccess: (userType: 'employer' | 'professional' | 'university', userData: any) => void;
  onLogout: () => void;
  onOnboardingComplete: () => void;
}

// Protected Route Component
const ProtectedRoute: React.FC<{ 
  children: React.ReactNode; 
  isAuthenticated: boolean;
  redirectTo?: string;
}> = ({ children, isAuthenticated, redirectTo = '/login' }) => {
  return isAuthenticated ? <>{children}</> : <Navigate to={redirectTo} replace />;
};

// Admin Route Component
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = React.useState<boolean | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsAdmin(false);
          setIsLoading(false);
          return;
        }

        const { data: adminUser } = await supabase
          .from('admin_users')
          .select('id')
          .eq('user_id', user.id)
          .single();

        setIsAdmin(!!adminUser);
      } catch (error) {
        console.error('Admin check error:', error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdmin();
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return isAdmin ? <>{children}</> : <Navigate to="/" replace />;
};

// Layout Component
const Layout: React.FC<{ 
  children: React.ReactNode;
  currentPage: string;
  isAuthenticated: boolean;
  userType: string;
  onLogin: (userType: 'employer' | 'professional' | 'university') => void;
  onLogout: () => void;
}> = ({ children, currentPage, isAuthenticated, userType, onLogin, onLogout }) => (
  <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0a0b0d' }}>
    <Navbar 
      currentPage={currentPage}
      onNavigate={() => {}} // Navigation handled by React Router
      onLogin={onLogin}
      onLogout={onLogout}
      isAuthenticated={isAuthenticated}
      userType={userType}
    />
    <main className="flex-1">
      {children}
    </main>
    {currentPage !== 'login' && currentPage !== 'get-started' && <Footer onNavigate={() => {}} />}
  </div>
);

import { ensureValidSession } from '../utils/session';

// ... imports

// Dashboard Authentication Wrapper
const DashboardAuthWrapper: React.FC<{
  children: React.ReactNode;
  isAuthenticated: boolean;
  userType: string;
  onLogout: () => void;
}> = ({ children, isAuthenticated, userType, onLogout }) => {
  const [authChecked, setAuthChecked] = React.useState(false);
  const [isValidAuth, setIsValidAuth] = React.useState(false);

  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        // Quick check: if already authenticated in App state, trust it initially
        if (isAuthenticated && localStorage.getItem('accessToken') && localStorage.getItem('userId')) {
          setIsValidAuth(true);
          setAuthChecked(true);
          
          // Validate session in background
          ensureValidSession().then(token => {
            if (!token) {
              console.error('Background auth validation failed');
              onLogout();
              window.location.href = '/login';
            }
          });
          return;
        }
        
        // Full validation if not authenticated
        const token = await ensureValidSession();
        
        if (!token) {
          console.error('Dashboard auth failed: Invalid session');
          onLogout();
          window.location.href = '/login';
          return;
        }
        
        setIsValidAuth(true);
      } catch (error) {
        console.error('Auth check error:', error);
        window.location.href = '/login';
      } finally {
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, [isAuthenticated, onLogout]);

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#0a0b0d] flex flex-col">
        <Navbar 
          currentPage="dashboard"
          onNavigate={() => {}}
          onLogout={onLogout}
          isAuthenticated={isAuthenticated}
          userType={userType}
        />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin h-8 w-8 border-2 border-[#32f08c] border-t-transparent rounded-full mx-auto" />
            <p className="text-white/70">Loading dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!isValidAuth) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#0a0b0d] flex flex-col">
      <Navbar 
        currentPage="dashboard"
        onNavigate={() => {}}
        onLogout={onLogout}
        isAuthenticated={isAuthenticated}
        userType={userType}
      />
      <main className="flex-1 container mx-auto px-4 py-6 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};

export const AppRouter: React.FC<RouterProps> = ({
  isAuthenticated,
  userType,
  userData,
  onLogin,
  onLoginSuccess,
  onLogout,
  onOnboardingComplete
}) => {
  void userData;
  void onOnboardingComplete;
  return (
    <BrowserRouter>
      <Routes>
        {/* Home - use Solutions as default */}
          <Route 
          path="/" 
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <LandingPage 
                onLogin={onLogin}
                onNavigate={() => {}}
                isAuthenticated={isAuthenticated}
                userType={userType}
              />
            </Suspense>
          } 
        />
        
        {/* Explicit landing route */}
        <Route 
          path="/landing" 
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <LandingPage 
                onLogin={onLogin}
                onNavigate={() => {}}
                isAuthenticated={isAuthenticated}
                userType={userType}
              />
            </Suspense>
          } 
        />
        
        {/* Fallback for landing */}
        <Route 
          index
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <LandingPage 
                onLogin={onLogin}
                onNavigate={() => {}}
                isAuthenticated={isAuthenticated}
                userType={userType}
              />
            </Suspense>
          } 
        />

        {/* Authentication Routes */}
        <Route 
          path="/login" 
          element={
            <Layout currentPage="login" isAuthenticated={isAuthenticated} userType={userType} onLogin={onLogin} onLogout={onLogout}>
              <Suspense fallback={<LoadingSpinner />}>
                <div className="flex items-center justify-center py-16">
                  <LoginPage onLoginSuccess={onLoginSuccess} />
                </div>
              </Suspense>
            </Layout>
          } 
        />

        <Route 
          path="/get-started" 
          element={
            <Layout currentPage="get-started" isAuthenticated={isAuthenticated} userType={userType} onLogin={onLogin} onLogout={onLogout}>
              <Suspense fallback={<LoadingSpinner />}>
                <div className="flex items-center justify-center py-8">
                  <SimpleRegistration showChrome={false} onComplete={() => { window.location.href = '/dashboard' }} onBack={() => { window.history.back() }} />
                </div>
              </Suspense>
            </Layout>
          } 
        />

        <Route path="/verify-email" element={<Suspense fallback={<LoadingSpinner />}><EmailVerificationCallback /></Suspense>} />
        <Route path="/email-verification" element={<Suspense fallback={<LoadingSpinner />}><EmailVerificationCallback /></Suspense>} />

        {/* Public Routes */}
        <Route 
          path="/our-story" 
          element={
            <Layout currentPage="our-story" isAuthenticated={isAuthenticated} userType={userType} onLogin={onLogin} onLogout={onLogout}>
              <Suspense fallback={<LoadingSpinner />}>
                <OurStoryPage onNavigate={() => {}} />
              </Suspense>
            </Layout>
          } 
        />

        <Route 
          path="/how-it-works" 
          element={
            <Layout currentPage="how-it-works" isAuthenticated={isAuthenticated} userType={userType} onLogin={onLogin} onLogout={onLogout}>
              <Suspense fallback={<LoadingSpinner />}>
                <HowItWorksPage onNavigate={() => {}} onLogin={onLogin} />
              </Suspense>
            </Layout>
          } 
        />

        <Route 
          path="/solutions" 
          element={
            <Layout currentPage="solutions" isAuthenticated={isAuthenticated} userType={userType} onLogin={onLogin} onLogout={onLogout}>
              <Suspense fallback={<LoadingSpinner />}>
                <SolutionsPage onNavigate={() => {}} onLogin={onLogin} />
              </Suspense>
            </Layout>
          } 
        />

        <Route 
          path="/employers" 
          element={
            <Layout currentPage="employers" isAuthenticated={isAuthenticated} userType={userType} onLogin={onLogin} onLogout={onLogout}>
              <Suspense fallback={<LoadingSpinner />}>
                <SolutionsPage onNavigate={() => {}} onLogin={onLogin} />
              </Suspense>
            </Layout>
          } 
        />

        <Route 
          path="/professionals" 
          element={
            <Layout currentPage="professionals" isAuthenticated={isAuthenticated} userType={userType} onLogin={onLogin} onLogout={onLogout}>
              <Suspense fallback={<LoadingSpinner />}>
                <SolutionsPage onNavigate={() => {}} onLogin={onLogin} />
              </Suspense>
            </Layout>
          } 
        />

        {/* Legal Pages */}
        <Route 
          path="/terms" 
          element={
            <div className="min-h-screen bg-background flex flex-col">
              <Navbar currentPage="terms" onNavigate={() => {}} onLogin={onLogin} onLogout={onLogout} isAuthenticated={isAuthenticated} userType={userType} />
              <Suspense fallback={<LoadingSpinner />}>
                <TermsOfService />
              </Suspense>
              <Footer onNavigate={() => {}} />
            </div>
          } 
        />

        <Route 
          path="/privacy" 
          element={
            <div className="min-h-screen bg-background flex flex-col">
              <Navbar currentPage="privacy" onNavigate={() => {}} onLogin={onLogin} onLogout={onLogout} isAuthenticated={isAuthenticated} userType={userType} />
              <Suspense fallback={<LoadingSpinner />}>
                <PrivacyPolicy />
              </Suspense>
              <Footer onNavigate={() => {}} />
            </div>
          } 
        />

        <Route 
          path="/cookies" 
          element={
            <div className="min-h-screen bg-background flex flex-col">
              <Navbar currentPage="cookies" onNavigate={() => {}} onLogin={onLogin} onLogout={onLogout} isAuthenticated={isAuthenticated} userType={userType} />
              <Suspense fallback={<LoadingSpinner />}>
                <CookiesPolicy />
              </Suspense>
              <Footer onNavigate={() => {}} />
            </div>
          } 
        />

        <Route 
          path="/gdpr" 
          element={
            <div className="min-h-screen bg-background flex flex-col">
              <Navbar currentPage="gdpr" onNavigate={() => {}} onLogin={onLogin} onLogout={onLogout} isAuthenticated={isAuthenticated} userType={userType} />
              <Suspense fallback={<LoadingSpinner />}>
                <GDPRCompliance />
              </Suspense>
              <Footer onNavigate={() => {}} />
            </div>
          } 
        />

        {/* Placeholder Pages */}
        <Route 
          path="/trust-safety" 
          element={
            <Layout currentPage="trust-safety" isAuthenticated={isAuthenticated} userType={userType} onLogin={onLogin} onLogout={onLogout}>
              <Suspense fallback={<LoadingSpinner />}>
                <PlaceholderPage 
                  title="Trust & Safety"
                  description="Trust is the core of CoreID — it's in our name. We build infrastructure designed to protect users, secure data, and enable safe interactions."
                  onNavigate={() => {}}
                />
              </Suspense>
            </Layout>
          } 
        />

        <Route 
          path="/help" 
          element={
            <Layout currentPage="help" isAuthenticated={isAuthenticated} userType={userType} onLogin={onLogin} onLogout={onLogout}>
              <Suspense fallback={<LoadingSpinner />}>
                <PlaceholderPage 
                  title="Help Center"
                  description="Find answers to common questions and get support for using the CoreID platform."
                  onNavigate={() => {}}
                />
              </Suspense>
            </Layout>
          } 
        />

        <Route 
          path="/contact" 
          element={
            <Layout currentPage="contact" isAuthenticated={isAuthenticated} userType={userType} onLogin={onLogin} onLogout={onLogout}>
              <Suspense fallback={<LoadingSpinner />}>
                <PlaceholderPage 
                  title="Contact Us"
                  description="Get in touch with our team for partnerships, support, or general inquiries."
                  onNavigate={() => {}}
                />
              </Suspense>
            </Layout>
          } 
        />

        <Route 
          path="/docs" 
          element={
            <Layout currentPage="docs" isAuthenticated={isAuthenticated} userType={userType} onLogin={onLogin} onLogout={onLogout}>
              <Suspense fallback={<LoadingSpinner />}>
                <PlaceholderPage 
                  title="Documentation"
                  description="Access technical documentation, API references, and integration guides for developers."
                  onNavigate={() => {}}
                />
              </Suspense>
            </Layout>
          } 
        />

        {/* Dashboard Routes - Protected */}
        <Route
          path="/dashboard"
          element={
            <Suspense fallback={<DashboardSkeleton />}>
              <DashboardAuthWrapper isAuthenticated={isAuthenticated} userType={userType} onLogout={onLogout}>
                {userType === 'professional' && <ProfessionalDashboard />}
                {userType === 'employer' && <EmployerDashboard />}
                {userType === 'university' && <UniversityDashboard />}
                {userType === 'admin' && <AdminDashboard />}
              </DashboardAuthWrapper>
            </Suspense>
          }
        />

        <Route 
          path="/identity-management" 
          element={
            <DashboardAuthWrapper isAuthenticated={isAuthenticated} userType={userType} onLogout={onLogout}>
              <Suspense fallback={<DashboardSkeleton />}>
                <IdentityManagementPage />
              </Suspense>
            </DashboardAuthWrapper>
          } 
        />

        <Route 
          path="/card" 
          element={
            <DashboardAuthWrapper isAuthenticated={isAuthenticated} userType={userType} onLogout={onLogout}>
              <Suspense fallback={<DashboardSkeleton />}>
                <IdentityCard />
              </Suspense>
            </DashboardAuthWrapper>
          } 
        />

        {/* Public Profile - No auth required */}
        <Route 
          path="/profile/:slug" 
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <PublicProfile />
            </Suspense>
          } 
        />

        {/* Public Profile - No auth required */}
        <Route 
          path="/profile/:slug" 
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <PublicProfile />
            </Suspense>
          } 
        />

        <Route 
          path="/admin" 
          element={
            <AdminRoute>
              <Suspense fallback={<DashboardSkeleton />}>
                <AdminDashboard />
              </Suspense>
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin/users" 
          element={
            <AdminRoute>
              <Suspense fallback={<DashboardSkeleton />}>
                <UsersPage />
              </Suspense>
            </AdminRoute>
          } 
        />

        <Route 
          path="/admin/projects" 
          element={
            <AdminRoute>
              <Suspense fallback={<DashboardSkeleton />}>
                <ProjectsPage />
              </Suspense>
            </AdminRoute>
          } 
        />

        <Route 
          path="/admin/endorsements" 
          element={
            <AdminRoute>
              <Suspense fallback={<DashboardSkeleton />}>
                <EndorsementsPage />
              </Suspense>
            </AdminRoute>
          } 
        />

        <Route 
          path="/admin/logs/auth" 
          element={
            <AdminRoute>
              <Suspense fallback={<DashboardSkeleton />}>
                <AuthLogsPage />
              </Suspense>
            </AdminRoute>
          } 
        />

        <Route 
          path="/admin/logs/pin" 
          element={
            <AdminRoute>
              <Suspense fallback={<DashboardSkeleton />}>
                <PINLoginLogsPage />
              </Suspense>
            </AdminRoute>
          } 
        />

        <Route 
          path="/admin/logs/email-verification" 
          element={
            <AdminRoute>
              <Suspense fallback={<DashboardSkeleton />}>
                <EmailVerificationLogsPage />
              </Suspense>
            </AdminRoute>
          } 
        />

        <Route 
          path="/admin/integrations/api-keys" 
          element={
            <AdminRoute>
              <Suspense fallback={<DashboardSkeleton />}>
                <APIKeysPage />
              </Suspense>
            </AdminRoute>
          } 
        />

        <Route 
          path="/admin/settings" 
          element={
            <AdminRoute>
              <Suspense fallback={<DashboardSkeleton />}>
                <SettingsPage />
              </Suspense>
            </AdminRoute>
          } 
        />

        <Route 
          path="/admin/accept-invitation" 
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <AcceptInvitationPage />
            </Suspense>
          } 
        />

        <Route 
          path="/monitoring" 
          element={
            <div className="min-h-screen bg-background flex flex-col">
              <Navbar currentPage="monitoring" onNavigate={() => {}} onLogout={onLogout} isAuthenticated={isAuthenticated} userType={userType} />
              <main className="flex-1">
                <Suspense fallback={<LoadingSpinner />}>
                  <MonitoringPage />
                </Suspense>
              </main>
              <Footer onNavigate={() => {}} />
            </div>
          } 
        />

        {/* Public PIN Routes */}
        <Route 
          path="/pin/:pinNumber" 
          element={<Suspense fallback={<LoadingSpinner />}><PublicPINPageWrapper /></Suspense>} 
        />

        {/* 404 fallback to product */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
