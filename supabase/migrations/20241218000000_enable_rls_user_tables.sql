-- ============================================================================
-- Enable RLS on standard user-owned tables
-- File: 20241218000000_enable_rls_user_tables.sql
-- Tables: notifications, kyc_requests, professional_pins, session_tokens, work_experiences
-- ============================================================================

-- ============================================================================
-- Table 1: notifications
-- ============================================================================

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can create own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;
DROP POLICY IF EXISTS "Service role can manage all notifications" ON notifications;

CREATE POLICY "Users can view own notifications"
ON notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own notifications"
ON notifications FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
ON notifications FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
ON notifications FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all notifications"
ON notifications
USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- ============================================================================
-- Table 2: kyc_requests
-- ============================================================================

ALTER TABLE kyc_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own kyc_requests" ON kyc_requests;
DROP POLICY IF EXISTS "Users can create own kyc_requests" ON kyc_requests;
DROP POLICY IF EXISTS "Users can update own kyc_requests" ON kyc_requests;
DROP POLICY IF EXISTS "Users can delete own kyc_requests" ON kyc_requests;
DROP POLICY IF EXISTS "Service role can manage all kyc_requests" ON kyc_requests;

CREATE POLICY "Users can view own kyc_requests"
ON kyc_requests FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own kyc_requests"
ON kyc_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own kyc_requests"
ON kyc_requests FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own kyc_requests"
ON kyc_requests FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all kyc_requests"
ON kyc_requests
USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_kyc_requests_user_id ON kyc_requests(user_id);

-- ============================================================================
-- Table 3: professional_pins
-- ============================================================================

ALTER TABLE professional_pins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own professional_pins" ON professional_pins;
DROP POLICY IF EXISTS "Users can create own professional_pins" ON professional_pins;
DROP POLICY IF EXISTS "Users can update own professional_pins" ON professional_pins;
DROP POLICY IF EXISTS "Users can delete own professional_pins" ON professional_pins;
DROP POLICY IF EXISTS "Service role can manage all professional_pins" ON professional_pins;

CREATE POLICY "Users can view own professional_pins"
ON professional_pins FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own professional_pins"
ON professional_pins FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own professional_pins"
ON professional_pins FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own professional_pins"
ON professional_pins FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all professional_pins"
ON professional_pins
USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_professional_pins_user_id ON professional_pins(user_id);

-- ============================================================================
-- Table 4: session_tokens
-- ============================================================================

ALTER TABLE session_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own session_tokens" ON session_tokens;
DROP POLICY IF EXISTS "Users can create own session_tokens" ON session_tokens;
DROP POLICY IF EXISTS "Users can update own session_tokens" ON session_tokens;
DROP POLICY IF EXISTS "Users can delete own session_tokens" ON session_tokens;
DROP POLICY IF EXISTS "Service role can manage all session_tokens" ON session_tokens;

CREATE POLICY "Users can view own session_tokens"
ON session_tokens FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own session_tokens"
ON session_tokens FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own session_tokens"
ON session_tokens FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own session_tokens"
ON session_tokens FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all session_tokens"
ON session_tokens
USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_session_tokens_user_id ON session_tokens(user_id);

-- ============================================================================
-- Table 5: work_experiences
-- ============================================================================

ALTER TABLE work_experiences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own work_experiences" ON work_experiences;
DROP POLICY IF EXISTS "Users can create own work_experiences" ON work_experiences;
DROP POLICY IF EXISTS "Users can update own work_experiences" ON work_experiences;
DROP POLICY IF EXISTS "Users can delete own work_experiences" ON work_experiences;
DROP POLICY IF EXISTS "Service role can manage all work_experiences" ON work_experiences;

CREATE POLICY "Users can view own work_experiences"
ON work_experiences FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own work_experiences"
ON work_experiences FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own work_experiences"
ON work_experiences FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own work_experiences"
ON work_experiences FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all work_experiences"
ON work_experiences
USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_work_experiences_user_id ON work_experiences(user_id);

-- ============================================================================
-- Verification
-- ============================================================================

DO $$
DECLARE
  tables TEXT[] := ARRAY['notifications', 'kyc_requests', 'professional_pins', 'session_tokens', 'work_experiences'];
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
  
  RAISE NOTICE '🎉 All 5 tables secured successfully';
END $$;
