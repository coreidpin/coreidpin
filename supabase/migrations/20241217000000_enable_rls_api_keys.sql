-- ============================================================================
-- Enable RLS on api_keys table
-- File: 20241217000000_enable_rls_api_keys.sql
-- ============================================================================

-- Step 1: Enable RLS
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop old policies (if any exist)
DROP POLICY IF EXISTS "Users can view own api_keys" ON api_keys;
DROP POLICY IF EXISTS "Users can create own api_keys" ON api_keys;
DROP POLICY IF EXISTS "Users can update own api_keys" ON api_keys;
DROP POLICY IF EXISTS "Users can delete own api_keys" ON api_keys;
DROP POLICY IF EXISTS "Service role can manage all api_keys" ON api_keys;

-- Step 3: Create SELECT policy - Users can view their own API keys
CREATE POLICY "Users can view own api_keys"
ON api_keys FOR SELECT
USING (auth.uid() = user_id);

-- Step 4: Create INSERT policy - Users can create API keys for themselves
CREATE POLICY "Users can create own api_keys"
ON api_keys FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Step 5: Create UPDATE policy - Users can update their own API keys
CREATE POLICY "Users can update own api_keys"
ON api_keys FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Step 6: Create DELETE policy - Users can delete their own API keys
CREATE POLICY "Users can delete own api_keys"
ON api_keys FOR DELETE
USING (auth.uid() = user_id);

-- Step 7: Service role can manage all (for admin operations)
CREATE POLICY "Service role can manage all api_keys"
ON api_keys
USING (auth.role() = 'service_role');

-- Step 8: Verify RLS is enabled
DO $$
BEGIN
  IF NOT (SELECT rowsecurity FROM pg_tables 
          WHERE schemaname = 'public' AND tablename = 'api_keys') THEN
    RAISE EXCEPTION 'RLS not enabled on api_keys';
  END IF;
  
  RAISE NOTICE 'RLS successfully enabled on api_keys';
END $$;

-- Step 9: Verify policies exist
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE schemaname = 'public' AND tablename = 'api_keys';
  
  IF policy_count < 5 THEN
    RAISE WARNING 'Expected 5 policies on api_keys, found %', policy_count;
  ELSE
    RAISE NOTICE 'All % policies created successfully on api_keys', policy_count;
  END IF;
END $$;

-- Step 10: Create index on user_id if it doesn't exist (for RLS performance)
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);

-- ============================================================================
-- TESTING (Run these manually to verify)
-- ============================================================================

-- Test 1: Verify RLS enabled
-- SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'api_keys';
-- Expected: rowsecurity = true

-- Test 2: List policies
-- SELECT policyname FROM pg_policies WHERE tablename = 'api_keys';
-- Expected: 5 policies

-- Test 3: Test as specific user (replace with real user_id)
-- SET request.jwt.claim.sub = 'YOUR_USER_ID';
-- SELECT COUNT(*) FROM api_keys WHERE user_id = 'YOUR_USER_ID';
-- Expected: Only see own keys

-- Test 4: Try to see other user's keys
-- SELECT COUNT(*) FROM api_keys WHERE user_id = 'OTHER_USER_ID';
-- Expected: 0 rows

-- Test 5: Reset to see no data without auth
-- RESET request.jwt.claim.sub;
-- SELECT COUNT(*) FROM api_keys;
-- Expected: 0 rows (no authentication)
