ALTER TABLE public.pin_verifications 
DROP CONSTRAINT IF EXISTS pin_verifications_user_id_fkey;

ALTER TABLE public.pin_verifications 
ADD CONSTRAINT pin_verifications_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
