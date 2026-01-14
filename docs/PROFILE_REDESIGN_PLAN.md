# Profile Redesign Implementation Plan
**Objective:** Redesign the Public Profile Page (`/profile/:slug`) to match the GitHub-style high-density layout.
**Strategy:** Safe, non-destructive phased rollout using a feature-flagged route.

## Phase 1: Preparation & Safe Environment
*Goal: Set up the workspace without affecting the live application.*

1.  **Create "V2" Component Scaffolding**
    *   Create `src/components/PublicProfileV2.tsx` (Shell component).
    *   Create `src/components/profile-v2/` directory for new specific sub-components.

2.  **Establish Development Route**
    *   Modify `src/components/Router.tsx` to add a temporary route:
        ```tsx
        <Route path="/p_v2/:slug" element={<PublicProfileV2 />} />
        ```
    *   This allows us to view and test the new design live at `localhost:3000/p_v2/username` without breaking the current `/profile/username`.

3.  **Theme Configuration**
    *   Update locally or use arbitrary values in Tailwind class names to match the "GitHub Dark" palette (`#0d1117`, `#161b22`, etc.) defined in the spec.

## Phase 2: Component Architecture
*Goal: Build the visual structure and static UI elements.*

1.  **Implement Layout Shell (`ProfileLayout.tsx`)**
    *   Create the Two-Column Grid system (25% / 75%).
    *   Handle responsive stacking for mobile.

2.  **Sidebar Component (`IdentitySidebar.tsx`)**
    *   Implement large avatar with z-index layering.
    *   Build "Connect" / "Follow" button logic.
    *   Create the metadata stack (Location, Company, Socials) using fixed-width icons.

3.  **Main Content Feed (`ProfileFeed.tsx`)**
    *   **Navigation Tabs:** Sticky header with "Overview", "Projects", "Activity".
    *   **Markdown Viewer:** Implement a simple view for the "About Me" (Readme) section.
    *   **Pinned Items Grid:** Create `PinnedItemCard` for displaying top projects/experiences.
    *   **Activity Graph:** Integrate the existing `ActivityHeatmap` component into this new layout.

## Phase 3: Data Integration
*Goal: Connect the UI to Supabase.*

1.  **Data Fetching Hook (`useProfileData`)**
    *   Create a custom hook to aggregate data from:
        *   `profiles` (Basic info)
        *   `tech_stack` (Skills)
        *   `work_experience` (History)
        *   `profile_analytics_events` (Heatmap data)
    
2.  **Wiring Components**
    *   Pass data prop-drilled or via Context to Sidebar and Feed.
    *   Handle "Loading" and "Not Found" states gracefully (Skeleton screens).

## Phase 4: Launch & Cleanup
*Goal: Go live.*

1.  **Route Swap**
    *   Update `src/components/Router.tsx`:
        *   Change `/profile/:slug` to point to `<PublicProfileV2 />`.
        *   (Optional) Keep old component as `<PublicProfileLegacy />` for backup.

2.  **Cleanup**
    *   Remove the temporary `/p_v2/:slug` route.
    *   Delete unused legacy components after 1 week of stability.

---
**Execution Note:**
We will start strictly with **Phase 1 and 2** to get the visual interface working before worrying about complex data fetching.
