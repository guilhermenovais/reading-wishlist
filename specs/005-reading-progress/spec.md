# Feature Specification: Reading Progress

**Feature Branch**: `005-reading-progress`  
**Created**: 2026-06-17  
**Status**: Draft  
**Input**: User description: "Allow users to track books they have started reading by moving books from Wishlist to Reading status"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Start Reading a Book (Priority: P1)

As a user, I want to move a book from my wishlist to a "Reading" status, so that I can track which books I am actively reading.

**Why this priority**: This is the core action of the feature. Without the ability to transition a book to Reading status, no other reading progress functionality has value.

**Independent Test**: Can be fully tested by selecting a book with WISHLIST status, starting it, and confirming its status changes to READING with a reading start date automatically recorded.

**Acceptance Scenarios**:

1. **Given** a book exists with status "WISHLIST", **When** the user initiates "start reading" on that book, **Then** the book's status changes to "READING" and a reading start date is automatically set to the current date
2. **Given** a book exists with status "READING", **When** the user attempts to start reading it again, **Then** the system rejects the action and informs the user the book is already being read
3. **Given** no book exists with the provided identifier, **When** the user attempts to start reading it, **Then** the system informs the user that the book was not found

---

### User Story 2 - List Books Currently Being Read (Priority: P1)

As a user, I want to view all books I am currently reading, so that I can see my active reading list at a glance.

**Why this priority**: Viewing the reading list is the primary way users interact with their reading progress. Tied with starting a book as the minimum viable experience for this feature.

**Independent Test**: Can be fully tested by listing books with READING status and verifying only books currently being read are displayed.

**Acceptance Scenarios**:

1. **Given** one or more books have status "READING", **When** the user requests the reading list, **Then** only books with status "READING" are displayed
2. **Given** no books have status "READING", **When** the user requests the reading list, **Then** the system indicates there are no books currently being read
3. **Given** books exist in both "WISHLIST" and "READING" statuses, **When** the user requests the reading list, **Then** only "READING" books are shown, not "WISHLIST" books

---

### User Story 3 - View Book Status (Priority: P2)

As a user, I want to view the current status and related dates of any book, so that I can understand where each book stands in my reading journey.

**Why this priority**: Viewing status details enriches the user experience but is secondary to the core transition and listing capabilities.

**Independent Test**: Can be fully tested by viewing a book's details and verifying the status and reading start date (if applicable) are displayed.

**Acceptance Scenarios**:

1. **Given** a book exists with status "READING", **When** the user views its details, **Then** the status "READING" and the reading start date are displayed
2. **Given** a book exists with status "WISHLIST", **When** the user views its details, **Then** the status "WISHLIST" is displayed and no reading start date is shown
3. **Given** no book exists with the provided identifier, **When** the user views its details, **Then** the system informs the user that the book was not found

---

### Edge Cases

- What happens when a user tries to start reading a book that is already in "READING" status? The system should reject the action and inform the user the book is already being read.
- What happens when a user tries to start reading a book that does not exist? The system should respond with a "not found" message.
- What happens when there are no books in any status and the user requests the reading list? The system should gracefully indicate the reading list is empty.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to transition a book's status from "WISHLIST" to "READING"
- **FR-002**: System MUST automatically set the reading start date to the current date when a book transitions to "READING" status
- **FR-003**: System MUST reject status transitions for books that are not in "WISHLIST" status, informing the user that only wishlist books can be started
- **FR-004**: System MUST reject status transitions for books that are already in "READING" status, informing the user the book is already being read
- **FR-005**: System MUST allow users to view a list of all books with "READING" status
- **FR-006**: System MUST display the reading start date when showing details of a book in "READING" status
- **FR-007**: System MUST return a "not found" indication when a user attempts to start reading a non-existent book

### Key Entities

- **Book** (updated): Extends the existing Book entity with a new optional attribute: reading start date. Adds the "READING" status alongside the existing "WISHLIST" status.
- **Status**: Represents the lifecycle state of a book. Valid values: "WISHLIST" (initial, set on creation), "READING" (set when user starts reading).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can move a book from wishlist to reading status in a single action
- **SC-002**: The reading start date is automatically recorded with 100% accuracy when a book transitions to reading
- **SC-003**: Users can view their reading list filtered to only currently-reading books in a single action
- **SC-004**: 100% of attempts to start reading a non-wishlist book are rejected with a clear message
- **SC-005**: Book details display the correct status and associated dates for all books regardless of status
- **SC-006**: All specified test cases pass: valid status transition, automatic start date assignment, rejection of starting a book already being read

## Assumptions

- This feature builds upon the existing Reading Wishlist (Stage 1) — books already exist with the "WISHLIST" status and unique identifiers
- This is a single-user application; no multi-user or authentication requirements apply
- The status transition is one-directional for this stage: WISHLIST to READING only (no reverse transition)
- No additional statuses beyond WISHLIST and READING are introduced in this stage
- The reading start date is set automatically by the system and cannot be manually edited by the user
- The existing book listing (all books) continues to work alongside the new reading-only list
- No reading progress percentage or page tracking is included in this stage
