import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { supabase } from '../utils/supabase/client';
import { APIKeysManager } from './developer/APIKeysManager';
import { APIUsageDashboard } from './developer/APIUsageDashboard';
import {
  Key,
  BarChart3,
  Code2,
  BookOpen,
  Webhook,
  Settings,
  Sparkles,
  Zap
} from 'lucide-react';

export function DeveloperConsole() {
  const [businessProfile, setBusinessProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBusinessProfile();
  }, []);

  const fetchBusinessProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setBusinessProfile(data);
    } catch (error: any) {
      console.error('Error fetching business profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-100 flex items-center gap-3">
                <Code2 className="w-8 h-8 text-purple-400" />
                Developer Console
              </h1>
              <p className="text-gray-400 mt-2">
                {businessProfile?.company_name || 'Welcome to GidiPIN API'}
              </p>
            </div>
            <Badge 
              variant="outline" 
              className="text-lg px-4 py-2 border-purple-500 text-purple-400"
            >
              {businessProfile?.api_tier?.toUpperCase() || 'FREE'} Tier
            </Badge>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border-purple-500/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Zap className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Monthly Quota</p>
                    <p className="text-lg font-semibold text-gray-100">
                      {businessProfile?.monthly_api_quota?.toLocaleString() || '1,000'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border-blue-500/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">This Month</p>
                    <p className="text-lg font-semibold text-gray-100">
                      {businessProfile?.current_month_usage?.toLocaleString() || '0'} requests
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-900/30 to-green-800/20 border-green-500/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Sparkles className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Status</p>
                    <p className="text-lg font-semibold text-green-400">
                      {businessProfile?.is_verified ? 'Verified' : 'Active'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Main Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-gray-800/50 border border-gray-700 p-1">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="api-keys" className="gap-2">
              <Key className="w-4 h-4" />
              API Keys
            </TabsTrigger>
            <TabsTrigger value="docs" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Documentation
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="gap-2">
              <Webhook className="w-4 h-4" />
              Webhooks
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
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
            <APIKeysManager />
          </TabsContent>

          {/* Documentation Tab */}
          <TabsContent value="docs">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-12 text-center">
                <BookOpen className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-100 mb-2">
                  API Documentation
                </h3>
                <p className="text-gray-400 mb-6">
                  Complete reference for integrating GidiPIN into your application
                </p>
                <div className="space-y-4 max-w-2xl mx-auto text-left">
                  <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                    <h4 className="font-semibold text-gray-100 mb-2">PIN Verification API</h4>
                    <code className="text-sm text-purple-400">POST /api/v1/verify</code>
                    <p className="text-sm text-gray-400 mt-2">
                      Verify if a PIN exists and get basic professional information
                    </p>
                  </div>
                  <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                    <h4 className="font-semibold text-gray-100 mb-2">Professional Data API</h4>
                    <code className="text-sm text-purple-400">GET /api/v1/professional/:pin</code>
                    <p className="text-sm text-gray-400 mt-2">
                      Access detailed professional data with consent
                    </p>
                  </div>
                  <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                    <h4 className="font-semibold text-gray-100 mb-2">Instant Sign-In</h4>
                    <code className="text-sm text-purple-400">POST /api/v1/signin/initiate</code>
                    <p className="text-sm text-gray-400 mt-2">
                      OAuth-like flow for user authentication
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Webhooks Tab */}
          <TabsContent value="webhooks">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-12 text-center">
                <Webhook className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-100 mb-2">
                  Webhooks
                </h3>
                <p className="text-gray-400">
                  Configure webhooks to receive real-time notifications (Coming Soon)
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-12 text-center">
                <Settings className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-100 mb-2">
                  Settings
                </h3>
                <p className="text-gray-400">
                  Configure your business profile and API preferences (Coming Soon)
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
