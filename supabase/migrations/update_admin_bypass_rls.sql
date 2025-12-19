-- Disable RLS temporarily to update admin_users
ALTER TABLE public.admin_users DISABLE ROW LEVEL SECURITY;

-- Update admin_users
UPDATE public.admin_users 
SET user_id = '2f800220-5405-4046-89a4-61afdbf1a5bc',
    updated_at = NOW()
WHERE email = 'admin@gidipin.work';

-- Re-enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Verify
SELECT user_id, email, role, is_active 
FROM public.admin_users 
WHERE email = 'admin@gidipin.work';
