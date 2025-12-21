import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

    const { professional_id, sender_name, sender_email, inquiry_type, message, budget_range } = await req.json()

    // 1. Get Professional's Email
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('email, full_name, name')
      .eq('user_id', professional_id)
      .single()
    
    if (profileError || !profile || !profile.email) {
      console.error('Professional email not found:', profileError);
      return new Response(
        JSON.stringify({ success: false, error: 'Professional email not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    const professionalEmail = profile.email;
    const professionalName = profile.full_name || profile.name || 'Professional';

    // 2. Send Email via Resend
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured');
      // For development w/o key, we just return success but log it
      return new Response(
        JSON.stringify({ success: true, message: 'Simulated email (no key configured)' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'GidiPIN Notifications <noreply@usepin.xyz>',
        to: [professionalEmail],
        reply_to: sender_email,
        subject: `New Inquiry from ${sender_name}: ${inquiry_type}`,
        html: `
            <!DOCTYPE html>
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #0e0f12 0%, #1a1b1f 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">New Job Lead 🚀</h1>
                </div>
                
                <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
                    <p style="font-size: 16px;">Hi <strong>${professionalName}</strong>,</p>
                    <p>You have received a new inquiry on your GidiPIN profile!</p>
                    
                    <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 20px 0;">
                        <p style="margin: 0 0 10px 0;"><strong>From:</strong> ${sender_name} (<a href="mailto:${sender_email}">${sender_email}</a>)</p>
                        <p style="margin: 0 0 10px 0;"><strong>Type:</strong> <span style="text-transform: capitalize; background: #e0f2fe; color: #0284c7; padding: 2px 6px; rounded: 4px; font-size: 12px;">${inquiry_type.replace('_', ' ')}</span></p>
                        <p style="margin: 0 0 10px 0;"><strong>Budget:</strong> ${budget_range || 'Not specified'}</p>
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 15px 0;">
                        <p style="margin: 0; color: #555; white-space: pre-wrap;">"${message}"</p>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="https://usepin.xyz/dashboard" style="background: #000; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold;">View in Dashboard</a>
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #999;">
                    <p>© 2025 CoreIDPin. All rights reserved.</p>
                </div>
            </body>
            </html>
        `
      })
    });

    const emailResult = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error('Resend API Error:', emailResult);
      throw new Error(emailResult.message || 'Failed to send email');
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully' }),
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
