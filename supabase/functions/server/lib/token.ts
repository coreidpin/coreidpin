const enc = new TextEncoder()

function b64url(data: Uint8Array | string) {
  const s = typeof data === 'string' ? data : btoa(String.fromCharCode(...data))
  const r = typeof data === 'string' ? btoa(data) : s
  return r.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

async function importKey(secret: string) {
  const raw = enc.encode(secret)
  return crypto.subtle.importKey('raw', raw, { name: 'HMAC', hash: { name: 'SHA-256' } }, false, ['sign', 'verify'])
}

export async function signVerificationToken(email: string, minutes = 60) {
  const secret = Deno.env.get('VERIFY_TOKEN_SECRET') || ''
  if (!secret) throw new Error('Missing VERIFY_TOKEN_SECRET')
  const key = await importKey(secret)
  const exp = Date.now() + minutes * 60_000
  const payload = JSON.stringify({ email, exp })
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload))
  const token = b64url(payload) + '.' + b64url(new Uint8Array(sig))
  return token
}

export async function verifyVerificationToken(token: string) {
  const secret = Deno.env.get('VERIFY_TOKEN_SECRET') || ''
  if (!secret) throw new Error('Missing VERIFY_TOKEN_SECRET')
  const key = await importKey(secret)
  const [p, s] = token.split('.')
  if (!p || !s) throw new Error('Invalid token')
  const payloadJson = atob(p.replace(/-/g, '+').replace(/_/g, '/'))
  const payload = JSON.parse(payloadJson)
  const sigBytes = Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0))
  const ok = await crypto.subtle.verify('HMAC', key, sigBytes, enc.encode(payloadJson))
  if (!ok) throw new Error('Invalid signature')
  if (typeof payload.exp !== 'number' || Date.now() > payload.exp) throw new Error('Token expired')
  const email = String(payload.email || '')
  if (!email) throw new Error('Invalid payload')
  return email
}
