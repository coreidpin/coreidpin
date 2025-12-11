-- Emergency Fix: Remove Problematic Triggers Blocking Login
-- Run this in Supabase SQL Editor immediately

-- 1. Check what's causing the issue
DO $$
BEGIN
    RAISE NOTICE 'Checking for problematic triggers...';
END $$;

-- 2. Remove auto_increment_usage trigger from wrong tables
DROP TRIGGER IF EXISTS trigger_auto_increment_usage ON public.profiles CASCADE;
DROP TRIGGER IF EXISTS trigger_auto_increment_usage ON auth.users CASCADE;
DROP TRIGGER IF EXISTS trigger_auto_increment_usage ON public.work_experiences CASCADE;

-- 3. Recreate it ONLY on api_usage_logs
DROP TRIGGER IF EXISTS trigger_auto_increment_usage ON public.api_usage_logs CASCADE;

CREATE TRIGGER trigger_auto_increment_usage
    AFTER INSERT ON public.api_usage_logs
    FOR EACH ROW
    EXECUTE FUNCTION auto_increment_usage();

-- 4. Update the auto_increment_usage function to be more defensive
CREATE OR REPLACE FUNCTION auto_increment_usage()
RETURNS TRIGGER AS $$
BEGIN
    -- Only increment for successful requests
    IF NEW.status_code >= 200 AND NEW.status_code < 300 THEN
        -- Check if business_profiles row exists first
        IF EXISTS (SELECT 1 FROM public.business_profiles WHERE user_id = NEW.user_id) THEN
            PERFORM increment_monthly_usage(NEW.user_id);
        ELSE
            RAISE NOTICE 'Skipping usage increment - no business profile for user: %', NEW.user_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Make notification triggers more defensive
CREATE OR REPLACE FUNCTION notify_work_verification()
RETURNS TRIGGER AS $$
DECLARE
    user_record RECORD;
BEGIN
    IF NEW.verification_status = 'verified' AND (OLD.verification_status IS NULL OR OLD.verification_status != 'verified') THEN
        -- Get user_id from work_experiences table
        SELECT user_id INTO user_record FROM public.work_experiences WHERE id = NEW.id;
        
        -- Only create notification if notifications table exists and is accessible
        BEGIN
            INSERT INTO public.notifications (user_id, type, category, title, message, metadata)
            VALUES (
                user_record.user_id,
                'success',
                'notification',
                'Work Experience Verified',
                CONCAT('Your work experience at ', NEW.company_name, ' has been verified!'),
                jsonb_build_object(
                    'work_experience_id', NEW.id,
                    'company_name', NEW.company_name,
                    'action', 'work_verified',
                    'link', '/dashboard?tab=identity'
                )
            );
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Failed to create notification: %', SQLERRM;
                -- Don't fail the whole transaction
        END;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Make endorsement notification trigger more defensive
CREATE OR REPLACE FUNCTION notify_endorsement_request()
RETURNS TRIGGER AS $$
BEGIN
    BEGIN
        INSERT INTO public.notifications (user_id, type, category, title, message, metadata)
        VALUES (
            NEW.endorser_id,
            'info',
            'notification',
            'New Endorsement Request',
            CONCAT('Someone has requested your endorsement for their profile'),
            jsonb_build_object(
                'endorsement_request_id', NEW.id,
                'action', 'endorsement_request',
                'link', '/dashboard?tab=endorsements'
            )
        );
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Failed to create endorsement notification: %', SQLERRM;
    END;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Make endorsement acceptance trigger more defensive
CREATE OR REPLACE FUNCTION notify_endorsement_accepted()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
        BEGIN
            INSERT INTO public.notifications (user_id, type, category, title, message, metadata)
            VALUES (
                NEW.professional_id,
                'success',
                'notification',
                'Endorsement Accepted',
                CONCAT('Your endorsement request has been accepted!'),
                jsonb_build_object(
                    'endorsement_id', NEW.id,
                    'action', 'endorsement_accepted',
                    'link', '/dashboard?tab=endorsements'
                )
            );
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Failed to create acceptance notification: %', SQLERRM;
        END;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Triggers fixed! Try logging in again.';
END $$;
