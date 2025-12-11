-- Enhance API Keys Security and Rate Limiting
-- Migration: 20250111000000_enhance_api_keys_security.sql

-- Add columns for rate limiting and hashed secrets
ALTER TABLE public.api_keys 
    ADD COLUMN IF NOT EXISTS api_secret_hash TEXT, -- Store hashed secret
    ADD COLUMN IF NOT EXISTS rate_limit_per_minute INTEGER DEFAULT 60,
    ADD COLUMN IF NOT EXISTS rate_limit_per_day INTEGER DEFAULT 10000,
    ADD COLUMN IF NOT EXISTS current_minute_count INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS current_day_count INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS last_request_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS rate_limit_reset_at TIMESTAMPTZ DEFAULT NOW();

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_api_keys_lookup ON public.api_keys(api_key) WHERE is_active = true;

-- Update generate_api_secret to return a longer secret
CREATE OR REPLACE FUNCTION generate_api_secret()
RETURNS TEXT AS $$
BEGIN
  -- Generate a random string prefixed with 'sk_' (longer for better security)
  RETURN 'sk_' || encode(gen_random_bytes(48), 'hex'); -- 96 chars
END;
$$ LANGUAGE plpgsql;

-- Function to hash API secret
CREATE OR REPLACE FUNCTION hash_api_secret(secret TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Use pgcrypto extension for hashing
  RETURN encode(digest(secret, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Function to verify API secret
CREATE OR REPLACE FUNCTION verify_api_secret(provided_secret TEXT, secret_hash TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN encode(digest(provided_secret, 'sha256'), 'hex') = secret_hash;
END;
$$ LANGUAGE plpgsql;

-- Function to check and update rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(key_id UUID)
RETURNS JSONB AS $$
DECLARE
  key_record RECORD;
  current_time TIMESTAMPTZ := NOW();
  minute_reset BOOLEAN := false;
  day_reset BOOLEAN := false;
BEGIN
  -- Get the API key record
  SELECT * INTO key_record FROM api_keys WHERE id = key_id AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'key_not_found');
  END IF;
  
  -- Check if we need to reset minute counter (1 minute passed)
  IF key_record.last_request_at IS NULL OR 
     current_time - key_record.last_request_at > INTERVAL '1 minute' THEN
    minute_reset := true;
  END IF;
  
  -- Check if we need to reset day counter (1 day passed)
  IF key_record.rate_limit_reset_at IS NULL OR 
     current_time >= key_record.rate_limit_reset_at THEN
    day_reset := true;
  END IF;
  
  -- Reset counters if needed
  IF minute_reset THEN
    UPDATE api_keys 
    SET current_minute_count = 1,
        current_day_count = CASE WHEN day_reset THEN 1 ELSE current_day_count + 1 END,
        last_request_at = current_time,
        rate_limit_reset_at = CASE WHEN day_reset THEN current_time + INTERVAL '1 day' ELSE rate_limit_reset_at END
    WHERE id = key_id;
    
    RETURN jsonb_build_object(
      'allowed', true, 
      'remaining_minute', key_record.rate_limit_per_minute - 1,
      'remaining_day', CASE WHEN day_reset THEN key_record.rate_limit_per_day - 1 ELSE key_record.rate_limit_per_day - (key_record.current_day_count + 1) END
    );
  END IF;
  
  -- Check minute limit
  IF key_record.current_minute_count >= key_record.rate_limit_per_minute THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'minute_limit_exceeded');
  END IF;
  
  -- Check day limit
  IF key_record.current_day_count >= key_record.rate_limit_per_day THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'day_limit_exceeded');
  END IF;
  
  -- Increment counters
  UPDATE api_keys 
  SET current_minute_count = current_minute_count + 1,
      last_request_at = current_time
  WHERE id = key_id;
  
  RETURN jsonb_build_object(
    'allowed', true,
    'remaining_minute', key_record.rate_limit_per_minute - (key_record.current_minute_count + 1),
    'remaining_day', key_record.rate_limit_per_day - (key_record.current_day_count + 1)
  );
END;
$$ LANGUAGE plpgsql;

-- Enable pgcrypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Add comment
COMMENT ON FUNCTION check_rate_limit(UUID) IS 'Checks rate limit for an API key and updates counters. Returns JSONB with allowed status and remaining quota.';
