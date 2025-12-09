-- Function to handle new business user creation automatically
CREATE OR REPLACE FUNCTION public.handle_new_business_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if user is a business user
  -- Note: We check if userType is 'business'. 
  -- If companyName isn't provided in metadata, we default to a placeholder so the row is created.
  IF (new.raw_user_meta_data->>'userType') = 'business' THEN
    INSERT INTO public.business_profiles (
      user_id, 
      company_name, 
      industry, 
      website,
      company_email
    )
    VALUES (
      new.id,
      COALESCE(new.raw_user_meta_data->>'companyName', new.raw_user_meta_data->>'name' || '''s Business', 'My Business Profile'),
      new.raw_user_meta_data->>'industry',
      new.raw_user_meta_data->>'website',
      new.email
    )
    ON CONFLICT (user_id) DO NOTHING; -- Avoid error if already exists
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to run after a new user is inserted into auth.users
DROP TRIGGER IF EXISTS on_auth_user_created_business ON auth.users;
CREATE TRIGGER on_auth_user_created_business
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_business_user();
