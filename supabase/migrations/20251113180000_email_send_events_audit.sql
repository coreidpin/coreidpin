-- Email send events audit table for tracking verification email attempts and API key usage
-- This table records every send attempt, provider responses (masked), and quota tracking

CREATE TABLE IF NOT EXISTS email_send_events (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  code VARCHAR(6) NOT NULL,
  provider VARCHAR(50) NOT NULL DEFAULT 'resend',
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  -- Status: pending, sent, failed, bounced
  response_message TEXT,
  -- Masked provider response (e.g., error details without sensitive data)
  response_status INTEGER,
  -- HTTP status from provider (200, 403, 429, etc.)
  resend_id VARCHAR(255),
  -- Resend email ID for tracking delivery
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS (private table, only service role and triggers can write)
ALTER TABLE email_send_events ENABLE ROW LEVEL SECURITY;

-- Policy: service role can always read/insert
CREATE POLICY "service_role_email_send_events" ON email_send_events
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Index for querying by user_id and created_at (rate limit tracking)
CREATE INDEX idx_email_send_events_user_id_created_at ON email_send_events(user_id, created_at DESC);

-- Index for status and created_at (analytics)
CREATE INDEX idx_email_send_events_status_created_at ON email_send_events(status, created_at DESC);

-- Index for provider tracking
CREATE INDEX idx_email_send_events_provider ON email_send_events(provider);

-- Comment for documentation
COMMENT ON TABLE email_send_events IS 'Audit log for email verification send attempts. Tracks provider responses, quotas, and rate limits.';
COMMENT ON COLUMN email_send_events.response_message IS 'Masked provider response (errors without secrets). Example: "Domain not verified" or "Rate limit exceeded".';
COMMENT ON COLUMN email_send_events.resend_id IS 'Resend-provided email ID for tracking delivery status and bounces.';
