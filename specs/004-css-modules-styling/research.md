# Research: CSS Modules Styling

**Feature**: 004-css-modules-styling  
**Date**: 2026-06-17

## R1: CSS Modules in Next.js App Router

**Decision**: Use `.module.css` files co-located with each component, imported as `styles` objects with `styles.className` access.

**Rationale**: CSS Modules are natively supported by Next.js with zero configuration. They provide automatic class name scoping (avoiding collisions), tree-shaking of unused styles, and TypeScript-compatible imports. The App Router supports CSS Modules identically to Pages Router — no migration concerns.

**Alternatives considered**:
- **Tailwind CSS**: Would require adding a new dependency and learning utility-class conventions. Rejected per constitution (no new frameworks without justification) and spec (CSS Modules explicitly chosen).
- **styled-components / CSS-in-JS**: Requires additional dependency, has SSR hydration complexity with React 19 Server Components, and adds runtime overhead. Rejected.
- **Plain CSS with BEM**: No scoping — class name collisions possible. CSS Modules provide automatic scoping with less naming discipline.

## R2: next/font for Font Loading

**Decision**: Use `next/font/google` to load Inter font family. Configure in `layout.tsx` and apply via the font's `className` or `variable` property on the `<html>` or `<body>` element.

**Rationale**: `next/font` automatically self-hosts fonts (no external requests to Google Fonts), eliminates layout shift by using `size-adjust` and font metrics, and integrates with Next.js build pipeline. Using the `variable` property (e.g., `--font-inter`) allows referencing the font in CSS custom properties.

**Alternatives considered**:
- **Manual @font-face in globals.css**: Requires manually hosting font files, configuring font-display, and doesn't benefit from Next.js font optimization (size-adjust, preloading). Rejected.
- **Google Fonts via <link>**: External network dependency, potential layout shift, blocked by some ad blockers. Rejected.

## R3: CSS Custom Properties for Color Palette

**Decision**: Define CSS custom properties on `:root` in `globals.css` for the color palette and spacing scale. Components reference these variables rather than hardcoding hex values.

**Rationale**: CSS custom properties are natively supported in all modern browsers, work seamlessly with CSS Modules (variables cascade from `:root` into module-scoped selectors), and provide a single source of truth for design tokens. Changes to the palette require editing only `globals.css`.

**Color palette** (blue-based primary per spec assumption):
- `--color-primary`: `#2563eb` (blue-600)
- `--color-primary-hover`: `#1d4ed8` (blue-700)
- `--color-error`: `#dc2626` (red-600)
- `--color-error-hover`: `#b91c1c` (red-700)
- `--color-muted`: `#6b7280` (gray-500)
- `--color-border`: `#d1d5db` (gray-300)
- `--color-background`: `#ffffff`
- `--color-surface`: `#f9fafb` (gray-50)
- `--color-text`: `#111827` (gray-900)

**Spacing scale** (0.5rem base):
- `--space-1`: `0.25rem` (4px)
- `--space-2`: `0.5rem` (8px)
- `--space-3`: `0.75rem` (12px)
- `--space-4`: `1rem` (16px)
- `--space-5`: `1.5rem` (24px)
- `--space-6`: `2rem` (32px)
- `--space-7`: `3rem` (48px)

**Alternatives considered**:
- **CSS preprocessor variables (Sass)**: Requires adding Sass dependency. CSS custom properties are runtime-dynamic and don't need a build step. Rejected.
- **JS theme object**: Would couple styling to JavaScript, doesn't work in pure CSS Modules without CSS-in-JS. Rejected.

## R4: Responsive Design Strategy

**Decision**: Use a single breakpoint at `640px` with mobile-first CSS. Below 640px: full-width content with `1rem` side padding. At/above 640px: centered content with `max-width: 640px`.

**Rationale**: The app is content-focused with a single-column layout. One breakpoint keeps the CSS simple while meeting the spec requirement. Mobile-first approach means the base styles work on small screens, and the `@media (min-width: 640px)` query adds the centered max-width.

**Alternatives considered**:
- **Multiple breakpoints (sm/md/lg/xl)**: Unnecessary for a single-column reading list app. Adds complexity without benefit.
- **Container queries**: Newer CSS feature, but not needed — the app layout depends on viewport width, not container width.

## R5: Modal Implementation for RemoveBookDialog

**Decision**: Implement the modal using a CSS overlay with backdrop, `position: fixed`, centered flex layout, and `z-index` layering. Add a backdrop click handler for dismissal. Consider using the native `<dialog>` element if it aligns with the existing component structure.

**Rationale**: The current `RemoveBookDialog` renders inline without modal treatment. A proper modal needs: (1) a semi-transparent backdrop covering the viewport, (2) centered dialog content, (3) backdrop click to dismiss, and (4) focus trapping is a nice-to-have but not in spec. Using CSS for positioning and a click handler for backdrop dismissal keeps it simple.

**Implementation approach**: Wrap the dialog content in a fixed-position overlay `<div>`. The overlay has `background: rgba(0,0,0,0.5)` and uses flexbox centering. An `onClick` on the overlay (with `stopPropagation` on the dialog content) handles backdrop dismissal.

**Alternatives considered**:
- **Native `<dialog>` element with `showModal()`**: Provides built-in backdrop and focus trapping, but requires `useRef` and imperative API which changes the component pattern. Could be used in a future iteration. Evaluated but deferred for simplicity.
- **Portal via `createPortal`**: Not needed since fixed positioning already escapes the normal flow. The dialog doesn't need to escape a `overflow: hidden` ancestor.

## R6: Testing Strategy for CSS Changes

**Decision**: Test behavioral aspects (nav presence, modal interaction, responsive layout) but not pure visual properties (colors, spacing, font sizes).

**Rationale**: The constitution mandates tests for business rules. CSS styling is not a business rule. However, the presence of navigation links, modal backdrop dismissal behavior, and component rendering with correct structure ARE testable behaviors. Testing exact CSS values (e.g., `color: red`) is brittle and not meaningful.

**What to test**:
- **Unit (Jest + RTL)**: Nav links render on layout. Components render with expected CSS Module class names applied (not the actual style values). Modal backdrop click triggers `onCancel`. Error messages render in alert container.
- **E2E (Playwright)**: Navigation flow between pages. Modal appears/dismisses correctly. Responsive layout at 320px and 1024px viewports. No horizontal overflow.

**What NOT to test**:
- Specific color hex values
- Exact pixel spacing/padding
- Font family rendering
- Visual regression (would need a screenshot testing tool not in the stack)

**Alternatives considered**:
- **Visual regression testing (Percy, Chromatic)**: Valuable for design systems but requires additional tooling not in the tech stack. Out of scope.
- **CSS property assertions in unit tests**: Brittle, break on any design refinement, and don't verify visual correctness anyway.
