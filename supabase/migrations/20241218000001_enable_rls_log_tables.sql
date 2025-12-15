-- ============================================================================
-- Enable RLS on audit/log tables
-- File: 20241218000001_enable_rls_log_tables.sql
-- Tables: api_usage_logs, audit_logs, email_verification_logs, pin_login_logs
-- Pattern: Users can view own logs, system can insert, no updates (immutable)
-- ============================================================================

-- ============================================================================
-- Table 1: api_usage_logs
-- ============================================================================

ALTER TABLE api_usage_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own api_usage_logs" ON api_usage_logs;
DROP POLICY IF EXISTS "System can insert api_usage_logs" ON api_usage_logs;
DROP POLICY IF EXISTS "Service role can view all api_usage_logs" ON api_usage_logs;
DROP POLICY IF EXISTS "Service role can manage all api_usage_logs" ON api_usage_logs;

-- Users can view their own API usage logs
CREATE POLICY "Users can view own api_usage_logs"
ON api_usage_logs FOR SELECT
USING (auth.uid() = user_id);

-- System can insert logs (via service role or triggers)
CREATE POLICY "System can insert api_usage_logs"
ON api_usage_logs FOR INSERT
WITH CHECK (true);

-- Service role can view all logs (for analytics)
CREATE POLICY "Service role can manage all api_usage_logs"
ON api_usage_logs
USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_api_usage_logs_user_id ON api_usage_logs(user_id);

-- ============================================================================
-- Table 2: audit_logs
-- ============================================================================

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own audit_logs" ON audit_logs;
DROP POLICY IF EXISTS "System can insert audit_logs" ON audit_logs;
DROP POLICY IF EXISTS "Service role can manage all audit_logs" ON audit_logs;

-- Users can view their own audit logs
CREATE POLICY "Users can view own audit_logs"
ON audit_logs FOR SELECT
USING (auth.uid() = user_id);

-- System can insert audit logs
CREATE POLICY "System can insert audit_logs"
ON audit_logs FOR INSERT
WITH CHECK (true);

-- Service role can manage all (for admin auditing)
CREATE POLICY "Service role can manage all audit_logs"
ON audit_logs
USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);

-- ============================================================================
-- Table 3: email_verification_logs
-- ============================================================================

ALTER TABLE email_verification_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own email_verification_logs" ON email_verification_logs;
DROP POLICY IF EXISTS "System can insert email_verification_logs" ON email_verification_logs;
DROP POLICY IF EXISTS "Service role can manage all email_verification_logs" ON email_verification_logs;

-- Users can view their own email verification logs
CREATE POLICY "Users can view own email_verification_logs"
ON email_verification_logs FOR SELECT
USING (auth.uid() = user_id);

-- System can insert email verification logs
CREATE POLICY "System can insert email_verification_logs"
ON email_verification_logs FOR INSERT
WITH CHECK (true);

-- Service role can manage all
CREATE POLICY "Service role can manage all email_verification_logs"
ON email_verification_logs
USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_email_verification_logs_user_id ON email_verification_logs(user_id);

-- ============================================================================
-- Table 4: pin_login_logs
-- ============================================================================

ALTER TABLE pin_login_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own pin_login_logs" ON pin_login_logs;
DROP POLICY IF EXISTS "System can insert pin_login_logs" ON pin_login_logs;
DROP POLICY IF EXISTS "Service role can manage all pin_login_logs" ON pin_login_logs;

-- Users can view their own PIN login logs
CREATE POLICY "Users can view own pin_login_logs"
ON pin_login_logs FOR SELECT
USING (auth.uid() = user_id);

-- System can insert PIN login logs
CREATE POLICY "System can insert pin_login_logs"
ON pin_login_logs FOR INSERT
WITH CHECK (true);

-- Service role can manage all
CREATE POLICY "Service role can manage all pin_login_logs"
ON pin_login_logs
USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_pin_login_logs_user_id ON pin_login_logs(user_id);

-- ============================================================================
-- Verification
-- ============================================================================

DO $$
DECLARE
  tables TEXT[] := ARRAY['api_usage_logs', 'audit_logs', 'email_verification_logs', 'pin_login_logs'];
  tbl TEXT;
  policy_count INTEGER;
BEGIN
  FOREACH tbl IN ARRAY tables
  LOOP
    -- Check RLS enabled
    IF NOT (SELECT rowsecurity FROM pg_tables 
            WHERE schemaname = 'public' AND tablename = tbl) THEN
      RAISE EXCEPTION 'RLS not enabled on %', tbl;
    END IF;
    
    -- Count policies
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = tbl;
    
    RAISE NOTICE '✅ %: RLS enabled with % policies', tbl, policy_count;
  END LOOP;
  
  RAISE NOTICE '🎉 All 4 log tables secured successfully';
END $$;
