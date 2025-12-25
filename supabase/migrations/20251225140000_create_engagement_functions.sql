-- ==========================================
-- Phase 2: User Engagement Analytics
-- ==========================================

-- Function 1: Get Active Users (DAU/WAU/MAU)
CREATE OR REPLACE FUNCTION get_active_users(metric_type text DEFAULT 'dau')
RETURNS TABLE (
  date text,
  active_users bigint
) AS $$
DECLARE
  days_back integer;
  interval_days integer;
BEGIN
  -- Determine lookback period and interval
  CASE metric_type
    WHEN 'dau' THEN 
      days_back := 30;
      interval_days := 1;
    WHEN 'wau' THEN 
      days_back := 90;
      interval_days := 7;
    WHEN 'mau' THEN 
      days_back := 365;
      interval_days := 30;
    ELSE 
      days_back := 30;
      interval_days := 1;
  END CASE;

  RETURN QUERY
  WITH date_series AS (
    SELECT generate_series(
      CURRENT_DATE - days_back,
      CURRENT_DATE,
      (interval_days || ' days')::interval
    )::date AS period_date
  )
  SELECT 
    ds.period_date::text AS date,
    COUNT(DISTINCT au.user_id) AS active_users
  FROM date_series ds
  LEFT JOIN auth.users au ON 
    DATE(au.last_sign_in_at) >= ds.period_date - (interval_days - 1) AND
    DATE(au.last_sign_in_at) <= ds.period_date
  GROUP BY ds.period_date
  ORDER BY ds.period_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 2: Get Retention Cohorts
CREATE OR REPLACE FUNCTION get_retention_cohorts()
RETURNS TABLE (
  cohort_month text,
  cohort_size bigint,
  month_0 numeric,
  month_1 numeric,
  month_2 numeric,
  month_3 numeric
) AS $$
BEGIN
  RETURN QUERY
  WITH cohorts AS (
    SELECT 
      DATE_TRUNC('month', created_at)::date AS signup_month,
      id AS user_id
    FROM auth.users
    WHERE created_at >= CURRENT_DATE - INTERVAL '6 months'
  ),
  cohort_sizes AS (
    SELECT 
      signup_month,
      COUNT(*) AS size
    FROM cohorts
    GROUP BY signup_month
  ),
  cohort_activity AS (
    SELECT 
      c.signup_month,
      DATE_TRUNC('month', u.last_sign_in_at)::date AS activity_month,
      COUNT(DISTINCT c.user_id) AS active_users
    FROM cohorts c
    JOIN auth.users u ON c.user_id = u.id
    WHERE u.last_sign_in_at IS NOT NULL
    GROUP BY c.signup_month, DATE_TRUNC('month', u.last_sign_in_at)
  )
  SELECT 
    cs.signup_month::text AS cohort_month,
    cs.size AS cohort_size,
    ROUND((MAX(CASE WHEN ca.activity_month = cs.signup_month THEN ca.active_users ELSE 0 END)::numeric / cs.size::numeric) * 100, 1) AS month_0,
    ROUND((MAX(CASE WHEN ca.activity_month = cs.signup_month + INTERVAL '1 month' THEN ca.active_users ELSE 0 END)::numeric / cs.size::numeric) * 100, 1) AS month_1,
    ROUND((MAX(CASE WHEN ca.activity_month = cs.signup_month + INTERVAL '2 months' THEN ca.active_users ELSE 0 END)::numeric / cs.size::numeric) * 100, 1) AS month_2,
    ROUND((MAX(CASE WHEN ca.activity_month = cs.signup_month + INTERVAL '3 months' THEN ca.active_users ELSE 0 END)::numeric / cs.size::numeric) * 100, 1) AS month_3
  FROM cohort_sizes cs
  LEFT JOIN cohort_activity ca ON cs.signup_month = ca.signup_month
  GROUP BY cs.signup_month, cs.size
  ORDER BY cs.signup_month DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 3: Get Feature Usage Stats
CREATE OR REPLACE FUNCTION get_feature_usage()
RETURNS TABLE (
  feature_name text,
  usage_count bigint,
  unique_users bigint,
  last_used timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'PIN Verifications'::text AS feature_name,
    COUNT(*)::bigint AS usage_count,
    COUNT(DISTINCT user_id)::bigint AS unique_users,
    MAX(created_at) AS last_used
  FROM professional_pins
  
  UNION ALL
  
  SELECT 
    'Profile Updates'::text,
    COUNT(*)::bigint,
    COUNT(DISTINCT user_id)::bigint,
    MAX(updated_at)
  FROM profiles
  WHERE updated_at IS NOT NULL
  
  UNION ALL
  
  SELECT 
    'Work Experience Entries'::text,
    COUNT(*)::bigint,
    COUNT(DISTINCT user_id)::bigint,
    MAX(created_at)
  FROM work_experiences
  
  ORDER BY usage_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 4: Get Engagement Summary
CREATE OR REPLACE FUNCTION get_engagement_summary()
RETURNS TABLE (
  metric_name text,
  metric_value bigint,
  change_percent numeric
) AS $$
DECLARE
  current_dau bigint;
  previous_dau bigint;
  current_wau bigint;
  previous_wau bigint;
  total_users bigint;
  active_today bigint;
BEGIN
  -- Calculate DAU (today)
  SELECT COUNT(DISTINCT id) INTO active_today
  FROM auth.users
  WHERE DATE(last_sign_in_at) = CURRENT_DATE;
  
  -- Calculate DAU (yesterday)
  SELECT COUNT(DISTINCT id) INTO previous_dau
  FROM auth.users
  WHERE DATE(last_sign_in_at) = CURRENT_DATE - 1;
  
  -- Calculate WAU (last 7 days)
  SELECT COUNT(DISTINCT id) INTO current_wau
  FROM auth.users
  WHERE last_sign_in_at >= CURRENT_DATE - 7;
  
  -- Calculate WAU (previous 7 days)
  SELECT COUNT(DISTINCT id) INTO previous_wau
  FROM auth.users
  WHERE last_sign_in_at >= CURRENT_DATE - 14
    AND last_sign_in_at < CURRENT_DATE - 7;
  
  -- Total users
  SELECT COUNT(*) INTO total_users FROM auth.users;
  
  RETURN QUERY
  SELECT 
    'Daily Active Users'::text,
    active_today,
    CASE WHEN previous_dau > 0 
      THEN ROUND(((active_today::numeric - previous_dau::numeric) / previous_dau::numeric) * 100, 1)
      ELSE 0
    END
  UNION ALL
  SELECT 
    'Weekly Active Users'::text,
    current_wau,
    CASE WHEN previous_wau > 0 
      THEN ROUND(((current_wau::numeric - previous_wau::numeric) / previous_wau::numeric) * 100, 1)
      ELSE 0
    END
  UNION ALL
  SELECT 
    'Total Users'::text,
    total_users,
    0::numeric;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_active_users(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_retention_cohorts() TO authenticated;
GRANT EXECUTE ON FUNCTION get_feature_usage() TO authenticated;
GRANT EXECUTE ON FUNCTION get_engagement_summary() TO authenticated;

-- Test queries (optional)
-- SELECT * FROM get_active_users('dau');
-- SELECT * FROM get_retention_cohorts();
-- SELECT * FROM get_feature_usage();
-- SELECT * FROM get_engagement_summary();
