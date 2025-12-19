-- Insert admin record directly (bypassing RLS issues)

INSERT INTO public.admin_users (
  user_id,
  email,
  role,
  permissions,
  is_active,
  created_at,
  updated_at
) VALUES (
  '2f800220-5405-4046-89a4-61afdbf1a5bc',
  'admin@gidipin.work',
  'super_admin',
  '{"users": ["read", "write", "delete"], "logs": ["read", "write", "delete"], "system": ["read", "write", "config"], "admin_users": ["read", "write", "delete"]}'::jsonb,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (user_id) DO UPDATE
SET 
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  permissions = EXCLUDED.permissions,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Verify
SELECT user_id, email, role, is_active FROM public.admin_users;
