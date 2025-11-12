import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: { 
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      } 
    });
  }

  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return new Response(
        JSON.stringify({ error: 'Email and code are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find the verification record
    const { data, error } = await supabase
      .from('email_verifications')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .eq('verified', false)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid or expired verification code' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // Mark as verified
    const { error: updateError } = await supabase
      .from('email_verifications')
      .update({ verified: true })
      .eq('id', data.id);

    if (updateError) {
      console.error('Update error:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to verify code' }),
        { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // Update Supabase Auth user email_confirmed_at
    // First, find the user by email
    const { data: authUser, error: authUserError } = await supabase.auth.admin.listUsers();
    
    if (!authUserError && authUser?.users) {
      const user = authUser.users.find((u: any) => u.email === email);
      
      if (user && !user.email_confirmed_at) {
        // Confirm the user's email in Supabase Auth
        const { error: confirmError } = await supabase.auth.admin.updateUserById(
          user.id,
          { email_confirm: true }
        );
        
        if (confirmError) {
          console.warn('Failed to confirm email in Auth:', confirmError);
          // Don't fail the request - verification code is already marked as used
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email verified successfully' 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }
});
