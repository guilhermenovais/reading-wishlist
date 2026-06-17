# Feature Specification: Open Library Integration

**Feature Branch**: `002-open-library-integration`  
**Created**: 2026-06-17  
**Status**: Draft  
**Input**: User description: "Allow users to import book information from Open Library"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Search Books by Title (Priority: P1)

As a user, I want to search for books by title using real-world book data, so that I can find books I want to add to my wishlist without manually entering all the details.

**Why this priority**: Search is the entry point for the entire import flow. Without it, users cannot discover books from Open Library, making all other stories impossible.

**Independent Test**: Can be fully tested by entering a search term and verifying that matching results are displayed with title, author, publication year, and ISBN.

**Acceptance Scenarios**:

1. **Given** the user navigates to the dedicated `/search` page via the navigation link on the wishlist page, **When** the user enters a book title and submits the search, **Then** the system displays a list of up to 10 matching results from Open Library, each showing title, author, publication year, and ISBN
2. **Given** the user searches for a term with no matching results, **When** the search completes, **Then** the system informs the user that no results were found
3. **Given** the user submits a search, **When** the Open Library service is unavailable, **Then** the system displays a user-friendly error message indicating the search could not be completed
4. **Given** the user has not entered a search term, **When** the user attempts to search, **Then** the system prompts the user to enter a search term

---

### User Story 2 - Import a Book to Wishlist (Priority: P1)

As a user, I want to select a book from the search results and add it to my personal reading wishlist, so that I can build my wishlist using real-world book data without manual data entry.

**Why this priority**: Importing is the core value proposition — connecting search results to the user's personal library. Tied with search as the minimum viable experience.

**Independent Test**: Can be fully tested by searching for a book, selecting a result, and verifying it appears in the user's wishlist with the correct title, author, publication year, ISBN, and status "WISHLIST".

**Acceptance Scenarios**:

1. **Given** search results are displayed, **When** the user selects a book to import, **Then** the book is added to the wishlist with status "WISHLIST" and all available fields (title, author, publication year, ISBN) are populated, and the user remains on the search results page with the imported book visually marked as "already added"
2. **Given** the user imports a book that has no ISBN from Open Library, **When** the import completes, **Then** the book is still added to the wishlist with the ISBN field left empty
3. **Given** a book with the same ISBN already exists in the wishlist, **When** the user attempts to import it, **Then** the system prevents the duplicate and informs the user the book is already in their wishlist
4. **Given** the user imports a book that has no publication year from Open Library, **When** the import completes, **Then** the book is still added with the publication year field left empty

---

### User Story 3 - View Imported Book Details (Priority: P2)

As a user, I want to see the full details of an imported book, including the new fields (ISBN and publication year), so that I can review the book information from Open Library.

**Why this priority**: Viewing details with the new fields completes the user experience for imported books, but it is secondary to the core search-and-import flow.

**Independent Test**: Can be fully tested by viewing the details of a previously imported book and verifying all fields (title, author, publication year, ISBN, status) are displayed.

**Acceptance Scenarios**:

1. **Given** an imported book exists in the wishlist, **When** the user views its details, **Then** all fields are displayed including title, author, publication year, ISBN, and status
2. **Given** an imported book has no ISBN or publication year, **When** the user views its details, **Then** the missing fields are gracefully indicated as not available

---

### Edge Cases

- What happens when Open Library returns results with missing or incomplete data (no author, no publication year, no ISBN)? The system should display whatever data is available and allow import with missing optional fields.
- What happens when a user imports a book without an ISBN and later tries to import another book without an ISBN? Since there is no ISBN to check for duplicates, both imports should succeed (duplicate detection only applies to books with matching ISBNs).
- What happens when the Open Library API returns an error or times out? The system should display a user-friendly error message and allow the user to retry.
- What happens when search results contain many entries? The system displays up to 10 results per search query.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-005**: System MUST allow users to search for books by title using the Open Library service
- **FR-006**: System MUST display search results including title, author, publication year, and ISBN for each result
- **FR-006a**: System MUST gracefully handle results where some fields (author, publication year, ISBN) are not provided by Open Library
- **FR-007**: System MUST allow users to select a search result and add it to their personal wishlist
- **FR-007a**: System MUST assign the status "WISHLIST" to every imported book
- **FR-007b**: System MUST allow books without an ISBN to be imported
- **FR-007c**: System MUST prevent importing a book when a book with the same ISBN already exists in the wishlist
- **FR-007d**: Duplicate ISBN detection MUST only apply when both the existing and incoming books have a non-empty ISBN
- **FR-008**: System MUST display a user-friendly error message when the Open Library service is unavailable or returns an error
- **FR-009**: System MUST display the new fields (ISBN, publication year) when viewing book details

### Key Entities

- **Book** (extended): Represents a book on the user's reading wishlist. Existing attributes: unique identifier, title, author, status. New attributes: ISBN (optional), publication year (optional).
- **Search Result**: Represents a book returned by Open Library. Attributes: title, author, publication year, ISBN. This is a transient entity used only during the search-and-import flow.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can search for a book and see results in under 5 seconds under normal network conditions
- **SC-002**: Users can import a book from search results into their wishlist in a single action
- **SC-003**: 100% of attempts to import a book with a duplicate ISBN are prevented with a clear message
- **SC-004**: Books without an ISBN from Open Library can still be imported successfully
- **SC-005**: When the Open Library service is unavailable, users see a clear error message instead of a broken or empty page
- **SC-006**: All four specified test cases pass: successful API response mapping, successful import, duplicate ISBN prevention, and API failure handling

## Clarifications

### Session 2026-06-17

- Q: What is the maximum number of search results to display per query? → A: Up to 10 results per search
- Q: What happens after a user successfully imports a book from search results? → A: Stay on search results, visually mark the imported book as "already added" (no separate message)
- Q: Where does the search UI live within the app? → A: Dedicated /search page accessible via a navigation link from the main wishlist page

## Assumptions

- The existing Reading Wishlist application (from feature 001) is in place and provides the book persistence layer, book listing, detail view, and removal capabilities
- This feature extends the existing Book entity with new optional fields (ISBN, publication year) without breaking existing functionality
- This is a single-user application; there is no multi-user or authentication requirement
- Open Library's public search API is used and does not require authentication
- Search is performed by title only; advanced search options (by author, by ISBN) are out of scope for this feature
- The system displays up to 10 search results per query
- No offline caching of Open Library data is required; search always queries the live service
- Manually created books (from feature 001) continue to work and do not require ISBN or publication year
