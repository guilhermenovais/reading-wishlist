# Feature Specification: Google Books Search

**Feature Branch**: `006-google-books-search`  
**Created**: 2026-06-18  
**Status**: Draft  
**Input**: User description: "On the searching feature, I want to replace Open Library with Google Books API"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Search Books Using Google Books (Priority: P1)

As a user, I want to search for books by title and receive results sourced from Google Books instead of Open Library, so that I get more reliable and comprehensive book data when building my wishlist.

**Why this priority**: This is the core change — swapping the data source. Without it, the application still uses Open Library and no other story can deliver value.

**Independent Test**: Can be fully tested by entering a book title on the search page and verifying that matching results are displayed with title, author, publication year, and ISBN, all sourced from Google Books.

**Acceptance Scenarios**:

1. **Given** the user navigates to the `/search` page, **When** the user enters a book title and submits the search, **Then** the system displays a list of up to 10 matching results sourced from Google Books, each showing title, author, publication year, and ISBN
2. **Given** the user searches for a term with no matching results, **When** the search completes, **Then** the system informs the user that no results were found
3. **Given** the user submits a search, **When** the Google Books service is unavailable or returns an error, **Then** the system displays a user-friendly error message indicating the search could not be completed
4. **Given** the user has not entered a search term, **When** the user attempts to search, **Then** the system prompts the user to enter a search term

---

### User Story 2 - Import a Book from Google Books Results (Priority: P1)

As a user, I want to select a book from the Google Books search results and add it to my personal reading wishlist, so that I can build my wishlist using real-world book data just as before.

**Why this priority**: Importing is the core value of the search-and-import flow. Without it, search results are informational only.

**Independent Test**: Can be fully tested by searching for a book, selecting a result from Google Books, and verifying it appears in the user's wishlist with the correct title, author, publication year, ISBN, and status "WISHLIST".

**Acceptance Scenarios**:

1. **Given** Google Books search results are displayed, **When** the user selects a book to import, **Then** the book is added to the wishlist with status "WISHLIST" and all available fields (title, author, publication year, ISBN) are populated, and the user remains on the search results page with the imported book visually marked as "already added"
2. **Given** the user imports a book that has no ISBN from Google Books, **When** the import completes, **Then** the book is still added to the wishlist with the ISBN field left empty
3. **Given** a book with the same ISBN already exists in the wishlist, **When** the user attempts to import it, **Then** the system prevents the duplicate and informs the user the book is already in their wishlist
4. **Given** the user imports a book that has no publication year from Google Books, **When** the import completes, **Then** the book is still added with the publication year field left empty

---

### User Story 3 - Display Book Cover Thumbnails in Search Results (Priority: P2)

As a user, I want to see book cover images in the search results, so that I can more easily identify and choose the correct book to add to my wishlist.

**Why this priority**: Google Books commonly provides cover image data. Displaying thumbnails enriches the user experience significantly but is not essential for the core search-and-import flow.

**Independent Test**: Can be fully tested by searching for a well-known book and verifying that a cover image is displayed alongside the result. For results without a cover image, a placeholder should be shown.

**Acceptance Scenarios**:

1. **Given** Google Books search results are displayed, **When** a result includes a cover image, **Then** the cover thumbnail is displayed alongside the book information
2. **Given** Google Books search results are displayed, **When** a result does not include a cover image, **Then** a placeholder image or icon is displayed instead

---

### Edge Cases

- What happens when Google Books returns results with missing or incomplete data (no author, no publication year, no ISBN, no cover image)? The system should display whatever data is available and allow import with missing optional fields.
- What happens when a user imports a book without an ISBN and later tries to import another book without an ISBN? Both imports should succeed, since duplicate detection only applies to books with matching ISBNs.
- What happens when the Google Books service returns an error or times out? The system should display a user-friendly error message and allow the user to retry.
- What happens when search results contain many entries? The system displays up to 10 results per search query.
- What happens with books that existed in the wishlist before the migration from Open Library to Google Books? Previously imported books remain unchanged and fully functional.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST source all book search results from Google Books instead of Open Library
- **FR-002**: System MUST display search results including title, author, publication year, and ISBN for each result
- **FR-003**: System MUST gracefully handle results where some fields (author, publication year, ISBN, cover image) are not provided by Google Books
- **FR-004**: System MUST allow users to select a search result and add it to their personal wishlist
- **FR-005**: System MUST assign the status "WISHLIST" to every imported book
- **FR-006**: System MUST allow books without an ISBN to be imported
- **FR-007**: System MUST prevent importing a book when a book with the same ISBN already exists in the wishlist
- **FR-008**: Duplicate ISBN detection MUST only apply when both the existing and incoming books have a non-empty ISBN
- **FR-009**: System MUST display a user-friendly error message when the Google Books service is unavailable or returns an error
- **FR-010**: System MUST display book cover thumbnails in search results when available
- **FR-011**: System MUST display a placeholder when a book cover image is not available from Google Books
- **FR-012**: System MUST continue to support all previously imported books without any data loss or behavioral changes
- **FR-013**: System MUST limit search results to a maximum of 10 per query

### Key Entities

- **Book** (unchanged): Represents a book on the user's reading wishlist. Attributes: unique identifier, title, author, status, ISBN (optional), publication year (optional).
- **Search Result** (extended): Represents a book returned by Google Books. Attributes: title, author, publication year, ISBN, cover image URL (optional). This is a transient entity used only during the search-and-import flow.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can search for a book and see results in under 5 seconds under normal network conditions
- **SC-002**: Users can import a book from search results into their wishlist in a single action
- **SC-003**: 100% of attempts to import a book with a duplicate ISBN are prevented with a clear message
- **SC-004**: Books with missing optional fields from Google Books can still be imported successfully
- **SC-005**: When the Google Books service is unavailable, users see a clear error message instead of a broken or empty page
- **SC-006**: Search results that include a cover image display the thumbnail; results without one show a placeholder
- **SC-007**: All previously imported books from Open Library remain accessible and fully functional after the change

## Assumptions

- The existing search-and-import feature (from feature 002) is in place and provides the search page, import workflow, and duplicate detection logic
- This feature replaces the data source only; the user-facing search and import workflow remains the same
- This is a single-user application; there is no multi-user or authentication requirement
- Google Books provides a public search capability that can be used for this application's volume of queries
- Search is performed by title only; advanced search options (by author, by ISBN) are out of scope for this feature
- The system displays up to 10 search results per query
- No offline caching of Google Books data is required; search always queries the live service
- The Book entity in the wishlist does not need new fields beyond what already exists (title, author, ISBN, publication year, status); the cover image is displayed in search results only, not stored
- Manually created books (from feature 001) continue to work and do not require ISBN or publication year
