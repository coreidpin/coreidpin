-- Create companies table for shared company data
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Company Info
  name VARCHAR(255) NOT NULL,
  name_lowercase VARCHAR(255) NOT NULL UNIQUE,
  
  
  -- Logo
  logo_url TEXT,
  
  -- Additional Info (optional, for future)
  website TEXT,
  industry VARCHAR(100),
  description TEXT,
  
  -- Metadata (no foreign key constraint to avoid dependency issues)
  uploaded_by UUID,
  uploaded_at TIMESTAMPTZ,
  verified BOOLEAN DEFAULT false,
  employee_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for case-insensitive lookups
CREATE INDEX IF NOT EXISTS idx_companies_lowercase ON companies(name_lowercase);
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);

-- Trigger to auto-generate lowercase name for matching
CREATE OR REPLACE FUNCTION set_company_lowercase()
RETURNS TRIGGER AS $$
BEGIN
  NEW.name_lowercase = LOWER(TRIM(NEW.name));
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS companies_lowercase_trigger ON companies;
CREATE TRIGGER companies_lowercase_trigger
BEFORE INSERT OR UPDATE ON companies
FOR EACH ROW
EXECUTE FUNCTION set_company_lowercase();

-- Create storage bucket for company logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-logos', 'company-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "Anyone can view company logos" ON storage.objects;
CREATE POLICY "Anyone can view company logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'company-logos');

DROP POLICY IF EXISTS "Authenticated users can upload company logos" ON storage.objects;
CREATE POLICY "Authenticated users can upload company logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'company-logos');

DROP POLICY IF EXISTS "Users can update their uploaded logos" ON storage.objects;
CREATE POLICY "Users can update their uploaded logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'company-logos');

-- Function to find company (handles variations)
CREATE OR REPLACE FUNCTION find_company(company_name TEXT)
RETURNS TABLE(id UUID, name TEXT, logo_url TEXT, employee_count INTEGER) AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, c.name, c.logo_url, c.employee_count
  FROM companies c
  WHERE c.name_lowercase = LOWER(TRIM(company_name))
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to increment employee count
CREATE OR REPLACE FUNCTION increment_company_employees(company_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE companies
  SET employee_count = employee_count + 1
  WHERE id = company_id;
END;
$$ LANGUAGE plpgsql;

-- Populate with existing companies from work_experience
INSERT INTO companies (name, name_lowercase)
SELECT DISTINCT 
  exp->>'company' as name,
  LOWER(TRIM(exp->>'company')) as name_lowercase
FROM profiles, 
     jsonb_array_elements(work_experience) as exp
WHERE 
  work_experience IS NOT NULL 
  AND jsonb_array_length(work_experience) > 0
  AND exp->>'company' IS NOT NULL
  AND TRIM(exp->>'company') != ''
ON CONFLICT (name_lowercase) DO NOTHING;

-- Update employee counts
UPDATE companies c
SET employee_count = (
  SELECT COUNT(DISTINCT p.user_id)
  FROM profiles p,
       jsonb_array_elements(p.work_experience) as exp
  WHERE LOWER(TRIM(exp->>'company')) = c.name_lowercase
);

COMMENT ON TABLE companies IS 'Shared company database - one logo benefits all employees';
COMMENT ON COLUMN companies.name_lowercase IS 'Lowercase name for case-insensitive matching';
COMMENT ON COLUMN companies.employee_count IS 'Number of users with this company in work experience';
