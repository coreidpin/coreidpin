-- =====================================================
-- PHASE 4E Extension: Blog System
-- =====================================================
-- Extends the CMS with blog functionality
-- =====================================================

-- Add blog posts table
CREATE TABLE IF NOT EXISTS cms_blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image VARCHAR(500),
  category_id UUID REFERENCES cms_categories(id) ON DELETE SET NULL,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- SEO fields
  meta_title VARCHAR(200),
  meta_description TEXT,
  meta_keywords TEXT,
  
  -- Blog-specific fields
  read_time_minutes INTEGER DEFAULT 5,
  is_featured BOOLEAN DEFAULT FALSE,
  tags TEXT[], -- Array of tags
  
  -- Status
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMP WITH TIME ZONE,
  
  -- Engagement
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON cms_blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON cms_blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON cms_blog_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON cms_blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON cms_blog_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_tags ON cms_blog_posts USING GIN(tags);

-- Trigger for updated_at
CREATE TRIGGER update_blog_posts_timestamp
  BEFORE UPDATE ON cms_blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_cms_timestamp();

-- RPC: Get published blog posts
CREATE OR REPLACE FUNCTION get_published_blog_posts(
  p_limit INTEGER DEFAULT 10,
  p_offset INTEGER DEFAULT 0,
  p_category_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  title VARCHAR,
  slug VARCHAR,
  excerpt TEXT,
  featured_image VARCHAR,
  category_name VARCHAR,
  author_id UUID,
  read_time_minutes INTEGER,
  is_featured BOOLEAN,
  tags TEXT[],
  published_at TIMESTAMP WITH TIME ZONE,
  views INTEGER,
  likes INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bp.id,
    bp.title,
    bp.slug,
    bp.excerpt,
    bp.featured_image,
    c.name as category_name,
    bp.author_id,
    bp.read_time_minutes,
    bp.is_featured,
    bp.tags,
    bp.published_at,
    bp.views,
    bp.likes
  FROM cms_blog_posts bp
  LEFT JOIN cms_categories c ON bp.category_id = c.id
  WHERE bp.status = 'published'
    AND (p_category_id IS NULL OR bp.category_id = p_category_id)
  ORDER BY bp.published_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: Get blog post by slug
CREATE OR REPLACE FUNCTION get_blog_post_by_slug(p_slug VARCHAR)
RETURNS TABLE (
  id UUID,
  title VARCHAR,
  slug VARCHAR,
  content TEXT,
  excerpt TEXT,
  featured_image VARCHAR,
  category_name VARCHAR,
  author_id UUID,
  meta_title VARCHAR,
  meta_description TEXT,
  meta_keywords TEXT,
  read_time_minutes INTEGER,
  is_featured BOOLEAN,
  tags TEXT[],
  published_at TIMESTAMP WITH TIME ZONE,
  views INTEGER,
  likes INTEGER,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  -- Increment view count
  UPDATE cms_blog_posts SET views = views + 1 WHERE slug = p_slug AND status = 'published';
  
  RETURN QUERY
  SELECT 
    bp.id,
    bp.title,
    bp.slug,
    bp.content,
    bp.excerpt,
    bp.featured_image,
    c.name as category_name,
    bp.author_id,
    bp.meta_title,
    bp.meta_description,
    bp.meta_keywords,
    bp.read_time_minutes,
    bp.is_featured,
    bp.tags,
    bp.published_at,
    bp.views,
    bp.likes,
    bp.updated_at
  FROM cms_blog_posts bp
  LEFT JOIN cms_categories c ON bp.category_id = c.id
  WHERE bp.slug = p_slug AND bp.status = 'published';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: Like blog post
CREATE OR REPLACE FUNCTION like_blog_post(p_post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE cms_blog_posts SET likes = likes + 1 WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Row Level Security
ALTER TABLE cms_blog_posts ENABLE ROW LEVEL SECURITY;

-- Public can read published posts
CREATE POLICY "Public can read published blog posts"
  ON cms_blog_posts FOR SELECT
  USING (status = 'published');

-- Admins can manage posts
CREATE POLICY "Admins can manage blog posts"
  ON cms_blog_posts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Grant permissions
GRANT SELECT ON cms_blog_posts TO authenticated, anon;
GRANT ALL ON cms_blog_posts TO authenticated;

-- Add blog category
INSERT INTO cms_categories (name, slug, type, description, display_order) VALUES
  ('Technology', 'technology', 'page', 'Tech articles and tutorials', 1),
  ('Product Updates', 'product-updates', 'page', 'Latest product news', 2),
  ('Industry Insights', 'industry-insights', 'page', 'Industry trends and analysis', 3)
ON CONFLICT (slug) DO NOTHING;
