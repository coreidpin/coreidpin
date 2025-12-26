import { supabase } from '../../utils/supabase/client';

export interface User {
  id: string;
  email: string;
  full_name: string;
  user_type: 'individual' | 'business';
  verification_status: 'pending' | 'verified' | 'rejected';
  profile_completion: number;
  country?: string;
  state?: string;
  city?: string;
  phone?: string;
  date_of_birth?: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at?: string;
}

export interface UserFilters {
  search?: string;
  user_type?: string;
  verification_status?: string;
  country?: string;
  status?: string;
}

export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface UserStatistics {
  total_users: number;
  active_users: number;
  inactive_users: number;
  verified_users: number;
  pending_verification: number;
  individual_users: number;
  business_users: number;
  new_users_today: number;
  new_users_this_week: number;
  new_users_this_month: number;
}

export interface BulkActionResult {
  success: boolean;
  updated_count?: number;
  deleted_count?: number;
  message: string;
}

export interface FilterOptions {
  countries: string[];
  user_types: string[];
  verification_statuses: string[];
}

class UserManagementService {
  /**
   * Get users with advanced filtering and pagination
   */
  async getUsers(
    filters: UserFilters = {},
    page: number = 1,
    pageSize: number = 50,
    sortBy: string = 'created_at',
    sortOrder: 'ASC' | 'DESC' = 'DESC'
  ): Promise<UserListResponse> {
    const offset = (page - 1) * pageSize;

    const { data, error } = await supabase.rpc('get_users_with_filters', {
      p_search: filters.search || null,
      p_user_type: filters.user_type || null,
      p_verification_status: filters.verification_status || null,
      p_country: filters.country || null,
      p_status: filters.status || null,
      p_limit: pageSize,
      p_offset: offset,
      p_sort_by: sortBy,
      p_sort_order: sortOrder
    });

    if (error) {
      console.error('❌ Error fetching users:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', error.details);
      console.error('Error hint:', error.hint);
      return {
        users: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0
      };
    }

    const users = data || [];
    const total = users.length > 0 ? users[0].total_count : 0;
    const totalPages = Math.ceil(total / pageSize);

    return {
      users: users.map(u => ({ ...u, total_count: undefined })),
      total,
      page,
      pageSize,
      totalPages
    };
  }

  /**
   * Get user statistics
   */
  async getUserStatistics(): Promise<UserStatistics | null> {
    const { data, error } = await supabase.rpc('get_user_statistics');

    if (error) {
      console.error('Error fetching user statistics:', error);
      return null;
    }

    return data?.[0] || null;
  }

  /**
   * Get user details by ID
   */
  async getUserDetails(userId: string): Promise<User | null> {
    const { data, error } = await supabase.rpc('get_user_details', {
      p_user_id: userId
    });

    if (error) {
      console.error('Error fetching user details:', error);
      return null;
    }

    return data?.[0] || null;
  }

  /**
   * Get filter options
   */
  async getFilterOptions(): Promise<FilterOptions> {
    const { data, error } = await supabase.rpc('get_user_filter_options');

    if (error) {
      console.error('Error fetching filter options:', error);
      return {
        countries: [],
        user_types: [],
        verification_statuses: []
      };
    }

    return data?.[0] || {
      countries: [],
      user_types: [],
      verification_statuses: []
    };
  }

  /**
   * Bulk update user status (activate/deactivate)
   */
  async bulkUpdateStatus(userIds: string[], isActive: boolean): Promise<BulkActionResult> {
    const { data, error } = await supabase.rpc('bulk_update_user_status', {
      p_user_ids: userIds,
      p_is_active: isActive
    });

    if (error) {
      return {
        success: false,
        message: `Failed to update users: ${error.message}`
      };
    }

    const result = data?.[0];
    return {
      success: result?.success || false,
      updated_count: result?.updated_count || 0,
      message: result?.message || 'Update completed'
    };
  }

  /**
   * Bulk update verification status
   */
  async bulkUpdateVerification(
    userIds: string[],
    status: 'pending' | 'verified' | 'rejected'
  ): Promise<BulkActionResult> {
    const { data, error } = await supabase.rpc('bulk_update_verification_status', {
      p_user_ids: userIds,
      p_verification_status: status
    });

    if (error) {
      return {
        success: false,
        message: `Failed to update verification: ${error.message}`
      };
    }

    const result = data?.[0];
    return {
      success: result?.success || false,
      updated_count: result?.updated_count || 0,
      message: result?.message || 'Update completed'
    };
  }

  /**
   * Bulk delete users
   */
  async bulkDeleteUsers(userIds: string[]): Promise<BulkActionResult> {
    const { data, error } = await supabase.rpc('bulk_delete_users', {
      p_user_ids: userIds
    });

    if (error) {
      return {
        success: false,
        message: `Failed to delete users: ${error.message}`
      };
    }

    const result = data?.[0];
    return {
      success: result?.success || false,
      deleted_count: result?.deleted_count || 0,
      message: result?.message || 'Deletion completed'
    };
  }

  /**
   * Export users to CSV
   */
  exportToCSV(users: User[], filename: string = 'users-export'): void {
    if (!users || users.length === 0) {
      console.warn('No users to export');
      return;
    }

    const headers = [
      'ID',
      'Email',
      'Full Name',
      'User Type',
      'Verification Status',
      'Profile Completion',
      'Country',
      'State',
      'City',
      'Phone',
      'Active',
      'Last Login',
      'Created At'
    ];

    const csvRows = [
      headers.join(','),
      ...users.map(user => [
        user.id,
        user.email,
        `"${user.full_name || ''}"`,
        user.user_type,
        user.verification_status,
        user.profile_completion,
        user.country || '',
        user.state || '',
        user.city || '',
        user.phone || '',
        user.is_active ? 'Yes' : 'No',
        user.last_login ? new Date(user.last_login).toLocaleString() : '',
        new Date(user.created_at).toLocaleString()
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }

  /**
   * Format date for display
   */
  formatDate(dateString?: string): string {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Get status badge color
   */
  getStatusColor(status: string): string {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  /**
   * Get user type display name with proper mapping
   */
  getUserTypeDisplay(type: string, email?: string): string {
    // Special case for super admin
    if (email === 'admin@gidipin.work' || email?.includes('admin@')) {
      return 'Super Admin';
    }
    
    // Map user types to display names
    switch (type?.toLowerCase()) {
      case 'business':
        return 'Business';
      case 'individual':
      case 'professional':
        return 'Professional';
      case 'admin':
      case 'super_admin':
        return 'Super Admin';
      default:
        return type || 'Individual';
    }
  }
  
  /**
   * Get user type badge color
   */
  getUserTypeBadgeColor(type: string): string {
    switch (type?.toLowerCase()) {
      case 'business':
        return 'bg-blue-100 text-blue-800';
      case 'individual':
      case 'professional':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
      case 'super_admin':
      case 'super admin':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}

export const userManagementService = new UserManagementService();
