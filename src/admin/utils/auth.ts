// Admin Authentication Utilities using Supabase

import { supabase } from '../../utils/supabase/client';

export interface AdminUser {
  id: string;
  user_id: string;
  role: 'super_admin' | 'admin' | 'moderator';
  email?: string;
}

/**
 * Check if current user is an admin
 */
export const checkIsAdmin = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return false;

    const { data: adminUser, error } = await supabase
      .from('admin_users')
      .select('id')
      .eq('user_id', user.id)
      .single();

    return !error && !!adminUser;
  } catch {
    return false;
  }
};

/**
 * Get current admin user details
 */
export const getAdminUser = async (): Promise<AdminUser | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    const { data: adminUser, error } = await (supabase as any)
      .from('admin_users')
      .select(`
        *,
        profiles:user_id (
          email
        )
      `)
      .eq('user_id', user.id)
      .single();

    if (error || !adminUser) return null;

    return {
      ...adminUser,
      email: adminUser.profiles?.email,
    };
  } catch {
    return null;
  }
};

/**
 * Clear admin session (logout)
 */
export const clearAdminSession = async (): Promise<void> => {
  await supabase.auth.signOut();
};
