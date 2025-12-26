-- ==========================================
-- Phase 3.3: Audit & Activity Logs
-- Comprehensive activity tracking system
-- ==========================================

-- Drop old tables and functions if they exist
DROP TABLE IF EXISTS user_activity_logs CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS admin_audit_logs CASCADE;
DROP FUNCTION IF EXISTS log_audit_event(uuid, text, text, text, text, text, jsonb, jsonb, jsonb, text, text);
DROP FUNCTION IF EXISTS get_audit_logs(uuid, text, text, text, text, timestamptz, timestamptz, integer, integer);
DROP FUNCTION IF EXISTS get_user_activity(uuid, text, timestamptz, timestamptz, integer, integer);
DROP FUNCTION IF EXISTS get_audit_statistics(timestamptz, timestamptz);
DROP FUNCTION IF EXISTS cleanup_old_audit_logs(integer);
DROP FUNCTION IF EXISTS log_admin_action(text, text, text, jsonb);

-- Create audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  actor_type TEXT NOT NULL DEFAULT 'admin', -- admin, system, user
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL, -- user, setting, endorsement, project, etc.
  resource_id TEXT,
  old_values JSONB,
  new_values JSONB,
  metadata JSONB,
  ip_address TEXT,
  user_agent TEXT,
  status TEXT NOT NULL DEFAULT 'success', -- success, failure, pending
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_status ON audit_logs(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_type ON audit_logs(actor_type);

-- Create user activity logs table (for non-admin actions)
CREATE TABLE IF NOT EXISTS user_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT,
  activity_type TEXT NOT NULL, -- login, logout, profile_update, pin_generate, etc.
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for user activity
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_type ON user_activity_logs(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON user_activity_logs(created_at DESC);

-- Function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event(
  p_user_id UUID,
  p_user_email TEXT,
  p_actor_type TEXT,
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id TEXT DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL,
  p_status TEXT DEFAULT 'success',
  p_error_message TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id uuid;
BEGIN
  INSERT INTO audit_logs (
    user_id, user_email, actor_type, action, resource_type, resource_id,
    old_values, new_values, metadata, status, error_message
  ) VALUES (
    p_user_id, p_user_email, p_actor_type, p_action, p_resource_type, p_resource_id,
    p_old_values, p_new_values, p_metadata, p_status, p_error_message
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get audit logs with filters
CREATE OR REPLACE FUNCTION get_audit_logs(
  p_user_id UUID DEFAULT NULL,
  p_action TEXT DEFAULT NULL,
  p_resource_type TEXT DEFAULT NULL,
  p_actor_type TEXT DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  user_email text,
  actor_type text,
  action text,
  resource_type text,
  resource_id text,
  old_values jsonb,
  new_values jsonb,
  metadata jsonb,
  status text,
  error_message text,
  created_at timestamptz,
  total_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.user_id,
    a.user_email,
    a.actor_type,
    a.action,
    a.resource_type,
    a.resource_id,
    a.old_values,
    a.new_values,
    a.metadata,
    a.status,
    a.error_message,
    a.created_at,
    COUNT(*) OVER() as total_count
  FROM audit_logs a
  WHERE 
    (p_user_id IS NULL OR a.user_id = p_user_id)
    AND (p_action IS NULL OR a.action = p_action)
    AND (p_resource_type IS NULL OR a.resource_type = p_resource_type)
    AND (p_actor_type IS NULL OR a.actor_type = p_actor_type)
    AND (p_status IS NULL OR a.status = p_status)
    AND (p_start_date IS NULL OR a.created_at >= p_start_date)
    AND (p_end_date IS NULL OR a.created_at <= p_end_date)
  ORDER BY a.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user activity logs
CREATE OR REPLACE FUNCTION get_user_activity(
  p_user_id UUID DEFAULT NULL,
  p_activity_type TEXT DEFAULT NULL,
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  user_email text,
  activity_type text,
  details jsonb,
  ip_address text,
  created_at timestamptz,
  total_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ua.id,
    ua.user_id,
    ua.user_email,
    ua.activity_type,
    ua.details,
    ua.ip_address,
    ua.created_at,
    COUNT(*) OVER() as total_count
  FROM user_activity_logs ua
  WHERE 
    (p_user_id IS NULL OR ua.user_id = p_user_id)
    AND (p_activity_type IS NULL OR ua.activity_type = p_activity_type)
    AND (p_start_date IS NULL OR ua.created_at >= p_start_date)
    AND (p_end_date IS NULL OR ua.created_at <= p_end_date)
  ORDER BY ua.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get audit statistics
CREATE OR REPLACE FUNCTION get_audit_statistics(
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  total_events bigint,
  successful_events bigint,
  failed_events bigint,
  unique_users bigint,
  events_by_action jsonb,
  events_by_resource jsonb,
  events_by_day jsonb
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::bigint as total_events,
    COUNT(*) FILTER (WHERE status = 'success')::bigint as successful_events,
    COUNT(*) FILTER (WHERE status = 'failure')::bigint as failed_events,
    COUNT(DISTINCT user_id)::bigint as unique_users,
    (
      SELECT jsonb_object_agg(action, count)
      FROM (
        SELECT action, COUNT(*)::integer as count
        FROM audit_logs
        WHERE (p_start_date IS NULL OR created_at >= p_start_date)
          AND (p_end_date IS NULL OR created_at <= p_end_date)
        GROUP BY action
        ORDER BY count DESC
        LIMIT 10
      ) actions
    ) as events_by_action,
    (
      SELECT jsonb_object_agg(resource_type, count)
      FROM (
        SELECT resource_type, COUNT(*)::integer as count
        FROM audit_logs
        WHERE (p_start_date IS NULL OR created_at >= p_start_date)
          AND (p_end_date IS NULL OR created_at <= p_end_date)
        GROUP BY resource_type
        ORDER BY count DESC
        LIMIT 10
      ) resources
    ) as events_by_resource,
    (
      SELECT jsonb_object_agg(day, count)
      FROM (
        SELECT 
          DATE(created_at) as day,
          COUNT(*)::integer as count
        FROM audit_logs
        WHERE (p_start_date IS NULL OR created_at >= p_start_date)
          AND (p_end_date IS NULL OR created_at <= p_end_date)
        GROUP BY DATE(created_at)
        ORDER BY day DESC
        LIMIT 30
      ) days
    ) as events_by_day
  FROM audit_logs
  WHERE (p_start_date IS NULL OR created_at >= p_start_date)
    AND (p_end_date IS NULL OR created_at <= p_end_date);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup old audit logs (retention policy)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs(p_retention_days INTEGER DEFAULT 90)
RETURNS TABLE (
  deleted_count integer,
  message text
) AS $$
DECLARE
  v_count integer;
  v_cutoff_date timestamptz;
BEGIN
  v_cutoff_date := NOW() - (p_retention_days || ' days')::interval;
  
  DELETE FROM audit_logs
  WHERE created_at < v_cutoff_date;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  
  DELETE FROM user_activity_logs
  WHERE created_at < v_cutoff_date;
  
  RETURN QUERY SELECT 
    v_count,
    format('Deleted %s audit logs older than %s days', v_count, p_retention_days)::text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT SELECT ON audit_logs TO authenticated;
GRANT SELECT ON user_activity_logs TO authenticated;
GRANT EXECUTE ON FUNCTION log_audit_event TO authenticated;
GRANT EXECUTE ON FUNCTION get_audit_logs TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_activity TO authenticated;
GRANT EXECUTE ON FUNCTION get_audit_statistics TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_audit_logs TO authenticated;

-- Success message
DO $$ 
BEGIN 
  RAISE NOTICE '✅ Audit & Activity Logs database created successfully!';
  RAISE NOTICE 'Created tables: audit_logs, user_activity_logs';
  RAISE NOTICE 'Created functions: log_audit_event, get_audit_logs, get_user_activity, get_audit_statistics, cleanup_old_audit_logs';
  RAISE NOTICE 'Audit trail is now active!';
END $$;
