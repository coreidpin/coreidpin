-- =====================================================
-- Success Stories System
-- =====================================================

CREATE TABLE IF NOT EXISTS success_stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Person details
  person_name VARCHAR(200) NOT NULL,
  person_title VARCHAR(200),
  person_company VARCHAR(200),
  person_photo VARCHAR(500),
  person_location VARCHAR(200),
  
  -- Story content
  title VARCHAR(300) NOT NULL,
  story TEXT NOT NULL,
  quote TEXT, -- Pull quote/highlight
  
  -- Metrics/Results
  metric_1_label VARCHAR(100),
  metric_1_value VARCHAR(50),
  metric_2_label VARCHAR(100),
  metric_2_value VARCHAR(50),
  metric_3_label VARCHAR(100),
  metric_3_value VARCHAR(50),
  
  -- Metadata
  industry VARCHAR(100),
  use_case VARCHAR(100), -- 'hiring', 'verification', 'onboarding', etc.
  is_featured BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  
  -- Status
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_stories_status ON success_stories(status);
CREATE INDEX IF NOT EXISTS idx_stories_industry ON success_stories(industry);
CREATE INDEX IF NOT EXISTS idx_stories_use_case ON success_stories(use_case);
CREATE INDEX IF NOT EXISTS idx_stories_published_at ON success_stories(published_at);

-- Trigger
CREATE TRIGGER update_stories_timestamp
  BEFORE UPDATE ON success_stories
  FOR EACH ROW
  EXECUTE FUNCTION update_cms_timestamp();

-- RPC: Get published stories
CREATE OR REPLACE FUNCTION get_published_stories(
  p_limit INTEGER DEFAULT 10,
  p_industry VARCHAR DEFAULT NULL,
  p_use_case VARCHAR DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  person_name VARCHAR,
  person_title VARCHAR,
  person_company VARCHAR,
  person_photo VARCHAR,
  person_location VARCHAR,
  title VARCHAR,
  story TEXT,
  quote TEXT,
  metric_1_label VARCHAR,
  metric_1_value VARCHAR,
  metric_2_label VARCHAR,
  metric_2_value VARCHAR,
  metric_3_label VARCHAR,
  metric_3_value VARCHAR,
  industry VARCHAR,
  use_case VARCHAR,
  is_featured BOOLEAN,
  published_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.person_name,
    s.person_title,
    s.person_company,
    s.person_photo,
    s.person_location,
    s.title,
    s.story,
    s.quote,
    s.metric_1_label,
    s.metric_1_value,
    s.metric_2_label,
    s.metric_2_value,
    s.metric_3_label,
    s.metric_3_value,
    s.industry,
    s.use_case,
    s.is_featured,
    s.published_at
  FROM success_stories s
  WHERE s.status = 'published'
    AND (p_industry IS NULL OR s.industry = p_industry)
    AND (p_use_case IS NULL OR s.use_case = p_use_case)
  ORDER BY s.is_featured DESC, s.display_order ASC, s.published_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Row Level Security
ALTER TABLE success_stories ENABLE ROW LEVEL SECURITY;

-- Public can read published stories
CREATE POLICY "Public can read published stories"
  ON success_stories FOR SELECT
  USING (status = 'published');

-- Admins can manage stories
CREATE POLICY "Admins can manage stories"
  ON success_stories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Permissions
GRANT SELECT ON success_stories TO authenticated, anon;
GRANT ALL ON success_stories TO authenticated;

-- Seed data
INSERT INTO success_stories (
  person_name, person_title, person_company, person_location,
  title, story, quote,
  metric_1_label, metric_1_value,
  metric_2_label, metric_2_value,
  metric_3_label, metric_3_value,
  industry, use_case, is_featured, status, published_at
) VALUES
(
  'Adebayo Johnson',
  'Head of Talent',
  'TechHub Africa',
  'Lagos, Nigeria',
  'Reduced hiring time by 75% with verified identities',
  'Before GidiPIN, we spent weeks verifying candidate credentials manually. Now, with verified professional identities, we can confidently move candidates through our pipeline in days instead of weeks. The impact on our hiring efficiency has been remarkable.',
  'GidiPIN transformed how we hire. It''s not just faster—it''s more reliable.',
  'Hiring Time Reduced',
  '75%',
  'Verification Cost Saved',
  '$12K/month',
  'Candidates Verified',
  '500+',
  'Technology',
  'hiring',
  TRUE,
  'published',
  NOW()
),
(
  'Chioma Okafor',
  'Founder & CEO',
  'RemoteFirst Nigeria',
  'Abuja, Nigeria',
  'Scaling remote teams with confidence',
  'Managing a distributed team across West Africa was challenging until we adopted GidiPIN. Now we can verify and onboard remote workers quickly, knowing their credentials are authentic. It''s given us the confidence to scale faster.',
  'Trust at scale—that''s what GidiPIN gives us.',
  'Team Size Growth',
  '3x',
  'Onboarding Time',
  '2 days',
  'False Claims Prevented',
  '15+',
  'Technology',
  'onboarding',
  FALSE,
  'published',
  NOW()
),
(
  'Emmanuel Mensah',
  'Senior Software Engineer',
  'Paystack',
  'Accra, Ghana',
  'My verified identity opened doors across Africa',
  'Having a verified GidiPIN gave me credibility when applying for roles across different countries. Companies trusted my credentials immediately, and I landed my dream job 60% faster than my previous job searches.',
  'One verified identity, unlimited opportunities.',
  'Job Search Time',
  '-60%',
  'Interview Callbacks',
  '+300%',
  'Companies Reached',
  '50+',
  'Technology',
  'verification',
  FALSE,
  'published',
  NOW()
);
