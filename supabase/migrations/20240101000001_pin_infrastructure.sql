-- PIN Infrastructure Migration
-- Creates users table and PIN system tables

-- 1. Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    phone_verified BOOLEAN DEFAULT FALSE,
    pin VARCHAR(20) UNIQUE,
    pin_hash VARCHAR(64),
    pin_blockchain_tx VARCHAR(100),
    pin_issued_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add PIN fields to existing users table (if table already exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS pin VARCHAR(20) UNIQUE,
        ADD COLUMN IF NOT EXISTS pin_hash VARCHAR(64),
        ADD COLUMN IF NOT EXISTS pin_blockchain_tx VARCHAR(100),
        ADD COLUMN IF NOT EXISTS pin_issued_at TIMESTAMPTZ;
    END IF;
END $$;

-- Create indexes for users table PIN fields
CREATE INDEX IF NOT EXISTS idx_users_pin ON users(pin);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_phone_verified ON users(phone_verified);

-- 2. PIN verifications table
CREATE TABLE IF NOT EXISTS pin_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pin VARCHAR(20) NOT NULL,
    verifier_type VARCHAR(20) NOT NULL CHECK (verifier_type IN ('employer', 'system', 'partner')),
    verifier_id VARCHAR(100) NOT NULL,
    verification_hash VARCHAR(64),
    blockchain_tx VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pin_verify_user_id ON pin_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_pin_verify_pin ON pin_verifications(pin);

-- 3. PIN audit logs table
CREATE TABLE IF NOT EXISTS pin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    pin VARCHAR(20),
    event TEXT NOT NULL,
    meta JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pin_audit_user_id ON pin_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_pin_audit_created_at ON pin_audit_logs(created_at);

-- 4. Phone verification history table (optional)
CREATE TABLE IF NOT EXISTS phone_verification_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    phone VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('sent', 'verified', 'failed')),
    channel VARCHAR(20) NOT NULL CHECK (channel IN ('sms', 'whatsapp', 'voice')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_phone_verify_user_id ON phone_verification_history(user_id);
CREATE INDEX IF NOT EXISTS idx_phone_verify_phone ON phone_verification_history(phone);

-- Enable RLS on new tables
ALTER TABLE pin_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE pin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE phone_verification_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for pin_verifications
CREATE POLICY "Users can view their own PIN verifications" ON pin_verifications
    FOR SELECT USING (auth.uid() = user_id);

-- RLS policies for pin_audit_logs  
CREATE POLICY "Users can view their own PIN audit logs" ON pin_audit_logs
    FOR SELECT USING (auth.uid() = user_id);

-- RLS policies for phone_verification_history
CREATE POLICY "Users can view their own phone verification history" ON phone_verification_history
    FOR SELECT USING (auth.uid() = user_id);