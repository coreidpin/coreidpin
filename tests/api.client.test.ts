import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { api } from '../src/utils/api';

describe('APIClient helpers', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('retries on transient failures (500) and eventually succeeds', async () => {
    const responses = [
      new Response(JSON.stringify({ error: 'server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } }),
      new Response(JSON.stringify({ valid: true, errors: [] }), { status: 200, headers: { 'Content-Type': 'application/json' } }),
    ];

    const fetchStub = vi.fn(async () => {
      return responses.shift()!;
    });

    vi.stubGlobal('fetch', fetchStub);

    const p = api.validateRegistration({ entryPoint: 'signup', userType: 'professional', data: { email: 'a@b.com', name: 'A', password: '123456', confirmPassword: '123456', title: 'Eng', location: 'Lagos' } });

    // advance timers to allow backoff to elapse
    await vi.advanceTimersByTimeAsync(1000);

    const res = await p;
    expect(res.valid).toBe(true);
    expect(fetchStub).toHaveBeenCalledTimes(2);
  });

  it('sets Authorization header only when access token is provided', async () => {
    const captured: any[] = [];
    vi.stubGlobal('fetch', vi.fn(async (url, init: any) => {
      captured.push(init?.headers);
      return new Response(JSON.stringify({ status: 'ok' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }));

    await api.checkHealth();
    await api.getProfessionals('token-123');

    const [healthHeaders, profHeaders] = captured;
    expect(healthHeaders['Authorization']).toBeUndefined();
    expect(profHeaders['Authorization']).toBe('Bearer token-123');
  });

  it('calls send verification endpoint with CSRF header', async () => {
    const captured: any[] = [];
    // Ensure CSRF token exists
    try { localStorage.setItem('csrfToken', 'csrf-123'); } catch {}

    vi.stubGlobal('fetch', vi.fn(async (url, init: any) => {
      captured.push({ url, init });
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }));

    await api.sendVerificationLink('user@example.com');

    expect(captured[0].url).toMatch(/\/send-verification$/);
    expect(captured[0].init.method).toBe('POST');
    expect(captured[0].init.headers['X-CSRF-Token']).toBe('csrf-123');
    const body = JSON.parse(captured[0].init.body);
    expect(body.email).toBe('user@example.com');
  });

  it('calls resend verification endpoint with CSRF header', async () => {
    const captured: any[] = [];
    try { localStorage.setItem('csrfToken', 'csrf-abc'); } catch {}

    vi.stubGlobal('fetch', vi.fn(async (url, init: any) => {
      captured.push({ url, init });
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }));

    await api.resendVerificationLink('resend@example.com');

    expect(captured[0].url).toMatch(/\/resend-verification$/);
    expect(captured[0].init.method).toBe('POST');
    expect(captured[0].init.headers['X-CSRF-Token']).toBe('csrf-abc');
    const body = JSON.parse(captured[0].init.body);
    expect(body.email).toBe('resend@example.com');
  });
});