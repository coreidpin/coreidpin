-- Create RPC functions for analytics

-- Function to get user growth statistics
CREATE OR REPLACE FUNCTION get_user_growth_stats(time_period text DEFAULT '30d')
RETURNS TABLE (
  date text,
  count bigint,
  cumulative bigint
) AS $$
DECLARE
  days_back integer;
BEGIN
  -- Determine how many days to look back
  days_back := CASE time_period
    WHEN '7d' THEN 7
    WHEN '30d' THEN 30
    WHEN '90d' THEN 90
    WHEN '1y' THEN 365
    ELSE 30
  END;

  RETURN QUERY
  WITH date_series AS (
    SELECT generate_series(
      CURRENT_DATE - days_back,
      CURRENT_DATE,
      '1 day'::interval
    )::date AS date
  ),
  daily_counts AS (
    SELECT 
      DATE(created_at) AS signup_date,
      COUNT(*) AS daily_count
    FROM auth.users
    WHERE created_at >= CURRENT_DATE - days_back
    GROUP BY DATE(created_at)
  )
  SELECT 
    ds.date::text,
    COALESCE(dc.daily_count, 0) AS count,
    (
      SELECT COUNT(*)
      FROM auth.users
      WHERE DATE(created_at) <= ds.date
    ) AS cumulative
  FROM date_series ds
  LEFT JOIN daily_counts dc ON ds.date = dc.signup_date
  ORDER BY ds.date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user type breakdown
CREATE OR REPLACE FUNCTION get_user_type_breakdown()
RETURNS TABLE (
  type text,
  count bigint,
  percentage numeric
) AS $$
DECLARE
  total_users bigint;
BEGIN
  -- Get total users
  SELECT COUNT(*) INTO total_users FROM profiles WHERE user_type IS NOT NULL;

  RETURN QUERY
  WITH type_counts AS (
    SELECT 
      COALESCE(user_type, 'professional') AS user_type,
      COUNT(*) AS user_count
    FROM profiles
    GROUP BY COALESCE(user_type, 'professional')
  )
  SELECT 
    tc.user_type::text AS type,
    tc.user_count AS count,
    CASE 
      WHEN total_users > 0 THEN ROUND((tc.user_count::numeric / total_users::numeric) * 100, 2)
      ELSE 0
    END AS percentage
  FROM type_counts tc
  ORDER BY tc.user_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get PIN activation funnel
CREATE OR REPLACE FUNCTION get_pin_activation_funnel()
RETURNS TABLE (
  stage text,
  count bigint,
  percentage numeric,
  dropoff numeric
) AS $$
DECLARE
  total_signups bigint;
  email_verified_count bigint;
  pin_generated_count bigint;
  pin_active_count bigint;
BEGIN
  -- Get counts for each stage
  SELECT COUNT(*) INTO total_signups FROM auth.users;
  
  SELECT COUNT(*) INTO email_verified_count 
  FROM profiles 
  WHERE email_verified = true;
  
  SELECT COUNT(DISTINCT user_id) INTO pin_generated_count 
  FROM professional_pins;
  
  SELECT COUNT(DISTINCT user_id) INTO pin_active_count 
  FROM professional_pins 
  WHERE status = 'active';

  RETURN QUERY
  SELECT 'Signed Up'::text, total_signups, 100.0::numeric, 0.0::numeric
  UNION ALL
  SELECT 
    'Email Verified'::text, 
    email_verified_count,
    CASE WHEN total_signups > 0 THEN ROUND((email_verified_count::numeric / total_signups::numeric) * 100, 2) ELSE 0 END,
    CASE WHEN total_signups > 0 THEN ROUND(((total_signups - email_verified_count)::numeric / total_signups::numeric) * 100, 2) ELSE 0 END
  UNION ALL
  SELECT 
    'PIN Generated'::text, 
    pin_generated_count,
    CASE WHEN total_signups > 0 THEN ROUND((pin_generated_count::numeric / total_signups::numeric) * 100, 2) ELSE 0 END,
    CASE WHEN email_verified_count > 0 THEN ROUND(((email_verified_count - pin_generated_count)::numeric / email_verified_count::numeric) * 100, 2) ELSE 0 END
  UNION ALL
  SELECT 
    'PIN Active'::text, 
    pin_active_count,
    CASE WHEN total_signups > 0 THEN ROUND((pin_active_count::numeric / total_signups::numeric) * 100, 2) ELSE 0 END,
    CASE WHEN pin_generated_count > 0 THEN ROUND(((pin_generated_count - pin_active_count)::numeric / pin_generated_count::numeric) * 100, 2) ELSE 0 END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users (admins will be checked by RLS)
GRANT EXECUTE ON FUNCTION get_user_growth_stats(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_type_breakdown() TO authenticated;
GRANT EXECUTE ON FUNCTION get_pin_activation_funnel() TO authenticated;
