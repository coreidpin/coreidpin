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

export { app as pin };
