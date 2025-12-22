-- Function to get endorsement details by token (bypassing RLS for anonymous endorsers)
CREATE OR REPLACE FUNCTION public.get_endorsement_by_token(token_input TEXT)
RETURNS TABLE (
    id UUID,
    professional_id UUID,
    endorser_name TEXT,
    endorser_email TEXT,
    endorser_role TEXT,
    endorser_company TEXT,
    endorser_linkedin_url TEXT,
    project_context TEXT,
    skills_endorsed TEXT[],
    status TEXT,
    verification_expires_at TIMESTAMPTZ,
    metadata JSONB,
    professional_name TEXT,
    professional_avatar_url TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id,
        e.professional_id,
        e.endorser_name,
        e.endorser_email,
        e.endorser_role,
        e.endorser_company,
        e.endorser_linkedin_url,
        e.project_context,
        e.skills_endorsed,
        e.status,
        e.verification_expires_at,
        e.metadata,
        (p.raw_user_meta_data->>'name')::TEXT as professional_name,
        (p.raw_user_meta_data->>'avatar_url')::TEXT as professional_avatar_url
    FROM public.professional_endorsements_v2 e
    JOIN auth.users p ON e.professional_id = p.id
    WHERE e.verification_token = token_input
    AND e.status = 'requested';
END;
$$;

-- Function to submit endorsement by token
CREATE OR REPLACE FUNCTION public.submit_endorsement_by_token(
    token_input TEXT,
    headline_input TEXT,
    text_input TEXT,
    skills_input TEXT[],
    endorser_name_input TEXT,
    endorser_role_input TEXT,
    endorser_company_input TEXT,
    endorser_linkedin_url_input TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    endorsement_record RECORD;
    updated_record JSONB;
BEGIN
    -- Validations
    SELECT * INTO endorsement_record 
    FROM public.professional_endorsements_v2 
    WHERE verification_token = token_input;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired verification link');
    END IF;

    IF endorsement_record.status <> 'requested' THEN
        RETURN jsonb_build_object('success', false, 'error', 'This endorsement has already been submitted');
    END IF;

    IF endorsement_record.verification_expires_at < NOW() THEN
        RETURN jsonb_build_object('success', false, 'error', 'Verification link has expired');
    END IF;

    -- Update the endorsement
    UPDATE public.professional_endorsements_v2
    SET 
        headline = headline_input,
        text = text_input,
        skills_endorsed = skills_input,
        endorser_name = endorser_name_input,
        endorser_role = endorser_role_input,
        endorser_company = endorser_company_input,
        endorser_linkedin_url = endorser_linkedin_url_input,
        status = 'pending_professional',
        responded_at = NOW(),
        verified = true,
        verified_at = NOW(),
        verification_token = NULL -- Consume the token
    WHERE id = endorsement_record.id
    RETURNING to_jsonb(professional_endorsements_v2.*) INTO updated_record;

    RETURN jsonb_build_object('success', true, 'endorsement', updated_record);
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_endorsement_by_token TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.submit_endorsement_by_token TO anon, authenticated, service_role;
