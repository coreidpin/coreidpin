export function buildVerificationEmail(name: string | undefined, email: string, link: string, siteUrl: string) {
  const subject = 'Verify your PIN account'
  const displayName = name || 'There'
  const support = 'support@gidipin.work'
  const html = `
  <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#fafbfd;color:#111">
    <h1 style="font-size:22px;margin:0 0 12px">Verify your email</h1>
    <p style="margin:0 0 12px;color:#555">Hello ${displayName}, please confirm your email to activate your account.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:16px 0"><tr><td>
      <a href="${link}" style="display:inline-block;background:#111;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none">Verify Email</a>
    </td></tr></table>
    <p style="margin:0 0 12px;color:#555">If the button doesn’t work, copy and paste this link:</p>
    <p style="word-break:break-all;color:#555">${link}</p>
    <div style="margin:16px 0;padding:12px;border:1px solid #e5e5e5;border-radius:8px;background:#fff">
      <p style="margin:0 0 8px;color:#555"><strong>Account:</strong> ${email}</p>
      <p style="margin:0 0 8px;color:#555"><strong>Expires:</strong> 24 hours</p>
      <p style="margin:0;color:#555"><strong>Support:</strong> ${support}</p>
    </div>
    <p style="margin:16px 0;color:#555">If you didn’t request this email, you can safely ignore it.</p>
    <hr style="border:none;border-top:1px solid #e5e5e5;margin:20px 0" />
    <p style="margin:0;color:#555">${siteUrl}</p>
  </div>`
  const text = `Verify your email\nHello ${displayName}\nLink: ${link}\nAccount: ${email}\nExpires: 24 hours\nSupport: ${support}\n${siteUrl}`
  return { subject, html, text }
}
