export function buildWelcomeEmail(name: string | undefined, siteUrl: string) {
  const subject = 'Welcome to PIN'
  const displayName = name || 'There'
  const dashboard = `${siteUrl.replace(/\/$/, '')}/dashboard`
  const html = `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111">
    <h1 style="font-size:20px;margin:0 0 12px">Welcome ${displayName}</h1>
    <p style="margin:0 0 16px">Your account is ready. Visit your dashboard to get started.</p>
    <p style="margin:0 0 16px"><a href="${dashboard}" style="background:#111;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none">Go to Dashboard</a></p>
    <p style="margin:0 0 16px">Tips:</p>
    <ul style="margin:0 0 16px;color:#555">
      <li>Complete your profile to boost trust.</li>
      <li>Create your PIN to share verified identity.</li>
      <li>Enable notifications for updates.</li>
    </ul>
    <hr style="border:none;border-top:1px solid #e5e5e5;margin:20px 0" />
    <p style="margin:0;color:#555">${siteUrl}</p>
  </div>`
  const text = `Welcome ${displayName}\nDashboard: ${dashboard}\n${siteUrl}`
  return { subject, html, text }
}
