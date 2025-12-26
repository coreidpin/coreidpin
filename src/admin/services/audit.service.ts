import { supabase } from '../../utils/supabase/client';

export interface AuditLog {
  id: string;
  user_id: string | null;
  user_email: string;
  actor_type: 'admin' | 'system' | 'user';
  action: string;
  resource_type: string;
  resource_id: string | null;
  old_values: any;
  new_values: any;
  metadata: any;
  status: 'success' | 'failure' | 'pending';
  error_message: string | null;
  created_at: string;
}

export interface UserActivity {
  id: string;
  user_id: string;
  user_email: string;
  activity_type: string;
  details: any;
  ip_address: string | null;
  created_at: string;
}

export interface AuditStatistics {
  total_events: number;
  successful_events: number;
  failed_events: number;
  unique_users: number;
  events_by_action: Record<string, number>;
  events_by_resource: Record<string, number>;
  events_by_day: Record<string, number>;
}

export interface AuditFilters {
  user_id?: string;
  action?: string;
  resource_type?: string;
  actor_type?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
}

/**
 * Service for audit logging and activity tracking
 */
export class AuditService {
  /**
   * Log an audit event
   */
  async logEvent(params: {
    action: string;
    resource_type: string;
    resource_id?: string;
    old_values?: any;
    new_values?: any;
    metadata?: any;
    status?: 'success' | 'failure';
    error_message?: string;
  }): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase.rpc('log_audit_event', {
        p_user_id: user?.id || null,
        p_user_email: user?.email || 'system',
        p_actor_type: 'admin',
        p_action: params.action,
        p_resource_type: params.resource_type,
        p_resource_id: params.resource_id || null,
        p_old_values: params.old_values || null,
        p_new_values: params.new_values || null,
        p_metadata: params.metadata || null,
        p_status: params.status || 'success',
        p_error_message: params.error_message || null
      });

      if (error) {
        console.error('Failed to log audit event:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Log audit event error:', error);
      return null;
    }
  }

  /**
   * Get audit logs with filters
   */
  async getAuditLogs(
    filters: AuditFilters = {},
    page: number = 1,
    limit: number = 50
  ): Promise<{ logs: AuditLog[]; total: number }> {
    try {
      const offset = (page - 1) * limit;

      const { data, error } = await supabase.rpc('get_audit_logs', {
        p_user_id: filters.user_id || null,
        p_action: filters.action || null,
        p_resource_type: filters.resource_type || null,
        p_actor_type: filters.actor_type || null,
        p_status: filters.status || null,
        p_start_date: filters.start_date || null,
        p_end_date: filters.end_date || null,
        p_limit: limit,
        p_offset: offset
      });

      if (error) {
        console.error('Failed to fetch audit logs:', error);
        throw error;
      }

      const logs = data || [];
      const total = logs.length > 0 ? logs[0].total_count : 0;

      return { logs, total };
    } catch (error) {
      console.error('Get audit logs error:', error);
      return { logs: [], total: 0 };
    }
  }

  /**
   * Get user activity logs
   */
  async getUserActivity(
    userId?: string,
    activityType?: string,
    page: number = 1,
    limit: number = 50
  ): Promise<{ activities: UserActivity[]; total: number }> {
    try {
      const offset = (page - 1) * limit;

      const { data, error } = await supabase.rpc('get_user_activity', {
        p_user_id: userId || null,
        p_activity_type: activityType || null,
        p_start_date: null,
        p_end_date: null,
        p_limit: limit,
        p_offset: offset
      });

      if (error) {
        console.error('Failed to fetch user activity:', error);
        throw error;
      }

      const activities = data || [];
      const total = activities.length > 0 ? activities[0].total_count : 0;

      return { activities, total };
    } catch (error) {
      console.error('Get user activity error:', error);
      return { activities: [], total: 0 };
    }
  }

  /**
   * Get audit statistics
   */
  async getStatistics(
    startDate?: string,
    endDate?: string
  ): Promise<AuditStatistics | null> {
    try {
      const { data, error } = await supabase.rpc('get_audit_statistics', {
        p_start_date: startDate || null,
        p_end_date: endDate || null
      });

      if (error) {
        console.error('Failed to fetch audit statistics:', error);
        throw error;
      }

      return data?.[0] || null;
    } catch (error) {
      console.error('Get audit statistics error:', error);
      return null;
    }
  }

  /**
   * Cleanup old logs (admin only)
   */
  async cleanupOldLogs(retentionDays: number = 90): Promise<{ success: boolean; message: string }> {
    try {
      const { data, error } = await supabase.rpc('cleanup_old_audit_logs', {
        p_retention_days: retentionDays
      });

      if (error) {
        return { success: false, message: error.message };
      }

      return {
        success: true,
        message: data?.[0]?.message || 'Cleanup completed'
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Cleanup failed'
      };
    }
  }

  /**
   * Export audit logs as CSV
   */
  async exportLogs(filters: AuditFilters = {}): Promise<Blob> {
    const { logs } = await this.getAuditLogs(filters, 1, 10000); // Get many logs

    const headers = [
      'Timestamp',
      'User Email',
      'Actor Type',
      'Action',
      'Resource Type',
      'Resource ID',
      'Status',
      'Error Message'
    ];

    const rows = logs.map(log => [
      new Date(log.created_at).toLocaleString(),
      log.user_email,
      log.actor_type,
      log.action,
      log.resource_type,
      log.resource_id || '',
      log.status,
      log.error_message || ''
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return new Blob([csv], { type: 'text/csv' });
  }

  /**
   * Format action name for display
   */
  formatAction(action: string): string {
    return action
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Get status color
   */
  getStatusColor(status: string): string {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failure':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  /**
   * Get actor type badge color
   */
  getActorTypeColor(actorType: string): string {
    switch (actorType) {
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'system':
        return 'bg-purple-100 text-purple-800';
      case 'user':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}

// Export singleton instance
export const auditService = new AuditService();
