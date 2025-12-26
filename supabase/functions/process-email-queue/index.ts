import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    // Get pending emails
    const { data: pendingEmails, error } = await supabase.rpc('get_pending_emails', {
      p_limit: 100
    })

    if (error) {
      console.error('Error fetching pending emails:', error)
      throw error
    }

    console.log(`Processing ${pendingEmails?.length || 0} pending emails...`)

    let sent = 0
    let failed = 0

    // Process each email
    for (const email of pendingEmails || []) {
      try {
        // Generate unsubscribe token
        const { data: tokenData } = await supabase.rpc('generate_unsubscribe_token', {
          p_user_id: email.user_id,
          p_email_type: email.template_id.includes('marketing') ? 'marketing' : 'all'
        })

        const unsubscribeUrl = `${SUPABASE_URL.replace('supabase.co', 'supabase.co')}/unsubscribe?token=${tokenData}`

        // Add unsubscribe URL to variables
        const variables = {
          ...email.variables,
          queueId: email.id,
          unsubscribeUrl
        }

        // Call send-email function
        const sendResponse = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            to: email.to_email,
            template: email.template_id,
            subject: email.subject,
            variables,
            userId: email.user_id
          })
        })

        const sendData = await sendResponse.json()

        if (sendData.success) {
          // Mark as sent (already done in send-email function)
          sent++
          console.log(`✅ Sent email ${email.id} to ${email.to_email}`)
        } else {
          throw new Error(sendData.error || 'Unknown error')
        }

      } catch (emailError: any) {
        // Mark as failed
        await supabase.rpc('mark_email_failed', {
          p_queue_id: email.id,
          p_error_message: emailError.message
        })
        
        failed++
        console.error(`❌ Failed to send email ${email.id}:`, emailError.message)
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: pendingEmails?.length || 0,
        sent,
        failed
      }),
      { 
        headers: { 'Content-Type': 'application/json' }
      }
    )

  } catch (error: any) {
    console.error('Queue processor error:', error)
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
})
