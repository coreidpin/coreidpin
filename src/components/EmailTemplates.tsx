import React from 'react';

/**
 * Email Templates for swipe Platform
 * 
 * These are HTML email templates that can be used with email services like:
 * - Supabase Auth (for password reset and email confirmation)
 * - SendGrid, Postmark, or other email providers (for welcome emails)
 * 
 * To use with Supabase Auth:
 * 1. Go to Authentication > Email Templates in your Supabase dashboard
 * 2. Replace the default templates with these custom ones
 * 3. Variables like {{ .ConfirmationURL }} will be automatically populated by Supabase
 */

export const emailTemplates = {
  /**
   * Welcome Email Template
   * Sent after successful registration
   */
  welcome: {
    subject: 'Welcome to GidiPIN - Let\'s Get You Started! 🎉',
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to GidiPIN</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #fafbfd;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fafbfd; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); overflow: hidden;">
          
          <!-- Header with Brand Colors -->
          <tr>
            <td style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 40px 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                🤝 GidiPIN
              </h1>
              <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">
                Bridging African Talent with Global Opportunities
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <!-- Greeting -->
              <h2 style="margin: 0 0 20px; color: #1a1d24; font-size: 24px; font-weight: 600;">
                Welcome aboard, {{.UserName}}! 🎉
              </h2>
              
              <p style="margin: 0 0 16px; color: #475569; font-size: 16px; line-height: 1.6;">
                <strong>My chief, you don dey inside!</strong> We're thrilled to have you join the GidiPIN family. You've just taken the first step towards {{.UserTypeDescription}}.
              </p>

              <p style="margin: 0 0 24px; color: #475569; font-size: 16px; line-height: 1.6;">
                Here's what you can do next:
              </p>

              <!-- Action Steps -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px; background-color: #f8fafc; border-left: 4px solid #2563eb; border-radius: 6px; margin-bottom: 12px;">
                    <p style="margin: 0; color: #1a1d24; font-size: 15px; font-weight: 600;">
                      ✅ Complete Your Profile
                    </p>
                    <p style="margin: 8px 0 0; color: #64748b; font-size: 14px; line-height: 1.5;">
                      {{.ProfileStepDescription}}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px; background-color: #f8fafc; border-left: 4px solid #10b981; border-radius: 6px; margin-bottom: 12px;">
                    <p style="margin: 0; color: #1a1d24; font-size: 15px; font-weight: 600;">
                      🎯 {{.SecondStepTitle}}
                    </p>
                    <p style="margin: 8px 0 0; color: #64748b; font-size: 14px; line-height: 1.5;">
                      {{.SecondStepDescription}}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px; background-color: #f8fafc; border-left: 4px solid #f59e0b; border-radius: 6px;">
                    <p style="margin: 0; color: #1a1d24; font-size: 15px; font-weight: 600;">
                      🚀 {{.ThirdStepTitle}}
                    </p>
                    <p style="margin: 8px 0 0; color: #64748b; font-size: 14px; line-height: 1.5;">
                      {{.ThirdStepDescription}}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="{{.DashboardURL}}" style="display: inline-block; padding: 14px 32px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.3);">
                      Go to Dashboard →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Support Info -->
              <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0 0 16px; color: #64748b; font-size: 14px; line-height: 1.6;">
                  <strong>Need help?</strong> Our support team is here for you. Reply to this email or visit our Help Center.
                </p>
                <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                  <strong>Pro tip:</strong> Bookmark your dashboard for quick access anytime!
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 32px 40px; background-color: #f8fafc; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 12px; color: #475569; font-size: 14px;">
                © 2025 GidiPIN. All rights reserved.
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                Building bridges between African talent and global opportunities
              </p>
              <div style="margin-top: 16px;">
                <a href="{{.WebsiteURL}}" style="color: #2563eb; text-decoration: none; font-size: 12px; margin: 0 8px;">Website</a>
                <span style="color: #cbd5e1;">|</span>
                <a href="{{.HelpURL}}" style="color: #2563eb; text-decoration: none; font-size: 12px; margin: 0 8px;">Help Center</a>
                <span style="color: #cbd5e1;">|</span>
                <a href="{{.PrivacyURL}}" style="color: #2563eb; text-decoration: none; font-size: 12px; margin: 0 8px;">Privacy Policy</a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    text: `
Welcome to GidiPIN, {{.UserName}}!

My chief, you don dey inside! We're thrilled to have you join the GidiPIN family.

Here's what you can do next:

✅ Complete Your Profile
{{.ProfileStepDescription}}

🎯 {{.SecondStepTitle}}
{{.SecondStepDescription}}

🚀 {{.ThirdStepTitle}}
{{.ThirdStepDescription}}

Go to Dashboard: {{.DashboardURL}}

Need help? Our support team is here for you. Reply to this email or visit our Help Center.

© 2025 GidiPIN. All rights reserved.
    `
  },

  /**
   * Email Confirmation Template
   * Used by Supabase Auth for email verification
   */
  emailConfirmation: {
    subject: 'Confirm Your GidiPIN Email Address',
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm Your Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #fafbfd;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fafbfd; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 40px 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                🤝 GidiPIN
              </h1>
              <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">
                Verify Your Email Address
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <!-- Icon -->
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="display: inline-block; width: 64px; height: 64px; background-color: #e0f2fe; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                  <span style="font-size: 32px;">📧</span>
                </div>
              </div>

              <!-- Greeting -->
              <h2 style="margin: 0 0 20px; color: #1a1d24; font-size: 24px; font-weight: 600; text-align: center;">
                Confirm Your Email
              </h2>
              
              <p style="margin: 0 0 24px; color: #475569; font-size: 16px; line-height: 1.6; text-align: center;">
                Thanks for signing up! Please confirm your email address to complete your registration and access all features.
              </p>

              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 16px 40px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.3);">
                      Confirm Email Address
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Alternative Link -->
              <p style="margin: 24px 0 0; color: #64748b; font-size: 14px; line-height: 1.6; text-align: center;">
                Or copy and paste this link into your browser:
              </p>
              <div style="margin: 12px 0 0; padding: 12px; background-color: #f8fafc; border-radius: 6px; word-break: break-all;">
                <a href="{{ .ConfirmationURL }}" style="color: #2563eb; text-decoration: none; font-size: 13px;">
                  {{ .ConfirmationURL }}
                </a>
              </div>

              <!-- Security Note -->
              <div style="margin-top: 32px; padding: 16px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 6px;">
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                  <strong>🔒 Security note:</strong> This link will expire in 24 hours. If you didn't create an account with GidiPIN, you can safely ignore this email.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 32px 40px; background-color: #f8fafc; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 12px; color: #475569; font-size: 14px;">
                © 2025 GidiPIN. All rights reserved.
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                This is an automated message. Please do not reply to this email.
              </p>
              <div style="margin-top: 16px;">
                <a href="{{.WebsiteURL}}" style="color: #2563eb; text-decoration: none; font-size: 12px; margin: 0 8px;">Website</a>
                <span style="color: #cbd5e1;">|</span>
                <a href="{{.HelpURL}}" style="color: #2563eb; text-decoration: none; font-size: 12px; margin: 0 8px;">Help Center</a>
                <span style="color: #cbd5e1;">|</span>
                <a href="{{.PrivacyURL}}" style="color: #2563eb; text-decoration: none; font-size: 12px; margin: 0 8px;">Privacy Policy</a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    text: `
Confirm Your Email - GidiPIN

Thanks for signing up! Please confirm your email address to complete your registration.

Click here to confirm: {{ .ConfirmationURL }}

This link will expire in 24 hours.

If you didn't create an account with GidiPIN, you can safely ignore this email.

© 2025 GidiPIN. All rights reserved.
    `
  },

  /**
   * Password Reset Template
   * Used by Supabase Auth for password recovery
   */
  passwordReset: {
    subject: 'Reset Your GidiPIN Password',
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #fafbfd;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fafbfd; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 40px 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                🤝 GidiPIN
              </h1>
              <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">
                Password Reset Request
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <!-- Icon -->
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="display: inline-block; width: 64px; height: 64px; background-color: #fef2f2; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                  <span style="font-size: 32px;">🔑</span>
                </div>
              </div>

              <!-- Greeting -->
              <h2 style="margin: 0 0 20px; color: #1a1d24; font-size: 24px; font-weight: 600; text-align: center;">
                Reset Your Password
              </h2>
              
              <p style="margin: 0 0 16px; color: #475569; font-size: 16px; line-height: 1.6; text-align: center;">
                We received a request to reset your password for your GidiPIN account.
              </p>

              <p style="margin: 0 0 24px; color: #475569; font-size: 16px; line-height: 1.6; text-align: center;">
                Click the button below to create a new password:
              </p>

              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 16px 40px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.3);">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Alternative Link -->
              <p style="margin: 24px 0 0; color: #64748b; font-size: 14px; line-height: 1.6; text-align: center;">
                Or copy and paste this link into your browser:
              </p>
              <div style="margin: 12px 0 0; padding: 12px; background-color: #f8fafc; border-radius: 6px; word-break: break-all;">
                <a href="{{ .ConfirmationURL }}" style="color: #2563eb; text-decoration: none; font-size: 13px;">
                  {{ .ConfirmationURL }}
                </a>
              </div>

              <!-- Security Note -->
              <div style="margin-top: 32px; padding: 16px; background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 6px;">
                <p style="margin: 0 0 8px; color: #991b1b; font-size: 14px; line-height: 1.6;">
                  <strong>⚠️ Security Alert</strong>
                </p>
                <p style="margin: 0; color: #7f1d1d; font-size: 14px; line-height: 1.6;">
                  This password reset link will expire in 1 hour for security reasons. If you didn't request a password reset, please ignore this email or contact our support team immediately.
                </p>
              </div>

              <!-- Help Section -->
              <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.6; text-align: center;">
                  <strong>Having trouble?</strong> Contact our support team at support@gidipin.work
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 32px 40px; background-color: #f8fafc; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 12px; color: #475569; font-size: 14px;">
                © 2025 GidiPIN. All rights reserved.
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                This is an automated message. Please do not reply to this email.
              </p>
              <div style="margin-top: 16px;">
                <a href="{{.WebsiteURL}}" style="color: #2563eb; text-decoration: none; font-size: 12px; margin: 0 8px;">Website</a>
                <span style="color: #cbd5e1;">|</span>
                <a href="{{.HelpURL}}" style="color: #2563eb; text-decoration: none; font-size: 12px; margin: 0 8px;">Help Center</a>
                <span style="color: #cbd5e1;">|</span>
                <a href="{{.PrivacyURL}}" style="color: #2563eb; text-decoration: none; font-size: 12px; margin: 0 8px;">Privacy Policy</a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    text: `
Reset Your Password - GidiPIN

We received a request to reset your password for your GidiPIN account.

Click here to reset your password: {{ .ConfirmationURL }}

This link will expire in 1 hour for security reasons.

If you didn't request a password reset, please ignore this email or contact our support team.

© 2025 GidiPIN. All rights reserved.
    `
  },

  /**
   * Magic Link Template (Alternative to password)
   * Used by Supabase Auth for passwordless login
   */
  magicLink: {
    subject: 'Your GidiPIN Sign-In Link',
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign In to GidiPIN</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #fafbfd;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fafbfd; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); overflow: hidden;">
          
          <tr>
            <td style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 40px 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                🤝 GidiPIN
              </h1>
              <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">
                Your Secure Sign-In Link
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <span style="font-size: 48px;">✨</span>
              </div>

              <h2 style="margin: 0 0 20px; color: #1a1d24; font-size: 24px; font-weight: 600; text-align: center;">
                Sign In to GidiPIN
              </h2>
              
              <p style="margin: 0 0 24px; color: #475569; font-size: 16px; line-height: 1.6; text-align: center;">
                Click the button below to securely sign in to your account:
              </p>

              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 16px 40px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.3);">
                      Sign In Now
                    </a>
                  </td>
                </tr>
              </table>

              <div style="margin-top: 32px; padding: 16px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 6px;">
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                  <strong>🔒 Security note:</strong> This link will expire in 15 minutes. If you didn't request this sign-in link, you can safely ignore this email.
                </p>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding: 32px 40px; background-color: #f8fafc; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 12px; color: #475569; font-size: 14px;">
                © 2025 GidiPIN. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `
  }
};

/**
 * Usage Instructions:
 * 
 * 1. FOR SUPABASE AUTH EMAILS (Email Confirmation & Password Reset):
 *    - Go to your Supabase Dashboard
 *    - Navigate to Authentication > Email Templates
 *    - Replace the default templates with the HTML from above
 *    - Supabase automatically replaces variables like {{ .ConfirmationURL }}
 * 
 * 2. FOR WELCOME EMAILS:
 *    - Use an email service (SendGrid, Postmark, etc.)
 *    - Replace template variables with actual values:
 *      {{.UserName}} - User's display name
 *      {{.UserTypeDescription}} - e.g., "connecting with global employers"
 *      {{.DashboardURL}} - Link to dashboard
 *      {{.ProfileStepDescription}} - Description based on user type
 *    - Send via your email service API
 * 
 * 3. EXAMPLE: Sending welcome email from backend
 *    ```
 *    const sendWelcomeEmail = async (user) => {
 *      let html = emailTemplates.welcome.html;
 *      html = html.replace(/\{\{\.UserName\}\}/g, user.name);
 *      html = html.replace(/\{\{\.DashboardURL\}\}/g, 'https://yourapp.com/dashboard');
 *      // ... replace other variables
 *      
 *      // Send via your email provider
 *      await emailProvider.send({
 *        to: user.email,
 *        subject: emailTemplates.welcome.subject,
 *        html: html
 *      });
 *    };
 *    ```
 */

export default emailTemplates;
