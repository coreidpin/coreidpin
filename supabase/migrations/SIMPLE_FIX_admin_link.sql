-- SIMPLEST FIX: Just link admin_users to the newest user (skip deletions)

-- Update admin_users to point to the newest user
UPDATE public.admin_users 
SET user_id = '2f800220-5405-4046-89a4-61afdbf1a5bc',
    updated_at = NOW()
WHERE email = 'admin@gidipin.work';

-- Verify it worked
SELECT 
  au.user_id,
  au.email as admin_email,
  au.role,
  au.is_active
FROM public.admin_users au
WHERE au.email = 'admin@gidipin.work';
