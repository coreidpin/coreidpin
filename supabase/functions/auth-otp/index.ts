// @ts-ignore
import { Hono } from "npm:hono";
// @ts-ignore
import { cors } from "npm:hono/cors";
// @ts-ignore
import { createClient } from "npm:@supabase/supabase-js";

// Deno globals (runtime provides them, but TS needs a declaration)
declare const Deno: any;

import { buildWelcomeEmail } from "../server/templates/welcome.ts";
import { issuePinToUser, verifyPin } from "../_shared/pinService.ts";

const app = new Hono();

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? 'http://missing-env-var.com',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? 'missing-key'
);

app.use("/*", cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization", "X-CSRF-Token", "apikey"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: false,
}));

// Helper to hash data
async function hashData(data: string, salt: string = ''): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Helper to generate OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Helper to generate Supabase JWT
// Helper to generate Supabase JWT
async function generateJWT(userId: string, email: string | null, metadata: any = {}) {
  const jwtSecret = Deno.env.get('JWT_SECRET') || Deno.env.get('SUPABASE_JWT_SECRET');
  
  if (!jwtSecret || jwtSecret.trim() === '') {
    console.error('CRITICAL: JWT_SECRET and SUPABASE_JWT_SECRET are not set!');
    throw new Error('Server configuration error: JWT secret not configured');
  }

  console.log('JWT Secret configured:', { length: jwtSecret.length });
  
  const payload = {
    aud: "authenticated",
    exp: getNumericDate(60 * 60 * 24 * 30), // 30 days for development
    sub: userId,
    email: email || "",
    role: "authenticated",
    app_metadata: { provider: "email", providers: ["email"] },
    user_metadata: metadata
  };
  
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(jwtSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  return await create({ alg: "HS256", typ: "JWT" }, payload, key);
}

const handleRequest = async (c: any) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    let { contact, contact_type } = body; // contact_type: 'phone' | 'email'

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

    // 3. Store in otps table
    const insertData = {
      contact_hash: contactHash,
      otp_hash: otpHash,
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      attempts: 0,
      used: false
    };
    
    console.log('Inserting OTP record:', { 
      contact_hash_preview: contactHash.substring(0, 10),
      otp_hash_preview: otpHash.substring(0, 10),
      expires_at: insertData.expires_at
    });
    
    const { data: insertedData, error: dbError } = await supabase
      .from('otps')
      .insert(insertData)
      .select()
      .single();

    if (dbError) {
      console.error('OTP storage error:', dbError);
      return c.json({ error: 'Failed to generate OTP' }, 500);
    }
    
    console.log('OTP record inserted successfully:', { id: insertedData?.id });

    // 4. Send OTP
    if (contact_type === 'email') {
      const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
      const FROM_EMAIL = Deno.env.get('FROM_EMAIL');

      if (!RESEND_API_KEY || !FROM_EMAIL) {
        console.error('Resend configuration missing');
        return c.json({ error: 'Server configuration error' }, 500);
      }

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: `CoreID <${FROM_EMAIL}>`,
          to: contact,
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
        console.error('Resend API error:', errorData);
        return c.json({ error: 'Failed to send email' }, 500);
      }
    } else {
      // Send SMS via Termii
      const TERMII_API_KEY = Deno.env.get('TERMII_API_KEY');
      const SENDER_ID = Deno.env.get('TERMII_SENDER_ID') || 'N-Alert';

      if (!TERMII_API_KEY) {
        console.error('Termii API key missing');
        return c.json({ error: 'Server configuration error' }, 500);
      }

      const smsPayload = {
        to: contact,
        from: SENDER_ID,
        sms: `Your CoreID verification code is: ${otp}. Valid for 10 minutes.`,
        type: 'plain',
        channel: 'dnd',
        api_key: TERMII_API_KEY,
      };

      console.log('Sending SMS via Termii:', { to: contact, from: SENDER_ID });

      const res = await fetch('https://api.ng.termii.com/api/sms/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(smsPayload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Termii API error status:', res.status);
        console.error('Termii API error body:', errorText);
        
        let errorDetail = errorText;
        try {
          const errorJson = JSON.parse(errorText);
          errorDetail = errorJson.message || errorJson.error || errorText;
        } catch (e) {
          // errorText is not JSON, use as is
        }
        
        return c.json({ 
          error: 'Failed to send SMS', 
          details: errorDetail,
          status: res.status 
        }, 500);
      }

      const responseData = await res.json();
      console.log('Termii response:', responseData);
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
    let { contact, otp, name, email, phone, create_account, userType, website, industry } = body;

    if (!contact || !otp) {
      return c.json({ error: 'Contact and OTP required' }, 400);
    }

    // Normalize contact
    contact = contact.trim().toLowerCase();

    const contactHash = await hashData(contact, Deno.env.get('SERVER_SALT') ?? 'default-salt');
    const otpHash = await hashData(otp);
    
    const currentTime = new Date().toISOString();
    
    console.log('Verifying OTP:', {
      contact,
      contact_hash_preview: contactHash.substring(0, 10),
      otp_hash_preview: otpHash.substring(0, 10),
      current_time: currentTime,
      has_metadata: !!(name || email || phone),
      create_account
    });

    // 1. Find valid OTP
    const { data: otpRecords, error: fetchError } = await supabase
      .from('otps')
      .select('*')
      .eq('contact_hash', contactHash)
      .eq('used', false)
      .gt('expires_at', currentTime)
      .order('created_at', { ascending: false })
      .limit(1);

    const otpRecord = otpRecords?.[0];

    if (fetchError || !otpRecord) {
      console.error('OTP Verification Failed:', { 
        fetchError, 
        contactHash: contactHash.substring(0, 10),
        found: !!otpRecord 
      });
      return c.json({ error: 'Invalid or expired OTP' }, 400);
    }



    // 2. Check attempts
    if (otpRecord.attempts >= 5) {
      return c.json({ error: 'Too many attempts. Please request a new OTP.' }, 429);
    }

    // 3. Verify Hash
    if (otpRecord.otp_hash !== otpHash) {
      await supabase.from('otps').update({ attempts: otpRecord.attempts + 1 }).eq('id', otpRecord.id);
      return c.json({ error: 'Invalid OTP' }, 400);
    }

    // 4. Mark used
    await supabase.from('otps').update({ used: true }).eq('id', otpRecord.id);

    // 5. Check if user exists
    let { data: user } = await supabase
      .from('identity_users')
      .select('user_id, full_name')
      .eq('phone_hash', contactHash) 
      .maybeSingle();

    let userId = user?.user_id;
    let userEmail: string | null = null;

    // 6. Create user if not exists
    if (!userId) {
      // If create_account is not explicitly true, deny login for non-existent users
      if (!create_account) {
        return c.json({ error: 'Account not found. Please sign up.' }, 404);
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
      // Update user metadata in Supabase Auth
      const metadata = { userType: userType || 'professional' };
      await supabase.auth.admin.updateUserById(userId, { user_metadata: metadata });

      if (userType === 'business') {
        // Create business profile
        const businessData: any = {
          user_id: userId,
          company_name: name || 'Business Name',
          company_email: email,
          website: website,
          industry: industry,
          updated_at: new Date().toISOString()
        };
        
        // Only set created_at on insert
        const { data: existingProfile } = await supabase.from('business_profiles').select('id').eq('user_id', userId).single();
        if (!existingProfile) {
          businessData.created_at = new Date().toISOString();
        }

        const { error: busError } = await supabase
          .from('business_profiles')
          .upsert(businessData, { onConflict: 'user_id' });
          
        if (busError) console.error('Business profile creation error:', busError);

      } else {
        // Professional Profile Logic
        const profileData: any = {
          user_id: userId,
          user_type: 'professional',
          email_verified: true,
          updated_at: new Date().toISOString()
        };

        const { data: existingProfile } = await supabase.from('profiles').select('id').eq('user_id', userId).single();
        if (!existingProfile) {
          profileData.created_at = new Date().toISOString();
        }
        
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
                  from: `CoreID <${FROM_EMAIL}>`,
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

        // Auto-generate PIN (Use phone number if available, otherwise random)
        try {
          // If contact is a phone number (digits/plus), use it as PIN
          const isPhone = /^\+?[0-9]+$/.test(contact);
          const pinToUse = isPhone ? contact : undefined;
          
          await issuePinToUser(userId, pinToUse);
          console.log(`Auto-generated PIN for user ${userId}. Custom: ${!!pinToUse}`);
        } catch (pinError) {
          console.error('Failed to auto-generate PIN:', pinError);
        }
      }
      
    } else {
      // Existing user - fetch email and current metadata
      const { data: userData } = await supabase.auth.admin.getUserById(userId);
      userEmail = userData?.user?.email || null;
      let currentUserType = userData?.user?.user_metadata?.userType;
      
      // CRITICAL FIX: If userType is provided in request, update metadata and use it
      // This allows users to "fix" their account type if it was set incorrectly or defaulted
      if (userType && userType !== currentUserType) {
        console.log(`Updating userType from ${currentUserType} to ${userType}`);
        const newMetadata = { ...userData?.user?.user_metadata, userType };
        await supabase.auth.admin.updateUserById(userId, { user_metadata: newMetadata });
        currentUserType = userType;
      }
      
      // Ensure specific profile exists and update it
      if (currentUserType === 'business') {
        const businessData: any = {
           user_id: userId,
           updated_at: new Date().toISOString()
        };
        if (name) businessData.company_name = name;
        if (email) businessData.company_email = email;
        if (website) businessData.website = website;
        if (industry) businessData.industry = industry;

        // Upsert to ensure it exists
        const { error: busError } = await supabase
          .from('business_profiles')
          .upsert(businessData, { onConflict: 'user_id' });
          
        if (busError) console.error('Business profile update error:', busError);
        
      } else {
         // Default to Professional
         const profileData: any = {
           user_id: userId,
           updated_at: new Date().toISOString()
         };
         if (name) profileData.name = name;
         if (email) profileData.email = email;
         if (phone) profileData.phone = phone;

         const { error: profileError } = await supabase
          .from('profiles')
          .upsert(profileData, { onConflict: 'user_id' });
          
         if (profileError) console.error('Profile update error:', profileError);
      }
    }

    // 7. Generate JWT
    // Fetch latest metadata to ensure we have the correct userType
    const { data: finalUserData } = await supabase.auth.admin.getUserById(userId);
    const finalMetadata = finalUserData?.user?.user_metadata || { userType: 'professional' };
    
    const jwt = await generateJWT(userId, userEmail, finalMetadata);

    // 8. Log audit
    await supabase.from('audit_events').insert({
      event_type: 'login_success',
      user_id: userId,
      meta: { method: 'otp', contact_masked: contact.replace(/.(?=.{4})/g, '*') }
    });

    return c.json({
      status: 'ok',
      access_token: jwt,
      expires_in: 2592000, // 30 days in seconds
      user: { id: userId, email: userEmail, user_metadata: finalMetadata }
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

// Token Refresh Endpoint
const handleRefresh = async (c: any) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ error: 'No token provided' }, 401);
    }

    const oldToken = authHeader.replace('Bearer ', '');
    const jwtSecret = Deno.env.get('JWT_SECRET') || Deno.env.get('SUPABASE_JWT_SECRET');
    
    if (!jwtSecret) {
      console.error('JWT_SECRET not configured');
      return c.json({ error: 'Server configuration error' }, 500);
    }

    // Verify the old token (even if expired)
    const { verify } = await import("https://deno.land/x/djwt@v2.9.1/mod.ts");
    
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(jwtSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    let payload;
    try {
      payload = await verify(oldToken, key, { ignoreExpiration: true });
    } catch (error) {
      console.error('Token verification failed:', error);
      return c.json({ error: 'Invalid token' }, 401);
    }

    if (!payload || !payload.sub) {
      return c.json({ error: 'Invalid token payload' }, 401);
    }

    const userId = payload.sub as string;
    const userEmail = payload.email as string || null;

    // Check if user still exists
    const { data: userData } = await supabase.auth.admin.getUserById(userId);
    
    if (!userData || !userData.user) {
        return c.json({ error: 'User not found in auth' }, 404);
    }
    
    const userMetadata = userData.user.user_metadata || {};

    // Generate new token
    const newToken = await generateJWT(userId, userEmail, userMetadata);

    return c.json({
      status: 'ok',
      access_token: newToken,
      expires_in: 2592000, // 30 days in seconds
      user: { id: userId, email: userEmail, user_metadata: userMetadata }
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    return c.json({ error: 'Failed to refresh token' }, 500);
  }
};

// Temporary Admin Route to fix PINs
const handleAssignPin = async (c: any) => {
  try {
    const { pin } = await c.req.json();
    if (!pin) return c.json({ error: 'Pin required' }, 400);

    let userId: string;
    let message: string;

    // 1. Check if PIN already exists
    const { data: existingPin } = await supabase
      .from('professional_pins')
      .select('user_id')
      .eq('pin_number', pin)
      .maybeSingle();

    if (existingPin) {
      userId = existingPin.user_id;
      message = `PIN ${pin} already belongs to user ${userId}. Ensured profile exists.`;
    } else {
      // 2. Fetch latest user to assign to
      const { data: users, error: userError } = await supabase
        .from('identity_users')
        .select('user_id')
        .order('created_at', { ascending: false })
        .limit(1);

      if (userError || !users?.length) {
        return c.json({ error: 'No users found to assign PIN to' }, 404);
      }
      userId = users[0].user_id;

      // 3. Assign PIN
      const { error: upsertError } = await supabase
        .from('professional_pins')
        .upsert({
          user_id: userId,
          pin_number: pin,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (upsertError) {
         // Handle edge case where we tried to assign to a user who already has a DIFFERENT PIN, 
         // but we want them to have THIS PIN.
         // Or if someone else took this PIN in the meantime (unlikely).
         throw upsertError;
      }
      message = `Assigned ${pin} to user ${userId}`;
    }

    // 4. CRITICAL: Ensure Profile Exists
    // The verification tool fails if no profile is found.
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        user_id: userId,
        name: 'Test Professional', // Default name if missing
        full_name: 'Test Professional',
        job_title: 'Software Engineer',
        city: 'Lagos, Nigeria',
        email_verified: true, 
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' }); // This will update timestamp if exists, or insert if missing.

    if (profileError) {
      console.error('Failed to ensure profile:', profileError);
    }

    return c.json({ success: true, message, userId });

  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

// app.post('/admin/assign-pin', handleAssignPin);
// app.post('/auth-otp/admin/assign-pin', handleAssignPin);
// app.post('/functions/v1/auth-otp/admin/assign-pin', handleAssignPin);

app.post('/refresh', handleRefresh);
app.post('/auth-otp/refresh', handleRefresh);
app.post('/functions/v1/auth-otp/refresh', handleRefresh);

// Identity Verification Route
const handleIdentityVerification = async (c: any) => {
  try {
    const { pin_number, verifier_id } = await c.req.json();
    
    if (!pin_number) {
        return c.json({ error: 'PIN required' }, 400);
    }

    // 1. Verify PIN (This tracks usage and fires webhooks)
    const result = await verifyPin(pin_number, 'business', verifier_id || 'anonymous');

    if (!result.success || !result.userId) {
        console.error('Verification failed result:', result);
        return c.json({ 
          error: result.error || 'Verification failed',
          details: result
        }, 400);
    }

    // 2. Fetch Professional Public Profile (Best Effort)
    let profileData = {
        name: 'Verified Professional',
        job_title: 'Professional',
        city: null,
        email_verified: false,
        avatar_url: null
    };

    // Attempt 1: Profiles Table - Select * to be safe against schema variations
    const { data: profile } = await supabase
        .from('profiles')
        .select('*') // Select all columns to ensure we get whatever is available
        .eq('user_id', result.userId)
        .single();
    
    if (profile) {
        // Map whatever fields we found
        profileData.name = profile.name || profile.full_name || profile.first_name || profileData.name;
        profileData.job_title = profile.job_title || profile.role || profileData.job_title;
        profileData.city = profile.city || profile.location || profileData.city;
        profileData.avatar_url = profile.avatar_url || profile.avatar || profileData.avatar_url;
        profileData.email_verified = profile.email_verified || false;
    } else {
        console.warn('Profile row missing for user:', result.userId);

        // Attempt 2: Auth User Metadata (Service Role)
        const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(result.userId);
        if (!userError && user) {
            const meta = user.user_metadata || {};
            console.log('Found user metadata:', meta);
            
            // Try all possible name combinations
            profileData.name = meta.full_name || meta.name || 
                              (meta.first_name ? `${meta.first_name} ${meta.last_name || ''}`.trim() : null) || 
                              profileData.name;
                              
            profileData.job_title = meta.job_title || meta.role || meta.position || profileData.job_title;
            profileData.city = meta.city || meta.location || profileData.city;
            profileData.avatar_url = meta.avatar_url || meta.picture || meta.avatar || profileData.avatar_url;
            profileData.email_verified = !!user.email_confirmed_at;
        }
    }

    // 3. Fetch Work Experience (Top 3)
    let workExperiences = [];
    try {
        const { data: weData, error: weError } = await supabase
            .from('work_experiences')
            .select('*')
            .eq('user_id', result.userId)
            .order('start_date', { ascending: false })
            .limit(3);
        
        if (weError) {
             console.error('Work experience fetch error:', weError);
        }

        if (weData && weData.length > 0) {
            console.log(`Found ${weData.length} work experiences`);
            // Map to ensure consistent shape if needed, but select * should cover it
            workExperiences = weData.map(exp => ({
                ...exp,
                // Ensure field compatibility 
                job_title: exp.job_title || exp.title || exp.role,
                company_name: exp.company_name || exp.company,
                start_date: exp.start_date || exp.startDate,
                end_date: exp.end_date || exp.endDate,
                is_current: exp.is_current ?? exp.current ?? (!exp.end_date && !exp.endDate)
            }));
        } else {
             console.log('No work experience records found in database for user', result.userId);
        }
    } catch (e) {
        console.warn('Failed to fetch work experiences:', e);
    }

    // Return success regardless of profile fetch result
    return c.json({
        success: true,
        data: {
            ...profileData,
            work_experiences: workExperiences,
            pin_status: 'active',
            verified_at: new Date().toISOString()
        }
    });

  } catch (error: any) {
    console.error('Identity verification error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
};

app.post('/verify-identity', handleIdentityVerification);
app.post('/auth-otp/verify-identity', handleIdentityVerification);
app.post('/functions/v1/auth-otp/verify-identity', handleIdentityVerification);

// Root path handler for Supabase client invocations
app.post('/', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  
  // Route based on body content
  if (body.otp) {
    // Has OTP, so this is a verify request
    return handleVerify(c);
  } else if (body.contact || body.contact_type) {
    // Has contact info, so this is a request
    return handleRequest(c);
  } else {
    return c.json({ 
      error: 'Invalid request. Include either contact/contact_type (to send OTP) or otp (to verify)',
      received: Object.keys(body)
    }, 400);
  }
});

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
