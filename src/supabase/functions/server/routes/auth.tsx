import { Hono } from "npm:hono";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "../kv_store.tsx";

const auth = new Hono();

// Create Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// User Registration Endpoint
auth.post("/register", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name, userType, companyName, role, institution, gender } = body;

    // Validate required fields
    if (!email || !password || !name || !userType) {
      return c.json({ error: "Missing required fields: email, password, name, userType" }, 400);
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { 
        name, 
        userType,
        companyName: companyName || null,
        role: role || null,
        institution: institution || null,
        gender: gender || null
      },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (authError) {
      console.log("Registration error during auth creation:", authError);
      return c.json({ error: `Registration failed: ${authError.message}` }, 400);
    }

    // Store additional user data in KV store
    const userId = authData.user?.id;
    if (userId) {
      await kv.set(`user:${userId}`, {
        id: userId,
        email,
        name,
        userType,
        companyName: companyName || null,
        role: role || null,
        institution: institution || null,
        gender: gender || null,
        createdAt: new Date().toISOString(),
        verificationStatus: "pending"
      });

      // Create user profile entry
      await kv.set(`profile:${userType}:${userId}`, {
        userId,
        profileComplete: false,
        onboardingComplete: false,
        createdAt: new Date().toISOString()
      });
    }

    return c.json({ 
      success: true, 
      message: "Registration successful",
      userId,
      userType
    });
  } catch (error) {
    console.log("Registration error:", error);
    return c.json({ error: `Registration failed: ${error.message}` }, 500);
  }
});

// Sign Up Endpoint (Alternative for OAuth)
auth.post("/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name, userType } = body;

    if (!email || !password || !name || !userType) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, userType },
      email_confirm: true
    });

    if (error) {
      return c.json({ error: error.message }, 400);
    }

    return c.json({ 
      success: true, 
      user: data.user 
    });
  } catch (error) {
    console.log("Signup error:", error);
    return c.json({ error: error.message }, 500);
  }
});

export { auth };
