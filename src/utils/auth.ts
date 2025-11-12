import { supabase } from './supabase/client'

let cachedSession: any = null

export async function initAuth() {
  const { data: { session } } = await supabase.auth.getSession()
  cachedSession = session || null
  if (session?.access_token) {
    try {
      const res = await fetch('/functions/v1/server/auth/session-cookie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: session.access_token })
      })
      const data = await res.json().catch(() => ({}))
      if (data?.csrf) {
        try { localStorage.setItem('csrfToken', data.csrf) } catch {}
      }
    } catch {}
  }
}

export function isAuthenticated() {
  return !!cachedSession?.access_token
}

export async function getSession() {
  if (cachedSession) return cachedSession
  const { data: { session } } = await supabase.auth.getSession()
  cachedSession = session || null
  return cachedSession
}

export async function logout() {
  try { await supabase.auth.signOut() } catch {}
  try { await fetch('/functions/v1/server/auth/logout', { method: 'POST' }) } catch {}
  cachedSession = null
}

export function onAuthChange(cb: (authed: boolean) => void) {
  supabase.auth.onAuthStateChange(async (_event, session) => {
    cachedSession = session || null
    cb(!!session?.access_token)
    if (session?.access_token) {
      try {
        const res = await fetch('/functions/v1/server/auth/session-cookie', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: session.access_token })
        })
        const data = await res.json().catch(() => ({}))
        if (data?.csrf) {
          try { localStorage.setItem('csrfToken', data.csrf) } catch {}
        }
      } catch {}
    }
  })
}
