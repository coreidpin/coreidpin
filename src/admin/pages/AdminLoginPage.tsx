import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabase/client';
import { AdminLoginForm } from '../components/AdminLoginForm';

export default function AdminLoginPage() {
  const navigate = useNavigate();

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: adminData } = await (supabase as any)
          .from('admin_users')
          .select('role')
          .eq('user_id', user.id)
          .single();
        
        if (adminData) {
          localStorage.setItem('isAdmin', 'true');
          localStorage.setItem('adminRole', adminData.role);
          navigate('/admin');
        }
      }
    };
    checkSession();
  }, [navigate]);

  return (
    <div className="relative min-h-screen bg-[#0a0b0d] flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Modular Admin Login Form */}
      <div className="relative z-10">
        <AdminLoginForm />
      </div>
    </div>
  );
}
