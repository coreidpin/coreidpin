export function buildVerificationEmail(name: string | undefined, email: string, link: string, siteUrl: string) {
  const subject = 'Verify your PIN account'
  const displayName = name || 'There'
  const html = `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111">
    <h1 style="font-size:20px;margin:0 0 12px">Welcome ${displayName}</h1>
    <p style="margin:0 0 16px">Please verify your email to activate your account.</p>
    <p style="margin:0 0 16px"><a href="${link}" style="background:#111;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none">Verify Email</a></p>
    <p style="margin:0 0 16px">If the button doesn’t work, copy and paste this link:</p>
    <p style="word-break:break-all;color:#555">${link}</p>
    <hr style="border:none;border-top:1px solid #e5e5e5;margin:20px 0" />
    <p style="margin:0;color:#555">This link will expire. If you didn’t create an account, you can ignore this email.</p>
    <p style="margin:8px 0 0;color:#555">${siteUrl}</p>
  </div>`
  const text = `Welcome ${displayName}\nVerify your email: ${link}\n${siteUrl}`
  return { subject, html, text }
}
