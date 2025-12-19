-- Fix admin_users table - Add missing email column if table exists
-- Or drop and recreate if needed

-- First, check if table exists and drop it to start fresh
DROP TABLE IF EXISTS public.admin_users CASCADE;

-- Create the admin_users table with correct schema
CREATE TABLE public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'moderator')),
  permissions JSONB DEFAULT '{"users": ["read"], "logs": ["read"], "system": []}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.admin_users(id),
  last_login_at TIMESTAMPTZ,
  
  UNIQUE(user_id),
  UNIQUE(email)
);

-- Create indexes
CREATE INDEX idx_admin_users_user_id ON public.admin_users(user_id);
CREATE INDEX idx_admin_users_email ON public.admin_users(email);
CREATE INDEX idx_admin_users_is_active ON public.admin_users(is_active);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can view admin records"
  ON public.admin_users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE au.user_id = auth.uid()
        AND au.is_active = true
    )
  );

CREATE POLICY "Super admins can insert admin users"
  ON public.admin_users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE au.user_id = auth.uid()
        AND au.role = 'super_admin'
        AND au.is_active = true
    )
  );

CREATE POLICY "Admins can update admin records"
  ON public.admin_users
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE au.user_id = auth.uid()
        AND au.role IN ('super_admin', 'admin')
        AND au.is_active = true
    )
  )
  WITH CHECK (
    (user_id != auth.uid() OR (role = (SELECT role FROM public.admin_users WHERE user_id = auth.uid())))
  );

CREATE POLICY "Super admins can delete admin users"
  ON public.admin_users
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE au.user_id = auth.uid()
        AND au.role = 'super_admin'
        AND au.is_active = true
    )
    AND user_id != auth.uid()
  );

-- Helper functions
CREATE OR REPLACE FUNCTION update_admin_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_admin_users_updated_at_trigger
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_users_updated_at();

CREATE OR REPLACE FUNCTION update_admin_last_login(admin_user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.admin_users
  SET last_login_at = NOW()
  WHERE user_id = admin_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT SELECT ON public.admin_users TO authenticated;
GRANT ALL ON public.admin_users TO service_role;
