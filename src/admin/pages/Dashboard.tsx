import React, { useState } from 'react';
import { 
  Users, 
  Shield, 
  TrendingUp, 
  CheckCircle, 
  Activity, 
  Building, 
  GraduationCap, 
  Clock 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminLayout } from '../layouts/AdminLayout';
import { SystemHealth } from '../components/SystemHealth';

interface DashboardStats {
  totalUsers: number;
  activeProfessionals: number;
  dailySignups: number;
  emailVerificationRate: number;
  pinActivationRate: number;
  apiIntegrations: number;
  activePartners: number;
  endorsementActivity: number;
}

export function AdminDashboard() {
  console.log('AdminDashboard mounting...');
  const [stats] = useState<DashboardStats>({
    totalUsers: 12847,
    activeProfessionals: 8452,
    dailySignups: 342,
    emailVerificationRate: 87.3,
    pinActivationRate: 92.1,
    apiIntegrations: 48,
    activePartners: 127,
    endorsementActivity: 1249,
  });

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminSession');
    localStorage.removeItem('adminRole');
    window.location.href = '/';
  };

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
                {((stats.activeProfessionals / stats.totalUsers) * 100).toFixed(1)}% of total
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

        {/* System Health */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">System Health</h2>
          <SystemHealth />
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {[
                  { action: 'New user registration', user: 'john@example.com', time: '2 minutes ago', icon: Users },
                  { action: 'Profile verified', user: 'sarah@company.com', time: '15 minutes ago', icon: Shield },
                  { action: 'API key generated', user: 'TechCorp Ltd.', time: '1 hour ago', icon: Activity },
                  { action: 'Endorsement created', user: 'mike@startup.io', time: '3 hours ago', icon: CheckCircle },
                ].map((item, index) => (
                  <div key={index} className="flex items-center">
                    <div className="mr-4 p-2 bg-blue-50 rounded-full">
                      <item.icon className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{item.action}</p>
                      <p className="text-xs text-gray-500">{item.user}</p>
                    </div>
                    <div className="flex items-center text-xs text-gray-400">
                      <Clock className="h-3 w-3 mr-1" />
                      {item.time}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;
