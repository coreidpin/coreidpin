# 🗺️ Product Roadmap: From MVP to Polish

This document outlines the phased plan to move the CoreID/GidiPIN product from its current "MVP Complete" state to a fully polished, production-ready platform.

## 🔴 Phase 1.5: Technical Stabilization (Immediate)
**Goal:** Unblock production deployments and ensure stability.

- [ ] **Fix Build Error**: Resolve `framer-motion` resolution failure in `vite build`.
- [ ] **Verify Production Bundle**: Test the built artifacts locally (`npm run preview`).
- [ ] **E2E Sanity Check**: Run Playwright tests for critical paths (Signup, Login, Profile View).

## 🟠 Phase 2: Content Visibility (High Impact)
**Goal:** Unlock the value of content created in the dashboard by making it publicly viewable.

- [ ] **Case Study Public Viewer**:
    - Create `src/components/public/CaseStudyViewer.tsx`.
    - Design read-only layout for Problem -> Process -> Solution -> Impact.
    - Add public route `/p/:username/case-study/:slug`.
- [ ] **Public Profile Integration**:
    - Update `PublicPINPage.tsx` to fetch and display a grid of Case Studies.
    - Add navigation from Public PIN to individual Case Study pages.
- [ ] **Product Launch Viewer** (For PMs):
    - Create public viewer for Product Launch data.

## 🟡 Phase 3: Visual Intelligence
**Goal:** Transform raw data into beautiful insights.

- [ ] **Tech Stack Visualizations**:
    - Install `recharts` (if not already used).
    - **Radar Chart**: Visualize skill distribution (e.g., Engineering vs. Design vs. Product).
    - **Pie Chart**: Breakdown of top skills by category.
- [ ] **Experience Timeline**:
    - Visual timeline component for Work History on the public profile.

## 🟢 Phase 4: Professional Tools
**Goal:** Provide utility features for professional use.

- [ ] **PDF Export**:
    - Implement `html2canvas` + `jspdf` to generate a resume PDF from profile data.
    - Add "Download Resume" button to Public Profile.
- [ ] **Social Sharing**:
    - Implement dynamic Open Graph tags (Helmet).
    - (Optional) Edge function to generate dynamic OG images.

## 🔵 Phase 5: Engagement & Analytics
**Goal:** Show users the impact of their profile.

- [ ] **View Counters**: Track views on Profiles and Case Studies.
- [ ] **Engagement Metrics**: Track clicks on "Contact" or "Download Resume".
- [ ] **Analytics Dashboard**: Simple chart showing profile views over time.
