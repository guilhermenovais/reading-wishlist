# Implementation Plan: CSS Modules Styling

**Branch**: `004-css-modules-styling` | **Date**: 2026-06-17 | **Spec**: `specs/004-css-modules-styling/spec.md`
**Input**: Feature specification from `specs/004-css-modules-styling/spec.md`

## Summary

Add a comprehensive visual design system to the Reading Wishlist app using CSS Modules and CSS custom properties. This replaces all inline `style={{}}` props across 6 presentation components with co-located `.module.css` files, introduces a global stylesheet with a color palette and typography via `next/font`, adds a persistent header/navigation bar in the root layout, and implements responsive design with a 640px breakpoint. A modal overlay for the remove-book dialog and card-based layouts for book lists complete the styling overhaul. No business logic or data flow changes.

## Technical Context

**Language/Version**: TypeScript 6.0 on Node.js  
**Primary Dependencies**: Next.js 16, React 19, Prisma 6  
**Storage**: PostgreSQL via Prisma ORM (unchanged by this feature)  
**Testing**: Jest 30 + React Testing Library 16 (unit/integration), Playwright 1.61 (E2E)  
**Target Platform**: Web browser (desktop + mobile, 320px–1440px viewports)  
**Project Type**: Web application (Next.js App Router)  
**Performance Goals**: No layout shift from font loading (next/font); no render-blocking CSS  
**Constraints**: Zero new dependencies; CSS Modules only (built into Next.js); preserve all existing HTML semantics and ARIA attributes  
**Scale/Scope**: 6 presentation components, 3 pages, 1 root layout; ~8 new CSS files

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Assessment |
|-----------|--------|------------|
| **I. Test-First Development** | PASS (with nuance) | This feature is purely visual/presentational — it introduces no new business rules. The constitution mandates TDD for "every business rule," which CSS styling is not. However, behavioral aspects (persistent nav rendering, modal backdrop dismissal, responsive breakpoint behavior) are testable and SHOULD have tests. Pure CSS visual properties (colors, spacing, fonts) do not require unit tests. Component render tests should verify CSS Module classes are applied and behavioral contracts are maintained. |
| **II. Domain-First Architecture** | PASS | All changes are confined to the presentation layer (`src/modules/books/presentation/` and `src/app/`). No domain, application, or infrastructure layers are modified. |
| **III. Testing Pyramid** | PASS | Unit tests: component rendering with CSS classes, nav link presence. E2E tests: visual flow across pages, responsive behavior, modal interaction. No integration tests needed (no DB/API changes). |
| **IV. Infrastructure Isolation** | PASS | No infrastructure changes. No new external dependencies. |
| **V. Code Quality & Strictness** | PASS | CSS Modules provide compile-time class name scoping. No `any` usage. CSS custom properties use semantic naming (`--color-primary`, `--color-error`). |
| **Technology Stack** | PASS | CSS Modules are built into Next.js — no new framework introduced. `next/font` is a Next.js built-in. |

**Gate result**: PASS — proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/004-css-modules-styling/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (design tokens)
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks command)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── globals.css                    # NEW: CSS custom properties, base typography, resets
│   ├── layout.tsx                     # MODIFIED: add next/font, import globals.css, add nav
│   ├── layout.module.css              # NEW: header/nav and content container styles
│   ├── page.tsx                       # MODIFIED: remove inline styles, use layout container
│   ├── search/
│   │   └── page.tsx                   # MODIFIED: remove inline styles, use layout container
│   └── books/
│       └── [id]/
│           └── page.tsx               # MODIFIED: remove inline styles, use layout container
├── modules/
│   └── books/
│       └── presentation/
│           ├── add-book-form.tsx           # MODIFIED: replace inline styles with CSS Module
│           ├── add-book-form.module.css    # NEW: form styles
│           ├── book-detail.tsx             # MODIFIED: replace inline styles with CSS Module
│           ├── book-detail.module.css      # NEW: detail key-value layout
│           ├── book-list.tsx               # MODIFIED: replace inline styles with CSS Module
│           ├── book-list.module.css        # NEW: card styles, status badges
│           ├── remove-book-dialog.tsx      # MODIFIED: add modal overlay behavior
│           ├── remove-book-dialog.module.css # NEW: modal, backdrop, button styles
│           ├── search-form.tsx            # MODIFIED: replace inline styles with CSS Module
│           ├── search-form.module.css     # NEW: inline search form styles
│           ├── search-results.tsx         # MODIFIED: replace inline styles with CSS Module
│           └── search-results.module.css  # NEW: result cards, import states
```

**Structure Decision**: All CSS Module files are co-located with their components in `src/modules/books/presentation/`. Global styles and layout styles live in `src/app/`. This follows Next.js conventions and keeps scoped styles discoverable next to the components they style.

## Complexity Tracking

No constitution violations to justify — all changes are within the presentation layer using built-in Next.js features.
