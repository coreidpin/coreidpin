-- ============================================================================
-- Storage RLS Policies for All Buckets
-- File: 20241219000000_enable_storage_rls.sql
-- Buckets: avatars, company-logos, work-proofs, media
-- ============================================================================

-- ============================================================================
-- AVATARS BUCKET
-- ============================================================================

DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatars" ON storage.objects;

CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

CREATE POLICY "Users can update own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars')
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Users can delete own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars');

-- ============================================================================
-- COMPANY LOGOS BUCKET
-- ============================================================================

DROP POLICY IF EXISTS "Authenticated users can upload company logos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view company logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own company logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own company logos" ON storage.objects;

CREATE POLICY "Authenticated users can upload company logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'company-logos');

CREATE POLICY "Anyone can view company logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'company-logos');

CREATE POLICY "Users can update own company logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'company-logos')
WITH CHECK (bucket_id = 'company-logos');

CREATE POLICY "Users can delete own company logos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'company-logos');

-- ============================================================================
-- WORK PROOFS BUCKET
-- ============================================================================

DROP POLICY IF EXISTS "Authenticated users can upload work proofs" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view work proofs" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own work proofs" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own work proofs" ON storage.objects;

CREATE POLICY "Authenticated users can upload work proofs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'work-proofs');

CREATE POLICY "Anyone can view work proofs"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'work-proofs');

CREATE POLICY "Users can update own work proofs"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'work-proofs')
WITH CHECK (bucket_id = 'work-proofs');

CREATE POLICY "Users can delete own work proofs"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'work-proofs');

-- ============================================================================
-- MEDIA BUCKET
-- ============================================================================

DROP POLICY IF EXISTS "Authenticated users can upload media" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view media" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own media" ON storage.objects;

CREATE POLICY "Authenticated users can upload media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media');

CREATE POLICY "Anyone can view media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'media');

CREATE POLICY "Users can update own media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'media')
WITH CHECK (bucket_id = 'media');

CREATE POLICY "Users can delete own media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'media');

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
