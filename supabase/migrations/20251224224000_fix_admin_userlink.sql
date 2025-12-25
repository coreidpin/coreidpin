-- Quick Fix: Get the most recent user ID for admin@gidipin.work and update admin_users
-- This handles the case where OTP creates a new user each time

-- Get the most recent user ID for admin@gidipin.work
WITH latest_user AS (
  SELECT id, email, created_at
  FROM auth.users
  WHERE email = 'admin@gidipin.work'
  ORDER BY created_at DESC
  LIMIT 1
)
-- Update admin_users to point to the most recent user
UPDATE public.admin_users
SET 
  user_id = (SELECT id FROM latest_user),
  updated_at = NOW()
WHERE email = 'admin@gidipin.work';

-- Verify the update
SELECT 
  au.id,
  au.user_id,
  au.email,
  au.role,
  au.is_active,
  au.created_at as admin_created,
  u.id as auth_id,
  u.email as auth_email,
  u.created_at as auth_created
FROM public.admin_users au
LEFT JOIN auth.users u ON u.id = au.user_id
WHERE au.email = 'admin@gidipin.work';
