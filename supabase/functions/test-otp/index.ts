import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { method } = req
  
  // Handle CORS
  if (method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  if (method === 'POST') {
    try {
      const body = await req.json()
      const { phone, name, email } = body
      
      if (!phone || !name) {
        return new Response(
          JSON.stringify({ success: false, error: 'Phone and name are required' }),
          { 
            status: 400,
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          }
        )
      }
      
      // Generate a test OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString()
      const regToken = crypto.randomUUID()
      
      console.log(`Test OTP for ${phone}: ${otp}`)
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          reg_token: regToken,
          expires_in: 600,
          message: 'Test OTP sent (check console logs)'
        }),
        { 
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      )
    } catch (error) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { 
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      )
    }
  }
  
  return new Response(
    JSON.stringify({ message: 'Test OTP function' }),
    { 
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    }
  )
})