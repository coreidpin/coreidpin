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

        // Mock Email Sending
        console.log(`[Email Mock] Sending verification code ${generatedCode} to ${email} for experience ${experienceId}`);

        return new Response(
            JSON.stringify({ success: true, message: 'Verification code sent', debug_code: generatedCode }), // debug_code included for demo
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
