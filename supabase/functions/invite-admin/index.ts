import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InviteRequest {
  email: string
  role: 'super_admin' | 'admin' | 'moderator'
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser()

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check if user is an admin
    const { data: adminCheck } = await supabaseClient
      .from('admin_users')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!adminCheck) {
      return new Response(JSON.stringify({ error: 'Forbidden: Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Parse request body
    const { email, role }: InviteRequest = await req.json()

    if (!email || !role) {
      return new Response(JSON.stringify({ error: 'Email and role are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check if user already exists
    const { data: existingProfile } = await supabaseClient
      .from('profiles')
      .select('user_id')
      .eq('email', email)
      .single()

    if (existingProfile) {
      // User exists, add them directly to admin_users
      const { error: insertError } = await supabaseClient
        .from('admin_users')
        .insert({
          user_id: existingProfile.user_id,
          role: role,
          created_by: user.id,
        })

      if (insertError) {
        throw insertError
      }

      // Log the action
      await supabaseClient.from('admin_audit_logs').insert({
        action: 'grant_admin',
        actor_id: user.id,
        target: email,
        status: 'success',
        details: { role },
      })

      return new Response(
        JSON.stringify({
          success: true,
          message: `${email} has been granted ${role} access`,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // User doesn't exist, create invitation
    const token = crypto.randomUUID()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiration

    const { error: inviteError } = await supabaseClient
      .from('admin_invitations')
      .insert({
        email,
        role,
        token,
        invited_by: user.id,
        expires_at: expiresAt.toISOString(),
      })

    if (inviteError) {
      throw inviteError
    }

    // Send invitation email using Supabase Auth
    const inviteUrl = `${Deno.env.get('SITE_URL')}/admin/accept-invitation?token=${token}`
    
    // Use Supabase's built-in email service
    const { error: emailError } = await supabaseClient.auth.admin.inviteUserByEmail(email, {
      data: {
        invitation_type: 'admin',
        role: role,
        invite_url: inviteUrl,
      },
      redirectTo: inviteUrl,
    })

    if (emailError) {
      console.error('Email send error:', emailError)
      // Don't fail the whole operation if email fails
    }

    // Log the action
    await supabaseClient.from('admin_audit_logs').insert({
      action: 'invite_admin',
      actor_id: user.id,
      target: email,
      status: 'success',
      details: { role, token },
    })

    return new Response(
      JSON.stringify({
        success: true,
        message: `Invitation sent to ${email}`,
        token, // Include token for testing purposes
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error in invite-admin function:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
