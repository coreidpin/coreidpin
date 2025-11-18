-- Add verification and PIN flags to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS pin_active BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS pin_hash TEXT,
ADD COLUMN IF NOT EXISTS pin_issued_at TIMESTAMPTZ;

-- Indexes for quick filtering
CREATE INDEX IF NOT EXISTS idx_users_phone_verified ON users(phone_verified);
CREATE INDEX IF NOT EXISTS idx_users_pin_active ON users(pin_active);

-- Ensure profiles has email_verified (might already exist)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
CREATE INDEX IF NOT EXISTS idx_profiles_email_verified ON profiles(email_verified);

