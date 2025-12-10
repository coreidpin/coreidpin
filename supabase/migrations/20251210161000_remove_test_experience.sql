-- Remove the seed data for the test user
DELETE FROM public.work_experiences 
WHERE user_id = 'e86e846c-ec59-445f-aedc-6e6a1f983ed8'::uuid 
AND company_name IN ('CyberSecure Nigeria', 'TechFirst Ltd');
