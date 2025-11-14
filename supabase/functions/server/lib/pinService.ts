import { getSupabaseClient } from './supabaseClient.tsx';
import { createHash } from 'node:crypto';

const supabase = getSupabaseClient();

export interface PinGenerationResult {
  success: boolean;
  pin?: string;
  error?: string;
}

export interface PinVerificationResult {
  success: boolean;
  userId?: string;
  error?: string;
}

// Generate unique 8-digit PIN
export async function generatePin(): Promise<string> {
  let pin: string;
  let isUnique = false;
  let attempts = 0;
  
  while (!isUnique && attempts < 10) {
    pin = Math.floor(10000000 + Math.random() * 90000000).toString();
    
    const { data } = await supabase
      .from('users')
      .select('id')
      .eq('pin', pin)
      .single();
    
    if (!data) isUnique = true;
    attempts++;
  }
  
  if (!isUnique) throw new Error('Failed to generate unique PIN');
  return pin!;
}

// Create PIN hash for blockchain
export function createPinHash(userId: string, pin: string, phone: string): string {
  return createHash('sha256')
    .update(`${userId}:${pin}:${phone}:${Date.now()}`)
    .digest('hex');
}

// Issue PIN to user
export async function issuePinToUser(userId: string): Promise<PinGenerationResult> {
  try {
    // Check if user exists and phone is verified
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('phone, phone_verified, pin')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return { success: false, error: 'User not found' };
    }

    if (!user.phone_verified) {
      return { success: false, error: 'Phone not verified' };
    }

    if (user.pin) {
      return { success: false, error: 'PIN already exists' };
    }

    // Generate PIN and hash
    const pin = await generatePin();
    const pinHash = createPinHash(userId, pin, user.phone);

    // Update user with PIN
    const { error: updateError } = await supabase
      .from('users')
      .update({
        pin,
        pin_hash: pinHash,
        pin_issued_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      return { success: false, error: 'Failed to save PIN' };
    }

    // Log PIN creation
    await logPinEvent(userId, pin, 'PIN_CREATED', { pinHash });

    return { success: true, pin };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Verify PIN
export async function verifyPin(pin: string, verifierType: string, verifierId: string): Promise<PinVerificationResult> {
  try {
    // Find user by PIN
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, phone, pin_hash')
      .eq('pin', pin)
      .single();

    if (userError || !user) {
      await logPinEvent(null, pin, 'PIN_VERIFICATION_FAILED', { 
        reason: 'PIN not found',
        verifierType,
        verifierId 
      });
      return { success: false, error: 'Invalid PIN' };
    }

    // Create verification hash
    const verificationHash = createHash('sha256')
      .update(`${user.id}:${pin}:${verifierType}:${verifierId}:${Date.now()}`)
      .digest('hex');

    // Record verification
    const { error: verifyError } = await supabase
      .from('pin_verifications')
      .insert({
        user_id: user.id,
        pin,
        verifier_type: verifierType,
        verifier_id: verifierId,
        verification_hash: verificationHash
      });

    if (verifyError) {
      return { success: false, error: 'Failed to record verification' };
    }

    // Log verification
    await logPinEvent(user.id, pin, 'PIN_VERIFIED', {
      verifierType,
      verifierId,
      verificationHash
    });

    return { success: true, userId: user.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Log PIN events for audit
export async function logPinEvent(
  userId: string | null, 
  pin: string, 
  event: string, 
  meta: Record<string, any> = {}
): Promise<void> {
  try {
    await supabase
      .from('pin_audit_logs')
      .insert({
        user_id: userId,
        pin,
        event,
        meta
      });
  } catch (error) {
    console.error('Failed to log PIN event:', error);
  }
}

// Get PIN verification history
export async function getPinVerifications(userId: string) {
  const { data, error } = await supabase
    .from('pin_verifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return { data, error };
}