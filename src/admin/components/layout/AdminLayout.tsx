import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

interface AdminLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: string[];
  onLogout: () => void;
}

export function AdminLayout({ children, breadcrumbs, onLogout }: AdminLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => setIsSidebarCollapsed((prev) => !prev);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F6FA' }}>
      {/* Sidebar */}
      {!isSidebarCollapsed && <Sidebar onToggleSidebar={toggleSidebar} />}

      {/* Main Content Area */}
      <div className={isSidebarCollapsed ? 'ml-0' : 'ml-64'}>
        {/* Top Bar */}
        <TopBar breadcrumbs={breadcrumbs} onLogout={onLogout} onToggleSidebar={toggleSidebar} />

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
