import { supabase } from '../../utils/supabase/client';

export interface ActiveUsersData {
  date: string;
  active_users: number;
}

export interface RetentionCohort {
  cohort_month: string;
  cohort_size: number;
  month_0: number;
  month_1: number;
  month_2: number;
  month_3: number;
}

export interface FeatureUsage {
  feature_name: string;
  usage_count: number;
  unique_users: number;
  last_used: string;
}

export interface EngagementMetric {
  metric_name: string;
  metric_value: number;
  change_percent: number;
}

export type MetricType = 'dau' | 'wau' | 'mau';

class EngagementService {
  /**
   * Get active users over time (DAU/WAU/MAU)
   */
  async getActiveUsers(metricType: MetricType = 'dau'): Promise<ActiveUsersData[]> {
    const { data, error } = await supabase
      .rpc('get_active_users', { metric_type: metricType });

    if (error) {
      console.error('Error fetching active users:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get retention cohort analysis
   */
  async getRetentionCohorts(): Promise<RetentionCohort[]> {
    const { data, error } = await supabase
      .rpc('get_retention_cohorts');

    if (error) {
      console.error('Error fetching retention cohorts:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get feature usage statistics
   */
  async getFeatureUsage(): Promise<FeatureUsage[]> {
    const { data, error } = await supabase
      .rpc('get_feature_usage');

    if (error) {
      console.error('Error fetching feature usage:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get engagement summary metrics
   */
  async getEngagementSummary(): Promise<EngagementMetric[]> {
    const { data, error } = await supabase
      .rpc('get_engagement_summary');

    if (error) {
      console.error('Error fetching engagement summary:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Calculate engagement rate
   */
  calculateEngagementRate(activeUsers: number, totalUsers: number): number {
    if (totalUsers === 0) return 0;
    return (activeUsers / totalUsers) * 100;
  }

  /**
   * Calculate retention rate for a cohort
   */
  calculateRetentionRate(month0: number, monthN: number): number {
    if (month0 === 0) return 0;
    return (monthN / month0) * 100;
  }
}

export const engagementService = new EngagementService();
