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
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const { phone } = await c.req.json();

    if (!phone) {
      return c.json({ success: false, error: "Phone number is required" }, 400);
    }

    // Sanitize phone number
    const sanitizedPhone = phone.replace(/\D/g, '');

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
      return c.json({ 
        success: false, 
        error: "This phone number is already registered to another account" 
      }, 409);
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store OTP in database
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error: otpError } = await serviceClient
      .from('phone_verification_otps')
      .insert({
        user_id: user.id,
        phone_number: sanitizedPhone,
        otp_code: otp,
        expires_at: expiresAt.toISOString()
      });

    if (otpError) {
      console.error('Failed to store OTP:', otpError);
      return c.json({ success: false, error: "Failed to generate OTP" }, 500);
    }

    // TODO: Integrate with SMS provider to actually send SMS
    // For now, we'll just log it (in production, send actual SMS)
    console.log(`[DEV] OTP for ${sanitizedPhone}: ${otp}`);

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
    console.error("Send OTP error:", error);
    return c.json({ success: false, error: error.message || "Failed to send OTP" }, 500);
  }
});

// Phone Verification - Verify OTP
app.post("/verify-phone", async (c) => {
  try {
    const { user, supabase } = await getAuthUser(c);
    
    if (!user) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    const { phone, otp } = await c.req.json();

    if (!phone || !otp) {
      return c.json({ success: false, error: "Phone number and OTP are required" }, 400);
    }

    // Sanitize phone number
    const sanitizedPhone = phone.replace(/\D/g, '');

    // Get the latest unused OTP for this user and phone
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: otpRecord, error: fetchError } = await serviceClient
      .from('phone_verification_otps')
      .select('*')
      .eq('user_id', user.id)
      .eq('phone_number', sanitizedPhone)
      .eq('used', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !otpRecord) {
      return c.json({ success: false, error: "No OTP found. Please request a new one." }, 404);
    }

    // Check if OTP expired
    if (new Date(otpRecord.expires_at) < new Date()) {
      return c.json({ success: false, error: "OTP has expired. Please request a new one." }, 410);
    }

    // Check attempts
    if (otpRecord.attempts >= 5) {
      return c.json({ success: false, error: "Too many attempts. Please request a new OTP." }, 429);
    }

    // Increment attempts
    await serviceClient
      .from('phone_verification_otps')
      .update({ attempts: otpRecord.attempts + 1 })
      .eq('id', otpRecord.id);

    // Verify OTP
    if (otpRecord.otp_code !== otp) {
      return c.json({ success: false, error: "Invalid OTP code" }, 400);
    }

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
      console.error('Failed to update profile:', profileError);
      return c.json({ success: false, error: "Failed to verify phone" }, 500);
    }

    // Log success
    await serviceClient.from('audit_events').insert({
      event_type: 'phone_verified',
      user_id: user.id,
      meta: { phone_hash: sanitizedPhone.slice(-4) }
    });

    return c.json({ 
      success: true,
      message: "Phone verified successfully"
    });
  } catch (error: any) {
    console.error("Verify OTP error:", error);
    return c.json({ success: false, error: error.message || "Failed to verify OTP" }, 500);
  }
});

export { app as pin };
