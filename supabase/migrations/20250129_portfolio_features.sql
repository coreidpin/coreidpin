-- ============================================
-- Phase 0: Portfolio Features Database Migration
-- Created: 2025-01-29
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: case_studies (for Designers)
-- ============================================
CREATE TABLE IF NOT EXISTS case_studies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
  
  -- Basic info
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  cover_image TEXT,
  client VARCHAR(100),
  year VARCHAR(4),
  
  -- Content sections (JSONB for flexibility)
  problem JSONB DEFAULT '{}',
  process JSONB DEFAULT '{}',
  solution JSONB DEFAULT '{}',
  impact JSONB DEFAULT '{}',
  
  -- Meta
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  tools TEXT[] DEFAULT ARRAY[]::TEXT[],
  role VARCHAR(100),
  team_size INTEGER,
  
  -- Status
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for case_studies
CREATE INDEX idx_case_studies_user_id ON case_studies(user_id);
CREATE INDEX idx_case_studies_slug ON case_studies(slug);
CREATE INDEX idx_case_studies_is_published ON case_studies(is_published);
CREATE INDEX idx_case_studies_is_featured ON case_studies(is_featured);
CREATE INDEX idx_case_studies_tags ON case_studies USING GIN(tags);

-- ============================================
-- TABLE: tech_stack (for Engineers)
-- ============================================
CREATE TABLE IF NOT EXISTS tech_stack (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
  
  -- Skill details
  category VARCHAR(50) NOT NULL CHECK (category IN ('language', 'framework', 'tool', 'database', 'cloud', 'other')),
  name VARCHAR(100) NOT NULL,
  level VARCHAR(50) CHECK (level IN ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
  years_experience DECIMAL(3,1) DEFAULT 0,
  project_count INTEGER DEFAULT 0,
  percentage INTEGER, -- Calculated field
  
  -- Meta
  last_used_at TIMESTAMP WITH TIME ZONE,
  display_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, category, name)
);

-- Indexes for tech_stack
CREATE INDEX idx_tech_stack_user_id ON tech_stack(user_id);
CREATE INDEX idx_tech_stack_category ON tech_stack(category);
CREATE INDEX idx_tech_stack_level ON tech_stack(level);

-- ============================================
-- TABLE: engineering_projects (for Engineers)
-- ============================================
CREATE TABLE IF NOT EXISTS engineering_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
  
  -- Project details
  name VARCHAR(200) NOT NULL,
  description TEXT,
  tech_stack TEXT[] DEFAULT ARRAY[]::TEXT[],
  cover_image TEXT,
  screenshots TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Links
  repository_url TEXT,
  live_demo_url TEXT,
  
  -- Impact metrics (JSONB)
  impact JSONB DEFAULT '{}',
  
  -- Project meta
  role VARCHAR(100),
  duration VARCHAR(50),
  status VARCHAR(20) CHECK (status IN ('Production', 'Beta', 'Archived', 'In Progress')),
  start_date DATE,
  end_date DATE,
  
  -- Status
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for engineering_projects
CREATE INDEX idx_engineering_projects_user_id ON engineering_projects(user_id);
CREATE INDEX idx_engineering_projects_status ON engineering_projects(status);
CREATE INDEX idx_engineering_projects_is_published ON engineering_projects(is_published);
CREATE INDEX idx_engineering_projects_tech_stack ON engineering_projects USING GIN(tech_stack);

-- ============================================
-- TABLE: product_launches (for PMs)
-- ============================================
CREATE TABLE IF NOT EXISTS product_launches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
  
  -- Product details
  product_name VARCHAR(200) NOT NULL,
  company VARCHAR(100),
  launch_date DATE,
  cover_image TEXT,
  
  -- Narrative sections (JSONB)
  narrative JSONB DEFAULT '{}',
  impact JSONB DEFAULT '{}',
  
  -- Supporting content
  press_links JSONB[] DEFAULT ARRAY[]::JSONB[],
  demo_video TEXT,
  testimonials JSONB[] DEFAULT ARRAY[]::JSONB[],
  
  -- Meta
  role VARCHAR(100),
  team VARCHAR(200),
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Status
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for product_launches
CREATE INDEX idx_product_launches_user_id ON product_launches(user_id);
CREATE INDEX idx_product_launches_company ON product_launches(company);
CREATE INDEX idx_product_launches_is_published ON product_launches(is_published);
CREATE INDEX idx_product_launches_tags ON product_launches USING GIN(tags);

-- ============================================
-- TABLE: articles (for PMs/All)
-- ============================================
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
  
  -- Article details
  title VARCHAR(300) NOT NULL,
  summary TEXT,
  url TEXT NOT NULL,
  thumbnail TEXT,
  
  platform VARCHAR(50) CHECK (platform IN ('Medium', 'LinkedIn', 'Personal Blog', 'Company Blog', 'Substack', 'Dev.to')),
  published_at TIMESTAMP WITH TIME ZONE,
  topic VARCHAR(100),
  
  -- Engagement
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  
  is_featured BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for articles
CREATE INDEX idx_articles_user_id ON articles(user_id);
CREATE INDEX idx_articles_platform ON articles(platform);
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);

-- ============================================
-- TABLE: featured_items (Cross-role)
-- ============================================
CREATE TABLE IF NOT EXISTS featured_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
  
  -- Reference to item
  item_type VARCHAR(50) CHECK (item_type IN ('case_study', 'project', 'product_launch', 'article', 'custom')),
  item_id UUID, -- Can be NULL for custom items
  
  -- Custom featured item (if not referencing another table)
  custom_title VARCHAR(200),
  custom_description TEXT,
  custom_image TEXT,
  custom_link TEXT,
  
  display_order INTEGER NOT NULL DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, item_type, item_id)
);

-- Indexes for featured_items
CREATE INDEX idx_featured_items_user_id ON featured_items(user_id);
CREATE INDEX idx_featured_items_display_order ON featured_items(user_id, display_order);

-- ============================================
-- TRIGGER FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to tables with updated_at
CREATE TRIGGER update_case_studies_updated_at
  BEFORE UPDATE ON case_studies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tech_stack_updated_at
  BEFORE UPDATE ON tech_stack
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_engineering_projects_updated_at
  BEFORE UPDATE ON engineering_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_launches_updated_at
  BEFORE UPDATE ON product_launches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to generate unique slug for case studies
CREATE OR REPLACE FUNCTION generate_case_study_slug(title_text TEXT, user_id_param UUID)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Create base slug from title
  base_slug := lower(regexp_replace(title_text, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  final_slug := base_slug;
  
  -- Check for uniqueness and add counter if needed
  WHILE EXISTS (SELECT 1 FROM case_studies WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate tech stack percentage distribution
CREATE OR REPLACE FUNCTION calculate_tech_stack_percentage(user_id_param UUID)
RETURNS VOID AS $$
DECLARE
  total_years DECIMAL;
  skill_record RECORD;
BEGIN
  -- Calculate total years across all skills
  SELECT SUM(years_experience) INTO total_years
  FROM tech_stack
  WHERE user_id = user_id_param;
  
  -- If no skills, return
  IF total_years IS NULL OR total_years = 0 THEN
    RETURN;
  END IF;
  
  -- Update percentage for each skill
  FOR skill_record IN 
    SELECT id, years_experience FROM tech_stack WHERE user_id = user_id_param
  LOOP
    UPDATE tech_stack
    SET percentage = ROUND((skill_record.years_experience / total_years * 100)::NUMERIC, 0)
    WHERE id = skill_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE tech_stack ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_launches ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_items ENABLE ROW LEVEL SECURITY;

-- Policies for case_studies
CREATE POLICY "Users can view published case studies"
  ON case_studies FOR SELECT
  USING (is_published = true OR auth.uid() = user_id);

CREATE POLICY "Users can create their own case studies"
  ON case_studies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own case studies"
  ON case_studies FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own case studies"
  ON case_studies FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for tech_stack
CREATE POLICY "Anyone can view tech stacks"
  ON tech_stack FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own tech stack"
  ON tech_stack FOR ALL
  USING (auth.uid() = user_id);

-- Policies for engineering_projects
CREATE POLICY "Users can view published projects"
  ON engineering_projects FOR SELECT
  USING (is_published = true OR auth.uid() = user_id);

CREATE POLICY "Users can manage their own projects"
  ON engineering_projects FOR ALL
  USING (auth.uid() = user_id);

-- Policies for product_launches
CREATE POLICY "Users can view published launches"
  ON product_launches FOR SELECT
  USING (is_published = true OR auth.uid() = user_id);

CREATE POLICY "Users can manage their own product launches"
  ON product_launches FOR ALL
  USING (auth.uid() = user_id);

-- Policies for articles
CREATE POLICY "Anyone can view articles"
  ON articles FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own articles"
  ON articles FOR ALL
  USING (auth.uid() = user_id);

-- Policies for featured_items
CREATE POLICY "Anyone can view featured items"
  ON featured_items FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own featured items"
  ON featured_items FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- INITIAL DATA / SEED (Optional)
-- ============================================

-- You can add sample data here for testing

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE case_studies IS 'Portfolio case studies for designers showcasing problem, process, solution, and impact';
COMMENT ON TABLE tech_stack IS 'Technology skills and proficiency levels for engineers';
COMMENT ON TABLE engineering_projects IS 'Software engineering projects with tech stack and impact metrics';
COMMENT ON TABLE product_launches IS 'Product launches and narratives for product managers';
COMMENT ON TABLE articles IS 'Published articles and thought leadership content';
COMMENT ON TABLE featured_items IS 'User-selected featured items displayed prominently on their PIN profile';

