# GitHub Profile UI Analysis (Shubham Saboo)

This document provides a comprehensive breakdown of the GitHub profile layout observed in the provided reference image. It breaks down the structure, specific UI components, and styling details to serve as a reference for replication or inspiration.

## 1. Global Layout Strategy
The page follows a classic **Two-Column Asymmetric Layout** typically found on desktop views but often stacked on mobile. It is set against a **Dark Mode** theme (high contrast).

*   **Left Column (Sidebar):** ~25-30% width. Fixed/Sticky in some contexts, contains static identity information.
*   **Right Column (Main Content):** ~70-75% width. Scrollable, contains dynamic content (Readme, Repos, Activity).
*   **Spacing:** Generous padding between columns.
*   **Background Color:** Deep dark gray/black (`#0d1117` typical for GitHub Dimmed).

---

## 2. Left Sidebar (Profile Identity)
This section serves as the "Business Card" of the user.

### A. Avatar Section
*   **Component:** Large circular image.
*   **Styling:** 
    *   Border radius: 50%.
    *   Z-index layering: Lies above the status icon (if present).
    *   Placement: Top-left aligned.

### B. User Identity
*   **Display Name:** "Shubham Saboo"
    *   *Style:* Large font size (approx 24px-26px), Bold, Weight 600-700. Color: White/Primary Text.
*   **Username:** "Shubhamsaboo"
    *   *Style:* Medium font size (20px), Lighter weight (300-400). Color: Gray/Secondary Text (`#8b949e`).

### C. Call-to-Action
*   **Button:** "Follow"
    *   *Style:* Full-width block button. Dark gray background (`#21262d`), whitish text, 1px border (`#30363d`). Rounded corners (6px).

### D. Bio
*   **Content:** "AI PM @ Google Cloud | Building opensource repository..."
*   **Style:** Body text, secondary color, left-aligned. readable line-height (1.5).

### E. Social Proof (Stats)
*   **Layout:** Inline flex row.
*   **Components:** 
    *   Icon (People).
    *   **Followers:** "2k followers" (Count is bold, label is regular).
    *   **Following:** "4 following".
    *   *Separator:* Middle dot (·).

### F. Metadata List (V-Stack)
A vertical list of icon + text pairs.
1.  **Company:** `@ Google` (Building icon / Organization icon).
2.  **Location/Website:** `https://thewindai.com/` (Link icon).
3.  **Social:** `X` (Twitter) handle, LinkedIn handle.
4.  **Style:** Small font (14px), gray text, icons are fixed width for alignment.

### G. Achievements
*   **Header:** "Achievements" (H3 style).
*   **Layout:** Flex/Grid layout.
*   **Badges:** Small icons (approx 64x64px).
    *   *Types:* Circular (YOLO, Quickdraw) and Shield/Hex (Pull Shark).
    *   *Interaction:* Likely hoverable for details.

---

## 3. Main Content Area (Right Column)
This area is tabbed and contains the core work showcase.

### A. Navigation Tabs
Sticky header at the top of the content column.
*   **Tabs:** Overview (Active), Repositories, Projects, Packages, Stars.
*   **Active State:** Orange/Red underline border-bottom (`#f78166`). Font-weight bold.
*   **Inactive State:** Gray text, no border.
*   **Badges:** Pill-shaped counters next to "Repositories" (e.g., "117").

### B. Profile README (The "Hook")
This is a rendered Markdown file (`README.md`) displayed prominently.
*   **Header:** "Hi, I'm Shubham 👋" (H1).
*   **Intro Body:** Short bio paragraph.
*   **"What I work on" Section:**
    *   *List Style:* Unordered list with custom Emoji bullets (🤖, 📦, 🛠️, etc.).
    *   *Content:* Defines scope (AI Agents, RAG, Dev workflows).
*   **"About Me" Section:**
    *   *Header:* "About Me" (H2/H3).
    *   *Content:* Bullet points detailing professional role (Senior AI PM @ Google), authorship ("GPT-3" book), and investing. 
    *   *Visual Hierarchy:* Uses **Bold** text for emphasis within sentences.

### C. Pinned Repositories
A showcase of top work.
*   **Header:** "Pinned" (Label).
*   **Layout:** CSS Grid (2 columns wide).
*   **Card Design:**
    *   *Border:* Thin gray border (`#30363d`).
    *   *Corner Radius:* 6px.
    *   *Padding:* 16px.
    *   *Background:* Transparent (matches page bg).
*   **Card Content:**
    *   **Repo Name:** Blue link, bold (e.g., "awesome-llm-apps").
    *   **Visibility Badge:** "Public" (Pill outline).
    *   **Description:** Short text, gray color.
    *   **Meta Row (Bottom):**
        *   Language Color Dot (e.g., Yellow for Python) + Language Name.
        *   Star Icon + Count (7.2k).
        *   Fork Icon + Count (1.3k).

### D. Contribution Graph
*   **Header:** "464 contributions in the last year".
*   **Component:** Heatmap Grid.
    *   *X-Axis:* Months (Nov - Oct).
    *   *Y-Axis:* Days of week (Mon, Wed, Fri labels).
    *   *Cells:* Small squares.
    *   *Color Scale:* Black (0) -> Dark Green -> Bright Neon Green (High activity).
*   **Controls:** "Contribution settings" dropdown on the right.
*   **Legend:** "Less" ... "More" color key at bottom right.

---

## 4. Typography & Color Palette (Inferred)

### Colors (Dark Dimmed Theme)
*   **Background:** `#0d1117` (Main), `#161b22` (Card headers/Canvas).
*   **Borders:** `#30363d`.
*   **Primary Text:** `#c9d1d9` (Light Gray/White).
*   **Secondary Text:** `#8b949e` (Medium Gray).
*   **Accent/Link:** `#58a6ff` (Blue).
*   **Active Tab:** `#f78166` (Orange/Red).
*   **Buttons:** `#21262d` (Bg), `#f0f6fc` (Text).

### Typography
*   **Font Family:** System Stack (`-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Helvetica`, `Arial`, sans-serif).
*   **Weights:**
    *   *Name:* 600 (Semi-Bold).
    *   *Headers:* 600.
    *   *Body:* 400 (Regular).
    *   *Meta:* 300-400.

---

## 5. UI Component Implementation List
To replicate this in the `Identity` app, we would need:

1.  **`ProfileSidebar` Component:**
    *   Avatar (Image).
    *   UserInfo (Name, Handle, Bio).
    *   SocialLinks (List of icons + urls).
    *   StatsRow (Followers/Following).
    *   AchievementsGrid.

2.  **`ProfileContent` Component:**
    *   `ProfileTabs` (Navigation).
    *   `ReadmeViewer` (Markdown renderer).
    *   `PinnedReposGrid` (Grid of cards).
    *   `ActivityHeatmap` (Contribution graph visualization).

3.  **`RepoCard` Component:**
    *   Props: Name, Description, Language, Stars, Forks.
    *   Layout: Flex col with space-between.
