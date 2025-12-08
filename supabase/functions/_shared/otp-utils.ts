/**
 * Shared OTP Utilities for CoreID
 * Consolidates OTP generation, hashing, and verification logic
 */

import { createClient, SupabaseClient } from "npm:@supabase/supabase-js";
import { logInfo, logError, logDebug } from "./logger.ts";

/**
 * Hash data using SHA-256 with optional salt
 */
export async function hashData(data: string, salt: string = ''): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Generate a 6-digit OTP
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Store OTP in database
 */
export async function storeOTP(
  supabase: SupabaseClient,
  contactHash: string,
  otpHash: string,
  expiresInMinutes: number = 10
): Promise<{ success: boolean; error?: string }> {
  const insertData = {
    contact_hash: contactHash,
    otp_hash: otpHash,
    expires_at: new Date(Date.now() + expiresInMinutes * 60 * 1000).toISOString(),
    attempts: 0,
    used: false
  };

  const { error } = await supabase
    .from('otps')
    .insert(insertData);

  if (error) {
    console.error('OTP storage error:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Verify OTP against database
 */
export async function verifyOTP(
  supabase: SupabaseClient,
  contactHash: string,
  otpHash: string
): Promise<{ 
  valid: boolean; 
  error?: string; 
  shouldRetry?: boolean;
  otpRecord?: any;
}> {
  const currentTime = new Date().toISOString();

  logDebug('[verifyOTP] Searching for OTP', {
    contactHash_preview: contactHash.substring(0, 20),
    currentTime,
    searching_for: 'used=false, not expired'
  });

  // Find valid OTP
  const { data: otpRecord, error: fetchError } = await supabase
    .from('otps')
    .select('*')
    .eq('contact_hash', contactHash)
    .eq('used', false)
    .gt('expires_at', currentTime)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  logDebug('[verifyOTP] Query result', {
    found: !!otpRecord,
    error: fetchError?.message,
    record_preview: otpRecord ? {
      id: otpRecord.id,
      used: otpRecord.used,
      expires_at: otpRecord.expires_at,
      attempts: otpRecord.attempts
    } : null
  });

  if (fetchError || !otpRecord) {
    return { 
      valid: false, 
      error: 'Invalid or expired OTP',
      shouldRetry: false 
    };
  }

  // Check attempts
  if (otpRecord.attempts >= 5) {
    return { 
      valid: false, 
      error: 'Too many attempts. Please request a new OTP.',
      shouldRetry: false 
    };
  }

  // Verify hash
  logDebug('OTP Verification', {
    provided_hash_preview: otpHash.substring(0, 20),
    stored_hash_preview: otpRecord.otp_hash.substring(0, 20),
    hashes_match: otpRecord.otp_hash === otpHash,
    attempts: otpRecord.attempts
  });
  
  if (otpRecord.otp_hash !== otpHash) {
    // Increment attempts
    await supabase
      .from('otps')
      .update({ attempts: otpRecord.attempts + 1 })
      .eq('id', otpRecord.id);
    
    return { 
      valid: false, 
      error: 'Invalid OTP',
      shouldRetry: true 
    };
  }

  // Mark as used
  await supabase
    .from('otps')
    .update({ used: true })
    .eq('id', otpRecord.id);

  return { 
    valid: true,
    otpRecord 
  };
}

/**
 * Send OTP via email using Resend
 */
export async function sendOTPEmail(
  email: string,
  otp: string,
  resendApiKey: string,
  fromEmail: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`
      },
      body: JSON.stringify({
        from: `Seun from CoreID <${fromEmail}>`,
        to: email,
        subject: 'Your GidiPIN Verification Code',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Verification Code</h2>
            <p>Your verification code is:</p>
            <h1 style="font-size: 32px; letter-spacing: 5px; background: #f4f4f5; padding: 20px; text-align: center; border-radius: 8px;">${otp}</h1>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this code, you can safely ignore this email.</p>
          </div>
        `
      })
    });

    if (!res.ok) {
      const errorData = await res.text();
      logError('Resend API error', null, { status: res.status });
      return { success: false, error: 'Failed to send email' };
    }

    return { success: true };
  } catch (error) {
    logError('Email send error', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Send OTP via SMS using Termii
 */
export async function sendOTPSMS(
  phone: string,
  otp: string,
  termiiApiKey: string,
  senderId: string = 'N-Alert'
): Promise<{ success: boolean; error?: string }> {
  try {
    const smsPayload = {
      to: phone,
      from: senderId,
      sms: `Your CoreID verification code is: ${otp}. Valid for 10 minutes.`,
      type: 'plain',
      channel: 'dnd',
      api_key: termiiApiKey,
    };

    const res = await fetch('https://api.ng.termii.com/api/sms/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(smsPayload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      logError('Termii API error', null, { status: res.status });
      
      let errorDetail = errorText;
      try {
        const errorJson = JSON.parse(errorText);
        errorDetail = errorJson.message || errorJson.error || errorText;
      } catch (e) {
        // errorText is not JSON, use as is
      }
      
      return { 
        success: false, 
        error: `Failed to send SMS: ${errorDetail}` 
      };
    }

    const responseData = await res.json();
    logInfo('Termii SMS sent', { message_id: responseData.message_id || 'unknown' });
    return { success: true };
  } catch (error) {
    logError('SMS send error', error);
    return { success: false, error: String(error) };
  }
}
