-- Drop existing objects if they exist (from failed migrations)
DROP FUNCTION IF EXISTS get_activity_summary(UUID, INTEGER);
DROP FUNCTION IF EXISTS track_user_activity(TEXT, TEXT, JSONB);
DROP TABLE IF EXISTS profile_views CASCADE;
DROP TABLE IF EXISTS user_activities CASCADE;

-- Create user_activities table for activity tracking and heatmap
CREATE TABLE user_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  activity_title TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id 
  ON user_activities(user_id);

CREATE INDEX IF NOT EXISTS idx_user_activities_user_date 
  ON user_activities(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_activities_type 
  ON user_activities(activity_type);

-- Create profile_views table for tracking profile visits
CREATE TABLE profile_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  viewer_ip TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profile_views_profile_user_id 
  ON profile_views(profile_user_id);

CREATE INDEX IF NOT EXISTS idx_profile_views_created_at 
  ON profile_views(created_at DESC);

-- Enable RLS
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_activities
CREATE POLICY "Users can view own activities"
  ON user_activities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activities"
  ON user_activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for profile_views
CREATE POLICY "Users can view own profile views"
  ON profile_views FOR SELECT
  USING (profile_user_id = auth.uid());

CREATE POLICY "Anyone can insert profile views"
  ON profile_views FOR INSERT
  WITH CHECK (true);

-- Function to track activity
CREATE OR REPLACE FUNCTION track_user_activity(
  p_activity_type TEXT,
  p_activity_title TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_activity_id UUID;
BEGIN
  INSERT INTO user_activities (user_id, activity_type, activity_title, metadata)
  VALUES (auth.uid(), p_activity_type, p_activity_title, p_metadata)
  RETURNING id INTO v_activity_id;
  
  RETURN v_activity_id;
END;
$$;

-- Function to get activity summary
CREATE OR REPLACE FUNCTION get_activity_summary(
  p_user_id UUID,
  p_days INTEGER DEFAULT 365
)
RETURNS TABLE (
  activity_date DATE,
  activity_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(ua.created_at) as activity_date,
    COUNT(*)::BIGINT as activity_count
  FROM user_activities ua
  WHERE ua.user_id = p_user_id
    AND ua.created_at >= NOW() - (p_days || ' days')::INTERVAL
  GROUP BY DATE(ua.created_at)
  ORDER BY activity_date;
END;
$$;

COMMENT ON TABLE user_activities IS 'Tracks all user activities for activity heatmap and analytics';
COMMENT ON TABLE profile_views IS 'Tracks profile page views for analytics';
COMMENT ON FUNCTION track_user_activity IS 'Helper function to track user activities';
COMMENT ON FUNCTION get_activity_summary IS 'Get activity summary for heatmap visualization';
