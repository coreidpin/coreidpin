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
  Bell,
  ArrowUpRight,
  Sparkles
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
import { cn } from '@/lib/utils';

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

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user': return 'bg-blue-100/50 text-blue-600';
      case 'security': return 'bg-amber-100/50 text-amber-600';
      case 'api': return 'bg-indigo-100/50 text-indigo-600';
      case 'endorsement': return 'bg-emerald-100/50 text-emerald-600';
      default: return 'bg-neutral-100 text-neutral-600';
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
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neutral-900 to-neutral-600">
            Overview
          </h1>
          <p className="text-sm md:text-base text-neutral-500 mt-1">
            Welcome back, Super Admin
          </p>
        </div>
        
        {/* Quick Actions */}
        <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
          <div className="flex gap-2 w-full sm:w-auto">
             <Button
                variant="outline"
                size="sm"
                className="bg-white border-neutral-200 hover:bg-neutral-50 text-neutral-700 shadow-sm transition-all duration-200 hover:shadow-md"
                onClick={() => window.location.href = '/admin/announcements'}
              >
                <Bell className="h-4 w-4 mr-2" />
                Announcements
              </Button>
            <Button
              size="sm"
              className="bg-brand-primary-600 hover:bg-brand-primary-700 text-white shadow-md shadow-brand-primary-500/20 transition-all duration-200 hover:shadow-lg hover:scale-105"
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
            </Button>
          </div>
        </div>
      </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 animate-[slideInUp_0.5s_cubic-bezier(0.16,1,0.3,1)]">
          {[
            {
              title: "Total Users",
              value: stats.totalUsers.toLocaleString(),
              subtext: `+${stats.dailySignups} today`,
              icon: Users,
              color: "text-blue-600",
              bgColor: "bg-blue-50",
              trend: "up"
            },
            {
              title: "Active Professionals",
              value: stats.activeProfessionals.toLocaleString(),
              subtext: `${stats.totalUsers > 0 ? ((stats.activeProfessionals / stats.totalUsers) * 100).toFixed(1) : 0}% of total`,
              icon: GraduationCap,
              color: "text-indigo-600",
              bgColor: "bg-indigo-50",
              trend: "neutral"
            },
            {
              title: "Active Partners",
              value: stats.activePartners,
              subtext: `${stats.apiIntegrations} API integrations`,
              icon: Building,
              color: "text-amber-600",
              bgColor: "bg-amber-50",
              trend: "up"
            },
            {
              title: "Endorsement Activity",
              value: stats.endorsementActivity.toLocaleString(),
              subtext: "This month",
              icon: CheckCircle,
              color: "text-emerald-600",
              bgColor: "bg-emerald-50",
              trend: "up"
            }
          ].map((stat, i) => (
            <Card key={i} className="group overflow-hidden border-neutral-200/60 shadow-sm hover:shadow-xl hover:shadow-brand-primary-500/5 transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-neutral-500">{stat.title}</CardTitle>
                <div className={cn("p-2 rounded-lg transition-colors duration-300 group-hover:bg-white", stat.bgColor)}>
                  <stat.icon className={cn("h-4 w-4", stat.color)} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-neutral-900">{stat.value}</div>
                <div className="flex items-center mt-1 text-xs text-neutral-500">
                  {stat.trend === 'up' && <ArrowUpRight className="h-3 w-3 mr-1 text-emerald-500" />}
                  {stat.subtext}
                </div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-primary-500/20 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Analytics Section */}
        <div className="space-y-8 animate-[slideInUp_0.6s_cubic-bezier(0.16,1,0.3,1)] delay-100">
          <div className="flex items-center gap-3">
             <div className="p-1.5 bg-brand-primary-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-brand-primary-600" />
            </div>
            <h2 className="text-xl font-bold text-neutral-900">Analytics Overview</h2>
          </div>

          <Card className="border-neutral-200/60 shadow-sm overflow-hidden">
             <CardContent className="p-0">
               <UserGrowthChart />
             </CardContent>
          </Card>
          
          <div className="grid gap-6 lg:grid-cols-2">
            <UserTypeBreakdown />
            <SystemHealth />
          </div>

          <PINActivationFunnel />
        </div>

        {/* Recent Activity Section */}
        <div className="animate-[slideInUp_0.7s_cubic-bezier(0.16,1,0.3,1)] delay-200">
           <div className="flex items-center gap-3 mb-4">
             <div className="p-1.5 bg-brand-primary-100 rounded-lg">
              <Clock className="h-5 w-5 text-brand-primary-600" />
            </div>
            <h2 className="text-xl font-bold text-neutral-900">Recent Activity</h2>
          </div>
          
          <Card className="border-neutral-200/60 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="divide-y divide-neutral-100">
                {recentActivity.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-neutral-400">
                      <Clock className="h-12 w-12 mb-3 opacity-20" />
                      <p>No recent activity found</p>
                    </div>
                ) : (
                    recentActivity.map((item, index) => {
                      const Icon = getActivityIcon(item.type);
                      const colorClass = getActivityColor(item.type);
                      
                      return (
                        <div key={item.id || index} className="flex items-center p-4 hover:bg-neutral-50/50 transition-colors duration-200 group">
                          <div className={cn("mr-4 p-2.5 rounded-full shrink-0 transition-transform duration-300 group-hover:scale-110", colorClass)}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-neutral-900 truncate group-hover:text-brand-primary-600 transition-colors">{item.action}</p>
                            <p className="text-xs text-neutral-500 truncate">{item.user}</p>
                          </div>
                          <div className="flex items-center text-xs text-neutral-400 font-medium bg-white px-2 py-1 rounded-full border border-neutral-100 shadow-sm">
                            <Clock className="h-3 w-3 mr-1.5" />
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
