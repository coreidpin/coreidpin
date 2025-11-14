import { supabase } from './supabase/client'
import { projectId } from './supabase/info'

let cachedSession: any = null
const BASE_URL = `https://${projectId}.supabase.co/functions/v1/server`

export async function initAuth() {
  const { data: { session } } = await supabase.auth.getSession()
  cachedSession = session || null
  if (session?.access_token) {
    try {
      const anonKey = (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY || ''
      const res = await fetch(`${BASE_URL}/auth/session-cookie`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': anonKey ? `Bearer ${anonKey}` : '', 'apikey': anonKey || '' },
        body: JSON.stringify({ token: session.access_token })
      })
      const data = await res.json().catch(() => ({}))
      if (data?.csrf) {
        try { localStorage.setItem('csrfToken', data.csrf) } catch {}
      }
    } catch {}
  } else {
    try {
      const anonKey = (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY || ''
      const res = await fetch(`${BASE_URL}/auth/csrf`, { headers: { 'Authorization': anonKey ? `Bearer ${anonKey}` : '', 'apikey': anonKey || '' } })
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
  try {
    const anonKey = (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY || ''
    await fetch(`${BASE_URL}/auth/logout`, { method: 'POST', headers: { 'Authorization': anonKey ? `Bearer ${anonKey}` : '', 'apikey': anonKey || '' } })
  } catch {}
  cachedSession = null
}

export async function clearSession() {
  try { await supabase.auth.signOut() } catch {}
  try {
    const anonKey = (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY || ''
    await fetch(`${BASE_URL}/auth/logout`, { method: 'POST', headers: { 'Authorization': anonKey ? `Bearer ${anonKey}` : '', 'apikey': anonKey || '' } })
  } catch {}
  try {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('userId')
    localStorage.removeItem('userType')
    localStorage.removeItem('csrfToken')
  } catch {}
  cachedSession = null
}

export function onAuthChange(cb: (authed: boolean) => void) {
  supabase.auth.onAuthStateChange(async (_event, session) => {
    cachedSession = session || null
    cb(!!session?.access_token)
    if (session?.access_token) {
      try {
        const anonKey = (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY || ''
        const res = await fetch(`${BASE_URL}/auth/session-cookie`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': anonKey ? `Bearer ${anonKey}` : '', 'apikey': anonKey || '' },
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
