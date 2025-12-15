-- ============================================================================
-- Storage RLS Policies for Profile Images
-- File: 20241219000000_enable_storage_rls_profile_images.sql
-- Bucket: Profile Image (or profile-images)
-- ============================================================================

-- Note: Storage bucket names are case-sensitive
-- If your bucket is called "Profile Image", use that exactly
-- If it's "profile-images" or "profile_images", adjust accordingly

-- ============================================================================
-- Policy 1: Authenticated users can upload profile images
-- ============================================================================
CREATE POLICY "Authenticated users can upload profile images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'Profile Image'
);

-- ============================================================================
-- Policy 2: Users can view all profile images (public profiles)
-- ============================================================================
CREATE POLICY "Anyone can view profile images"
ON storage.objects FOR SELECT
TO public
USING (
  bucket_id = 'Profile Image'
);

-- ============================================================================
-- Policy 3: Users can update their own profile images
-- ============================================================================
CREATE POLICY "Users can update own profile images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'Profile Image'
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'Profile Image'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================================================
-- Policy 4: Users can delete their own profile images
-- ============================================================================
CREATE POLICY "Users can delete own profile images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'Profile Image'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================================================
-- Verification
-- ============================================================================
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'storage'
    AND tablename = 'objects';
  
  RAISE NOTICE '✅ Storage policies created';
  RAISE NOTICE 'Total storage.objects policies: %', policy_count;
END $$;

-- ============================================================================
-- TESTING
-- ============================================================================

-- Test 1: Check bucket exists
-- SELECT * FROM storage.buckets WHERE name = 'Profile Image';

-- Test 2: List storage policies
-- SELECT policyname, cmd 
-- FROM pg_policies 
-- WHERE schemaname = 'storage' 
-- AND tablename = 'objects'
-- AND policyname ILIKE '%profile%';

-- Test 3: Check if bucket is public
-- SELECT name, public FROM storage.buckets WHERE name = 'Profile Image';
