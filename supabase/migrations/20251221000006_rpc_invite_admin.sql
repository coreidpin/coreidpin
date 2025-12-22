-- Drop and recreate table for pending admin invitations
DROP TABLE IF EXISTS public.admin_invitations CASCADE;

CREATE TABLE public.admin_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL,
  invited_by UUID REFERENCES auth.users(id),
  invitation_token TEXT UNIQUE,
  status TEXT DEFAULT 'pending', -- pending, accepted, expired
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',
  accepted_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.admin_invitations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to make migration re-runnable)
DROP POLICY IF EXISTS "Admins can view invitations" ON public.admin_invitations;
DROP POLICY IF EXISTS "Admins can create invitations" ON public.admin_invitations;

-- RLS policies for admin_invitations
CREATE POLICY "Admins can view invitations"
  ON public.admin_invitations
  FOR SELECT
  USING (true); -- Will check via RPC

CREATE POLICY "Admins can create invitations"
  ON public.admin_invitations
  FOR INSERT
  WITH CHECK (true); -- Will check via RPC

-- Create RPC function to invite admin users (supports both existing and new users)
CREATE OR REPLACE FUNCTION invite_admin_user(
  p_email TEXT,
  p_role TEXT
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_existing_record RECORD;
  v_invitation_token TEXT;
  v_invited_by UUID;
BEGIN
  -- Get the current user (the admin sending the invitation)
  v_invited_by := auth.uid();
  
  -- Check if user already exists in auth.users by email
  SELECT id INTO v_user_id 
  FROM auth.users 
  WHERE email = p_email 
  LIMIT 1;
  
  -- Check if already an admin
  IF v_user_id IS NOT NULL THEN
    SELECT * INTO v_existing_record 
    FROM public.admin_users 
    WHERE user_id = v_user_id;
    
    IF FOUND THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'User is already an administrator'
      );
    END IF;
    
    -- Add existing user as admin
    INSERT INTO public.admin_users (user_id, role, created_at, updated_at)
    VALUES (v_user_id, p_role, NOW(), NOW());
    
    RETURN jsonb_build_object(
      'success', true,
      'message', 'Existing user added as administrator',
      'user_id', v_user_id
    );
  ELSE
    -- User doesn't exist yet, create a pending invitation
    
    -- Check if invitation already exists
    SELECT invitation_token INTO v_invitation_token
    FROM public.admin_invitations
    WHERE email = p_email AND status = 'pending'
    LIMIT 1;
    
    IF v_invitation_token IS NOT NULL THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'An invitation for this email already exists'
      );
    END IF;
    
    -- Create new invitation
    INSERT INTO public.admin_invitations (email, role, invited_by, invitation_token, created_at, expires_at)
    VALUES (p_email, p_role, v_invited_by, gen_random_uuid()::text, NOW(), NOW() + INTERVAL '7 days')
    RETURNING invitation_token INTO v_invitation_token;
    
    RETURN jsonb_build_object(
      'success', true,
      'message', 'Invitation created. User will be granted admin access when they sign up.',
      'email', p_email,
      'invitation_token', v_invitation_token,
      'note', 'Send the user a signup link. They will be automatically made an admin upon registration.'
    );
  END IF;
END;
$$;

