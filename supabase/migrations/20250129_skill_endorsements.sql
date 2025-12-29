-- ============================================
-- Phase 5: Skill Endorsements
-- Created: 2025-01-29
-- ============================================

-- 1. Add endorsement_count to tech_stack
ALTER TABLE tech_stack 
ADD COLUMN IF NOT EXISTS endorsement_count INTEGER DEFAULT 0;

-- 2. Create skill_endorsements table
CREATE TABLE IF NOT EXISTS skill_endorsements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tech_stack_id UUID REFERENCES tech_stack(id) ON DELETE CASCADE NOT NULL,
    endorser_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent self-endorsement check
    CONSTRAINT no_self_endorsement CHECK (true), -- Logic handled in RLS/Application mostly, but could add function check
    
    -- Ensure unique endorsement per skill per endorser
    UNIQUE(tech_stack_id, endorser_id)
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_skill_endorsements_tech_stack ON skill_endorsements(tech_stack_id);
CREATE INDEX IF NOT EXISTS idx_skill_endorsements_endorser ON skill_endorsements(endorser_id);

-- 4. RLS Policies

ALTER TABLE skill_endorsements ENABLE ROW LEVEL SECURITY;

-- Anyone can read endorsements
CREATE POLICY "Anyone can view endorsements"
    ON skill_endorsements FOR SELECT
    USING (true);

-- Authenticated users can insert endorsements
-- (Check that endorser_id matches auth.uid())
CREATE POLICY "Users can endorse skills"
    ON skill_endorsements FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = endorser_id);

-- Users can delete their own endorsements
CREATE POLICY "Users can remove their endorsements"
    ON skill_endorsements FOR DELETE
    TO authenticated
    USING (auth.uid() = endorser_id);

-- 5. Trigger to Maintain Count
CREATE OR REPLACE FUNCTION update_endorsement_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE tech_stack
        SET endorsement_count = endorsement_count + 1
        WHERE id = NEW.tech_stack_id;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE tech_stack
        SET endorsement_count = endorsement_count - 1
        WHERE id = OLD.tech_stack_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_endorsement_count
AFTER INSERT OR DELETE ON skill_endorsements
FOR EACH ROW
EXECUTE FUNCTION update_endorsement_count();

-- 6. Helper Function to Prevent Self-Endorsement at DB Level
CREATE OR REPLACE FUNCTION check_self_endorsement()
RETURNS TRIGGER AS $$
DECLARE
    recipient_user_id UUID;
BEGIN
    -- Get the user_id of the tech_stack owner
    SELECT user_id INTO recipient_user_id FROM tech_stack WHERE id = NEW.tech_stack_id;
    
    IF recipient_user_id = NEW.endorser_id THEN
        RAISE EXCEPTION 'Users cannot endorse their own skills';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_self_endorsement
BEFORE INSERT ON skill_endorsements
FOR EACH ROW
EXECUTE FUNCTION check_self_endorsement();
