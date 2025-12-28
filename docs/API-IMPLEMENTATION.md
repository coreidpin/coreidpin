# GidiPIN REST API - Implementation Guide

## ✅ Current Status

The GidiPIN REST API is **implemented** using Supabase Edge Functions. The following endpoints are available:

### Implemented Endpoints:

1. **POST /api/v1/verify** - `api-verify` function
   - Verifies if a PIN exists
   - Returns basic professional information
   - Rate limited: 100 requests/minute
   - Requires API key authentication

2. **GET /api/v1/professional/:pin** - `api-profile` function
   - Gets detailed professional data
   - Requires user consent
   - Returns full profile, work history, skills, endorsements

3. **POST /api/v1/signin/initiate** - `api-signin` function
   - Initiates PIN-based authentication
   - Returns authorization URL and session ID
   - Handles redirect callbacks

---

## 🚀 How to Deploy

### 1. Deploy Individual Function:
```bash
supabase functions deploy api-verify
supabase functions deploy api-profile
supabase functions deploy api-signin
```

### 2. Deploy All API Functions:
```bash
supabase functions deploy api-verify api-profile api-signin
```

### 3. Set Environment Variables:
```bash
supabase secrets set SUPABASE_URL=your_url
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_key
```

---

## 📡 Accessing the API

### Base URLs:

**Development (local):**
```
http://127.0.0.1:54321/functions/v1/
```

**Production (Supabase-hosted):**
```
https://[your-project-ref].supabase.co/functions/v1/
```

**Custom Domain (if configured):**
```
https://api.gidipin.com/v1/
```

---

## 🔑 Authentication

All requests require an API key in the `X-API-Key` header:

```bash
curl -X POST https://your-project.supabase.co/functions/v1/api-verify \
  -H "X-API-Key: YOUR_API_KEY_HERE" \
  -H "Content-Type: application/json" \
  -d '{"pin": "08012345678"}'
```

---

## 📝 Example Requests

### 1. Verify PIN (Sandbox Mode)

```bash
curl -X POST http://127.0.0.1:54321/functions/v1/api-verify \
  -H "X-API-Key: sandbox_test_key" \
  -H "Content-Type: application/json" \
  -d '{
    "pin": "08012345678",
    "scope": ["basic"]
  }'
```

**Response:**
```json
{
  "verified": true,
  "pin": "08012345678",
  "professional": {
    "name": "John Doe (Test)",
    "verified_status": true,
    "profile_completeness": 85,
    "badges": ["beta_tester", "verified"],
    "member_since": "2024-01-15"
  },
  "meta": {
    "environment": "sandbox",
    "request_id": "uuid",
    "timestamp": "2024-01-15T10:00:00Z"
  }
}
```

### 2. Get Professional Profile

```bash
curl -X POST http://127.0.0.1:54321/functions/v1/api-profile \
  -H "X-API-Key: your_api_key" \
  -H "Content-Type: application/json" \
  -d '{"pin": "08012345678"}'
```

### 3. Initiate Sign-In

```bash
curl -X POST http://127.0.0.1:54321/functions/v1/api-signin \
  -H "X-API-Key: your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "pin": "08012345678",
    "redirect_uri": "https://yourapp.com/callback"
  }'
```

---

## 🔄 Setting Up Custom Domain (api.gidipin.com)

To use `https://api.gidipin.com/v1` instead of the Supabase URL:

### Option 1: Cloudflare Workers (Recommended)
Set up a Cloudflare Worker that proxies to your Supabase functions:

```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const supabaseUrl = 'https://your-project.supabase.co/functions/v1'
  
  // Rewrite /v1/* to /functions/v1/api-*
  const path = url.pathname.replace('/v1/', '/api-')
  
  const newUrl = `${supabaseUrl}${path}${url.search}`
  
  return fetch(newUrl, {
    method: request.method,
    headers: request.headers,
    body: request.body
  })
}
```

### Option 2: CNAME + API Gateway
- Point `api.gidipin.com` CNAME to your Supabase project
- Use an API Gateway to rewrite paths

---

## 📊 Monitoring & Logs

View API logs:
```bash
supabase functions logs api-verify
supabase functions logs api-profile
supabase functions logs api-signin
```

View all API usage in the database:
```sql
SELECT * FROM api_usage_logs ORDER BY created_at DESC LIMIT 100;
```

---

## ✅ Next Steps

1. **Deploy the functions** (if not already deployed)
2. **Test with sandbox mode** using test PINs
3. **Set up custom domain** (optional)
4. **Update documentation** to use actual URLs
5. **Generate API keys** for businesses via Developer Console

---

## 🧪 Testing

### Test PINs (Sandbox Mode):
- `08012345678` - Verified user (John Doe)
- `08087654321` - Unverified user (Jane Smith)

### Check if functions are deployed:
```bash
supabase functions list
```

### Invoke function directly:
```bash
supabase functions invoke api-verify --data '{"pin":"08012345678"}' --headers '{"X-API-Key":"test"}'
```
