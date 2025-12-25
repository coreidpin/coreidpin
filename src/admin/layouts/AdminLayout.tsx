import React, { useState, Fragment } from 'react';
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
  ChevronRight,
  TrendingUp,
  Map
} from 'lucide-react';
import { checkAdminAccess } from '../utils/auth';
import { useIsMobile } from '@/components/ui/use-mobile';

interface AdminLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: string[];
  onLogout?: () => void;
}

const navigationGroups = [
  {
    title: 'ANALYTICS',
    items: [
      { icon: LayoutDashboard, label: 'Overview', path: '/admin/dashboard' },
      { icon: TrendingUp, label: 'Engagement', path: '/admin/engagement' },
      { icon: Activity, label: 'Performance', path: '/admin/performance' },
      { icon: Map, label: 'Geographic', path: '/admin/geographic' },
      { icon: FileText, label: 'Reports', path: '/admin/reports' },
      { icon: Activity, label: 'Activity Logs', path: '/admin/logs' },
    ]
  },
  {
    title: 'MANAGEMENT',
    items: [
      { icon: Users, label: 'Users', path: '/admin/users' },
      { icon: Shield, label: 'Endorsements', path: '/admin/endorsements' },
      { icon: FileText, label: 'Projects', path: '/admin/projects' },
    ]
  },
  {
    title: 'SYSTEM',
    items: [
      { icon: Building, label: 'Integrations', path: '/admin/integrations' },
      { icon: Settings, label: 'Settings', path: '/admin/settings' },
    ]
  }
];

export function AdminLayout({ children, breadcrumbs = [], onLogout }: AdminLayoutProps) {
  const isMobile = useIsMobile();
  const hasAccess = checkAdminAccess();
  const location = useLocation();
  
  // State for mobile drawer
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  // State for desktop collapse
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  if (!hasAccess) {
    return <Navigate to="/admin/login" replace />;
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

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  // Calculate sidebar width based on state
  const sidebarWidth = isMobile ? '280px' : (isCollapsed ? '80px' : '280px');
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Overlay */}
      {isMobile && isMobileOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out bg-[#0A2540] ${
          isMobile 
            ? (isMobileOpen ? 'translate-x-0' : '-translate-x-full') 
            : 'translate-x-0'
        }`}
        style={{ 
          width: sidebarWidth,
          backgroundColor: '#0A2540', // Force background color
          overflowX: 'hidden' // Force overflow hidden
        }}
      >
        <div className="h-full flex flex-col w-[280px]"> {/* Fixed internal width to prevent content squishing */}
          {/* Logo */}
          <div className="px-6 py-5 border-b border-white/10 h-[80px] flex items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#445DFF' }}>
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div 
                className={`transition-opacity duration-200 ${isCollapsed && !isMobile ? 'opacity-0' : 'opacity-100'}`}
                style={{ display: isCollapsed && !isMobile ? 'none' : 'block' }} 
              >
                <h1 className="text-xl font-bold text-white">GidiPIN</h1>
                <p className="text-xs text-gray-400">Admin Portal</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto overflow-x-hidden">
            {navigationGroups.map((group) => (
              <div key={group.title}>
                <h3 
                  className={`px-3 mb-2 text-xs font-semibold text-gray-500 tracking-wider transition-opacity duration-200 ${
                    isCollapsed && !isMobile ? 'opacity-0' : 'opacity-100'
                  }`}
                  style={{ display: isCollapsed && !isMobile ? 'none' : 'block' }}
                >
                  {group.title}
                </h3>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;
                    
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        title={isCollapsed && !isMobile ? item.label : undefined}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all whitespace-nowrap ${
                          isActive 
                            ? 'bg-[#445DFF] text-white shadow-lg shadow-[#445DFF]/20' 
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <Icon className="h-5 w-5 shrink-0" />
                        <span 
                          className={`font-medium transition-opacity duration-200 ${
                            isCollapsed && !isMobile ? 'opacity-0' : 'opacity-100'
                          }`}
                          style={{ display: isCollapsed && !isMobile ? 'none' : 'block' }}
                        >
                          {item.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* User section */}
          <div className="px-3 py-4 border-t border-white/10">
            <div className={`flex items-center gap-3 px-3 py-2.5 mb-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer ${isCollapsed && !isMobile ? 'justify-center' : ''}`}>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#445DFF] to-[#32F08C] flex items-center justify-center shrink-0">
                <span className="text-white font-semibold text-xs">SA</span>
              </div>
              <div 
                className={`flex-1 min-w-0 transition-opacity duration-200 ${isCollapsed && !isMobile ? 'opacity-0' : 'opacity-100'}`}
                style={{ display: isCollapsed && !isMobile ? 'none' : 'block' }}
              >
                <p className="text-sm font-medium text-white truncate">Super Admin</p>
                <p className="text-xs text-gray-400 truncate">admin@gidipin.work</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:bg-red-500/10 hover:text-red-400 transition-colors ${
                isCollapsed && !isMobile ? 'justify-center' : ''
              }`}
            >
              <LogOut className="h-5 w-5 shrink-0" />
              <span 
                className={`font-medium transition-opacity duration-200 ${
                  isCollapsed && !isMobile ? 'opacity-0' : 'opacity-100'
                }`}
                style={{ display: isCollapsed && !isMobile ? 'none' : 'block' }}
              >
                Logout
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div 
        className="transition-all duration-300 ease-in-out"
        style={{ marginLeft: isMobile ? 0 : (isCollapsed ? '80px' : '280px') }}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="px-4 py-3 md:px-6 md:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleSidebar}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Menu className="h-5 w-5 text-gray-600" />
                </button>
                
                {/* Breadcrumbs */}
                {breadcrumbs.length > 0 && (
                  <nav className="hidden sm:flex items-center gap-2 overflow-x-auto">
                    <span className="text-sm text-gray-500">Admin</span>
                    {breadcrumbs.map((crumb, index) => (
                      <Fragment key={index}>
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
                      </Fragment>
                    ))}
                  </nav>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
