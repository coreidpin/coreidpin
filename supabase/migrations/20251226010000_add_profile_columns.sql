-- ==========================================
-- Add/Update Profile Columns
-- Handle existing profile_complete boolean column
-- ==========================================

-- First, drop the existing profile_complete if it's boolean and recreate as integer
DO $$
BEGIN
  -- Check if column exists and is boolean
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'profile_complete'
    AND data_type = 'boolean'
  ) THEN
    -- Drop the boolean column
    ALTER TABLE profiles DROP COLUMN profile_complete;
    RAISE NOTICE 'Dropped existing boolean profile_complete column';
  END IF;
END $$;

-- Add profile completion as INTEGER (0-100)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS profile_complete INTEGER DEFAULT 0 CHECK (profile_complete >= 0 AND profile_complete <= 100);

-- Add location fields
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS city TEXT;

-- Add user status tracking
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT false;

-- Add last login tracking
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;

-- Add date of birth if not exists
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_profiles_country ON profiles(country);
CREATE INDEX IF NOT EXISTS idx_profiles_is_suspended ON profiles(is_suspended);
CREATE INDEX IF NOT EXISTS idx_profiles_profile_complete ON profiles(profile_complete);

-- Add helpful comments
COMMENT ON COLUMN profiles.profile_complete IS 'Profile completion percentage (0-100)';
COMMENT ON COLUMN profiles.country IS 'User country';
COMMENT ON COLUMN profiles.state IS 'User state/province';
COMMENT ON COLUMN profiles.city IS 'User city';
COMMENT ON COLUMN profiles.is_suspended IS 'Whether user account is suspended';
COMMENT ON COLUMN profiles.last_login IS 'Last login timestamp';
COMMENT ON COLUMN profiles.date_of_birth IS 'User date of birth';

-- Success message
DO $$ 
BEGIN 
  RAISE NOTICE '✅ Profile table columns updated successfully!';
  RAISE NOTICE 'profile_complete changed from BOOLEAN to INTEGER (0-100)';
  RAISE NOTICE 'Added: country, state, city, is_suspended, last_login, date_of_birth';
END $$;
