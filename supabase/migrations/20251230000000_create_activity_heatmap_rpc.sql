-- Function to get activity summary for heatmap
-- Aggregates user_activities by date for the heatmap component

DROP FUNCTION IF EXISTS get_activity_summary(uuid, int);

CREATE OR REPLACE FUNCTION get_activity_summary(
  p_user_id uuid,
  p_days int DEFAULT 365
)
RETURNS TABLE (
  activity_date text,
  activity_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    to_char(created_at, 'YYYY-MM-DD') as activity_date,
    COUNT(*) as activity_count
  FROM
    user_activities
  WHERE
    user_id = p_user_id
    AND created_at > (now() - (p_days || ' days')::interval)
  GROUP BY
    to_char(created_at, 'YYYY-MM-DD')
  ORDER BY
    activity_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to authenticated users
GRANT EXECUTE ON FUNCTION get_activity_summary(uuid, int) TO authenticated;
GRANT EXECUTE ON FUNCTION get_activity_summary(uuid, int) TO service_role;
