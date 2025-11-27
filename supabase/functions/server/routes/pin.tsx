import { Hono } from "npm:hono";
import { createClient } from "npm:@supabase/supabase-js";
import { getAuthUser } from "../lib/supabaseClient.tsx";
import { issuePinToUser } from "../../_shared/pinService.ts";
import { checkRateLimit } from "../../_shared/rateLimiter.ts";

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

export { app as pin };
