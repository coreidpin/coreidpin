import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { createClient } from "npm:@supabase/supabase-js";

const app = new Hono();

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

app.use("/*", cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization", "X-API-Key"],
  allowMethods: ["GET", "POST", "OPTIONS"],
  credentials: false,
}));

// ============================================================================
// API Key Validation Middleware
// ============================================================================
async function validateAPIKey(apiKey: string) {
  const { data, error } = await supabase
    .from('api_keys')
    .select('*, business_profiles!inner(*)')
    .eq('api_key', apiKey)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    return { valid: false, error: 'Invalid API key' };
  }

  // Check if key has expired
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return { valid: false, error: 'API key expired' };
  }

  // Check rate limits (simplified - in production, use Redis)
  const now = new Date();
  const oneMinuteAgo = new Date(now.getTime() - 60000);

  const { count } = await supabase
    .from('api_usage_logs')
    .select('*', { count: 'exact', head: true })
    .eq('api_key_id', data.id)
    .gte('created_at', oneMinuteAgo.toISOString());

  if (count && count >= data.rate_limit_per_minute) {
    return { valid: false, error: 'Rate limit exceeded' };
  }

  // Check monthly quota
  const business = data.business_profiles;
  if (business.current_month_usage >= business.monthly_api_quota) {
    return { valid: false, error: 'Monthly quota exceeded' };
  }

  return { valid: true, key: data };
}

// ============================================================================
// Helper: Log API Usage
// ============================================================================
async function logAPIUsage(
  apiKeyId: string,
  userId: string,
  endpoint: string,
  method: string,
  statusCode: number,
  responseTimeMs: number,
  pinQueried?: string,
  errorMessage?: string
) {
  await supabase.rpc('log_api_usage', {
    p_api_key_id: apiKeyId,
    p_user_id: userId,
    p_endpoint: endpoint,
    p_method: method,
    p_status_code: statusCode,
    p_response_time_ms: responseTimeMs,
    p_pin_queried: pinQueried,
    p_error_message: errorMessage
  });
}

// ============================================================================
// Endpoint: Verify PIN
// POST /api/v1/verify
// ============================================================================
app.post("/api/v1/verify", async (c) => {
  const startTime = Date.now();
  
  try {
    // Get API key from header
    const apiKey = c.req.header("X-API-Key");
    if (!apiKey) {
      return c.json({
        error: "Missing API key",
        error_code: "API_KEY_REQUIRED"
      }, 401);
    }

    // Validate API key
    const validation = await validateAPIKey(apiKey);
    if (!validation.valid) {
      return c.json({
        error: validation.error,
        error_code: "INVALID_API_KEY"
      }, 401);
    }

    const { key } = validation;

    // Check permissions
    if (!key.permissions?.verify_pin) {
      await logAPIUsage(
        key.id,
        key.user_id,
        '/api/v1/verify',
        'POST',
        403,
        Date.now() - startTime
      );
      
      return c.json({
        error: "Insufficient permissions",
        error_code: "PERMISSION_DENIED"
      }, 403);
    }

    // Parse request body
    const body = await c.req.json();
    const { pin, scope = ["basic"] } = body;

    if (!pin) {
      await logAPIUsage(
        key.id,
        key.user_id,
        '/api/v1/verify',
        'POST',
        400,
        Date.now() - startTime,
        undefined,
        'Missing PIN parameter'
      );
      
      return c.json({
        error: "PIN is required",
        error_code: "MISSING_PIN"
      }, 400);
    }

    // Sandbox mode - return test data
    if (key.environment === 'sandbox') {
      const testPINs: Record<string, any> = {
        '08012345678': {
          verified: true,
          pin: '08012345678',
          professional: {
            name: 'John Doe (Test)',
            verified_status: true,
            profile_completeness: 85,
            badges: ['beta_tester', 'verified'],
            member_since: '2024-01-15'
          },
          meta: {
            environment: 'sandbox',
            request_id: crypto.randomUUID(),
            timestamp: new Date().toISOString()
          }
        },
        '08087654321': {
          verified: true,
          pin: '08087654321',
          professional: {
            name: 'Jane Smith (Test)',
            verified_status: false,
            profile_completeness: 45,
            badges: ['beta_tester'],
            member_since: '2024-03-20'
          },
          meta: {
            environment: 'sandbox',
            request_id: crypto.randomUUID(),
            timestamp: new Date().toISOString()
          }
        }
      };

      const responseTime = Date.now() - startTime;
      await logAPIUsage(
        key.id,
        key.user_id,
        '/api/v1/verify',
        'POST',
        200,
        responseTime,
        pin
      );

      if (testPINs[pin]) {
        return c.json(testPINs[pin]);
      } else {
        return c.json({
          verified: false,
          pin: pin,
          error: "PIN not found in sandbox",
          meta: {
            environment: 'sandbox',
            request_id: crypto.randomUUID(),
            timestamp: new Date().toISOString()
          }
        }, 404);
      }
    }

    // Production mode - lookup real PIN
    // First try to find user by phone number
    const { data: userMetadata, error: metaError } = await supabase
      .from('professional_profiles')
      .select(`
        *,
        users:user_id (
          id,
          email,
          raw_user_meta_data,
          created_at
        )
      `)
      .eq('phone', pin)
      .single();

    if (metaError || !userMetadata) {
      const responseTime = Date.now() - startTime;
      await logAPIUsage(
        key.id,
        key.user_id,
        '/api/v1/verify',
        'POST',
        404,
        responseTime,
        pin,
        'PIN not found'
      );

      return c.json({
        verified: false,
        pin: pin,
        error: "PIN not found",
        error_code: "PIN_NOT_FOUND",
        meta: {
          request_id: crypto.randomUUID(),
          timestamp: new Date().toISOString()
        }
      }, 404);
    }

    // Build response based on scope
    const response: any = {
      verified: true,
      pin: pin,
      professional: {
        name: userMetadata.users?.raw_user_meta_data?.full_name || userMetadata.full_name,
        verified_status: userMetadata.verification_status === 'verified',
        profile_completeness: calculateProfileCompleteness(userMetadata),
        badges: userMetadata.badges || [],
        member_since: userMetadata.users?.created_at
      },
      meta: {
        request_id: crypto.randomUUID(),
        timestamp: new Date().toISOString()
      }
    };

    const responseTime = Date.now() - startTime;
    await logAPIUsage(
      key.id,
      key.user_id,
      '/api/v1/verify',
      'POST',
      200,
      responseTime,
      pin
    );

    return c.json(response);

  } catch (error: any) {
    console.error('Verify API error:', error);
    const responseTime = Date.now() - startTime;
    
   return c.json({
      error: "Internal server error",
      error_code: "INTERNAL_ERROR",
      message: error.message
    }, 500);
  }
});

// Helper function to calculate profile completeness
function calculateProfileCompleteness(profile: any): number {
  let score = 0;
  const fields = [
    'full_name', 'headline', 'location', 'bio',
    'avatar_url', 'skills', 'work_history'
  ];
  
  fields.forEach(field => {
    if (profile[field]) {
      score += (100 / fields.length);
    }
  });
  
  return Math.round(score);
}

Deno.serve(app.fetch);
