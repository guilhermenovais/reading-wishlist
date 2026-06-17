# Tasks: CSS Modules Styling

**Input**: Design documents from `/specs/004-css-modules-styling/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Not included — no TDD or test-first approach was explicitly requested in the feature specification. The constitution check confirmed CSS styling is not a business rule. Behavioral tests (nav rendering, modal interaction, responsive layout) can be added separately if desired.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Exact file paths included in all descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the global design token system that all component styles depend on

- [ ] T001 Create global stylesheet with design tokens in src/app/globals.css (color palette: --color-primary, --color-error, --color-muted, --color-border, --color-background, --color-surface, --color-text with hover variants; spacing scale: --space-1 through --space-7; typography: --line-height, --border-radius; layout: --max-width; base resets for box-sizing, margin, list-style)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Set up next/font, root layout with persistent navigation, and responsive container — MUST be complete before any user story work begins

- [ ] T002 Configure next/font with Inter font family in src/app/layout.tsx (import from next/font/google, apply font className to html or body element, import globals.css)
- [ ] T003 [P] Create src/app/layout.module.css with header, nav, navLink, navLinkActive, and container classes (header with bottom border; nav centered with max-width and flex layout; navLink with 44px min-height tap targets and hover/active states; container with responsive padding and max-width at 640px breakpoint)
- [ ] T004 Update src/app/layout.tsx to add persistent header/nav bar with "Wishlist" (/) and "Search" (/search) links, wrap {children} in content container div, apply layout.module.css classes (depends on T002, T003)

**Checkpoint**: Foundation ready — global tokens, font, navigation, and responsive container are in place. All pages now share the consistent shell.

---

## Phase 3: User Story 1 — Consistent Visual Layout Across All Pages (Priority: P1) MVP

**Goal**: Remove all inline `style={{}}` width/padding props from page components so they inherit the shared layout container from the root layout.

**Independent Test**: Navigate between Wishlist (/), Search (/search), and Book Detail (/books/[id]) pages — verify the header/nav appears on each, content is centered with consistent max-width above 640px, and fills full width with padding below 640px.

### Implementation for User Story 1

- [ ] T005 [P] [US1] Update src/app/page.tsx to remove inline style={{}} props (maxWidth, margin, padding) — content is now wrapped by layout container from root layout
- [ ] T006 [P] [US1] Update src/app/search/page.tsx to remove inline style={{}} props — content is now wrapped by layout container from root layout
- [ ] T007 [P] [US1] Update src/app/books/[id]/page.tsx to remove inline style={{}} props — content is now wrapped by layout container from root layout

**Checkpoint**: All three pages share the persistent nav and responsive container. No inline layout styles remain on page components.

---

## Phase 4: User Story 2 — Styled Wishlist and Search Results as Scannable Cards (Priority: P2)

**Goal**: Replace inline styles in book-list and search-results components with CSS Module card layouts, status badges, and import state indicators.

**Independent Test**: View the wishlist with several books — each should appear as a bordered card with title, author, year, status badge, and Remove button. Perform a search — results should display as cards with "Import to Wishlist" (primary button) or "Already added" (muted indicator) states.

### Implementation for User Story 2

- [ ] T008 [P] [US2] Create src/modules/books/presentation/book-list.module.css with list, card, cardContent, bookTitle, bookMeta, badge, removeButton, and emptyState classes (cards with --color-border border and --color-surface background; badge with rounded pill styling; removeButton with --color-error destructive styling; emptyState with centered muted text)
- [ ] T009 [P] [US2] Create src/modules/books/presentation/search-results.module.css with list, card, bookInfo, bookMeta, importButton, importedState, and alert classes (importButton with --color-primary styling; importedState with muted text and check indicator; alert with --color-error background/border for import errors)
- [ ] T010 [US2] Update src/modules/books/presentation/book-list.tsx to replace all inline style={{}} props with book-list.module.css classes (import styles, apply styles.card, styles.badge, styles.removeButton, styles.emptyState etc.)
- [ ] T011 [US2] Update src/modules/books/presentation/search-results.tsx to replace all inline style={{}} props with search-results.module.css classes (import styles, apply styles.card, styles.importButton, styles.importedState, styles.alert etc.)

**Checkpoint**: Wishlist and search results display as scannable cards with styled badges and action buttons. No inline styles remain on these components.

---

## Phase 5: User Story 3 — Usable and Accessible Forms (Priority: P3)

**Goal**: Replace inline styles in add-book-form and search-form with CSS Module styles — stacked labels, full-width inputs with visible borders, styled submit buttons with 44px min-height, and error messages in styled alert boxes.

**Independent Test**: Submit the "Add a Book" form with missing data — error should appear in a styled alert box. Fill and submit successfully. Use the search form — input and button should appear inline with matching heights. Verify 44px tap targets on mobile.

### Implementation for User Story 3

- [ ] T012 [P] [US3] Create src/modules/books/presentation/add-book-form.module.css with form, fieldGroup, label, input, submitButton, and alert classes (fieldGroup with stacked label-above-input layout; input full-width with --color-border border, --space-3 padding, --border-radius; submitButton with --color-primary background and 44px min-height; alert with --color-error background/border and --space-4 padding)
- [ ] T013 [P] [US3] Create src/modules/books/presentation/search-form.module.css with form, searchGroup, input, and searchButton classes (searchGroup as flex row with matching heights; input with flex-grow; searchButton with --color-primary background and 44px min-height; matching border-radius on input and button)
- [ ] T014 [US3] Update src/modules/books/presentation/add-book-form.tsx to replace all inline style={{}} props with add-book-form.module.css classes (import styles, apply styles.form, styles.fieldGroup, styles.label, styles.input, styles.submitButton, styles.alert)
- [ ] T015 [US3] Update src/modules/books/presentation/search-form.tsx to replace all inline style={{}} props with search-form.module.css classes (import styles, apply styles.form, styles.searchGroup, styles.input, styles.searchButton)

**Checkpoint**: All forms have stacked labels, full-width bordered inputs, 44px-tall buttons, and styled error alerts. No inline styles remain on form components.

---

## Phase 6: User Story 4 — Book Detail Page with Clean Key-Value Layout (Priority: P4)

**Goal**: Replace inline styles in book-detail component with a CSS Module providing a key-value metadata grid, destructive-styled Remove button, and back navigation link.

**Independent Test**: Navigate to a book's detail page — metadata should display in a grid/stacked key-value layout. The Remove button should look destructive (red/outlined). The "Back to wishlist" link should be clearly visible with a back arrow or breadcrumb style.

### Implementation for User Story 4

- [ ] T016 [US4] Create src/modules/books/presentation/book-detail.module.css with detailContainer, metadataGrid, metadataKey, metadataValue, removeButton, and backLink classes (metadataGrid as two-column grid or stacked pairs using dl/dt/dd; metadataKey with --color-muted, uppercase, small font; removeButton with --color-error destructive styling and 44px min-height; backLink with arrow indicator)
- [ ] T017 [US4] Update src/modules/books/presentation/book-detail.tsx to replace all inline style={{}} props with book-detail.module.css classes (import styles, apply styles.detailContainer, styles.metadataGrid, styles.metadataKey, styles.metadataValue, styles.removeButton, styles.backLink)

**Checkpoint**: Book detail page displays metadata in a clean key-value layout with destructive Remove button and clear back navigation. No inline styles remain.

---

## Phase 7: User Story 5 — Modal Dialog for Book Removal Confirmation (Priority: P5)

**Goal**: Transform the remove-book-dialog from inline rendering to a proper modal overlay with backdrop, centered dialog, and distinct button styles.

**Independent Test**: Click "Remove" on any book — a modal overlay with semi-transparent backdrop should appear with a centered dialog. Confirm button should have destructive styling, Cancel should be neutral. Clicking the backdrop should dismiss the dialog.

### Implementation for User Story 5

- [ ] T018 [US5] Create src/modules/books/presentation/remove-book-dialog.module.css with overlay, dialog, message, actions, confirmButton, and cancelButton classes (overlay with position:fixed, inset:0, rgba(0,0,0,0.5) backdrop, flex centering, z-index layering; dialog with --color-background, --border-radius, --space-6 padding, max-width; confirmButton with --color-error destructive styling and 44px min-height; cancelButton with neutral border styling and 44px min-height)
- [ ] T019 [US5] Update src/modules/books/presentation/remove-book-dialog.tsx to wrap dialog content in fixed-position overlay div, replace all inline style={{}} props with remove-book-dialog.module.css classes, add onClick handler on overlay for backdrop dismissal with stopPropagation on dialog content div

**Checkpoint**: Remove dialog renders as a proper centered modal with backdrop overlay. Destructive and neutral button styles are clearly distinct. Backdrop click dismisses the dialog.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final validation across all user stories

- [ ] T020 Verify all 6 presentation components (add-book-form, book-detail, book-list, remove-book-dialog, search-form, search-results) have zero inline style={{}} props remaining
- [ ] T021 Run quickstart.md manual validation — verify all 7 check items pass across viewports (320px, 640px, 1024px, 1440px): global layout and navigation, responsive design, wishlist cards, forms, search, book detail, modal dialog

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (globals.css must exist before layout.module.css can reference tokens) — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Phase 2 (layout container must be in root layout)
- **User Stories 2-5 (Phases 4-7)**: Depend on Phase 2 (globals.css tokens must be available). US2-US5 are independent of each other — can proceed in any order or in parallel
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Depends on Foundational only — removes page-level inline styles
- **US2 (P2)**: Depends on Foundational only — independent of US1 (card styles don't depend on page layout changes)
- **US3 (P3)**: Depends on Foundational only — independent of US1 and US2
- **US4 (P4)**: Depends on Foundational only — independent of US1-US3
- **US5 (P5)**: Depends on Foundational only — independent of US1-US4

### Within Each User Story

- CSS Module file created BEFORE component file is updated (component imports the module)
- Component update replaces all inline styles in a single task (keeps the component in a consistent state)

### Parallel Opportunities

- **Phase 2**: T003 (layout.module.css) can run in parallel with T002 (next/font config), since they target different files
- **Phase 3**: T005, T006, T007 can ALL run in parallel (three different page files)
- **Phase 4**: T008, T009 can run in parallel (two different CSS module files)
- **Phase 5**: T012, T013 can run in parallel (two different CSS module files)
- **Cross-story**: Once Phase 2 is complete, US2 through US5 can all start in parallel (different component files, no shared state)

---

## Parallel Example: User Story 2

```bash
# Create both CSS Module files in parallel:
Task: "Create book-list.module.css in src/modules/books/presentation/book-list.module.css"
Task: "Create search-results.module.css in src/modules/books/presentation/search-results.module.css"

# Then update components sequentially (each depends on its CSS module):
Task: "Update book-list.tsx to use CSS Module classes"
Task: "Update search-results.tsx to use CSS Module classes"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (globals.css with design tokens)
2. Complete Phase 2: Foundational (next/font, layout with nav, responsive container)
3. Complete Phase 3: User Story 1 (remove inline styles from all pages)
4. **STOP and VALIDATE**: Navigate all three pages — verify persistent nav, centered content, responsive breakpoint at 640px, no layout shift from font loading
5. The app now has a consistent visual shell — deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Design system foundation ready
2. Add US1 → Consistent layout across all pages (MVP!)
3. Add US2 → Wishlist and search results as scannable cards
4. Add US3 → Properly styled forms with error alerts
5. Add US4 → Clean book detail page with key-value grid
6. Add US5 → Modal dialog for book removal
7. Each story adds visual polish without breaking previous stories

### Parallel Team Strategy

With multiple developers after Phase 2 is complete:

- Developer A: User Story 2 (book-list + search-results cards)
- Developer B: User Story 3 (add-book-form + search-form styling)
- Developer C: User Story 4 + User Story 5 (book-detail + modal dialog)
- All stories work on different component files with no conflicts

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- All CSS Module files MUST use var(--token-name) for colors and spacing — no hardcoded hex values
- All interactive elements MUST have min-height: 44px for touch accessibility (FR-014)
- Preserve all existing HTML semantics and ARIA attributes when replacing inline styles
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
