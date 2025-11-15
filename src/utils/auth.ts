import { supabase } from './supabase/client'
import { projectId } from './supabase/info'
import { saveSessionState, clearSessionState, ensureValidSession } from './session'

let cachedSession: any = null
const BASE_URL = `https://${projectId}.supabase.co/functions/v1/server`

// Security headers for all requests
const getSecureHeaders = () => {
  const csrfToken = localStorage.getItem('csrfToken') || generateCSRFToken()
  const anonKey = (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY || ''
  
  return {
    'Content-Type': 'application/json',
    'Authorization': anonKey ? `Bearer ${anonKey}` : '',
    'apikey': anonKey || '',
    'X-CSRF-Token': csrfToken,
    'X-Requested-With': 'XMLHttpRequest'
  }
}

// Generate secure CSRF token
function generateCSRFToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  localStorage.setItem('csrfToken', token)
  return token
}

export async function initAuth() {
  const { data: { session } } = await supabase.auth.getSession()
  cachedSession = session || null
  
  // Ensure CSRF token exists
  if (!localStorage.getItem('csrfToken')) {
    generateCSRFToken()
  }
  
  if (session?.access_token) {
    try {
      const res = await fetch(`${BASE_URL}/auth/session-cookie`, {
        method: 'POST',
        headers: getSecureHeaders(),
        body: JSON.stringify({ token: session.access_token })
      })
      
      if (!res.ok) throw new Error('Session validation failed')
      
      const data = await res.json().catch(() => ({}))
      if (data?.csrf) {
        localStorage.setItem('csrfToken', data.csrf)
      }
      
      // Save session state for persistence
      saveSessionState({
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        userId: session.user.id,
        userType: session.user.user_metadata?.userType || 'professional',
        expiresAt: Date.now() + (session.expires_in || 3600) * 1000
      })
      
    } catch (error) {
      console.error('Session initialization failed:', error)
      await clearSession()
    }
  } else {
    try {
      const res = await fetch(`${BASE_URL}/auth/csrf`, { 
        headers: getSecureHeaders() 
      })
      const data = await res.json().catch(() => ({}))
      if (data?.csrf) {
        localStorage.setItem('csrfToken', data.csrf)
      }
    } catch (error) {
      console.error('CSRF token fetch failed:', error)
      generateCSRFToken() // Fallback to client-generated token
    }
  }
}

export function isAuthenticated() {
  // Check both cached session and localStorage for reliability
  const hasSession = !!cachedSession?.access_token
  const hasStoredAuth = localStorage.getItem('isAuthenticated') === 'true'
  const hasValidToken = !!localStorage.getItem('accessToken')
  
  return hasSession || (hasStoredAuth && hasValidToken)
}

export async function getSession() {
  if (cachedSession) return cachedSession
  const { data: { session } } = await supabase.auth.getSession()
  cachedSession = session || null
  return cachedSession
}

export async function logout() {
  try {
    // Sign out from Supabase
    await supabase.auth.signOut()
    
    // Notify server of logout
    try {
      await fetch(`${BASE_URL}/auth/logout`, { 
        method: 'POST', 
        headers: getSecureHeaders() 
      })
    } catch (serverError) {
      console.warn('Server logout notification failed:', serverError)
    }
    
    // Clear all session data
    clearSessionState()
    cachedSession = null
    
    // Clear authentication flags
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('emailVerified')
    localStorage.removeItem('tempSession')
    
    // Generate new CSRF token for security
    generateCSRFToken()
    
  } catch (error) {
    console.error('Logout error:', error)
    // Force clear even if logout fails
    clearSessionState()
    cachedSession = null
  }
}

export async function clearSession() {
  await logout() // Use the enhanced logout function
}

// Secure API request wrapper with automatic token refresh
export async function secureRequest(url: string, options: RequestInit = {}) {
  const token = await ensureValidSession()
  
  if (!token) {
    throw new Error('Authentication required')
  }
  
  const headers = {
    ...getSecureHeaders(),
    'Authorization': `Bearer ${token}`,
    ...options.headers
  }
  
  const response = await fetch(url, {
    ...options,
    headers
  })
  
  if (response.status === 401) {
    // Token expired, clear session and redirect to login
    await clearSession()
    window.location.href = '/login'
    throw new Error('Session expired')
  }
  
  return response
}

export function onAuthChange(cb: (authed: boolean) => void) {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    cachedSession = session || null
    const isAuthed = !!session?.access_token
    
    if (event === 'SIGNED_IN' && session) {
      // Save session state on sign in
      saveSessionState({
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        userId: session.user.id,
        userType: session.user.user_metadata?.userType || 'professional',
        expiresAt: Date.now() + (session.expires_in || 3600) * 1000
      })
      
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('emailVerified', String(!!session.user.email_confirmed_at))
      
      // Update CSRF token
      try {
        const res = await fetch(`${BASE_URL}/auth/session-cookie`, {
          method: 'POST',
          headers: getSecureHeaders(),
          body: JSON.stringify({ token: session.access_token })
        })
        const data = await res.json().catch(() => ({}))
        if (data?.csrf) {
          localStorage.setItem('csrfToken', data.csrf)
        }
      } catch (error) {
        console.warn('CSRF token update failed:', error)
      }
      
    } else if (event === 'SIGNED_OUT') {
      clearSessionState()
      localStorage.removeItem('isAuthenticated')
      localStorage.removeItem('emailVerified')
      generateCSRFToken() // New token for security
    }
    
    cb(isAuthed)
  })
}
