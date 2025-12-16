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
import { WelcomeModal } from './onboarding/WelcomeModal';
import { NotificationPermissionModal } from './onboarding/NotificationPermissionModal';
import { useOnboarding } from '../hooks/useOnboarding';
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
  const { access, loading: featureLoading } = useFeatureGate();
  
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

  useEffect(() => {
    fetchBusinessProfile();
  }, []);

  const fetchBusinessProfile = async () => {
    console.log('🔄 Fetching business profile...');
    setLoading(true);
    
    try {
      // Get userId and tokens from localStorage (custom OTP auth)
      const userId = localStorage.getItem('userId');
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!userId) {
        console.log('❌ No userId in localStorage');
        setBusinessProfile(null);
        setLoading(false);
        return;
      }

      console.log('👤 User ID from localStorage:', userId);

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
            console.log('✅ Supabase session synchronized');
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
          console.log('⚠️ No business profile found for user');
          setBusinessProfile(null);
          return;
        }
        
        // Real error
        console.error('❌ Error fetching business profile:', error);
        throw error;
      }

      if (data) {
        console.log('✅ Business profile found:', data);
        setBusinessProfile(data);
      } else {
        console.log('⚠️ No business profile found');
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
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <LayoutDashboard className="w-8 h-8 text-purple-600" />
                Business Console
              </h1>
              <p className="text-gray-500 mt-2">
                {businessProfile?.company_name || 'Welcome to GidiPIN API'}
              </p>
            </div>
            <Badge 
              variant="outline" 
              className="text-lg px-4 py-2 border-purple-200 text-purple-700 bg-purple-50"
            >
              {businessProfile?.api_tier?.toUpperCase() || 'FREE'} Tier
            </Badge>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card className="bg-white border-purple-100 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Zap className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Monthly Quota</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {businessProfile?.monthly_api_quota?.toLocaleString() || '1,000'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-blue-100 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">This Month</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {businessProfile?.current_month_usage?.toLocaleString() || '0'} requests
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-green-100 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Sparkles className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <p className="text-lg font-semibold text-green-600">
                      {businessProfile?.is_verified ? 'Verified' : 'Active'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border border-gray-200 p-1 w-full justify-start overflow-x-auto flex-nowrap h-auto">
            <TabsTrigger value="overview" className="gap-2 text-gray-700 data-[state=active]:text-black data-[state=active]:bg-gray-100 min-w-fit">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="api-keys" className="gap-2 text-gray-700 data-[state=active]:text-black data-[state=active]:bg-gray-100 min-w-fit">
              <Key className="w-4 h-4" />
              API Keys
            </TabsTrigger>
            <TabsTrigger value="team" className="gap-2 text-gray-700 data-[state=active]:text-black data-[state=active]:bg-gray-100 min-w-fit">
              <Users className="w-4 h-4" />
              Team
            </TabsTrigger>
             <TabsTrigger value="verify" className="gap-2 text-gray-700 data-[state=active]:text-black data-[state=active]:bg-gray-100 min-w-fit">
              <Shield className="w-4 h-4" />
              Verify Identity
            </TabsTrigger>
            <TabsTrigger value="docs" className="gap-2 text-gray-700 data-[state=active]:text-black data-[state=active]:bg-gray-100 min-w-fit">
              <BookOpen className="w-4 h-4" />
              Documentation
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="gap-2 text-gray-700 data-[state=active]:text-black data-[state=active]:bg-gray-100 min-w-fit">
              <Webhook className="w-4 h-4" />
              Webhooks
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2 text-gray-700 data-[state=active]:text-black data-[state=active]:bg-gray-100 min-w-fit">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

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
        
        {/* Onboarding Modals */}
        <WelcomeModal
          isOpen={showWelcome}
          onClose={closeWelcome}
          onGetStarted={completeWelcome}
          userName={businessProfile?.company_name}
        />

        <NotificationPermissionModal
          isOpen={showNotificationPermission}
          onClose={closeNotification}
          onAllow={handleNotificationAllow}
          onDeny={handleNotificationDeny}
        />
      </div>
    </div>
  );
}
