import { supabase } from '../../utils/supabase/client';

export interface PerformanceSummary {
  total_requests: number;
  avg_response_time: number;
  error_rate: number;
  requests_per_minute: number;
}

export interface ResponseTimeTrend {
  time_bucket: string;
  avg_response_time: number;
  max_response_time: number;
  request_count: number;
}

export interface EndpointPerformance {
  endpoint: string;
  request_count: number;
  avg_response_time: number;
  max_response_time: number;
  error_count: number;
  error_rate: number;
}

export interface SlowEndpoint {
  endpoint: string;
  method: string;
  avg_response_time: number;
  max_response_time: number;
  slow_request_count: number;
}

export interface DatabasePerformance {
  database_size: string;
  total_connections: number;
  active_connections: number;
  idle_connections: number;
  slowest_queries: any[];
}

export interface ErrorDistribution {
  status_code: number;
  error_count: number;
  percentage: number;
  sample_endpoint: string;
}

export type TimePeriod = '1h' | '6h' | '24h' | '7d';

class MonitoringService {
  /**
   * Get API performance summary
   */
  async getPerformanceSummary(timePeriod: TimePeriod = '1h'): Promise<PerformanceSummary | null> {
    const { data, error } = await supabase
      .rpc('get_api_performance_summary', { time_period: timePeriod });

    if (error) {
      console.error('Error fetching performance summary:', error);
      return null;
    }

    return data?.[0] || null;
  }

  /**
   * Get response time trends over time
   */
  async getResponseTimeTrends(timePeriod: TimePeriod = '24h'): Promise<ResponseTimeTrend[]> {
    const { data, error } = await supabase
      .rpc('get_response_time_trends', { time_period: timePeriod });

    if (error) {
      console.error('Error fetching response time trends:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get endpoint performance statistics
   */
  async getEndpointPerformance(limit: number = 10): Promise<EndpointPerformance[]> {
    const { data, error } = await supabase
      .rpc('get_endpoint_performance', { limit_count: limit });

    if (error) {
      console.error('Error fetching endpoint performance:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get slow endpoints
   */
  async getSlowEndpoints(thresholdMs: number = 1000): Promise<SlowEndpoint[]> {
    const { data, error } = await supabase
      .rpc('get_slow_endpoints', { threshold_ms: thresholdMs });

    if (error) {
      console.error('Error fetching slow endpoints:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get database performance metrics
   */
  async getDatabasePerformance(): Promise<DatabasePerformance | null> {
    const { data, error } = await supabase
      .rpc('get_database_performance');

    if (error) {
      console.error('Error fetching database performance:', error);
      return null;
    }

    return data?.[0] || null;
  }

  /**
   * Get error distribution
   */
  async getErrorDistribution(): Promise<ErrorDistribution[]> {
    const { data, error } = await supabase
      .rpc('get_error_distribution');

    if (error) {
      console.error('Error fetching error distribution:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Log API metric (for client-side tracking)
   */
  async logApiMetric(endpoint: string, method: string, responseTime: number, statusCode: number): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('api_metrics')
      .insert({
        endpoint,
        method,
        response_time: responseTime,
        status_code: statusCode,
        user_id: user?.id
      });

    if (error) {
      console.error('Error logging API metric:', error);
    }
  }

  /**
   * Get health score based on metrics
   */
  calculateHealthScore(summary: PerformanceSummary | null): number {
    if (!summary) return 0;

    let score = 100;

    // Deduct points for high response time
    if (summary.avg_response_time > 1000) score -= 30;
    else if (summary.avg_response_time > 500) score -= 15;
    else if (summary.avg_response_time > 200) score -= 5;

    // Deduct points for high error rate
    if (summary.error_rate > 10) score -= 40;
    else if (summary.error_rate > 5) score -= 20;
    else if (summary.error_rate > 1) score -= 10;

    // Deduct points for low request rate (possible service issue)
    if (summary.requests_per_minute < 0.1) score -= 10;

    return Math.max(0, score);
  }

  /**
   * Get health status based on score
   */
  getHealthStatus(score: number): 'excellent' | 'good' | 'fair' | 'poor' | 'critical' {
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 50) return 'fair';
    if (score >= 25) return 'poor';
    return 'critical';
  }

  /**
   * Get recommendations based on performance data
   */
  getRecommendations(
    summary: PerformanceSummary | null,
    slowEndpoints: SlowEndpoint[]
  ): string[] {
    const recommendations: string[] = [];

    if (!summary) return recommendations;

    if (summary.avg_response_time > 500) {
      recommendations.push('Consider implementing caching for frequently accessed endpoints');
    }

    if (summary.error_rate > 5) {
      recommendations.push('High error rate detected - review error logs and fix critical issues');
    }

    if (slowEndpoints.length > 0) {
      recommendations.push(`Optimize slow endpoints: ${slowEndpoints.slice(0, 3).map(e => e.endpoint).join(', ')}`);
    }

    if (summary.requests_per_minute > 100) {
      recommendations.push('Consider implementing rate limiting to prevent API abuse');
    }

    if (recommendations.length === 0) {
      recommendations.push('System performance is optimal - continue monitoring');
    }

    return recommendations;
  }
}

export const monitoringService = new MonitoringService();
