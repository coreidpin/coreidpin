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
      .from('professional_pins')
      .select('id')
      .eq('pin_number', pin)
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
    .update(`${userId}:${pin}:${phone || 'no-phone'}:${Date.now()}`)
    .digest('hex');
}

// Issue PIN to user
export async function issuePinToUser(userId: string): Promise<PinGenerationResult> {
  try {
    // Check if PIN already exists in professional_pins
    const { data: existingPin, error: fetchError } = await supabase
      .from('professional_pins')
      .select('pin_number')
      .eq('user_id', userId)
      .single();

    if (existingPin) {
      return { success: true, pin: existingPin.pin_number };
    }

    // Generate PIN
    const pin = await generatePin();
    
    // Insert PIN into professional_pins
    const { error: insertError } = await supabase
      .from('professional_pins')
      .insert({
        user_id: userId,
        pin_number: pin,
        verification_status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('Failed to save PIN:', insertError);
      return { success: false, error: 'Failed to save PIN' };
    }

    // Log PIN creation
    await logPinEvent(userId, pin, 'PIN_CREATED', {});

    return { success: true, pin };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Verify PIN
export async function verifyPin(pin: string, verifierType: string, verifierId: string): Promise<PinVerificationResult> {
  try {
    // Find user by PIN
    const { data: pinRecord, error: pinError } = await supabase
      .from('professional_pins')
      .select('user_id')
      .eq('pin_number', pin)
      .single();

    if (pinError || !pinRecord) {
      await logPinEvent(null, pin, 'PIN_VERIFICATION_FAILED', { 
        reason: 'PIN not found',
        verifierType,
        verifierId 
      });
      return { success: false, error: 'Invalid PIN' };
    }

    const userId = pinRecord.user_id;

    // Create verification hash
    const verificationHash = createHash('sha256')
      .update(`${userId}:${pin}:${verifierType}:${verifierId}:${Date.now()}`)
      .digest('hex');

    // Record verification
    const { error: verifyError } = await supabase
      .from('pin_verifications')
      .insert({
        user_id: userId,
        pin,
        verifier_type: verifierType,
        verifier_id: verifierId,
        verification_hash: verificationHash
      });

    if (verifyError) {
      return { success: false, error: 'Failed to record verification' };
    }

    // Log verification
    await logPinEvent(userId, pin, 'PIN_VERIFIED', {
      verifierType,
      verifierId,
      verificationHash
    });

    return { success: true, userId };
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