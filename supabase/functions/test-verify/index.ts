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
      const { phone, otp, reg_token } = body
      
      if (!phone || !otp || !reg_token) {
        return new Response(
          JSON.stringify({ success: false, error: 'Phone, OTP, and registration token are required' }),
          { 
            status: 400,
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          }
        )
      }
      
      // For testing, accept any 6-digit OTP
      if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid OTP format' }),
          { 
            status: 400,
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          }
        )
      }
      
      console.log(`Test verification for ${phone} with OTP: ${otp}`)
      
      return new Response(
        JSON.stringify({ 
          success: true,
          phone_verified: true,
          reg_token,
          message: 'Test verification successful'
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
    JSON.stringify({ message: 'Test OTP verification function' }),
    { 
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    }
  )
})