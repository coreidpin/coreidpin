-- Comprehensive fix for missing business_profiles columns
ALTER TABLE public.business_profiles 
ADD COLUMN IF NOT EXISTS company_email TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS monthly_api_quota INTEGER DEFAULT 1000,
ADD COLUMN IF NOT EXISTS current_month_usage INTEGER DEFAULT 0;
