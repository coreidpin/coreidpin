-- ============================================================================
-- Migration: Refined Profile Completion Logic
-- Date: 2024-12-18
-- ============================================================================
-- Update the calculate_profile_completion function to be more robust
-- and mirror the refined TypeScript logic.
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_profile_completion(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    completion INTEGER := 0;
    total_fields INTEGER := 12;
    completed_fields INTEGER := 0;
    p_profile RECORD;
    has_work_history BOOLEAN;
BEGIN
    -- 1. Fetch the profile
    SELECT * INTO p_profile FROM profiles WHERE user_id = p_user_id;
    
    IF NOT FOUND THEN
        RETURN 0;
    END IF;

    -- 2. Check each field (mirroring the 12-field logic in TypeScript)
    
    -- Field 1: Full Name
    IF (p_profile.full_name IS NOT NULL AND p_profile.full_name != '') OR 
       (p_profile.name IS NOT NULL AND p_profile.name != '') THEN
        completed_fields := completed_fields + 1;
    END IF;

    -- Field 2: Job Title
    IF (p_profile.job_title IS NOT NULL AND p_profile.job_title != '') OR 
       (p_profile.role IS NOT NULL AND p_profile.role != '') THEN
        completed_fields := completed_fields + 1;
    END IF;

    -- Field 3: Email
    IF (p_profile.email IS NOT NULL AND p_profile.email != '') THEN
        completed_fields := completed_fields + 1;
    END IF;

    -- Field 4: Phone
    IF (p_profile.phone IS NOT NULL AND p_profile.phone != '') THEN
        completed_fields := completed_fields + 1;
    END IF;

    -- Field 5: Bio
    IF (p_profile.bio IS NOT NULL AND p_profile.bio != '') THEN
        completed_fields := completed_fields + 1;
    END IF;

    -- Field 6: Skills (JSONB array check)
    IF (p_profile.skills IS NOT NULL AND jsonb_array_length(p_profile.skills) > 0) THEN
        completed_fields := completed_fields + 1;
    END IF;

    -- Field 7: LinkedIn
    IF (p_profile.linkedin_url IS NOT NULL AND p_profile.linkedin_url != '') THEN
        completed_fields := completed_fields + 1;
    END IF;

    -- Field 8: Location
    IF (p_profile.city IS NOT NULL AND p_profile.city != '') OR 
       (p_profile.location IS NOT NULL AND p_profile.location != '') THEN
        completed_fields := completed_fields + 1;
    END IF;

    -- Field 9: Profile Picture
    IF (p_profile.profile_picture_url IS NOT NULL AND p_profile.profile_picture_url != '') THEN
        completed_fields := completed_fields + 1;
    END IF;

    -- Field 10: Years of Experience
    IF (p_profile.years_of_experience IS NOT NULL) THEN
        completed_fields := completed_fields + 1;
    END IF;

    -- Field 11: Work History (Check joined table)
    SELECT EXISTS (SELECT 1 FROM work_experiences WHERE user_id = p_user_id) INTO has_work_history;
    IF has_work_history THEN
        completed_fields := completed_fields + 1;
    END IF;

    -- Field 12: Portfolio
    IF (p_profile.portfolio_url IS NOT NULL AND p_profile.portfolio_url != '') OR 
       (p_profile.website IS NOT NULL AND p_profile.website != '') OR
       (p_profile.github_url IS NOT NULL AND p_profile.github_url != '') THEN
        completed_fields := completed_fields + 1;
    END IF;

    -- 3. Calculate percentage
    completion := ROUND((completed_fields::DECIMAL / total_fields::DECIMAL) * 100);

    -- 4. Update the profile
    UPDATE profiles
    SET profile_completion_percentage = completion,
        profile_complete = (completion >= 100),
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    RETURN completion;
END;
$$;

-- Add a trigger to automatically update completion when a profile is updated
CREATE OR REPLACE FUNCTION trigger_update_profile_completion()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM calculate_profile_completion(NEW.user_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_update_profile_completion ON profiles;
CREATE TRIGGER tr_update_profile_completion
    AFTER INSERT OR UPDATE OF full_name, name, job_title, role, email, phone, bio, skills, linkedin_url, city, location, profile_picture_url, years_of_experience, portfolio_url, website, github_url
    ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_profile_completion();

-- Also add a trigger for work_experiences
CREATE OR REPLACE FUNCTION trigger_update_profile_completion_work()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM calculate_profile_completion(OLD.user_id);
        RETURN OLD;
    ELSE
        PERFORM calculate_profile_completion(NEW.user_id);
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_update_profile_completion_work ON work_experiences;
CREATE TRIGGER tr_update_profile_completion_work
    AFTER INSERT OR UPDATE OR DELETE
    ON work_experiences
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_profile_completion_work();
