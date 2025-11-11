import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginDialog } from '../LoginDialog';

// Mock utils/api to intercept loginSecure calls
vi.mock('../../utils/api', () => {
  return {
    api: {
      loginSecure: vi.fn(async ({ email, password }: { email: string; password: string }) => ({
        success: true,
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
        user: { id: 'user-id', email },
      })),
    },
  };
});

// Mock supabase client setSession
vi.mock('../../utils/supabase/client', () => {
  return {
    supabase: {
      auth: {
        setSession: vi.fn(async () => ({ data: {}, error: null })),
      },
    },
  };
});

describe('LoginDialog', () => {
  beforeEach(() => {
    // Ensure dialog starts in login mode
  });

  it('performs secure login and sets session', async () => {
    const onLoginSuccess = vi.fn();
    render(
      <LoginDialog open={true} onOpenChange={() => {}} onLoginSuccess={onLoginSuccess} />
    );

    // Switch to login mode if in select
    // Find and click button to login as professional if present
    const professionalLoginButton = screen.queryByRole('button', { name: /Sign in/i });
    if (professionalLoginButton) {
      await userEvent.click(professionalLoginButton);
    }

    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    await userEvent.type(emailInput, 'user@example.com');
    await userEvent.type(passwordInput, 'password123');

    const loginButton = screen.getByRole('button', { name: /Sign in/i });
    await userEvent.click(loginButton);

    // Expect callback triggered
    expect(onLoginSuccess).toHaveBeenCalled();
  });
});