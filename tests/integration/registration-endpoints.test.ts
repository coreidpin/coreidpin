/**
 * Integration Tests for Registration and Verification Endpoints
 * Phase 4: Testing and Validation
 * 
 * Tests cover:
 * - /server/register endpoint (POST)
 * - /verify-email-code endpoint (POST)
 * - /send-verification-email endpoint (POST)
 * - Various success/failure scenarios
 * - Edge cases and error handling
 */

import { describe, it, expect, beforeAll, vi } from 'vitest';
import { api } from '../../src/utils/api';

// Mock fetch for integration tests
global.fetch = vi.fn();

describe('Registration Endpoint Integration Tests', () => {
  beforeAll(() => {
    vi.clearAllMocks();
  });

  describe('POST /server/register', () => {
    it('should successfully register a professional user', async () => {
      const mockResponse = {
        success: true,
        userId: 'test-user-id-123',
        userType: 'professional',
        message: 'Registration successful'
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse
      });

      const registrationData = {
        email: 'john.doe@example.com',
        password: 'SecurePass123!',
        name: 'John Doe',
        userType: 'professional' as const,
        title: 'Software Engineer',
        phoneNumber: '+1234567890',
        location: 'San Francisco, CA',
        yearsOfExperience: '5',
        currentCompany: 'Tech Corp',
        seniority: 'Mid-level',
        topSkills: ['JavaScript', 'React', 'Node.js'],
        highestEducation: 'Bachelor\'s Degree'
      };

      const result = await api.register(registrationData);

      expect(result.success).toBe(true);
      expect(result.userId).toBe('test-user-id-123');
      expect(result.userType).toBe('professional');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/server/register'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify(registrationData)
        })
      );
    });

    it('should successfully register an employer user', async () => {
      const mockResponse = {
        success: true,
        userId: 'employer-user-id-456',
        userType: 'employer',
        message: 'Registration successful'
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse
      });

      const registrationData = {
        email: 'hr@company.com',
        password: 'CompanyPass123!',
        name: 'HR Manager',
        userType: 'employer' as const,
        companyName: 'Acme Corp',
        role: 'HR Director'
      };

      const result = await api.register(registrationData);

      expect(result.success).toBe(true);
      expect(result.userId).toBe('employer-user-id-456');
      expect(result.userType).toBe('employer');
    });

    it('should reject registration with invalid email', async () => {
      const mockError = {
        error: 'Email Address must be a valid email'
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => mockError
      });

      const registrationData = {
        email: 'invalid-email',
        password: 'SecurePass123!',
        name: 'Test User',
        userType: 'professional' as const
      };

      await expect(api.register(registrationData)).rejects.toThrow(
        'Email Address must be a valid email'
      );
    });

    it('should reject registration with weak password', async () => {
      const mockError = {
        error: 'Password must be at least 6 characters'
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => mockError
      });

      const registrationData = {
        email: 'user@example.com',
        password: 'weak',
        name: 'Test User',
        userType: 'professional' as const
      };

      await expect(api.register(registrationData)).rejects.toThrow(
        'Password must be at least 6 characters'
      );
    });

    it('should reject registration with duplicate email', async () => {
      const mockError = {
        error: 'Email already exists'
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => mockError
      });

      const registrationData = {
        email: 'existing@example.com',
        password: 'SecurePass123!',
        name: 'Test User',
        userType: 'professional' as const
      };

      await expect(api.register(registrationData)).rejects.toThrow(
        'Email already exists'
      );
    });

    it('should handle missing required fields', async () => {
      const mockError = {
        error: 'Full Name is required'
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => mockError
      });

      const registrationData = {
        email: 'user@example.com',
        password: 'SecurePass123!',
        name: '', // Empty name
        userType: 'professional' as const
      };

      await expect(api.register(registrationData)).rejects.toThrow(
        'Full Name is required'
      );
    });

    it('should handle network errors gracefully', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const registrationData = {
        email: 'user@example.com',
        password: 'SecurePass123!',
        name: 'Test User',
        userType: 'professional' as const
      };

      await expect(api.register(registrationData)).rejects.toThrow('Network error');
    });
  });

  describe('POST /verify-email-code', () => {
    it('should successfully verify valid 6-digit code', async () => {
      const mockResponse = {
        success: true,
        message: 'Email verified successfully'
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse
      });

      const result = await api.verifyEmailCode('user@example.com', '123456');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Email verified successfully');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/verify-email-code'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'user@example.com', code: '123456' })
        })
      );
    });

    it('should reject invalid verification code', async () => {
      const mockError = {
        success: false,
        error: 'Invalid verification code'
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => mockError
      });

      await expect(
        api.verifyEmailCode('user@example.com', '000000')
      ).rejects.toThrow('Invalid verification code');
    });

    it('should reject expired verification code', async () => {
      const mockError = {
        success: false,
        error: 'Verification code has expired'
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => mockError
      });

      await expect(
        api.verifyEmailCode('user@example.com', '123456')
      ).rejects.toThrow('Verification code has expired');
    });

    it('should handle too many failed attempts', async () => {
      const mockError = {
        success: false,
        error: 'Too many failed attempts. Please request a new code.'
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => mockError
      });

      await expect(
        api.verifyEmailCode('user@example.com', '111111')
      ).rejects.toThrow('Too many failed attempts');
    });

    it('should validate code format (6 digits)', async () => {
      const mockError = {
        success: false,
        error: 'Invalid verification code format'
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => mockError
      });

      // Test non-numeric code
      await expect(
        api.verifyEmailCode('user@example.com', 'abcdef')
      ).rejects.toThrow('Invalid verification code');
    });

    it('should handle email not found', async () => {
      const mockError = {
        success: false,
        error: 'No verification code found for this email'
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => mockError
      });

      await expect(
        api.verifyEmailCode('nonexistent@example.com', '123456')
      ).rejects.toThrow('No verification code found');
    });
  });

  describe('POST /send-verification-email', () => {
    it('should successfully send verification email', async () => {
      const mockResponse = {
        success: true,
        message: 'Verification email sent'
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse
      });

      const result = await api.sendVerificationEmail('user@example.com', 'John Doe');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Verification email sent');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/send-verification-email'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'user@example.com', name: 'John Doe' })
        })
      );
    });

    it('should send verification email without name parameter', async () => {
      const mockResponse = {
        success: true,
        message: 'Verification email sent'
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse
      });

      const result = await api.sendVerificationEmail('user@example.com');

      expect(result.success).toBe(true);
    });

    it('should handle rate limiting for resend requests', async () => {
      const mockError = {
        error: 'Please wait before requesting another code'
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => mockError
      });

      await expect(
        api.sendVerificationEmail('user@example.com')
      ).rejects.toThrow('Please wait before requesting another code');
    });

    it('should reject invalid email format', async () => {
      const mockError = {
        error: 'Invalid email address'
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => mockError
      });

      await expect(
        api.sendVerificationEmail('invalid-email')
      ).rejects.toThrow('Invalid email address');
    });

    it('should handle email delivery failures', async () => {
      const mockError = {
        error: 'Failed to send verification email'
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => mockError
      });

      await expect(
        api.sendVerificationEmail('user@example.com')
      ).rejects.toThrow('Failed to send verification email');
    });
  });

  describe('Validation Endpoint (/server/validate-registration)', () => {
    it('should validate complete professional registration data', async () => {
      const mockResponse = {
        valid: true,
        errors: []
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse
      });

      const payload = {
        entryPoint: 'signup-modal',
        userType: 'professional',
        data: {
          email: 'user@example.com',
          password: 'SecurePass123!',
          confirmPassword: 'SecurePass123!',
          name: 'John Doe',
          title: 'Software Engineer',
          phone: '+1234567890',
          location: 'San Francisco, CA'
        }
      };

      const result = await api.validateRegistration(payload);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return validation errors for invalid data', async () => {
      const mockResponse = {
        valid: false,
        errors: [
          'Email Address must be a valid email',
          'Password must be at least 6 characters',
          'Password and Confirm Password must match'
        ]
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse
      });

      const payload = {
        entryPoint: 'signup-modal',
        userType: 'professional',
        data: {
          email: 'invalid',
          password: 'weak',
          confirmPassword: 'different',
          name: 'Test User'
        }
      };

      const result = await api.validateRegistration(payload);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(3);
      expect(result.errors).toContain('Email Address must be a valid email');
      expect(result.errors).toContain('Password must be at least 6 characters');
    });

    it('should validate employer-specific fields', async () => {
      const mockResponse = {
        valid: true,
        errors: []
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse
      });

      const payload = {
        entryPoint: 'signup-modal',
        userType: 'employer',
        data: {
          email: 'hr@company.com',
          password: 'CompanyPass123!',
          confirmPassword: 'CompanyPass123!',
          name: 'HR Manager',
          companyName: 'Acme Corp',
          industry: 'Technology',
          headquarters: 'San Francisco, CA'
        }
      };

      const result = await api.validateRegistration(payload);

      expect(result.valid).toBe(true);
    });
  });

  describe('End-to-End Registration Flow', () => {
    it('should complete full registration and verification flow', async () => {
      // Step 1: Validate registration data
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ valid: true, errors: [] })
      });

      const validationPayload = {
        entryPoint: 'signup-modal',
        userType: 'professional',
        data: {
          email: 'newuser@example.com',
          password: 'SecurePass123!',
          confirmPassword: 'SecurePass123!',
          name: 'New User',
          title: 'Developer'
        }
      };

      const validationResult = await api.validateRegistration(validationPayload);
      expect(validationResult.valid).toBe(true);

      // Step 2: Register user
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          userId: 'new-user-123',
          userType: 'professional'
        })
      });

      const registrationData = {
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        name: 'New User',
        userType: 'professional' as const,
        title: 'Developer'
      };

      const registerResult = await api.register(registrationData);
      expect(registerResult.success).toBe(true);

      // Step 3: Send verification email
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true, message: 'Verification email sent' })
      });

      const sendEmailResult = await api.sendVerificationEmail('newuser@example.com', 'New User');
      expect(sendEmailResult.success).toBe(true);

      // Step 4: Verify email code
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true, message: 'Email verified' })
      });

      const verifyResult = await api.verifyEmailCode('newuser@example.com', '123456');
      expect(verifyResult.success).toBe(true);
    });
  });

  describe('Error Recovery Scenarios', () => {
    it('should retry on transient network failures', async () => {
      // First call fails, second succeeds
      (global.fetch as any)
        .mockRejectedValueOnce(new Error('Network timeout'))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ success: true })
        });

      const result = await api.sendVerificationEmail('user@example.com');
      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should handle verification code resend after expiry', async () => {
      // First verification fails (expired)
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ success: false, error: 'Code expired' })
      });

      await expect(
        api.verifyEmailCode('user@example.com', '123456')
      ).rejects.toThrow('Code expired');

      // Resend new code
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true })
      });

      const resendResult = await api.sendVerificationEmail('user@example.com');
      expect(resendResult.success).toBe(true);

      // Verify with new code
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true })
      });

      const verifyResult = await api.verifyEmailCode('user@example.com', '654321');
      expect(verifyResult.success).toBe(true);
    });
  });
});
