-- Create Influential Professionals Feature
-- This migration creates the database infrastructure for invitation-only influential professionals

-- =======================
-- TABLES
-- =======================

-- Influential Professionals Table
CREATE TABLE IF NOT EXISTS public.influential_professionals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'declined', 'alumni')),
  categories TEXT[] DEFAULT '{}',
  influence_score INTEGER DEFAULT 0,
  bio_headline TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Flagship Projects Table
CREATE TABLE IF NOT EXISTS public.flagship_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  impact_metrics JSONB DEFAULT '{}',
  tech_stack TEXT[] DEFAULT '{}',
  project_url TEXT,
  media_urls TEXT[] DEFAULT '{}',
  start_date DATE,
  end_date DATE,
  is_ongoing BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add influential flag to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_influential BOOLEAN DEFAULT false;

-- =======================
-- INDEXES
-- =======================

CREATE INDEX IF NOT EXISTS idx_influential_status ON public.influential_professionals(status);
CREATE INDEX IF NOT EXISTS idx_influential_user ON public.influential_professionals(user_id);
CREATE INDEX IF NOT EXISTS idx_influential_score ON public.influential_professionals(influence_score DESC);
CREATE INDEX IF NOT EXISTS idx_flagship_user ON public.flagship_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_flagship_visible ON public.flagship_projects(is_visible, display_order);
CREATE INDEX IF NOT EXISTS idx_profiles_influential ON public.profiles(is_influential) WHERE is_influential = true;

-- =======================
-- RLS POLICIES
-- =======================

ALTER TABLE public.influential_professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flagship_projects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view active influential professionals" ON public.influential_professionals;
DROP POLICY IF EXISTS "Users can view their own influential records" ON public.influential_professionals;
DROP POLICY IF EXISTS "Service role can manage influential professionals" ON public.influential_professionals;
DROP POLICY IF EXISTS "Anyone can view visible flagship projects" ON public.flagship_projects;
DROP POLICY IF EXISTS "Users can manage their own flagship projects" ON public.flagship_projects;
DROP POLICY IF EXISTS "Service role can manage flagship projects" ON public.flagship_projects;

-- Influential Professionals Policies
CREATE POLICY "Anyone can view active influential professionals"
  ON public.influential_professionals FOR SELECT
  USING (status = 'active');

CREATE POLICY "Users can view their own influential records"
  ON public.influential_professionals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage influential professionals"
  ON public.influential_professionals FOR ALL
  USING (true)
  WITH CHECK (true);

-- Flagship Projects Policies
CREATE POLICY "Anyone can view visible flagship projects"
  ON public.flagship_projects FOR SELECT
  USING (is_visible = true);

CREATE POLICY "Users can manage their own flagship projects"
  ON public.flagship_projects FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage flagship projects"
  ON public.flagship_projects FOR ALL
  USING (true)
  WITH CHECK (true);

-- =======================
-- GRANTS
-- =======================

GRANT ALL ON public.influential_professionals TO service_role;
GRANT ALL ON public.flagship_projects TO service_role;
GRANT SELECT ON public.influential_professionals TO anon, authenticated;
GRANT SELECT ON public.flagship_projects TO anon, authenticated;

-- =======================
-- FUNCTIONS
-- =======================

-- Function to sync is_influential flag when status changes
CREATE OR REPLACE FUNCTION sync_influential_flag()
RETURNS TRIGGER AS $$
BEGIN
  -- Update profiles table when influential status becomes active
  IF NEW.status = 'active' THEN
    UPDATE public.profiles
    SET is_influential = true
    WHERE id = NEW.user_id;
  ELSIF NEW.status IN ('declined', 'alumni') THEN
    UPDATE public.profiles
    SET is_influential = false
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-sync influential flag
DROP TRIGGER IF EXISTS sync_influential_flag_trigger ON public.influential_professionals;
CREATE TRIGGER sync_influential_flag_trigger
  AFTER INSERT OR UPDATE OF status ON public.influential_professionals
  FOR EACH ROW
  EXECUTE FUNCTION sync_influential_flag();

-- Function to calculate basic influence score
CREATE OR REPLACE FUNCTION calculate_influence_score(target_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
  profile_completion INTEGER;
  verified_experiences INTEGER;
  flagship_count INTEGER;
  pin_views INTEGER;
  endorsements_count INTEGER;
BEGIN
  -- Profile completion (0-20 points)
  SELECT COALESCE(profile_completion_percentage, 0) * 0.2
  INTO profile_completion
  FROM public.profiles
  WHERE id = target_user_id;
  
  score := score + COALESCE(profile_completion, 0);
  
  -- Verified work experiences (0-25 points, 5 points each, max 5)
  SELECT COUNT(*) * 5
  INTO verified_experiences
  FROM public.work_experience
  WHERE user_id = target_user_id 
    AND is_hris_verified = true
  LIMIT 5;
  
  score := score + COALESCE(verified_experiences, 0);
  
  -- Flagship projects (0-20 points, 10 points each, max 2)
  SELECT COUNT(*) * 10
  INTO flagship_count
  FROM public.flagship_projects
  WHERE user_id = target_user_id
    AND is_visible = true
  LIMIT 2;
  
  score := score + COALESCE(flagship_count, 0);
  
  -- PIN views/engagement (0-15 points, 1 point per 100 views)
  SELECT COALESCE(view_count, 0) / 100
  INTO pin_views
  FROM public.pin_analytics
  WHERE user_id = target_user_id
  LIMIT 15;
  
  score := score + COALESCE(pin_views, 0);
  
  -- Endorsements (0-10 points, 1 point each, max 10)
  SELECT COUNT(*)
  INTO endorsements_count
  FROM public.endorsements_v2
  WHERE endorsed_user_id = target_user_id
    AND status = 'accepted'
  LIMIT 10;
  
  score := score + COALESCE(endorsements_count, 0);
  
  -- Cap at 100
  IF score > 100 THEN
    score := 100;
  END IF;
  
  RETURN score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =======================
-- NOTIFICATION
-- =======================

DO $$
BEGIN
  RAISE NOTICE 'Influential Professionals feature tables created successfully';
END $$;
