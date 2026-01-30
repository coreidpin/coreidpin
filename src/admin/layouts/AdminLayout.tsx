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
  Map,
  DollarSign,
  Bell,
  Mail,
  Folder
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
      { icon: DollarSign, label: 'Revenue', path: '/admin/revenue' },
      { icon: Activity, label: 'Audit Logs', path: '/admin/audit' },
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
      { icon: Bell, label: 'Announcements', path: '/admin/announcements' },
      { icon: Mail, label: 'Email System', path: '/admin/emails' },
      { icon: Folder, label: 'Content Management', path: '/admin/content' },
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
    <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900 selection:bg-brand-100 selection:text-brand-900">
      {/* Mobile Overlay with Fade Animation */}
      <div 
        className={`fixed inset-0 z-30 bg-neutral-950/50 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${
          isMobile && isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileOpen(false)}
      />

      {/* Sidebar with Slide/Collapse Animation */}
      <aside 
        className={`fixed top-0 left-0 z-40 h-screen shadow-xl transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden bg-neutral-950 border-r border-white/5 ${
          isMobile 
            ? (isMobileOpen ? 'translate-x-0' : '-translate-x-full') 
            : 'translate-x-0'
        }`}
        style={{ 
          width: sidebarWidth,
        }}
      >
        <div className="h-full flex flex-col w-[280px]"> {/* Fixed internal width */}
          {/* Logo with Fade Transition */}
          <div className="px-6 h-[80px] flex items-center border-b border-white/5">
            <Link to="/admin/dashboard" className="flex items-center gap-3 group relative">
              <div className="absolute inset-0 bg-brand-primary-500/0 group-hover:bg-brand-primary-500/10 rounded-xl transition-colors duration-300 -m-2 opacity-0 group-hover:opacity-100" />
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary-500 to-brand-primary-600 shadow-lg shadow-brand-primary-500/20 flex items-center justify-center shrink-0 relative z-10 group-hover:scale-105 transition-transform duration-300">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div 
                className={`transition-all duration-300 origin-left ${
                  isCollapsed && !isMobile 
                    ? 'opacity-0 scale-95 translate-x-[-10px]' 
                    : 'opacity-100 scale-100 translate-x-0'
                }`}
                style={{
                  width: isCollapsed && !isMobile ? 0 : 'auto',
                  overflow: 'hidden'
                }}
              >
                <h1 className="text-xl font-bold text-white tracking-tight">GidiPIN</h1>
                <p className="text-xs text-brand-primary-200 font-medium tracking-wide">Admin Portal</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 min-h-0 px-3 py-6 space-y-8 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {navigationGroups.map((group) => (
              <div key={group.title}>
                <h3 
                  className={`px-3 mb-3 text-[10px] font-bold text-brand-primary-300/60 uppercase tracking-widest transition-opacity duration-300 ${
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
                        className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative overflow-hidden active:scale-95 ${
                          isActive 
                            ? 'bg-brand-primary-600 text-white shadow-md shadow-brand-primary-900/20' 
                            : 'text-brand-primary-100/70 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-white/20 rounded-r-full" />
                        )}
                        <Icon className={`h-5 w-5 shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                        <span 
                          className={`font-medium text-sm transition-all duration-300 origin-left ${
                            isCollapsed && !isMobile 
                              ? 'opacity-0 w-0 translate-x-[-10px]' 
                              : 'opacity-100 w-auto translate-x-0'
                          }`}
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
          <div className="p-4 border-t border-white/5 bg-black/20 backdrop-blur-sm">
            <div className={`flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group ${isCollapsed && !isMobile ? 'justify-center' : ''}`}>
              <div className="w-9 h-9 rounded-full ring-2 ring-white/10 bg-gradient-to-br from-brand-primary-400 to-brand-primary-600 flex items-center justify-center shrink-0 shadow-lg relative overflow-hidden group-hover:ring-brand-primary-500/50 transition-all duration-300">
                <span className="text-white font-bold text-xs relative z-10">SA</span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </div>
              <div 
                className={`flex-1 min-w-0 transition-all duration-300 ${
                  isCollapsed && !isMobile ? 'opacity-0 w-0' : 'opacity-100 w-auto'
                }`}
              >
                <p className="text-sm font-semibold text-white truncate">Super Admin</p>
                <p className="text-xs text-brand-primary-200 truncate">admin@gidipin.work</p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className={`mt-2 w-full flex items-center gap-3 px-3 py-2 rounded-lg text-neutral-500 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 group ${
                isCollapsed && !isMobile ? 'justify-center' : ''
              }`}
              title="Logout"
            >
              <LogOut className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:-translate-x-1" />
              <span 
                className={`text-sm font-medium transition-all duration-300 ${
                  isCollapsed && !isMobile ? 'opacity-0 w-0 hidden' : 'opacity-100 w-auto block'
                }`}
              >
                Sign Out
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div 
        className="transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{ marginLeft: isMobile ? 0 : (isCollapsed ? '80px' : '280px') }}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-neutral-200/60 shadow-sm transition-all duration-300">
          <div className="px-4 py-3 md:px-6 h-16 flex items-center">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleSidebar}
                  className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-all duration-200 active:scale-95"
                >
                  <Menu className="h-5 w-5" />
                </button>
                
                {/* Breadcrumbs with Fade In - Hidden on Mobile */}
                {breadcrumbs.length > 0 && (
                  <nav className="hidden md:flex items-center gap-2 overflow-x-auto min-w-0 animate-[fadeIn_0.3s_ease-out]">
                    <span className="text-sm font-medium text-neutral-400 hover:text-neutral-600 transition-colors shrink-0">Admin</span>
                    {breadcrumbs.map((crumb, index) => (
                      <Fragment key={index}>
                        <ChevronRight className="h-4 w-4 text-neutral-300" />
                        <span 
                          className={`text-sm transition-colors duration-200 ${
                            index === breadcrumbs.length - 1 
                              ? 'text-neutral-900 font-semibold bg-neutral-100 px-2 py-0.5 rounded-md' 
                              : 'text-neutral-500 hover:text-neutral-700 font-medium'
                          }`}
                        >
                          {crumb}
                        </span>
                      </Fragment>
                    ))}
                  </nav>
                )}
              </div>
              
              {/* Right Side Tools */}
              <div className="flex items-center gap-3">
                <button className="p-2 rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-all duration-200 relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content with Slide Up Animation */}
        <main className="flex-1 p-3 md:p-8 animate-[slideInUp_0.4s_cubic-bezier(0.16,1,0.3,1)] overflow-x-hidden min-h-0">
          {children}
        </main>
      </div>
    </div>
  );
}
