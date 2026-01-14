-- Migration: Add GitHub-style profile fields
-- Phase 2: Database & Backend
-- Date: 2026-01-12

-- =====================================================
-- 1. Add Professional README fields to profiles table
-- =====================================================

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS professional_summary TEXT,
ADD COLUMN IF NOT EXISTS headline TEXT,
ADD COLUMN IF NOT EXISTS specialties TEXT[],
ADD COLUMN IF NOT EXISTS current_focus TEXT[],
ADD COLUMN IF NOT EXISTS open_to TEXT[];

COMMENT ON COLUMN profiles.professional_summary IS 'Rich text/markdown professional summary for README-style display';
COMMENT ON COLUMN profiles.headline IS 'One-line professional headline';
COMMENT ON COLUMN profiles.specialties IS 'Array of what the professional does/specializes in';
COMMENT ON COLUMN profiles.current_focus IS 'Array of current professional focus areas';
COMMENT ON COLUMN profiles.open_to IS 'Array of opportunities they are open to (collaboration, consulting, etc)';

-- =====================================================
-- 2. Add Pinning functionality
-- =====================================================

-- Add pinning to work experiences
ALTER TABLE work_experiences
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS pin_order INTEGER;

-- Add pinning to projects (if projects table exists)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'professional_projects'
  ) THEN
    ALTER TABLE professional_projects
    ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS pin_order INTEGER;
  END IF;
END $$;

-- Create index for pinned items queries
CREATE INDEX IF NOT EXISTS idx_work_experiences_pinned ON work_experiences(user_id, is_pinned) WHERE is_pinned = true;

COMMENT ON COLUMN work_experiences.is_pinned IS 'Whether this experience is pinned to profile (max 6 per user)';
COMMENT ON COLUMN work_experiences.pin_order IS 'Order of pinned items (1-6)';

-- =====================================================
-- 3. Add Connection/Following system
-- =====================================================

CREATE TABLE IF NOT EXISTS user_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  
  -- Prevent duplicate connections
  UNIQUE(follower_id, following_id),
  
  -- Prevent self-following
  CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_connections_follower ON user_connections(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_following ON user_connections(following_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_created ON user_connections(connected_at DESC);

COMMENT ON TABLE user_connections IS 'Professional connections/following relationships';

-- Add cached counts to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS endorsements_count INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_profiles_followers_count ON profiles(followers_count DESC);

COMMENT ON COLUMN profiles.followers_count IS 'Cached count of followers (updated via trigger)';
COMMENT ON COLUMN profiles.following_count IS 'Cached count of users this person follows';
COMMENT ON COLUMN profiles.endorsements_count IS 'Cached count of skill endorsements received';

-- =====================================================
-- 4. Achievements System
-- =====================================================

CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(10), -- Emoji or icon identifier
  criteria JSONB NOT NULL, -- Conditions needed to unlock
  rarity VARCHAR(20) CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')) DEFAULT 'common',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE achievements IS 'Available achievements that users can unlock';

CREATE TABLE IF NOT EXISTS user_achievements (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  metadata JSONB, -- Additional context about how it was earned
  
  PRIMARY KEY (user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id, earned_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement ON user_achievements(achievement_id);

COMMENT ON TABLE user_achievements IS 'Achievements earned by users';

-- Seed some initial achievements
INSERT INTO achievements (name, description, icon, criteria, rarity) VALUES
  ('Verified Professional', 'Complete email verification and add at least one work experience', '✓', '{"email_verified": true, "work_experiences": 1}', 'common'),
  ('Complete Profile', 'Fill out 100% of your profile information', '💯', '{"profile_completion": 100}', 'common'),
  ('Endorsed Expert', 'Receive 10 or more skill endorsements', '⭐', '{"endorsements": 10}', 'rare'),
  ('Active Member', 'Make 50 or more profile activities in a year', '🔥', '{"yearly_activities": 50}', 'rare'),
  ('Community Leader', 'Gain 100 or more connections', '👥', '{"followers": 100}', 'epic'),
  ('Early Adopter', 'Join during the platform''s first year', '🚀', '{"signup_before": "2025-12-31"}', 'rare'),
  ('Identity Verified', 'Complete HRIS verification or 2+ manual verifications', '🛡️', '{"verifications": 2}', 'epic')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 5. Enhanced Activity Tracking
-- =====================================================

-- Add category to existing analytics events
ALTER TABLE profile_analytics_events
ADD COLUMN IF NOT EXISTS event_category VARCHAR(50) 
  CHECK (event_category IN ('verification', 'engagement', 'content', 'achievement'));

-- Create index for category-based queries
CREATE INDEX IF NOT EXISTS idx_analytics_category ON profile_analytics_events(user_id, event_category, created_at DESC);

COMMENT ON COLUMN profile_analytics_events.event_category IS 'Category of activity: verification, engagement, content, or achievement';

-- Update existing events to have categories (based on event_type)
UPDATE profile_analytics_events
SET event_category = CASE
  WHEN event_type IN ('work_verified', 'email_verified', 'document_uploaded') THEN 'verification'
  WHEN event_type IN ('skill_endorsed', 'profile_viewed', 'connection_made') THEN 'engagement'
  WHEN event_type IN ('profile_updated', 'bio_updated', 'project_added') THEN 'content'
  WHEN event_type IN ('achievement_earned', 'milestone_reached') THEN 'achievement'
  ELSE 'content'
END
WHERE event_category IS NULL;

-- =====================================================
-- 6. Triggers for automated counts
-- =====================================================

-- Function to update follower counts
CREATE OR REPLACE FUNCTION update_follower_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment follower count for the person being followed
    UPDATE profiles SET followers_count = followers_count + 1
    WHERE user_id = NEW.following_id;
    
    -- Increment following count for the follower
    UPDATE profiles SET following_count = following_count + 1
    WHERE user_id = NEW.follower_id;
    
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement counts
    UPDATE profiles SET followers_count = GREATEST(followers_count - 1, 0)
    WHERE user_id = OLD.following_id;
    
    UPDATE profiles SET following_count = GREATEST(following_count - 1, 0)
    WHERE user_id = OLD.follower_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on connections table
DROP TRIGGER IF EXISTS trigger_update_follower_counts ON user_connections;
CREATE TRIGGER trigger_update_follower_counts
  AFTER INSERT OR DELETE ON user_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_follower_counts();

-- =====================================================
-- 7. RLS Policies
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE user_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Connections: Users can see all connections, but only manage their own
CREATE POLICY "Anyone can view connections"
  ON user_connections FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own connections"
  ON user_connections FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete their own connections"
  ON user_connections FOR DELETE
  USING (auth.uid() = follower_id);

-- Achievements: Public read, admin write
CREATE POLICY "Anyone can view achievements"
  ON achievements FOR SELECT
  USING (true);

-- User Achievements: Users can view all, system creates
CREATE POLICY "Anyone can view user achievements"
  ON user_achievements FOR SELECT
  USING (true);

CREATE POLICY "Users can view their achievements"
  ON user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 8. Helper Functions
-- =====================================================

-- Function to get pinned items for a user
CREATE OR REPLACE FUNCTION get_pinned_items(p_user_id UUID)
RETURNS TABLE (
  item_type TEXT,
  item_id UUID,
  title TEXT,
  description TEXT,
  date_range TEXT,
  is_verified BOOLEAN,
  pin_order INTEGER
) AS $$
BEGIN
  RETURN QUERY
  -- Work experiences
  SELECT 
    'work'::TEXT,
    we.id,
    we.job_title,
    we.description,
    CASE 
      WHEN we.is_current THEN we.start_date::TEXT || ' - Present'
      ELSE we.start_date::TEXT || ' - ' || COALESCE(we.end_date::TEXT, 'Present')
    END,
    we.verification_status = 'verified',
    we.pin_order
  FROM work_experiences we
  WHERE we.user_id = p_user_id AND we.is_pinned = true
  
  UNION ALL
  
  -- Projects (if table exists)
  SELECT 
    'project'::TEXT,
    pp.id,
    pp.title,
    pp.description,
    pp.created_at::TEXT,
    true,
    pp.pin_order
  FROM professional_projects pp
  WHERE pp.user_id = p_user_id AND pp.is_pinned = true
  
  ORDER BY pin_order ASC NULLS LAST;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_pinned_items IS 'Get all pinned items for a user in display order';

-- =====================================================
-- Success Message
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE '- Added professional README fields to profiles';
  RAISE NOTICE '- Added pinning functionality to work_experiences and projects';
  RAISE NOTICE '- Created user_connections table for following/followers';
  RAISE NOTICE '- Created achievements and user_achievements tables';
  RAISE NOTICE '- Enhanced activity tracking with categories';
  RAISE NOTICE '- Added trigger for automated follower counts';
  RAISE NOTICE '- Set up RLS policies';
  RAISE NOTICE 'Phase 2 database migration complete!';
END $$;
