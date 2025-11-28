import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { sendEmail } from '../server/lib/email.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' } });
  }

  try {
    const { to, endorserName, professionalName, verificationUrl, customMessage } = await req.json();

    const subject = `${professionalName} has requested your endorsement`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #000; color: #fff; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; background: #f9f9f9; }
            .button { display: inline-block; padding: 12px 30px; background: #000; color: #fff; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Endorsement Request</h1>
            </div>
            <div class="content">
              <p>Hi ${endorserName},</p>
              <p>${professionalName} has requested your professional endorsement.</p>
              ${customMessage ? `<p><strong>Their message:</strong><br/>"${customMessage}"</p>` : ''}
              <p>Click the button below to write your endorsement:</p>
              <a href="${verificationUrl}" class="button">Write Endorsement</a>
              <p style="font-size: 12px; color: #666;">Or copy this link: ${verificationUrl}</p>
              <p>This link will expire in 7 days.</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `Hi ${endorserName},\n\n${professionalName} has requested your professional endorsement.\n\n${customMessage ? `Their message: "${customMessage}"\n\n` : ''}Click here to write your endorsement: ${verificationUrl}\n\nThis link will expire in 7 days.`;

    const result = await sendEmail(to, subject, html, text, { type: 'endorsement_request' });

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
});
