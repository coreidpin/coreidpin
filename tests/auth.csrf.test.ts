import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { api } from '../src/utils/api'

describe('CSRF headers for protected auth endpoints', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
    try { localStorage.setItem('csrfToken', 'csrf-auth-001') } catch {}
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('register includes X-CSRF-Token header', async () => {
    const captured: any[] = []
    vi.stubGlobal('fetch', vi.fn(async (url, init: any) => {
      captured.push({ url, init })
      return new Response(JSON.stringify({ success: true, userId: 'u1', userType: 'professional' }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }))

    await api.register({ email: 'x@y.com', password: 'Passw0rd!', name: 'X', userType: 'professional' })
    expect(captured[0].url).toMatch(/\/register$/)
    expect(captured[0].init.method).toBe('POST')
    expect(captured[0].init.headers['X-CSRF-Token']).toBe('csrf-auth-001')
  })

  it('login includes X-CSRF-Token header', async () => {
    const captured: any[] = []
    vi.stubGlobal('fetch', vi.fn(async (url, init: any) => {
      captured.push({ url, init })
      return new Response(JSON.stringify({ success: true, accessToken: 'a', refreshToken: 'r', expiresIn: 3600, user: {} }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }))

    await api.loginSecure({ email: 'x@y.com', password: 'p' })
    expect(captured[0].url).toMatch(/\/login$/)
    expect(captured[0].init.method).toBe('POST')
    expect(captured[0].init.headers['X-CSRF-Token']).toBe('csrf-auth-001')
  })
})

