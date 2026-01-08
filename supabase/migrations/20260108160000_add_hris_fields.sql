-- Add verification fields for HRIS and other verification methods
ALTER TABLE work_experiences 
  ADD COLUMN IF NOT EXISTS verification_source VARCHAR(50), -- e.g. 'hris_integration', 'work_email', 'admin'
  ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'unverified', -- 'verified', 'unverified', 'pending'
  ADD COLUMN IF NOT EXISTS verification_metadata JSONB DEFAULT '{}'::jsonb; -- Store extra details like provider ID

-- Update RLS policies if necessary (generally users can read their own verification status)
-- Existing policies likely cover this as they select *
