-- Check if admin_users table has the correct user_id
SELECT 
  au.id,
  au.user_id,
  au.email,
  au.role,
  au.is_active,
  u.email as auth_email
FROM public.admin_users au
LEFT JOIN auth.users u ON u.id = au.user_id
WHERE au.email = 'admin@gidipin.work';

-- If user_id doesn't match, update it:
-- UPDATE public.admin_users 
-- SET user_id = '271be42e-f87e-4eb2-a02a-0100b135c276'
-- WHERE email = 'admin@gidipin.work';
