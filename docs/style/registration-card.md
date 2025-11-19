# Registration Card Sizing

Measured default card content dimensions on Get Started:

- Width: 552px
- Height: 437px

Desktop enforced dimensions:

- Width: 720px
- Height: 560px

Implementation:

- CSS classes: `.card-fixed`, `.card-content-scroll`, `.truncate-ellipsis`
- Applied in `src/components/SimpleRegistration.tsx` to maintain fixed size across states
- Overflow behavior: scrolling for content, ellipsis for long text

Verification checklist:

- Size stable on initial load, dropdown interactions, window resize, and mobile/desktop
- No content overflow outside the fixed card container

Locations:

- CSS: `src/index.css`
- Component: `src/components/SimpleRegistration.tsx`

