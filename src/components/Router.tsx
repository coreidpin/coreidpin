import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';

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
const UniversityDashboard = lazy(() => import('./UniversityDashboard').then(m => ({ default: m.UniversityDashboard })));
const AdminDashboard = lazy(() => import('./AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const PublicPINPage = lazy(() => import('./PublicPINPage').then(m => ({ default: m.PublicPINPage })));
const AuthVerifyEmail = lazy(() => import('./AuthVerifyEmail').then(m => ({ default: m.AuthVerifyEmail })));
const EmailVerificationCallback = lazy(() => import('./EmailVerificationCallback'));
const LoginPage = lazy(() => import('./LoginPage'));
const SimpleRegistration = lazy(() => import('./SimpleRegistration'));
const MonitoringPage = lazy(() => import('../pages/Monitoring'));
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { motion } from 'motion/react';

const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center py-16">
    <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  </div>
);

const DashboardSkeleton: React.FC = () => (
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
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
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
    <Footer onNavigate={() => {}} />
  </div>
);

// Dashboard Layout
const DashboardLayout: React.FC<{
  children: React.ReactNode;
  isAuthenticated: boolean;
  userType: string;
  onLogout: () => void;
}> = ({ children, isAuthenticated, userType, onLogout }) => (
  <div className="min-h-screen bg-background flex flex-col">
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
    <Footer onNavigate={() => {}} />
  </div>
);

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
                  <SimpleRegistration onComplete={() => { window.location.href = '/dashboard' }} onBack={() => { window.history.back() }} />
                </div>
              </Suspense>
            </Layout>
          } 
        />

        {/* Email Verification Routes */}
        <Route path="/auth/verify-email" element={<Suspense fallback={<LoadingSpinner />}><AuthVerifyEmail /></Suspense>} />
        <Route path="/auth/callback" element={<Suspense fallback={<LoadingSpinner />}><EmailVerificationCallback /></Suspense>} />
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

        {/* Protected Dashboard Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <DashboardLayout isAuthenticated={isAuthenticated} userType={userType} onLogout={onLogout}>
                <Suspense fallback={<DashboardSkeleton />}>
                  {userType === 'employer' && <EmployerDashboard />}
                  {userType === 'professional' && <ProfessionalDashboard />}
                  {userType === 'university' && <UniversityDashboard />}
                </Suspense>
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />

        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <AdminRoute>
              <div className="min-h-screen bg-background flex flex-col">
                <Navbar currentPage="admin" onNavigate={() => {}} onLogout={onLogout} isAuthenticated={isAuthenticated} userType={userType} />
                <main className="flex-1 container mx-auto px-4 py-6 sm:py-8">
                  <Suspense fallback={<DashboardSkeleton />}>
                    <AdminDashboard />
                  </Suspense>
                </main>
                <Footer onNavigate={() => {}} />
              </div>
            </AdminRoute>
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
