import { createClient } from "npm:@supabase/supabase-js";


// Helper to get Supabase Client with Service Role
function getSupabaseClient() {
  const url = Deno.env.get('SUPABASE_URL') ?? '';
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_KEY') ?? '';
  return createClient(url, serviceKey);
}

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

// Generate unique PIN format: PIN-NG-YYYY-XXXXXX
export async function generatePin(): Promise<string> {
  let pin: string;
  let isUnique = false;
  let attempts = 0;
  
  const year = new Date().getFullYear();
  
  while (!isUnique && attempts < 10) {
    // Generate 6 random hex characters
    const hex = Math.floor(Math.random() * 16777215).toString(16).toUpperCase().padStart(6, '0');
    pin = `PIN-NG-${year}-${hex}`;
    
    // Check uniqueness
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

// Helper to hash data using Web Crypto
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Create PIN hash for blockchain
export async function createPinHash(userId: string, pin: string, phone: string): Promise<string> {
  return await sha256(`${userId}:${pin}:${phone || 'no-phone'}:${Date.now()}`);
}

// Issue PIN to user
export async function issuePinToUser(userId: string, customPin?: string): Promise<PinGenerationResult> {
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

    // Generate PIN or use custom
    const pin = customPin || await generatePin();
    
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
      return { 
        success: false, 
        error: `Failed to save PIN: ${insertError.message} (${insertError.details || 'no details'})` 
      };
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
    const verificationHash = await sha256(`${userId}:${pin}:${verifierType}:${verifierId}:${Date.now()}`);

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
