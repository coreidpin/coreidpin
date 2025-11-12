import { describe, it, expect } from 'vitest';
import { api } from '../src/utils/api';

const run = process.env.RUN_INTEGRATION_TESTS === 'true';

(run ? describe : describe.skip)('Integration: Supabase Functions endpoints', () => {
  it('health endpoint returns ok', async () => {
    const res = await api.checkHealth();
    expect(res.status).toBe('ok');
  });

  it('validate-registration returns errors for missing fields', async () => {
    const res = await api.validateRegistration({
      entryPoint: 'signup',
      userType: 'professional',
      data: { email: '', name: '', password: '', confirmPassword: '' }
    });
    expect(res.valid).toBe(false);
    expect(Array.isArray(res.errors)).toBe(true);
    expect(res.errors.length).toBeGreaterThan(0);
  });

  it('protected endpoints require auth (professionals)', async () => {
    await expect(api.getProfessionals('invalid-token')).rejects.toThrow(/Unauthorized|Failed to get professionals/);
  });
});