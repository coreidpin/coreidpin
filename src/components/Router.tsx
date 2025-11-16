import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';

// Wrapper for PublicPINPage to handle URL parameters
const PublicPINPageWrapper: React.FC = () => {
  const { pinNumber } = useParams<{ pinNumber: string }>();
  return <PublicPINPage pinNumber={pinNumber || ''} onNavigate={() => {}} />;
};
import { LandingPage } from './LandingPage';
import { OurStoryPage } from './OurStoryPage';
import { HowItWorksPage } from './HowItWorksPage';
import { SolutionsPage } from './SolutionsPage';
import { PlaceholderPage } from './PlaceholderPage';
import { TermsOfService } from './TermsOfService';
import { PrivacyPolicy } from './PrivacyPolicy';
import { CookiesPolicy } from './CookiesPolicy';
import { GDPRCompliance } from './GDPRCompliance';
import { EmployerDashboard } from './EmployerDashboard';
import { ProfessionalDashboard } from './ProfessionalDashboard';
import { UniversityDashboard } from './UniversityDashboard';
import { AdminDashboard } from './AdminDashboard';
import { PublicPINPage } from './PublicPINPage';
import { AuthVerifyEmail } from './AuthVerifyEmail';
import EmailVerificationCallback from './EmailVerificationCallback';
import LoginPage from './LoginPage';
import UnifiedFlow from './UnifiedFlow';
import MonitoringPage from '../pages/Monitoring';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { Toaster } from './ui/sonner';
import { motion } from 'motion/react';

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
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page - Root */}
        <Route 
          path="/" 
          element={
            <LandingPage 
              onLogin={onLogin}
              onNavigate={() => {}}
              isAuthenticated={isAuthenticated}
              userType={userType}
            />
          } 
        />

        {/* Authentication Routes */}
        <Route 
          path="/login" 
          element={
            <Layout currentPage="login" isAuthenticated={isAuthenticated} userType={userType} onLogin={onLogin} onLogout={onLogout}>
              <div className="flex items-center justify-center py-16">
                <LoginPage onLoginSuccess={onLoginSuccess} />
              </div>
            </Layout>
          } 
        />

        <Route 
          path="/get-started" 
          element={
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <UnifiedFlow 
                userType={userType as 'employer' | 'professional' | 'university'}
                onComplete={onOnboardingComplete}
                onBack={() => window.history.back()}
              />
            </motion.div>
          } 
        />

        {/* Email Verification Routes */}
        <Route path="/auth/verify-email" element={<AuthVerifyEmail />} />
        <Route path="/auth/callback" element={<EmailVerificationCallback />} />

        {/* Public Routes */}
        <Route 
          path="/our-story" 
          element={
            <Layout currentPage="our-story" isAuthenticated={isAuthenticated} userType={userType} onLogin={onLogin} onLogout={onLogout}>
              <OurStoryPage onNavigate={() => {}} />
            </Layout>
          } 
        />

        <Route 
          path="/how-it-works" 
          element={
            <Layout currentPage="how-it-works" isAuthenticated={isAuthenticated} userType={userType} onLogin={onLogin} onLogout={onLogout}>
              <HowItWorksPage onNavigate={() => {}} onLogin={onLogin} />
            </Layout>
          } 
        />

        <Route 
          path="/solutions" 
          element={
            <Layout currentPage="solutions" isAuthenticated={isAuthenticated} userType={userType} onLogin={onLogin} onLogout={onLogout}>
              <SolutionsPage onNavigate={() => {}} onLogin={onLogin} />
            </Layout>
          } 
        />

        <Route 
          path="/employers" 
          element={
            <Layout currentPage="employers" isAuthenticated={isAuthenticated} userType={userType} onLogin={onLogin} onLogout={onLogout}>
              <SolutionsPage onNavigate={() => {}} onLogin={onLogin} />
            </Layout>
          } 
        />

        <Route 
          path="/professionals" 
          element={
            <Layout currentPage="professionals" isAuthenticated={isAuthenticated} userType={userType} onLogin={onLogin} onLogout={onLogout}>
              <SolutionsPage onNavigate={() => {}} onLogin={onLogin} />
            </Layout>
          } 
        />

        {/* Legal Pages */}
        <Route 
          path="/terms" 
          element={
            <div className="min-h-screen bg-background flex flex-col">
              <Navbar currentPage="terms" onNavigate={() => {}} onLogin={onLogin} onLogout={onLogout} isAuthenticated={isAuthenticated} userType={userType} />
              <TermsOfService />
              <Footer onNavigate={() => {}} />
            </div>
          } 
        />

        <Route 
          path="/privacy" 
          element={
            <div className="min-h-screen bg-background flex flex-col">
              <Navbar currentPage="privacy" onNavigate={() => {}} onLogin={onLogin} onLogout={onLogout} isAuthenticated={isAuthenticated} userType={userType} />
              <PrivacyPolicy />
              <Footer onNavigate={() => {}} />
            </div>
          } 
        />

        <Route 
          path="/cookies" 
          element={
            <div className="min-h-screen bg-background flex flex-col">
              <Navbar currentPage="cookies" onNavigate={() => {}} onLogin={onLogin} onLogout={onLogout} isAuthenticated={isAuthenticated} userType={userType} />
              <CookiesPolicy />
              <Footer onNavigate={() => {}} />
            </div>
          } 
        />

        <Route 
          path="/gdpr" 
          element={
            <div className="min-h-screen bg-background flex flex-col">
              <Navbar currentPage="gdpr" onNavigate={() => {}} onLogin={onLogin} onLogout={onLogout} isAuthenticated={isAuthenticated} userType={userType} />
              <GDPRCompliance />
              <Footer onNavigate={() => {}} />
            </div>
          } 
        />

        {/* Placeholder Pages */}
        <Route 
          path="/trust-safety" 
          element={
            <Layout currentPage="trust-safety" isAuthenticated={isAuthenticated} userType={userType} onLogin={onLogin} onLogout={onLogout}>
              <PlaceholderPage 
                title="Trust & Safety"
                description="Trust is the core of CoreID — it's in our name. We build infrastructure designed to protect users, secure data, and enable safe interactions."
                onNavigate={() => {}}
              />
            </Layout>
          } 
        />

        <Route 
          path="/help" 
          element={
            <Layout currentPage="help" isAuthenticated={isAuthenticated} userType={userType} onLogin={onLogin} onLogout={onLogout}>
              <PlaceholderPage 
                title="Help Center"
                description="Find answers to common questions and get support for using the CoreID platform."
                onNavigate={() => {}}
              />
            </Layout>
          } 
        />

        <Route 
          path="/contact" 
          element={
            <Layout currentPage="contact" isAuthenticated={isAuthenticated} userType={userType} onLogin={onLogin} onLogout={onLogout}>
              <PlaceholderPage 
                title="Contact Us"
                description="Get in touch with our team for partnerships, support, or general inquiries."
                onNavigate={() => {}}
              />
            </Layout>
          } 
        />

        <Route 
          path="/docs" 
          element={
            <Layout currentPage="docs" isAuthenticated={isAuthenticated} userType={userType} onLogin={onLogin} onLogout={onLogout}>
              <PlaceholderPage 
                title="Documentation"
                description="Access technical documentation, API references, and integration guides for developers."
                onNavigate={() => {}}
              />
            </Layout>
          } 
        />

        {/* Protected Dashboard Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <DashboardLayout isAuthenticated={isAuthenticated} userType={userType} onLogout={onLogout}>
                {userType === 'employer' && <EmployerDashboard />}
                {userType === 'professional' && <ProfessionalDashboard />}
                {userType === 'university' && <UniversityDashboard />}
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
                  <AdminDashboard />
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
                <MonitoringPage />
              </main>
              <Footer onNavigate={() => {}} />
            </div>
          } 
        />

        {/* Public PIN Routes */}
        <Route 
          path="/pin/:pinNumber" 
          element={<PublicPINPageWrapper />} 
        />

        {/* 404 Route */}
        <Route 
          path="*" 
          element={
            <Layout currentPage="404" isAuthenticated={isAuthenticated} userType={userType} onLogin={onLogin} onLogout={onLogout}>
              <PlaceholderPage 
                title="Page Not Found"
                description="The page you're looking for doesn't exist."
                onNavigate={() => {}}
              />
            </Layout>
          } 
        />
      </Routes>
      <Toaster position="top-right" />
    </BrowserRouter>
  );
};