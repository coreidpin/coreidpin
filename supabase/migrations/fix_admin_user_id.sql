-- Update admin_users to point to the newly created user
UPDATE public.admin_users 
SET user_id = '270d3228-b913-4d2a-aa7e-50c84a6262d3',
    updated_at = NOW()
WHERE email = 'admin@gidipin.work';

-- Verify the update
SELECT 
  au.id,
  au.user_id,
  au.email,
  au.role,
  au.is_active
FROM public.admin_users au
WHERE au.email = 'admin@gidipin.work';

-- Also check what email the new auth user has
SELECT id, email, created_at 
FROM auth.users 
WHERE id = '270d3228-b913-4d2a-aa7e-50c84a6262d3';
