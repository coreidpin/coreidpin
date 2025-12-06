import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { createClient } from "npm:@supabase/supabase-js";
import { checkRateLimit } from "../_shared/rateLimiter.ts";
import { sendEmail } from "../server/lib/email.ts";
import { sendSMS } from "../server/lib/sms.ts";
import * as kv from "../server/kv_store.tsx";

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

const normalizeContact = (contact: string) => contact.trim();

const resolveUserId = async (authHeader?: string): Promise<string | null> => {
  try {
    if (!authHeader) return null;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return null;
    return user.id;
  } catch {
    return null;
  }
};

app.post('/', async (c) => {
  try {
    const payload = await c.req.json();
    const contact: string = normalizeContact(payload?.contact || '');
    const channel: 'email' | 'sms' | 'whatsapp' | 'link' = payload?.channel || 'link';
    const inviterFromBody: string | undefined = payload?.inviter_user_id;
    const authHeader = c.req.header('Authorization');
    const inviterUserId = (await resolveUserId(authHeader)) || inviterFromBody || null;

    if (!inviterUserId) {
      return c.json({ error: 'Unauthorized: inviter not resolved' }, 401);
    }

    if (!contact && channel !== 'link') {
      return c.json({ error: 'Contact is required for non-link channels' }, 400);
    }

    const limit = await checkRateLimit(inviterUserId, 'invite_send', 5, 60);
    if (!limit.allowed) {
      return c.json({ error: 'Rate limit exceeded' }, 429);
    }

    // Ensure default referral exists for inviter
    const appUrl = Deno.env.get('APP_URL') || 'https://gidipin.com';
    let { data: existingDefault } = await supabase
      .from('referrals')
      .select('*')
      .eq('inviter_user_id', inviterUserId)
      .eq('is_default', true)
      .limit(1)
      .single();

    if (!existingDefault) {
      const defaultCode = crypto.randomUUID();
      const defaultLink = `${appUrl}/get-started?ref=${defaultCode}`;
      const { data: createdDefault } = await supabase
        .from('referrals')
        .insert({
          inviter_user_id: inviterUserId,
          contact: null,
          channel: 'link',
          status: 'sent',
          is_default: true,
          referral_code: defaultCode,
          referral_link: defaultLink,
          sent_at: new Date().toISOString(),
        })
        .select()
        .single();
      existingDefault = createdDefault || null;
    }

    const referralCode = crypto.randomUUID();
    const referralLink = `${appUrl}/get-started?ref=${referralCode}`;

    const { data, error } = await supabase
      .from('referrals')
      .insert({
        inviter_user_id: inviterUserId,
        contact: contact || null,
        channel,
        status: 'sent',
        referral_code: referralCode,
        referral_link: referralLink,
        sent_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return c.json({ error: `Failed to create referral: ${error.message}` }, 500);
    }

    // Dispatch delivery and capture result
    let delivery_result: any = {};
    try {
      if (channel === 'email' && contact) {
        const subject = 'Join me on GidiPIN';
        const html = `<p>Your friend invited you to GidiPIN.</p><p>Join here: <a href="${existingDefault?.referral_link || referralLink}">${existingDefault?.referral_link || referralLink}</a></p>`;
        const text = `Join GidiPIN: ${existingDefault?.referral_link || referralLink}`;
        const emailRes = await sendEmail(contact, subject, html, text, { userId: inviterUserId, channel });
        delivery_result.email = emailRes;
      } else if (channel === 'sms' && contact) {
        const message = `Join me on GidiPIN: ${existingDefault?.referral_link || referralLink}`;
        const smsRes = await sendSMS(contact, message);
        delivery_result.sms = smsRes;
      }
    } catch (e) {
      try { await kv.set(`invite:dispatch:error:${Date.now()}`, { inviterUserId, contact, channel, error: e?.message || 'unknown' }) } catch {}
      delivery_result.error = e?.message || 'unknown';
    }

    try { await kv.set(`invite:event:${Date.now()}`, { inviterUserId, contact, channel, referral_code: referralCode, ts: new Date().toISOString() }) } catch {}

    return c.json({ success: true, referral: data, default_referral_link: existingDefault?.referral_link || null, delivery_result });
  } catch (e: any) {
    return c.json({ error: e?.message || 'Invite failed' }, 500);
  }
});

// Aliases for flexibility
app.post('/invite', (c) => app.fetch(c.req.raw));
app.post('/functions/v1/invite', (c) => app.fetch(c.req.raw));

// Accept referral
app.post('/accept', async (c) => {
  try {
    const payload = await c.req.json();
    const code = (payload?.referral_code || '').trim();
    if (!code) return c.json({ error: 'referral_code is required' }, 400);

    const { data, error } = await supabase
      .from('referrals')
      .update({ status: 'accepted', accepted_at: new Date().toISOString() })
      .eq('referral_code', code)
      .select()
      .single();

    if (error) return c.json({ error: `Failed to accept referral: ${error.message}` }, 500);
    return c.json({ success: true, referral: data });
  } catch (e: any) {
    return c.json({ error: e?.message || 'Accept failed' }, 500);
  }
});

// Stats for inviter
app.get('/stats', async (c) => {
  try {
    const inviter = (c.req.query('inviter') || '').trim();
    if (!inviter) return c.json({ error: 'inviter is required' }, 400);

    const { data: rows, error } = await supabase
      .from('referrals')
      .select('status')
      .eq('inviter_user_id', inviter);

    if (error) return c.json({ error: `Failed to fetch stats: ${error.message}` }, 500);

    const total = rows?.length || 0;
    const accepted = rows?.filter(r => r.status === 'accepted').length || 0;
    const sent = rows?.filter(r => r.status === 'sent').length || 0;
    return c.json({ success: true, stats: { total, sent, accepted } });
  } catch (e: any) {
    return c.json({ error: e?.message || 'Stats failed' }, 500);
  }
});

// Report referral (moderation)
app.post('/report', async (c) => {
  try {
    const payload = await c.req.json();
    const code = (payload?.referral_code || '').trim();
    const reason = (payload?.reason || '').trim();
    if (!code) return c.json({ error: 'referral_code is required' }, 400);

    const { data, error } = await supabase
      .from('referrals')
      .update({
        moderation_status: 'reported',
        report_count: (payload?.increment || 1),
        report_reason: reason || null,
        updated_at: new Date().toISOString()
      })
      .eq('referral_code', code)
      .select()
      .single();

    if (error) return c.json({ error: `Failed to report referral: ${error.message}` }, 500);
    try { await kv.set(`invite:report:${Date.now()}`, { code, reason, ts: new Date().toISOString() }) } catch {}
    return c.json({ success: true, referral: data });
  } catch (e: any) {
    return c.json({ error: e?.message || 'Report failed' }, 500);
  }
});

Deno.serve(app.fetch);
