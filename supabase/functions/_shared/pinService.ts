// @ts-ignore
import { createClient, SupabaseClient } from "npm:@supabase/supabase-js";

declare const Deno: any;

let _supabase: SupabaseClient | null = null;

function getSupabase() {
  if (_supabase) return _supabase;
  const url = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_KEY');
  
  if (!url || !serviceKey) {
    console.error('Missing Supabase Environment Variables');
    throw new Error('Supabase Config Missing');
  }
  _supabase = createClient(url, serviceKey);
  return _supabase;
}

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
    const { data } = await getSupabase()
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
    const { data: existingPin, error: fetchError } = await getSupabase()
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
    const { error: insertError } = await getSupabase()
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
    const { data: pinRecord, error: pinError } = await getSupabase()
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
    const { error: verifyError } = await getSupabase()
      .from('pin_verifications')
      .insert({
        user_id: userId,
        pin,
        verifier_type: verifierType,
        verifier_id: verifierId,
        verification_hash: verificationHash
      });

    if (verifyError) {
      console.error('Verify DB Error:', verifyError);
      return { 
          success: false, 
          error: `Failed to record verification: ${verifyError.message}`,
          details: verifyError
      };
    }

    // Log verification
    await logPinEvent(userId, pin, 'PIN_VERIFIED', {
      verifierType,
      verifierId,
      verificationHash
    });

    // 1. Increment API Usage for the business (if verifier is a business)
    // We assume verifierId corresponds to the business user_id if verifierType is 'business'
    if (verifierType === 'business') {
        const { error: usageError } = await getSupabase().rpc('increment_api_usage', { 
            p_user_id: verifierId 
        });
        if (usageError) console.error('Failed to increment API usage:', usageError);

        // 2. Dispatch Webhooks
        // Fetch active webhooks for this business
        const { data: busProfile } = await getSupabase()
            .from('business_profiles')
            .select('id')
            .eq('user_id', verifierId)
            .single();

        if (busProfile) {
            const { data: webhooks } = await getSupabase()
                .from('webhooks')
                .select('*')
                .eq('business_id', busProfile.id)
                .contains('events', ['pin.verified'])
                .eq('is_active', true);

            if (webhooks && webhooks.length > 0) {
                const payload = {
                    event: 'pin.verified',
                    timestamp: new Date().toISOString(),
                    data: {
                        pin,
                        verified_at: new Date().toISOString(),
                        verification_hash: verificationHash
                    }
                };

                // Fire and forget webhooks
                for (const hook of webhooks) {
                    fetch(hook.url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    }).catch(err => console.error(`Webhook failed for ${hook.url}:`, err));
                }
            }
        }
    }

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
    await getSupabase()
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
