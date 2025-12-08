import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';

export interface DemandScoreData {
  demand_score: number;
  percentile_rank: number;
  profile_views_30d: number;
  profile_views_growth: number;
  profile_saves: number;
  contact_requests_30d: number;
  matching_jobs_count: number;
  last_calculated_at: string;
}

interface UseDemandScoreResult {
  data: DemandScoreData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch demand score metrics for the current user
 */
export function useDemandScore(): UseDemandScoreResult {
  const [data, setData] = useState<DemandScoreData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDemandScore = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('Not authenticated');
        setIsLoading(false);
        return;
      }

      // Fetch demand metrics
      const { data: metrics, error: metricsError } = await supabase
        .from('pin_demand_metrics')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (metricsError) {
        if (metricsError.code === 'PGRST116') {
          // No data yet - this is okay for new users
          setData(null);
        } else {
          console.error('Error fetching demand score:', metricsError);
          setError('Failed to load demand score');
        }
      } else {
        setData(metrics);
      }
    } catch (err) {
      console.error('Error in useDemandScore:', err);
      setError('Failed to load demand score');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDemandScore();

    // Set up real-time subscription for updates
    const channel = supabase
      .channel('demand-metrics-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pin_demand_metrics',
        },
        (payload) => {
          console.log('Demand metrics updated:', payload);
          fetchDemandScore();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    data,
    isLoading,
    error,
    refetch: fetchDemandScore,
  };
}
