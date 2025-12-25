-- ==========================================
-- Phase 2.4: Geographic & Demographic Insights
-- ==========================================

-- Note: This assumes you have country/location data in identity_users
-- Adjust column names based on your actual schema

-- Function 1: Get User Distribution by Country
CREATE OR REPLACE FUNCTION get_users_by_country()
RETURNS TABLE (
  country text,
  user_count bigint,
  percentage numeric,
  verified_count bigint,
  business_count bigint
) AS $$
BEGIN
  RETURN QUERY
  WITH country_stats AS (
    SELECT 
      COALESCE(iu.country, 'Unknown') as country_name,
      COUNT(*) as total,
      SUM(CASE WHEN iu.verification_status = 'VERIFIED' THEN 1 ELSE 0 END) as verified,
      SUM(CASE WHEN iu.user_type = 'BUSINESS' THEN 1 ELSE 0 END) as business
    FROM identity_users iu
    GROUP BY COALESCE(iu.country, 'Unknown')
  ),
  total_users AS (
    SELECT SUM(total) as grand_total FROM country_stats
  )
  SELECT 
    cs.country_name as country,
    cs.total as user_count,
    ROUND((cs.total::numeric / tu.grand_total::numeric) * 100, 2) as percentage,
    cs.verified as verified_count,
    cs.business as business_count
  FROM country_stats cs
  CROSS JOIN total_users tu
  WHERE cs.total > 0
  ORDER BY cs.total DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 2: Get User Distribution by Region/State
CREATE OR REPLACE FUNCTION get_users_by_region(country_filter text DEFAULT NULL)
RETURNS TABLE (
  country text,
  region text,
  user_count bigint,
  percentage numeric
) AS $$
BEGIN
  RETURN QUERY
  WITH region_stats AS (
    SELECT 
      COALESCE(iu.country, 'Unknown') as country_name,
      COALESCE(iu.state, 'Unknown') as region_name,
      COUNT(*) as total
    FROM identity_users iu
    WHERE country_filter IS NULL OR iu.country = country_filter
    GROUP BY 
      COALESCE(iu.country, 'Unknown'),
      COALESCE(iu.state, 'Unknown')
  ),
  total_in_filter AS (
    SELECT SUM(total) as grand_total FROM region_stats
  )
  SELECT 
    rs.country_name as country,
    rs.region_name as region,
    rs.total as user_count,
    ROUND((rs.total::numeric / tf.grand_total::numeric) * 100, 2) as percentage
  FROM region_stats rs
  CROSS JOIN total_in_filter tf
  WHERE rs.total > 0
  ORDER BY rs.total DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 3: Get Demographic Breakdown
CREATE OR REPLACE FUNCTION get_demographic_breakdown()
RETURNS TABLE (
  metric_name text,
  metric_value text,
  user_count bigint,
  percentage numeric
) AS $$
BEGIN
  RETURN QUERY
  WITH demographics AS (
    -- User Type Distribution
    SELECT 
      'User Type' as metric,
      COALESCE(user_type::text, 'Unknown') as value,
      COUNT(*) as count
    FROM identity_users
    GROUP BY user_type
    
    UNION ALL
    
    -- Verification Status
    SELECT 
      'Verification Status' as metric,
      COALESCE(verification_status::text, 'Unknown') as value,
      COUNT(*) as count
    FROM identity_users
    GROUP BY verification_status
    
    UNION ALL
    
    -- Profile Completion (if profile_completion column exists)
    SELECT 
      'Profile Completion' as metric,
      CASE 
        WHEN profile_completion >= 80 THEN 'Complete (80%+)'
        WHEN profile_completion >= 50 THEN 'Partial (50-79%)'
        WHEN profile_completion > 0 THEN 'Started (<50%)'
        ELSE 'Empty'
      END as value,
      COUNT(*) as count
    FROM identity_users
    GROUP BY 
      CASE 
        WHEN profile_completion >= 80 THEN 'Complete (80%+)'
        WHEN profile_completion >= 50 THEN 'Partial (50-79%)'
        WHEN profile_completion > 0 THEN 'Started (<50%)'
        ELSE 'Empty'
      END
  ),
  metric_totals AS (
    SELECT 
      metric,
      SUM(count) as total
    FROM demographics
    GROUP BY metric
  )
  SELECT 
    d.metric as metric_name,
    d.value as metric_value,
    d.count as user_count,
    ROUND((d.count::numeric / mt.total::numeric) * 100, 2) as percentage
  FROM demographics d
  JOIN metric_totals mt ON d.metric = mt.metric
  ORDER BY d.metric, d.count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 4: Get Growth by Geography
CREATE OR REPLACE FUNCTION get_geographic_growth(time_period text DEFAULT '30d')
RETURNS TABLE (
  country text,
  new_users bigint,
  growth_rate numeric,
  total_users bigint
) AS $$
DECLARE
  days_back integer;
BEGIN
  days_back := CASE time_period
    WHEN '7d' THEN 7
    WHEN '30d' THEN 30
    WHEN '90d' THEN 90
    ELSE 30
  END;

  RETURN QUERY
  WITH current_period AS (
    SELECT 
      COALESCE(country, 'Unknown') as country_name,
      COUNT(*) as new_count
    FROM identity_users
    WHERE created_at >= NOW() - (days_back || ' days')::interval
    GROUP BY COALESCE(country, 'Unknown')
  ),
  total_counts AS (
    SELECT 
      COALESCE(country, 'Unknown') as country_name,
      COUNT(*) as total_count
    FROM identity_users
    GROUP BY COALESCE(country, 'Unknown')
  )
  SELECT 
    tc.country_name as country,
    COALESCE(cp.new_count, 0) as new_users,
    CASE 
      WHEN tc.total_count - COALESCE(cp.new_count, 0) > 0 
      THEN ROUND((COALESCE(cp.new_count, 0)::numeric / (tc.total_count - COALESCE(cp.new_count, 0))::numeric) * 100, 2)
      ELSE 0
    END as growth_rate,
    tc.total_count as total_users
  FROM total_counts tc
  LEFT JOIN current_period cp ON tc.country_name = cp.country_name
  WHERE tc.total_count > 0
  ORDER BY COALESCE(cp.new_count, 0) DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 5: Get Top Cities (if city data exists)
CREATE OR REPLACE FUNCTION get_users_by_city(limit_count integer DEFAULT 20)
RETURNS TABLE (
  city text,
  country text,
  user_count bigint,
  percentage numeric
) AS $$
BEGIN
  RETURN QUERY
  WITH city_stats AS (
    SELECT 
      COALESCE(iu.city, 'Unknown') as city_name,
      COALESCE(iu.country, 'Unknown') as country_name,
      COUNT(*) as total
    FROM identity_users iu
    WHERE iu.city IS NOT NULL AND iu.city != ''
    GROUP BY 
      COALESCE(iu.city, 'Unknown'),
      COALESCE(iu.country, 'Unknown')
  ),
  total_users AS (
    SELECT SUM(total) as grand_total FROM city_stats
  )
  SELECT 
    cs.city_name as city,
    cs.country_name as country,
    cs.total as user_count,
    ROUND((cs.total::numeric / tu.grand_total::numeric) * 100, 2) as percentage
  FROM city_stats cs
  CROSS JOIN total_users tu
  WHERE cs.total > 0
  ORDER BY cs.total DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 6: Get Geographic Summary
CREATE OR REPLACE FUNCTION get_geographic_summary()
RETURNS TABLE (
  total_countries bigint,
  total_regions bigint,
  total_cities bigint,
  top_country text,
  top_country_users bigint,
  top_country_percentage numeric
) AS $$
BEGIN
  RETURN QUERY
  WITH stats AS (
    SELECT 
      COUNT(DISTINCT COALESCE(country, 'Unknown')) as countries,
      COUNT(DISTINCT COALESCE(state, 'Unknown')) as regions,
      COUNT(DISTINCT COALESCE(city, 'Unknown')) as cities
    FROM identity_users
    WHERE country IS NOT NULL
  ),
  top_country_data AS (
    SELECT 
      COALESCE(country, 'Unknown') as country_name,
      COUNT(*) as user_count,
      ROUND((COUNT(*)::numeric / (SELECT COUNT(*) FROM identity_users)::numeric) * 100, 2) as pct
    FROM identity_users
    GROUP BY COALESCE(country, 'Unknown')
    ORDER BY COUNT(*) DESC
    LIMIT 1
  )
  SELECT 
    s.countries as total_countries,
    s.regions as total_regions,
    s.cities as total_cities,
    tc.country_name as top_country,
    tc.user_count as top_country_users,
    tc.pct as top_country_percentage
  FROM stats s
  CROSS JOIN top_country_data tc;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_users_by_country() TO authenticated;
GRANT EXECUTE ON FUNCTION get_users_by_region(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_demographic_breakdown() TO authenticated;
GRANT EXECUTE ON FUNCTION get_geographic_growth(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_users_by_city(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION get_geographic_summary() TO authenticated;

-- Success message
DO $$ 
BEGIN 
  RAISE NOTICE 'Geographic and demographic functions created successfully!';
  RAISE NOTICE 'Created 6 analysis functions';
END $$;
