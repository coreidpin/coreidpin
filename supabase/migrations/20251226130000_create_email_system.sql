-- ==========================================
-- Phase 4B: Email Notifications System
-- Complete email infrastructure
-- ==========================================

-- Drop existing tables if they exist (for clean reinstall)
DROP TABLE IF EXISTS email_logs CASCADE;
DROP TABLE IF EXISTS email_queue CASCADE;
DROP TABLE IF EXISTS unsubscribe_tokens CASCADE;
DROP TABLE IF EXISTS email_preferences CASCADE;

-- ==========================================
-- 1. EMAIL PREFERENCES
-- User email subscription settings
-- ==========================================

CREATE TABLE email_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  
  -- Email categories
  marketing_emails BOOLEAN DEFAULT true,
  product_updates BOOLEAN DEFAULT true,
  announcements BOOLEAN DEFAULT true,
  weekly_digest BOOLEAN DEFAULT false,
  account_alerts BOOLEAN DEFAULT true,
  all_emails BOOLEAN DEFAULT true,
  
  -- Unsubscribe tracking
  unsubscribed_at TIMESTAMPTZ,
  unsubscribe_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for lookups
CREATE INDEX idx_email_preferences_user ON email_preferences(user_id);

-- ==========================================
-- 2. EMAIL QUEUE
-- Pending and processed emails
-- ==========================================

CREATE TABLE email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  to_email TEXT NOT NULL,
  
  -- Email content
  template_id TEXT NOT NULL,
  subject TEXT NOT NULL,
  variables JSONB DEFAULT '{}',
  
  -- Queue management
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('high', 'normal', 'low')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'cancelled')),
  
  -- Retry logic
  attempts INT DEFAULT 0,
  max_attempts INT DEFAULT 3,
  
  -- Scheduling
  scheduled_for TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  
  -- Error tracking
  error_message TEXT,
  provider_message_id TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for queue processing
CREATE INDEX idx_email_queue_status ON email_queue(status, scheduled_for) WHERE status IN ('pending', 'failed');
CREATE INDEX idx_email_queue_user ON email_queue(user_id, created_at DESC);
CREATE INDEX idx_email_queue_template ON email_queue(template_id, created_at DESC);

-- ==========================================
-- 3. EMAIL LOGS
-- Tracking opens, clicks, bounces
-- ==========================================

CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_id UUID REFERENCES email_queue(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Email identification
  email_type TEXT NOT NULL,
  to_email TEXT NOT NULL,
  template_id TEXT NOT NULL,
  
  -- Status tracking
  status TEXT NOT NULL CHECK (status IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed', 'spam')),
  
  -- Provider info
  provider_message_id TEXT,
  
  -- Engagement tracking
  opened_at TIMESTAMPTZ,
  first_opened_at TIMESTAMPTZ,
  open_count INT DEFAULT 0,
  clicked_at TIMESTAMPTZ,
  click_count INT DEFAULT 0,
  
  -- Bounce handling
  bounced_at TIMESTAMPTZ,
  bounce_type TEXT, -- hard, soft, spam
  bounce_reason TEXT,
  
  -- Metadata
  user_agent TEXT,
  ip_address TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for analytics
CREATE INDEX idx_email_logs_user ON email_logs(user_id, created_at DESC);
CREATE INDEX idx_email_logs_template ON email_logs(template_id, created_at DESC);
CREATE INDEX idx_email_logs_status ON email_logs(status, created_at DESC);
CREATE INDEX idx_email_logs_queue ON email_logs(queue_id);

-- ==========================================
-- 4. UNSUBSCRIBE TOKENS
-- Secure unsubscribe links
-- ==========================================

CREATE TABLE unsubscribe_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  
  -- Unsubscribe type
  email_type TEXT, -- specific category or 'all'
  
  -- Token status
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_unsubscribe_tokens_token ON unsubscribe_tokens(token) WHERE used_at IS NULL;
CREATE INDEX idx_unsubscribe_tokens_user ON unsubscribe_tokens(user_id);

-- ==========================================
-- 5. AUTOMATIC TRIGGERS
-- ==========================================

-- Create preferences on user signup
CREATE OR REPLACE FUNCTION create_default_email_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO email_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created_email_prefs
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_email_preferences();

-- Update timestamp on email_queue changes
CREATE OR REPLACE FUNCTION update_email_queue_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_email_queue_updated_at
  BEFORE UPDATE ON email_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_email_queue_timestamp();

-- ==========================================
-- 6. RPC FUNCTIONS
-- ==========================================

-- Queue an email
CREATE OR REPLACE FUNCTION queue_email(
  p_user_id UUID,
  p_to_email TEXT,
  p_template_id TEXT,
  p_subject TEXT,
  p_variables JSONB DEFAULT '{}',
  p_priority TEXT DEFAULT 'normal',
  p_scheduled_for TIMESTAMPTZ DEFAULT NOW()
)
RETURNS UUID AS $$
DECLARE
  v_queue_id UUID;
  v_preferences RECORD;
BEGIN
  -- Check user preferences
  SELECT * INTO v_preferences
  FROM email_preferences
  WHERE user_id = p_user_id;
  
  -- If user has unsubscribed from all emails, don't queue
  IF v_preferences.all_emails = false THEN
    RAISE EXCEPTION 'User has unsubscribed from all emails';
  END IF;
  
  -- Check specific category preferences
  IF p_template_id LIKE '%marketing%' AND v_preferences.marketing_emails = false THEN
    RAISE EXCEPTION 'User has unsubscribed from marketing emails';
  END IF;
  
  IF p_template_id LIKE '%announcement%' AND v_preferences.announcements = false THEN
    RAISE EXCEPTION 'User has unsubscribed from announcements';
  END IF;
  
  -- Queue the email
  INSERT INTO email_queue (
    user_id,
    to_email,
    template_id,
    subject,
    variables,
    priority,
    scheduled_for
  ) VALUES (
    p_user_id,
    p_to_email,
    p_template_id,
    p_subject,
    p_variables,
    p_priority,
    p_scheduled_for
  )
  RETURNING id INTO v_queue_id;
  
  RETURN v_queue_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get pending emails (for queue processor)
CREATE OR REPLACE FUNCTION get_pending_emails(p_limit INT DEFAULT 100)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  to_email TEXT,
  template_id TEXT,
  subject TEXT,
  variables JSONB,
  priority TEXT,
  attempts INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.user_id,
    e.to_email,
    e.template_id,
    e.subject,
    e.variables,
    e.priority,
    e.attempts
  FROM email_queue e
  WHERE e.status = 'pending'
    AND e.scheduled_for <= NOW()
    AND e.attempts < e.max_attempts
  ORDER BY 
    CASE e.priority
      WHEN 'high' THEN 1
      WHEN 'normal' THEN 2
      WHEN 'low' THEN 3
    END,
    e.scheduled_for ASC
  LIMIT p_limit
  FOR UPDATE SKIP LOCKED;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mark email as sent
CREATE OR REPLACE FUNCTION mark_email_sent(
  p_queue_id UUID,
  p_provider_message_id TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE email_queue
  SET 
    status = 'sent',
    sent_at = NOW(),
    provider_message_id = p_provider_message_id
  WHERE id = p_queue_id;
  
  -- Log the send
  INSERT INTO email_logs (
    queue_id,
    user_id,
    email_type,
    to_email,
    template_id,
    status,
    provider_message_id
  )
  SELECT 
    id,
    user_id,
    template_id,
    to_email,
    template_id,
    'sent',
    provider_message_id
  FROM email_queue
  WHERE id = p_queue_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mark email as failed
CREATE OR REPLACE FUNCTION mark_email_failed(
  p_queue_id UUID,
  p_error_message TEXT
)
RETURNS VOID AS $$
DECLARE
  v_attempts INT;
  v_max_attempts INT;
BEGIN
  -- Increment attempts
  UPDATE email_queue
  SET 
    attempts = attempts + 1,
    error_message = p_error_message,
    failed_at = NOW()
  WHERE id = p_queue_id
  RETURNING attempts, max_attempts INTO v_attempts, v_max_attempts;
  
  -- If max attempts reached, mark as failed
  IF v_attempts >= v_max_attempts THEN
    UPDATE email_queue
    SET status = 'failed'
    WHERE id = p_queue_id;
    
    -- Log the failure
    INSERT INTO email_logs (
      queue_id,
      user_id,
      email_type,
      to_email,
      template_id,
      status
    )
    SELECT 
      id,
      user_id,
      template_id,
      to_email,
      template_id,
      'failed'
    FROM email_queue
    WHERE id = p_queue_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Track email open
CREATE OR REPLACE FUNCTION track_email_open(
  p_queue_id UUID,
  p_user_agent TEXT DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE email_logs
  SET 
    status = 'opened',
    opened_at = NOW(),
    first_opened_at = COALESCE(first_opened_at, NOW()),
    open_count = open_count + 1,
    user_agent = COALESCE(p_user_agent, user_agent),
    ip_address = COALESCE(p_ip_address, ip_address)
  WHERE queue_id = p_queue_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Track email click
CREATE OR REPLACE FUNCTION track_email_click(
  p_queue_id UUID,
  p_user_agent TEXT DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE email_logs
  SET 
    status = 'clicked',
    clicked_at = NOW(),
    click_count = click_count + 1,
    user_agent = COALESCE(p_user_agent, user_agent),
    ip_address = COALESCE(p_ip_address, ip_address)
  WHERE queue_id = p_queue_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get email statistics
CREATE OR REPLACE FUNCTION get_email_statistics(
  p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS JSON AS $$
DECLARE
  v_stats JSON;
BEGIN
  SELECT json_build_object(
    'total_sent', (SELECT COUNT(*) FROM email_queue WHERE sent_at BETWEEN p_start_date AND p_end_date),
    'total_delivered', (SELECT COUNT(*) FROM email_logs WHERE status IN ('delivered', 'opened', 'clicked') AND created_at BETWEEN p_start_date AND p_end_date),
    'total_opened', (SELECT COUNT(DISTINCT queue_id) FROM email_logs WHERE status IN ('opened', 'clicked') AND opened_at BETWEEN p_start_date AND p_end_date),
    'total_clicked', (SELECT COUNT(DISTINCT queue_id) FROM email_logs WHERE status = 'clicked' AND clicked_at BETWEEN p_start_date AND p_end_date),
    'total_bounced', (SELECT COUNT(*) FROM email_logs WHERE status = 'bounced' AND bounced_at BETWEEN p_start_date AND p_end_date),
    'total_failed', (SELECT COUNT(*) FROM email_queue WHERE status = 'failed' AND failed_at BETWEEN p_start_date AND p_end_date),
    'pending_count', (SELECT COUNT(*) FROM email_queue WHERE status = 'pending')
  ) INTO v_stats;
  
  RETURN v_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update user email preferences
CREATE OR REPLACE FUNCTION update_email_preferences(
  p_user_id UUID,
  p_marketing_emails BOOLEAN DEFAULT NULL,
  p_product_updates BOOLEAN DEFAULT NULL,
  p_announcements BOOLEAN DEFAULT NULL,
  p_weekly_digest BOOLEAN DEFAULT NULL,
  p_account_alerts BOOLEAN DEFAULT NULL,
  p_all_emails BOOLEAN DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE email_preferences
  SET 
    marketing_emails = COALESCE(p_marketing_emails, marketing_emails),
    product_updates = COALESCE(p_product_updates, product_updates),
    announcements = COALESCE(p_announcements, announcements),
    weekly_digest = COALESCE(p_weekly_digest, weekly_digest),
    account_alerts = COALESCE(p_account_alerts, account_alerts),
    all_emails = COALESCE(p_all_emails, all_emails),
    updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Generate unsubscribe token
CREATE OR REPLACE FUNCTION generate_unsubscribe_token(
  p_user_id UUID,
  p_email_type TEXT DEFAULT 'all'
)
RETURNS TEXT AS $$
DECLARE
  v_token TEXT;
BEGIN
  INSERT INTO unsubscribe_tokens (user_id, email_type)
  VALUES (p_user_id, p_email_type)
  RETURNING token INTO v_token;
  
  RETURN v_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Process unsubscribe
CREATE OR REPLACE FUNCTION process_unsubscribe(p_token TEXT)
RETURNS JSON AS $$
DECLARE
  v_token_record RECORD;
  v_result JSON;
BEGIN
  -- Get and validate token
  SELECT * INTO v_token_record
  FROM unsubscribe_tokens
  WHERE token = p_token
    AND used_at IS NULL
    AND expires_at > NOW();
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Invalid or expired token');
  END IF;
  
  -- Mark token as used
  UPDATE unsubscribe_tokens
  SET used_at = NOW()
  WHERE token = p_token;
  
  -- Update preferences
  IF v_token_record.email_type = 'all' THEN
    UPDATE email_preferences
    SET 
      all_emails = false,
      unsubscribed_at = NOW()
    WHERE user_id = v_token_record.user_id;
  ELSE
    -- Update specific category
    UPDATE email_preferences
    SET 
      marketing_emails = CASE WHEN v_token_record.email_type = 'marketing' THEN false ELSE marketing_emails END,
      announcements = CASE WHEN v_token_record.email_type = 'announcements' THEN false ELSE announcements END,
      product_updates = CASE WHEN v_token_record.email_type = 'product' THEN false ELSE product_updates END,
      weekly_digest = CASE WHEN v_token_record.email_type = 'digest' THEN false ELSE weekly_digest END
    WHERE user_id = v_token_record.user_id;
  END IF;
  
  RETURN json_build_object('success', true, 'email_type', v_token_record.email_type);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 7. ROW LEVEL SECURITY
-- ==========================================

ALTER TABLE email_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE unsubscribe_tokens ENABLE ROW LEVEL SECURITY;

-- Users can view their own preferences
CREATE POLICY "Users can view own preferences"
  ON email_preferences FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update own preferences"
  ON email_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can view all email data
CREATE POLICY "Admins can view all email preferences"
  ON email_preferences FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can view all email queue"
  ON email_queue FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can view all email logs"
  ON email_logs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- ==========================================
-- 8. GRANT PERMISSIONS
-- ==========================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON email_preferences TO authenticated;
GRANT ALL ON email_queue TO authenticated;
GRANT ALL ON email_logs TO authenticated;
GRANT ALL ON unsubscribe_tokens TO authenticated;

-- ==========================================
-- Migration Complete!
-- ==========================================
