import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { api } from '../src/utils/api';

describe('Auth client endpoints', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('register includes anon Authorization and CSRF headers', async () => {
    try { localStorage.setItem('csrfToken', 'csrf-register-123'); } catch {}
    const captured: any[] = [];
    vi.stubGlobal('fetch', vi.fn(async (url, init: any) => {
      captured.push({ url, init });
      return new Response(JSON.stringify({ success: true, userId: 'u1', userType: 'professional' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }));

    await api.register({ email: 'new@user.com', password: 'Abcd1234!', name: 'New User', userType: 'professional' });

    const req = captured[0];
    expect(req.url).toMatch(/\/register$/);
    expect(req.init.method).toBe('POST');
    expect(req.init.headers['Authorization']).toBeDefined();
    expect(req.init.headers['X-CSRF-Token']).toBe('csrf-register-123');
    const body = JSON.parse(req.init.body);
    expect(body.email).toBe('new@user.com');
  });

  it('loginSecure includes CSRF header and payload', async () => {
    try { localStorage.setItem('csrfToken', 'csrf-login-xyz'); } catch {}
    const captured: any[] = [];
    vi.stubGlobal('fetch', vi.fn(async (url, init: any) => {
      captured.push({ url, init });
      return new Response(JSON.stringify({ success: true, accessToken: 't', user: { id: 'u1' } }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }));

    await api.loginSecure({ email: 'user@example.com', password: 'Abcd1234!' });

    const req = captured[0];
    expect(req.url).toMatch(/\/login$/);
    expect(req.init.method).toBe('POST');
    expect(req.init.headers['X-CSRF-Token']).toBe('csrf-login-xyz');
    const body = JSON.parse(req.init.body);
    expect(body.email).toBe('user@example.com');
  });

  it('register propagates server error message', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => {
      return new Response(JSON.stringify({ error: 'Email already registered' }), { status: 409, headers: { 'Content-Type': 'application/json' } });
    }));
    await expect(api.register({ email: 'dup@user.com', password: 'Abcd1234!', name: 'Dup', userType: 'professional' }))
      .rejects
      .toThrow(/Email already registered/);
  });
});