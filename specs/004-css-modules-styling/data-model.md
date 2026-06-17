# Data Model: CSS Modules Styling

**Feature**: 004-css-modules-styling  
**Date**: 2026-06-17

This feature introduces no database entities or schema changes. The "entities" are design tokens and style modules — documented below as the data model for the styling system.

## Design Tokens (CSS Custom Properties)

Defined in `src/app/globals.css` on `:root`. These are the single source of truth for all visual values.

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary` | `#2563eb` | Primary actions, links, active nav items |
| `--color-primary-hover` | `#1d4ed8` | Hover state for primary elements |
| `--color-error` | `#dc2626` | Destructive actions, error alerts |
| `--color-error-hover` | `#b91c1c` | Hover state for destructive elements |
| `--color-muted` | `#6b7280` | Secondary text, ISBNs, metadata labels |
| `--color-border` | `#d1d5db` | Card borders, input borders, dividers |
| `--color-background` | `#ffffff` | Page background |
| `--color-surface` | `#f9fafb` | Card backgrounds, elevated surfaces |
| `--color-text` | `#111827` | Primary text color |

### Spacing Scale

| Token | Value | Pixels |
|-------|-------|--------|
| `--space-1` | `0.25rem` | 4px |
| `--space-2` | `0.5rem` | 8px |
| `--space-3` | `0.75rem` | 12px |
| `--space-4` | `1rem` | 16px |
| `--space-5` | `1.5rem` | 24px |
| `--space-6` | `2rem` | 32px |
| `--space-7` | `3rem` | 48px |

### Typography

| Token | Value | Usage |
|-------|-------|-------|
| `--font-family` | Inter variable (via next/font) | All text |
| `--line-height` | `1.6` | Body text |
| `--border-radius` | `0.5rem` | Cards, buttons, inputs |

### Layout

| Token | Value | Usage |
|-------|-------|-------|
| `--max-width` | `640px` | Content container max-width |
| `--breakpoint` | `640px` | Mobile/desktop responsive breakpoint |

## Component Style Modules

Each presentation component gets a co-located `.module.css` file. Below are the style contracts — the CSS class names each module exports and what they style.

### `layout.module.css`

| Class | Purpose |
|-------|---------|
| `.header` | Fixed-height header bar with bottom border |
| `.nav` | Flex container for nav links within header, centered max-width |
| `.navLink` | Individual nav link styling with hover/active states |
| `.navLinkActive` | Active page indicator (could use bold or underline) |
| `.container` | Main content wrapper with max-width and responsive padding |

### `add-book-form.module.css`

| Class | Purpose |
|-------|---------|
| `.form` | Form container with vertical spacing |
| `.fieldGroup` | Label + input wrapper with stacked layout |
| `.label` | Label text styling |
| `.input` | Full-width input with border, padding, border-radius |
| `.submitButton` | Primary-colored submit button, 44px min-height |
| `.alert` | Styled error alert container (background, border, padding) |

### `book-list.module.css`

| Class | Purpose |
|-------|---------|
| `.list` | Unstyled list reset with vertical gap |
| `.card` | Book card with border, border-radius, padding, surface background |
| `.cardContent` | Flex layout for book info + actions |
| `.bookTitle` | Title text (bold, primary color link) |
| `.bookMeta` | Author, year, ISBN in muted text |
| `.badge` | Status badge (inline, rounded, small text) |
| `.removeButton` | Destructive-styled remove button |
| `.emptyState` | Styled empty wishlist message |

### `search-form.module.css`

| Class | Purpose |
|-------|---------|
| `.form` | Form container |
| `.searchGroup` | Flex row for input + button with matching heights |
| `.input` | Search input with flex-grow |
| `.searchButton` | Primary-colored search button, 44px min-height |

### `search-results.module.css`

| Class | Purpose |
|-------|---------|
| `.list` | Results list with vertical spacing |
| `.card` | Result card similar to book-list cards |
| `.bookInfo` | Title, author, year layout |
| `.bookMeta` | ISBN and secondary info in muted text |
| `.importButton` | Primary import button |
| `.importedState` | Muted "Already added" indicator with check mark |
| `.alert` | Import error alert container |

### `book-detail.module.css`

| Class | Purpose |
|-------|---------|
| `.detailContainer` | Detail page wrapper |
| `.metadataGrid` | Key-value grid layout for `<dl>` element |
| `.metadataKey` | `<dt>` styling (muted, uppercase, small) |
| `.metadataValue` | `<dd>` styling |
| `.removeButton` | Destructive-styled remove button |
| `.backLink` | Back navigation link with arrow indicator |

### `remove-book-dialog.module.css`

| Class | Purpose |
|-------|---------|
| `.overlay` | Fixed full-viewport backdrop (semi-transparent black) |
| `.dialog` | Centered white dialog box with padding and border-radius |
| `.message` | Dialog text content |
| `.actions` | Button row with gap |
| `.confirmButton` | Destructive-styled confirm button |
| `.cancelButton` | Neutral-styled cancel button |

## Relationships

```
globals.css (design tokens)
  ├── layout.module.css (consumes tokens for header/container)
  ├── add-book-form.module.css (consumes tokens for form elements)
  ├── book-list.module.css (consumes tokens for cards/badges)
  ├── search-form.module.css (consumes tokens for search input)
  ├── search-results.module.css (consumes tokens for result cards)
  ├── book-detail.module.css (consumes tokens for metadata grid)
  └── remove-book-dialog.module.css (consumes tokens for modal)
```

All component modules reference design tokens from `globals.css` via `var(--token-name)`. No component module imports another component's CSS. Shared visual patterns (cards, buttons, alerts) are achieved by using the same design tokens, not by sharing CSS classes across modules.

## Validation Rules

- All color values in component modules MUST use `var(--color-*)` tokens, never hardcoded hex values
- All spacing values SHOULD use `var(--space-*)` tokens for consistency
- All interactive elements MUST have `min-height: 44px` for touch accessibility (FR-014)
- Font family MUST be inherited from the body element set by `next/font`, never redeclared in modules

## State Transitions

No state transitions. This feature does not modify any stateful behavior — it only changes visual presentation of existing states.
