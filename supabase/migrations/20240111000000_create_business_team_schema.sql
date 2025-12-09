-- Create business_members table for Team Management
CREATE TABLE IF NOT EXISTS public.business_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Nullable for pending invites
    email TEXT NOT NULL,
    role TEXT DEFAULT 'member', -- owner, admin, member
    status TEXT DEFAULT 'pending', -- pending, active
    invite_token TEXT DEFAULT encode(gen_random_bytes(32), 'hex'),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(business_id, email)
);

-- RLS for business_members
ALTER TABLE public.business_members ENABLE ROW LEVEL SECURITY;

-- 1. Owners/Admins can view members of their business
-- (Requires recursive check or helper function, doing simplified version first)
-- Actually, we can check if auth.uid() is the owner of business_profile linked to business_id

CREATE OR REPLACE FUNCTION public.is_business_admin(business_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.business_profiles
    WHERE id = business_uuid AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Business admins can manage members"
    ON public.business_members
    USING (public.is_business_admin(business_id));

-- 2. Members can view their own membership
CREATE POLICY "Members can view own membership"
    ON public.business_members FOR SELECT
    USING (auth.uid() = user_id OR email = (select email from auth.users where id = auth.uid()));

