-- Enable public read access to professional_pins for verification
DROP POLICY IF EXISTS "Users can view their own PIN" ON public.professional_pins;

CREATE POLICY "Anyone can verify PINs"
    ON public.professional_pins FOR SELECT
    USING (true);

-- Ensure profiles are visible for verification
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);
