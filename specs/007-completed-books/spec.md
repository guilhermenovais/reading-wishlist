# Feature Specification: Completed Books

**Feature Branch**: `007-completed-books`  
**Created**: 2026-06-18  
**Status**: Draft  
**Input**: User description: "Create a Completed section on the app. Add a way to move books from Reading to Completed. When moving to completed, the user should be able to select a completion date (default: current date)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Mark Book as Completed (Priority: P1)

A user who has finished reading a book navigates to the book's detail page and marks it as completed. The system prompts them to select a completion date, defaulting to today's date. After confirming, the book moves from "Reading" status to "Completed" status with the selected date recorded.

**Why this priority**: This is the core action of the feature — without the ability to mark books as completed, no other part of the feature functions.

**Independent Test**: Can be fully tested by navigating to any book with "Reading" status, clicking the "Mark as Completed" action, selecting a date, and confirming. The book's status changes to "COMPLETED" and the completion date is stored.

**Acceptance Scenarios**:

1. **Given** a book with status "READING", **When** the user clicks "Mark as Completed" and confirms with the default date (today), **Then** the book's status changes to "COMPLETED" and the completion date is recorded as today's date.
2. **Given** a book with status "READING", **When** the user clicks "Mark as Completed" and selects a past date, **Then** the book's status changes to "COMPLETED" and the selected date is recorded as the completion date.
3. **Given** a book with status "WISHLIST", **When** the user views the book detail page, **Then** no "Mark as Completed" action is available (only "Start Reading" is shown).
4. **Given** a book with status "COMPLETED", **When** the user views the book detail page, **Then** no "Mark as Completed" action is available.

---

### User Story 2 - View Completed Books List (Priority: P2)

A user wants to see all books they have finished reading. They navigate to the "Completed" section via the main navigation. The page displays all completed books with their title, author, and completion date.

**Why this priority**: Viewing completed books is the primary reason the Completed section exists — it provides the user a sense of accomplishment and a record of reading history.

**Independent Test**: Can be fully tested by navigating to the "Completed" page and verifying it lists all books with "COMPLETED" status, showing each book's title, author, and completion date.

**Acceptance Scenarios**:

1. **Given** there are books with status "COMPLETED", **When** the user navigates to the Completed page, **Then** all completed books are displayed with title, author, and completion date.
2. **Given** there are no completed books, **When** the user navigates to the Completed page, **Then** a message indicates no books have been completed yet.
3. **Given** the Completed page is loaded, **When** the user clicks on a book title, **Then** they are navigated to the book's detail page.

---

### User Story 3 - View Completion Date on Book Detail (Priority: P3)

A user viewing a completed book's detail page can see when they finished reading it. The completion date is displayed alongside the other book metadata.

**Why this priority**: Enhances the book detail view with completion information, completing the data lifecycle for a book that has been read.

**Independent Test**: Can be fully tested by viewing the detail page of a completed book and verifying the completion date is displayed.

**Acceptance Scenarios**:

1. **Given** a book with status "COMPLETED" and a completion date, **When** the user views the book detail page, **Then** the completion date is displayed in the metadata section.
2. **Given** a book with status "READING" (not yet completed), **When** the user views the book detail page, **Then** no completion date is shown.

---

### Edge Cases

- What happens when the user selects a completion date in the future? The system should not allow future dates — the latest selectable date is today.
- What happens when the user selects a completion date before the reading start date? The system should not allow a completion date earlier than the reading start date.
- What happens when the user cancels the completion action? The book remains in "Reading" status with no changes.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST add a "COMPLETED" status to the existing book status options (currently "WISHLIST" and "READING").
- **FR-002**: System MUST provide a "Mark as Completed" action on the book detail page for books with "READING" status only.
- **FR-003**: System MUST present a date picker when marking a book as completed, defaulting to the current date.
- **FR-004**: System MUST validate that the completion date is not in the future.
- **FR-005**: System MUST validate that the completion date is not earlier than the book's reading start date.
- **FR-006**: System MUST store the completion date when a book is marked as completed.
- **FR-007**: System MUST provide a "Completed" page accessible from the main navigation that lists all books with "COMPLETED" status.
- **FR-008**: Each book on the Completed page MUST display the title, author, and completion date.
- **FR-009**: Each book on the Completed page MUST link to its detail page.
- **FR-010**: The book detail page MUST display the completion date for books with "COMPLETED" status.
- **FR-011**: The "Completed" navigation link MUST appear in the main navigation alongside "Wishlist", "Reading", and "Search".

### Key Entities

- **Book**: Extended with a new status value ("COMPLETED") and a new attribute (completion date) to record when the user finished reading.
- **BookStatus**: Extended from two values (WISHLIST, READING) to three values (WISHLIST, READING, COMPLETED).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can mark a book as completed and select a date in under 30 seconds.
- **SC-002**: The Completed page displays all finished books within 3 seconds of navigation.
- **SC-003**: 100% of completed books show the correct completion date on both the list and detail views.
- **SC-004**: Users cannot select an invalid completion date (future dates or dates before reading start).

## Assumptions

- Only books currently in "READING" status can be moved to "COMPLETED". There is no direct path from "WISHLIST" to "COMPLETED".
- The completion date is a calendar date (not a timestamp) — time-of-day precision is not needed.
- The existing book detail page pattern (used for "Start Reading") will be followed for the "Mark as Completed" interaction.
- The Completed page follows the same layout and styling patterns as the existing Reading page.
- The navigation order will be: Wishlist, Reading, Completed, Search.
