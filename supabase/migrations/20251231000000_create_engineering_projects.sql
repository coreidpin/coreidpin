-- Engineering Projects Table
-- Stores engineering/technical projects with repository links, demos, and impact metrics

CREATE TABLE IF NOT EXISTS engineering_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Info
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  role TEXT,
  duration TEXT,
  status TEXT DEFAULT 'In Progress' CHECK (status IN ('Production', 'Beta', 'Archived', 'In Progress')),
  
  -- Links & Media
  repository_url TEXT,
  live_demo_url TEXT,
  cover_image TEXT,
  screenshots TEXT[] DEFAULT '{}',
  
  -- Tech Stack
  tech_stack TEXT[] DEFAULT '{}',
  
  -- Impact Metrics (stored as JSONB for flexibility)
  impact JSONB DEFAULT '{}'::jsonb,
  
  -- Status Flags
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Constraints
  UNIQUE(user_id, slug)
);

-- Add missing columns if table already exists
ALTER TABLE engineering_projects ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE engineering_projects ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE engineering_projects ADD COLUMN IF NOT EXISTS role TEXT;
ALTER TABLE engineering_projects ADD COLUMN IF NOT EXISTS duration TEXT;
ALTER TABLE engineering_projects ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'In Progress';
ALTER TABLE engineering_projects ADD COLUMN IF NOT EXISTS repository_url TEXT;
ALTER TABLE engineering_projects ADD COLUMN IF NOT EXISTS live_demo_url TEXT;
ALTER TABLE engineering_projects ADD COLUMN IF NOT EXISTS cover_image TEXT;
ALTER TABLE engineering_projects ADD COLUMN IF NOT EXISTS screenshots TEXT[] DEFAULT '{}';
ALTER TABLE engineering_projects ADD COLUMN IF NOT EXISTS tech_stack TEXT[] DEFAULT '{}';
ALTER TABLE engineering_projects ADD COLUMN IF NOT EXISTS impact JSONB DEFAULT '{}'::jsonb;
ALTER TABLE engineering_projects ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE engineering_projects ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;
ALTER TABLE engineering_projects ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Add constraint if it doesn't exist (we need to drop and recreate to be safe)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'engineering_projects_user_id_slug_key'
  ) THEN
    ALTER TABLE engineering_projects ADD CONSTRAINT engineering_projects_user_id_slug_key UNIQUE(user_id, slug);
  END IF;
END $$;

-- Add check constraint for status if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'engineering_projects_status_check'
  ) THEN
    ALTER TABLE engineering_projects ADD CONSTRAINT engineering_projects_status_check 
    CHECK (status IN ('Production', 'Beta', 'Archived', 'In Progress'));
  END IF;
END $$;

-- Create index for faster queries (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_engineering_projects_user_id ON engineering_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_engineering_projects_slug ON engineering_projects(slug);
CREATE INDEX IF NOT EXISTS idx_engineering_projects_is_published ON engineering_projects(is_published);
CREATE INDEX IF NOT EXISTS idx_engineering_projects_created_at ON engineering_projects(created_at DESC);

-- Enable Row Level Security
ALTER TABLE engineering_projects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own projects" ON engineering_projects;
DROP POLICY IF EXISTS "Anyone can view published projects" ON engineering_projects;
DROP POLICY IF EXISTS "Users can insert own projects" ON engineering_projects;
DROP POLICY IF EXISTS "Users can update own projects" ON engineering_projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON engineering_projects;

-- RLS Policies
-- Users can read their own projects
CREATE POLICY "Users can view own projects"
  ON engineering_projects
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can read published projects from others
CREATE POLICY "Anyone can view published projects"
  ON engineering_projects
  FOR SELECT
  USING (is_published = true);

-- Users can insert their own projects
CREATE POLICY "Users can insert own projects"
  ON engineering_projects
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own projects
CREATE POLICY "Users can update own projects"
  ON engineering_projects
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own projects
CREATE POLICY "Users can delete own projects"
  ON engineering_projects
  FOR DELETE
  USING (auth.uid() = user_id);

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS engineering_projects_updated_at ON engineering_projects;
DROP FUNCTION IF EXISTS update_engineering_projects_updated_at();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_engineering_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER engineering_projects_updated_at
  BEFORE UPDATE ON engineering_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_engineering_projects_updated_at();

-- Function to increment project view count
CREATE OR REPLACE FUNCTION increment_project_views(project_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE engineering_projects
  SET view_count = view_count + 1
  WHERE id = project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION increment_project_views(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_project_views(UUID) TO anon;
