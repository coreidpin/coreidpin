-- CORRECT ORDER: Delete old users FIRST, then update new one

-- Step 1: Delete ALL old users (keep only the newest)
DELETE FROM auth.users 
WHERE id IN ('271be42e-f87e-4eb2-a02a-0100b135c276', '270d3228-b913-4d2a-aa7e-50c84a6262d3')
  OR (email LIKE '%passwordless%' AND id != '2f800220-5405-4046-89a4-61afdbf1a5bc');

-- Step 2: Now update the new user's email
UPDATE auth.users 
SET email = 'admin@gidipin.work',
    email_confirmed_at = NOW()
WHERE id = '2f800220-5405-4046-89a4-61afdbf1a5bc';

-- Step 3: Update admin_users to point to this user
UPDATE public.admin_users 
SET user_id = '2f800220-5405-4046-89a4-61afdbf1a5bc',
    updated_at = NOW()
WHERE email = 'admin@gidipin.work';

-- Step 4: Verify
SELECT 
  au.user_id,
  au.email as admin_email,
  au.role,
  u.email as auth_email
FROM public.admin_users au
JOIN auth.users u ON u.id = au.user_id
WHERE au.email = 'admin@gidipin.work';
