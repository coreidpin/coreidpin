# HRIS Integration Strategy: Automated Work History Verification

**Date**: 2026-01-08
**Status**: DRAFT
**Author**: Antigravity (AI Agent)

## 1. Objective
To automate the verification of users' work history by connecting directly to their employers' HRIS (Human Resources Information Systems) such as Workday, BambooHR, ADP, and Gusto.

## 2. Recommended Approach: Unified API Aggregator
Connecting to each HRIS individually is engineering-intensive (e.g., Workday uses complex SOAP APIs, BambooHR uses REST, others vary).
**Selected Provider**: **Finch** (https://tryfinch.com)

### Why Finch?
*   **Best-in-class for Employment Data**: Finch specializes in employment systems (payroll/HRIS) specifically.
*   **Developer Experience**: Excellent documentation and modern SDKs.
*   **Coverage**: Supports major US providers (Gusto, ADP, Rippling, Justworks, etc.).
*   **Single Integration**: Build one connector to the Unified API, and gain access to 50+ HRIS providers immediately.
*   **Standardized Schema**: They normalize data (e.g., "Software Engineer" vs "Engineer, Software") into a common format.
*   **Maintenance**: They handle API changes/deprecations from the providers.

## 3. Technical Architecture

### A. Data Flow
1.  **User Action**: User clicks "Verify Work History" on the Dashboard.
2.  **Link Flow**: We launch the Unified API's "Link Modal" (frontend SDK).
3.  **Authentication**: User logs into their payroll/HR provider (e.g., Workday) inside the secure modal.
4.  **Token Exchange**: 
    *   Success returns a `public_token` to our frontend.
    *   Frontend sends `public_token` to our Backend (Supabase Edge Function).
    *   Backend exchanges it for a persistent `access_token` and stores it securely.
5.  **Data Sync**:
    *   Backend calls `GET /employment` via Unified API.
    *   We receive: Employer Name, Job Title, Start Date, End Date, Status (Active/Terminated).
6.  **Verification**: 
    *   We compare fetched data with the User's claimed profile.
    *   If matching, we issue a `verified_work_history` credential (Database update + optionally on-chain VC).

### B. Database Schema Updates
We need a table to store the connection state.

```sql
CREATE TABLE hris_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  provider_id VARCHAR(50), -- e.g., 'workday', 'bamboohr'
  account_id VARCHAR(255), -- external ID from provider
  access_token TEXT, -- Encrypted!
  status VARCHAR(20), -- 'active', 'disconnected'
  last_sync_at TIMESTAMP WITH TIME ZONE
);
```

### C. Backend Logic (Edge Function)
`supabase/functions/sync-hris-data/index.ts`

```typescript
// Pseudo-code
async function syncData(user_id) {
  const connection = await getConnection(user_id);
  const employeeData = await unifiedApi.employment.list(connection.access_token);
  
  for (const job of employeeData) {
    // Upsert into "work_experience" table
    // Set verification_status = 'verified'
    // Set verification_source = 'hris_integration'
    // Calculate Trust Score impact (+20 points)
  }
}
```

## 4. Security Considerations
*   **Least Privilege**: Request only "Employment Read" scopes. Do not request "Payroll" or "Banking" scopes/PII unless necessary.
*   **Token Storage**: Access tokens must be stored encrypted (Supabase Vault or similar).
*   **GDPR/Privacy**: User must explicitly consent to the sync. We should offer a "Disconnect" button to purge data.

## 5. Implementation Roadmap
1.  **Phase 1**: Technical Setup
    *   Sign up for Finch or Merge (Free tier for dev).
    *   Configure `HRIS_PROVIDER_API_KEY` in Supabase secrets.
2.  **Phase 2**: Frontend Integration
    *   Install React SDK (e.g. `@finch-api/react-sdk`).
    *   Add "Connect HRIS" button to `WorkTimeline` component.
3.  **Phase 3**: Backend Verification Logic
    *   Create Edge Function to handle the webhook/sync.
    *   Update `TrustScore` algorithm to weight HRIS-verified items heavily.

## 6. Alternative: Direct Integration (Not Recommended)
If we must connect directly (e.g., for a specific enterprise enterprise partner):
*   **BambooHR**: Requires API Key from user (User must be admin or have self-service API enabled).
*   **Workday**: Requires RaaS (Report as a Service) configuration by the employer's IT admin. Very high friction for individual users.

**Conclusion**: For a B2C/B2B "Professional Identity" app, the **User-Permissioned Unified API** (like Finch/Merge) is the only viable path for scalable coverage.
