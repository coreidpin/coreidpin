// Registration state management for session continuity
export interface RegistrationState {
  step: 'basic' | 'phone_verification' | 'phone_verified' | 'email_form' | 'completed';
  name?: string;
  email?: string;
  phone?: string;
  regToken?: string;
  timestamp?: number;
}

const STORAGE_KEY = 'registrationState';
const STATE_EXPIRY = 30 * 60 * 1000; // 30 minutes

export class RegistrationStateManager {
  static save(state: Partial<RegistrationState>): void {
    try {
      const currentState = this.get();
      const newState: RegistrationState = {
        ...currentState,
        ...state,
        timestamp: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch (error) {
      console.warn('Failed to save registration state:', error);
    }
  }

  static get(): RegistrationState {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return { step: 'basic' };

      const state: RegistrationState = JSON.parse(stored);
      
      // Check if state has expired
      if (state.timestamp && Date.now() - state.timestamp > STATE_EXPIRY) {
        this.clear();
        return { step: 'basic' };
      }

      return state;
    } catch (error) {
      console.warn('Failed to get registration state:', error);
      return { step: 'basic' };
    }
  }

  static clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('registrationStep');
      localStorage.removeItem('registrationPhone');
      localStorage.removeItem('registrationToken');
      localStorage.removeItem('preName');
      localStorage.removeItem('preEmail');
      localStorage.removeItem('prePhone');
    } catch (error) {
      console.warn('Failed to clear registration state:', error);
    }
  }

  static isPhoneVerified(): boolean {
    const state = this.get();
    return state.step === 'phone_verified' && !!state.phone && !!state.regToken;
  }

  static getVerifiedPhone(): string | null {
    const state = this.get();
    return state.step === 'phone_verified' ? state.phone || null : null;
  }

  static getRegistrationToken(): string | null {
    const state = this.get();
    return state.step === 'phone_verified' ? state.regToken || null : null;
  }

  static markPhoneVerified(phone: string, regToken: string): void {
    this.save({
      step: 'phone_verified',
      phone,
      regToken
    });
  }

  static markCompleted(): void {
    this.save({ step: 'completed' });
    // Clear after a short delay to allow for any final operations
    setTimeout(() => this.clear(), 1000);
  }

  static canResumeRegistration(): boolean {
    const state = this.get();
    return state.step !== 'basic' && state.step !== 'completed';
  }
}

// Registration error handling with fallback strategies
export class RegistrationErrorHandler {
  static handleSMSFailure(error: Error): 'retry' | 'fallback_email' | 'abort' {
    const message = error.message.toLowerCase();
    
    if (message.includes('rate limit') || message.includes('too many')) {
      return 'abort';
    }
    
    if (message.includes('sms') || message.includes('delivery') || message.includes('send')) {
      return 'fallback_email';
    }
    
    return 'retry';
  }

  static shouldFallbackToEmail(error: Error, attemptCount: number): boolean {
    if (attemptCount >= 2) return true;
    
    const strategy = this.handleSMSFailure(error);
    return strategy === 'fallback_email';
  }

  static getErrorMessage(error: Error, context: 'phone' | 'otp' | 'registration'): string {
    const message = error.message;
    
    switch (context) {
      case 'phone':
        if (message.includes('SMS')) return 'SMS delivery failed. Please try email registration.';
        if (message.includes('rate limit')) return 'Too many attempts. Please wait before trying again.';
        return 'Failed to send verification code. Please check your phone number.';
        
      case 'otp':
        if (message.includes('expired')) return 'Verification code has expired. Please request a new one.';
        if (message.includes('invalid')) return 'Invalid verification code. Please try again.';
        return 'Verification failed. Please check your code.';
        
      case 'registration':
        if (message.includes('email')) return 'Email already exists. Please use a different email.';
        if (message.includes('phone')) return 'Phone number already registered.';
        return 'Registration failed. Please try again.';
        
      default:
        return message || 'An error occurred. Please try again.';
    }
  }
}
