import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RegistrationStateManager, RegistrationErrorHandler } from '../registrationState';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('RegistrationStateManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should save and retrieve registration state', () => {
    const state = {
      step: 'phone_verification' as const,
      name: 'John Doe',
      phone: '+1234567890',
      email: 'john@example.com'
    };

    localStorageMock.getItem.mockReturnValue(JSON.stringify({
      ...state,
      timestamp: Date.now()
    }));

    RegistrationStateManager.save(state);
    const retrieved = RegistrationStateManager.get();

    expect(localStorageMock.setItem).toHaveBeenCalled();
    expect(retrieved.step).toBe('phone_verification');
    expect(retrieved.name).toBe('John Doe');
  });

  it('should detect phone verification status', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify({
      step: 'phone_verified',
      phone: '+1234567890',
      regToken: 'test-token',
      timestamp: Date.now()
    }));

    expect(RegistrationStateManager.isPhoneVerified()).toBe(true);
    expect(RegistrationStateManager.getVerifiedPhone()).toBe('+1234567890');
    expect(RegistrationStateManager.getRegistrationToken()).toBe('test-token');
  });

  it('should clear expired state', () => {
    const expiredTime = Date.now() - (31 * 60 * 1000); // 31 minutes ago
    localStorageMock.getItem.mockReturnValue(JSON.stringify({
      step: 'phone_verification',
      timestamp: expiredTime
    }));

    const state = RegistrationStateManager.get();
    expect(state.step).toBe('basic'); // Should reset to basic
  });

  it('should mark phone as verified', () => {
    RegistrationStateManager.markPhoneVerified('+1234567890', 'test-token');
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'registrationState',
      expect.stringContaining('phone_verified')
    );
  });
});

describe('RegistrationErrorHandler', () => {
  it('should handle SMS failure errors correctly', () => {
    const smsError = new Error('SMS delivery failed');
    const strategy = RegistrationErrorHandler.handleSMSFailure(smsError);
    expect(strategy).toBe('fallback_email');

    const rateLimitError = new Error('Rate limit exceeded');
    const rateLimitStrategy = RegistrationErrorHandler.handleSMSFailure(rateLimitError);
    expect(rateLimitStrategy).toBe('abort');
  });

  it('should determine when to fallback to email', () => {
    const smsError = new Error('SMS service unavailable');
    
    // First attempt - should not fallback yet
    expect(RegistrationErrorHandler.shouldFallbackToEmail(smsError, 1)).toBe(false);
    
    // Second attempt - should fallback
    expect(RegistrationErrorHandler.shouldFallbackToEmail(smsError, 2)).toBe(true);
  });

  it('should provide appropriate error messages', () => {
    const smsError = new Error('SMS delivery failed');
    const message = RegistrationErrorHandler.getErrorMessage(smsError, 'phone');
    expect(message).toContain('SMS delivery failed');

    const otpError = new Error('Invalid OTP');
    const otpMessage = RegistrationErrorHandler.getErrorMessage(otpError, 'otp');
    expect(otpMessage).toContain('Invalid verification code');
  });
});
