import { Hono } from "npm:hono";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "../supabase/functions/server/kv_store.tsx";

const pin = new Hono();

// Create Supabase client with service role
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

type AnalyticsEvent = {
  pin_id: string;
  event_type: 'view' | 'share' | 'regenerate';
  ip_address?: string | null;
  user_agent?: string | null;
  referrer?: string | null;
  created_at?: string;
};

const analyticsBuffer: AnalyticsEvent[] = [];
let flushTimer: number | null = null;
const FLUSH_INTERVAL_MS = 500;
const FLUSH_BATCH_SIZE = 50;

async function flushAnalytics() {
  if (analyticsBuffer.length === 0) return;
  const batch = analyticsBuffer.splice(0, FLUSH_BATCH_SIZE);
  try {
    await supabase.from('pin_analytics').insert(batch);
  } catch (err) {
    console.log('Batch analytics insert failed, falling back to single inserts:', err);
    for (const ev of batch) {
      try { await supabase.from('pin_analytics').insert(ev); } catch {}
    }
  }
  if (analyticsBuffer.length > 0) {
    // Schedule next flush
    flushTimer = setTimeout(flushAnalytics, FLUSH_INTERVAL_MS) as unknown as number;
  } else {
    flushTimer = null;
  }
}

function enqueueAnalytics(ev: AnalyticsEvent) {
  analyticsBuffer.push({ ...ev, created_at: ev.created_at || new Date().toISOString() });
  if (flushTimer == null) {
    flushTimer = setTimeout(flushAnalytics, FLUSH_INTERVAL_MS) as unknown as number;
  }
}

async function importAesKey() {
  const raw = new TextEncoder().encode(Deno.env.get('PIN_ENCRYPTION_KEY') ?? '');
  const digest = await crypto.subtle.digest('SHA-256', raw);
  return crypto.subtle.importKey('raw', digest, { name: 'AES-GCM' }, false, ['encrypt']);
}

function toBase64(u8: Uint8Array) {
  let s = '';
  for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]);
  // @ts-ignore
  return btoa(s);
}

async function encryptValue(value: string) {
  const keyEnv = Deno.env.get('PIN_ENCRYPTION_KEY');
  if (!keyEnv) return value;
  const key = await importAesKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(value));
  const ct = new Uint8Array(enc);
  return toBase64(iv) + ':' + toBase64(ct);
}

async function hashPin(pinNumber: string) {
  const pepper = Deno.env.get('PIN_PEPPER') ?? '';
  const data = new TextEncoder().encode(pinNumber + pepper);
  const digest = await crypto.subtle.digest('SHA-256', data);
  const u8 = new Uint8Array(digest);
  let hex = '';
  for (let i = 0; i < u8.length; i++) hex += u8[i].toString(16).padStart(2, '0');
  return hex;
}

// ============================================================================
// CREATE PIN - Generate and save new PIN
// ============================================================================
pin.post("/create", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: "Unauthorized - Please login again" }, 401);
    }

    const body = await c.req.json();
    const { 
      name, 
      title, 
      location, 
      avatar,
      linkedinUrl, 
      githubUrl, 
      portfolioUrl,
      experiences = [],
      skills = [],
      usePhoneAsPin = false,
      phoneNumber = null
    } = body;

    console.log(`Creating PIN for user ${user.id}:`, { name, title, location });

    // Check if user already has a PIN
    const { data: existingPin } = await supabase
      .from('professional_pins')
      .select('pin_number')
      .eq('user_id', user.id)
      .single();

    if (existingPin) {
      console.log(`User ${user.id} already has PIN: ${existingPin.pin_number}`);
      return c.json({ 
        error: "You already have a PIN",
        pinNumber: existingPin.pin_number 
      }, 400);
    }

    // Generate unique PIN number using database function or use phone number
    let pinNumber;
    if (usePhoneAsPin && phoneNumber) {
      // Use provided phone number (sanitize to just digits)
      pinNumber = phoneNumber.replace(/\D/g, '');
      console.log(`Using phone number as PIN: ${pinNumber}`);
    } else {
      // Generate unique PIN number using database function
      const { data: pinNumberData, error: pinGenError } = await supabase.rpc('generate_pin_number');
      
      if (pinGenError || !pinNumberData) {
        console.log('PIN generation error:', pinGenError);
        throw new Error('Failed to generate unique PIN number');
      }
      pinNumber = pinNumberData;
      console.log(`Generated PIN number: ${pinNumber}`);
    }

    // Create PIN record
    const { data: pinRecord, error: pinError } = await supabase
      .from('professional_pins')
      .insert({
        user_id: user.id,
        pin_number: pinNumber,
        verification_status: 'pending',
        trust_score: 20 // Base score
      })
      .select()
      .single();

    if (pinError) {
      console.log('PIN insert error:', pinError);
      throw pinError;
    }

    console.log(`PIN record created with ID: ${pinRecord.id}`);

    // Update user profile with PIN data
    try {
      await supabase
        .from('profiles')
        .update({
          name,
          role: title,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);
    } catch (profileErr) {
      console.log('Profile update warning:', profileErr);
      // Non-fatal, continue
    }

    // Add experiences if provided
    if (experiences.length > 0) {
      const experienceRecords = experiences.map((exp: any) => ({
        pin_id: pinRecord.id,
        title: exp.title,
        company: exp.company,
        duration: exp.duration || 'Present',
        description: exp.description || null,
        verified: false
      }));
      
      const { error: expError } = await supabase
        .from('pin_experiences')
        .insert(experienceRecords);

      if (expError) {
        console.log('Experience insert warning:', expError);
      } else {
        console.log(`Added ${experienceRecords.length} experiences`);
      }
    }

    // Add skills if provided
    if (skills.length > 0) {
      const skillRecords = skills.map((skill: any) => ({
        pin_id: pinRecord.id,
        skill_name: typeof skill === 'string' ? skill : skill.name,
        skill_level: skill.level || 'Intermediate',
        verified: false,
        verified_source: 'manual'
      }));
      
      const { error: skillError } = await supabase
        .from('pin_skills')
        .insert(skillRecords);

      if (skillError) {
        console.log('Skill insert warning:', skillError);
      } else {
        console.log(`Added ${skillRecords.length} skills`);
      }
    }

    // Add linked accounts
    const accountInserts = [];
    if (linkedinUrl) {
      accountInserts.push({
        pin_id: pinRecord.id,
        platform: 'linkedin',
        url: linkedinUrl
      });
    }
    if (githubUrl) {
      accountInserts.push({
        pin_id: pinRecord.id,
        platform: 'github',
        url: githubUrl
      });
    }
    if (portfolioUrl) {
      accountInserts.push({
        pin_id: pinRecord.id,
        platform: 'portfolio',
        url: portfolioUrl
      });
    }

    if (accountInserts.length > 0) {
      const encryptedAccounts = [] as any[];
      for (const acc of accountInserts) {
        const encUrl = await encryptValue(acc.url);
        encryptedAccounts.push({ pin_id: acc.pin_id, platform: acc.platform, url: encUrl });
      }
      const { error: accountError } = await supabase
        .from('pin_linked_accounts')
        .insert(encryptedAccounts);

      if (accountError) {
        console.log('Linked accounts insert warning:', accountError);
      } else {
        console.log(`Added ${accountInserts.length} linked accounts`);
      }
    }

    // Store in KV for quick access
    try {
      await kv.set(`pin:${pinNumber}`, {
        pinId: pinRecord.id,
        userId: user.id,
        pinNumber,
        name,
        title,
        location,
        avatar,
        createdAt: new Date().toISOString()
      });
      const hashed = await hashPin(pinNumber);
      await kv.set(`pin_sensitive:${pinNumber}`, { userId: user.id, hash: hashed, createdAt: new Date().toISOString() });
      await kv.set(`audit:pin:create:${user.id}:${pinNumber}:${Date.now()}`, { actor: user.id, pinNumber, ts: new Date().toISOString() });
    } catch (kvErr) {
      console.log('KV store warning:', kvErr);
    }

    // Queue for background AI verification
    try {
      const { error: queueError } = await supabase
        .from('pin_verification_queue')
        .insert({
          pin_id: pinRecord.id,
          user_id: user.id,
          linkedin_url: linkedinUrl || null,
          github_url: githubUrl || null,
          portfolio_url: portfolioUrl || null,
          status: 'pending'
        });

      if (queueError) {
        console.log('Verification queue warning:', queueError);
      }
    } catch (err) {
      console.log('Failed to queue verification:', err);
    }

    return c.json({ 
      success: true,
      pinNumber,
      pinId: pinRecord.id,
      message: "PIN created successfully. Verification in progress."
    });
  } catch (error) {
    console.log("PIN creation error:", error);
    return c.json({ error: `Failed to create PIN: ${error.message}` }, 500);
  }
});

// ============================================================================
// GET PIN by User ID
// ============================================================================
pin.get("/user/:userId", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const userId = c.req.param('userId');
    
    // Users can only fetch their own PIN
    if (user.id !== userId) {
      return c.json({ error: "Forbidden - Can only access your own PIN" }, 403);
    }

    // Fetch PIN with all related data
    const { data: pinData, error } = await supabase
      .from('professional_pins')
      .select(`
        *,
        pin_experiences(*),
        pin_skills(*),
        pin_linked_accounts(*)
      `)
      .eq('user_id', userId)
      .single();

    if (error || !pinData) {
      console.log('No PIN found for user:', userId, error);
      return c.json({ success: false, message: "No PIN found" }, 404);
    }

    // Get profile data
    const { data: profile } = await supabase
      .from('profiles')
      .select('name, role, email')
      .eq('user_id', userId)
      .single();

    // Transform to frontend format (matching PINData interface)
    const transformedData = {
      pinNumber: pinData.pin_number,
      name: profile?.name || 'Professional',
      title: profile?.role || 'Not specified',
      location: 'Nigeria', // TODO: Add location to profile table
      avatar: null, // TODO: Add avatar support
      verificationStatus: pinData.verification_status,
      verificationDate: pinData.verification_date 
        ? new Date(pinData.verification_date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })
        : null,
      experiences: (pinData.pin_experiences || []).map((exp: any) => ({
        title: exp.title,
        company: exp.company,
        duration: exp.duration,
        verified: exp.verified
      })),
      skills: (pinData.pin_skills || []).map((skill: any) => ({
        name: skill.skill_name,
        level: skill.skill_level,
        verified: skill.verified
      })),
      endorsements: pinData.endorsements_count || 0,
      projectsCompleted: pinData.projects_completed || 0,
      linkedAccounts: {
        linkedin: (pinData.pin_linked_accounts || []).some((acc: any) => acc.platform === 'linkedin'),
        github: (pinData.pin_linked_accounts || []).some((acc: any) => acc.platform === 'github'),
        portfolio: (pinData.pin_linked_accounts || []).some((acc: any) => acc.platform === 'portfolio')
      },
      trustScore: pinData.trust_score || 20
    };

    return c.json({ success: true, data: transformedData });
  } catch (error) {
    console.log("Get PIN error:", error);
    return c.json({ error: `Failed to get PIN: ${error.message}` }, 500);
  }
});

// ============================================================================
// GET PUBLIC PIN by PIN Number (for sharing)
// ============================================================================
pin.get("/public/:pinNumber", async (c) => {
  try {
    const pinNumber = c.req.param('pinNumber');

    console.log(`Fetching public PIN: ${pinNumber}`);

    // Check KV cache first for performance
    let cachedPin = null;
    try {
      cachedPin = await kv.get(`pin:${pinNumber}`);
    } catch (err) {
      console.log('KV cache miss:', err);
    }

    // Fetch PIN with all related data
    const { data: pinData, error } = await supabase
      .from('professional_pins')
      .select(`
        *,
        pin_experiences(title, company, duration, verified),
        pin_skills(skill_name, skill_level, verified),
        pin_linked_accounts(platform, url)
      `)
      .eq('pin_number', pinNumber)
      .eq('verification_status', 'verified') // Only show verified PINs publicly
      .single();

    if (error || !pinData) {
      console.log('PIN not found or not verified:', pinNumber, error);
      return c.json({ error: "PIN not found or not verified" }, 404);
    }

    // Increment view count
    try {
      await supabase.rpc('increment_pin_views', { p_pin_number: pinNumber });
    } catch (err) {
      console.log('View increment warning:', err);
    }

    // Track analytics
    try {
      enqueueAnalytics({
        pin_id: pinData.id,
        event_type: 'view',
        ip_address: c.req.header('x-forwarded-for') || 'unknown',
        user_agent: c.req.header('user-agent') || 'unknown',
        referrer: c.req.header('referer') || null,
      });
      await kv.set(`audit:pin:view:${pinNumber}:${Date.now()}`, { pinId: pinData.id, ip: c.req.header('x-forwarded-for') || 'unknown', ua: c.req.header('user-agent') || 'unknown', ts: new Date().toISOString() });
    } catch (err) {
      console.log('Analytics tracking warning:', err);
    }

    // Get associated profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('name, role')
      .eq('user_id', pinData.user_id)
      .single();

    const transformedData = {
      pinNumber: pinData.pin_number,
      name: profile?.name || 'Professional',
      title: profile?.role || 'Not specified',
      location: 'Nigeria',
      verificationStatus: pinData.verification_status,
      verificationDate: pinData.verification_date 
        ? new Date(pinData.verification_date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })
        : null,
      experiences: (pinData.pin_experiences || []).map((exp: any) => ({
        title: exp.title,
        company: exp.company,
        duration: exp.duration,
        verified: exp.verified
      })),
      skills: (pinData.pin_skills || []).map((skill: any) => ({
        name: skill.skill_name,
        level: skill.skill_level,
        verified: skill.verified
      })),
      endorsements: pinData.endorsements_count || 0,
      projectsCompleted: pinData.projects_completed || 0,
      linkedAccounts: {
        linkedin: (pinData.pin_linked_accounts || []).some((acc: any) => acc.platform === 'linkedin'),
        github: (pinData.pin_linked_accounts || []).some((acc: any) => acc.platform === 'github'),
        portfolio: (pinData.pin_linked_accounts || []).some((acc: any) => acc.platform === 'portfolio')
      },
      trustScore: pinData.trust_score || 20,
      totalViews: pinData.total_views || 0
    };

    c.header('Cache-Control', 'public, max-age=60');
    try {
      const etag = `${pinData.id}:${pinData.updated_at || pinData.created_at || ''}`;
      c.header('ETag', etag);
    } catch {}
    return c.json({ success: true, data: transformedData });
  } catch (error) {
    console.log("Get public PIN error:", error);
    return c.json({ error: `Failed to get PIN: ${error.message}` }, 500);
  }
});

// ============================================================================
// TRACK SHARE EVENT
// ============================================================================
pin.post("/:pinNumber/share", async (c) => {
  try {
    const pinNumber = c.req.param('pinNumber');
    
    console.log(`Tracking share for PIN: ${pinNumber}`);

    const { data: pinData } = await supabase
      .from('professional_pins')
      .select('id')
      .eq('pin_number', pinNumber)
      .single();

    if (!pinData) {
      return c.json({ error: "PIN not found" }, 404);
    }

    // Increment share count
    try {
      await supabase.rpc('increment_pin_shares', { p_pin_number: pinNumber });
    } catch (err) {
      console.log('Share increment warning:', err);
    }

    // Track analytics
    try {
      enqueueAnalytics({ pin_id: pinData.id, event_type: 'share' });
      await kv.set(`audit:pin:share:${pinNumber}:${Date.now()}`, { pinId: pinData.id, ts: new Date().toISOString() });
    } catch (err) {
      console.log('Analytics tracking warning:', err);
    }

    return c.json({ success: true });
  } catch (error) {
    console.log("Share tracking error:", error);
    return c.json({ error: "Failed to track share" }, 500);
  }
});

// ============================================================================
// GET PIN ANALYTICS
// ============================================================================
pin.get("/:pinNumber/analytics", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const pinNumber = c.req.param('pinNumber');

    // Verify ownership
    const { data: pinData } = await supabase
      .from('professional_pins')
      .select('id, user_id, total_views, total_shares')
      .eq('pin_number', pinNumber)
      .single();

    if (!pinData || pinData.user_id !== user.id) {
      return c.json({ error: "Forbidden - Not your PIN" }, 403);
    }

    // Get recent analytics events
    const { data: analytics } = await supabase
      .from('pin_analytics')
      .select('event_type, created_at')
      .eq('pin_id', pinData.id)
      .order('created_at', { ascending: false })
      .limit(100);

    return c.json({
      success: true,
      analytics: {
        totalViews: pinData.total_views || 0,
        totalShares: pinData.total_shares || 0,
        recentEvents: analytics || []
      }
    });
  } catch (error) {
    console.log("Analytics error:", error);
    return c.json({ error: "Failed to get analytics" }, 500);
  }
});

pin.post('/regenerate', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (!user?.id || authError) return c.json({ error: 'Unauthorized' }, 401);
    const last = await kv.get(`pin_regen:${user.id}`);
    const now = Date.now();
    if (last?.last && now - new Date(last.last).getTime() < 24 * 60 * 60 * 1000) {
      return c.json({ error: 'Regeneration cooldown active' }, 429);
    }
    const { data: existing } = await supabase.from('professional_pins').select('id, pin_number, trust_score').eq('user_id', user.id).single();
    if (!existing) return c.json({ error: 'No existing PIN' }, 404);
    const { data: pinNumberData, error: pinGenError } = await supabase.rpc('generate_pin_number');
    if (pinGenError || !pinNumberData) return c.json({ error: 'Failed to generate PIN' }, 500);
    const newPin = pinNumberData as string;
    const { error: updErr } = await supabase.from('professional_pins').update({ pin_number: newPin, verification_status: 'pending' }).eq('id', existing.id);
    if (updErr) return c.json({ error: 'Failed to update PIN' }, 500);
    try {
      enqueueAnalytics({ pin_id: existing.id, event_type: 'regenerate' });
      await kv.set(`pin:${newPin}`, { pinId: existing.id, userId: user.id, pinNumber: newPin, createdAt: new Date().toISOString() });
      const hashed = await hashPin(newPin);
      await kv.set(`pin_sensitive:${newPin}`, { userId: user.id, hash: hashed, createdAt: new Date().toISOString() });
      await kv.set(`audit:pin:regenerate:${user.id}:${newPin}:${now}`, { actor: user.id, oldPin: existing.pin_number, newPin, ts: new Date().toISOString() });
      await kv.set(`pin_regen:${user.id}`, { last: new Date().toISOString(), newPin });
    } catch {}
    return c.json({ success: true, pinNumber: newPin });
  } catch {
    return c.json({ error: 'Failed to regenerate PIN' }, 500);
  }
});

// ============================================================================
// CONVERT TO PHONE PIN
// ============================================================================
pin.post('/convert-phone', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { phoneNumber } = await c.req.json();

    if (!phoneNumber) {
      return c.json({ error: "Phone number is required" }, 400);
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
      return c.json({ error: "No PIN found" }, 404);
    }

    // Check if new PIN is already in use
    const { data: conflict } = await supabase
      .from('professional_pins')
      .select('id')
      .eq('pin_number', newPin)
      .neq('user_id', user.id) // excluding self if already matches
      .single();

    if (conflict) {
      return c.json({ error: "This phone number is already used as a PIN by another user" }, 409);
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
    return c.json({ error: error.message || "Failed to convert PIN" }, 500);
  }
});

export { pin };
