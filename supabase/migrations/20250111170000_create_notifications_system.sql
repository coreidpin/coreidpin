-- Create Notifications System
-- Migration: 20250111170000_create_notifications_system.sql

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('success', 'alert', 'info', 'warning')),
    category TEXT NOT NULL CHECK (category IN ('notification', 'announcement')) DEFAULT 'notification',
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    is_new BOOLEAN DEFAULT true,
    action_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ,
    CONSTRAINT valid_notification CHECK (char_length(title) > 0 AND char_length(message) > 0)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_category ON public.notifications(category);

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see their own notifications
CREATE POLICY "Users can view own notifications"
    ON public.notifications
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
    ON public.notifications
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
    ON public.notifications
    FOR INSERT
    WITH CHECK (true); -- Allow system to create notifications for any user

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(notification_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.notifications
    SET is_read = true,
        is_new = false,
        read_at = NOW()
    WHERE id = notification_id
      AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark all notifications as read
CREATE OR REPLACE FUNCTION mark_all_notifications_read()
RETURNS VOID AS $$
BEGIN
    UPDATE public.notifications
    SET is_read = true,
        is_new = false,
        read_at = NOW()
    WHERE user_id = auth.uid()
      AND is_read = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread count
CREATE OR REPLACE FUNCTION get_unread_notification_count()
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM public.notifications
        WHERE user_id = auth.uid()
          AND is_read = false
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function to create notification on endorsement request
CREATE OR REPLACE FUNCTION notify_endorsement_request()
RETURNS TRIGGER AS $$
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
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for endorsement requests (only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'endorsement_requests') THEN
        DROP TRIGGER IF EXISTS endorsement_request_notification ON public.endorsement_requests;
        CREATE TRIGGER endorsement_request_notification
            AFTER INSERT ON public.endorsement_requests
            FOR EACH ROW
            EXECUTE FUNCTION notify_endorsement_request();
    END IF;
END $$;

-- Trigger function to notify on endorsement acceptance
CREATE OR REPLACE FUNCTION notify_endorsement_accepted()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
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
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for endorsement acceptance (only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'endorsements') THEN
        DROP TRIGGER IF EXISTS endorsement_accepted_notification ON public.endorsements;
        CREATE TRIGGER endorsement_accepted_notification
            AFTER UPDATE ON public.endorsements
            FOR EACH ROW
            WHEN (NEW.status = 'accepted' AND OLD.status IS DISTINCT FROM 'accepted')
            EXECUTE FUNCTION notify_endorsement_accepted();
    END IF;
END $$;

-- Trigger function to notify on work verification
CREATE OR REPLACE FUNCTION notify_work_verification()
RETURNS TRIGGER AS $$
DECLARE
    user_record RECORD;
BEGIN
    IF NEW.verification_status = 'verified' AND (OLD.verification_status IS NULL OR OLD.verification_status != 'verified') THEN
        -- Get user_id from work_experiences table
        SELECT user_id INTO user_record FROM public.work_experiences WHERE id = NEW.id;
        
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
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for work verification (only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'work_experiences') THEN
        DROP TRIGGER IF EXISTS work_verification_notification ON public.work_experiences;
        CREATE TRIGGER work_verification_notification
            AFTER UPDATE ON public.work_experiences
            FOR EACH ROW
            WHEN (NEW.verification_status = 'verified' AND OLD.verification_status IS DISTINCT FROM 'verified')
            EXECUTE FUNCTION notify_work_verification();
    END IF;
END $$;

-- Function to create system announcement
CREATE OR REPLACE FUNCTION create_announcement(
    p_title TEXT,
    p_message TEXT,
    p_type TEXT DEFAULT 'info'
)
RETURNS UUID AS $$
DECLARE
    announcement_id UUID;
BEGIN
    -- Create announcement for all users
    INSERT INTO public.notifications (user_id, type, category, title, message, metadata)
    SELECT 
        id,
        p_type,
        'announcement',
        p_title,
        p_message,
        jsonb_build_object('is_global', true)
    FROM auth.users
    RETURNING id INTO announcement_id;
    
    RETURN announcement_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments
COMMENT ON TABLE public.notifications IS 'Stores user notifications and system announcements';
COMMENT ON FUNCTION mark_notification_read(UUID) IS 'Mark a single notification as read';
COMMENT ON FUNCTION mark_all_notifications_read() IS 'Mark all user notifications as read';
COMMENT ON FUNCTION get_unread_notification_count() IS 'Get count of unread notifications for current user';
COMMENT ON FUNCTION create_announcement(TEXT, TEXT, TEXT) IS 'Create system-wide announcement for all users';
