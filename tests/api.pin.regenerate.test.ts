import { describe, it, expect, vi } from 'vitest'
import { api } from '../src/utils/api'

describe.skip('PIN regeneration API', () => {
  it('calls regenerate endpoint with Authorization and CSRF', async () => {
    try { localStorage.setItem('csrfToken', 'csrf-pin-regen') } catch {}
    const captured: any[] = []
    vi.stubGlobal('fetch', vi.fn(async (url, init: any) => {
      captured.push({ url, init })
      return new Response(JSON.stringify({ success: true, pinNumber: 'P-1234' }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }))
    const client = typeof (api as any).regeneratePIN === 'function' ? api : new (api as any).constructor()
    const res = await (client as any).regeneratePIN('token-xyz')
    expect(res.success).toBe(true)
    expect(captured[0].url).toMatch(/\/pin\/regenerate$/)
    expect(captured[0].init.method).toBe('POST')
    expect(captured[0].init.headers['Authorization']).toBe('Bearer token-xyz')
    expect(captured[0].init.headers['X-CSRF-Token']).toBe('csrf-pin-regen')
  })
})
