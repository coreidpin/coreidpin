import { BaseAPIClient } from './api';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

export interface SystemSettings {
  id?: string;
  siteName: string;
  supportEmail: string;
  maintenanceMode: boolean;
  passwordMinLength: number;
  requireSpecialChar: boolean;
  requireNumbers: boolean;
  enforce2FA: boolean;
  sessionTimeout: number;
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'super_admin' | 'admin' | 'moderator';
  status: 'active' | 'invited' | 'suspended';
  lastLogin?: string;
  full_name?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  actor: string;
  target: string;
  status: 'success' | 'failure';
  timestamp: string;
  details?: any;
}

export class SettingsService extends BaseAPIClient {
  /**
   * Get system settings
   */
  async getSystemSettings(): Promise<SystemSettings> {
    try {
      const { data, error } = await (this.supabase as any)
        .from('system_settings')
        .select('*')
        .single();

      if (error) {
        // If no settings found, return defaults (or handle as needed)
        if (error.code === 'PGRST116') {
          return {
            siteName: 'CoreID Admin',
            supportEmail: 'support@coreid.com',
            maintenanceMode: false,
            passwordMinLength: 8,
            requireSpecialChar: true,
            requireNumbers: true,
            enforce2FA: false,
            sessionTimeout: 30,
          };
        }
        this.handleError(error);
      }

      // Map snake_case to camelCase
      return {
        id: data.id,
        siteName: data.site_name,
        supportEmail: data.support_email,
        maintenanceMode: data.maintenance_mode,
        passwordMinLength: data.password_min_length,
        requireSpecialChar: data.require_special_char,
        requireNumbers: data.require_numbers,
        enforce2FA: data.enforce_2fa,
        sessionTimeout: data.session_timeout,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Update system settings
   */
  async updateSystemSettings(settings: SystemSettings): Promise<void> {
    try {
      // Map camelCase to snake_case
      const dbSettings = {
        site_name: settings.siteName,
        support_email: settings.supportEmail,
        maintenance_mode: settings.maintenanceMode,
        password_min_length: settings.passwordMinLength,
        require_special_char: settings.requireSpecialChar,
        require_numbers: settings.requireNumbers,
        enforce_2fa: settings.enforce2FA,
        session_timeout: settings.sessionTimeout,
        updated_at: new Date().toISOString(),
      };

      // Check if settings exist
      const { data: existing } = await (this.supabase as any)
        .from('system_settings')
        .select('id')
        .single();

      let error;
      if (existing) {
        const { error: updateError } = await (this.supabase as any)
          .from('system_settings')
          .update(dbSettings)
          .eq('id', existing.id);
        error = updateError;
      } else {
        const { error: insertError } = await (this.supabase as any)
          .from('system_settings')
          .insert(dbSettings);
        error = insertError;
      }

      if (error) this.handleError(error);
      
      // Log the action
      await this.logAction('update_settings', 'System Settings', 'success');
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get admin users
   */
  async getAdminUsers(): Promise<AdminUser[]> {
    try {
      // Join admin_users with profiles to get email/name
      // Note: This assumes a relationship exists or we manually join
      // Since we can't easily join auth.users, we'll rely on profiles if available
      // or just return what we have in admin_users if it stores email (it doesn't in our schema)
      // Ideally, we should have a view or use profiles.
      
      const { data, error } = await (this.supabase as any)
        .from('admin_users')
        .select(`
          *,
          profiles:user_id (
            email,
            full_name
          )
        `);

      if (error) this.handleError(error);

      return data.map((admin: any) => ({
        id: admin.id,
        email: admin.profiles?.email || 'Unknown',
        full_name: admin.profiles?.full_name,
        role: admin.role,
        status: 'active', // Default to active for now
        lastLogin: admin.created_at, // Placeholder
      }));
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Invite new admin (calls Edge Function)
   */
  async inviteAdmin(email: string, role: string): Promise<void> {
    try {
      // Get current session for authentication
      const { data: { session }, error: sessionError } = await this.supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('Not authenticated. Please log in to the admin panel.');
      }

      const supabaseUrl = (import.meta as any)?.env?.VITE_SUPABASE_URL || `https://${projectId}.supabase.co`;
      const supabaseKey = (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY || publicAnonKey;

      console.log('Calling Edge Function to invite:', email, role);

      const response = await fetch(
        `${supabaseUrl}/functions/v1/invite-admin`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': supabaseKey,
          },
          body: JSON.stringify({ email, role }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error('Edge Function error:', error);
        throw new Error(error.error || 'Failed to send invitation');
      }

      const result = await response.json();
      console.log('Invitation result:', result);
      return result;
    } catch (error) {
      console.error('Exception in inviteAdmin:', error);
      this.handleError(error);
    }
  }

  /**
   * Get audit logs
   */
  async getAuditLogs(): Promise<AuditLog[]> {
    try {
      const { data, error } = await (this.supabase as any)
        .from('admin_audit_logs')
        .select(`
          *,
          profiles:actor_id (
            email,
            full_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) this.handleError(error);

      return data.map((log: any) => ({
        id: log.id,
        action: log.action,
        actor: log.profiles?.email || 'System',
        target: log.target,
        status: log.status as 'success' | 'failure',
        timestamp: log.created_at,
        details: log.details
      }));
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Helper to log actions
   */
  private async logAction(action: string, target: string, status: 'success' | 'failure', details?: any) {
    try {
      const { error } = await (this.supabase as any)
        .from('admin_audit_logs')
        .insert({
          action,
          target,
          status,
          details,
          actor_id: (await this.supabase.auth.getUser()).data.user?.id
        });
        
      if (error) console.error('Failed to log audit:', error);
    } catch (e) {
      // Ignore audit log errors to prevent blocking main flow
      console.error('Audit log error:', e);
    }
  }
}

export const settingsService = new SettingsService();
