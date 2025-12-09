-- Add missing INSERT policy for business_profiles
-- This allows authenticated users to create their own business profile
CREATE POLICY "Businesses can create own profile"
    ON public.business_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);
