# Phase 5: Trust Signals & Organization Identity 🏢

**Objective:** solidify professional credibility by displaying "Organizations" (Companies) and enhancing the "Professional Sidebar" with rich metadata.

## 🎯 Implementation Goals

### 1. Organization Logos (Sidebar)
Add a "Organizations" section to the left sidebar of the public profile.
*   **Concept:** Like GitHub Organizations, but for companies you've worked at or been verified by.
*   **Data Source:** Currently `work_experience` (company logo URL). We will aggregate distinct company logos from the user's work history.

### 2. Enhanced Sidebar Metadata
Make the sidebar denser and richer.
*   **Connect Button:** Prominent CTA at the top (under Avatar).
*   **Metadata Stack:** Add location, website, email, and "Open to" status with consistent icons.
*   **Verified Badge:** Ensure the "Verified" tick is prominent on the avatar.

### 3. "Connect" Logic
*   The "Connect" button should trigger a connection request or follow action (we already have "Follow", we can rebrand it to "Connect" or keep "Follow" as the lightweight action).

---

## 🛠️ Implementation Steps

### Step 1: `OrganizationList` Component
*   Create `src/components/public/OrganizationList.tsx`.
*   Logic: Extract unique `company_name` and `company_logo_url` from `work_experience`.
*   Render: A grid of small square logos (32x32) with tooltips.

### Step 2: Update `PublicPINPage` Sidebar
*   Insert `OrganizationList` into the sidebar area.
*   Refine the avatar section (ensure "Verified" badge overlay is pixel-perfect).
*   Standardize the icon stack (MapPin, Link, etc.).

## 📅 Timeline
*   **Start:** Immediate
*   **Focus:** Visual credibility (Logos).

