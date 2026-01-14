import { Hono } from "npm:hono";
import { createClient } from "npm:@supabase/supabase-js";
import { getAuthUser } from "../lib/supabaseClient.tsx";
import { issuePinToUser } from "../../_shared/pinService.ts";
import { checkRateLimit } from "../../_shared/rateLimiter.ts";
import * as kv from "../kv_store.tsx";

const app = new Hono();

// Generate random PIN for authenticated user
app.post("/generate", async (c) => {
  try {
    const { user, error } = await getAuthUser(c);
    
    console.log(`[PIN Generation] Auth check:`, { 
      hasUser: !!user, 
      userId: user?.id,
      error: error?.message 
    });
    
    if (!user) {
      console.error(`[PIN Generation] Unauthorized:`, error);
      return c.json({ success: false, error: "Unauthorized", details: error?.message }, 401);
    }

    // Rate limit: 3 PIN generations per hour
    const rateLimit = await checkRateLimit(user.id, 'pin_generation', 3, 60);
    if (!rateLimit.allowed) {
      return c.json({ 
        success: false, 
        error: "Rate limit exceeded. Please try again later." 
      }, 429);
    }

    console.log(`[PIN Generation] Generating PIN for user: ${user.id}`);
    
    const result = await issuePinToUser(user.id);
    
    if (!result.success) {
      console.error(`[PIN Generation] Failed:`, result.error);
      return c.json({ 
        success: false, 
        error: result.error || "Failed to generate PIN" 
      }, 500);
    }

    console.log(`[PIN Generation] Success for user: ${user.id}`);
    
    return c.json({
      success: true,
      pin: result.pin,
      message: "PIN generated successfully"
    });
  } catch (error: any) {
    console.error("[PIN Generation] Error:", error);
    return c.json({ 
      success: false, 
      error: error.message || "Failed to generate PIN" 
    }, 500);
  }
});

// Get current user's PIN
app.get("/current", async (c) => {
  try {
    const { user, supabase } = await getAuthUser(c);
    
    if (!user) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const { data: pinData, error } = await supabase
      .from('professional_pins')
      .select('pin_number, verification_status, created_at')
      .eq('user_id', user.id)
      .single();

    if (error || !pinData) {
      return c.json({ 
        success: false, 
        error: "No PIN found" 
      }, 404);
    }

    return c.json({
      success: true,
      pin: pinData.pin_number,
      status: pinData.verification_status,
      created_at: pinData.created_at
    });
  } catch (error: any) {
    console.error("[Get PIN] Error:", error);
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500);
  }
});

// Force verify email for authenticated user (Self-healing)
app.post("/verify-email", async (c) => {
  try {
    const { user, supabase } = await getAuthUser(c);
    
    if (!user) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    console.log(`[Email Verification] Fixing verification for user: ${user.id}`);

    // Use admin auth to update user
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error: updateError } = await serviceClient.auth.admin.updateUserById(
      user.id,
      { email_confirm: true, phone_confirm: true }
    );

    if (updateError) {
      console.error(`[Email Verification] Failed to update user:`, updateError);
      return c.json({ success: false, error: updateError.message }, 500);
    }

    return c.json({
      success: true,
      message: "Email and phone verified successfully"
    });
  } catch (error: any) {
    console.error("[Email Verification] Error:", error);
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500);
  }
});

// Convert Phone to PIN
app.post("/convert-phone", async (c) => {
  try {
    const { user, supabase } = await getAuthUser(c);
    
    if (!user) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const { phoneNumber } = await c.req.json();

    if (!phoneNumber) {
      return c.json({ success: false, error: "Phone number is required" }, 400);
    }
    
    // Sanitize
    const newPin = phoneNumber.replace(/\D/g, '');

    // Get existing PIN
    const { data: existingPin } = await supabase
      .from('professional_pins')
      .select('id, pin_number')
      .eq('user_id', user.id)
      .single();

    if (!existingPin) {
      return c.json({ success: false, error: "No PIN found" }, 404);
    }

    // Check if new PIN is already in use
    const { data: conflict } = await supabase
      .from('professional_pins')
      .select('id')
      .eq('pin_number', newPin)
      .neq('user_id', user.id)
      .single();

    if (conflict) {
      return c.json({ success: false, error: "This phone number is already used as a PIN by another user" }, 409);
    }

    // Update PIN
    const { error: updateError } = await supabase
      .from('professional_pins')
      .update({ 
        pin_number: newPin,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingPin.id);

    if (updateError) {
      console.error('Update PIN error:', updateError);
      throw new Error('Failed to update PIN');
    }

    // Refresh KV
    try {
      await kv.set(`pin:${newPin}`, { 
        pinId: existingPin.id, 
        userId: user.id, 
        pinNumber: newPin, 
        updatedAt: new Date().toISOString() 
      });
      // Delete old key if different
      if (existingPin.pin_number !== newPin) {
        await kv.del(`pin:${existingPin.pin_number}`);
      }
    } catch (err) {
      console.log('KV update warning:', err);
    }

    return c.json({ success: true, pinNumber: newPin });
  } catch (error: any) {
    console.error("Convert PIN error:", error);
    return c.json({ success: false, error: error.message || "Failed to convert PIN" }, 500);
  }
});

// Phone Verification - Send OTP
app.post("/send-otp", async (c) => {
  try {
    const { user, supabase } = await getAuthUser(c);
    
    if (!user) {
      console.log('[SEND-OTP] Unauthorized - no user');
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const { phone } = await c.req.json();

    if (!phone) {
      console.log('[SEND-OTP] Missing phone number');
      return c.json({ success: false, error: "Phone number is required" }, 400);
    }

    // Sanitize phone number
    const sanitizedPhone = phone.replace(/\D/g, '');

    console.log('[SEND-OTP] Request details:', {
      user_id: user.id,
      phone_original: phone,
      phone_sanitized: sanitizedPhone
    });

    // Check if phone number is already used by another account
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: existingPhone, error: checkError } = await serviceClient
      .from('profiles')
      .select('user_id')
      .eq('phone', sanitizedPhone)
      .neq('user_id', user.id)
      .maybeSingle();

    if (existingPhone) {
      console.log('[SEND-OTP] Phone already registered to another user');
      return c.json({ 
        success: false, 
        error: "This phone number is already registered to another account" 
      }, 409);
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    console.log('[SEND-OTP] Generated OTP:', {
      otp_preview: otp.substring(0, 2) + '****',
      expires_at: expiresAt.toISOString()
    });

    // Store OTP in database
    const { error: otpError, data: otpData } = await serviceClient
      .from('phone_verification_otps')
      .insert({
        user_id: user.id,
        phone_number: sanitizedPhone,
        otp_code: otp,
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single();

    if (otpError) {
      console.error('[SEND-OTP] Failed to store OTP:', otpError);
      return c.json({ success: false, error: "Failed to generate OTP" }, 500);
    }

    console.log('[SEND-OTP] OTP stored successfully:', {
      otp_id: otpData.id,
      user_id: user.id,
      phone_sanitized: sanitizedPhone
    });

    // TODO: Integrate with SMS provider to actually send SMS
    // For now, we'll just log it (in production, send actual SMS)
    console.log(`[SEND-OTP] [DEV] OTP for ${sanitizedPhone}: ${otp}`);

    // In production, you would call your SMS provider here:
    // await sendSMS(sanitizedPhone, `Your verification code is: ${otp}`);

    return c.json({ 
      success: true, 
      message: "OTP sent successfully",
      expiresIn: 300,
      // Remove this in production - only for testing
      _dev_otp: otp 
    });
  } catch (error: any) {
    console.error("[SEND-OTP] Error:", error);
    return c.json({ success: false, error: error.message || "Failed to send OTP" }, 500);
  }
});

// Phone Verification - Verify OTP
app.post("/verify-phone", async (c) => {
  try {
    const { user, supabase } = await getAuthUser(c);
    
    if (!user) {
      console.log('[VERIFY-PHONE] Unauthorized - no user');
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const { phone, otp } = await c.req.json();

    if (!phone || !otp) {
      console.log('[VERIFY-PHONE] Missing required fields:', { hasPhone: !!phone, hasOTP: !!otp });
      return c.json({ success: false, error: "Phone number and OTP are required" }, 400);
    }

    // Sanitize phone number
    const sanitizedPhone = phone.replace(/\D/g, '');

    console.log('[VERIFY-PHONE] Request details:', {
      user_id: user.id,
      phone_original: phone,
      phone_sanitized: sanitizedPhone,
      otp_length: otp.length,
      otp_preview: otp?.substring(0, 2) + '****'
    });

    // Get the latest unused OTP for this user and phone
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // First, get ALL OTPs for this user/phone to provide better error messages
    const { data: allOTPs, error: allError } = await serviceClient
      .from('phone_verification_otps')
      .select('*')
      .eq('user_id', user.id)
      .eq('phone_number', sanitizedPhone)
      .order('created_at', { ascending: false });

    console.log('[VERIFY-PHONE] All OTPs query result:', {
      found_count: allOTPs?.length || 0,
      error: allError?.message,
      records: allOTPs?.map(r => ({
        id: r.id,
        created_at: r.created_at,
        expires_at: r.expires_at,
        used: r.used,
        attempts: r.attempts
      }))
    });

    if (!allOTPs || allOTPs.length === 0) {
      console.error('[VERIFY-PHONE] No OTP records found in database');
      return c.json({ 
        success: false, 
        error: "No verification code found. Please click 'Send Code' first.",
        hint: "Make sure you've requested a code before trying to verify."
      }, 404);
    }

    // Find the most recent valid OTP
    const validOTP = allOTPs.find(otp => 
      !otp.used && 
      new Date(otp.expires_at) > new Date() &&
      otp.attempts < 5
    );

    if (!validOTP) {
      const latestOTP = allOTPs[0];
      console.log('[VERIFY-PHONE] No valid OTP found, latest OTP state:', {
        id: latestOTP.id,
        used: latestOTP.used,
        expired: new Date(latestOTP.expires_at) < new Date(),
        attempts: latestOTP.attempts,
        expires_at: latestOTP.expires_at
      });

      if (latestOTP.used) {
        return c.json({ 
          success: false, 
          error: "This code has already been used. Please request a new one." 
        }, 400);
      }
      if (new Date(latestOTP.expires_at) < new Date()) {
        return c.json({ 
          success: false, 
          error: "Your code has expired (codes expire after 5 minutes). Please request a new one." 
        }, 410);
      }
      if (latestOTP.attempts >= 5) {
        return c.json({ 
          success: false, 
          error: "Too many incorrect attempts. Please request a new code." 
        }, 429);
      }
    }

    const otpRecord = validOTP;

    // Increment attempts
    await serviceClient
      .from('phone_verification_otps')
      .update({ attempts: otpRecord.attempts + 1 })
      .eq('id', otpRecord.id);

    // Verify OTP
    if (otpRecord.otp_code !== otp) {
      console.log('[VERIFY-PHONE] OTP mismatch:', {
        expected_preview: otpRecord.otp_code.substring(0, 2) + '****',
        received_preview: otp.substring(0, 2) + '****',
        attempts_used: otpRecord.attempts + 1
      });
      return c.json({ 
        success: false, 
        error: "Invalid code. Please check and try again.",
        remaining_attempts: 5 - (otpRecord.attempts + 1)
      }, 400);
    }

    console.log('[VERIFY-PHONE] OTP matched successfully');

    // Mark OTP as used
    await serviceClient
      .from('phone_verification_otps')
      .update({ used: true })
      .eq('id', otpRecord.id);

    // Update profile - mark phone as verified
    const { error: profileError } = await serviceClient
      .from('profiles')
      .update({ 
        phone_verified: true,
        phone: sanitizedPhone,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (profileError) {
      console.error('[VERIFY-PHONE] Failed to update profile:', profileError);
      return c.json({ success: false, error: "Failed to verify phone" }, 500);
    }

    // Log success
    await serviceClient.from('audit_events').insert({
      event_type: 'phone_verified',
      user_id: user.id,
      meta: { phone_hash: sanitizedPhone.slice(-4) }
    });

    console.log('[VERIFY-PHONE] Success - phone verified for user:', user.id);

    return c.json({ 
      success: true,
      message: "Phone verified successfully"
    });
  } catch (error: any) {
    console.error("[VERIFY-PHONE] Error:", error);
    return c.json({ success: false, error: error.message || "Failed to verify phone" }, 500);
  }
});

export { app as pin };
