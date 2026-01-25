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
      
      // Use RPC function to bypass RLS
      const { data, error } = await (this.supabase as any)
        .rpc('get_system_settings');

      if (error) {
        console.error('Failed to get system settings:', error);
        // If no settings found, return defaults
        if (error.code === 'PGRST116' || !data || data.length === 0) {
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

      // RPC returns array, get first row
      const row = data && data.length > 0 ? data[0] : null;
      
      if (!row) {
        // Return defaults if no settings exist
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

      // Map snake_case to camelCase
      const settings = {
        id: row.id,
        siteName: row.site_name,
        supportEmail: row.support_email,
        maintenanceMode: row.maintenance_mode,
        passwordMinLength: row.password_min_length,
        requireSpecialChar: row.require_special_char,
        requireNumbers: row.require_numbers,
        enforce2FA: row.enforce_2fa,
        sessionTimeout: row.session_timeout,
      };
      return settings;
    } catch (error) {
      console.error('Get system settings error:', error);
      this.handleError(error);
      // Return defaults on complete failure
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
  }

  /**
   * Update system settings
   */
  async updateSystemSettings(settings: SystemSettings): Promise<void> {
    try {
      
      // Use RPC function to bypass RLS
      const { data, error } = await (this.supabase as any)
        .rpc('update_system_settings', {
          p_site_name: settings.siteName,
          p_support_email: settings.supportEmail,
          p_maintenance_mode: settings.maintenanceMode,
          p_password_min_length: settings.passwordMinLength,
          p_require_special_char: settings.requireSpecialChar,
          p_require_numbers: settings.requireNumbers,
          p_enforce_2fa: settings.enforce2FA,
          p_session_timeout: settings.sessionTimeout
        });

      if (error) {
        console.error('RPC error:', error);
        throw error;
      }
      
      // Log the action
      await this.logAction('update_settings', 'System Settings', 'success');
    } catch (error) {
      console.error('Update settings error:', error);
      this.handleError(error);
    }
  }

  /**
   * Get admin users
   */
  async getAdminUsers(): Promise<AdminUser[]> {
    try {
      // Use RPC function to bypass RLS
      const { data, error } = await (this.supabase as any)
        .rpc('get_admin_users');

      if (error) {
        console.error('Failed to get admin users:', error);
        this.handleError(error);
      }

      return (data || []).map((admin: any) => ({
        id: admin.id,
        email: admin.email || 'Unknown',
        full_name: admin.full_name,
        role: admin.role,
        status: 'active', // Default to active for now
        lastLogin: admin.created_at, // Placeholder
      }));
    } catch (error) {
      console.error('Get admin users error:', error);
      this.handleError(error);
      return []
    }
  }

  /**
   * Invite new admin (calls Edge Function)
   */
  async inviteAdmin(email: string, role: string): Promise<void> {
    try {

      // Use RPC function to bypass token compatibility issues
      const { data, error } = await (this.supabase as any)
        .rpc('invite_admin_user', {
          p_email: email,
          p_role: role
        });

      if (error) {
        console.error('RPC error:', error);
        throw new Error(error.message || 'Failed to invite admin');
      }

      if (data && !data.success) {
        throw new Error(data.error || 'Failed to invite admin');
      }
      
      // If invitation was created (not existing user), send email
      if (data && data.invitation_token) {
        
        try {
          await this.sendInvitationEmail(email, role, data.invitation_token);
        } catch (emailError) {
          // Log but don't fail - invitation was created successfully
          console.error('⚠️ Failed to send invitation email:', emailError);
          // Still return success since the invitation was created
        }
      }
      
      // Return the full data object so the UI can display the appropriate message
      return data;
    } catch (error) {
      console.error('Exception in inviteAdmin:', error);
      this.handleError(error);
    }
  }

  /**
   * Send invitation email via Edge Function
   */
  private async sendInvitationEmail(email: string, role: string, invitationToken: string): Promise<void> {
    const supabaseUrl = (import.meta as any)?.env?.VITE_SUPABASE_URL || `https://${projectId}.supabase.co`;
    const supabaseKey = (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY || publicAnonKey;

    const response = await fetch(
      `${supabaseUrl}/functions/v1/send-admin-invitation`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
        },
        body: JSON.stringify({
          email,
          role,
          invitation_token: invitationToken
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || 'Failed to send invitation email');
    }

    return response.json();
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
      // Use RPC function to bypass RLS
      const { error } = await (this.supabase as any)
        .rpc('log_admin_action', {
          p_action: action,
          p_target: target,
          p_status: status,
          p_details: details || null
        });
        
      if (error) console.error('Failed to log audit:', error);
    } catch (e) {
      // Ignore audit log errors to prevent blocking main flow
      console.error('Audit log error:', e);
    }
  }
}

export const settingsService = new SettingsService();
