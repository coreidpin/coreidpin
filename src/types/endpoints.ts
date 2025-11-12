export type UserType = 'employer' | 'professional' | 'university'

export type EntryPoint = 'signup' | 'get-started'

export interface ValidateRegistrationRequest {
  entryPoint: EntryPoint
  userType: UserType
  data: Record<string, unknown>
}

export interface ValidateRegistrationResponse {
  valid: boolean
  errors: string[]
}

export interface RegisterUserData {
  email: string
  password: string
  name: string
  userType: UserType
  title?: string
  companyName?: string
  role?: string
  institution?: string
}

export interface RegisterResponseSuccess {
  success: true
  userId: string
  userType: UserType
}

export interface ErrorResponse {
  error: string
}

export type RegisterResponse = RegisterResponseSuccess | ErrorResponse

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponseSuccess {
  success: true
  accessToken: string
  refreshToken: string
  expiresIn: number
  user: unknown
  userData?: unknown
}

export type LoginResponse = LoginResponseSuccess | ErrorResponse

export interface SendVerificationRequest {
  email: string
}

export interface SendVerificationResponseSuccess {
  success: true
}

export type SendVerificationResponse = SendVerificationResponseSuccess | ErrorResponse

export interface CompleteProfileResponseSuccess {
  success: true
  profile: unknown
  completionPercentage: number
  missingFields: string[]
}

export type CompleteProfileResponse = CompleteProfileResponseSuccess | ErrorResponse

export interface RecommendationsResponse {
  success: true
  recommendations: unknown[]
  count: number
}

export interface PinCreateRequest {
  name: string
  title: string
  location: string
  avatar?: string
  linkedinUrl?: string
  githubUrl?: string
  portfolioUrl?: string
  experiences?: unknown[]
  skills?: unknown[]
}

export interface PinCreateResponseSuccess {
  success: true
  pinNumber: string
  pinId: string
  message: string
}

export type PinCreateResponse = PinCreateResponseSuccess | ErrorResponse

export interface PinAnalyticsResponse {
  success: true
  analytics: {
    totalViews: number
    totalShares: number
    recentEvents: unknown[]
  }
}

export interface SmsSendRequest {
  phone: string
}

export interface SmsVerifyRequest {
  phone: string
  code: string
}

export interface SmsResponseSuccess {
  success: true
}

export type SmsResponse = SmsResponseSuccess | ErrorResponse
