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
    pagination: PaginationParams = { page: 1, pageSize: 15 }
  ): Promise<PaginatedResponse<AuthLog>> {
    try {
      // Query audit_events which contains actual system activity
      // Note: No foreign key to profiles, so we can't join directly
      let query = this.supabase
        .from('audit_events')
        .select('*', { count: 'exact' });

      if (filters.search) {
        // Search in event_type or cast meta to text for search
        query = query.ilike('event_type', `%${filters.search}%`);
      }

      if (filters.eventType && filters.eventType !== 'all') {
        query = query.eq('event_type', filters.eventType);
      }

      // Filter by status is tricky since it's derived. 
      // We'll skip DB filtering for status for now or assume specific events map to status.

      query = this.applyPagination(query, pagination);
      query = query.order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) this.handleError(error);

      // Fetch user emails manually since we can't join
      const userIds = (data || [])
        .map((e: any) => e.user_id)
        .filter((id: string) => id); // Filter out nulls
      
      let userMap: Record<string, string> = {};
      
      if (userIds.length > 0) {
        const { data: users } = await this.supabase
          .from('profiles')
          .select('user_id, email')
          .in('user_id', userIds);
          
        if (users) {
          users.forEach((u: any) => {
            userMap[u.user_id] = u.email;
          });
        }
      }

      // Map audit_events to AuthLog interface
      const logs: AuthLog[] = (data || []).map((event: any) => {
        const meta = event.meta || {};
        const isFailure = event.event_type.includes('failed') || event.event_type.includes('error');
        const userEmail = userMap[event.user_id] || meta.email || (event.user_id ? 'Registered User' : 'Visitor');
        
        return {
          id: event.id,
          user_id: event.user_id,
          user_email: userEmail,
          event_type: event.event_type,
          status: isFailure ? 'failed' : 'success',
          ip_address: meta.ip || 'N/A',
          user_agent: meta.user_agent || 'N/A',
          location: meta.location || 'N/A',
          created_at: event.created_at,
          metadata: meta
        };
      });

      return this.createPaginatedResponse(logs, count || 0, pagination);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get paginated PIN login logs
   */
  async getPINLoginLogs(
    filters: LogFilters = {},
    pagination: PaginationParams = { page: 1, pageSize: 15 }
  ): Promise<PaginatedResponse<AuthLog>> {
    try {
      // Query audit_events for PIN related events
      let query = this.supabase
        .from('audit_events')
        .select('*', { count: 'exact' })
        .ilike('event_type', 'pin_%'); // Filter for PIN events

      if (filters.search) {
        query = query.ilike('event_type', `%${filters.search}%`);
      }

      if (filters.status && filters.status !== 'all') {
         // rough status mapping if needed, or skip
      }

      query = this.applyPagination(query, pagination);
      query = query.order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) this.handleError(error);

      // Fetch user emails manually
      const userIds = (data || []).map((e: any) => e.user_id).filter((id: string) => id);
      let userMap: Record<string, string> = {};
      
      if (userIds.length > 0) {
        const { data: users } = await this.supabase
          .from('profiles')
          .select('user_id, email')
          .in('user_id', userIds);
          
        if (users) {
          users.forEach((u: any) => userMap[u.user_id] = u.email);
        }
      }

      const logs: AuthLog[] = (data || []).map((event: any) => {
        const meta = event.meta || {};
        const isFailure = event.event_type.includes('failed') || event.event_type.includes('error');
        
        return {
          id: event.id,
          user_id: event.user_id,
          user_email: userMap[event.user_id] || meta.email || (event.user_id ? 'Registered User' : 'Visitor'),
          event_type: event.event_type,
          status: isFailure ? 'failed' : 'success',
          ip_address: meta.ip || 'N/A',
          user_agent: meta.user_agent || 'N/A',
          location: meta.location || 'N/A',
          created_at: event.created_at,
          metadata: meta
        };
      });

      return this.createPaginatedResponse(logs, count || 0, pagination);
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
