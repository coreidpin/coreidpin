import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { createClient } from "npm:@supabase/supabase-js";
import { create, getNumericDate } from "https://deno.land/x/djwt@v2.9.1/mod.ts";
import { 
  hashData, 
  generateOTP, 
  storeOTP, 
  verifyOTP as verifyOTPUtil,
  sendOTPEmail,
  sendOTPSMS 
} from "../_shared/otp-utils.ts";
import { buildWelcomeEmail } from "../server/templates/welcome.ts";
import { issuePinToUser } from "../_shared/pinService.ts";

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
  const jwtSecret = Deno.env.get('SUPABASE_JWT_SECRET');
  
  if (!jwtSecret || jwtSecret.trim() === '') {
    console.error('CRITICAL: SUPABASE_JWT_SECRET environment variable is not set!');
    throw new Error('Server configuration error: JWT secret not configured');
  }
  
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
    new TextEncoder().encode(jwtSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  return await create({ alg: "HS256", type: "JWT" }, payload, key);
}

// OTP Request Handler
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

    console.log('[Request] Generated hashes:', {
      contact_preview: contact.substring(0, 20),
      contactHash_preview: contactHash.substring(0, 20)
    });

    // 2. Generate OTP
    const otp = generateOTP();
    const otpHash = await hashData(otp); // Hash OTP before storing

    console.log('[Request] Generated OTP:', {
      otp_length: otp.length,
      otp_hash_preview: otpHash.substring(0, 20)
    });

    // 3. Store in otps table using shared utility
    const storeResult = await storeOTP(supabase, contactHash, otpHash);
    if (!storeResult.success) {
      console.error('[Request] OTP storage error:', storeResult.error);
      return c.json({ error: 'Failed to generate OTP' }, 500);
    }

    console.log('[Request] OTP stored successfully');

    // Check if user exists in identity_users
    let { data: existingUser } = await supabase
      .from('identity_users')
      .select('user_id')
      .eq('phone_hash', contactHash)
      .maybeSingle();

    // SELF-HEALING: If not found in identity_users, check auth.users directly
    if (!existingUser && !create_account) {
      console.log('User not found in identity_users, checking auth.users fallback...');
      
      let authUser;
      
      if (contact_type === 'email') {
        // For email, we can list users (increase limit to ensure we find them)
        const { data: { users }, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
        if (users) {
           authUser = users.find(u => u.email?.toLowerCase() === contact);
        }
      } else {
        // For phone, we try to match normalized numbers
        const { data: { users }, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
        if (users) {
           // Remove all non-digits for comparison
           const cleanContact = contact.replace(/\D/g, '');
           authUser = users.find(u => {
             const uPhone = u.phone?.replace(/\D/g, '') || '';
             // Match if one contains the other (handles +234 vs 080 issues)
             return uPhone && (uPhone.includes(cleanContact) || cleanContact.includes(uPhone));
           });
        }
      }
      
      if (authUser) {
        console.log('Found user in auth.users but missing in identity_users. Repairing...', authUser.id);
        
        // Create missing identity_users record
        const { error: repairError } = await supabase.from('identity_users').insert({
          user_id: authUser.id,
          phone_hash: contactHash,
          phone_encrypted: 'repaired_entry',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
        if (!repairError) {
          existingUser = { user_id: authUser.id };
        } else {
          console.error('Failed to repair identity_users:', repairError);
        }
      }
    }

    if (create_account) {
      // Registration Flow: User should NOT exist
      if (existingUser) {
        return c.json({ error: 'Account already exists. Please log in.' }, 400);
      }
    } else {
      // Login Flow: User MUST exist
      if (!existingUser) {
         return c.json({ 
           error: 'Account not found. Please create an account.',
           debug_info: 'Self-healing failed. User not found in auth.users.'
         }, 404);
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
      expires_in: 600
    });

  } catch (error) {
    console.error('OTP request error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
};

// OTP Verify Handler
const handleVerify = async (c: any) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    let { contact, otp, name, email, phone, create_account } = body;

    if (!contact || !otp) {
      return c.json({ error: 'Contact and OTP required' }, 400);
    }

    // Normalize contact
    contact = contact.trim().toLowerCase();

    console.log('[Verify] Computing hashes...');
    const contactHash = await hashData(contact, Deno.env.get('SERVER_SALT') ?? 'default-salt');
    const otpHash = await hashData(otp);
    
    console.log('[Verify] Calling verifyOTPUtil with:', {
      contactHash_preview: contactHash.substring(0, 10),
      otpHash_preview: otpHash.substring(0, 10)
    });
    
    // Verify OTP using shared utility
    const verifyResult = await verifyOTPUtil(supabase, contactHash, otpHash);
    
    console.log('[Verify] verifyOTPUtil result:', {
      valid: verifyResult.valid,
      error: verifyResult.error,
      shouldRetry: verifyResult.shouldRetry
    });
    
    if (!verifyResult.valid) {
      console.error('[Verify] OTP verification failed:', verifyResult.error);
      return c.json({ error: verifyResult.error }, verifyResult.shouldRetry ? 400 : 429);
    }

    console.log('[Verify] OTP verified successfully, checking user...');

    // 5. Check if user exists in identity_users
    let { data: user } = await supabase
      .from('identity_users')
      .select('user_id, full_name')
      .eq('phone_hash', contactHash) 
      .maybeSingle();

    console.log('[Verify] identity_users lookup result:', user ? 'Found' : 'Not found');

    let userId = user?.user_id;
    let userEmail: string | null = null;

    // SECURITY CHECK: If user exists in identity_users, verify they still exist in auth.users
    if (userId) {
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
      
      if (authError || !authUser) {
        console.error('SECURITY: User exists in identity_users but NOT in auth.users (deleted account):', userId);
        
        // CLEANUP: Delete the orphaned identity_users record
        console.log('[Verify] Cleaning up orphaned identity_users record...');
        await supabase.from('identity_users').delete().eq('user_id', userId);
        
        // Allow user to proceed with registration if create_account is true
        if (create_account) {
          console.log('[Verify] Orphaned record cleaned up. Proceeding with fresh registration...');
          userId = undefined; // Reset so they can register fresh
          user = null;
        } else {
          return c.json({ 
            error: 'Your account was previously deleted. Please register again.',
            code: 'ACCOUNT_DELETED_PLEASE_REGISTER'
          }, 403);
        }
      } else {
        userEmail = authUser.user.email || null;
      }
    }

    // 6. Create user if not exists (only for registration)
    if (!userId) {
      if (!create_account) {
        console.error('[Verify] User not found and create_account is false');
        return c.json({ error: 'Account not found. Please sign up.' }, 404);
      }
      
      console.log('[Verify] Creating new user account...');

      // Check for orphaned record
      const { data: orphanedUser } = await supabase
        .from('identity_users')
        .select('user_id')
        .eq('phone_hash', contactHash)
        .single();
        
      if (orphanedUser) {
        return c.json({ 
          error: 'This account was previously deleted and cannot be recreated.',
          code: 'ACCOUNT_DELETED'
        }, 403);
      }

      const uniqueId = crypto.randomUUID().substring(0, 12);
      const placeholderEmail = `passwordless_${uniqueId}@coreid.app`;
      const randomPassword = `P@ssw0rd_${crypto.randomUUID()}!`;
      
      // Create user via RPC
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

      // Create identity_users record
      await supabase.from('identity_users').insert({
        user_id: userId,
        phone_hash: contactHash,
        phone_encrypted: 'placeholder',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
      // Create profile
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
      
      await supabase.from('profiles').upsert(profileData, { onConflict: 'user_id' });

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
          } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
          }
        }
      }
      
      // AUTO-GENERATE PIN using shared service
      console.log('Auto-generating PIN for new user:', userId);
      await issuePinToUser(userId);
      
    } else {
      // Existing user updates
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

// Routes with multiple path variations to handle Supabase routing quirks
app.post('/request', handleRequest);
app.post('/auth/request', handleRequest);
app.post('/functions/v1/auth/request', handleRequest);

app.post('/verify', handleVerify);
app.post('/auth/verify', handleVerify);
app.post('/functions/v1/auth/verify', handleVerify);

// Session Cookie Handler
app.post('/session-cookie', async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const { token } = body;
    
    if (!token) {
      return c.json({ error: 'Token required' }, 400);
    }
    
    const csrf = crypto.randomUUID();
    return c.json({ success: true, csrf });
  } catch (error) {
    return c.json({ error: 'Session validation failed' }, 500);
  }
});

app.post('/logout', (c) => {
  return c.json({ success: true });
});

app.get('/csrf', (c) => {
  const csrf = crypto.randomUUID();
  return c.json({ csrf });
});

// Debug catch-all
app.all('*', (c) => {
  console.log('Catch-all hit. Path:', c.req.path);
  return c.json({ 
    error: 'Route not found', 
    path: c.req.path,
    method: c.req.method,
    available_routes: ['/request', '/verify', '/session-cookie']
  }, 404);
});

Deno.serve(app.fetch);
