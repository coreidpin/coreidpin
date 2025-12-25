-- ==========================================
-- Phase 2.2: Performance Monitoring Functions
-- SAFE DEPLOYMENT - Won't error on existing objects
-- ==========================================

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Service role can manage api_metrics" ON public.api_metrics;

-- Create table only if it doesn't exist
CREATE TABLE IF NOT EXISTS public.api_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  response_time INTEGER NOT NULL,
  status_code INTEGER NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes (will skip if exists)
CREATE INDEX IF NOT EXISTS idx_api_metrics_created_at ON api_metrics(created_at);
CREATE INDEX IF NOT EXISTS idx_api_metrics_endpoint ON api_metrics(endpoint);

-- Enable RLS
ALTER TABLE public.api_metrics ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Service role can manage api_metrics"
  ON public.api_metrics
  USING (true)
  WITH CHECK (true);

-- Grant permissions
GRANT ALL ON public.api_metrics TO service_role;
GRANT SELECT ON public.api_metrics TO authenticated;

-- Drop and recreate functions (safe approach)
DROP FUNCTION IF EXISTS get_api_performance_summary(text);
DROP FUNCTION IF EXISTS get_response_time_trends(text);
DROP FUNCTION IF EXISTS get_endpoint_performance(integer);
DROP FUNCTION IF EXISTS get_slow_endpoints(integer);
DROP FUNCTION IF EXISTS get_database_performance();
DROP FUNCTION IF EXISTS get_error_distribution();

-- Function 1: Get API Performance Summary
CREATE FUNCTION get_api_performance_summary(time_period text DEFAULT '1h')
RETURNS TABLE (
  total_requests bigint,
  avg_response_time numeric,
  error_rate numeric,
  requests_per_minute numeric
) AS $$
DECLARE
  minutes_back integer;
BEGIN
  minutes_back := CASE time_period
    WHEN '1h' THEN 60
    WHEN '6h' THEN 360
    WHEN '24h' THEN 1440
    WHEN '7d' THEN 10080
    ELSE 60
  END;

  RETURN QUERY
  WITH metrics AS (
    SELECT 
      COUNT(*) AS total,
      AVG(response_time) AS avg_time,
      SUM(CASE WHEN status_code >= 400 THEN 1 ELSE 0 END) AS errors
    FROM api_metrics
    WHERE created_at >= NOW() - (minutes_back || ' minutes')::interval
  )
  SELECT 
    m.total AS total_requests,
    ROUND(m.avg_time::numeric, 2) AS avg_response_time,
    CASE WHEN m.total > 0 
      THEN ROUND((m.errors::numeric / m.total::numeric) * 100, 2)
      ELSE 0
    END AS error_rate,
    ROUND((m.total::numeric / minutes_back::numeric), 2) AS requests_per_minute
  FROM metrics m;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 2: Get Response Time Trends
CREATE FUNCTION get_response_time_trends(time_period text DEFAULT '24h')
RETURNS TABLE (
  time_bucket text,
  avg_response_time numeric,
  max_response_time integer,
  request_count bigint
) AS $$
DECLARE
  hours_back integer;
  bucket_minutes integer;
BEGIN
  CASE time_period
    WHEN '1h' THEN 
      hours_back := 1;
      bucket_minutes := 5;
    WHEN '6h' THEN 
      hours_back := 6;
      bucket_minutes := 30;
    WHEN '24h' THEN 
      hours_back := 24;
      bucket_minutes := 60;
    WHEN '7d' THEN 
      hours_back := 168;
      bucket_minutes := 360;
    ELSE 
      hours_back := 24;
      bucket_minutes := 60;
  END CASE;

  RETURN QUERY
  SELECT 
    TO_CHAR(
      DATE_TRUNC('hour', created_at) + 
      (EXTRACT(MINUTE FROM created_at)::integer / bucket_minutes) * (bucket_minutes || ' minutes')::interval,
      'YYYY-MM-DD HH24:MI'
    ) AS time_bucket,
    ROUND(AVG(response_time)::numeric, 2) AS avg_response_time,
    MAX(response_time) AS max_response_time,
    COUNT(*) AS request_count
  FROM api_metrics
  WHERE created_at >= NOW() - (hours_back || ' hours')::interval
  GROUP BY 
    DATE_TRUNC('hour', created_at) + 
    (EXTRACT(MINUTE FROM created_at)::integer / bucket_minutes) * (bucket_minutes || ' minutes')::interval
  ORDER BY time_bucket;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 3: Get Endpoint Performance
CREATE FUNCTION get_endpoint_performance(limit_count integer DEFAULT 10)
RETURNS TABLE (
  endpoint text,
  request_count bigint,
  avg_response_time numeric,
  max_response_time integer,
  error_count bigint,
  error_rate numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    am.endpoint,
    COUNT(*) AS request_count,
    ROUND(AVG(am.response_time)::numeric, 2) AS avg_response_time,
    MAX(am.response_time) AS max_response_time,
    SUM(CASE WHEN am.status_code >= 400 THEN 1 ELSE 0 END) AS error_count,
    CASE WHEN COUNT(*) > 0 
      THEN ROUND((SUM(CASE WHEN am.status_code >= 400 THEN 1 ELSE 0 END)::numeric / COUNT(*)::numeric) * 100, 2)
      ELSE 0
    END AS error_rate
  FROM api_metrics am
  WHERE am.created_at >= NOW() - INTERVAL '24 hours'
  GROUP BY am.endpoint
  ORDER BY request_count DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 4: Get Slow Endpoints
CREATE FUNCTION get_slow_endpoints(threshold_ms integer DEFAULT 1000)
RETURNS TABLE (
  endpoint text,
  method text,
  avg_response_time numeric,
  max_response_time integer,
  slow_request_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    am.endpoint,
    am.method,
    ROUND(AVG(am.response_time)::numeric, 2) AS avg_response_time,
    MAX(am.response_time) AS max_response_time,
    COUNT(*) AS slow_request_count
  FROM api_metrics am
  WHERE am.created_at >= NOW() - INTERVAL '24 hours'
    AND am.response_time > threshold_ms
  GROUP BY am.endpoint, am.method
  ORDER BY avg_response_time DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 5: Get Database Performance Stats
CREATE FUNCTION get_database_performance()
RETURNS TABLE (
  database_size text,
  total_connections integer,
  active_connections integer,
  idle_connections integer,
  slowest_queries jsonb
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pg_size_pretty(pg_database_size(current_database())) AS database_size,
    (SELECT count(*)::integer FROM pg_stat_activity) AS total_connections,
    (SELECT count(*)::integer FROM pg_stat_activity WHERE state = 'active') AS active_connections,
    (SELECT count(*)::integer FROM pg_stat_activity WHERE state = 'idle') AS idle_connections,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'query', LEFT(query, 100),
          'duration', EXTRACT(EPOCH FROM (NOW() - query_start)),
          'state', state
        )
      )
      FROM (
        SELECT query, query_start, state
        FROM pg_stat_activity
        WHERE state = 'active' 
          AND query NOT LIKE '%pg_stat_activity%'
        ORDER BY query_start
        LIMIT 5
      ) slow
    ) AS slowest_queries;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 6: Get Error Distribution
CREATE FUNCTION get_error_distribution()
RETURNS TABLE (
  status_code integer,
  error_count bigint,
  percentage numeric,
  sample_endpoint text
) AS $$
BEGIN
  RETURN QUERY
  WITH error_counts AS (
    SELECT 
      am.status_code,
      COUNT(*) AS count,
      (SELECT endpoint FROM api_metrics WHERE status_code = am.status_code ORDER BY created_at DESC LIMIT 1) AS sample
    FROM api_metrics am
    WHERE am.status_code >= 400
      AND am.created_at >= NOW() - INTERVAL '24 hours'
    GROUP BY am.status_code
  ),
  total_errors AS (
    SELECT SUM(count) AS total FROM error_counts
  )
  SELECT 
    ec.status_code,
    ec.count AS error_count,
    ROUND((ec.count::numeric / te.total::numeric) * 100, 2) AS percentage,
    ec.sample AS sample_endpoint
  FROM error_counts ec
  CROSS JOIN total_errors te
  ORDER BY ec.count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions to all functions
GRANT EXECUTE ON FUNCTION get_api_performance_summary(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_response_time_trends(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_endpoint_performance(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION get_slow_endpoints(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION get_database_performance() TO authenticated;
GRANT EXECUTE ON FUNCTION get_error_distribution() TO authenticated;

-- Success message
DO $$ 
BEGIN 
  RAISE NOTICE 'Performance monitoring functions deployed successfully!';
  RAISE NOTICE 'Created 6 functions and api_metrics table';
END $$;
