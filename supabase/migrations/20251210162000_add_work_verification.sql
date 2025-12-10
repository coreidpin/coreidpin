-- Add verification fields to work_experiences
ALTER TABLE public.work_experiences 
ADD COLUMN IF NOT EXISTS work_email TEXT,
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'unverified', -- 'unverified', 'pending', 'verified'
ADD COLUMN IF NOT EXISTS company_verification_code TEXT, -- To store the OTP (hashed ideally, but plain for prototype if needed, or use a separate table)
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

-- Ensure RLS allows updating these fields for the user
-- (Existing policies likely cover UPDATE if owner, but let's double check functionality)
