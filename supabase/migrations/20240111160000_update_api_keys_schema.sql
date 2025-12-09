-- Update api_keys table to match component
DO $$
BEGIN
    -- Check if 'name' column exists before trying to rename it
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='api_keys' AND column_name='name') THEN
        ALTER TABLE public.api_keys RENAME COLUMN name TO key_name;
    END IF;

    -- If 'key_name' doesn't exist (and 'name' didn't exist to be renamed), we might need to create it
    -- But usually it comes from one or the other. If neither exists, we should add it.
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='api_keys' AND column_name='key_name') THEN
        ALTER TABLE public.api_keys ADD COLUMN key_name TEXT;
    END IF;
END $$;

ALTER TABLE public.api_keys 
    ADD COLUMN IF NOT EXISTS environment TEXT DEFAULT 'sandbox',
    ADD COLUMN IF NOT EXISTS api_secret TEXT; -- Note: Storing secrets in plain text is not recommended for production

-- Update business_profiles table
ALTER TABLE public.business_profiles
    ADD COLUMN IF NOT EXISTS api_tier TEXT DEFAULT 'free';

-- Create RPC for generating API Key
CREATE OR REPLACE FUNCTION generate_api_key()
RETURNS TEXT AS $$
BEGIN
  -- Generate a random string prefixed with 'pk_'
  RETURN 'pk_' || encode(gen_random_bytes(24), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Create RPC for generating API Secret
CREATE OR REPLACE FUNCTION generate_api_secret()
RETURNS TEXT AS $$
BEGIN
  -- Generate a random string prefixed with 'sk_'
  RETURN 'sk_' || encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;
