-- Create RPC function to log admin actions (bypasses RLS)
CREATE OR REPLACE FUNCTION log_admin_action(
  p_action TEXT,
  p_target TEXT,
  p_status TEXT DEFAULT 'success',
  p_details JSONB DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_log_id UUID;
BEGIN
  -- Get current user ID from auth context
  v_user_id := auth.uid();
  
  -- Insert audit log
  INSERT INTO public.admin_audit_logs (
    action,
    target,
    actor_id,
    status,
    details,
    created_at
  ) VALUES (
    p_action,
    p_target,
    v_user_id,
    p_status,
    p_details,
    NOW()
  )
  RETURNING id INTO v_log_id;
  
  RETURN jsonb_build_object('success', true, 'log_id', v_log_id);
END;
$$;
