-- Professional PIN System Migration
-- Created: 2025-11-11
-- Description: Complete schema for Professional Identity Numbers (PINs)

-- ============================================================================
-- CORE PIN TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.professional_pins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pin_number TEXT UNIQUE NOT NULL,
  verification_status TEXT CHECK (verification_status IN ('verified', 'pending', 'unverified')) DEFAULT 'pending',
  verification_date TIMESTAMPTZ,
  trust_score INTEGER CHECK (trust_score >= 0 AND trust_score <= 100) DEFAULT 20,
  endorsements_count INTEGER DEFAULT 0,
  projects_completed INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  total_shares INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_pins_user_id ON public.professional_pins(user_id);
CREATE INDEX IF NOT EXISTS idx_pins_pin_number ON public.professional_pins(pin_number);
CREATE INDEX IF NOT EXISTS idx_pins_verification_status ON public.professional_pins(verification_status);

-- Ensure one PIN per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_pins_one_per_user ON public.professional_pins(user_id);

-- ============================================================================
-- EXPERIENCES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.pin_experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pin_id UUID NOT NULL REFERENCES public.professional_pins(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  duration TEXT,
  description TEXT,
  verified BOOLEAN DEFAULT FALSE,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pin_experiences_pin_id ON public.pin_experiences(pin_id);

-- ============================================================================
-- SKILLS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.pin_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pin_id UUID NOT NULL REFERENCES public.professional_pins(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  skill_level TEXT CHECK (skill_level IN ('Beginner', 'Intermediate', 'Advanced', 'Expert')) DEFAULT 'Intermediate',
  verified BOOLEAN DEFAULT FALSE,
  verified_source TEXT, -- 'linkedin', 'github', 'manual', 'ai_analysis'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pin_skills_pin_id ON public.pin_skills(pin_id);

-- ============================================================================
-- LINKED ACCOUNTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.pin_linked_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pin_id UUID NOT NULL REFERENCES public.professional_pins(id) ON DELETE CASCADE,
  platform TEXT CHECK (platform IN ('linkedin', 'github', 'portfolio')) NOT NULL,
  url TEXT NOT NULL,
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  last_synced TIMESTAMPTZ,
  UNIQUE(pin_id, platform)
);

CREATE INDEX IF NOT EXISTS idx_pin_linked_accounts_pin_id ON public.pin_linked_accounts(pin_id);

-- ============================================================================
-- ANALYTICS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.pin_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pin_id UUID NOT NULL REFERENCES public.professional_pins(id) ON DELETE CASCADE,
  event_type TEXT CHECK (event_type IN ('view', 'share', 'copy', 'download')) NOT NULL,
  viewer_id UUID REFERENCES auth.users(id),
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pin_analytics_pin_id ON public.pin_analytics(pin_id);
CREATE INDEX IF NOT EXISTS idx_pin_analytics_created_at ON public.pin_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_pin_analytics_event_type ON public.pin_analytics(event_type);

-- ============================================================================
-- VERIFICATION QUEUE TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.pin_verification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pin_id UUID NOT NULL REFERENCES public.professional_pins(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  linkedin_url TEXT,
  github_url TEXT,
  portfolio_url TEXT,
  status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
  error_message TEXT,
  queued_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_verification_queue_status ON public.pin_verification_queue(status);
CREATE INDEX IF NOT EXISTS idx_verification_queue_pin_id ON public.pin_verification_queue(pin_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.professional_pins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pin_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pin_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pin_linked_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pin_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pin_verification_queue ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES FOR PROFESSIONAL_PINS
-- ============================================================================

DO $$
BEGIN
  -- Users can read their own PIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy p
    JOIN pg_class c ON c.oid = p.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE p.polname = 'select_own_pin'
      AND n.nspname = 'public'
      AND c.relname = 'professional_pins'
  ) THEN
    EXECUTE 'CREATE POLICY select_own_pin ON public.professional_pins FOR SELECT USING (auth.uid() = user_id)';
  END IF;

  -- Anyone can read verified public PINs
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy p
    JOIN pg_class c ON c.oid = p.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE p.polname = 'select_verified_pins'
      AND n.nspname = 'public'
      AND c.relname = 'professional_pins'
  ) THEN
    EXECUTE 'CREATE POLICY select_verified_pins ON public.professional_pins FOR SELECT USING (verification_status = ''verified'')';
  END IF;

  -- Users can update their own PIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy p
    JOIN pg_class c ON c.oid = p.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE p.polname = 'update_own_pin'
      AND n.nspname = 'public'
      AND c.relname = 'professional_pins'
  ) THEN
    EXECUTE 'CREATE POLICY update_own_pin ON public.professional_pins FOR UPDATE USING (auth.uid() = user_id)';
  END IF;

  -- Service role can insert PINs
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy p
    JOIN pg_class c ON c.oid = p.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE p.polname = 'insert_service_role_pins'
      AND n.nspname = 'public'
      AND c.relname = 'professional_pins'
  ) THEN
    EXECUTE 'CREATE POLICY insert_service_role_pins ON public.professional_pins FOR INSERT WITH CHECK (auth.role() = ''service_role'')';
  END IF;
END $$;

-- ============================================================================
-- RLS POLICIES FOR RELATED TABLES
-- ============================================================================

DO $$
BEGIN
  -- PIN Experiences: Users can read experiences for their own PIN or public verified PINs
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy p
    JOIN pg_class c ON c.oid = p.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE p.polname = 'select_pin_experiences'
      AND n.nspname = 'public'
      AND c.relname = 'pin_experiences'
  ) THEN
    EXECUTE 'CREATE POLICY select_pin_experiences ON public.pin_experiences FOR SELECT USING (
      pin_id IN (
        SELECT id FROM public.professional_pins 
        WHERE user_id = auth.uid() OR verification_status = ''verified''
      )
    )';
  END IF;

  -- PIN Skills
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy p
    JOIN pg_class c ON c.oid = p.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE p.polname = 'select_pin_skills'
      AND n.nspname = 'public'
      AND c.relname = 'pin_skills'
  ) THEN
    EXECUTE 'CREATE POLICY select_pin_skills ON public.pin_skills FOR SELECT USING (
      pin_id IN (
        SELECT id FROM public.professional_pins 
        WHERE user_id = auth.uid() OR verification_status = ''verified''
      )
    )';
  END IF;

  -- PIN Linked Accounts
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy p
    JOIN pg_class c ON c.oid = p.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE p.polname = 'select_pin_linked_accounts'
      AND n.nspname = 'public'
      AND c.relname = 'pin_linked_accounts'
  ) THEN
    EXECUTE 'CREATE POLICY select_pin_linked_accounts ON public.pin_linked_accounts FOR SELECT USING (
      pin_id IN (
        SELECT id FROM public.professional_pins 
        WHERE user_id = auth.uid() OR verification_status = ''verified''
      )
    )';
  END IF;

  -- PIN Analytics: Users can only read their own analytics
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy p
    JOIN pg_class c ON c.oid = p.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE p.polname = 'select_own_analytics'
      AND n.nspname = 'public'
      AND c.relname = 'pin_analytics'
  ) THEN
    EXECUTE 'CREATE POLICY select_own_analytics ON public.pin_analytics FOR SELECT USING (
      pin_id IN (SELECT id FROM public.professional_pins WHERE user_id = auth.uid())
    )';
  END IF;

  -- Service role can insert analytics
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy p
    JOIN pg_class c ON c.oid = p.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE p.polname = 'insert_analytics_service'
      AND n.nspname = 'public'
      AND c.relname = 'pin_analytics'
  ) THEN
    EXECUTE 'CREATE POLICY insert_analytics_service ON public.pin_analytics FOR INSERT WITH CHECK (true)';
  END IF;

  -- Verification Queue: Service role only
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy p
    JOIN pg_class c ON c.oid = p.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE p.polname = 'service_role_verification_queue'
      AND n.nspname = 'public'
      AND c.relname = 'pin_verification_queue'
  ) THEN
    EXECUTE 'CREATE POLICY service_role_verification_queue ON public.pin_verification_queue FOR ALL USING (auth.role() = ''service_role'')';
  END IF;

  -- Service role can insert into related tables
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy p
    JOIN pg_class c ON c.oid = p.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE p.polname = 'insert_experiences_service'
      AND n.nspname = 'public'
      AND c.relname = 'pin_experiences'
  ) THEN
    EXECUTE 'CREATE POLICY insert_experiences_service ON public.pin_experiences FOR INSERT WITH CHECK (auth.role() = ''service_role'')';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policy p
    JOIN pg_class c ON c.oid = p.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE p.polname = 'insert_skills_service'
      AND n.nspname = 'public'
      AND c.relname = 'pin_skills'
  ) THEN
    EXECUTE 'CREATE POLICY insert_skills_service ON public.pin_skills FOR INSERT WITH CHECK (auth.role() = ''service_role'')';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policy p
    JOIN pg_class c ON c.oid = p.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE p.polname = 'insert_linked_accounts_service'
      AND n.nspname = 'public'
      AND c.relname = 'pin_linked_accounts'
  ) THEN
    EXECUTE 'CREATE POLICY insert_linked_accounts_service ON public.pin_linked_accounts FOR INSERT WITH CHECK (auth.role() = ''service_role'')';
  END IF;
END $$;

-- ============================================================================
-- TRIGGER FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_pins_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_pins_updated_at ON public.professional_pins;
CREATE TRIGGER trg_pins_updated_at
BEFORE UPDATE ON public.professional_pins
FOR EACH ROW EXECUTE FUNCTION public.update_pins_updated_at();

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE public.professional_pins IS 'Core table storing Professional Identity Numbers (PINs) for verified professionals';
COMMENT ON TABLE public.pin_experiences IS 'Work experience entries linked to professional PINs';
COMMENT ON TABLE public.pin_skills IS 'Skills and expertise linked to professional PINs';
COMMENT ON TABLE public.pin_linked_accounts IS 'External account connections (LinkedIn, GitHub, Portfolio)';
COMMENT ON TABLE public.pin_analytics IS 'Analytics events for PIN views, shares, and interactions';
COMMENT ON TABLE public.pin_verification_queue IS 'Queue for background AI verification of PIN credentials';
