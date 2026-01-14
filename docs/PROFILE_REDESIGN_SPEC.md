# Professional Identity Profile Specification
**Design Target:** GitHub-Style High-Density Profile Layout
**Version:** 1.0
**Status:** Draft

## 1. Executive Summary
This document outlines the technical specification for redesigning the GidiPIN User Profile to mirror the high-utility, developer-centric layout of a GitHub profile. The goal is to create a **"Professional Truth Source"** that feels familiar to technical recruiters and developers while displaying verified professional data (Employment, Skills, Projects).

The core philosophy is **Information Density without Clutter**: utilizing a two-column asymmetric layout to separate "Identity Verification" (Static) from "Professional Activity" (Dynamic).

---

## 2. Layout Architecture
To strictly follow the reference design, we will implement a **Two-Column Grid Layout** constrained to a max-width container (e.g., `max-w-7xl`).

### 2.1. The Grid System
- **Desktop (>= 1024px):**
  - **Left Column (25%):** Identity & Contact Info (Sticky position).
  - **Right Column (75%):** Content Stream (Scrollable).
  - **Spacing:** `gap-8` (32px) between columns.
- **Mobile (< 1024px):**
  - **Stacked Layout:** Identity block appears first, followed by navigation tabs, then main content.
  - **Navigation:** Horizontally scrollable sticky tab bar.

### 2.2. Visual Theme (Dark Mode)
- **Backgrounds:**
  - Page: `#0d1117` (Deep Void)
  - Cards/Nav: `#161b22` (Subtle Elevation)
  - Borders: `#30363d` (High Contrast Separators)
- **Typography:**
  - Headers: Inter/System Sans, Weight 600.
  - Body: Low-contrast gray (`#8b949e`) for metadata to reduce visual noise.

---

## 3. Component Breakdown & Data Mapping

### 3.1. Left Sidebar: The "Identity Anchor"
*Purpose: Immediate verification of who the person is.*

| UI Element | Source Data (`profiles` table) | Implementation Notes |
| :--- | :--- | :--- |
| **Avatar** | `profile_picture_url` | Large circle (296px max), border-radius 50%, z-index layered over status. |
| **Full Name** | `full_name` | Font-size 24px, Bold, White. |
| **Username** | `username` | Font-size 20px, Gray (`#8b949e`), Font-weight 300. |
| **Action** | n/a | Primary Button ("Connect" or "Verify"). Full width. |
| **Bio** | `bio` | Short text description. |
| **Stats** | `connections`, `endorsements` | Row of iconic stats with distinct hover states. |
| **Metadata** | `company`, `location`, `socials` | Vertical stack of icon + text. Icons must be fixed-width for alignment. |
| **Badges** | `achievements` | Grid of circular/hexagonal badges (e.g., "Verified Pro", "Early Adopter"). |

### 3.2. Main Content: The "Work Stream"
*Purpose: Deep dive into capability and history.*

#### A. Navigation Bar (Sticky)
- **Tabs:** Overview, Experience, Projects, Endorsements, Activity.
- **Behavior:** Sticks to top of view `top-0` when scrolling.
- **Styling:** Underline indicator for active tab (`border-b-2 border-orange-500`).

#### B. The "Readme" (Professional Summary)
- **Concept:** Instead of a generic text block, we render a Markdown-supported "About Me" that allows rich text, bullet points, and emphasis.
- **Key Sections:**
  - "Hi, I'm [Name] 👋"
  - "What I do" (Bullet points of specialties).
  - "Current Focus" (What they are learning or working on).

#### C. Pinned Items (Featured Projects/Roles)
- **Reference:** GitHub "Pinned Repos".
- **GidiPIN Equivalent:** **Featured Projects** or **Key Roles**.
- **Card Design:**
  - **Border:** Thin gray border.
  - **Header:** Project/Company Name (Blue Link).
  - **Badge:** "Verified" pill (instead of "Public").
  - **Footer:** Tech Stack dots (e.g., React, Node.js) + Impact Stats.
- **Layout:** CSS Grid (`grid-cols-1 md:grid-cols-2`).

#### D. Activity Heatmap (Engagement History)
- **Reference:** GitHub Contribution Graph.
- **GidiPIN Equivalent:** **Professional Activity Graph**.
- **Data Point:**
  - **Green Squares:** Verified events (e.g., "Job Added", "Skill Endorsed", "Project Verified").
  - **Intensity:** Darker green = High impact event (e.g., new job verified vs. updated bio).
- **Implementation:**
  - Matrix: 52 columns (weeks) x 7 rows (days).
  - Component: `ActivityHeatmap.tsx` (already partially implemented).

---

## 4. Technical Strategy

### 4.1. Data Requirements
We need to aggregate data from multiple tables to feed this unified view.

```typescript
interface UserProfileFull {
  // Identity
  profile: Profile;
  // Stats
  stats: {
    followers_count: number;
    following_count: number;
    stars_count: number;
  };
  // Content
  pinned_items: Project[] | WorkExperience[];
  contribution_calendar: {
    total_contributions: number;
    weeks: Array<{
      contributionDays: Array<{
        color: string;
        date: string;
        contributionCount: number;
      }>
    }>
  }
}
```

### 4.2. Recommended Tailwind Config (Theme Extension)
To make implementation easier, we should extend `tailwind.config.js` with semantic names:

```javascript
colors: {
  canvas: {
    default: '#0d1117',
    subtle: '#161b22',
  },
  border: {
    default: '#30363d',
    muted: '#21262d',
  },
  fg: {
    default: '#c9d1d9',
    muted: '#8b949e',
  },
  accent: {
    emphasis: '#1f6feb',
    line: '#f78166', // The orange tab line
  }
}
```

## 5. Implementation Roadmap
1.  **Refactor Layout:** Create `ProfileLayout.tsx` implementing the 25/75 grid.
2.  **Sidebar Alignment:** Update `IdentitySidebar` to match the spacing and typography of the reference.
3.  **"Readme" Component:** Build a Markdown-style renderer for the bio section.
4.  **Pinned Grid:** Create the `PinnedItemCard` component for showcasing projects.
5.  **Heatmap Integration:** Finalize the `ActivityHeatmap` with real data from `pin_analytics`.

---
**Prepared By:** Antigravity Agent
**Date:** January 2026
