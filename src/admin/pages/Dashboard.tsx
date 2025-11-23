import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Users, Activity, CheckCircle, TrendingUp, Building, GraduationCap, Clock, Shield } from 'lucide-react';
import { UserGrowthChart } from '../components/charts/UserGrowthChart';
import { ActivityChart } from '../components/charts/ActivityChart';
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
  const [stats, setStats] = useState<DashboardStats>({
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
    window.location.href = '/';
  };

  return (
    <AdminLayout breadcrumbs={['Overview']} onLogout={handleLogout}>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-semibold" style={{ color: '#0A2540' }}>
            Overview
          </h1>
          <p className="text-gray-600 mt-1">
            Complete system metrics and operational insights
          </p>
        </div>

        {/* Top Metrics Row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Users"
            value={stats.totalUsers.toLocaleString()}
            icon={<Users className="h-5 w-5" style={{ color: '#445DFF' }} />}
            trend="+12.5%"
            trendUp={true}
          />
          <StatCard
            title="Active Professionals"
            value={stats.activeProfessionals.toLocaleString()}
            icon={<Shield className="h-5 w-5" style={{ color: '#445DFF' }} />}
            trend="+8.2%"
            trendUp={true}
          />
          <StatCard
            title="Daily Signups"
            value={stats.dailySignups.toString()}
            icon={<TrendingUp className="h-5 w-5" style={{ color: '#32F08C' }} />}
            trend="+23.1%"
            trendUp={true}
          />
          <StatCard
            title="Email Verification Rate"
            value={`${stats.emailVerificationRate}%`}
            icon={<CheckCircle className="h-5 w-5" style={{ color: '#32F08C' }} />}
            trend="+2.3%"
            trendUp={true}
          />
        </div>

        {/* Second Metrics Row */}
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="PIN Activation Rate"
            value={`${stats.pinActivationRate}%`}
            icon={<Activity className="h-5 w-5" style={{ color: '#445DFF' }} />}
            trend="+5.7%"
            trendUp={true}
          />
          <StatCard
            title="API Integrations"
            value={stats.apiIntegrations.toString()}
            icon={<Building className="h-5 w-5" style={{ color: '#445DFF' }} />}
            trend="+3"
            trendUp={true}
          />
          <StatCard
            title="Active Business Partners"
            value={stats.activePartners.toString()}
            icon={<GraduationCap className="h-5 w-5" style={{ color: '#445DFF' }} />}
            trend="+12"
            trendUp={true}
          />
        </div>

        {/* Charts Section */}
        <div className="grid gap-4 md:grid-cols-3">
          <UserGrowthChart />
          <ActivityChart />
        </div>

        {/* Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: 'New user registration', user: 'Adebayo Jones', type: 'professional', time: '2 minutes ago' },
                { action: 'API key created', user: 'TechCorp Solutions', type: 'employer', time: '15 minutes ago' },
                { action: 'Endorsement approved', user: 'Chioma Okonkwo', type: 'professional', time: '32 minutes ago' },
                { action: 'KYC verification completed', user: 'Lagos State University', type: 'university', time: '1 hour ago' },
                { action: 'PIN activated', user: 'Ibrahim Mohammed', type: 'professional', time: '2 hours ago' },
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#1B1F23' }}>
                        {activity.action}
                      </p>
                      <p className="text-xs text-gray-500">
                        {activity.user} • {activity.type}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <SystemHealth />
      </div>
    </AdminLayout>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
}

function StatCard({ title, value, icon, trend, trendUp }: StatCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-semibold" style={{ color: '#0A2540' }}>
              {value}
            </p>
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp
                  className={`h-3 w-3 ${trendUp ? 'text-green-500' : 'text-red-500'}`}
                  style={{ transform: trendUp ? 'none' : 'rotate(180deg)' }}
                />
                <span
                  className={`text-xs font-medium ${trendUp ? 'text-green-600' : 'text-red-600'}`}
                >
                  {trend}
                </span>
                <span className="text-xs text-gray-500">from last month</span>
              </div>
            )}
          </div>
          <div className="h-12 w-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#F5F6FA' }}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default AdminDashboard;
