-- Insert seed data for the test user if not exists
INSERT INTO public.work_experiences (user_id, company_name, job_title, start_date, is_current, location, description)
SELECT 
    'e86e846c-ec59-445f-aedc-6e6a1f983ed8'::uuid, -- The user ID we are testing with
    'CyberSecure Nigeria',
    'Senior Security Analyst',
    '2023-01-01',
    true,
    'Lagos, Nigeria',
    'Leading security audits and penetration testing for fintech clients.'
WHERE NOT EXISTS (
    SELECT 1 FROM public.work_experiences WHERE user_id = 'e86e846c-ec59-445f-aedc-6e6a1f983ed8'::uuid
);

INSERT INTO public.work_experiences (user_id, company_name, job_title, start_date, end_date, is_current, location, description)
SELECT 
    'e86e846c-ec59-445f-aedc-6e6a1f983ed8'::uuid,
    'TechFirst Ltd',
    'Systems Administrator',
    '2020-03-01',
    '2022-12-31',
    false,
    'Abuja, Nigeria',
    'Managed server infrastructure and cloud deployments.'
WHERE NOT EXISTS (
    SELECT 1 FROM public.work_experiences WHERE user_id = 'e86e846c-ec59-445f-aedc-6e6a1f983ed8'::uuid
    AND company_name = 'TechFirst Ltd'
);
