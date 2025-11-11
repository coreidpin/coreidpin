# nwanne Backend API

## Structure

```
/supabase/functions/server/
├── index.tsx              # Main server file (legacy - contains all endpoints)
├── index-new.tsx          # New modular server file (recommended)
├── kv_store.tsx           # Key-value store utilities
├── README.md              # This file
└── routes/
    ├── auth.tsx           # Authentication endpoints
    ├── profile.tsx        # Profile management endpoints
    ├── ai.tsx             # AI-powered endpoints
    └── professionals.tsx  # Professional search endpoints
```

## Route Modules

### 1. Authentication Routes (`/routes/auth.tsx`)

**Base Path:** `/server`

#### Endpoints:
- `POST /register` - Register new user
  - Body: `{ email, password, name, userType, companyName?, role?, institution?, gender? }`
  - Returns: `{ success, userId, userType }`

- `POST /signup` - Alternative sign up (for OAuth)
  - Body: `{ email, password, name, userType }`
  - Returns: `{ success, user }`

- `POST /login` - Secure login with CSRF + rate limiting
  - Headers: `X-CSRF-Token: <token>` (required)
  - Body: `{ email, password }`
  - Returns: `{ success, accessToken, refreshToken, expiresIn, user, userData }`
  - Rate limit: 5 attempts per 15 minutes per IP
  - Logs: Success and failure attempts written to KV (and table via migration when enabled)

### 2. Profile Routes (`/routes/profile.tsx`)

**Base Path:** `/server/profile`

#### Endpoints:
- `GET /:userId` - Get user profile
  - Headers: `Authorization: Bearer <token>`
  - Returns: `{ success, profile }`

- `PUT /:userId` - Update user profile
  - Headers: `Authorization: Bearer <token>`
  - Body: Profile data object
  - Returns: `{ success, message, profile }`

- `POST /analyze` - Analyze profile with AI
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ linkedinUrl?, githubUrl?, portfolioUrl?, resumeUrl?, name, title }`
  - Returns: `{ success, analysis, profileData, timestamp }`

- `POST /complete` - Save complete profile
  - Headers: `Authorization: Bearer <token>`
  - Body: Complete profile data with all fields
  - Returns: `{ success, message, completionPercentage, missingFields }`

- `GET /analysis/:userId` - Get saved AI analysis
  - Headers: `Authorization: Bearer <token>`
  - Returns: `{ success, analysis }`

### 3. AI Routes (`/routes/ai.tsx`)

**Base Path:** `/server/ai`

#### Endpoints:
- `POST /match-talent` - AI-powered talent matching
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ jobDescription, requiredSkills, location, experienceLevel }`
  - Returns: `{ success, analysis, timestamp }`

- `POST /compliance-check` - AI compliance verification
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ candidateName, documents, location, employmentType }`
  - Returns: `{ success, analysis, timestamp }`

### 4. Professionals Routes (`/routes/professionals.tsx`)

**Base Path:** `/server/professionals`

#### Endpoints:
- `GET /` - Get all verified professionals
  - Headers: `Authorization: Bearer <token>`
  - Returns: `{ success, professionals, count }`

- `POST /search` - Search professionals
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ skills?, location?, experienceLevel?, availability? }`
  - Returns: `{ success, professionals, count }`

## Data Storage

All data is stored in Supabase KV store with the following key patterns:

- `user:{userId}` - User account data
- `profile:{userType}:{userId}` - User profile metadata
- `profile-complete:{userId}` - Complete profile data
- `profile-analysis:{userId}` - AI analysis results

## Environment Variables

Required environment variables:
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `OPENAI_API_KEY` - OpenAI API key for AI features

## Migration Guide

To migrate from legacy `index.tsx` to modular structure:

1. **Backup current index.tsx**
   ```bash
   cp index.tsx index-legacy.tsx
   ```

2. **Replace index.tsx with modular version**
   ```bash
   cp index-new.tsx index.tsx
   ```

3. **Test all endpoints**
   - Verify authentication works
   - Test profile operations
   - Confirm AI features function
   - Check professional search

4. **Monitor logs**
   - All requests are logged via Hono logger
   - Check Supabase Edge Function logs for errors

## Adding New Routes

1. Create new route file in `/routes/` directory
   ```typescript
   import { Hono } from "npm:hono";
   const myRoute = new Hono();
   
   myRoute.get("/endpoint", async (c) => {
     // Your logic here
   });
   
   export { myRoute };
   ```

2. Import and mount in `index.tsx`
   ```typescript
   import { myRoute } from "./routes/myRoute.tsx";
   app.route("/server/my-route", myRoute);
   ```

## Error Handling

All routes include standardized error handling:
- 400 - Bad Request (missing/invalid data)
- 401 - Unauthorized (invalid/missing auth token)
- 403 - Forbidden (insufficient permissions)
- 404 - Not Found (resource doesn't exist)
- 500 - Internal Server Error (server-side issues)
- 503 - Service Unavailable (external service issues)

## Security

- All protected endpoints require valid JWT token
- User can only access their own data (enforced by userId check)
- Service role key never exposed to frontend
- CORS configured for web access
- Input validation on all endpoints
- CSRF required for `/login` via `X-CSRF-Token` header
  - Frontend generates token on app load and sends on secure requests
  - In production, use double-submit cookie or session-bound CSRF token
  - Configure allowed origins via `ALLOWED_ORIGINS` env (comma-separated)

## Testing

Test endpoints using curl:

```bash
# Health check
curl https://{project-id}.supabase.co/functions/v1/server/health

# Register user
curl -X POST https://{project-id}.supabase.co/functions/v1/server/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {anon-key}" \
  -d '{"email":"user@example.com","password":"password123","name":"John Doe","userType":"professional"}'

# Analyze profile
curl -X POST https://{project-id}.supabase.co/functions/v1/server/profile/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {access-token}" \
  -d '{"linkedinUrl":"https://linkedin.com/in/johndoe","name":"John Doe","title":"Product Manager"}'
```

## Performance

- KV store operations are fast (single-digit ms)
- GitHub API calls may take 1-2 seconds
- OpenAI API calls typically take 2-5 seconds
- Consider implementing caching for frequently accessed data

## Monitoring

Monitor your API using Supabase dashboard:
1. Go to Edge Functions
2. Select `server`
3. View Logs tab for request/response logs
4. Check Metrics for performance data

## Support

For issues or questions:
- Check Supabase Edge Function logs
- Review error responses for detailed messages
- Consult main documentation in `/IMPLEMENTATION_SUMMARY.md`
# Secure login
curl -X POST https://{project-id}.supabase.co/functions/v1/server/login \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: {generated-csrf-token}" \
  -d '{"email":"user@example.com","password":"password123"}'

Expected responses:
- 200 `{ success: true, accessToken, refreshToken, user }`
- 401 `{ error: "Login failed: <reason>" }`
- 403 `{ error: "CSRF token missing" }`
- 429 `{ error: "Too many login attempts. Try again later." }`
