-- =====================================================
-- PHASE 4E: Content Management System (CMS)
-- =====================================================
-- Creates tables and functions for managing:
-- - Static pages (About, Privacy, Terms, etc.)
-- - FAQs
-- - Help center articles
-- - Categories for organization
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: cms_categories
-- Purpose: Organize pages, FAQs, and articles
-- =====================================================
CREATE TABLE IF NOT EXISTS cms_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  type VARCHAR(20) NOT NULL CHECK (type IN ('page', 'faq', 'help')),
  parent_id UUID REFERENCES cms_categories(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  icon VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE: cms_pages
-- Purpose: Static pages with SEO
-- =====================================================
CREATE TABLE IF NOT EXISTS cms_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  category_id UUID REFERENCES cms_categories(id) ON DELETE SET NULL,
  
  -- SEO fields
  meta_title VARCHAR(200),
  meta_description TEXT,
  meta_keywords TEXT,
  
  -- Status and visibility
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  is_featured BOOLEAN DEFAULT FALSE,
  
  -- Publishing
  published_at TIMESTAMP WITH TIME ZONE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Version control
  version INTEGER DEFAULT 1,
  previous_version_id UUID REFERENCES cms_pages(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE: cms_faqs
-- Purpose: Frequently Asked Questions
-- =====================================================
CREATE TABLE IF NOT EXISTS cms_faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category_id UUID REFERENCES cms_categories(id) ON DELETE SET NULL,
  
  -- Organization
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  
  -- Status
  status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  
  -- Metadata
  views INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE: cms_page_views
-- Purpose: Track page views for analytics
-- =====================================================
CREATE TABLE IF NOT EXISTS cms_page_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id UUID NOT NULL REFERENCES cms_pages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_cms_pages_slug ON cms_pages(slug);
CREATE INDEX IF NOT EXISTS idx_cms_pages_status ON cms_pages(status);
CREATE INDEX IF NOT EXISTS idx_cms_pages_category ON cms_pages(category_id);
CREATE INDEX IF NOT EXISTS idx_cms_pages_author ON cms_pages(author_id);
CREATE INDEX IF NOT EXISTS idx_cms_faqs_category ON cms_faqs(category_id);
CREATE INDEX IF NOT EXISTS idx_cms_faqs_status ON cms_faqs(status);
CREATE INDEX IF NOT EXISTS idx_cms_categories_type ON cms_categories(type);
CREATE INDEX IF NOT EXISTS idx_cms_categories_slug ON cms_categories(slug);
CREATE INDEX IF NOT EXISTS idx_cms_page_views_page ON cms_page_views(page_id);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_cms_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cms_pages_timestamp
  BEFORE UPDATE ON cms_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_cms_timestamp();

CREATE TRIGGER update_cms_faqs_timestamp
  BEFORE UPDATE ON cms_faqs
  FOR EACH ROW
  EXECUTE FUNCTION update_cms_timestamp();

CREATE TRIGGER update_cms_categories_timestamp
  BEFORE UPDATE ON cms_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_cms_timestamp();

-- =====================================================
-- RPC FUNCTIONS
-- =====================================================

-- Get published pages with category
CREATE OR REPLACE FUNCTION get_published_pages()
RETURNS TABLE (
  id UUID,
  title VARCHAR,
  slug VARCHAR,
  content TEXT,
  excerpt TEXT,
  meta_title VARCHAR,
  meta_description TEXT,
  category_name VARCHAR,
  published_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.slug,
    p.content,
    p.excerpt,
    p.meta_title,
    p.meta_description,
    c.name as category_name,
    p.published_at,
    p.updated_at
  FROM cms_pages p
  LEFT JOIN cms_categories c ON p.category_id = c.id
  WHERE p.status = 'published'
  ORDER BY p.published_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get page by slug
CREATE OR REPLACE FUNCTION get_page_by_slug(p_slug VARCHAR)
RETURNS TABLE (
  id UUID,
  title VARCHAR,
  slug VARCHAR,
  content TEXT,
  excerpt TEXT,
  meta_title VARCHAR,
  meta_description TEXT,
  meta_keywords TEXT,
  category_name VARCHAR,
  published_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.slug,
    p.content,
    p.excerpt,
    p.meta_title,
    p.meta_description,
    p.meta_keywords,
    c.name as category_name,
    p.published_at,
    p.updated_at
  FROM cms_pages p
  LEFT JOIN cms_categories c ON p.category_id = c.id
  WHERE p.slug = p_slug AND p.status = 'published';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get FAQs by category
CREATE OR REPLACE FUNCTION get_faqs_by_category(p_category_id UUID DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  question TEXT,
  answer TEXT,
  category_name VARCHAR,
  display_order INTEGER,
  helpful_count INTEGER,
  not_helpful_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.id,
    f.question,
    f.answer,
    c.name as category_name,
    f.display_order,
    f.helpful_count,
    f.not_helpful_count
  FROM cms_faqs f
  LEFT JOIN cms_categories c ON f.category_id = c.id
  WHERE f.status = 'published'
    AND (p_category_id IS NULL OR f.category_id = p_category_id)
  ORDER BY f.display_order ASC, f.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Track page view
CREATE OR REPLACE FUNCTION track_page_view(
  p_page_id UUID,
  p_user_id UUID DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO cms_page_views (page_id, user_id, ip_address, user_agent)
  VALUES (p_page_id, p_user_id, p_ip_address, p_user_agent);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mark FAQ as helpful
CREATE OR REPLACE FUNCTION mark_faq_helpful(p_faq_id UUID, p_is_helpful BOOLEAN)
RETURNS VOID AS $$
BEGIN
  IF p_is_helpful THEN
    UPDATE cms_faqs SET helpful_count = helpful_count + 1 WHERE id = p_faq_id;
  ELSE
    UPDATE cms_faqs SET not_helpful_count = not_helpful_count + 1 WHERE id = p_faq_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Search pages and FAQs
CREATE OR REPLACE FUNCTION search_cms_content(p_query TEXT)
RETURNS TABLE (
  type VARCHAR,
  id UUID,
  title TEXT,
  content TEXT,
  slug VARCHAR,
  relevance FLOAT
) AS $$
BEGIN
  RETURN QUERY
  -- Search pages
  SELECT 
    'page'::VARCHAR as type,
    p.id,
    p.title::TEXT,
    p.content,
    p.slug,
    ts_rank(
      to_tsvector('english', p.title || ' ' || p.content),
      plainto_tsquery('english', p_query)
    ) as relevance
  FROM cms_pages p
  WHERE p.status = 'published'
    AND (
      to_tsvector('english', p.title || ' ' || p.content) @@ plainto_tsquery('english', p_query)
    )
  
  UNION ALL
  
  -- Search FAQs
  SELECT 
    'faq'::VARCHAR as type,
    f.id,
    f.question::TEXT as title,
    f.answer as content,
    NULL::VARCHAR as slug,
    ts_rank(
      to_tsvector('english', f.question || ' ' || f.answer),
      plainto_tsquery('english', p_query)
    ) as relevance
  FROM cms_faqs f
  WHERE f.status = 'published'
    AND (
      to_tsvector('english', f.question || ' ' || f.answer) @@ plainto_tsquery('english', p_query)
    )
  
  ORDER BY relevance DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE cms_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_page_views ENABLE ROW LEVEL SECURITY;

-- Public can read published content
CREATE POLICY "Public can read published pages"
  ON cms_pages FOR SELECT
  USING (status = 'published');

CREATE POLICY "Public can read published FAQs"
  ON cms_faqs FOR SELECT
  USING (status = 'published');

CREATE POLICY "Public can read categories"
  ON cms_categories FOR SELECT
  USING (true);

-- Admins can do everything
CREATE POLICY "Admins can manage pages"
  ON cms_pages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage FAQs"
  ON cms_faqs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage categories"
  ON cms_categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can track page views"
  ON cms_page_views FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

GRANT SELECT ON cms_pages TO authenticated, anon;
GRANT SELECT ON cms_faqs TO authenticated, anon;
GRANT SELECT ON cms_categories TO authenticated, anon;
GRANT ALL ON cms_pages TO authenticated;
GRANT ALL ON cms_faqs TO authenticated;
GRANT ALL ON cms_categories TO authenticated;
GRANT INSERT ON cms_page_views TO authenticated, anon;

-- =====================================================
-- SEED DATA (Optional default pages)
-- =====================================================

-- Create default categories
INSERT INTO cms_categories (name, slug, type, description, display_order) VALUES
  ('General', 'general', 'page', 'General pages', 1),
  ('Legal', 'legal', 'page', 'Legal documents', 2),
  ('Getting Started', 'getting-started', 'faq', 'Getting started questions', 1),
  ('Account', 'account', 'faq', 'Account management', 2),
  ('Verification', 'verification', 'faq', 'Identity verification', 3)
ON CONFLICT (slug) DO NOTHING;

-- Note: Pages will be created via the admin UI
