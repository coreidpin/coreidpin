ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS api_tier TEXT DEFAULT 'free';
