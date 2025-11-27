// SMS service integration
export async function sendSMS(phone: string, message: string): Promise<{ success: boolean; error?: string }> {
  const twilioSid = Deno.env.get('TWILIO_ACCOUNT_SID');
  const twilioToken = Deno.env.get('TWILIO_AUTH_TOKEN');
  const twilioFrom = Deno.env.get('TWILIO_PHONE_NUMBER');
  
  // Fallback to console for development
  if (!twilioSid || !twilioToken || !twilioFrom) {
    console.log('SMS sent (test mode)');
    return { success: true };
  }
  
  try {
    const auth = btoa(`${twilioSid}:${twilioToken}`);
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: phone,
        From: twilioFrom,
        Body: message,
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      return { success: false, error };
    }
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}