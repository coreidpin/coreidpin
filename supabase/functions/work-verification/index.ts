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

    const { action, experienceId, email, code } = await req.json()

    if (action === 'send-code') {
        // Generate flexible 6-digit code
        const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Save to DB
        const { error } = await supabaseClient
            .from('work_experiences')
            .update({
                work_email: email,
                company_verification_code: generatedCode,
                verification_status: 'pending'
            })
            .eq('id', experienceId)
        
        if (error) throw error;

        // Send ACTUAL email using Resend
        let emailSent = false;
        let emailError = null;
        
        try {
            const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
            
            if (!RESEND_API_KEY) {
                console.warn('[Email] No RESEND_API_KEY found, code will be shown in toast');
                emailError = 'No API key configured';
            } else {
                const emailResponse = await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${RESEND_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        from: 'gidiPin <noreply@usepin.xyz>',
                        to: [email],
                        subject: 'Verify Your Work Email - CoreIDPin',
                        html: `
                            <!DOCTYPE html>
                            <html>
                            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                                    <h1 style="color: white; margin: 0; font-size: 28px;">Verify Your Work Email</h1>
                                </div>
                                
                                <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
                                    <p style="font-size: 16px; margin-bottom: 20px;">Hi there,</p>
                                    
                                    <p style="font-size: 16px; margin-bottom: 20px;">
                                        You've requested to verify your work email for CoreIDPin. Enter the code below to complete the verification:
                                    </p>
                                    
                                    <div style="background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
                                        <p style="margin: 0; font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Verification Code</p>
                                        <h2 style="margin: 10px 0 0 0; font-size: 36px; color: #667eea; letter-spacing: 8px; font-weight: bold;">${generatedCode}</h2>
                                    </div>
                                    
                                    <p style="font-size: 14px; color: #666; margin-top: 30px;">
                                        This code will expire in 15 minutes. If you didn't request this verification, please ignore this email.
                                    </p>
                                    
                                    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #999;">
                                        <p>© 2025 CoreIDPin. All rights reserved.</p>
                                        <p>Secure Professional Identity Hub</p>
                                    </div>
                                </div>
                            </body>
                            </html>
                        `
                    })
                });

                const emailResult = await emailResponse.json();
                
                if (!emailResponse.ok) {
                    console.error('[Email Error]', emailResult);
                    emailError = emailResult.message || 'Failed to send email';
                    throw new Error(emailError);
                }
                
                emailSent = true;
                console.log(`[Email] Verification code sent to ${email} via Resend (ID: ${emailResult.id})`);
            }
        } catch (error) {
            console.error('[Email Error]', error);
            emailError = error.message || 'Email service error';
            // Don't fail the whole request if email fails - user can still see the code
        }

        return new Response(
            JSON.stringify({ 
                success: true, 
                message: emailSent ? 'Verification code sent to your email' : 'Code generated (email failed to send)',
                email_sent: emailSent,
                debug_code: !emailSent ? generatedCode : undefined, // Show code if email failed
                email_error: emailError
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

    if (action === 'verify-code') {
        // Fetch valid code
        const { data, error } = await supabaseClient
            .from('work_experiences')
            .select('company_verification_code, verification_status')
            .eq('id', experienceId)
            .single()
        
        if (error || !data) throw new Error('Experience not found');

        // Sanitize inputs
        const submittedCode = String(code).trim();
        const storedCode = String(data.company_verification_code || '').trim();

        console.log(`[Verification Debug] Exp: ${experienceId} | Submitted: '${submittedCode}' | Stored: '${storedCode}'`);

        if (storedCode !== submittedCode) {
             return new Response(
                JSON.stringify({ success: false, error: 'Invalid verification code' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            )
        }

        // Success - update status
        const { error: updateError } = await supabaseClient
            .from('work_experiences')
            .update({
                verification_status: 'verified',
                verified_at: new Date().toISOString(),
                company_verification_code: null // Clear code after use
            })
            .eq('id', experienceId)
        
        if (updateError) throw updateError;

        // Increase Trust Score
        // 1. Get User ID
        const { data: expData } = await supabaseClient
            .from('work_experiences')
            .select('user_id')
            .eq('id', experienceId)
            .single();
        
        if (expData?.user_id) {
            // 2. RPC call is safest for atomic increment, but select+update is okay for prototype
            const { data: pin } = await supabaseClient
                .from('professional_pins')
                .select('trust_score')
                .eq('user_id', expData.user_id)
                .single();
            
            if (pin) {
                const newScore = Math.min((pin.trust_score || 0) + 10, 100); // Max 100
                await supabaseClient
                    .from('professional_pins')
                    .update({ trust_score: newScore })
                    .eq('user_id', expData.user_id);
                console.log(`[Trust Score] Incremented to ${newScore} for user ${expData.user_id}`);
            }
        }

        return new Response(
            JSON.stringify({ success: true, message: 'Work email verified successfully' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

    throw new Error('Invalid action')

  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
