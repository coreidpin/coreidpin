import { BaseAPIClient, PaginationParams, PaginatedResponse } from './api';

export interface UserFilters {
  search?: string;
  status?: string | string[];
  userType?: string;
  verified?: string;
  dateRange?: {
    start?: string;
    end?: string;
  };
  // Legacy support
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

      // Apply search filter - search across multiple fields
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        query = query.or(`email.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`);
      }

      // Apply user type filter
      if (filters.userType) {
        query = query.eq('user_type', filters.userType);
      }

      // Apply status filter
      if (filters.status) {
        const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
        if (statuses.includes('active')) {
          query = query.is('status', null).or('status.eq.active');
        } else if (statuses.includes('inactive')) {
          query = query.eq('status', 'inactive');
        } else if (statuses.includes('suspended')) {
          query = query.eq('status', 'suspended');
        }
      }

      // Apply verification filter
      if (filters.verified) {
        switch (filters.verified) {
          case 'verified':
            query = query.eq('email_verified', true);
            break;
          case 'unverified':
            query = query.eq('email_verified', false);
            break;
          case 'has_pin':
            // We'll need to join with professional_pins table or check if user has PIN
            // For now, let's use a simple check
            query = query.not('pin_number', 'is', null);
            break;
          case 'no_pin':
            query = query.is('pin_number', null);
            break;
        }
      }

      // Apply date range filter
      if (filters.dateRange) {
        if (filters.dateRange.start) {
          query = query.gte('created_at', filters.dateRange.start);
        }
        if (filters.dateRange.end) {
          // Add 1 day to include the end date
          const endDate = new Date(filters.dateRange.end);
          endDate.setDate(endDate.getDate() + 1);
          query = query.lt('created_at', endDate.toISOString());
        }
      }

      // Legacy support for identityType filter
      if (filters.identityType && filters.identityType.length > 0) {
        query = query.in('user_type', filters.identityType);
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
        .eq('user_id', id)
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
        // @ts-ignore
        .update({ is_suspended: suspend, updated_at: new Date().toISOString() })
        .eq('user_id', id)
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
        // @ts-ignore
        .update({ 
          pin: null, 
          is_pin_verified: false,
          updated_at: new Date().toISOString() 
        })
        .eq('user_id', id);

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

  /**
   * Update user details
   */
  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        // @ts-ignore
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', id)
        .select()
        .single();

      if (error) this.handleError(error);

      return data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Delete user
   */
  async deleteUser(id: string): Promise<void> {
    try {
      // Note: This matches the RLS policy "Service role can manage all profiles"
      // In a real Supabase app, deleting from 'profiles' might trigger a function to delete from auth.users
      // or we might need to delete from auth.users using the admin API if we are logically deleting the login.
      // For now, we assume deleting the profile is the action.
      
      const { error } = await this.supabase
        .from('profiles')
        .delete()
        .eq('user_id', id);

      if (error) this.handleError(error);
    } catch (error) {
      this.handleError(error);
    }
  }
}

// Export singleton instance
export const usersService = new UsersService();
