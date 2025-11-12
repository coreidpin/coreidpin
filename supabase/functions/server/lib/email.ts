import * as kv from "../kv_store.tsx";

export async function sendEmail(to: string, subject: string, html: string, text: string, context: Record<string, any> = {}) {
  const apiKey = Deno.env.get('RESEND_API_KEY') || ''
  const from = Deno.env.get('FROM_EMAIL') || ''
  if (!apiKey || !from) {
    const payload = { success: false, error: 'Missing email configuration', to, subject, ts: new Date().toISOString(), ...context }
    try { await kv.set(`email:send:error:${Date.now()}`, payload) } catch {}
    return payload
  }
  let attempt = 0
  const max = 3
  let lastErr: any = null
  while (attempt < max) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({ from, to, subject, html, text })
      })
      const data = await res.json().catch(() => ({}))
      const entry = { to, subject, status: res.status, id: data?.id || null, ts: new Date().toISOString(), ...context }
      if (res.ok) {
        try { await kv.set(`email:send:success:${Date.now()}`, entry) } catch {}
        return { success: true, id: data?.id || null }
      } else {
        lastErr = data?.error || `Email send failed (${res.status})`
        try { await kv.set(`email:send:failure:${Date.now()}`, { ...entry, error: lastErr }) } catch {}
        // Retry only on 5xx
        if (res.status >= 500) {
          await new Promise(r => setTimeout(r, 500 * (attempt + 1)))
          attempt++
          continue
        }
        return { success: false, error: lastErr }
      }
    } catch (e: any) {
      lastErr = e?.message || 'Network error'
      try { await kv.set(`email:send:exception:${Date.now()}`, { to, subject, error: lastErr, ts: new Date().toISOString(), ...context }) } catch {}
      await new Promise(r => setTimeout(r, 500 * (attempt + 1)))
      attempt++
    }
  }
  return { success: false, error: lastErr || 'Email send failed' }
}

export async function testResendHealth() {
  const apiKey = Deno.env.get('RESEND_API_KEY') || ''
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${apiKey}` }
    })
    const healthy = res.status !== 401 && res.status !== 403
    const entry = { ts: new Date().toISOString(), status: res.status, healthy }
    try { await kv.set(`email:health:${Date.now()}`, entry) } catch {}
    return entry
  } catch (e: any) {
    const entry = { ts: new Date().toISOString(), status: 0, healthy: false, error: e?.message || 'Network error' }
    try { await kv.set(`email:health:error:${Date.now()}`, entry) } catch {}
    return entry
  }
}
