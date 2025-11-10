# Backend API Structure

This folder contains all backend API routes and endpoints for the Nwanne platform.

## Folder Structure

```
/backend
├── auth.tsx            # Authentication & Registration endpoints
├── profile.tsx         # User profile management & AI analysis
├── ai.tsx              # AI-powered matching and compliance
├── professionals.tsx   # Professional search and discovery
└── README.md          # This file
```

## API Endpoints

### Authentication (`/auth`)
- `POST /auth/register` - User registration with email/password
- `POST /auth/signup` - Alternative signup endpoint (OAuth compatible)

### Profile Management (`/profile`)
- `GET /profile/:userId` - Get user profile
- `PUT /profile/:userId` - Update user profile
- `POST /profile/analyze` - AI analysis of LinkedIn/GitHub/Portfolio
- `POST /profile/complete` - Save complete profile data
- `GET /profile/analysis/:userId` - Get stored AI analysis

### AI Services (`/ai`)
- `POST /ai/match-talent` - AI-powered talent matching for job posts
- `POST /ai/compliance-check` - AI-powered compliance verification

### Professionals (`/professionals`)
- `GET /professionals` - List all verified professionals
- `POST /professionals/search` - Search professionals by skills, location, etc.

## Implementation

All routes are imported and mounted in `/supabase/functions/server/index.tsx`:

```typescript
import { auth } from "../../backend/auth.tsx";
import { profile } from "../../backend/profile.tsx";
import { ai } from "../../backend/ai.tsx";
import { professionals } from "../../backend/professionals.tsx";

app.route('/auth', auth);
app.route('/profile', profile);
app.route('/ai', ai);
app.route('/professionals', professionals);
```

## Authentication

All endpoints (except registration/signup) require authentication:
```
Authorization: Bearer {access_token}
```

## Environment Variables Required

- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `OPENAI_API_KEY` - OpenAI API key for AI features

## Error Handling

All endpoints return consistent error responses:
```json
{
  "error": "Error message description"
}
```

Success responses:
```json
{
  "success": true,
  ...data
}
```

## Development

Routes are Hono-based and run on Deno. Import paths reference the KV store from:
```typescript
import * as kv from "../supabase/functions/server/kv_store.tsx";
```

## Notes

- All AI analysis includes Nigerian cultural responses for engagement
- Profile analysis fetches live data from GitHub API
- KV store is used for all data persistence
- Demo users (with `demo-token-` prefix) bypass auth checks in some endpoints
