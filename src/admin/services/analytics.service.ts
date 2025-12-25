import { supabase } from '../../utils/supabase/client';

export interface UserGrowthData {
  date: string;
  count: number;
  cumulative: number;
}

export interface UserTypeStats {
  type: string;
  count: number;
  percentage: number;
}

export interface ConversionFunnelData {
  stage: string;
  count: number;
  percentage: number;
  dropoff?: number;
}

export type TimePeriod = '7d' | '30d' | '90d' | '1y' | 'all';

class AnalyticsService {
  /**
   * Get user growth statistics for a given time period
   */
  async getUserGrowth(period: TimePeriod = '30d'): Promise<UserGrowthData[]> {
    try {
      const { data, error } = await supabase.rpc('get_user_growth_stats', {
        time_period: period
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch user growth data:', error);
      throw error;
    }
  }

  /**
   * Get breakdown of users by type (professional vs business)
   */
  async getUserTypeBreakdown(): Promise<UserTypeStats[]> {
    try {
      const { data, error } = await supabase.rpc('get_user_type_breakdown');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch user type breakdown:', error);
      throw error;
    }
  }

  /**
   * Get PIN activation funnel data
   */
  async getPINActivationFunnel(): Promise<ConversionFunnelData[]> {
    try {
      const { data, error } = await supabase.rpc('get_pin_activation_funnel');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch PIN activation funnel:', error);
      throw error;
    }
  }

  /**
   * Calculate growth rate between two periods
   */
  calculateGrowthRate(current: number, previous: number): number {
    if (previous === 0) return 100;
    return ((current - previous) / previous) * 100;
  }

  /**
   * Export users data to CSV
   */
  async exportUsers(filters?: any): Promise<Blob> {
    try {
      // Fetch users with filters
      let query = supabase
        .from('profiles')
        .select('id, name, email, phone, user_type, created_at, email_verified');

      if (filters?.userType) {
        query = query.eq('user_type', filters.userType);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Convert to CSV
      const headers = ['ID', 'Name', 'Email', 'Phone', 'Type', 'Created At', 'Email Verified'];
      const csvRows = [
        headers.join(','),
        ...(data || []).map(user => [
          user.id,
          user.name || '',
          user.email || '',
          user.phone || '',
          user.user_type || 'professional',
          user.created_at,
          user.email_verified ? 'Yes' : 'No'
        ].join(','))
      ];

      const csvContent = csvRows.join('\n');
      return new Blob([csvContent], { type: 'text/csv' });
    } catch (error) {
      console.error('Failed to export users:', error);
      throw error;
    }
  }
}

export const analyticsService = new AnalyticsService();
