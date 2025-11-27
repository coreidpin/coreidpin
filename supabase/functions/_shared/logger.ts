/**
 * Safe Logger for Edge Functions
 * Automatically sanitizes PII from logs and provides environment-aware logging
 */

const isDev = Deno.env.get('ENVIRONMENT') === 'development' || Deno.env.get('ENVIRONMENT') === 'dev';
const isTest = Deno.env.get('ENVIRONMENT') === 'test';

/**
 * Generate a short request ID for tracking
 */
export function generateRequestId(): string {
  return crypto.randomUUID().split('-')[0];
}

/**
 * Hash sensitive data for logging (first 12 chars of hash)
 */
export async function hashForLog(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex.substring(0, 12);
}

/**
 * Sanitize an object by removing PII fields
 */
function sanitize(data: Record<string, any>): Record<string, any> {
  const sanitized = { ...data };
  
  // Remove PII fields
  const piiFields = ['phone', 'email', 'otp', 'password', 'pin', 'token', 'reg_token', 'access_token', 'refresh_token'];
  
  for (const field of piiFields) {
    if (field in sanitized) {
      delete sanitized[field];
    }
  }
  
  // Remove nested PII
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'object' && sanitized[key] !== null && !Array.isArray(sanitized[key])) {
      sanitized[key] = sanitize(sanitized[key]);
    }
  }
  
  return sanitized;
}

/**
 * Safe info log
 */
export function logInfo(message: string, data?: Record<string, any>) {
  const logData = {
    timestamp: new Date().toISOString(),
    ...(data ? sanitize(data) : {})
  };
  
  console.log(`[INFO] ${message}`, logData);
}

/**
 * Safe error log
 */
export function logError(message: string, error?: any, data?: Record<string, any>) {
  const logData = {
    timestamp: new Date().toISOString(),
    error: error?.message || String(error),
    ...(data ? sanitize(data) : {})
  };
  
  console.error(`[ERROR] ${message}`, logData);
}

/**
 * Development-only detailed log (includes PII, only in dev environment)
 */
export function logDebug(message: string, data?: Record<string, any>) {
  if (isDev || isTest) {
    console.log(`[DEBUG] ${message}`, {
      timestamp: new Date().toISOString(),
      ...data
    });
  }
}

/**
 * Log OTP request (sanitized)
 */
export async function logOTPRequest(contactType: 'phone' | 'email', contact: string, requestId: string) {
  const contactHash = await hashForLog(contact);
  
  logInfo('OTP requested', {
    request_id: requestId,
    contact_type: contactType,
    contact_hash: contactHash
  });
  
  // Only in dev: log full details
  if (isDev) {
    logDebug('OTP request (dev only)', {
      request_id: requestId,
      contact,
      contact_type: contactType
    });
  }
}

/**
 * Log OTP verification attempt (sanitized)
 */
export async function logOTPVerification(success: boolean, contactType: 'phone' | 'email', contact: string, requestId: string, attempts?: number) {
  const contactHash = await hashForLog(contact);
  
  logInfo('OTP verification', {
    request_id: requestId,
    success,
    contact_type: contactType,
    contact_hash: contactHash,
    attempts
  });
  
  // Only in dev: log full details
  if (isDev) {
    logDebug('OTP verification (dev only)', {
      request_id: requestId,
      success,
      contact,
      attempts
    });
  }
}

/**
 * Log user action (sanitized)
 */
export function logUserAction(action: string, userId: string, metadata?: Record<string, any>) {
  logInfo(`User action: ${action}`, {
    user_id: userId,
    ...(metadata ? sanitize(metadata) : {})
  });
}
