import { BaseAPIClient, PaginationParams, PaginatedResponse } from './api';

export interface UserFilters {
  search?: string;
  status?: string[];
  identityType?: string[];
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  phone_number?: string;
  identity_type?: string; // Maps to user_type in UI
  user_type?: string; // Some parts might use this
  pin?: string;
  is_pin_verified: boolean;
  is_email_verified: boolean;
  is_suspended: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Service for user-related API operations
 */
export class UsersService extends BaseAPIClient {
  /**
   * Get paginated list of users with filters
   */
  async getUsers(
    filters: UserFilters = {},
    pagination: PaginationParams = { page: 1, pageSize: 10 }
  ): Promise<PaginatedResponse<User>> {
    try {
      // Build query
      let query = this.supabase
        .from('profiles')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters.search) {
        query = query.or(`email.ilike.%${filters.search}%,full_name.ilike.%${filters.search}%`);
      }

      if (filters.status && filters.status.length > 0) {
        if (filters.status.includes('suspended')) {
          query = query.eq('is_suspended', true);
        }
        if (filters.status.includes('active')) {
          query = query.eq('is_suspended', false);
        }
      }

      if (filters.identityType && filters.identityType.length > 0) {
        query = query.in('identity_type', filters.identityType);
      }

      // Apply pagination
      query = this.applyPagination(query, pagination);

      // Order by created_at desc
      query = query.order('created_at', { ascending: false });

      // Execute query
      const { data, error, count } = await query;

      if (error) this.handleError(error);

      return this.createPaginatedResponse(data || [], count || 0, pagination);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<User> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) this.handleError(error);

      return data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Suspend/Unsuspend user
   */
  async toggleUserSuspension(id: string, suspend: boolean): Promise<User> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .update({ is_suspended: suspend, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) this.handleError(error);

      return data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Reset user PIN
   */
  async resetUserPIN(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('profiles')
        .update({ 
          pin: null, 
          is_pin_verified: false,
          updated_at: new Date().toISOString() 
        })
        .eq('id', id);

      if (error) this.handleError(error);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string): Promise<void> {
    try {
      // This would call your email sending service
      console.log('Resending verification email to:', email);
    } catch (error) {
      this.handleError(error);
    }
  }
}

// Export singleton instance
export const usersService = new UsersService();
