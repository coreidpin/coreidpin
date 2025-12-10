ALTER TABLE public.pin_verifications 
DROP CONSTRAINT IF EXISTS pin_verifications_verifier_type_check;

ALTER TABLE public.pin_verifications 
ADD CONSTRAINT pin_verifications_verifier_type_check 
CHECK (verifier_type IN ('employer', 'university', 'business', 'admin'));
