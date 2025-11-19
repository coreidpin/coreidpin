DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'audit_events_event_type_check'
      AND table_name = 'audit_events'
      AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.audit_events DROP CONSTRAINT audit_events_event_type_check;
  END IF;
END $$;

ALTER TABLE public.audit_events
  ADD CONSTRAINT audit_events_event_type_check
  CHECK (
    event_type IN (
      'otp_sent',
      'otp_verified',
      'otp_failed',
      'registration_started',
      'registration_finalized',
      'profile_saved',
      'pin_issued',
      'welcome_email_sent',
      'welcome_email_failed',
      'email_verification_sent',
      'email_verified'
    )
  );
