-- Seed Admin User
-- This script creates the first super admin user for the system
-- Run this after creating the admin user in Supabase Auth dashboard or via OTP

-- First, ensure a user with admin@gidipin.work exists in auth.users
-- You should create this user manually in Supabase dashboard or via OTP first

-- Then run this to grant them super admin privileges:
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
  updated_at = NOW();

-- Verify the admin was created
SELECT 
  au.id,
  au.email,
  au.role,
  au.is_active,
  au.created_at
FROM public.admin_users au
WHERE au.email = 'admin@gidipin.work';
