-- Migration: Add LinkedIn-style features to work_experiences table
-- Date: 2025-12-14
-- Author: GidiPIN Team
-- Description: Adds employment_type, skills array, and achievements array to work experience entries

-- Step 1: Add new columns to work_experiences table
ALTER TABLE work_experiences
ADD COLUMN IF NOT EXISTS employment_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS skills TEXT[],
ADD COLUMN IF NOT EXISTS achievements TEXT[];

-- Step 2: Add check constraint for employment_type
-- Only allow valid employment types
ALTER TABLE work_experiences
DROP CONSTRAINT IF EXISTS valid_employment_type;

ALTER TABLE work_experiences
ADD CONSTRAINT valid_employment_type
CHECK (
  employment_type IS NULL OR 
  employment_type IN (
    'full_time',
    'part_time',
    'contract',
    'freelance',
    'internship',
    'apprenticeship',
    'seasonal',
    'self_employed'
  )
);

-- Step 3: Create GIN index for skills array to enable fast searching
-- This allows efficient queries like: WHERE 'Product Management' = ANY(skills)
CREATE INDEX IF NOT EXISTS idx_work_experiences_skills 
ON work_experiences 
USING GIN(skills);

-- Step 4: Create GIN index for achievements array (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_work_experiences_achievements 
ON work_experiences 
USING GIN(achievements);

-- Step 5: Add helpful column comments
COMMENT ON COLUMN work_experiences.employment_type IS 'Type of employment: full_time, part_time, contract, freelance, internship, apprenticeship, seasonal, or self_employed';
COMMENT ON COLUMN work_experiences.skills IS 'Array of skill names/keywords used in this role (e.g., Product Management, JavaScript, etc.)';
COMMENT ON COLUMN work_experiences.achievements IS 'Array of key achievements and highlights from this role';

-- Step 6: Update RLS policies (if needed)
-- The existing RLS policies should automatically apply to the new columns
-- But let's verify the policies exist and are correct

-- Verify users can update their own work experiences
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'work_experiences' 
    AND policyname = 'Users can update own experiences'
  ) THEN
    CREATE POLICY "Users can update own experiences"
    ON work_experiences
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Step 7: Optional - Set default values for existing records
-- You can customize this based on your needs

-- Example: Set employment_type to 'full_time' for current positions if not set
-- UPDATE work_experiences
-- SET employment_type = 'full_time'
-- WHERE is_current = true 
-- AND employment_type IS NULL;

-- Example: Initialize empty arrays for existing records (optional)
-- UPDATE work_experiences
-- SET 
--   skills = ARRAY[]::TEXT[],
--   achievements = ARRAY[]::TEXT[]
-- WHERE skills IS NULL OR achievements IS NULL;

-- Migration complete!
-- New fields:
-- - employment_type (VARCHAR(50), constrained to valid values)
-- - skills (TEXT[], indexed with GIN)
-- - achievements (TEXT[], indexed with GIN)
