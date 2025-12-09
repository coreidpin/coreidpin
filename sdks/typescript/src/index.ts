import axios, { AxiosInstance, AxiosError } from 'axios';

export interface GidiPINConfig {
    apiKey: string;
    baseURL?: string;
}

export interface VerificationResponse {
    valid: boolean;
    professional?: any;
    error?: string;
}

export interface SignInInitiateParams {
    pin: string;
    redirect_uri: string;
    state?: string;
    scopes?: string[];
}

export interface SignInExchangeParams {
    code: string;
}

export class GidiPIN {
    private client: AxiosInstance;

    constructor(config: GidiPINConfig) {
        this.client = axios.create({
            baseURL: config.baseURL || 'https://api.gidipin.com/api/v1',
            headers: {
                'X-API-Key': config.apiKey,
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });
    }

    /**
     * Verify a professional PIN
     * @param pin The PIN to verify
     */
    async verify(pin: string): Promise<VerificationResponse> {
        try {
            const response = await this.client.post('/verify', { pin });
            return response.data;
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Get public details of a professional
     * @param pin The PIN to lookup
     */
    async getProfessional(pin: string): Promise<any> {
        try {
            const response = await this.client.get(`/professional/${pin}`);
            return response.data;
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Initiate the Instant Sign-In flow
     */
    async initiateSignIn(params: SignInInitiateParams) {
        try {
            const response = await this.client.post('/signin/initiate', params);
            return response.data;
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Exchange authorization code for access token
     */
    async exchangeCode(params: SignInExchangeParams) {
        try {
            const response = await this.client.post('/signin/exchange', params);
            return response.data;
        } catch (error) {
            return this.handleError(error);
        }
    }

    private handleError(error: any): never {
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.error || error.message;
            const code = error.response?.data?.error_code || error.code;
            throw new Error(`GidiPIN API Error [${code}]: ${message}`);
        }
        throw error;
    }
}
