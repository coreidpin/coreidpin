export function buildWelcomeEmail(name: string | undefined, siteUrl: string) {
  const subject = 'Welcome to CoreID'
  const displayName = name || 'There'
  const dashboard = `${siteUrl.replace(/\/$/, '')}/dashboard`
  const html = `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111">
    <h1 style="font-size:20px;margin:0 0 12px">Welcome to CoreID, ${displayName}!</h1>
    <p style="margin:0 0 16px">Your secure digital identity is ready. Visit your dashboard to complete your profile.</p>
    <p style="margin:0 0 16px"><a href="${dashboard}" style="background:#111;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none">Go to Dashboard</a></p>
    <p style="margin:0 0 16px">Next Steps:</p>
    <ul style="margin:0 0 16px;color:#555">
      <li>Complete your professional profile.</li>
      <li>Your Professional PIN has been automatically generated.</li>
      <li>Share your verified identity with confidence.</li>
    </ul>
    <hr style="border:none;border-top:1px solid #e5e5e5;margin:20px 0" />
    <p style="margin:0;color:#555">CoreID - The Standard for Professional Identity</p>
  </div>`
  const text = `Welcome to CoreID, ${displayName}!\nYour secure digital identity is ready.\nDashboard: ${dashboard}\n\nCoreID - The Standard for Professional Identity`
  return { subject, html, text }
}
