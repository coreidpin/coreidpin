-- ==========================================
-- Phase 3.4: Notifications & Announcements
-- System communication and alert management
-- ==========================================

-- Drop old tables and functions if they exist (aggressive cleanup)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all announcement-related functions in public schema only
    FOR r IN SELECT n.nspname as schema, p.proname, oidvectortypes(p.proargtypes) as argtypes
             FROM pg_proc p
             JOIN pg_namespace n ON p.pronamespace = n.oid
             WHERE n.nspname = 'public'
             AND (p.proname LIKE '%announcement%' OR p.proname LIKE '%notification%')
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || r.schema || '.' || r.proname || '(' || r.argtypes || ') CASCADE';
    END LOOP;
END $$;

-- Drop tables
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;

-- Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- info, success, warning, error
  target_audience TEXT NOT NULL DEFAULT 'all', -- all, business, professional, admin, individual
  is_active BOOLEAN DEFAULT true,
  priority TEXT NOT NULL DEFAULT 'normal', -- low, normal, high, urgent
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  ends_at TIMESTAMPTZ,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create notifications table (user-specific)
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- info, success, warning, error
  category TEXT, -- system, announcement, user_action, etc.
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_announcements_is_active ON announcements(is_active);
CREATE INDEX IF NOT EXISTS idx_announcements_target_audience ON announcements(target_audience);
CREATE INDEX IF NOT EXISTS idx_announcements_starts_at ON announcements(starts_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Function to get active announcements for a user
CREATE OR REPLACE FUNCTION get_active_announcements(p_user_type TEXT DEFAULT 'individual')
RETURNS TABLE (
  id uuid,
  title text,
  message text,
  type text,
  target_audience text,
  priority text,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.title,
    a.message,
    a.type,
    a.target_audience,
    a.priority,
    a.starts_at,
    a.ends_at,
    a.created_at
  FROM announcements a
  WHERE a.is_active = true
    AND a.starts_at <= NOW()
    AND (a.ends_at IS NULL OR a.ends_at >= NOW())
    AND (a.target_audience = 'all' OR a.target_audience = p_user_type)
  ORDER BY 
    CASE a.priority
      WHEN 'urgent' THEN 1
      WHEN 'high' THEN 2
      WHEN 'normal' THEN 3
      WHEN 'low' THEN 4
    END,
    a.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all announcements (admin)
CREATE OR REPLACE FUNCTION get_all_announcements(
  p_is_active BOOLEAN DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  title text,
  message text,
  type text,
  target_audience text,
  is_active boolean,
  priority text,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz,
  total_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.title,
    a.message,
    a.type,
    a.target_audience,
    a.is_active,
    a.priority,
    a.starts_at,
    a.ends_at,
    a.created_at,
    COUNT(*) OVER() as total_count
  FROM announcements a
  WHERE p_is_active IS NULL OR a.is_active = p_is_active
  ORDER BY a.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create announcement
CREATE OR REPLACE FUNCTION create_announcement(
  p_title TEXT,
  p_message TEXT,
  p_type TEXT,
  p_target_audience TEXT,
  p_priority TEXT DEFAULT 'normal',
  p_starts_at TIMESTAMPTZ DEFAULT NOW(),
  p_ends_at TIMESTAMPTZ DEFAULT NULL,
  p_created_by UUID DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_announcement_id uuid;
BEGIN
  INSERT INTO announcements (
    title, message, type, target_audience, priority, starts_at, ends_at, created_by
  ) VALUES (
    p_title, p_message, p_type, p_target_audience, p_priority, p_starts_at, p_ends_at, p_created_by
  )
  RETURNING id INTO v_announcement_id;
  
  RETURN v_announcement_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update announcement
CREATE OR REPLACE FUNCTION update_announcement(
  p_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT,
  p_target_audience TEXT,
  p_priority TEXT,
  p_is_active BOOLEAN,
  p_ends_at TIMESTAMPTZ
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE announcements
  SET
    title = p_title,
    message = p_message,
    type = p_type,
    target_audience = p_target_audience,
    priority = p_priority,
    is_active = p_is_active,
    ends_at = p_ends_at,
    updated_at = NOW()
  WHERE id = p_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete announcement
CREATE OR REPLACE FUNCTION delete_announcement(p_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  DELETE FROM announcements WHERE id = p_id;
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user notifications
CREATE OR REPLACE FUNCTION get_user_notifications(
  p_user_id UUID,
  p_is_read BOOLEAN DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  title text,
  message text,
  type text,
  category text,
  link text,
  is_read boolean,
  read_at timestamptz,
  created_at timestamptz,
  total_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id,
    n.title,
    n.message,
    n.type,
    n.category,
    n.link,
    n.is_read,
    n.read_at,
    n.created_at,
    COUNT(*) OVER() as total_count
  FROM notifications n
  WHERE n.user_id = p_user_id
    AND (p_is_read IS NULL OR n.is_read = p_is_read)
  ORDER BY n.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(p_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE notifications
  SET is_read = true, read_at = NOW()
  WHERE id = p_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark all notifications as read
CREATE OR REPLACE FUNCTION mark_all_notifications_read(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count integer;
BEGIN
  UPDATE notifications
  SET is_read = true, read_at = NOW()
  WHERE user_id = p_user_id AND is_read = false;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT DEFAULT 'info',
  p_category TEXT DEFAULT NULL,
  p_link TEXT DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_notification_id uuid;
BEGIN
  INSERT INTO notifications (
    user_id, title, message, type, category, link
  ) VALUES (
    p_user_id, p_title, p_message, p_type, p_category, p_link
  )
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get notification statistics
CREATE OR REPLACE FUNCTION get_notification_statistics()
RETURNS TABLE (
  total_announcements bigint,
  active_announcements bigint,
  total_notifications bigint,
  unread_notifications bigint,
  announcements_by_type jsonb,
  notifications_by_category jsonb
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*)::bigint FROM announcements) as total_announcements,
    (SELECT COUNT(*)::bigint FROM announcements WHERE is_active = true) as active_announcements,
    (SELECT COUNT(*)::bigint FROM notifications) as total_notifications,
    (SELECT COUNT(*)::bigint FROM notifications WHERE is_read = false) as unread_notifications,
    (
      SELECT jsonb_object_agg(type, count)
      FROM (
        SELECT type, COUNT(*)::integer as count
        FROM announcements
        WHERE is_active = true
        GROUP BY type
      ) types
    ) as announcements_by_type,
    (
      SELECT jsonb_object_agg(category, count)
      FROM (
        SELECT COALESCE(category, 'uncategorized') as category, COUNT(*)::integer as count
        FROM notifications
        GROUP BY category
        ORDER BY count DESC
        LIMIT 10
      ) categories
    ) as notifications_by_category;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-update timestamp
CREATE OR REPLACE FUNCTION update_announcements_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS announcements_updated_at ON announcements;
CREATE TRIGGER announcements_updated_at
  BEFORE UPDATE ON announcements
  FOR EACH ROW
  EXECUTE FUNCTION update_announcements_timestamp();

-- Grant permissions
GRANT SELECT ON announcements TO authenticated;
GRANT SELECT ON notifications TO authenticated;
GRANT EXECUTE ON FUNCTION get_active_announcements TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_announcements TO authenticated;
GRANT EXECUTE ON FUNCTION create_announcement TO authenticated;
GRANT EXECUTE ON FUNCTION update_announcement TO authenticated;
GRANT EXECUTE ON FUNCTION delete_announcement TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_notifications TO authenticated;
GRANT EXECUTE ON FUNCTION mark_notification_read TO authenticated;
GRANT EXECUTE ON FUNCTION mark_all_notifications_read TO authenticated;
GRANT EXECUTE ON FUNCTION create_notification TO authenticated;
GRANT EXECUTE ON FUNCTION get_notification_statistics TO authenticated;

-- Success message
DO $$ 
BEGIN 
  RAISE NOTICE '✅ Notifications & Announcements database created successfully!';
  RAISE NOTICE 'Created tables: announcements, notifications';
  RAISE NOTICE 'Created functions: 10 notification/announcement management functions';
  RAISE NOTICE 'System communication is now enabled!';
END $$;
