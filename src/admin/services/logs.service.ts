import { BaseAPIClient, PaginationParams, PaginatedResponse } from './api';

export interface LogFilters {
  search?: string;
  status?: string;
  eventType?: string;
}

export interface AuthLog {
  id: string;
  user_id: string;
  event_type: string;
  status: 'success' | 'failed' | 'suspicious';
  ip_address: string;
  user_agent: string;
  location?: string;
  created_at: string;
  user_email?: string; // Often joined or denormalized
}

export interface PINLoginLog {
  id: string;
  user_id: string;
  status: 'success' | 'failed' | 'blocked';
  ip_address: string;
  user_agent: string;
  failure_reason?: string;
  created_at: string;
  user_email?: string;
  phone_number?: string;
}

export interface EmailVerificationLog {
  id: string;
  email: string;
  status: 'sent' | 'delivered' | 'bounced' | 'opened' | 'clicked';
  type: string;
  created_at: string;
  updated_at: string;
}

/**
 * Service for system logs
 */
export class LogsService extends BaseAPIClient {
  /**
   * Get paginated auth logs
   */
  async getAuthLogs(
    filters: LogFilters = {},
    pagination: PaginationParams = { page: 1, pageSize: 10 }
  ): Promise<PaginatedResponse<AuthLog>> {
    try {
      let query = this.supabase
        .from('auth_logs')
        .select('*', { count: 'exact' });

      if (filters.search) {
        query = query.or(`user_email.ilike.%${filters.search}%,ip_address.ilike.%${filters.search}%`);
      }

      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters.eventType && filters.eventType !== 'all') {
        query = query.eq('event_type', filters.eventType);
      }

      query = this.applyPagination(query, pagination);
      query = query.order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) this.handleError(error);

      return this.createPaginatedResponse(data || [], count || 0, pagination);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get paginated PIN login logs
   */
  async getPINLoginLogs(
    filters: LogFilters = {},
    pagination: PaginationParams = { page: 1, pageSize: 10 }
  ): Promise<PaginatedResponse<PINLoginLog>> {
    try {
      let query = this.supabase
        .from('pin_login_logs')
        .select('*', { count: 'exact' });

      if (filters.search) {
        query = query.or(`user_email.ilike.%${filters.search}%,ip_address.ilike.%${filters.search}%`);
      }

      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      query = this.applyPagination(query, pagination);
      query = query.order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) this.handleError(error);

      return this.createPaginatedResponse(data || [], count || 0, pagination);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get paginated email verification logs
   */
  async getEmailVerificationLogs(
    filters: LogFilters = {},
    pagination: PaginationParams = { page: 1, pageSize: 10 }
  ): Promise<PaginatedResponse<EmailVerificationLog>> {
    try {
      let query = this.supabase
        .from('email_verification_logs')
        .select('*', { count: 'exact' });

      if (filters.search) {
        query = query.ilike('email', `%${filters.search}%`);
      }

      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      query = this.applyPagination(query, pagination);
      query = query.order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) this.handleError(error);

      return this.createPaginatedResponse(data || [], count || 0, pagination);
    } catch (error) {
      this.handleError(error);
    }
  }
}

// Export singleton instance
export const logsService = new LogsService();
