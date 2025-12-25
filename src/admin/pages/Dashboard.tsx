import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Shield, 
  TrendingUp, 
  CheckCircle, 
  Activity, 
  Building, 
  GraduationCap, 
  Clock,
  Download,
  Bell
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AdminLayout } from '../layouts/AdminLayout';
import { SystemHealth } from '../components/SystemHealth';
import { UserGrowthChart } from '../components/analytics/UserGrowthChart';
import { UserTypeBreakdown } from '../components/analytics/UserTypeBreakdown';
import { PINActivationFunnel } from '../components/analytics/PINActivationFunnel';
import { dashboardService, DashboardStats, RecentActivityItem } from '../services/dashboard.service';
import { analyticsService } from '../services/analytics.service';
import { toast } from '../utils/toast';

import { AdminDashboardSkeleton } from '../components/AdminDashboardSkeleton';

export function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeProfessionals: 0,
    dailySignups: 0,
    emailVerificationRate: 0,
    pinActivationRate: 0,
    apiIntegrations: 0,
    activePartners: 0,
    endorsementActivity: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>([]);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setIsLoading(true);
        // Run in parallel
        const [statsData, activityData] = await Promise.all([
          dashboardService.getDashboardStats(),
          dashboardService.getRecentActivity()
        ]);
        setStats(statsData);
        setRecentActivity(activityData);
      } catch (error) {
        console.error('Failed to load dashboard data', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminSession');
    localStorage.removeItem('adminRole');
    window.location.href = '/';
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user': return Users;
      case 'security': return Shield;
      case 'api': return Activity;
      case 'endorsement': return CheckCircle;
      default: return Activity;
    }
  };

  if (isLoading) {
    return (
      <AdminLayout breadcrumbs={['Overview']} onLogout={handleLogout}>
        <AdminDashboardSkeleton />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout breadcrumbs={['Overview']} onLogout={handleLogout}>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here's what's happening with your platform.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.dailySignups} today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Professionals</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeProfessionals.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalUsers > 0 
                  ? ((stats.activeProfessionals / stats.totalUsers) * 100).toFixed(1) 
                  : 0}% of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Partners</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activePartners}</div>
              <p className="text-xs text-muted-foreground">
                {stats.apiIntegrations} API integrations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Endorsement Activity</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.endorsementActivity.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Bar */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Quick Actions</h3>
                <p className="text-xs text-gray-600 mt-0.5">Common administrative tasks</p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white hover:bg-gray-50"
                  onClick={async () => {
                    try {
                      const blob = await analyticsService.exportUsers();
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
                      a.click();
                      URL.revokeObjectURL(url);
                      toast.success('Users exported successfully');
                    } catch (error) {
                      toast.error('Failed to export users');
                    }
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Users
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white hover:bg-gray-50"
                  onClick={() => toast.info('Announcement feature coming soon!')}
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Send Announcement
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Section */}
        <div className="space-y-8">
          {/* Section Header */}
          <div className="flex items-center gap-3">
            <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-900">Analytics Overview</h2>
          </div>

          {/* User Growth - Full Width */}
          <UserGrowthChart />
          
          {/* Two Column Layout - Balanced */}
          <div className="grid gap-6 lg:grid-cols-2">
            <UserTypeBreakdown />
            <SystemHealth />
          </div>

          {/* PIN Funnel - Full Width */}
          <PINActivationFunnel />
        </div>

        {/* Recent Activity Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {recentActivity.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">No recent activity found</div>
                ) : (
                    recentActivity.map((item, index) => {
                      const Icon = getActivityIcon(item.type);
                      return (
                        <div key={item.id || index} className="flex items-center">
                          <div className="mr-4 p-2 bg-blue-50 rounded-full">
                            <Icon className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{item.action}</p>
                            <p className="text-xs text-gray-500">{item.user}</p>
                          </div>
                          <div className="flex items-center text-xs text-gray-400">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;
