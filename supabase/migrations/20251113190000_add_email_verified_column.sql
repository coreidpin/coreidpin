-- Add email_verified column to profiles table if not exists
ALTER TABLE profiles
ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;

-- Create index for quick lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email_verified ON profiles(email_verified, created_at DESC);

-- Comment for documentation
COMMENT ON COLUMN profiles.email_verified IS 'Flag indicating whether the user has verified their email address via the verification token flow.';
