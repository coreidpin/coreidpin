import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { publicToken } = await req.json()

    // 1. Exchange Public Token for Access Token (Finch)
    const CLIENT_ID = Deno.env.get('FINCH_CLIENT_ID') || '93d90810-e1fe-4adf-9675-0f435ec77a06';
    const CLIENT_SECRET = Deno.env.get('FINCH_CLIENT_SECRET') || 'finch-secret-sandbox-9g0W2oP-JtdbRt_6u63pqGs8zmkCpMcDnK9MWQ5O';

    // 2. Real Token Exchange
    const tokenResponse = await fetch('https://api.tryfinch.com/auth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: publicToken,
        redirect_uri: 'https://tryfinch.com/platform/sandbox' 
      })
    });

    if (!tokenResponse.ok) {
        const errText = await tokenResponse.text();
        console.error('Finch Token Error:', errText);
        throw new Error('Failed to exchange token with Finch');
    }
    const { access_token } = await tokenResponse.json();

    // 3. Fetch Employment & Company Data
    const [employmentRes, companyRes] = await Promise.all([
        fetch('https://api.tryfinch.com/employer/employment', {
            headers: { 'Authorization': `Bearer ${access_token}` }
        }),
        fetch('https://api.tryfinch.com/employer/company', {
            headers: { 'Authorization': `Bearer ${access_token}` }
        })
    ]);

    const { responses: empResponses } = await employmentRes.json();
    const companyData = await companyRes.json();

    const employment = empResponses[0]?.body;
    
    if (!employment) throw new Error('No employment data found');

    const realData = {
      provider: 'finch',
      company_name: companyData.legal_name || companyData.entity?.name || 'Verified Employer',
      job_title: employment.title || 'Verified Position',
      start_date: employment.start_date,
      employment_type: employment.employment_type === 'full_time' ? 'Full-time' : 'Contract', // Normalize
      is_current: employment.is_active,
      verified: true
    };

    // 4. Return Data (Frontend will handle DB insert for this demo flow)
    return new Response(
      JSON.stringify(realData),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    )
  }
})
