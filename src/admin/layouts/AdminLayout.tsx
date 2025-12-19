import React, { useState } from 'react';
import { Navigate, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Building, 
  Settings, 
  Shield,
  Activity,
  FileText,
  LogOut,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { checkAdminAccess } from '../utils/auth';

interface AdminLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: string[];
  onLogout?: () => void;
}

const navigationItems = [
  { icon: LayoutDashboard, label: 'Overview', path: '/admin/dashboard' },
  { icon: Users, label: 'Users', path: '/admin/users' },
  { icon: Building, label: 'Integrations', path: '/admin/integrations' },
  { icon: Shield, label: 'Endorsements', path: '/admin/endorsements' },
  { icon: Activity, label: 'Activity Logs', path: '/admin/logs' },
  { icon: FileText, label: 'Projects', path: '/admin/projects' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

export function AdminLayout({ children, breadcrumbs = [], onLogout }: AdminLayoutProps) {
  console.log('[AdminLayout] Rendering with breadcrumbs:', breadcrumbs);
  const hasAccess = checkAdminAccess();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  console.log('[AdminLayout] hasAccess:', hasAccess, 'location:', location.pathname);
  
  if (!hasAccess) {
    console.log('[AdminLayout] Access denied, redirecting to /');
    return <Navigate to="/" replace />;
  }

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('adminSession');
      localStorage.removeItem('adminRole');
      window.location.href = '/';
    }
  };
  
  console.log('[AdminLayout] Rendering layout with sidebar');
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 z-40 h-screen transition-transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ width: '280px', backgroundColor: '#0A2540' }}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="px-6 py-5 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#445DFF' }}>
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">GidiPIN</h1>
                <p className="text-xs text-gray-400">Admin Portal</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    isActive 
                      ? 'bg-[#445DFF] text-white' 
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#445DFF] to-[#32F08C] flex items-center justify-center">
                <span className="text-white font-semibold text-sm">SA</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">Super Admin</p>
                <p className="text-xs text-gray-400 truncate">admin@gidipin.work</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-gray-300 hover:bg-red-500/10 hover:text-red-400 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div 
        className={`transition-all ${isSidebarOpen ? 'ml-[280px]' : 'ml-0'}`}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {isSidebarOpen ? (
                    <X className="h-5 w-5 text-gray-600" />
                  ) : (
                    <Menu className="h-5 w-5 text-gray-600" />
                  )}
                </button>
                
                {/* Breadcrumbs */}
                {breadcrumbs.length > 0 && (
                  <nav className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Admin</span>
                    {breadcrumbs.map((crumb, index) => (
                      <React.Fragment key={index}>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                        <span 
                          className={`text-sm ${
                            index === breadcrumbs.length - 1 
                              ? 'text-gray-900 font-medium' 
                              : 'text-gray-500'
                          }`}
                        >
                          {crumb}
                        </span>
                      </React.Fragment>
                    ))}
                  </nav>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
