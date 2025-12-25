-- Grant Admin Access to admin@gidipin.work
-- Run this in Supabase SQL Editor to grant admin privileges

-- Link the existing auth user to admin_users table
INSERT INTO public.admin_users (user_id, email, role, permissions, is_active, created_at, updated_at)
SELECT 
  u.id,
  'admin@gidipin.work',
  'super_admin',
  '{"users": ["read", "write", "delete"], "logs": ["read", "write", "delete"], "system": ["read", "write", "config"], "admin_users": ["read", "write", "delete"]}'::jsonb,
  true,
  NOW(),
  NOW()
FROM auth.users u
WHERE u.email = 'admin@gidipin.work'
ON CONFLICT (user_id) DO UPDATE
SET 
  role = EXCLUDED.role,
  permissions = EXCLUDED.permissions,
  is_active = EXCLUDED.is_active,
  email = EXCLUDED.email,
  updated_at = NOW();

-- Verify it worked
SELECT 
  au.id,
  au.user_id,
  au.email,
  au.role,
  au.is_active,
  au.created_at,
  u.email as auth_email,
  u.id as auth_id
FROM public.admin_users au
LEFT JOIN auth.users u ON u.id = au.user_id
WHERE au.email = 'admin@gidipin.work';
