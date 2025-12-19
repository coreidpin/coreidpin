-- Check if admin@gidipin.work exists in auth.users
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  last_sign_in_at
FROM auth.users
WHERE email = 'admin@gidipin.work';

-- If the above returns no rows, you need to create the user first via OTP
-- or manually in Supabase Dashboard
