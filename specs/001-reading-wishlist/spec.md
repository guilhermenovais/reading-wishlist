# Feature Specification: Reading Wishlist MVP

**Feature Branch**: `001-reading-wishlist`  
**Created**: 2026-06-17  
**Status**: Draft  
**Input**: User description: "Allow users to maintain a personal reading wishlist with add, list, view, and remove capabilities"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Add a Book to Wishlist (Priority: P1)

As a user, I want to add a book to my reading wishlist by providing its title and author, so that I can keep track of books I want to read.

**Why this priority**: Adding books is the foundational action. Without it, no other feature has value. This is the core write operation that populates the wishlist.

**Independent Test**: Can be fully tested by adding a book with a title and author, then confirming it appears in the system with status "WISHLIST" and a unique identifier.

**Acceptance Scenarios**:

1. **Given** the user is on the wishlist, **When** the user provides a valid title and author, **Then** a new book is created with status "WISHLIST" and a unique identifier is assigned
2. **Given** the user is on the wishlist, **When** the user tries to add a book without a title, **Then** the system rejects the request and informs the user that a title is required
3. **Given** the user is on the wishlist, **When** the user tries to add a book without an author, **Then** the system rejects the request and informs the user that an author is required

---

### User Story 2 - List All Books (Priority: P1)

As a user, I want to view all the books in my wishlist, so that I can see what I have saved at a glance.

**Why this priority**: Listing books is the primary read operation and essential for users to interact with their wishlist. Tied with adding as the minimum viable experience.

**Independent Test**: Can be fully tested by listing all books and verifying each entry displays at minimum its title and author.

**Acceptance Scenarios**:

1. **Given** the wishlist contains one or more books, **When** the user requests the book list, **Then** all registered books are displayed
2. **Given** the wishlist is empty, **When** the user requests the book list, **Then** the system indicates the wishlist is empty

---

### User Story 3 - View Book Details (Priority: P2)

As a user, I want to view all information associated with a specific book, so that I can see its complete details.

**Why this priority**: Viewing details supports the user in reviewing individual books. Less critical than list/add but necessary for a complete experience.

**Independent Test**: Can be fully tested by selecting a specific book and verifying all its stored information is displayed (title, author, status, identifier).

**Acceptance Scenarios**:

1. **Given** a book exists in the wishlist, **When** the user requests its details by identifier, **Then** all information for that book is displayed (title, author, status, identifier)
2. **Given** no book exists with the provided identifier, **When** the user requests its details, **Then** the system informs the user that the book was not found

---

### User Story 4 - Remove a Book from Wishlist (Priority: P2)

As a user, I want to remove a book from my wishlist, so that I can keep my list relevant and up to date.

**Why this priority**: Removing books allows users to maintain a clean wishlist. Important for ongoing usability but secondary to the core add/list flow.

**Independent Test**: Can be fully tested by removing a book and verifying it no longer appears in the wishlist.

**Acceptance Scenarios**:

1. **Given** a book exists in the wishlist, **When** the user initiates removal, **Then** the system displays a confirmation dialog before deleting
2. **Given** the user confirms the removal, **When** the deletion is executed, **Then** the book is permanently deleted from the wishlist
3. **Given** the user cancels the removal, **When** the confirmation dialog is dismissed, **Then** the book remains in the wishlist unchanged
4. **Given** no book exists with the provided identifier, **When** the user attempts to remove it, **Then** the system informs the user that the book was not found

---

### Edge Cases

- What happens when the user provides an empty string or whitespace-only string as a title or author? The system should treat empty and whitespace-only strings the same as missing values and reject the request.
- What happens when the user tries to view or remove a book with an invalid or malformed identifier? The system should respond with a "not found" message.
- What happens when the wishlist is empty and the user tries to list books? The system should gracefully indicate an empty wishlist.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to create a book by providing a title and an author
- **FR-002**: System MUST reject book creation when the title is not provided, empty, or whitespace-only
- **FR-003**: System MUST reject book creation when the author is not provided, empty, or whitespace-only
- **FR-004**: System MUST automatically assign the status "WISHLIST" to every newly created book
- **FR-005**: System MUST assign a unique identifier to each book upon creation
- **FR-006**: System MUST allow users to view a list of all registered books
- **FR-007**: System MUST allow users to view all information associated with a specific book by its identifier
- **FR-008**: System MUST return a "not found" indication when a user requests details for a non-existent book
- **FR-009**: System MUST display a confirmation dialog before removing a book from the wishlist
- **FR-009a**: System MUST allow users to cancel the removal and retain the book
- **FR-010**: System MUST return a "not found" indication when a user attempts to remove a non-existent book

### Key Entities

- **Book**: Represents a book on the user's reading wishlist. Attributes: unique identifier (auto-incrementing integer), title, author, status (always "WISHLIST" upon creation).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can add a book to the wishlist in under 30 seconds
- **SC-002**: Users can view the complete list of books in a single action
- **SC-003**: Users can retrieve details for a specific book by its identifier in a single action
- **SC-004**: Users can remove a book in a single action, and the book no longer appears in subsequent listings
- **SC-005**: 100% of book creation attempts without a title or author are rejected with a clear message
- **SC-006**: All five specified test cases pass: create a valid book, reject without title, reject without author, remove an existing book, retrieve a non-existent book

## Clarifications

### Session 2026-06-17

- Q: What type of user interface should this application provide? → A: Web application (browser UI + backend)
- Q: What programming language and framework should be used? → A: Next.js + TypeScript + PostgreSQL
- Q: What format should book identifiers use? → A: Auto-incrementing integer
- Q: Should the remove action require user confirmation before deleting? → A: Yes, show a confirmation dialog
- Q: What should happen when title or author contains only whitespace? → A: Treat as invalid (same as empty/missing)

## Assumptions

- This is a single-user application; there is no multi-user or authentication requirement
- The wishlist is the only status for books in this MVP; no status transitions are needed
- Data is persisted in PostgreSQL
- The user interface is a web application built with Next.js (TypeScript) — browser-based frontend with Next.js API routes as the backend
- No search, filtering, or sorting capabilities are required for this MVP
- No duplicate detection is required; users may add books with the same title and author multiple times
