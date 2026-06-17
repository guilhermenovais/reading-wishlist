# Feature Specification: CSS Modules Styling

**Feature Branch**: `004-css-modules-styling`  
**Created**: 2026-06-17  
**Status**: Draft  
**Input**: User description: "Add CSS Modules styling to the Reading Wishlist app — global layout with shared navigation, per-component CSS Module files, responsive design, and a consistent color palette using CSS custom properties."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consistent Visual Layout Across All Pages (Priority: P1)

A user navigates the Reading Wishlist app and sees a visually cohesive experience: a persistent header with navigation links to "Wishlist" and "Search", consistent page width and spacing, and readable typography throughout. The repeated inline width/padding currently hardcoded on every page is replaced by a shared layout container.

**Why this priority**: The global layout and navigation are the foundation that every other visual improvement builds on. Without a consistent shell, per-component styles would look disjointed.

**Independent Test**: Navigate between all three pages (Wishlist, Search, Book Detail) and verify the header/nav appears on each, the content is centered with consistent max-width, and typography is uniform.

**Acceptance Scenarios**:

1. **Given** any page in the app, **When** the page loads, **Then** a persistent header/nav bar is visible at the top with links to "Wishlist" and "Search"
2. **Given** a browser window wider than 640px, **When** viewing any page, **Then** content is centered with a maximum width and consistent padding
3. **Given** a mobile browser under 640px wide, **When** viewing any page, **Then** content fills the full width with adequate side padding
4. **Given** any page, **When** text renders, **Then** the font family, line height, and base colors are consistent and readable without layout shift from font loading

---

### User Story 2 - Styled Wishlist and Search Results as Scannable Cards (Priority: P2)

A user views their wishlist or search results and sees each book presented as a visually distinct card with title, author, year, and action buttons clearly laid out. Status badges on wishlist items are visually styled. Search results visually differentiate between books that can be imported and those already in the wishlist.

**Why this priority**: The book list and search results are the primary surfaces users interact with. Card-style presentation makes the lists scannable and actions discoverable — directly improving daily usability.

**Independent Test**: Add several books to the wishlist, then view the wishlist page. Also perform a search and verify results display as styled cards with clear import/already-added states.

**Acceptance Scenarios**:

1. **Given** a wishlist with books, **When** the user views the wishlist, **Then** each book appears as a distinct card showing title, author, year, and a "Remove" button
2. **Given** a book with a status value, **When** displayed in the wishlist, **Then** the status is shown as a visually styled badge
3. **Given** search results, **When** a book can be imported, **Then** the "Import to Wishlist" action appears as a prominent button in the app's primary color
4. **Given** search results, **When** a book has already been imported, **Then** the "Already added" state is visually distinct (e.g., muted with a check indicator)

---

### User Story 3 - Usable and Accessible Forms (Priority: P3)

A user adds a book manually or searches for a book and interacts with forms that have stacked labels, full-width inputs with visible borders and padding, clearly styled submit buttons, and error messages displayed in a styled alert box rather than plain red text.

**Why this priority**: Forms are the primary input mechanism. Properly styled inputs and clear error presentation reduce user frustration and improve task completion.

**Independent Test**: Submit the "Add a Book" form with missing data to trigger an error, then successfully add a book. Repeat with the search form. Verify inputs are full-width, labels are above inputs, buttons are visually prominent, and errors appear in styled alert boxes.

**Acceptance Scenarios**:

1. **Given** the Add Book form, **When** displayed, **Then** labels appear above inputs, inputs span the full available width with visible borders and padding
2. **Given** any form, **When** a validation error occurs, **Then** the error message appears in a styled alert box (not just plain colored text)
3. **Given** the search form, **When** displayed, **Then** the search input and button appear cohesive with matching heights and consistent border-radius
4. **Given** any form on a mobile device, **When** interacting with inputs and buttons, **Then** tap targets are at least 44px tall for comfortable touch interaction

---

### User Story 4 - Book Detail Page with Clean Key-Value Layout (Priority: P4)

A user views a book's detail page and sees its metadata (author, status, ISBN, publication year, date added) in a clean key-value grid layout. The "Remove" button has destructive styling (red/outlined), and the "Back to wishlist" link appears as a clear back navigation element.

**Why this priority**: The detail page is visited less frequently than the list pages, but it needs to present information clearly and make the destructive "Remove" action visually distinct from neutral actions.

**Independent Test**: Navigate to a book's detail page and verify metadata is displayed in a grid layout, the Remove button looks clearly destructive, and the back link is easy to find.

**Acceptance Scenarios**:

1. **Given** a book detail page, **When** displayed, **Then** book metadata appears in a clean key-value layout (either two-column grid or stacked pairs)
2. **Given** a book detail page, **When** the Remove button is visible, **Then** it is styled with destructive styling (red/outlined) clearly distinct from other actions
3. **Given** a book detail page, **When** the "Back to wishlist" link is visible, **Then** it appears as a clear back navigation element (e.g., with a back arrow or breadcrumb style)

---

### User Story 5 - Modal Dialog for Book Removal Confirmation (Priority: P5)

A user clicks "Remove" on any book and sees a proper modal overlay with a backdrop, centered dialog box, and clearly distinct button styles — a destructive-styled "Confirm" button and a neutral "Cancel" button.

**Why this priority**: The remove dialog currently renders inline without any modal treatment. While functional, a proper modal prevents accidental interaction with the page behind and makes the destructive action feel appropriately weighty.

**Independent Test**: Click "Remove" on a wishlist book and verify a modal overlay with backdrop appears, the dialog is centered, buttons are distinctly styled, and clicking the backdrop or "Cancel" dismisses the dialog.

**Acceptance Scenarios**:

1. **Given** the remove confirmation is triggered, **When** the dialog appears, **Then** it displays as a centered modal with a semi-transparent backdrop overlay
2. **Given** the remove dialog is open, **When** viewing the buttons, **Then** "Confirm" has destructive styling and "Cancel" has neutral styling
3. **Given** the remove dialog is open, **When** the user clicks the backdrop, **Then** the dialog is dismissed (same as Cancel)

---

### Edge Cases

- What happens when the wishlist is empty? An empty state message should be visually styled, not just plain text.
- What happens when a book title or author name is very long? Text should truncate or wrap gracefully within card boundaries.
- What happens when error messages are very long? The styled alert box should accommodate multi-line text without breaking layout.
- What happens when the app loads before fonts are ready? The next/font approach should prevent layout shift during font loading.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The app MUST display a persistent header/navigation bar on all pages with links to "Wishlist" and "Search"
- **FR-002**: All pages MUST share a centered, max-width content container defined once in the root layout (replacing per-page inline styles)
- **FR-003**: The app MUST use a global stylesheet with CSS custom properties defining the color palette (primary, error/destructive, muted text, border, background) and base typography
- **FR-004**: The app MUST use a web font loaded via next/font to prevent layout shift during font loading
- **FR-005**: Each of the 6 presentation components MUST have its own CSS Module file for scoped styles, with all inline `style={{}}` props removed
- **FR-006**: Book list items (wishlist and search results) MUST render as visually distinct cards with title, author, year, and action areas
- **FR-007**: Book status values MUST display as styled badges
- **FR-008**: Form inputs MUST display with labels stacked above, full-width sizing, visible borders, and adequate padding
- **FR-009**: Error messages MUST display in a styled alert container rather than plain colored text
- **FR-010**: The Remove Book dialog MUST render as a modal overlay with backdrop, centered positioning, and distinct button styles (destructive for Confirm, neutral for Cancel)
- **FR-011**: The book detail page MUST display metadata in a structured key-value layout
- **FR-012**: Destructive actions (Remove buttons) MUST be visually distinct from neutral and primary actions
- **FR-013**: The layout MUST be responsive — full-width with padding on viewports under 640px, centered max-width on wider viewports
- **FR-014**: All interactive elements (buttons, inputs, links in nav) MUST have a minimum tap target size of 44px for touch accessibility

### Key Entities

- **Color Palette**: A set of 4-5 CSS custom properties (primary, error/destructive, muted, border, background) used consistently across all components
- **Spacing Scale**: A consistent spacing system based on multiples of 0.5rem applied throughout the app
- **Component Style Module**: A `.module.css` file co-located with each presentation component, providing scoped styles

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All 6 presentation components have zero inline `style={{}}` props — styles are fully managed through CSS Module files
- **SC-002**: Navigation between all pages requires zero clicks to find — the persistent nav bar is always visible
- **SC-003**: The app displays consistently across viewports from 320px to 1440px wide without horizontal scrolling or content overflow
- **SC-004**: All interactive elements meet the 44px minimum tap target size on mobile viewports
- **SC-005**: No layout shift occurs during initial page load related to font loading
- **SC-006**: Users can visually distinguish destructive actions from neutral and primary actions at a glance
- **SC-007**: Book cards in lists are scannable — each card's title, author, and primary action are identifiable within 2 seconds of viewing

## Assumptions

- The app already works correctly in terms of functionality — this feature is purely visual/presentational and does not change any behavior or data flow
- CSS Modules are used as the styling approach since they are built into Next.js and require no additional dependencies
- The Inter font from Google Fonts (via next/font/google) is used as the base typeface — it is free, widely used, and offers excellent readability
- The color palette uses a blue-based primary color, red for destructive/error states, and neutral grays for muted text and borders — the exact hex values are a design decision left to implementation
- The existing HTML structure of components (semantic elements, ARIA attributes, role props) is preserved — styling changes do not alter accessibility markup
- No third-party CSS framework or component library is introduced — all styling is achieved with CSS Modules and a global stylesheet
