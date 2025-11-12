import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { api } from '../src/utils/api'

describe('APIClient rate-limit handling (429)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('retries on 429 and succeeds on later attempt', async () => {
    const responses = [
      new Response(JSON.stringify({ error: 'rate limited' }), { status: 429, headers: { 'Content-Type': 'application/json' } }),
      new Response(JSON.stringify({ valid: true, errors: [] }), { status: 200, headers: { 'Content-Type': 'application/json' } }),
    ]
    const fetchStub = vi.fn(async () => responses.shift()!)
    vi.stubGlobal('fetch', fetchStub)

    const p = api.validateRegistration({ entryPoint: 'signup', userType: 'professional', data: { email: 'a@b.com', name: 'A', password: '123456', confirmPassword: '123456', title: 'Eng', location: 'Lagos' } })

    await vi.advanceTimersByTimeAsync(1000)
    const res = await p
    expect(res.valid).toBe(true)
    expect(fetchStub).toHaveBeenCalledTimes(2)
  })

  it('retries on 429 up to limit then throws', async () => {
    vi.useRealTimers()
    const responses = [
      new Response(JSON.stringify({ error: 'rate limited' }), { status: 429, headers: { 'Content-Type': 'application/json' } }),
      new Response(JSON.stringify({ error: 'rate limited' }), { status: 429, headers: { 'Content-Type': 'application/json' } }),
      new Response(JSON.stringify({ error: 'rate limited' }), { status: 429, headers: { 'Content-Type': 'application/json' } }),
    ]
    const fetchStub = vi.fn(async () => responses.shift()!)
    vi.stubGlobal('fetch', fetchStub)

    await expect(api.validateRegistration({ entryPoint: 'signup', userType: 'professional', data: { email: 'a@b.com', name: 'A', password: '123456', confirmPassword: '123456', title: 'Eng', location: 'Lagos' } })).rejects.toThrow(/Transient error: 429/)
    expect(fetchStub).toHaveBeenCalledTimes(3)
  }, 10000)
})
