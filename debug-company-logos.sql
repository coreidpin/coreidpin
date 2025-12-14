-- Quick debugging queries to check company logo setup

-- 1. List all companies with logos
SELECT 
  id,
  name,
  name_lowercase,
  logo_url,
  employee_count,
  created_at
FROM companies
ORDER BY created_at DESC;

-- 2. Check specific company (replace 'YourCompany' with your company name)
SELECT * FROM companies 
WHERE name_lowercase = LOWER(TRIM('YourCompany'));

-- 3. Check your profile's work experience structure
SELECT 
  user_id,
  full_name,
  work_experience,
  jsonb_array_length(work_experience) as job_count
FROM profiles 
WHERE user_id = 'your-user-id-here';

-- 4. Extract company names from work experience
SELECT 
  p.full_name,
  exp->>'company' as company_name,
  exp->>'job_title' as job_title,
  exp->>'current' as is_current,
  (exp->>'current')::boolean as current_boolean
FROM profiles p,
     jsonb_array_elements(p.work_experience) as exp
WHERE p.user_id = 'your-user-id-here';

-- 5. Match work experience companies with company logos
SELECT 
  p.full_name,
  exp->>'company' as profile_company,
  c.name as db_company,
  c.logo_url,
  CASE 
    WHEN c.logo_url IS NOT NULL THEN 'Logo exists ✓'
    ELSE 'No logo ✗'
  END as logo_status
FROM profiles p,
     jsonb_array_elements(p.work_experience) as exp
LEFT JOIN companies c ON LOWER(TRIM(exp->>'company')) = c.name_lowercase
WHERE p.user_id = 'your-user-id-here';

-- 6. Find company name mismatches
SELECT 
  DISTINCT exp->>'company' as work_exp_company,
  c.name as companies_table_name,
  CASE
    WHEN c.name IS NULL THEN 'Not in companies table'
    WHEN c.logo_url IS NULL THEN 'In table but no logo'
    ELSE 'Has logo'
  END as status
FROM profiles p,
     jsonb_array_elements(p.work_experience) as exp
LEFT JOIN companies c ON LOWER(TRIM(exp->>'company')) = c.name_lowercase
ORDER BY status;

-- 7. If you need to fix company name mismatch:
-- UPDATE companies 
-- SET name = 'Correct Name', name_lowercase = LOWER(TRIM('Correct Name'))
-- WHERE id = 'company-id-here';

-- 8. Check CompanyLogo component is getting the right data
-- In browser console, check what the component is looking for:
-- Look at Network tab → Filter by "companies" or "find_company"
