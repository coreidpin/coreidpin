import { supabase } from '../../utils/supabase/client';

export interface RevenueOverview {
  total_revenue: number;
  mrr: number;
  arr: number;
  total_payments: number;
  successful_payments: number;
  failed_payments: number;
  success_rate: number;
  avg_transaction_value: number;
}

export interface RevenueTrend {
  period_date: string;
  revenue: number;
  payment_count: number;
  avg_transaction: number;
}

export interface SubscriptionMetrics {
  total_subscriptions: number;
  active_subscriptions: number;
  canceled_subscriptions: number;
  trialing_subscriptions: number;
  churn_rate: number;
  new_this_month: number;
  canceled_this_month: number;
}

export interface PlanRevenue {
  plan_id: string;
  subscription_count: number;
  total_revenue: number;
  mrr: number;
  percentage: number;
}

export interface PaymentMethod {
  payment_method: string;
  payment_count: number;
  total_amount: number;
  success_rate: number;
}

export interface CustomerLTV {
  avg_ltv: number;
  avg_subscription_length_days: number;
  avg_revenue_per_customer: number;
}

export type TimePeriod = '7d' | '30d' | '90d' | '1y';

class RevenueService {
  /**
   * Get revenue overview metrics
   */
  async getRevenueOverview(timePeriod: TimePeriod = '30d'): Promise<RevenueOverview | null> {
    const { data, error } = await supabase
      .rpc('get_revenue_overview', { time_period: timePeriod });

    if (error) {
      console.error('Error fetching revenue overview:', error);
      return null;
    }

    return data?.[0] || null;
  }

  /**
   * Get revenue trends over time
   */
  async getRevenueTrends(timePeriod: TimePeriod = '30d'): Promise<RevenueTrend[]> {
    const { data, error } = await supabase
      .rpc('get_revenue_trends', { time_period: timePeriod });

    if (error) {
      console.error('Error fetching revenue trends:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get subscription metrics
   */
  async getSubscriptionMetrics(): Promise<SubscriptionMetrics | null> {
    const { data, error } = await supabase
      .rpc('get_subscription_metrics');

    if (error) {
      console.error('Error fetching subscription metrics:', error);
      return null;
    }

    return data?.[0] || null;
  }

  /**
   * Get revenue breakdown by plan
   */
  async getRevenueByPlan(): Promise<PlanRevenue[]> {
    const { data, error } = await supabase
      .rpc('get_revenue_by_plan');

    if (error) {
      console.error('Error fetching revenue by plan:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get payment method distribution
   */
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    const { data, error } = await supabase
      .rpc('get_payment_methods');

    if (error) {
      console.error('Error fetching payment methods:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get customer lifetime value metrics
   */
  async getCustomerLTV(): Promise<CustomerLTV | null> {
    const { data, error } = await supabase
      .rpc('get_customer_ltv');

    if (error) {
      console.error('Error fetching customer LTV:', error);
      return null;
    }

    return data?.[0] || null;
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  /**
   * Format percentage for display
   */
  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  /**
   * Calculate growth rate
   */
  calculateGrowthRate(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  /**
   * Get revenue insights
   */
  getRevenueInsights(overview: RevenueOverview, subscriptionMetrics: SubscriptionMetrics): string[] {
    const insights: string[] = [];

    // MRR insight
    if (overview.mrr > 0) {
      insights.push(`Monthly Recurring Revenue: ${this.formatCurrency(overview.mrr)}`);
    }

    // ARR insight
    if (overview.arr > 0) {
      insights.push(`Annual Run Rate: ${this.formatCurrency(overview.arr)}`);
    }

    // Success rate insight
    if (overview.success_rate >= 95) {
      insights.push(`Excellent payment success rate: ${overview.success_rate}%`);
    } else if (overview.success_rate < 90) {
      insights.push(`⚠️ Payment success rate needs attention: ${overview.success_rate}%`);
    }

    // Churn rate insight
    if (subscriptionMetrics.churn_rate > 0) {
      if (subscriptionMetrics.churn_rate > 5) {
        insights.push(`⚠️ High churn rate: ${subscriptionMetrics.churn_rate}% - Consider retention strategies`);
      } else {
        insights.push(`Healthy churn rate: ${subscriptionMetrics.churn_rate}%`);
      }
    }

    // Growth insight
    if (subscriptionMetrics.new_this_month > subscriptionMetrics.canceled_this_month) {
      const netGrowth = subscriptionMetrics.new_this_month - subscriptionMetrics.canceled_this_month;
      insights.push(`📈 Net subscription growth: +${netGrowth} this month`);
    }

    // Active subscribers
    insights.push(`${subscriptionMetrics.active_subscriptions} active subscribers`);

    return insights;
  }

  /**
   * Get health score based on metrics
   */
  calculateHealthScore(overview: RevenueOverview, subscriptionMetrics: SubscriptionMetrics): number {
    let score = 0;

    // Payment success rate (0-30 points)
    score += (overview.success_rate / 100) * 30;

    // Churn rate (0-30 points, inverse)
    const churnScore = Math.max(0, 30 - subscriptionMetrics.churn_rate * 3);
    score += churnScore;

    // Growth (0-20 points)
    if (subscriptionMetrics.new_this_month > 0) {
      const growthRatio = subscriptionMetrics.new_this_month / Math.max(1, subscriptionMetrics.canceled_this_month);
      score += Math.min(20, growthRatio * 10);
    }

    // Active subscribers (0-20 points)
    if (subscriptionMetrics.active_subscriptions > 0) {
      score += Math.min(20, Math.log10(subscriptionMetrics.active_subscriptions + 1) * 5);
    }

    return Math.min(100, Math.round(score));
  }

  /**
   * Get plan name display
   */
  getPlanDisplayName(planId: string): string {
    const planNames: Record<string, string> = {
      'free': 'Free Plan',
      'basic': 'Basic Plan',
      'pro': 'Pro Plan',
      'enterprise': 'Enterprise',
      'starter': 'Starter',
      'premium': 'Premium',
    };

    return planNames[planId.toLowerCase()] || planId;
  }

  /**
   * Get color for plan
   */
  getPlanColor(planId: string): string {
    const colors: Record<string, string> = {
      'free': '#94a3b8',
      'basic': '#3b82f6',
      'pro': '#8b5cf6',
      'enterprise': '#f59e0b',
      'starter': '#10b981',
      'premium': '#ec4899',
    };

    return colors[planId.toLowerCase()] || '#6b7280';
  }
}

export const revenueService = new RevenueService();
