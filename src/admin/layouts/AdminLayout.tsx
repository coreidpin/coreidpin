import React from 'react';
import { Navigate } from 'react-router-dom';
import { checkAdminAccess } from '../utils/auth';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const hasAccess = checkAdminAccess();
  
  if (!hasAccess) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <div className="min-h-screen bg-[#0a0b0d]">
      {children}
    </div>
  );
}
