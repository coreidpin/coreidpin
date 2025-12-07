/*
=============================================================================
DATABASE MIGRATION REQUIRED
=============================================================================

Please run the following SQL in your Supabase SQL Editor to enable referrals:

-- Add referral_code to profiles
ALTER TABLE "public"."profiles" 
ADD COLUMN IF NOT EXISTS "referral_code" text UNIQUE,
ADD COLUMN IF NOT EXISTS "referred_by" uuid REFERENCES "auth"."users"("id");

-- Create referrals tracking table
CREATE TABLE IF NOT EXISTS "public"."referrals" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "referrer_id" uuid NOT NULL REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE,
    "referred_user_id" uuid REFERENCES "public"."profiles"("user_id") ON DELETE SET NULL,
    "referred_email" text,
    "status" text NOT NULL DEFAULT 'pending', -- pending, converted
    "created_at" timestamptz DEFAULT now(),
    "converted_at" timestamptz,
    PRIMARY KEY ("id")
);

-- RLS Policies for referrals
ALTER TABLE "public"."referrals" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own referrals"
ON "public"."referrals"
FOR SELECT
TO authenticated
USING (auth.uid() = referrer_id);

CREATE POLICY "Users can create referrals"
ON "public"."referrals"
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = referrer_id);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS "referrals_referrer_id_idx" ON "public"."referrals"("referrer_id");
CREATE INDEX IF NOT EXISTS "referrals_referral_code_idx" ON "public"."profiles"("referral_code");

=============================================================================
*/

import { supabase } from './supabase/client';

/**
 * Generates a random alphanumeric referral code
 * Format: 8 characters, e.g., "K9J2M4P1"
 */
export function generateReferralCode(length: number = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, O, 0, 1 to avoid confusion
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Ensures a user has a referral code.
 * If not, generates one and saves it to their profile.
 */
export async function ensureReferralCode(userId: string): Promise<string | null> {
  try {
    // Check if code exists
    const { data: profile, error: fetchError } = await (supabase
      .from('profiles') as any)
      .select('referral_code')
      .eq('user_id', userId)
      .single();

    if (fetchError) throw fetchError;

    if (profile?.referral_code) {
      return profile.referral_code;
    }

    // Generate and save new code
    let isUnique = false;
    let newCode = '';
    let attempts = 0;

    while (!isUnique && attempts < 5) {
      newCode = generateReferralCode();
      const { data } = await (supabase
        .from('profiles') as any)
        .select('referral_code')
        .eq('referral_code', newCode)
        .maybeSingle();
      
      if (!data) isUnique = true;
      attempts++;
    }

    if (!isUnique) throw new Error('Failed to generate unique code');

    const { error: updateError } = await (supabase
      .from('profiles') as any)
      .update({ referral_code: newCode })
      .eq('user_id', userId);

    if (updateError) throw updateError;

    return newCode;
  } catch (error) {
    console.error('Error ensuring referral code:', error);
    return null;
  }
}

/**
 * Tracks a referral click/visit
 * Stores the code in localStorage for attribution on signup
 */
export function trackReferralVisit(code: string | null) {
  if (!code) return;
  localStorage.setItem('referral_code', code);
}

/**
 * Gets the stored referral code for attribution
 */
export function getStoredReferralCode(): string | null {
  return localStorage.getItem('referral_code');
}

/**
 * Attribution: Call this on successful signup
 */
export async function attributeReferralOnSignup(userId: string) {
  const code = getStoredReferralCode();
  if (!code) return;

  try {
    // Find referrer
    const { data: referrer } = await (supabase
      .from('profiles') as any)
      .select('user_id')
      .eq('referral_code', code)
      .single();

    if (referrer) {
      // Create referral record
      await (supabase.from('referrals') as any).insert({
        referrer_id: referrer.user_id,
        referred_user_id: userId,
        status: 'converted',
        converted_at: new Date().toISOString()
      });

      // Update profile with referred_by
      await (supabase.from('profiles') as any)
        .update({ referred_by: referrer.user_id })
        .eq('user_id', userId);
        
      // Clear storage
      localStorage.removeItem('referral_code');
    }
  } catch (err) {
    console.error('Attribution error:', err);
  }
}
