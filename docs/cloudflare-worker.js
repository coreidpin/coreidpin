// Cloudflare Worker for api.gidipin.work
// Proxies requests to Supabase Edge Functions

const SUPABASE_PROJECT_REF = 'evcqpapvcvmljgqiuzsq'; // From deployment output
const SUPABASE_FUNCTIONS_URL = `https://${SUPABASE_PROJECT_REF}.supabase.co/functions/v1`;

// Endpoint mapping: /v1/* -> /api-*
const ENDPOINT_MAPPING = {
  '/v1/verify': '/api-verify',
  '/v1/professional': '/api-profile',
  '/v1/signin/initiate': '/api-signin',
};

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
        'Access-Control-Max-Age': '86400',
      }
    });
  }

  // Map incoming path to Supabase function
  let functionPath = null;
  
  // Check exact matches first
  for (const [apiPath, functionName] of Object.entries(ENDPOINT_MAPPING)) {
    if (url.pathname === apiPath || url.pathname.startsWith(apiPath + '/')) {
      functionPath = functionName + url.pathname.substring(apiPath.length);
      break;
    }
  }

  // If no mapping found, return 404
  if (!functionPath) {
    return new Response(JSON.stringify({
      error: 'Endpoint not found',
      available_endpoints: Object.keys(ENDPOINT_MAPPING)
    }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  }

  // Build Supabase function URL
  const supabaseUrl = `${SUPABASE_FUNCTIONS_URL}${functionPath}${url.search}`;

  try {
    // Forward the request to Supabase
    const response = await fetch(supabaseUrl, {
      method: request.method,
      headers: request.headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
    });

    // Clone response and add CORS headers
    const modifiedResponse = new Response(response.body, response);
    modifiedResponse.headers.set('Access-Control-Allow-Origin', '*');
    modifiedResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    modifiedResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');

    return modifiedResponse;

  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Failed to proxy request',
      message: error.message
    }), {
      status: 502,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
}
