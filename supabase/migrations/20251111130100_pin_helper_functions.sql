-- PIN Helper Functions Migration
-- Created: 2025-11-11
-- Description: Utility functions for PIN number generation, trust score calculation, and analytics

-- ============================================================================
-- FUNCTION: Generate Unique PIN Number
-- ============================================================================

CREATE OR REPLACE FUNCTION public.generate_pin_number()
RETURNS TEXT AS $$
DECLARE
  pin_num TEXT;
  exists_check BOOLEAN;
  attempt_count INTEGER := 0;
  max_attempts INTEGER := 10;
BEGIN
  LOOP
    -- Generate PIN format: PIN-NG-YYYY-XXXXXX (e.g., PIN-NG-2025-A1B2C3)
    pin_num := 'PIN-NG-' || 
               EXTRACT(YEAR FROM NOW())::TEXT || '-' || 
               UPPER(SUBSTR(MD5(RANDOM()::TEXT || NOW()::TEXT), 1, 6));
    
    -- Check if PIN already exists
    SELECT EXISTS(
      SELECT 1 FROM public.professional_pins WHERE pin_number = pin_num
    ) INTO exists_check;
    
    -- Exit loop if unique PIN found
    EXIT WHEN NOT exists_check;
    
    -- Safety check to prevent infinite loop
    attempt_count := attempt_count + 1;
    IF attempt_count >= max_attempts THEN
      RAISE EXCEPTION 'Failed to generate unique PIN after % attempts', max_attempts;
    END IF;
  END LOOP;
  
  RETURN pin_num;
END;
$$ LANGUAGE plpgsql VOLATILE;

COMMENT ON FUNCTION public.generate_pin_number IS 'Generates a unique PIN number in format PIN-NG-YYYY-XXXXXX';

-- ============================================================================
-- FUNCTION: Calculate Trust Score
-- ============================================================================

CREATE OR REPLACE FUNCTION public.calculate_trust_score(p_pin_id UUID)
RETURNS INTEGER AS $$
DECLARE
  base_score INTEGER := 20;
  exp_score INTEGER := 0;
  skill_score INTEGER := 0;
  account_score INTEGER := 0;
  endorsement_score INTEGER := 0;
  total_score INTEGER := 0;
  verified_exp_count INTEGER;
  verified_skill_count INTEGER;
  linked_account_count INTEGER;
  endorsements INTEGER;
BEGIN
  -- Get verified experiences count (up to 30 points, 10 per verified experience)
  SELECT COUNT(*) INTO verified_exp_count
  FROM public.pin_experiences
  WHERE pin_id = p_pin_id AND verified = TRUE;
  exp_score := LEAST(verified_exp_count * 10, 30);
  
  -- Get verified skills count (up to 25 points, 5 per verified skill)
  SELECT COUNT(*) INTO verified_skill_count
  FROM public.pin_skills
  WHERE pin_id = p_pin_id AND verified = TRUE;
  skill_score := LEAST(verified_skill_count * 5, 25);
  
  -- Get linked accounts count (up to 15 points, 5 per platform)
  SELECT COUNT(*) INTO linked_account_count
  FROM public.pin_linked_accounts
  WHERE pin_id = p_pin_id;
  account_score := LEAST(linked_account_count * 5, 15);
  
  -- Get endorsements (up to 10 points, 2 per endorsement)
  SELECT endorsements_count INTO endorsements
  FROM public.professional_pins
  WHERE id = p_pin_id;
  endorsement_score := LEAST((COALESCE(endorsements, 0) * 2), 10);
  
  -- Calculate total (max 100)
  total_score := base_score + exp_score + skill_score + account_score + endorsement_score;
  total_score := LEAST(total_score, 100);
  
  RETURN total_score;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.calculate_trust_score IS 'Calculates PIN trust score (0-100) based on verifications, skills, and endorsements';

-- ============================================================================
-- FUNCTION: Update Trust Score (can be called manually or by triggers)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_pin_trust_score(p_pin_id UUID)
RETURNS INTEGER AS $$
DECLARE
  new_score INTEGER;
BEGIN
  new_score := public.calculate_trust_score(p_pin_id);
  
  UPDATE public.professional_pins
  SET trust_score = new_score,
      updated_at = NOW()
  WHERE id = p_pin_id;
  
  RETURN new_score;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.update_pin_trust_score IS 'Updates the trust score for a PIN and returns the new score';

-- ============================================================================
-- FUNCTION: Increment PIN Views
-- ============================================================================

CREATE OR REPLACE FUNCTION public.increment_pin_views(p_pin_number TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.professional_pins
  SET total_views = total_views + 1,
      updated_at = NOW()
  WHERE pin_number = p_pin_number;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.increment_pin_views IS 'Atomically increments the view count for a PIN';

-- ============================================================================
-- FUNCTION: Increment PIN Shares
-- ============================================================================

CREATE OR REPLACE FUNCTION public.increment_pin_shares(p_pin_number TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.professional_pins
  SET total_shares = total_shares + 1,
      updated_at = NOW()
  WHERE pin_number = p_pin_number;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.increment_pin_shares IS 'Atomically increments the share count for a PIN';

-- ============================================================================
-- TRIGGER: Auto-update trust score when experiences change
-- ============================================================================

CREATE OR REPLACE FUNCTION public.auto_update_trust_on_experience()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.update_pin_trust_score(NEW.pin_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_trust_on_experience ON public.pin_experiences;
CREATE TRIGGER trg_update_trust_on_experience
AFTER INSERT OR UPDATE ON public.pin_experiences
FOR EACH ROW EXECUTE FUNCTION public.auto_update_trust_on_experience();

-- ============================================================================
-- TRIGGER: Auto-update trust score when skills change
-- ============================================================================

CREATE OR REPLACE FUNCTION public.auto_update_trust_on_skill()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.update_pin_trust_score(NEW.pin_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_trust_on_skill ON public.pin_skills;
CREATE TRIGGER trg_update_trust_on_skill
AFTER INSERT OR UPDATE ON public.pin_skills
FOR EACH ROW EXECUTE FUNCTION public.auto_update_trust_on_skill();

-- ============================================================================
-- TRIGGER: Auto-update trust score when linked accounts change
-- ============================================================================

CREATE OR REPLACE FUNCTION public.auto_update_trust_on_account()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.update_pin_trust_score(NEW.pin_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_trust_on_account ON public.pin_linked_accounts;
CREATE TRIGGER trg_update_trust_on_account
AFTER INSERT OR UPDATE ON public.pin_linked_accounts
FOR EACH ROW EXECUTE FUNCTION public.auto_update_trust_on_account();

-- ============================================================================
-- FUNCTION: Get PIN Analytics Summary
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_pin_analytics_summary(p_pin_id UUID)
RETURNS TABLE (
  total_views BIGINT,
  total_shares BIGINT,
  total_copies BIGINT,
  views_last_7_days BIGINT,
  views_last_30_days BIGINT,
  unique_viewers BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE event_type = 'view') AS total_views,
    COUNT(*) FILTER (WHERE event_type = 'share') AS total_shares,
    COUNT(*) FILTER (WHERE event_type = 'copy') AS total_copies,
    COUNT(*) FILTER (WHERE event_type = 'view' AND created_at >= NOW() - INTERVAL '7 days') AS views_last_7_days,
    COUNT(*) FILTER (WHERE event_type = 'view' AND created_at >= NOW() - INTERVAL '30 days') AS views_last_30_days,
    COUNT(DISTINCT viewer_id) FILTER (WHERE viewer_id IS NOT NULL) AS unique_viewers
  FROM public.pin_analytics
  WHERE pin_id = p_pin_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.get_pin_analytics_summary IS 'Returns comprehensive analytics summary for a PIN';

-- ============================================================================
-- FUNCTION: Check if user can create PIN
-- ============================================================================

CREATE OR REPLACE FUNCTION public.can_create_pin(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  has_pin BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM public.professional_pins WHERE user_id = p_user_id
  ) INTO has_pin;
  
  RETURN NOT has_pin;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.can_create_pin IS 'Checks if a user can create a new PIN (one per user limit)';
