-- Solution: Delete the placeholder user and use the original admin@gidipin.work user

-- Step 1: Delete the placeholder user (created by OTP)
DELETE FROM auth.users WHERE id = '270d3228-b913-4d2a-aa7e-50c84a6262d3';

-- Step 2: Update admin_users to point to the ORIGINAL user
UPDATE public.admin_users 
SET user_id = '271be42e-f87e-4eb2-a02a-0100b135c276',
    updated_at = NOW()
WHERE email = 'admin@gidipin.work';

-- Step 3: Verify
SELECT 
  au.user_id,
  au.email,
  au.role,
  u.email as auth_email
FROM public.admin_users au
JOIN auth.users u ON u.id = au.user_id
WHERE au.email = 'admin@gidipin.work';
