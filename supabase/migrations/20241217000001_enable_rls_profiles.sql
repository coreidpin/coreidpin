-- ============================================================================
-- Enable RLS on profiles table
-- File: 20241217000001_enable_rls_profiles.sql
-- ============================================================================

-- Step 1: Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop old policies (if any exist)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable" ON profiles;
DROP POLICY IF EXISTS "Users can create own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Service role can manage all profiles" ON profiles;

-- Step 3: Policy 1 - Users can always view their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = user_id);

-- Step 4: Policy 2 - Anyone can view public profiles
CREATE POLICY "Public profiles are viewable"
ON profiles FOR SELECT
USING (
  -- Profile is public if either flag is enabled or has a public URL slug
  public_profile_enabled = true 
  OR profile_url_slug IS NOT NULL
);

-- Step 5: Policy 3 - Users can create their own profile
CREATE POLICY "Users can create own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Step 6: Policy 4 - Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Step 7: Policy 5 - Service role can manage all profiles
CREATE POLICY "Service role can manage all profiles"
ON profiles
USING (auth.role() = 'service_role');

-- Step 8: Verify RLS is enabled
DO $$
BEGIN
  IF NOT (SELECT rowsecurity FROM pg_tables 
          WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    RAISE EXCEPTION 'RLS not enabled on profiles';
  END IF;
  
  RAISE NOTICE 'RLS successfully enabled on profiles';
END $$;

-- Step 9: Verify policies exist
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE schemaname = 'public' AND tablename = 'profiles';
  
  IF policy_count < 5 THEN
    RAISE WARNING 'Expected 5 policies on profiles, found %', policy_count;
  ELSE
    RAISE NOTICE 'All % policies created successfully on profiles', policy_count;
  END IF;
END $$;

-- Step 10: Create indexes for RLS performance (if not exist)
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_public_enabled ON profiles(public_profile_enabled) WHERE public_profile_enabled = true;
CREATE INDEX IF NOT EXISTS idx_profiles_url_slug ON profiles(profile_url_slug) WHERE profile_url_slug IS NOT NULL;

-- ============================================================================
-- TESTING (Run these manually to verify)
-- ============================================================================

-- Test 1: Verify RLS enabled
-- SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'profiles';
-- Expected: rowsecurity = true

-- Test 2: List policies
-- SELECT policyname FROM pg_policies WHERE tablename = 'profiles' ORDER BY policyname;
-- Expected: 5 policies

-- Test 3: Test as specific user - see own profile
-- SET request.jwt.claim.sub = 'YOUR_USER_ID';
-- SELECT COUNT(*) FROM profiles WHERE user_id = 'YOUR_USER_ID';
-- Expected: 1 (your own profile)

-- Test 4: See public profiles
-- SELECT COUNT(*) FROM profiles WHERE public_profile_enabled = true;
-- Expected: Count of public profiles

-- Test 5: Cannot see private profiles of others
-- SET request.jwt.claim.sub = 'USER_1_ID';
-- SELECT COUNT(*) FROM profiles 
-- WHERE user_id = 'USER_2_ID' AND public_profile_enabled = false;
-- Expected: 0 (cannot see other's private profile)

-- Test 6: Can see other's public profile
-- SELECT COUNT(*) FROM profiles 
-- WHERE user_id = 'USER_2_ID' AND public_profile_enabled = true;
-- Expected: 1 (can see public profile)

-- Test 7: Reset authentication
-- RESET request.jwt.claim.sub;
-- SELECT COUNT(*) FROM profiles;
-- Expected: Only public profiles visible

-- Test 8: Public profile by URL slug
-- SELECT COUNT(*) FROM profiles WHERE profile_url_slug = 'some-slug';
-- Expected: 1 if exists and public
