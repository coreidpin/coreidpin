import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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
    const data = await req.json()

    if (!data.email) {
      throw new Error('Email is required')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    // Insert into waitlist table
    const { error } = await supabaseClient
      .from('waitlist')
      .insert({
        full_name: data.full_name,
        email: data.email,
        user_type: data.user_type || 'professional',
        problem_to_solve: data.problem_to_solve,
        current_verification_method: data.current_verification_method,
        use_phone_as_pin: data.use_phone_as_pin,
        importance_level: data.importance_level,
        expected_usage: data.expected_usage,
        heard_about_us: data.heard_about_us,
        country: data.country,
        wants_early_access: data.wants_early_access,
        willing_to_provide_feedback: data.willing_to_provide_feedback,
        created_at: new Date().toISOString()
      })

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Successfully added to waitlist'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})