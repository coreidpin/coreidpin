-- =====================================================
-- Contact Form Submissions
-- =====================================================

CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Contact details
  name VARCHAR(200) NOT NULL,
  email VARCHAR(200) NOT NULL,
  company VARCHAR(200),
  phone VARCHAR(50),
  
  -- Message
  subject VARCHAR(300) NOT NULL,
  message TEXT NOT NULL,
  
  -- Type
  inquiry_type VARCHAR(50) DEFAULT 'general' CHECK (
    inquiry_type IN ('general', 'sales', 'support', 'partnership', 'press', 'careers')
  ),
  
  -- Status
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'archived')),
  assigned_to UUID REFERENCES admin_users(user_id) ON DELETE SET NULL,
  
  -- Metadata
  user_agent TEXT,
  ip_address VARCHAR(45),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_contact_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_type ON contact_submissions(inquiry_type);
CREATE INDEX IF NOT EXISTS idx_contact_created ON contact_submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_contact_email ON contact_submissions(email);

-- Trigger
CREATE OR REPLACE FUNCTION update_contact_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_contact_submissions_timestamp
  BEFORE UPDATE ON contact_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_timestamp();

-- RPC: Submit contact form (public)
CREATE OR REPLACE FUNCTION submit_contact_form(
  p_name VARCHAR,
  p_email VARCHAR,
  p_company VARCHAR,
  p_phone VARCHAR,
  p_subject VARCHAR,
  p_message TEXT,
  p_inquiry_type VARCHAR
)
RETURNS UUID AS $$
DECLARE
  v_submission_id UUID;
BEGIN
  INSERT INTO contact_submissions (
    name, email, company, phone, subject, message, inquiry_type
  ) VALUES (
    p_name, p_email, p_company, p_phone, p_subject, p_message, p_inquiry_type
  )
  RETURNING id INTO v_submission_id;
  
  RETURN v_submission_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Row Level Security
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Admins can view all submissions
CREATE POLICY "Admins can view all contact submissions"
  ON contact_submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Admins can update submissions
CREATE POLICY "Admins can update contact submissions"
  ON contact_submissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Grant permissions
GRANT SELECT, UPDATE ON contact_submissions TO authenticated;
GRANT EXECUTE ON FUNCTION submit_contact_form TO anon, authenticated;
