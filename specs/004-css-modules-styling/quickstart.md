# Quickstart: CSS Modules Styling

**Feature**: 004-css-modules-styling  
**Date**: 2026-06-17

## Prerequisites

- Node.js installed
- Project dependencies installed (`npm install`)
- Database running and migrated (see Docker setup in `specs/003-docker-dev-environment/`)

## Development

```bash
# Start the dev server
npm run dev

# The app is available at http://localhost:3000
```

## Verifying the Feature

### Manual Checks

1. **Global layout & navigation**: Visit any page — a header with "Wishlist" and "Search" nav links should be visible at the top. Clicking links navigates between pages.

2. **Responsive design**: Resize the browser to < 640px wide. Content should fill full width with side padding. Resize to > 640px — content should center with max-width.

3. **Wishlist cards**: Navigate to the wishlist (`/`). Books should display as cards with borders, title, author, year, and a styled "Remove" button.

4. **Forms**: The "Add a Book" form should have stacked labels, full-width inputs with borders, and a styled submit button. Submit with empty fields to verify styled error alerts.

5. **Search**: Navigate to `/search`. The search input and button should appear inline with matching heights. Results should display as cards with "Import to Wishlist" / "Already added" states.

6. **Book detail**: Click a book to view its detail page. Metadata should appear in a key-value grid. The "Remove" button should look destructive (red). The "Back to wishlist" link should be clearly visible.

7. **Modal dialog**: Click "Remove" on any book. A modal overlay with backdrop should appear. Click the backdrop to dismiss. Click "Confirm" to remove.

### Automated Tests

```bash
# Unit & component tests
npm test

# E2E tests (requires dev server running)
npm run test:e2e
```

## Key Files

| File | Purpose |
|------|---------|
| `src/app/globals.css` | Design tokens (colors, spacing, typography) |
| `src/app/layout.tsx` | Root layout with next/font, nav, container |
| `src/app/layout.module.css` | Header, nav, and container styles |
| `src/modules/books/presentation/*.module.css` | Component-scoped styles |

## Design Token Reference

Colors are defined as CSS custom properties in `globals.css`. To use in a CSS Module:

```css
.button {
  background-color: var(--color-primary);
  color: var(--color-background);
}

.button:hover {
  background-color: var(--color-primary-hover);
}
```

Spacing uses `var(--space-N)` where N ranges from 1 (0.25rem) to 7 (3rem).
