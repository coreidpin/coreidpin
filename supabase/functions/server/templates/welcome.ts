export function buildWelcomeEmail(name: string | undefined, siteUrl: string) {
  const subject = 'Welcome to GidiPIN — Your Professional Identity Starts Here'
  const displayName = name || 'There'
  const firstName = name?.split(' ')[0] || 'There'
  const dashboard = `${siteUrl.replace(/\/$/, '')}/dashboard`
  
  const html = `
  <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;color:#1a1a1a;background:#ffffff">
    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px">
      <h1 style="font-size:28px;font-weight:700;margin:0 0 8px;color:#000">Welcome to <span style="color:#3DE6B3">Gidi</span>PIN</h1>
      <p style="font-size:16px;color:#666;margin:0">Your Professional Identity Starts Here</p>
    </div>

    <!-- Greeting -->
    <p style="font-size:16px;line-height:1.6;margin:0 0 24px;color:#1a1a1a">Hi <strong>${firstName}</strong>,</p>
    
    <p style="font-size:16px;line-height:1.6;margin:0 0 16px;color:#1a1a1a">
      Welcome to <strong>GidiPIN</strong> — where your professional identity becomes something solid, trusted, and truly yours.
    </p>
    
    <p style="font-size:16px;line-height:1.6;margin:0 0 24px;color:#1a1a1a">
      You've successfully created your account, and your dashboard is now ready. From here, you can set up your professional identity, verify your phone, manage your PIN, and start building the identity that travels with you across apps, employers, and platforms.
    </p>

    <!-- What's Next Section -->
    <div style="background:#f8f9fa;border-left:4px solid #3DE6B3;padding:20px;margin:24px 0;border-radius:4px">
      <h2 style="font-size:20px;font-weight:700;margin:0 0 16px;color:#000">What's Next?</h2>
      <p style="font-size:14px;margin:0 0 16px;color:#555">Complete these quick steps to unlock your full GidiPIN experience:</p>
      
      <div style="margin-bottom:16px">
        <div style="display:inline-block;width:24px;height:24px;background:#3DE6B3;color:#000;border-radius:50%;text-align:center;line-height:24px;font-weight:700;margin-right:8px">1</div>
        <strong style="color:#1a1a1a">Verify your email</strong>
        <p style="margin:4px 0 0 32px;font-size:14px;color:#666">This helps secure your identity and activates your dashboard features.</p>
      </div>
      
      <div style="margin-bottom:16px">
        <div style="display:inline-block;width:24px;height:24px;background:#3DE6B3;color:#000;border-radius:50%;text-align:center;line-height:24px;font-weight:700;margin-right:8px">2</div>
        <strong style="color:#1a1a1a">Verify your phone number</strong>
        <p style="margin:4px 0 0 32px;font-size:14px;color:#666">Your phone number becomes your unique GidiPIN, your identity "key" across the ecosystem.</p>
      </div>
      
      <div style="margin-bottom:16px">
        <div style="display:inline-block;width:24px;height:24px;background:#3DE6B3;color:#000;border-radius:50%;text-align:center;line-height:24px;font-weight:700;margin-right:8px">3</div>
        <strong style="color:#1a1a1a">Complete your identity setup</strong>
        <p style="margin:4px 0 0 32px;font-size:14px;color:#666">Add basic details, upload your information, and personalize your profile.</p>
      </div>
      
      <div style="margin-bottom:0">
        <div style="display:inline-block;width:24px;height:24px;background:#3DE6B3;color:#000;border-radius:50%;text-align:center;line-height:24px;font-weight:700;margin-right:8px">4</div>
        <strong style="color:#1a1a1a">Explore your dashboard</strong>
        <p style="margin:4px 0 0 32px;font-size:14px;color:#666">Manage your PIN, view activity logs, track identity usage, set preferences, and integrate with apps easily.</p>
      </div>
    </div>

    <!-- CTA Button -->
    <div style="text-align:center;margin:32px 0">
      <a href="${dashboard}" style="display:inline-block;background:#000;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px">Open My Dashboard</a>
    </div>

    <!-- Benefits Section -->
    <div style="margin:32px 0">
      <h2 style="font-size:20px;font-weight:700;margin:0 0 16px;color:#000">You Now Have a Solid Identity</h2>
      <p style="font-size:15px;line-height:1.6;margin:0 0 16px;color:#1a1a1a">
        Your GidiPIN is more than a login — it's your trusted identity infrastructure. It helps you:
      </p>
      
      <ul style="list-style:none;padding:0;margin:0">
        <li style="padding:8px 0 8px 28px;position:relative;font-size:15px;color:#1a1a1a">
          <span style="position:absolute;left:0;color:#3DE6B3">✓</span>
          Sign in to apps faster
        </li>
        <li style="padding:8px 0 8px 28px;position:relative;font-size:15px;color:#1a1a1a">
          <span style="position:absolute;left:0;color:#3DE6B3">✓</span>
          Share verified professional details instantly
        </li>
        <li style="padding:8px 0 8px 28px;position:relative;font-size:15px;color:#1a1a1a">
          <span style="position:absolute;left:0;color:#3DE6B3">✓</span>
          Request endorsements
        </li>
        <li style="padding:8px 0 8px 28px;position:relative;font-size:15px;color:#1a1a1a">
          <span style="position:absolute;left:0;color:#3DE6B3">✓</span>
          Connect opportunities to a single identity
        </li>
        <li style="padding:8px 0 8px 28px;position:relative;font-size:15px;color:#1a1a1a">
          <span style="position:absolute;left:0;color:#3DE6B3">✓</span>
          Build long-term trust with employers & platforms
        </li>
      </ul>
    </div>

    <!-- Closing -->
    <div style="margin:32px 0;padding:24px;background:#f8f9fa;border-radius:8px;text-align:center">
      <p style="font-size:16px;line-height:1.6;margin:0 0 8px;color:#1a1a1a;font-weight:600">
        This is your identity.
      </p>
      <p style="font-size:15px;line-height:1.6;margin:0;color:#666">
        Built for you. Owned by you. Powered everywhere.
      </p>
    </div>

    <p style="font-size:16px;line-height:1.6;margin:24px 0 0;color:#1a1a1a">
      We're excited to see what you build with it.
    </p>
    
    <p style="font-size:16px;line-height:1.6;margin:16px 0;color:#1a1a1a">
      Welcome to GidiPIN.
    </p>

    <!-- Footer -->
    <div style="margin-top:40px;padding-top:24px;border-top:1px solid #e5e5e5">
      <p style="margin:0 0 8px;font-size:15px;color:#1a1a1a;font-weight:600">Best,</p>
      <p style="margin:0;font-size:15px;color:#1a1a1a">The GidiPIN Team</p>
    </div>
    
    <div style="margin-top:32px;padding-top:24px;border-top:1px solid #e5e5e5;text-align:center">
      <p style="margin:0;font-size:13px;color:#999">
        © ${new Date().getFullYear()} GidiPIN. All rights reserved.
      </p>
    </div>
  </div>`
  
  const text = `Welcome to GidiPIN — Your Professional Identity Starts Here

Hi ${firstName},

Welcome to GidiPIN — where your professional identity becomes something solid, trusted, and truly yours.

You've successfully created your account, and your dashboard is now ready. From here, you can set up your professional identity, verify your phone, manage your PIN, and start building the identity that travels with you across apps, employers, and platforms.


WHAT'S NEXT?

Complete these quick steps to unlock your full GidiPIN experience:

1. Verify your email
   This helps secure your identity and activates your dashboard features.

2. Verify your phone number
   Your phone number becomes your unique GidiPIN, your identity "key" across the ecosystem.

3. Complete your identity setup
   Add basic details, upload your information, and personalize your profile.

4. Explore your dashboard
   Manage your PIN, view activity logs, track identity usage, set preferences, and integrate with apps easily.


Access Your Dashboard: ${dashboard}


YOU NOW HAVE A SOLID IDENTITY

Your GidiPIN is more than a login — it's your trusted identity infrastructure.
It helps you:

✓ Sign in to apps faster
✓ Share verified professional details instantly
✓ Request endorsements
✓ Connect opportunities to a single identity
✓ Build long-term trust with employers & platforms


This is your identity.
Built for you.
Owned by you.
Powered everywhere.

We're excited to see what you build with it.

Welcome to GidiPIN.

Best,
The GidiPIN Team

---
© ${new Date().getFullYear()} GidiPIN. All rights reserved.`

  return { subject, html, text }
}
