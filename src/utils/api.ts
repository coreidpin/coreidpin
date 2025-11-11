import { projectId, publicAnonKey } from './supabase/info';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/server`;

export interface RegisterUserData {
  email: string;
  password: string;
  name: string;
  userType: 'employer' | 'professional' | 'university';
  title?: string;
  companyName?: string;
  role?: string;
  institution?: string;
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
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    } else if (includeAnonForPublic) {
      // For public endpoints when Verify JWT is enabled on Edge Functions,
      // include anon key (prefer env, fallback to bundled publicAnonKey).
      const anonKey = (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY ?? publicAnonKey;
      if (anonKey) headers['Authorization'] = `Bearer ${anonKey}`;
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
        if (res.status >= 500 || res.status === 429) {
          throw Object.assign(new Error(`Transient error: ${res.status}`), { status: res.status });
        }
        return res;
      } catch (err: any) {
        lastError = err;
        const isTransient = !!(err && (err.status >= 500 || err.status === 429));
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
    const response = await this.fetchWithRetry(`${BASE_URL}/register`, {
      method: 'POST',
      headers: this.getHeaders(undefined, true),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    return response.json();
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

  async loginSecure(data: LoginData) {
    const response = await this.fetchWithRetry(`${BASE_URL}/login`, {
      method: 'POST',
      headers: this.getHeaders(undefined, true),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Login failed' }));
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
}

export const api = new APIClient();