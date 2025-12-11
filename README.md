# CoreIDPin

> **Professional Identity Verification Platform for Africa**

CoreIDPin is a blockchain-inspired identity verification system that empowers professionals to create verifiable digital identities, while enabling businesses to authenticate credentials in real-time through a robust API.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.0-61dafb)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ecf8e)](https://supabase.com/)

---

## 🌟 Features

### For Professionals
- 🎫 **Unique Professional PIN (PIN)** - Get a blockchain-style PIN (e.g., `PIN-NG-2025-ABC123`)
- ✅ **Work Experience Verification** - Verify employment history through company email verification
- ⭐ **Endorsements System** - Request and showcase professional endorsements
- 📊 **Trust Score** - Build credibility through verified work history (0-100 scale)
- 💼 **Digital Portfolio** - Showcase projects, skills, and achievements
- 🔒 **Privacy Controls** - Control what information is publicly visible
- 📱 **Mobile-Responsive** - Access your profile anywhere

### For Businesses (Developer Console)
- 🔑 **API Keys Management** - Generate and manage multiple API keys
- 📈 **Usage Analytics** - Real-time API usage tracking and performance metrics
- 🎯 **Identity Verification API** - Verify professional credentials programmatically
- 🔔 **Webhook Support** - Get notified of verification events
- 📊 **Quota Management** - Track monthly API usage against your plan limits
- 👥 **Team Management** - Collaborate with team members
- 🛡️ **Rate Limiting** - Automatic protection against abuse

### Platform Features
- 🔔 **Real-time Notifications** - Get instant updates on endorsements, verifications, and more
- 🔐 **OTP Authentication** - Secure email-based authentication
- 🌍 **Multi-region Support** - Optimized for African markets (Nigeria, Kenya, Ghana, etc.)
- 📱 **PWA Support** - Install as a mobile app
- 🎨 **Modern UI/UX** - Beautiful, intuitive interface with dark mode support

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account (free tier works)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/coreidpin.git
   cd coreidpin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Run database migrations**
   ```bash
   npx supabase db push
   ```

5. **Deploy Edge Functions**
   ```bash
   npx supabase functions deploy auth-otp
   npx supabase functions deploy work-verification
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

7. **Open in browser**
   ```
   http://localhost:3000
   ```

---

## 📚 Documentation

### Architecture

```
┌─────────────────┐
│  React Frontend │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Supabase Auth  │ ◄── OTP Email Verification
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│          Supabase PostgreSQL            │
│  ┌──────────┐  ┌──────────┐  ┌────────┐│
│  │ Profiles │  │  PINs    │  │ Logs   ││
│  └──────────┘  └──────────┘  └────────┘│
└─────────────────────────────────────────┘
         ▲
         │
┌────────┴────────┐
│  Edge Functions │ ◄── API Endpoints
└─────────────────┘
```

### Key Technologies

| Component | Technology |
|-----------|-----------|
| **Frontend** | React 18 + TypeScript |
| **Styling** | Tailwind CSS |
| **Animations** | Framer Motion |
| **State Management** | React Hooks |
| **Backend** | Supabase (PostgreSQL) |
| **Authentication** | Supabase Auth + Custom OTP |
| **Edge Functions** | Deno (Supabase Functions) |
| **Build Tool** | Vite |
| **Routing** | React Router v6 |

---

## 🔐 Authentication Flow

CoreIDPin uses a custom OTP (One-Time Password) authentication system:

1. **User enters email** → System sends OTP code
2. **User enters OTP** → System validates and creates session
3. **JWT token issued** → Stored in localStorage
4. **Session managed** → Auto-refresh on expiry

### Session Management

```typescript
// Check session validity
import { ensureValidSession } from './utils/session';

const token = await ensureValidSession();
if (!token) {
  // Redirect to login
}
```

---

## 📡 API Documentation

### Base URL
```
https://your-project.supabase.co/functions/v1
```

### Authentication
All API requests require an API key in the Authorization header:

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
     https://your-project.supabase.co/functions/v1/auth-otp/verify-identity
```

### Endpoints

#### **Verify Professional Identity**

Verify a professional's credentials using their PIN.

**Endpoint**: `POST /auth-otp/verify-identity`

**Request**:
```json
{
  "pin_number": "PIN-NG-2025-ABC123",
  "verifier_id": "your-business-id"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "name": "John Doe",
    "job_title": "Senior Software Engineer",
    "city": "Lagos",
    "email_verified": true,
    "pin_status": "active",
    "work_experiences": [
      {
        "company_name": "Tech Corp",
        "job_title": "Software Engineer",
        "start_date": "2020-01-01",
        "end_date": "2023-12-31",
        "verification_status": "verified",
        "trust_score_contribution": 10
      }
    ],
    "verified_at": "2025-01-11T10:30:00Z"
  }
}
```

**Error Responses**:
- `400` - Invalid PIN format or missing parameters
- `404` - PIN not found
- `429` - Rate limit exceeded
- `500` - Server error

---

## 🗄️ Database Schema

### Core Tables

#### `profiles`
User profile information

| Column | Type | Description |
|--------|------|-------------|
| `user_id` | UUID | Primary key, references auth.users |
| `full_name` | TEXT | User's full name |
| `job_title` | TEXT | Current job title |
| `city` | TEXT | Location |
| `avatar_url` | TEXT | Profile picture URL |
| `bio` | TEXT | Professional bio |

#### `professional_pins`
Unique professional identifiers

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | References profiles |
| `pin_number` | TEXT | Unique PIN (e.g., PIN-NG-2025-ABC123) |
| `trust_score` | INTEGER | Credibility score (0-100) |
| `verification_status` | TEXT | active, suspended, revoked |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

#### `work_experiences`
Employment history

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | References profiles |
| `company_name` | TEXT | Employer name |
| `job_title` | TEXT | Position held |
| `start_date` | DATE | Employment start |
| `end_date` | DATE | Employment end (null if current) |
| `verification_status` | TEXT | pending, verified, rejected |
| `verified_at` | TIMESTAMPTZ | Verification timestamp |

#### `api_keys`
Business API keys

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Business owner |
| `key` | TEXT | API key (hashed) |
| `name` | TEXT | Key description |
| `is_active` | BOOLEAN | Active status |
| `last_used_at` | TIMESTAMPTZ | Last usage |

#### `api_usage_logs`
API request logs

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Business user |
| `endpoint` | TEXT | API endpoint called |
| `status_code` | INTEGER | HTTP response code |
| `response_time_ms` | INTEGER | Response time |
| `created_at` | TIMESTAMPTZ | Request timestamp |

#### `notifications`
User notifications

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Recipient |
| `type` | TEXT | success, alert, info, warning |
| `title` | TEXT | Notification title |
| `message` | TEXT | Notification body |
| `is_read` | BOOLEAN | Read status |
| `created_at` | TIMESTAMPTZ | Creation time |

---

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Test Coverage
```bash
npm run test:coverage
```

### E2E Tests
```bash
npm run test:e2e
```

---

## 🚢 Deployment

### Frontend (Vercel/Netlify)

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel**
   ```bash
   npx vercel --prod
   ```

### Edge Functions (Supabase)

```bash
npx supabase functions deploy auth-otp
npx supabase functions deploy work-verification
```

### Database Migrations

```bash
npx supabase db push
```

### Environment Variables

Set these in your hosting platform:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## 🔧 Development

### Project Structure

```
coreidpin/
├── src/
│   ├── components/          # React components
│   │   ├── developer/       # Business console components
│   │   ├── notifications/   # Notification system
│   │   ├── dashboard/       # Professional dashboard
│   │   └── ui/             # Reusable UI components
│   ├── utils/              # Utility functions
│   │   ├── api.ts          # API client
│   │   ├── session.ts      # Session management
│   │   └── supabase/       # Supabase client
│   ├── hooks/              # Custom React hooks
│   ├── types/              # TypeScript types
│   └── App.tsx             # Main app component
├── supabase/
│   ├── functions/          # Edge functions
│   │   ├── auth-otp/       # Authentication
│   │   └── work-verification/
│   └── migrations/         # Database migrations
├── public/                 # Static assets
└── .agent/                # Implementation docs

```

### Coding Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Enforced code quality
- **Prettier**: Code formatting
- **Commit Convention**: Conventional Commits

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/your-feature
```

---

## 📊 Monitoring & Analytics

### API Usage Dashboard

Access at: `/developer` → **API Usage & Analytics**

**Metrics Tracked**:
- Total API requests
- Success rate
- Average response time
- Monthly quota usage
- Recent requests log
- Error tracking

### Performance Monitoring

- **Response Times**: Tracked per endpoint
- **Error Rates**: Logged with stack traces
- **Quota Usage**: Real-time monitoring
- **Geographic Distribution**: IP-based analytics

---

## 🔒 Security

### Best Practices

1. ✅ **API Keys**: Never commit to version control
2. ✅ **RLS Policies**: All tables have Row Level Security
3. ✅ **Rate Limiting**: Automatic protection (429 errors)
4. ✅ **Input Validation**: All endpoints validate input
5. ✅ **CORS**: Properly configured for production
6. ✅ **HTTPS**: Required for all API calls

### Reporting Vulnerabilities

Email: security@coreidpin.com

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details

---

## 🙏 Acknowledgments

- **Supabase** - Backend infrastructure
- **React Team** - Frontend framework
- **Tailwind CSS** - Styling system
- **Framer Motion** - Animation library

---

## 📞 Support

- **Documentation**: [docs.coreidpin.com](https://docs.coreidpin.com)
- **Email**: support@coreidpin.com
- **Twitter**: [@CoreIDPin](https://twitter.com/coreidpin)
- **Discord**: [Join our community](https://discord.gg/coreidpin)

---

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Blockchain integration for immutable records
- [ ] AI-powered fraud detection
- [ ] Multi-language support
- [ ] International expansion (beyond Africa)
- [ ] Education verification
- [ ] Skills assessment integration

---

**Built with ❤️ for African professionals**
