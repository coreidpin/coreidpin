-- Create identity_users record for the admin user
-- This is required for OTP authentication to work

-- First, we need to hash the email the same way the backend does
-- The backend uses: hashData(contact, SERVER_SALT)
-- For now, let's insert a placeholder and the backend will handle the hash

-- Check if record exists
SELECT * FROM identity_users WHERE user_id = '271be42e-f87e-4eb2-a02a-0100b135c276';

-- If no record exists, insert it
-- Note: The phone_hash should match what the OTP system generates
-- For email admin@gidipin.work, we need the proper hash
-- The backend will create this automatically when we use create_account=true

-- So let's use create_account=true in the frontend instead
