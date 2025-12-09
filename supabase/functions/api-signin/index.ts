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

  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return { valid: false, error: 'API key expired' };
  }

  // Check rate limits
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
// Endpoint 1: Initiate Sign-In Flow
// POST /api/v1/signin/initiate
// ============================================================================
app.post("/api/v1/signin/initiate", async (c) => {
  const startTime = Date.now();
  
  try {
    const apiKey = c.req.header("X-API-Key");
    if (!apiKey) {
      return c.json({
        error: "Missing API key",
        error_code: "API_KEY_REQUIRED"
      }, 401);
    }

    const validation = await validateAPIKey(apiKey);
    if (!validation.valid) {
      return c.json({
        error: validation.error,
        error_code: "INVALID_API_KEY"
      }, 401);
    }

    const { key } = validation;

    // Check permissions
    if (!key.permissions?.instant_signin) {
      await logAPIUsage(
        key.id,
        key.user_id,
        '/api/v1/signin/initiate',
        'POST',
        403,
        Date.now() - startTime
      );
      
      return c.json({
        error: "Insufficient permissions. Enable 'instant_signin' permission.",
        error_code: "PERMISSION_DENIED"
      }, 403);
    }

    const body = await c.req.json();
    const { 
      pin, 
      scopes = ["basic"],
      redirect_uri,
      state
    } = body;

    if (!pin) {
      return c.json({
        error: "PIN is required",
        error_code: "MISSING_PIN"
      }, 400);
    }

    if (!redirect_uri) {
      return c.json({
        error: "redirect_uri is required",
        error_code: "MISSING_REDIRECT_URI"
      }, 400);
    }

    // Validate PIN exists
    const { data: professionalUser, error: userError } = await supabase
      .from('professional_profiles')
      .select('user_id, phone, full_name')
      .eq('phone', pin)
      .single();

    if (userError || !professionalUser) {
      const responseTime = Date.now() - startTime;
      await logAPIUsage(
        key.id,
        key.user_id,
        '/api/v1/signin/initiate',
        'POST',
        404,
        responseTime,
        pin,
        'Professional not found'
      );

      return c.json({
        error: "Professional not found",
        error_code: "PIN_NOT_FOUND"
      }, 404);
    }

    // Create consent request
    const consentToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const { error: consentError } = await supabase
      .from('consent_requests')
      .insert({
        consent_token: consentToken,
        professional_id: professionalUser.user_id,
        business_id: key.user_id,
        requested_scopes: scopes,
        redirect_uri: redirect_uri,
        state: state,
        expires_at: expiresAt.toISOString(),
        status: 'pending'
      });

    if (consentError) {
      console.error('Consent request creation error:', consentError);
      return c.json({
        error: "Failed to create consent request",
        error_code: "CONSENT_REQUEST_FAILED"
      }, 500);
    }

    // Generate consent URL
    const appUrl = Deno.env.get('APP_URL') || 'http://localhost:3000';
    const consentUrl = `${appUrl}/consent/${consentToken}`;

    const responseTime = Date.now() - startTime;
    await logAPIUsage(
      key.id,
      key.user_id,
      '/api/v1/signin/initiate',
      'POST',
      200,
      responseTime,
      pin
    );

    return c.json({
      consent_url: consentUrl,
      consent_token: consentToken,
      expires_at: expiresAt.toISOString(),
      professional: {
        pin: pin,
        name: professionalUser.full_name
      },
      meta: {
        request_id: crypto.randomUUID(),
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('Signin initiate error:', error);
    return c.json({
      error: "Internal server error",
      error_code: "INTERNAL_ERROR",
      message: error.message
    }, 500);
  }
});

// ============================================================================
// Endpoint 2: Handle Callback (after user consent)
// GET /api/v1/signin/callback?consent_token=xxx&action=approve/deny
// ============================================================================
app.get("/api/v1/signin/callback", async (c) => {
  const startTime = Date.now();
  
  try {
    const consentToken = c.req.query("consent_token");
    const action = c.req.query("action"); // "approve" or "deny"

    if (!consentToken) {
      return c.json({
        error: "consent_token is required",
        error_code: "MISSING_CONSENT_TOKEN"
      }, 400);
    }

    // Fetch consent request
    const { data: consentRequest, error: fetchError } = await supabase
      .from('consent_requests')
      .select('*')
      .eq('consent_token', consentToken)
      .single();

    if (fetchError || !consentRequest) {
      return c.json({
        error: "Invalid or expired consent token",
        error_code: "INVALID_CONSENT_TOKEN"
      }, 404);
    }

    // Check if expired
    if (new Date(consentRequest.expires_at) < new Date()) {
      return c.json({
        error: "Consent request expired",
        error_code: "CONSENT_EXPIRED"
      }, 400);
    }

    // Check if already processed
    if (consentRequest.status !== 'pending') {
      return c.json({
        error: "Consent request already processed",
        error_code: "CONSENT_ALREADY_PROCESSED"
      }, 400);
    }

    if (action === 'deny') {
      // Update consent request status
      await supabase
        .from('consent_requests')
        .update({ status: 'denied', updated_at: new Date().toISOString() })
        .eq('consent_token', consentToken);

      // Redirect back to business with error
      const redirectUrl = new URL(consentRequest.redirect_uri);
      redirectUrl.searchParams.set('error', 'access_denied');
      redirectUrl.searchParams.set('error_description', 'User denied consent');
      if (consentRequest.state) {
        redirectUrl.searchParams.set('state', consentRequest.state);
      }

      return c.redirect(redirectUrl.toString());
    }

    // User approved - create access grant
    const authCode = crypto.randomUUID();
    const codeExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Update consent request
    await supabase
      .from('consent_requests')
      .update({ 
        status: 'approved',
        auth_code: authCode,
        auth_code_expires_at: codeExpiresAt.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('consent_token', consentToken);

    // Create data access consent record
    await supabase
      .from('data_access_consents')
      .insert({
        professional_id: consentRequest.professional_id,
        business_id: consentRequest.business_id,
        scopes: consentRequest.requested_scopes,
        consent_given_at: new Date().toISOString(),
        is_active: true,
        expires_at: null // Permanent until revoked
      });

    // Redirect back to business with auth code
    const redirectUrl = new URL(consentRequest.redirect_uri);
    redirectUrl.searchParams.set('code', authCode);
    if (consentRequest.state) {
      redirectUrl.searchParams.set('state', consentRequest.state);
    }

    return c.redirect(redirectUrl.toString());

  } catch (error: any) {
    console.error('Signin callback error:', error);
    return c.json({
      error: "Internal server error",
      error_code: "INTERNAL_ERROR",
      message: error.message
    }, 500);
  }
});

// ============================================================================
// Endpoint 3: Exchange Auth Code for Access Token
// POST /api/v1/signin/exchange
// ============================================================================
app.post("/api/v1/signin/exchange", async (c) => {
  const startTime = Date.now();
  
  try {
    const apiKey = c.req.header("X-API-Key");
    if (!apiKey) {
      return c.json({
        error: "Missing API key",
        error_code: "API_KEY_REQUIRED"
      }, 401);
    }

    const validation = await validateAPIKey(apiKey);
    if (!validation.valid) {
      return c.json({
        error: validation.error,
        error_code: "INVALID_API_KEY"
      }, 401);
    }

    const { key } = validation;

    const body = await c.req.json();
    const { code } = body;

    if (!code) {
      return c.json({
        error: "Authorization code is required",
        error_code: "MISSING_CODE"
      }, 400);
    }

    // Fetch consent request by auth code
    const { data: consentRequest, error: fetchError } = await supabase
      .from('consent_requests')
      .select('*')
      .eq('auth_code', code)
      .eq('business_id', key.user_id)
      .single();

    if (fetchError || !consentRequest) {
      return c.json({
        error: "Invalid authorization code",
        error_code: "INVALID_CODE"
      }, 404);
    }

    // Check if code expired
    if (new Date(consentRequest.auth_code_expires_at) < new Date()) {
      return c.json({
        error: "Authorization code expired",
        error_code: "CODE_EXPIRED"
      }, 400);
    }

    // Check if already exchanged
    if (consentRequest.access_token) {
      return c.json({
        error: "Code already used",
        error_code: "CODE_ALREADY_USED"
      }, 400);
    }

    // Generate access token
    const accessToken = crypto.randomUUID();
    const tokenExpiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 60 days

    // Update consent request with token
    await supabase
      .from('consent_requests')
      .update({ 
        access_token: accessToken,
        access_token_expires_at: tokenExpiresAt.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('auth_code', code);

    // Get professional info
    const { data: professional } = await supabase
      .from('professional_profiles')
      .select('phone, full_name, user_id')
      .eq('user_id', consentRequest.professional_id)
      .single();

    const responseTime = Date.now() - startTime;
    await logAPIUsage(
      key.id,
      key.user_id,
      '/api/v1/signin/exchange',
      'POST',
      200,
      responseTime,
      professional?.phone
    );

    return c.json({
      access_token: accessToken,
      token_type: "Bearer",
      expires_in: 60 * 24 * 60 * 60, // seconds
      expires_at: tokenExpiresAt.toISOString(),
      scopes: consentRequest.requested_scopes,
      professional: {
        pin: professional?.phone,
        user_id: professional?.user_id,
        name: professional?.full_name
      },
      meta: {
        request_id: crypto.randomUUID(),
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('Token exchange error:', error);
    return c.json({
      error: "Internal server error",
      error_code: "INTERNAL_ERROR",
      message: error.message
    }, 500);
  }
});

Deno.serve(app.fetch);
