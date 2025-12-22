import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const APP_URL = Deno.env.get('PUBLIC_APP_URL') || 'http://localhost:5173'

interface InvitationRequest {
  email: string
  role: string
  invitation_token: string
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    const { email, role, invitation_token }: InvitationRequest = await req.json()

    if (!email || !role || !invitation_token) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set')
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Format role name for display
    const roleName = role.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())

    // Create signup URL with invitation token
    const signupUrl = `${APP_URL}/admin/accept-invite/${invitation_token}`

    // Send email via Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Admin Team <admin@gidipin.work>',
        to: [email],
        subject: 'You\'ve been invited as an Administrator',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Admin Invitation</title>
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Administrator Invitation</h1>
              </div>
              
              <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                <p style="font-size: 16px; margin-bottom: 20px;">Hello,</p>
                
                <p style="font-size: 16px; margin-bottom: 20px;">
                  You've been invited to join as an administrator with the role of <strong>${roleName}</strong>.
                </p>
                
                <p style="font-size: 16px; margin-bottom: 25px;">
                  Click the button below to create your account and get started:
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${signupUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; font-size: 16px;">
                    Accept Invitation
                  </a>
                </div>
                
                <p style="font-size: 14px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                  <strong>Note:</strong> This invitation will expire in 7 days.
                </p>
                
                <p style="font-size: 14px; color: #666; margin-top: 15px;">
                  If you didn't expect this invitation, you can safely ignore this email.
                </p>
                
                <p style="font-size: 12px; color: #999; margin-top: 30px; text-align: center;">
                  If the button doesn't work, copy and paste this link into your browser:<br>
                  <a href="${signupUrl}" style="color: #667eea; word-break: break-all;">${signupUrl}</a>
                </p>
              </div>
            </body>
          </html>
        `,
      }),
    })

    if (!emailResponse.ok) {
      const error = await emailResponse.text()
      console.error('Resend API error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: error }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const result = await emailResponse.json()
    console.log('Email sent successfully:', result)

    return new Response(
      JSON.stringify({ success: true, messageId: result.id }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        } 
      }
    )
  } catch (error) {
    console.error('Error sending invitation email:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
