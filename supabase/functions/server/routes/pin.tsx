import { Hono } from "npm:hono";
import { getSupabaseClient } from "../lib/supabaseClient.tsx";
import { issuePinToUser, verifyPin, getPinVerifications, logPinEvent, createPinHash } from "../lib/pinService.ts";
import { getBlockchainService } from "../lib/blockchain.ts";
import * as kv from "../kv_store.tsx";

const pin = new Hono();
const supabase = getSupabaseClient();
const blockchain = getBlockchainService();

// Issue PIN to authenticated user
pin.post('/issue', async (c) => {
  try {
    const userId = c.get('userId');
    if (!userId) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    const result = await issuePinToUser(userId);
    
    if (result.success && result.pin) {
      // Record on blockchain (async)
      const { data: user } = await supabase
        .from('users')
        .select('pin_hash')
        .eq('id', userId)
        .single();

      if (user?.pin_hash) {
        blockchain.recordPinHash(user.pin_hash, userId)
          .then(async (blockchainResult) => {
            if (blockchainResult.success) {
              await supabase
                .from('users')
                .update({ pin_blockchain_tx: blockchainResult.txHash })
                .eq('id', userId);
              
              await logPinEvent(userId, result.pin!, 'PIN_BLOCKCHAIN_RECORDED', {
                txHash: blockchainResult.txHash
              });
            }
          })
          .catch(console.error);
      }
    }

    return c.json(result);
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Verify PIN (public endpoint for employers/partners)
pin.post('/verify', async (c) => {
  try {
    const body = await c.req.json();
    const { pin, verifierType, verifierId } = body;

    if (!pin || !verifierType || !verifierId) {
      return c.json({ 
        success: false, 
        error: 'Missing required fields: pin, verifierType, verifierId' 
      }, 400);
    }

    const result = await verifyPin(pin, verifierType, verifierId);

    // Record verification on blockchain (async)
    if (result.success) {
      const { data: verification } = await supabase
        .from('pin_verifications')
        .select('verification_hash')
        .eq('pin', pin)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (verification?.verification_hash) {
        blockchain.recordVerification(verification.verification_hash, pin)
          .then(async (blockchainResult) => {
            if (blockchainResult.success) {
              await supabase
                .from('pin_verifications')
                .update({ blockchain_tx: blockchainResult.txHash })
                .eq('verification_hash', verification.verification_hash);
            }
          })
          .catch(console.error);
      }
    }

    return c.json(result);
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get user's PIN status
pin.get('/status', async (c) => {
  try {
    const userId = c.get('userId');
    if (!userId) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('pin, pin_issued_at, phone_verified')
      .eq('id', userId)
      .single();

    if (error) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }

    return c.json({
      success: true,
      hasPIN: !!user.pin,
      pinIssuedAt: user.pin_issued_at,
      phoneVerified: user.phone_verified
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get PIN verification history
pin.get('/verifications', async (c) => {
  try {
    const userId = c.get('userId');
    if (!userId) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    const { data, error } = await getPinVerifications(userId);

    if (error) {
      return c.json({ success: false, error: error.message }, 500);
    }

    return c.json({ success: true, verifications: data });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Send OTP to phone number
pin.post('/send-otp', async (c) => {
  try {
    const userId = c.get('userId');
    if (!userId) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const { phone } = body;

    if (!phone) {
      return c.json({ success: false, error: 'Phone number required' }, 400);
    }

    // Validate phone format
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone)) {
      return c.json({ success: false, error: 'Invalid phone number format' }, 400);
    }

    // Rate limiting: max 5 requests per minute per user
    const ip = (c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || c.req.header('cf-connecting-ip') || 'unknown').toString();
    const windowMs = 60 * 1000;
    const maxRequests = 5;
    const now = Date.now();
    const rateKey = `rate:phone-otp:${userId}:${ip}`;
    const bucket = (await kv.get(rateKey)) || { count: 0, resetAt: new Date(now + windowMs).toISOString() };
    const resetAt = new Date(bucket.resetAt).getTime();
    let count = bucket.count || 0;
    if (now > resetAt) count = 0;
    if (count >= maxRequests) {
      await kv.set(rateKey, { count, resetAt: new Date(resetAt).toISOString() });
      const remainingMs = Math.max(0, resetAt - now);
      const remainingSeconds = Math.ceil(remainingMs / 1000);
      return c.json({ success: false, error: `Too many requests. Please wait ${remainingSeconds} seconds` }, 429);
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP in KV store with 5-minute expiry
    await kv.set(`otp:${phone}`, otp, { expirationTtl: 300 });
    
    // Log OTP send attempt
    await supabase
      .from('phone_verification_history')
      .insert({
        user_id: userId,
        phone,
        status: 'sent',
        channel: 'sms'
      });

    await logPinEvent(userId, '', 'OTP_SENT', { phone });

    // Send SMS via Twilio (add to environment variables)
    const twilioSid = Deno.env.get('TWILIO_SID');
    const twilioToken = Deno.env.get('TWILIO_TOKEN');
    const twilioPhone = Deno.env.get('TWILIO_PHONE');
    
    if (twilioSid && twilioToken && twilioPhone) {
      try {
        const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${btoa(`${twilioSid}:${twilioToken}`)}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            To: phone,
            From: twilioPhone,
            Body: `Your PIN verification code is: ${otp}. Valid for 5 minutes.`
          })
        });
        
        if (!response.ok) {
          throw new Error('SMS delivery failed');
        }
        
        console.log(`SMS sent successfully to ${phone}`);
      } catch (smsError) {
        console.error('SMS delivery error:', smsError);
        // Fallback to console for development
        console.log(`OTP for ${phone}: ${otp}`);
      }
    } else {
      // Development mode - log to console
      console.log(`OTP for ${phone}: ${otp}`);
    }

    await kv.set(rateKey, { count: count + 1, resetAt: now > resetAt ? new Date(now + windowMs).toISOString() : new Date(resetAt).toISOString() });
    return c.json({ success: true, message: 'OTP sent successfully' });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Verify phone number with OTP
pin.post('/verify-phone', async (c) => {
  try {
    const userId = c.get('userId');
    if (!userId) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    // Rate limiting verification attempts: max 10 per hour per user
    const ip = (c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || c.req.header('cf-connecting-ip') || 'unknown').toString();
    const vWindowMs = 60 * 60 * 1000;
    const vMax = 10;
    const vNow = Date.now();
    const vKey = `rate:phone-verify:${userId}:${ip}`;
    const vBucket = (await kv.get(vKey)) || { count: 0, resetAt: new Date(vNow + vWindowMs).toISOString() };
    const vResetAt = new Date(vBucket.resetAt).getTime();
    let vCount = vBucket.count || 0;
    if (vNow > vResetAt) vCount = 0;
    if (vCount >= vMax) {
      await kv.set(vKey, { count: vCount, resetAt: new Date(vResetAt).toISOString() });
      const remainingMs = Math.max(0, vResetAt - vNow);
      const remainingSeconds = Math.ceil(remainingMs / 1000);
      return c.json({ success: false, error: `Too many verification attempts. Wait ${remainingSeconds}s` }, 429);
    }

    const body = await c.req.json();
    const { phone, otp } = body;

    if (!phone || !otp) {
      return c.json({ success: false, error: 'Phone and OTP required' }, 400);
    }

    // Get stored OTP
    const storedOTP = await kv.get(`otp:${phone}`);
    
    if (!storedOTP || storedOTP !== otp) {
      await supabase
        .from('phone_verification_history')
        .insert({
          user_id: userId,
          phone,
          status: 'failed',
          channel: 'sms'
        });

      await logPinEvent(userId, '', 'OTP_VERIFICATION_FAILED', { phone, reason: 'Invalid OTP' });
      return c.json({ success: false, error: 'Invalid or expired OTP' }, 400);
    }

    // Delete used OTP
    await kv.delete(`otp:${phone}`);

    // Update user phone verification and activate PIN (set to phone)
    const pinHash = createPinHash(userId, phone, phone);
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        phone, 
        phone_verified: true,
        pin: phone,
        pin_hash: pinHash,
        pin_issued_at: new Date().toISOString(),
        pin_active: true
      })
      .eq('id', userId);

    if (updateError) {
      return c.json({ success: false, error: 'Failed to verify phone' }, 500);
    }

    // Log successful verification
    await supabase
      .from('phone_verification_history')
      .insert({
        user_id: userId,
        phone,
        status: 'verified',
        channel: 'sms'
      });

    await logPinEvent(userId, '', 'PHONE_VERIFIED', { phone });

    await kv.set(vKey, { count: vCount + 1, resetAt: vNow > vResetAt ? new Date(vNow + vWindowMs).toISOString() : new Date(vResetAt).toISOString() });
    return c.json({ success: true, message: 'Phone verified successfully' });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

export { pin };
