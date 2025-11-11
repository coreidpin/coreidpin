import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PasswordResetDialog from '../PasswordResetDialog';

describe('PasswordResetDialog', () => {
  it('renders with email and validates password mismatch', async () => {
    const onClose = vi.fn();
    const onReset = vi.fn().mockResolvedValue(undefined);
    render(
      <PasswordResetDialog open={true} email="user@example.com" onClose={onClose} onReset={onReset} />
    );

    expect(screen.getByText(/Account: user@example.com/i)).toBeInTheDocument();

    const newPass = screen.getByLabelText(/New password/i);
    const confirm = screen.getByLabelText(/Confirm password/i);

    await userEvent.type(newPass, 'password123');
    await userEvent.type(confirm, 'password124');

    await userEvent.click(screen.getByRole('button', { name: /Reset password/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(/Passwords do not match/i);
    expect(onReset).not.toHaveBeenCalled();
  });

  it('submits when valid and calls onReset', async () => {
    const onClose = vi.fn();
    const onReset = vi.fn().mockResolvedValue(undefined);
    render(
      <PasswordResetDialog open={true} email="user@example.com" onClose={onClose} onReset={onReset} />
    );

    const newPass = screen.getByLabelText(/New password/i);
    const confirm = screen.getByLabelText(/Confirm password/i);

    await userEvent.type(newPass, 'password123');
    await userEvent.type(confirm, 'password123');

    await userEvent.click(screen.getByRole('button', { name: /Reset password/i }));

    expect(onReset).toHaveBeenCalledWith('password123');
    // onClose is called after successful reset
    expect(onClose).toHaveBeenCalled();
  });
});