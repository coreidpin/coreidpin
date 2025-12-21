import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { verify } from "https://deno.land/x/djwt@v2.9.1/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Verify User from Auth Header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing Authorization header')
    }
    const token = authHeader.replace('Bearer ', '')
    let userId: string | null = null;
    let userEmail: string | null = null;

    // Attempt 1: Standard Supabase Auth
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)

    if (!userError && user) {
      userId = user.id;
      userEmail = user.email || null;
    } else {
        // Attempt 2: Manual JWT Verification (For Custom Tokens)
        console.log('Standard Auth failed, trying manual verification:', userError?.message);
        
        try {
            const jwtSecret = Deno.env.get('JWT_SECRET') || Deno.env.get('SUPABASE_JWT_SECRET');
            if (!jwtSecret) throw new Error('JWT Secret not configured');

            const key = await crypto.subtle.importKey(
              "raw",
              new TextEncoder().encode(jwtSecret),
              { name: "HMAC", hash: "SHA-256" },
              false,
              ["verify"]
            );

            const payload = await verify(token, key);
            if (payload && payload.sub) {
                userId = payload.sub as string;
                userEmail = (payload.email as string) || null;
                console.log('Manual verification successful for:', userId);
            }
        } catch (verifyError) {
            console.error('Manual verification failed:', verifyError);
            throw new Error(`Invalid user token: ${userError?.message || 'Verification failed'}`);
        }
    }

    if (!userId) {
        throw new Error('User could not be authenticated');
    }

    const { lead_id, message } = await req.json()

    if (!lead_id || !message) {
      throw new Error('Missing lead_id or message')
    }

    // 2. Fetch Lead and Verify Ownership
    const { data: lead, error: leadError } = await supabaseClient
      .from('job_leads')
      .select('*, professional_id')
      .eq('id', lead_id)
      .single()

    if (leadError || !lead) {
      throw new Error('Lead not found')
    }

    if (lead.professional_id !== userId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized: You do not own this lead' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }

    // 3. Get Professional Profile (for Reply-To and Name)
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('email, full_name, name')
      .eq('user_id', userId)
      .single()
    
    // Fallback email if profile has none or fetching failed (use auth email)
    const professionalEmail = profile?.email || userEmail;
    const professionalName = profile?.full_name || profile?.name || 'GidiPIN Professional';

    // 4. Send Email via Resend
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    
    if (!RESEND_API_KEY) {
      console.log('Simulating email send (No API Key):', { to: lead.sender_email, message });
    } else {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'GidiPIN Notifications <noreply@usepin.xyz>',
            to: [lead.sender_email],
            reply_to: professionalEmail,
            subject: `Re: Your Project Inquiry`,
            html: `
                <!DOCTYPE html>
                <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: white; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
                        <p style="font-size: 16px;">Hi <strong>${lead.sender_name.split(' ')[0]}</strong>,</p>
                        <p><strong>${professionalName}</strong> has replied to your inquiry:</p>
                        
                        <div style="background: #f9fafb; padding: 15px; border-radius: 6px; border-left: 4px solid #000; margin: 20px 0;">
                            <p style="margin: 0; white-space: pre-wrap;">${message}</p>
                        </div>
                        
                        <p style="color: #666; font-size: 14px;">You can reply directly to this email to continue the conversation.</p>
                    </div>
                </body>
                </html>
            `
          })
        });

        if (!emailResponse.ok) {
            const err = await emailResponse.json();
            console.error('Resend Error:', err);
            throw new Error('Failed to deliver email');
        }
    }

    // 5. Update Lead Status
    await supabaseClient
      .from('job_leads')
      .update({ status: 'replied' })
      .eq('id', lead_id);

    return new Response(
      JSON.stringify({ success: true, message: 'Reply sent successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
