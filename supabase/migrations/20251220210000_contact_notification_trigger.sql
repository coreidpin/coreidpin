-- Trigger function to notify professional on new lead
CREATE OR REPLACE FUNCTION notify_lead_received()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.notifications (user_id, type, category, title, message, metadata)
    VALUES (
        NEW.professional_id,
        'info',
        'notification',
        'New Inquiry Received',
        CONCAT('You received a new inquiry from ', NEW.sender_name, ' related to ', replace(NEW.inquiry_type, '_', ' ')),
        jsonb_build_object(
            'lead_id', NEW.id,
            'action', 'new_lead',
            'link', '/dashboard?tab=inquiries'
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on job_leads table
DROP TRIGGER IF EXISTS lead_received_notification ON public.job_leads;
CREATE TRIGGER lead_received_notification
    AFTER INSERT ON public.job_leads
    FOR EACH ROW
    EXECUTE FUNCTION notify_lead_received();
