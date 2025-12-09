import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { createClient } from "npm:@supabase/supabase-js";
su
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

// Import validation function (same as api-verify)
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
// Endpoint: Get Professional Profile Data
// GET /api/v1/professional/:pin
// ============================================================================
app.get("/api/v1/professional/:pin", async (c) => {
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
    if (!key.permissions?.read_profile) {
      await logAPIUsage(
        key.id,
        key.user_id,
        '/api/v1/professional/:pin',
        'GET',
        403,
        Date.now() - startTime
      );
      
      return c.json({
        error: "Insufficient permissions. Enable 'read_profile' permission.",
        error_code: "PERMISSION_DENIED"
      }, 403);
    }

    const pin = c.req.param("pin");
    const scopesParam = c.req.query("scope") || "basic";
    const requestedScopes = scopesParam.split(",").map(s => s.trim());

    // Sandbox mode - return test data
    if (key.environment === 'sandbox') {
      const testProfiles: Record<string, any> = {
        '08012345678': {
          pin: '08012345678',
          basic: {
            name: 'John Doe (Test)',
            headline: 'Senior Full-Stack Developer',
            location: 'Lagos, Nigeria',
            avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
            verified: true
          },
          work_history: [
            {
              company: 'TechCorp',
              title: 'Senior Developer',
              duration: '2020 - Present',
              description: 'Building scalable applications'
            }
          ],
          projects: [
            {
              title: 'E-commerce Platform',
              description: 'Built a complete e-commerce solution',
              tech_stack: ['React', 'Node.js', 'PostgreSQL']
            }
          ],
          skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'PostgreSQL'],
          endorsements: [
            {
              from: 'Jane Smith',
              skill: 'React',
              message: 'Excellent React developer!'
            }
          ],
          consent: {
            granted_at: new Date().toISOString(),
            scopes: requestedScopes,
            expires_at: null
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
        '/api/v1/professional/:pin',
        'GET',
        200,
        responseTime,
        pin
      );

      if (testProfiles[pin]) {
        // Filter data based on requested scopes
        const response = { pin: pin, basic: testProfiles[pin].basic };
        if (requestedScopes.includes('work_history')) response.work_history = testProfiles[pin].work_history;
        if (requestedScopes.includes('projects')) response.projects = testProfiles[pin].projects;
        if (requestedScopes.includes('skills')) response.skills = testProfiles[pin].skills;
        if (requestedScopes.includes('endorsements')) response.endorsements = testProfiles[pin].endorsements;
        response.consent = testProfiles[pin].consent;
        response.meta = testProfiles[pin].meta;
        
        return c.json(response);
      } else {
        return c.json({
          error: "Professional not found in sandbox",
          error_code: "NOT_FOUND"
        }, 404);
      }
    }

    // Production mode - check consent first
    const { data: professionalUser, error: userError } = await supabase
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

    if (userError || !professionalUser) {
      const responseTime = Date.now() - startTime;
      await logAPIUsage(
        key.id,
        key.user_id,
        '/api/v1/professional/:pin',
        'GET',
        404,
        responseTime,
        pin,
        'Professional not found'
      );

      return c.json({
        error: "Professional not found",
        error_code: "NOT_FOUND"
      }, 404);
    }

    // Check consent
    const hasConsent = await supabase.rpc('is_consent_valid', {
      p_professional_id: professionalUser.user_id,
      p_business_id: key.user_id,
      p_required_scopes: requestedScopes
    });

    if (!hasConsent.data) {
      const responseTime = Date.now() - startTime;
      await logAPIUsage(
        key.id,
        key.user_id,
        '/api/v1/professional/:pin',
        'GET',
        403,
        responseTime,
        pin,
        'Consent not granted'
      );

      return c.json({
        error: "Consent not granted. Use instant sign-in to request access.",
        error_code: "CONSENT_REQUIRED",
        consent_url: `${Deno.env.get('APP_URL')}/api/v1/signin/initiate`
      }, 403);
    }

    // Build response based on scopes
    const response: any = {
      pin: pin,
      basic: {
        name: professionalUser.users?.raw_user_meta_data?.full_name || professionalUser.full_name,
        headline: professionalUser.headline,
        location: professionalUser.location,
        avatar_url: professionalUser.avatar_url,
        verified: professionalUser.verification_status === 'verified'
      }
    };

    // Add data based on granted scopes
    if (requestedScopes.includes('work_history')) {
      const { data: workHistory } = await supabase
        .from('work_history')
        .select('*')
        .eq('user_id', professionalUser.user_id)
        .order('start_date', { ascending: false });
      
      response.work_history = workHistory || [];
    }

    if (requestedScopes.includes('projects')) {
      const { data: projects } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', professionalUser.user_id)
        .eq('is_public', true);
      
      response.projects = projects || [];
    }

    if (requestedScopes.includes('skills')) {
      response.skills = professionalUser.skills || [];
    }

    if (requestedScopes.includes('endorsements')) {
      const { data: endorsements } = await supabase
        .from('endorsements')
        .select('*')
        .eq('endorsed_user_id', professionalUser.user_id);
      
      response.endorsements = endorsements || [];
    }

    // Add consent info
    const { data: consentData } = await supabase
      .from('data_access_consents')
      .select('*')
      .eq('professional_id', professionalUser.user_id)
      .eq('business_id', key.user_id)
      .eq('is_active', true)
      .single();

    if (consentData) {
      response.consent = {
        granted_at: consentData.consent_given_at,
        scopes: consentData.scopes,
        expires_at: consentData.expires_at
      };
    }

    response.meta = {
      request_id: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    };

    const responseTime = Date.now() - startTime;
    await logAPIUsage(
      key.id,
      key.user_id,
      '/api/v1/professional/:pin',
      'GET',
      200,
      responseTime,
      pin
    );

    return c.json(response);

  } catch (error: any) {
    console.error('Profile API error:', error);
    
    return c.json({
      error: "Internal server error",
      error_code: "INTERNAL_ERROR",
      message: error.message
    }, 500);
  }
});

Deno.serve(app.fetch);
