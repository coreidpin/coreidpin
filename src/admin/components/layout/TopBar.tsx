import React from 'react';
import { ChevronRight, LogOut, Menu } from 'lucide-react';
import { Button } from '../../../components/ui/button';

interface TopBarProps {
  breadcrumbs?: string[];
  onLogout: () => void;
  onToggleSidebar: () => void;
}

export function TopBar({ breadcrumbs = ['Overview'], onLogout, onToggleSidebar }: TopBarProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Left side: Collapse button */}
      <Button variant="ghost" size="sm" onClick={onToggleSidebar} className="mr-2 text-black">
        <Menu className="h-5 w-5 text-black" />
      </Button>

      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-500">Admin</span>
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={index}>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span
              className={index === breadcrumbs.length - 1 ? 'font-medium' : 'text-gray-500'}
              style={{ color: index === breadcrumbs.length - 1 ? '#0A2540' : undefined }}
            >
              {crumb}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-600">
          <span className="font-medium" style={{ color: '#0A2540' }}>Admin User</span>
        </div>
        <Button variant="outline" size="sm" onClick={onLogout} className="gap-2 text-black">
          <LogOut className="h-4 w-4 text-black" />
          Logout
        </Button>
      </div>
    </header>
  );
}
