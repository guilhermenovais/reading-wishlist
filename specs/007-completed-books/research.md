# Research: Completed Books

**Feature Branch**: `007-completed-books`  
**Date**: 2026-06-18

## Research Tasks

### R1: Cover Image Thumbnails on Completed Page

**Context**: FR-008 requires cover image thumbnails on the Completed page, but the `Book` entity and database schema do not store `coverImageUrl`. Cover images currently only exist in search results (`SearchResult.coverImageUrl`) fetched from Google Books API and are not persisted.

**Decision**: Store `coverImageUrl` on the Book model. When a book is imported from search, the cover image URL from the search provider is persisted alongside the book. This avoids re-fetching cover images from an external API every time the Completed page is loaded.

**Rationale**: 
- Cover images are available at import time from the search provider (Google Books API).
- Re-fetching cover images on every page load would violate Infrastructure Isolation (external API dependency for rendering) and degrade performance.
- Storing the URL is a lightweight addition (nullable string column).

**Alternatives considered**:
- Fetching cover images on-demand from Google Books API by ISBN — rejected because it couples the page rendering to an external service, violates the constitution's Infrastructure Isolation principle, and adds latency.
- Not showing cover images on the Completed page — rejected because FR-008 explicitly requires them.

### R2: Completion Date Storage Format

**Context**: The spec states "The completion date is a calendar date (not a timestamp) — time-of-day precision is not needed."

**Decision**: Store `completionDate` as a `DateTime` in Prisma/PostgreSQL (same pattern as `readingStartDate`). The domain entity will treat it as a `Date` object, and the presentation layer will format it using `toLocaleDateString()`.

**Rationale**: Prisma's `DateTime` maps to PostgreSQL's `timestamp`, which is what the project already uses for `readingStartDate`. Using a consistent type avoids complexity. The "date only" constraint is enforced at the domain level, not the database level.

**Alternatives considered**:
- Using a `String` field with ISO date format (YYYY-MM-DD) — rejected because it breaks consistency with `readingStartDate` and complicates date comparisons.
- Using PostgreSQL `DATE` type — rejected because Prisma doesn't have a native `Date` scalar; it would require custom handling.

### R3: Date Picker Constraints (Min/Max Date)

**Context**: FR-004 and FR-005 require the date picker to constrain future dates and dates before the reading start date.

**Decision**: Use a native HTML `<input type="date">` with `min` and `max` attributes. `min` is set to the book's `readingStartDate` (formatted as YYYY-MM-DD) and `max` is set to today's date. This is the simplest approach that meets the requirements without introducing a third-party date picker library.

**Rationale**: The project has no UI component library (no Material UI, shadcn, etc.). The native date input provides built-in date constraint support through `min`/`max` attributes. The constitution prohibits introducing new frameworks without explicit justification, and a date picker library is not justified for a single use case.

**Alternatives considered**:
- Third-party date picker library (react-datepicker, @mui/x-date-pickers) — rejected per Constitution V (no additional frameworks without justification) and because native `<input type="date">` meets the requirements.

### R4: Modal Dialog Implementation

**Context**: FR-003 requires a modal dialog for the "Mark as Completed" action.

**Decision**: Use the native HTML `<dialog>` element with the `showModal()` API. This provides built-in backdrop, focus trapping, and escape-to-close behavior without any dependencies.

**Rationale**: The project already uses a dialog pattern (`RemoveBookDialog` component), though it's implemented as an inline conditional render rather than a `<dialog>` element. Using `<dialog>` is the standard approach and requires no additional dependencies.

**Alternatives considered**:
- Inline conditional rendering (like `RemoveBookDialog`) — acceptable but doesn't provide true modal behavior (backdrop, focus trap). The spec explicitly calls for a "modal dialog."
- Third-party modal library — rejected per constitution constraints.

### R5: Navigation Order

**Context**: The spec assumes navigation order: Wishlist, Reading, Completed, Search. Current order is: Wishlist, Reading, Search.

**Decision**: Insert "Completed" link between "Reading" and "Search" in the layout navigation.

**Rationale**: Matches the natural book lifecycle flow (Wishlist → Reading → Completed) with Search as a utility at the end.

### R6: Status Transition Validation

**Context**: Only READING → COMPLETED is allowed. The transition is one-way (no path back from COMPLETED).

**Decision**: Add a `markAsCompleted(completionDate: Date)` method to the `Book` domain entity, following the same pattern as `startReading()`. The method validates that the book is in READING status, validates the completion date is not in the future and not before the reading start date, and returns a new immutable `Book` instance.

**Rationale**: Follows existing domain patterns exactly. Business rules are enforced in the domain layer, protected by unit tests — consistent with Constitution II (Domain-First Architecture) and I (Test-First Development).

**Alternatives considered**: None — the existing pattern is clear and well-established.
