import { projectId, publicAnonKey } from './supabase/info';
import { ensureValidSession, refreshTokenIfNeeded, handleSessionExpiry } from './session';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/server`;
const AUTH_OTP_URL = `https://${projectId}.supabase.co/functions/v1/auth-otp`;
const AUTH_PIN_URL = `https://${projectId}.supabase.co/functions/v1/auth-pin`;
const USER_URL = `https://${projectId}.supabase.co/functions/v1/user`;

export interface RegisterUserData {
  email: string;
  password: string;
  name: string;
  userType: 'employer' | 'professional' | 'university';
  title?: string;
  companyName?: string;
  role?: string;
  institution?: string;
  gender?: string;
  phoneNumber?: string;
  location?: string;
  yearsOfExperience?: string;
  currentCompany?: string;
  seniority?: string;
  topSkills?: string[];
  highestEducation?: string;
  resumeFileName?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AIMatchingRequest {
  jobDescription: string;
  requiredSkills: string;
  location: string;
  experienceLevel: string;
}

export interface AIComplianceRequest {
  candidateName: string;
  documents: string;
  location: string;
  employmentType: string;
}

class APIClient {
  private getHeaders(accessToken?: string, includeAnonForPublic: boolean = false) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    const anonKey = (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY ?? publicAnonKey;
    
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    } else if (includeAnonForPublic && anonKey) {
      // For public endpoints when Verify JWT is enabled on Edge Functions,
      // include anon key (prefer env, fallback to bundled publicAnonKey).
      headers['Authorization'] = `Bearer ${anonKey}`;
      headers['apikey'] = anonKey; // Supabase Edge Functions require apikey header
    }
    const csrfToken = typeof window !== 'undefined' ? localStorage.getItem('csrfToken') : null;
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
    return headers;
  }

  private async fetchWithRetry(url: string, options: RequestInit, retries = 2): Promise<Response> {
    let attempt = 0;
    let lastError: any = null;
    while (attempt <= retries) {
      try {
        const res = await fetch(url, options);
        
        // Handle 401 Unauthorized - just return the response for login endpoints
        if (res.status === 401) {
          const isLoginEndpoint = /\/login(\?|$)/.test(url);
          if (isLoginEndpoint) {
            return res;
          }
          // For other endpoints, just return the 401 response
          return res;
        }
        
        // Handle transient errors (500, 429)
        if (res.status >= 500 || res.status === 429) {
          // Try to read the error body to log it for debugging
          try {
            const errorBody = await res.clone().json();
            console.error(`[API] ${res.status} Error Body:`, errorBody);
          } catch (e) {
            console.error(`[API] ${res.status} Error (could not read body):`, e);
          }
          throw Object.assign(new Error(`Transient error: ${res.status}`), { status: res.status });
        }
        
        return res;
      } catch (err: any) {
        lastError = err;
        const isNetwork = typeof err?.message === 'string' && /network|timeout/i.test(err.message);
        const isTransient = !!(err && ((err.status >= 500 || err.status === 429) || isNetwork));
        if (!isTransient || attempt === retries) break;
        const backoffMs = Math.min(1000 * Math.pow(2, attempt), 4000);
        await new Promise((r) => setTimeout(r, backoffMs));
        attempt++;
      }
    }
    throw lastError;
  }

  async validateRegistration(payload: {
    entryPoint: 'signup' | 'get-started';
    userType: 'professional' | 'employer' | 'university';
    data: Record<string, any>;
  }) {
    const response = await this.fetchWithRetry(`${BASE_URL}/validate-registration`, {
      method: 'POST',
      headers: this.getHeaders(undefined, true),
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      try {
        const error = await response.json();
        return { valid: false, errors: error.errors || ['Validation failed'] };
      } catch {
        return { valid: false, errors: ['Validation failed'] };
      }
    }

    return response.json();
  }

  async register(data: RegisterUserData) {
    const baseHeaders = this.getHeaders(undefined, true);
    const debug = ((import.meta as any)?.env?.DEV === true) || ((import.meta as any)?.env?.VITE_DEBUG_REGISTER === 'true');
    const response = await this.fetchWithRetry(`${BASE_URL}/register`, {
      method: 'POST',
      headers: debug ? { ...baseHeaders, 'X-Debug-Register': 'true' } : baseHeaders,
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    return response.json();
  }

  async setSessionCookie(accessToken: string) {
    const response = await this.fetchWithRetry(`${BASE_URL}/auth/session-cookie`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: accessToken })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data?.success) {
      return { success: false };
    }
    const csrf = data?.csrf;
    if (csrf) {
      try { localStorage.setItem('csrfToken', csrf); } catch {}
    }
    return { success: true, csrf };
  }

  async sendVerificationLink(email: string) {
    const response = await this.fetchWithRetry(`${BASE_URL}/send-verification`, {
      method: 'POST',
      headers: this.getHeaders(undefined, true),
      body: JSON.stringify({ email })
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to send verification link');
    }
    return response.json();
  }

  async resendVerificationLink(email: string) {
    const response = await this.fetchWithRetry(`${BASE_URL}/resend-verification`, {
      method: 'POST',
      headers: this.getHeaders(undefined, true),
      body: JSON.stringify({ email })
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to resend verification link');
    }
    return response.json();
  }

  async verifyLinkToken(token: string) {
    const response = await this.fetchWithRetry(`${BASE_URL}/auth/email/verify/confirm?token=${encodeURIComponent(token)}`, {
      method: 'GET',
      headers: this.getHeaders(undefined, true)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Invalid verification link');
    }
    return data;
  }

  async loginSecure(data: LoginData) {
    const headers = this.getHeaders(undefined, true);
    if (!('X-CSRF-Token' in headers)) {
      try {
        const bytes = new Uint8Array(16);
        crypto.getRandomValues(bytes);
        const token = Array.from(bytes).map(b => ('0' + b.toString(16)).slice(-2)).join('');
        headers['X-CSRF-Token'] = token;
        try { localStorage.setItem('csrfToken', token) } catch {}
      } catch {}
    }
    console.log('Login request headers:', headers);
    console.log('Login URL:', `${BASE_URL}/login`);
    
    const response = await this.fetchWithRetry(`${BASE_URL}/login`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      console.error('Login failed with status:', response.status);
      const error = await response.json().catch(() => ({ error: 'Login failed' }));
      console.error('Login error response:', error);
      throw new Error(error.error || 'Login failed');
    }

    return response.json();
  }

  async login(data: LoginData) {
    // This method is now primarily for demo accounts
    // Real authentication is handled by Supabase client in LoginDialog
    const demoAccounts = {
      'demo.professional@swipe.work': {
        userType: 'professional',
        name: 'Demo Professional',
        id: 'demo-prof-001',
        hasCompletedOnboarding: true
      },
      'demo.employer@swipe.work': {
        userType: 'employer',
        name: 'Demo Employer',
        id: 'demo-emp-001',
        hasCompletedOnboarding: true
      },
      'demo.university@nwanne.com': {
        userType: 'university',
        name: 'Demo University',
        id: 'demo-uni-001',
        hasCompletedOnboarding: true
      }
    };

    // Check if it's a demo account
    const demoAccount = demoAccounts[data.email as keyof typeof demoAccounts];
    if (demoAccount && data.password === 'demo123') {
      return {
        success: true,
        accessToken: 'demo-token-' + Date.now(),
        user: {
          id: demoAccount.id,
          email: data.email,
          user_metadata: {
            userType: demoAccount.userType,
            name: demoAccount.name,
            hasCompletedOnboarding: demoAccount.hasCompletedOnboarding
          }
        }
      };
    }

    // For non-demo accounts, this should not be called
    // Authentication is handled by Supabase client
    throw new Error('Please use the Google sign-in or email/password form');
  }

  async getProfile(userId: string, accessToken: string) {
    const response = await this.fetchWithRetry(`${BASE_URL}/profile/${userId}`, {
      method: 'GET',
      headers: this.getHeaders(accessToken)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get profile');
    }

    return response.json();
  }

  async updateProfile(userId: string, accessToken: string, data: Partial<RegisterUserData>) {
    const response = await this.fetchWithRetry(`${BASE_URL}/profile/${userId}`, {
      method: 'PUT',
      headers: this.getHeaders(accessToken),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update profile');
    }

    return response.json();
  }

  async matchTalent(data: AIMatchingRequest, accessToken: string) {
    const response = await this.fetchWithRetry(`${BASE_URL}/ai/match-talent`, {
      method: 'POST',
      headers: this.getHeaders(accessToken),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'AI matching failed');
    }

    return response.json();
  }

  async checkCompliance(data: AIComplianceRequest, accessToken: string) {
    const response = await this.fetchWithRetry(`${BASE_URL}/ai/compliance-check`, {
      method: 'POST',
      headers: this.getHeaders(accessToken),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Compliance check failed');
    }

    return response.json();
  }

  async getProfessionals(accessToken: string) {
    const response = await this.fetchWithRetry(`${BASE_URL}/professionals`, {
      method: 'GET',
      headers: this.getHeaders(accessToken)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get professionals');
    }

    return response.json();
  }

  async checkHealth() {
    const response = await this.fetchWithRetry(`${BASE_URL}/health`, {
      method: 'GET',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error('Health check failed');
    }

    return response.json();
  }

  async analyzeProfile(data: {
    linkedinUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
    name?: string;
    title?: string;
  }, accessToken: string) {
    const response = await this.fetchWithRetry(`${BASE_URL}/profile/analyze`, {
      method: 'POST',
      headers: this.getHeaders(accessToken),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Profile analysis failed');
    }

    return response.json();
  }

  async saveCompleteProfile(data: any, accessToken: string) {
    const response = await this.fetchWithRetry(`${BASE_URL}/profile/complete`, {
      method: 'POST',
      headers: this.getHeaders(accessToken),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save profile');
    }

    return response.json();
  }

  async getProfileAnalysis(userId: string, accessToken: string) {
    const response = await this.fetchWithRetry(`${BASE_URL}/profile/analysis/${userId}`, {
      method: 'GET',
      headers: this.getHeaders(accessToken)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get analysis');
    }

    return response.json();
  }

  // Matching API Methods
  async getRecommendations(userType: 'employer' | 'professional', accessToken: string, limit = 20) {
    const response = await this.fetchWithRetry(`${BASE_URL}/recommendations?userType=${userType}&limit=${limit}`, {
      method: 'GET',
      headers: this.getHeaders(accessToken)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get recommendations');
    }

    return response.json();
  }

  async recordSwipe(targetId: string, direction: 'left' | 'right', targetType: 'profile' | 'job', accessToken: string) {
    const response = await this.fetchWithRetry(`${BASE_URL}/swipe`, {
      method: 'POST',
      headers: this.getHeaders(accessToken),
      body: JSON.stringify({ targetId, direction, targetType })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to record swipe');
    }

    return response.json();
  }

  async getMatches(accessToken: string) {
    const response = await this.fetchWithRetry(`${BASE_URL}/matches`, {
      method: 'GET',
      headers: this.getHeaders(accessToken)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get matches');
    }

    return response.json();
  }

  async updateMatchStatus(matchId: string, status: string, accessToken: string) {
    const response = await this.fetchWithRetry(`${BASE_URL}/match/${matchId}/status`, {
      method: 'PUT',
      headers: this.getHeaders(accessToken),
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update match status');
    }

    return response.json();
  }

  async sendMatchMessage(matchId: string, message: string, accessToken: string) {
    const response = await this.fetchWithRetry(`${BASE_URL}/match/${matchId}/message`, {
      method: 'POST',
      headers: this.getHeaders(accessToken),
      body: JSON.stringify({ message })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send message');
    }

    return response.json();
  }

  async getMatchMessages(matchId: string, accessToken: string) {
    const response = await this.fetchWithRetry(`${BASE_URL}/match/${matchId}/messages`, {
      method: 'GET',
      headers: this.getHeaders(accessToken)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get messages');
    }

    return response.json();
  }

  // ============================================================================
  // PIN API Methods
  // ============================================================================

  async createPIN(pinData: any, accessToken: string) {
    const response = await this.fetchWithRetry(`${BASE_URL}/pin/create`, {
      method: 'POST',
      headers: this.getHeaders(accessToken),
      body: JSON.stringify(pinData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create PIN');
    }

    return response.json();
  }

  async getUserPIN(userId: string, accessToken: string) {
    const response = await this.fetchWithRetry(`${BASE_URL}/pin/user/${userId}`, {
      method: 'GET',
      headers: this.getHeaders(accessToken)
    });

    if (!response.ok) {
      if (response.status === 404) {
        return { success: false, message: 'No PIN found' };
      }
      const error = await response.json();
      throw new Error(error.error || 'Failed to get PIN');
    }

    return response.json();
  }

  async getPublicPIN(pinNumber: string) {
    const response = await this.fetchWithRetry(`${BASE_URL}/pin/public/${pinNumber}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get PIN');
    }

    return response.json();
  }

  async trackPINShare(pinNumber: string) {
    try {
      await this.fetchWithRetry(`${BASE_URL}/pin/${pinNumber}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.log('Share tracking failed:', error);
      // Non-fatal error, don't throw
    }
  }

  async getPINAnalytics(pinNumber: string, accessToken: string) {
    const response = await this.fetchWithRetry(`${BASE_URL}/pin/${pinNumber}/analytics`, {
      method: 'GET',
      headers: this.getHeaders(accessToken)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get analytics');
    }

    return response.json();
  }

  // Email Verification for PIN Onboarding
  async sendVerificationEmail(email: string, name?: string) {
    const headers = this.getHeaders(undefined, true);
    if (!('X-CSRF-Token' in headers)) {
      await this.ensurePublicCsrf();
      const refreshed = this.getHeaders(undefined, true);
      Object.assign(headers, refreshed);
    }
    const response = await this.fetchWithRetry(`${BASE_URL}/auth/email/verify/send`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ email, name })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data?.success) {
      const msg = data?.message || data?.error || 'Failed to send verification email';
      throw new Error(msg);
    }
    return data;
  }

  async verifyEmailCode(email: string, code: string) {
    const headers = this.getHeaders(undefined, true);
    if (!('X-CSRF-Token' in headers)) {
      await this.ensurePublicCsrf();
      const refreshed = this.getHeaders(undefined, true);
      Object.assign(headers, refreshed);
    }
    const response = await this.fetchWithRetry(`${BASE_URL}/auth/email/verify/confirm`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ token: code })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data?.success) {
      const msg = data?.message || data?.error || 'Verification failed';
      throw new Error(msg);
    }
    return data;
  }

  async ensurePublicCsrf() {
    try {
      const res = await this.fetchWithRetry(`${BASE_URL}/auth/csrf`, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
      const data = await res.json().catch(() => ({}));
      const csrf = data?.csrf;
      if (csrf) {
        try { localStorage.setItem('csrfToken', csrf); } catch {}
      }
      return csrf;
    } catch {
      return null;
    }
  }

  async registerStart(payload: { full_name: string; phone: string; email?: string; idempotency_key?: string }) {
    const headers = this.getHeaders(undefined, true)
    if (payload.idempotency_key) headers['X-Idempotency-Key'] = payload.idempotency_key
    const response = await this.fetchWithRetry(`${BASE_URL}/api/register/start`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      const msg = data?.message || data?.error || 'Registration start failed'
      throw new Error(msg)
    }
    return data
  }

  async registerVerifyOtp(payload: { reg_token: string; otp: string }) {
    const headers = this.getHeaders(undefined, true)
    const response = await this.fetchWithRetry(`${BASE_URL}/api/register/verify-otp`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      const msg = data?.message || data?.error || 'OTP verification failed'
      throw new Error(msg)
    }
    return data
  }

  async passwordResetSend(email: string) {
    const response = await this.fetchWithRetry(`${BASE_URL}/auth/password-reset/send`, {
      method: 'POST',
      headers: this.getHeaders(undefined, true),
      body: JSON.stringify({ email })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data?.success) {
      const msg = data?.message || data?.error || 'Failed to send password reset';
      throw new Error(msg);
    }
    return data;
  }

  async passwordResetConfirm(email: string, newPassword: string, token: string) {
    const response = await this.fetchWithRetry(`${BASE_URL}/auth/password-reset/confirm`, {
      method: 'POST',
      headers: this.getHeaders(undefined, true),
      body: JSON.stringify({ email, newPassword, token })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data?.success) {
      const msg = data?.message || data?.error || 'Failed to confirm password reset';
      throw new Error(msg);
    }
    return data;
  }

  // Phone Verification API Methods
  async sendPhoneOTP(phoneNumber: string, accessToken: string) {
    const response = await this.fetchWithRetry(`${BASE_URL}/pin/send-otp`, {
      method: 'POST',
      headers: this.getHeaders(accessToken),
      body: JSON.stringify({ phone: phoneNumber })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data?.success) {
      const msg = data?.message || data?.error || 'Failed to send OTP';
      throw new Error(msg);
    }
    return data;
  }

  async verifyPhoneOTP(phoneNumber: string, otp: string, accessToken: string) {
    const response = await this.fetchWithRetry(`${BASE_URL}/pin/verify-phone`, {
      method: 'POST',
      headers: this.getHeaders(accessToken),
      body: JSON.stringify({ phone: phoneNumber, otp })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data?.success) {
      const msg = data?.message || data?.error || 'Invalid OTP';
      throw new Error(msg);
    }
    return data;
  }

  async getPINStatus(accessToken: string) {
    const response = await this.fetchWithRetry(`${BASE_URL}/pin/status`, {
      method: 'GET',
      headers: this.getHeaders(accessToken)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data?.success) {
      const msg = data?.message || data?.error || 'Failed to get PIN status';
      throw new Error(msg);
    }
    return data;
  }

  async recordRegistrationStep(data: { email: string; step: number; status: 'started' | 'completed' }) {
    try {
      const response = await this.fetchWithRetry(`${BASE_URL}/registration/step`, {
        method: 'POST',
        headers: this.getHeaders(undefined, true),
        body: JSON.stringify(data)
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  // Registration Phone Verification API Methods (separate from PIN phone verification)
  async sendRegistrationOTP(phoneNumber: string, name: string, email?: string) {
    const response = await this.fetchWithRetry(`${BASE_URL}/registration/send-otp`, {
      method: 'POST',
      headers: this.getHeaders(undefined, true),
      body: JSON.stringify({ phone: phoneNumber, name, email })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data?.success) {
      const msg = data?.message || data?.error || 'Failed to send registration OTP';
      throw new Error(msg);
    }
    return data;
  }

  async verifyRegistrationOTP(phoneNumber: string, otp: string, regToken: string) {
    const response = await this.fetchWithRetry(`${BASE_URL}/registration/verify-otp`, {
      method: 'POST',
      headers: this.getHeaders(undefined, true),
      body: JSON.stringify({ phone: phoneNumber, otp, reg_token: regToken })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data?.success) {
      const msg = data?.message || data?.error || 'Invalid registration OTP';
      throw new Error(msg);
    }
    return data;
  }

  async getRegistrationStatus(regToken: string) {
    const response = await this.fetchWithRetry(`${BASE_URL}/registration/status?token=${encodeURIComponent(regToken)}`, {
      method: 'GET',
      headers: this.getHeaders(undefined, true)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { success: false, status: 'unknown' };
    }
    return data;
  }

  async issuePIN(accessToken: string) {
    const response = await this.fetchWithRetry(`${BASE_URL}/pin/issue`, {
      method: 'POST',
      headers: this.getHeaders(accessToken)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data?.success) {
      const msg = data?.message || data?.error || 'Failed to issue PIN';
      const error = await response.json();
      throw new Error(error.error || 'Failed to get projects');
    }
    return response.json();
  }

  // ============================================================================
  // Passwordless Auth API Methods
  // ============================================================================

  async requestOTP(contact: string, contactType: 'phone' | 'email') {
    const response = await this.fetchWithRetry(`${AUTH_OTP_URL}/request`, {
      method: 'POST',
      headers: this.getHeaders(undefined, true),
      body: JSON.stringify({ contact, contact_type: contactType })
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error('API Error Response:', error);
      throw new Error(error.error || JSON.stringify(error) || 'Failed to send OTP');
    }
    
    const data = await response.json();
    console.log('OTP Request Response:', data);
    return data;
  }

  async verifyOTP(
    contact: string, 
    otp: string,
    metadata?: { name?: string; email?: string; phone?: string },
    createAccount: boolean = false
  ) {
    const requestBody: any = { contact, otp, create_account: createAccount };
    
    // Include metadata if provided (for registration flow)
    if (metadata) {
      if (metadata.name) requestBody.name = metadata.name;
      if (metadata.email) requestBody.email = metadata.email;
      if (metadata.phone) requestBody.phone = metadata.phone;
    }
    
    const response = await this.fetchWithRetry(`${AUTH_OTP_URL}/verify`, {
      method: 'POST',
      headers: this.getHeaders(undefined, true),
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      // Attach debug info to the error object if available
      const errorObj = new Error(error.error || 'Failed to verify OTP');
      (errorObj as any).debug = error.debug;
      console.error('OTP Verify Error Details:', JSON.stringify(error, null, 2));
      throw errorObj;
    }
    
    return response.json();
  }



  async getMyProfile(accessToken: string) {
    const response = await this.fetchWithRetry(`${USER_URL}/me`, {
      method: 'GET',
      headers: this.getHeaders(accessToken)
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to get user profile');
    }
    
    return response.json();
  }

  async createProject(projectData: any, accessToken: string) {
    const response = await this.fetchWithRetry(`${BASE_URL}/projects`, {
      method: 'POST',
      headers: this.getHeaders(accessToken),
      body: JSON.stringify(projectData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create project');
    }
    return response.json();
  }

  // Endorsement API Methods
  async getEndorsements(userId: string, accessToken: string) {
    const response = await this.fetchWithRetry(`${BASE_URL}/endorsements/${userId}`, {
      method: 'GET',
      headers: this.getHeaders(accessToken)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get endorsements');
    }
    return response.json();
  }

  async createEndorsement(endorsementData: any, accessToken: string) {
    const response = await this.fetchWithRetry(`${BASE_URL}/endorsements`, {
      method: 'POST',
      headers: this.getHeaders(accessToken),
      body: JSON.stringify(endorsementData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create endorsement');
    }
    return response.json();
  }
}

export const api = new APIClient();
