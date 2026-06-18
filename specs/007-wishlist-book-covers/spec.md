# Feature Specification: Wishlist Book Covers

**Feature Branch**: `008-wishlist-book-covers`  
**Created**: 2026-06-18  
**Status**: Draft  
**Input**: User description: "I want the book covers to be shown on the wishlists. When adding a book manually, it should be possible to upload the cover."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Book Covers on Wishlist (Priority: P1)

As a user browsing my wishlist, I want to see the cover image of each book so that I can visually identify books at a glance and have a more appealing reading list experience.

**Why this priority**: Cover display is the core visual enhancement that improves the wishlist experience for every user on every visit. Without it, the remaining stories have no visible impact.

**Independent Test**: Can be fully tested by adding books with covers (via import or manual upload) and verifying covers appear on the wishlist page. Delivers immediate visual value.

**Acceptance Scenarios**:

1. **Given** a book in the wishlist has a cover image, **When** the user views the wishlist, **Then** the cover image is displayed alongside the book's title and author.
2. **Given** a book in the wishlist has no cover image, **When** the user views the wishlist, **Then** a placeholder is displayed instead of a cover image.
3. **Given** a book was imported from search results with a cover image URL, **When** the user views the wishlist, **Then** the imported cover image is displayed.

---

### User Story 2 - Upload Cover When Adding a Book Manually (Priority: P2)

As a user adding a book manually (not via search/import), I want to upload a cover image so that my manually-added books also display covers on the wishlist.

**Why this priority**: Enables users to provide covers for books that were not imported from external search and therefore have no automatic cover. Completes the cover experience for all book sources.

**Independent Test**: Can be fully tested by manually adding a book with a cover image upload, then verifying the uploaded cover appears on the wishlist.

**Acceptance Scenarios**:

1. **Given** the user is on the manual add book form, **When** the user fills in title and author and uploads a cover image, **Then** the book is added to the wishlist with the uploaded cover displayed.
2. **Given** the user is on the manual add book form, **When** the user fills in title and author without uploading a cover, **Then** the book is added successfully with a placeholder cover.
3. **Given** the user selects an invalid file type (not an image), **When** they attempt to upload, **Then** the system rejects the file and shows a clear error message.
4. **Given** the user selects an image that exceeds the maximum allowed size, **When** they attempt to upload, **Then** the system rejects the file and informs the user of the size limit.

---

### User Story 3 - Persist Cover from Search Import (Priority: P3)

As a user importing a book from search results, I want the cover image URL from the search provider to be saved so that it displays on my wishlist after import.

**Why this priority**: The search results already display cover images from external providers, but these are not currently persisted when importing. This story closes that gap without requiring user action.

**Independent Test**: Can be fully tested by searching for a book with a cover, importing it, and verifying the cover appears on the wishlist.

**Acceptance Scenarios**:

1. **Given** a search result has a cover image URL, **When** the user imports the book to their wishlist, **Then** the cover image URL is saved and displayed on the wishlist.
2. **Given** a search result has no cover image URL, **When** the user imports the book, **Then** the book is saved with no cover and a placeholder is shown on the wishlist.

---

### Edge Cases

- What happens when an uploaded image file is corrupted or unreadable?
- How does the system handle a previously valid external cover URL that becomes unavailable?
- What happens if the user uploads a very small image (e.g., 1x1 pixel)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display cover images for books on the wishlist page.
- **FR-002**: System MUST show a visual placeholder for books that have no cover image.
- **FR-003**: System MUST allow users to upload a cover image when adding a book manually.
- **FR-004**: System MUST accept common image formats (JPEG, PNG, WebP) for cover uploads.
- **FR-005**: System MUST enforce a maximum file size of 5 MB for uploaded cover images.
- **FR-006**: System MUST persist cover image URLs from external search providers when a book is imported.
- **FR-007**: System MUST validate uploaded files are actual images before accepting them.
- **FR-008**: System MUST store uploaded cover images so they remain accessible across sessions.
- **FR-009**: Cover upload MUST be optional — a book can be added without a cover image.

### Key Entities

- **Book**: Extended with an optional cover image reference (either an external URL from search import or a reference to an uploaded file).
- **Cover Image**: Represents a book's cover, sourced either from an external URL (search provider) or from a user-uploaded file. Attributes include image source type and image reference.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of books on the wishlist display either a cover image or a placeholder — no missing/broken image states.
- **SC-002**: Users can upload a cover image and see it on the wishlist within the same session, with no additional steps.
- **SC-003**: Books imported from search retain their cover images on the wishlist.
- **SC-004**: Cover image upload completes within 3 seconds for files under 5 MB on a standard connection.

## Assumptions

- The application is used by a single user or a small number of users; high-concurrency file upload optimization is out of scope.
- Cover images from external search providers (Google Books) are served via public URLs that remain accessible; the system stores the URL rather than downloading and re-hosting these images.
- The book detail page (`/books/[id]`) will also display the cover image, but the primary scope of this feature is the wishlist view and the manual add form.
- Mobile-responsive cover display is expected but native mobile app support is out of scope.
- No image editing or cropping functionality is required — the uploaded image is used as-is (resized for display via standard styling).
