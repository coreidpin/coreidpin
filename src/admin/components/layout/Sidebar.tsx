import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight, ChevronLeft, ChevronsLeft } from 'lucide-react';
import { Button } from '../../../components/ui/button';

interface NavItem {
  title: string;
  path: string;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  { title: 'Overview', path: '/admin' },
  {
    title: 'Users',
    path: '/admin/users',
    children: [
      { title: 'View Users', path: '/admin/users' },
      { title: 'Identity Status', path: '/admin/users/identity' },
      { title: 'Profile Completion', path: '/admin/users/completion' },
      { title: 'PIN Activity', path: '/admin/users/pin-activity' },
    ],
  },
  { title: 'Projects', path: '/admin/projects' },
  { title: 'Endorsements', path: '/admin/endorsements' },
  {
    title: 'Business Integrations',
    path: '/admin/integrations',
    children: [
      { title: 'API Keys', path: '/admin/integrations/api-keys' },
      { title: 'Usage Logs', path: '/admin/integrations/usage' },
      { title: 'Active Integrations', path: '/admin/integrations/active' },
    ],
  },
  {
    title: 'System Logs',
    path: '/admin/logs',
    children: [
      { title: 'Auth Logs', path: '/admin/logs/auth' },
      { title: 'PIN Login Logs', path: '/admin/logs/pin' },
      { title: 'Email Verification Logs', path: '/admin/logs/email' },
    ],
  },
  { title: 'Compliance & KYC', path: '/admin/compliance' },
  { title: 'Reports & Analytics', path: '/admin/analytics' },
  {
    title: 'Settings',
    path: '/admin/settings',
  },
];

interface SidebarProps {
  onToggleSidebar: () => void;
}

export function Sidebar({ onToggleSidebar }: SidebarProps) {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'Users',
    'Business Integrations',
    'System Logs',
    'Settings',
  ]);

  const toggleSection = (title: string) => {
    setExpandedSections((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const collapseAll = () => {
    setExpandedSections([]);
  };

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0">
      {/* Header with collapse button */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" onClick={onToggleSidebar} className="mr-2 text-black">
            <ChevronLeft className="h-5 w-5 text-black" />
          </Button>
          <h1 className="text-xl font-semibold" style={{ color: '#0A2540' }}>
            Core-ID
          </h1>
        </div>
      </div>

      {/* Collapse All Button - visible section */}
      <div className="px-4 py-2 border-b border-gray-100">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={collapseAll} 
          className="w-full text-xs text-black"
        >
          <ChevronsLeft className="h-3 w-3 mr-1 text-black" />
          Collapse All
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {navigation.map((item) => (
          <div key={item.title}>
            {item.children ? (
              <div>
                <button
                  onClick={() => toggleSection(item.title)}
                  className="w-full flex items-center justify-between px-6 py-2 text-sm font-medium transition-colors hover:bg-gray-50"
                  style={{ color: isActive(item.path) ? '#445DFF' : '#1B1F23' }}
                >
                  <span>{item.title}</span>
                  {expandedSections.includes(item.title) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                {expandedSections.includes(item.title) && (
                  <div className="mt-1 mb-2">
                    {item.children.map((child) => (
                      <Link
                        key={child.path}
                        to={child.path}
                        className="block px-6 py-2 text-sm transition-colors hover:bg-gray-50 relative"
                        style={{
                          color: isActive(child.path) ? '#445DFF' : '#6B7280',
                          fontWeight: isActive(child.path) ? '500' : '400',
                        }}
                      >
                        {isActive(child.path) && (
                          <div
                            className="absolute left-0 top-0 bottom-0 w-[3px]"
                            style={{ backgroundColor: '#445DFF' }}
                          />
                        )}
                        {child.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                to={item.path}
                className="block px-6 py-2 text-sm font-medium transition-colors hover:bg-gray-50 relative"
                style={{ color: isActive(item.path) ? '#445DFF' : '#1B1F23' }}
              >
                {isActive(item.path) && (
                  <div
                    className="absolute left-0 top-0 bottom-0 w-[3px]"
                    style={{ backgroundColor: '#445DFF' }}
                  />
                )}
                {item.title}
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4">
        <div className="text-xs text-gray-500">
          Logged in as <span className="font-medium text-gray-700">Admin</span>
        </div>
      </div>
    </aside>
  );
}
