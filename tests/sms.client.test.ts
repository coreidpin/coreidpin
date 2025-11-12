import { describe, it, expect, vi } from 'vitest'
import { api, createApiClient } from '../src/utils/api'

describe.skip('SMS client endpoints', () => {
  it('smsSend includes CSRF and Authorization headers', async () => {
    try { localStorage.setItem('csrfToken', 'csrf-sms-001') } catch {}
    const captured: any[] = []
    vi.stubGlobal('fetch', vi.fn(async (url, init: any) => {
      captured.push({ url, init })
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }))

    const client = typeof (api as any).smsSend === 'function' ? api : createApiClient()
    await (client as any).smsSend('+2348012345678', 'token-abc')
    expect(captured[0].url).toMatch(/\/sms\/send$/)
    expect(captured[0].init.method).toBe('POST')
    expect(captured[0].init.headers['X-CSRF-Token']).toBe('csrf-sms-001')
    expect(captured[0].init.headers['Authorization']).toBe('Bearer token-abc')
  })

  it('smsVerify includes CSRF and Authorization headers', async () => {
    try { localStorage.setItem('csrfToken', 'csrf-sms-xyz') } catch {}
    const captured: any[] = []
    vi.stubGlobal('fetch', vi.fn(async (url, init: any) => {
      captured.push({ url, init })
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }))

    const client2 = typeof (api as any).smsVerify === 'function' ? api : createApiClient()
    await (client2 as any).smsVerify('+2348012345678', '123456', 'token-def')
    expect(captured[0].url).toMatch(/\/sms\/verify$/)
    expect(captured[0].init.method).toBe('POST')
    expect(captured[0].init.headers['X-CSRF-Token']).toBe('csrf-sms-xyz')
    expect(captured[0].init.headers['Authorization']).toBe('Bearer token-def')
  })
})
