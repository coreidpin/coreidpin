import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { supabase } from '../utils/supabase/client';
import { toast } from 'sonner';
import { ensureValidSession, getSessionState } from '../utils/session';
import { APIKeysManager } from './developer/APIKeysManager';
import { APIUsageDashboard } from './developer/APIUsageDashboard';
import { TeamManager } from './developer/TeamManager';
import { WebhooksManager } from './developer/WebhooksManager';
import { BusinessSettings } from './developer/BusinessSettings';
import { IdentityVerificationTool } from './developer/IdentityVerificationTool';
import { FeatureLockInline } from './FeatureLock';
import { useFeatureGate } from '../hooks/useFeatureGate';
import { MobileBottomNav } from './developer/MobileBottomNav';
import { colors, typography, spacing, shadows, borderRadius } from '../styles/designSystem';
import {
  Key,
  BarChart3,
  Code2,
  BookOpen,
  Webhook,
  Settings,
  Sparkles,
  Zap,
  LayoutDashboard,
  Users,
  Shield
} from 'lucide-react';


export function DeveloperConsole() {
  const [businessProfile, setBusinessProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const { access, loading: featureLoading } = useFeatureGate();

  useEffect(() => {
    fetchBusinessProfile();
  }, []);

  // Responsive breakpoint detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchBusinessProfile = async () => {
    setLoading(true);
    
    try {
      // Get userId and tokens from localStorage (custom OTP auth)
      const userId = localStorage.getItem('userId');
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!userId) {
        setBusinessProfile(null);
        setLoading(false);
        return;
      }

      // CRITICAL: Sync Supabase session for RLS to work
      // This ensures auth.uid() in RLS policies returns the correct user
      if (accessToken && refreshToken) {
        try {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (sessionError) {
            console.warn('⚠️ Session sync failed (will retry with userId):', sessionError);
            // Continue anyway - we'll try with userId as fallback
          } else {
          }
        } catch (err) {
          console.warn('⚠️ Session sync error:', err);
          // Continue anyway
        }
      }

      // Fetch business profile
      // RLS will check: auth.uid() = user_id
      const { data, error } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows found - this is okay, profile doesn't exist yet
          setBusinessProfile(null);
          return;
        }
        
        // Real error
        console.error('❌ Error fetching business profile:', error);
        throw error;
      }

      if (data) {
        setBusinessProfile(data);
      } else {
        setBusinessProfile(null);
      }
    } catch (error: any) {
      console.error('❌ Error in fetchBusinessProfile:', error);
      
      // Don't show error toast on mount (user might not have profile yet)
      if (!loading) {
        toast.error('Failed to load business profile');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: colors.neutral[50], paddingBottom: isMobile ? '80px' : '0' }}>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: spacing.lg }}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 
                className="flex items-center gap-3"
                style={{
                  fontSize: isMobile ? typography.fontSize['2xl'][0] : typography.fontSize['3xl'][0],
                  fontWeight: typography.fontWeight.bold,
                  color: colors.neutral[900],
                }}
              >
                <LayoutDashboard style={{ width: '32px', height: '32px', color: colors.brand.primary[600] }} />
                Business Console
              </h1>
              <p style={{ color: colors.neutral[500], marginTop: spacing.sm, fontSize: typography.fontSize.sm[0] }}>
                {businessProfile?.company_name || 'Welcome to GidiPIN API'}
              </p>
            </div>
            <Badge 
              variant="outline" 
              className="w-full md:w-auto text-center"
              style={{
                fontSize: typography.fontSize.base[0],
                padding: `${spacing.sm} ${spacing.md}`,
                borderColor: colors.brand.primary[200],
                color: colors.brand.primary[700],
                background: colors.brand.primary[50],
              }}
            >
              {businessProfile?.api_tier?.toUpperCase() || 'FREE'} Tier
            </Badge>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" style={{ marginTop: spacing.lg }}>
            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <Card 
                style={{
                  background: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(12px)',
                  borderColor: colors.brand.primary[100],
                  boxShadow: shadows.md,
                  borderRadius: borderRadius.xl,
                }}
              >
                <CardContent style={{ padding: spacing.md }}>
                  <div className="flex items-center gap-3">
                    <div style={{ padding: spacing.sm, background: colors.brand.primary[100], borderRadius: borderRadius.lg }}>
                      <Zap style={{ width: '20px', height: '20px', color: colors.brand.primary[600] }} />
                    </div>
                    <div>
                      <p style={{ fontSize: typography.fontSize.xs[0], color: colors.neutral[500] }}>Monthly Quota</p>
                      <p style={{ fontSize: typography.fontSize.lg[0], fontWeight: typography.fontWeight.semibold, color: colors.neutral[900] }}>
                        {businessProfile?.monthly_api_quota?.toLocaleString() || '1,000'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <Card 
                style={{
                  background: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(12px)',
                  borderColor: colors.semantic.info + '20',
                  boxShadow: shadows.md,
                  borderRadius: borderRadius.xl,
                }}
              >
                <CardContent style={{ padding: spacing.md }}>
                  <div className="flex items-center gap-3">
                    <div style={{ padding: spacing.sm, background: colors.semantic.info + '20', borderRadius: borderRadius.lg }}>
                      <BarChart3 style={{ width: '20px', height: '20px', color: colors.semantic.info }} />
                    </div>
                    <div>
                      <p style={{ fontSize: typography.fontSize.xs[0], color: colors.neutral[500] }}>This Month</p>
                      <p style={{ fontSize: typography.fontSize.lg[0], fontWeight: typography.fontWeight.semibold, color: colors.neutral[900] }}>
                        {businessProfile?.current_month_usage?.toLocaleString() || '0'} requests
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <Card 
                style={{
                  background: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(12px)',
                  borderColor: colors.semantic.success + '20',
                  boxShadow: shadows.md,
                  borderRadius: borderRadius.xl,
                }}
              >
                <CardContent style={{ padding: spacing.md }}>
                  <div className="flex items-center gap-3">
                    <div style={{ padding: spacing.sm, background: colors.semantic.success + '20', borderRadius: borderRadius.lg }}>
                      <Sparkles style={{ width: '20px', height: '20px', color: colors.semantic.success }} />
                    </div>
                    <div>
                      <p style={{ fontSize: typography.fontSize.xs[0], color: colors.neutral[500] }}>Status</p>
                      <p style={{ fontSize: typography.fontSize.lg[0], fontWeight: typography.fontWeight.semibold, color: colors.semantic.success }}>
                        {businessProfile?.is_verified ? 'Verified' : 'Active'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Desktop Navigation */}
          {!isMobile && (
            <TabsList className="bg-white border border-gray-200 p-1 w-full justify-start overflow-x-auto flex-nowrap h-auto">
            <TabsTrigger 
              value="overview" 
              className="gap-2 min-w-fit"
              style={{
                color: activeTab === 'overview' ? colors.white : colors.neutral[700],
                backgroundColor: activeTab === 'overview' ? colors.neutral[900] : 'transparent',
                fontWeight: typography.fontWeight.semibold
              }}
            >
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="api-keys" 
              className="gap-2 min-w-fit"
              style={{
                color: activeTab === 'api-keys' ? colors.white : colors.neutral[700],
                backgroundColor: activeTab === 'api-keys' ? colors.neutral[900] : 'transparent',
                fontWeight: typography.fontWeight.semibold
              }}
            >
              <Key className="w-4 h-4" />
              API Keys
            </TabsTrigger>
            <TabsTrigger 
              value="team" 
              className="gap-2 min-w-fit"
              style={{
                color: activeTab === 'team' ? colors.white : colors.neutral[700],
                backgroundColor: activeTab === 'team' ? colors.neutral[900] : 'transparent',
                fontWeight: typography.fontWeight.semibold
              }}
            >
              <Users className="w-4 h-4" />
              Team
            </TabsTrigger>
            <TabsTrigger 
              value="verify" 
              className="gap-2 min-w-fit"
              style={{
                color: activeTab === 'verify' ? colors.white : colors.neutral[700],
                backgroundColor: activeTab === 'verify' ? colors.neutral[900] : 'transparent',
                fontWeight: typography.fontWeight.semibold
              }}
            >
              <Shield className="w-4 h-4" />
              Verify Identity
            </TabsTrigger>
            <TabsTrigger 
              value="docs" 
              className="gap-2 min-w-fit"
              style={{
                color: activeTab === 'docs' ? colors.white : colors.neutral[700],
                backgroundColor: activeTab === 'docs' ? colors.neutral[900] : 'transparent',
                fontWeight: typography.fontWeight.semibold
              }}
            >
              <BookOpen className="w-4 h-4" />
              Documentation
            </TabsTrigger>
            <TabsTrigger 
              value="webhooks" 
              className="gap-2 min-w-fit"
              style={{
                color: activeTab === 'webhooks' ? colors.white : colors.neutral[700],
                backgroundColor: activeTab === 'webhooks' ? colors.neutral[900] : 'transparent',
                fontWeight: typography.fontWeight.semibold
              }}
            >
              <Webhook className="w-4 h-4" />
              Webhooks
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="gap-2 min-w-fit"
              style={{
                color: activeTab === 'settings' ? colors.white : colors.neutral[700],
                backgroundColor: activeTab === 'settings' ? colors.neutral[900] : 'transparent',
                fontWeight: typography.fontWeight.semibold
              }}
            >
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>
          )}

          {/* Mobile Navigation */}
          {isMobile && (
            <MobileBottomNav activeTab={activeTab} onTabChange={setActiveTab} />
          )}

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <APIUsageDashboard />
          </TabsContent>

          {/* API Keys Tab */}
          <TabsContent value="api-keys">
            {featureLoading ? (
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardContent className="p-12 text-center">
                  <p className="text-gray-500">Loading access permissions...</p>
                </CardContent>
              </Card>
            ) : (
              <FeatureLockInline
                isUnlocked={access?.canAccessApiKeys || false}
                currentCompletion={access?.profileCompletionPercentage || 0}
                requiredCompletion={80}
                featureName="API Keys"
                onNavigateToSettings={() => setActiveTab('settings')}
              >
                <APIKeysManager />
              </FeatureLockInline>
            )}
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team">
            <TeamManager businessId={businessProfile?.id} />
          </TabsContent>

          {/* Documentation Tab */}
          <TabsContent value="docs">
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardContent className="p-12 text-center">
                <BookOpen className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  API Documentation
                </h3>
                <p className="text-gray-500 mb-6">
                  Complete reference for integrating GidiPIN into your application
                </p>
                <div className="space-y-4 max-w-2xl mx-auto text-left">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2">PIN Verification API</h4>
                    <code className="text-sm text-purple-600">POST /api/v1/verify</code>
                    <p className="text-sm text-gray-500 mt-2">
                      Verify if a PIN exists and get basic professional information
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2">Professional Data API</h4>
                    <code className="text-sm text-purple-600">GET /api/v1/professional/:pin</code>
                    <p className="text-sm text-gray-500 mt-2">
                      Access detailed professional data with consent
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2">Instant Sign-In</h4>
                    <code className="text-sm text-purple-600">POST /api/v1/signin/initiate</code>
                    <p className="text-sm text-gray-500 mt-2">
                      OAuth-like flow for user authentication
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Webhooks Tab */}
          <TabsContent value="webhooks">
            {featureLoading ? (
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardContent className="p-12 text-center">
                  <p className="text-gray-500">Loading access permissions...</p>
                </CardContent>
              </Card>
            ) : (
              <FeatureLockInline
                isUnlocked={access?.canAccessWebhooks || false}
                currentCompletion={access?.profileCompletionPercentage || 0}
                requiredCompletion={100}
                featureName="Webhooks"
                onNavigateToSettings={() => setActiveTab('settings')}
              >
                <WebhooksManager businessId={businessProfile?.id} isLoading={loading} />
              </FeatureLockInline>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <BusinessSettings 
              businessId={businessProfile?.id} 
              initialProfile={businessProfile} 
              onProfileUpdate={fetchBusinessProfile}
            />
          </TabsContent>

          {/* Verify Identity Tab */}
          <TabsContent value="verify">
             <IdentityVerificationTool />
          </TabsContent>
        </Tabs>
        
      </div>
    </div>
  );
}
