import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { createClient } from "npm:@supabase/supabase-js";

import { create, getNumericDate } from "https://deno.land/x/djwt@v2.9.1/mod.ts";
import { buildWelcomeEmail } from "../server/templates/welcome.ts";
import { 
  hashData, 
  generateOTP, 
  storeOTP, 
  verifyOTP as verifyOTPUtil,
  sendOTPEmail,
  sendOTPSMS 
} from "../_shared/otp-utils.ts";

const app = new Hono();

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

app.use("/*", cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization", "X-CSRF-Token", "apikey"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: false,
}));



// Helper to generate Supabase JWT
async function generateJWT(userId: string, email: string | null) {
  const payload = {
    aud: "authenticated",
    exp: getNumericDate(60 * 60 * 24), // 24 hours
    sub: userId,
    email: email || "",
    role: "authenticated",
    app_metadata: { provider: "email", providers: ["email"] },
    user_metadata: {}
  };
  
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(Deno.env.get('SUPABASE_JWT_SECRET') ?? ''),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  return await create({ alg: "HS256", type: "JWT" }, payload, key);
}

const handleRequest = async (c: any) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    let { contact, contact_type, create_account } = body; // contact_type: 'phone' | 'email'

    if (!contact || !contact_type) {
      return c.json({ error: 'Contact and contact_type required' }, 400);
    }

    // Normalize contact
    contact = contact.trim().toLowerCase();

    // 1. Hash contact for lookup
    const contactHash = await hashData(contact, Deno.env.get('SERVER_SALT') ?? 'default-salt');

    // 2. Generate OTP
    const otp = generateOTP();
    const otpHash = await hashData(otp); // Hash OTP before storing

    // 3. Store in otps table using shared utility
    const storeResult = await storeOTP(supabase, contactHash, otpHash);
    if (!storeResult.success) {
      console.error('OTP storage error:', storeResult.error);
      return c.json({ error: 'Failed to generate OTP' }, 500);
    }

    // Check if user exists in identity_users
    const { data: existingUser } = await supabase
      .from('identity_users')
      .select('user_id')
      .eq('phone_hash', contactHash)
      .single();

    if (create_account) {
      // Registration Flow: User should NOT exist
      if (existingUser) {
        return c.json({ error: 'Account already exists. Please log in.' }, 400);
      }
    } else {
      // Login Flow: User MUST exist
      if (!existingUser) {
         return c.json({ error: 'Account not found. Please create an account.' }, 404);
      }
    }

    // 4. Send OTP
    if (contact_type === 'email') {
      const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
      const FROM_EMAIL = Deno.env.get('FROM_EMAIL');

      if (!RESEND_API_KEY || !FROM_EMAIL) {
        console.error('Resend configuration missing');
        return c.json({ error: 'Server configuration error' }, 500);
      }

      const sendResult = await sendOTPEmail(contact, otp, RESEND_API_KEY, FROM_EMAIL);
      if (!sendResult.success) {
        return c.json({ error: sendResult.error }, 500);
      }
    } else {
      // Send SMS via Termii
      const TERMII_API_KEY = Deno.env.get('TERMII_API_KEY');
      const SENDER_ID = Deno.env.get('TERMII_SENDER_ID') || 'N-Alert';

      if (!TERMII_API_KEY) {
        console.error('Termii API key missing');
        return c.json({ error: 'Server configuration error' }, 500);
      }

      const sendResult = await sendOTPSMS(contact, otp, TERMII_API_KEY, SENDER_ID);
      if (!sendResult.success) {
        return c.json({ error: sendResult.error }, 500);
      }
    }
    
    // Log audit event
    await supabase.from('audit_events').insert({
      event_type: 'otp_sent',
      meta: { contact_type, contact_masked: contact.replace(/.(?=.{4})/g, '*') }
    });

    return c.json({ 
      status: 'ok', 
      message: 'OTP sent', 
      expires_in: 600,
      debug_contact_hash: contactHash // For debugging
    });

  } catch (error) {
    console.error('OTP request error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
};

const handleVerify = async (c: any) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    let { contact, otp, name, email, phone, create_account } = body;

    if (!contact || !otp) {
      return c.json({ error: 'Contact and OTP required' }, 400);
    }

    // Normalize contact
    contact = contact.trim().toLowerCase();

    const contactHash = await hashData(contact, Deno.env.get('SERVER_SALT') ?? 'default-salt');
    const otpHash = await hashData(otp);
    
    console.log('Verifying OTP:', {
      contact,
      contact_hash_preview: contactHash.substring(0, 10),
      otp_hash_preview: otpHash.substring(0, 10),
      has_metadata: !!(name || email || phone),
      create_account
    });

    // Verify OTP using shared utility
    const verifyResult = await verifyOTPUtil(supabase, contactHash, otpHash);
    
    if (!verifyResult.valid) {
      return c.json({ error: verifyResult.error }, verifyResult.shouldRetry ? 400 : 429);
    }

    // 5. Check if user exists in identity_users
    let { data: user } = await supabase
      .from('identity_users')
      .select('user_id, full_name')
      .eq('phone_hash', contactHash) 
      .single();

    let userId = user?.user_id;
    let userEmail: string | null = null;

    // SECURITY CHECK: If user exists in identity_users, verify they still exist in auth.users
    if (userId) {
      console.log('User found in identity_users, verifying auth.users existence:', userId);
      
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
      
      if (authError || !authUser) {
        console.error('SECURITY: User exists in identity_users but NOT in auth.users (deleted account):', {
          userId,
          authError: authError?.message
        });
        
        // This user was deleted - do not allow login or recreation
        return c.json({ 
          error: 'This account has been deleted and cannot be accessed. Please contact support if you believe this is an error.',
          code: 'ACCOUNT_DELETED'
        }, 403);
      }
      
      // User exists in both tables - safe to proceed
      userEmail = authUser.user.email || null;
    }

    // 6. Create user if not exists (only for registration)
    if (!userId) {
      // If create_account is not explicitly true, deny login for non-existent users
      if (!create_account) {
        return c.json({ error: 'Account not found. Please sign up.' }, 404);
      }

      // Additional check: ensure this wasn't a previously deleted user
      // Check if identity_users record exists but auth.users doesn't (orphaned record)
      const { data: orphanedUser } = await supabase
        .from('identity_users')
        .select('user_id')
        .eq('phone_hash', contactHash)
        .single();
        
      if (orphanedUser) {
        console.error('SECURITY: Orphaned identity_users record found (deleted from auth.users):', orphanedUser.user_id);
        return c.json({ 
          error: 'This account was previously deleted and cannot be recreated. Please use a different contact method or contact support.',
          code: 'ACCOUNT_DELETED'
        }, 403);
      }

      const uniqueId = crypto.randomUUID().substring(0, 12);
      const placeholderEmail = `passwordless_${uniqueId}@coreid.app`;
      const randomPassword = `P@ssw0rd_${crypto.randomUUID()}!`;
      
      // Use RPC function to create user
      const { data: newUserId, error: createError } = await supabase.rpc('create_passwordless_user', {
        p_email: placeholderEmail,
        p_password: randomPassword
      });

      if (createError || !newUserId) {
        console.error('User creation error:', createError);
        return c.json({ error: 'Failed to create user account' }, 500);
      }

      userId = newUserId;
      userEmail = placeholderEmail;

      // Verify the user was actually created in auth.users
      const { data: verifyAuthUser } = await supabase.auth.admin.getUserById(userId);
      if (!verifyAuthUser) {
        console.error('SECURITY: User creation succeeded but user not found in auth.users');
        return c.json({ error: 'Failed to create user account' }, 500);
      }

      // Create identity_users record
      await supabase.from('identity_users').insert({
        user_id: userId,
        phone_hash: contactHash,
        phone_encrypted: 'placeholder',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
      // Create profile with registration data
      const profileData: any = {
        user_id: userId,
        user_type: 'professional',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      if (name) profileData.name = name;
      if (email) profileData.email = email;
      if (phone) profileData.phone = phone;
      
      // Fallbacks
      if (!profileData.phone && contact.startsWith('+')) profileData.phone = contact;
      if (!profileData.email && contact.includes('@')) profileData.email = contact;
      
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'user_id' });
        
      if (profileError) console.error('Profile creation error:', profileError);

      // Send Welcome Email
      const recipientEmail = email || (contact.includes('@') ? contact : null);
      if (recipientEmail) {
        const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
        const FROM_EMAIL = Deno.env.get('FROM_EMAIL');
        
        if (RESEND_API_KEY && FROM_EMAIL) {
          try {
            const { subject, html, text } = buildWelcomeEmail(name || 'Professional', 'https://coreid.app');
            
            await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`
              },
              body: JSON.stringify({
                from: `Seun from CoreID <${FROM_EMAIL}>`,
                to: recipientEmail,
                subject: subject,
                html: html,
                text: text
              })
            });
            console.log('Welcome email sent to:', recipientEmail);
          } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
          }
        }
      }
      
    } else {
      // Existing user - fetch email
      const { data: userData } = await supabase.auth.admin.getUserById(userId);
      userEmail = userData?.user?.email || null;
      
      // Update profile if new data provided
      if (name || email || phone) {
        const updateData: any = { updated_at: new Date().toISOString() };
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (phone) updateData.phone = phone;
        
        await supabase.from('profiles').update(updateData).eq('user_id', userId);
      }
    }

    // 7. Generate JWT
    const jwt = await generateJWT(userId, userEmail);

    // 8. Log audit
    await supabase.from('audit_events').insert({
      event_type: 'login_success',
      user_id: userId,
      meta: { method: 'otp', contact_masked: contact.replace(/.(?=.{4})/g, '*') }
    });

    return c.json({
      status: 'ok',
      access_token: jwt,
      expires_in: 86400,
      user: { id: userId, email: userEmail }
    });

  } catch (error) {
    console.error('OTP verify error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
};

// Register routes with multiple path variations to handle Supabase routing quirks
app.post('/request', handleRequest);
app.post('/auth-otp/request', handleRequest);
app.post('/functions/v1/auth-otp/request', handleRequest);

app.post('/verify', handleVerify);
app.post('/auth-otp/verify', handleVerify);
app.post('/functions/v1/auth-otp/verify', handleVerify);

// Debug catch-all
app.all('*', (c) => {
  console.log('Catch-all hit. Path:', c.req.path);
  return c.json({ 
    error: 'Route not found', 
    path: c.req.path,
    method: c.req.method 
  }, 404);
});

Deno.serve(app.fetch);
