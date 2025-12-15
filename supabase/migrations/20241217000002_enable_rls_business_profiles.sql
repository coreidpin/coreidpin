-- ============================================================================
-- Enable RLS on business_profiles table
-- File: 20241217000002_enable_rls_business_profiles.sql
-- ============================================================================

-- Step 1: Enable RLS
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop old policies (if any exist)
DROP POLICY IF EXISTS "Users can view own business_profile" ON business_profiles;
DROP POLICY IF EXISTS "Users can create own business_profile" ON business_profiles;
DROP POLICY IF EXISTS "Users can update own business_profile" ON business_profiles;
DROP POLICY IF EXISTS "Users can delete own business_profile" ON business_profiles;
DROP POLICY IF EXISTS "Service role can manage all business_profiles" ON business_profiles;

-- Step 3: Policy 1 - Users can view their own business profile
CREATE POLICY "Users can view own business_profile"
ON business_profiles FOR SELECT
USING (auth.uid() = user_id);

-- Step 4: Policy 2 - Users can create their own business profile
CREATE POLICY "Users can create own business_profile"
ON business_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Step 5: Policy 3 - Users can update their own business profile
CREATE POLICY "Users can update own business_profile"
ON business_profiles FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Step 6: Policy 4 - Users can delete their own business profile
CREATE POLICY "Users can delete own business_profile"
ON business_profiles FOR DELETE
USING (auth.uid() = user_id);

-- Step 7: Policy 5 - Service role can manage all business profiles
CREATE POLICY "Service role can manage all business_profiles"
ON business_profiles
USING (auth.role() = 'service_role');

-- Step 8: Verify RLS is enabled
DO $$
BEGIN
  IF NOT (SELECT rowsecurity FROM pg_tables 
          WHERE schemaname = 'public' AND tablename = 'business_profiles') THEN
    RAISE EXCEPTION 'RLS not enabled on business_profiles';
  END IF;
  
  RAISE NOTICE 'RLS successfully enabled on business_profiles';
END $$;

-- Step 9: Verify policies exist
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE schemaname = 'public' AND tablename = 'business_profiles';
  
  IF policy_count < 5 THEN
    RAISE WARNING 'Expected 5 policies on business_profiles, found %', policy_count;
  ELSE
    RAISE NOTICE 'All % policies created successfully on business_profiles', policy_count;
  END IF;
END $$;

-- Step 10: Create index on user_id for RLS performance (if not exist)
CREATE INDEX IF NOT EXISTS idx_business_profiles_user_id ON business_profiles(user_id);

-- ============================================================================
-- TESTING (Run these manually to verify)
-- ============================================================================

-- Test 1: Verify RLS enabled
-- SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'business_profiles';
-- Expected: rowsecurity = true

-- Test 2: List policies
-- SELECT policyname FROM pg_policies WHERE tablename = 'business_profiles' ORDER BY policyname;
-- Expected: 5 policies

-- Test 3: Test as specific business user
-- SET request.jwt.claim.sub = 'BUSINESS_USER_ID';
-- SELECT COUNT(*) FROM business_profiles WHERE user_id = 'BUSINESS_USER_ID';
-- Expected: 1 (own business profile)

-- Test 4: Cannot see other business profiles
-- SELECT COUNT(*) FROM business_profiles WHERE user_id = 'OTHER_BUSINESS_USER_ID';
-- Expected: 0

-- Test 5: User can see only own profile
-- SET request.jwt.claim.sub = 'USER_1_ID';
-- SELECT COUNT(*) FROM business_profiles WHERE user_id = 'USER_2_ID';
-- Expected: 0 (cannot see other's profile)

-- Test 6: User can insert own business profile
-- INSERT INTO business_profiles (user_id, business_name, ...)
-- VALUES ('BUSINESS_USER_ID', 'My Business', ...);
-- Expected: Success

-- Test 7: User cannot insert for others
-- INSERT INTO business_profiles (user_id, business_name, ...)
-- VALUES ('OTHER_USER_ID', 'Other Business', ...);
-- Expected: Policy violation error

-- Test 8: Reset authentication
-- RESET request.jwt.claim.sub;
-- SELECT COUNT(*) FROM business_profiles;
-- Expected: 0 (no authentication, cannot see any profiles)

