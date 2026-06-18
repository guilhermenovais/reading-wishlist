# Tasks: Completed Books

**Input**: Design documents from `specs/007-completed-books/`
**Prerequisites**: plan.md, spec.md, data-model.md, research.md, quickstart.md, contracts/api.md

**Tests**: Included per Constitution I (Test-First Development). Domain rules and service methods have unit tests written before implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup

**Purpose**: Database schema changes required by all subsequent phases

- [x] T001 Add COMPLETED enum value, completionDate and coverImageUrl columns to Book via Prisma migration in prisma/schema.prisma

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Domain, repository, and import flow changes that MUST be complete before ANY user story can be implemented

**Warning**: No user story work can begin until this phase is complete

- [x] T002 Add COMPLETED value to BookStatus enum in src/modules/books/domain/book-status.ts
- [x] T003 Add completionDate and coverImageUrl properties to Book domain entity in src/modules/books/domain/book.ts
- [x] T004 Write integration tests for completionDate and coverImageUrl persistence in tests/integration/modules/books/infrastructure/prisma-book-repository.test.ts
- [x] T005 Update toBook() mapper, update(), and save() to include completionDate and coverImageUrl in src/modules/books/infrastructure/prisma-book-repository.ts
- [x] T006 [P] Update importBook() to accept and persist coverImageUrl in src/modules/books/application/book-service.ts and src/app/api/books/route.ts
- [x] T007 [P] Add completionDate and coverImageUrl to GET response in src/app/api/books/[id]/route.ts

**Checkpoint**: Foundation ready — domain entity has new fields, repository persists them, import stores cover images, detail API returns new fields. User story implementation can now begin.

---

## Phase 3: User Story 1 — Mark Book as Completed (Priority: P1) MVP

**Goal**: Users can mark a READING book as completed with a selectable completion date via a modal dialog on the book detail page.

**Independent Test**: Navigate to any book with READING status, click "Mark as Completed", select a date in the modal, confirm. Book status changes to COMPLETED with the selected completion date stored.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T008 [P] [US1] Write unit tests for markAsCompleted() domain method (status validation, date constraints, immutable return) in tests/unit/modules/books/domain/book-mark-completed.test.ts
- [x] T009 [P] [US1] Write unit tests for bookService.markAsCompleted() (fetch, delegate to domain, persist) in tests/unit/modules/books/application/book-service.test.ts

### Implementation for User Story 1

- [x] T010 [US1] Implement markAsCompleted(completionDate) domain method with status and date validation in src/modules/books/domain/book.ts
- [x] T011 [US1] Implement markAsCompleted(id, completionDate) service method in src/modules/books/application/book-service.ts
- [x] T012 [US1] Create PATCH endpoint with request validation and error responses in src/app/api/books/[id]/mark-completed/route.ts
- [x] T013 [P] [US1] Create MarkCompletedDialog component with native dialog element and date input (min=readingStartDate, max=today) in src/modules/books/presentation/mark-completed-dialog.tsx
- [x] T014 [US1] Add "Mark as Completed" button (visible only for READING status) and wire MarkCompletedDialog in src/modules/books/presentation/book-detail.tsx

**Checkpoint**: User Story 1 fully functional — a READING book can be marked as completed with a validated date. Run unit tests to confirm domain rules and service logic pass.

---

## Phase 4: User Story 2 — View Completed Books List (Priority: P2)

**Goal**: Users can navigate to a Completed page via main navigation and see all completed books with cover thumbnail, title, author, and completion date, sorted newest first.

**Independent Test**: Navigate to the "Completed" link in the nav bar. Page displays all COMPLETED books with cover image, title, author, and completion date. Clicking a book title navigates to its detail page. Empty state message shown when no completed books exist.

### Tests for User Story 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T015 [P] [US2] Write unit test for listCompletedBooks() service method in tests/unit/modules/books/application/book-service.test.ts

### Implementation for User Story 2

- [x] T016 [US2] Implement listCompletedBooks() service method in src/modules/books/application/book-service.ts
- [x] T017 [US2] Add COMPLETED status filter with completionDate descending sort to GET /api/books in src/app/api/books/route.ts
- [x] T018 [P] [US2] Create CompletedBookList component with cover thumbnails, title, author, completion date, and empty state in src/modules/books/presentation/completed-book-list.tsx
- [x] T019 [US2] Create Completed page that fetches and displays completed books in src/app/completed/page.tsx
- [x] T020 [US2] Add "Completed" navigation link between "Reading" and "Search" in src/app/layout.tsx

**Checkpoint**: User Story 2 fully functional — Completed page accessible from nav, shows all completed books sorted by completion date descending, links to detail pages.

---

## Phase 5: User Story 3 — View Completion Date on Book Detail (Priority: P3)

**Goal**: The book detail page displays the completion date for completed books in the metadata section.

**Independent Test**: View the detail page of a COMPLETED book — the completion date is shown. View a READING book — no completion date is shown.

### Implementation for User Story 3

- [x] T021 [US3] Display completion date in metadata section (only for COMPLETED status) in src/modules/books/presentation/book-detail.tsx

**Checkpoint**: All user stories independently functional — mark as completed, view completed list, and see completion date on detail page.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: End-to-end validation across all user stories

- [x] T022 Write E2E tests covering mark-as-completed flow, completed page navigation, and completion date display in tests/e2e/completed-books.spec.ts
- [x] T023 Run quickstart.md validation (migrate, start app, walk through feature flow)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational — can start after Phase 2
- **User Story 2 (Phase 4)**: Depends on Foundational — can start after Phase 2 (parallel with US1 if staffed)
- **User Story 3 (Phase 5)**: Depends on Foundational — can start after Phase 2 (parallel with US1/US2 if staffed)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies on other stories. Core action of the feature.
- **User Story 2 (P2)**: No dependencies on US1 (just needs COMPLETED books in DB, which can be seeded). Independently testable.
- **User Story 3 (P3)**: No dependencies on US1 or US2. Only needs a COMPLETED book to exist.

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Domain methods before service methods
- Service methods before API endpoints
- API endpoints before UI components
- Dialog/component before page integration

### Parallel Opportunities

- Phase 2: T006 + T007 can run in parallel (different files)
- Phase 3: T008 + T009 (test files) in parallel; T013 (dialog) can be built in parallel with T012 (API endpoint)
- Phase 4: T015 (test) + T018 (component) can run in parallel; T019 + T020 are independent files
- All three user stories can be worked on in parallel after Phase 2 is complete

---

## Parallel Example: User Story 1

```text
# After Phase 2 is complete, launch US1 tests in parallel:
Task T008: "Unit tests for markAsCompleted() domain method in tests/unit/.../book-mark-completed.test.ts"
Task T009: "Unit tests for bookService.markAsCompleted() in tests/unit/.../book-service.test.ts"

# After domain + service + API are done, build UI in parallel:
Task T012: "PATCH endpoint in src/app/api/books/[id]/mark-completed/route.ts"
Task T013: "MarkCompletedDialog component in src/modules/books/presentation/mark-completed-dialog.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (migration)
2. Complete Phase 2: Foundational (domain + repo + import changes)
3. Complete Phase 3: User Story 1 (mark as completed)
4. **STOP and VALIDATE**: Mark a reading book as completed, verify status change and date storage
5. Deploy/demo if ready — core feature is functional

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy (MVP: users can mark books completed)
3. Add User Story 2 → Test independently → Deploy (users can view completed books page)
4. Add User Story 3 → Test independently → Deploy (completion date on detail page)
5. Polish → E2E tests + full validation

### Parallel Team Strategy

With multiple developers after Foundational phase:

1. Developer A: User Story 1 (mark as completed)
2. Developer B: User Story 2 (completed books page)
3. Developer C: User Story 3 (completion date display)
4. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks in the same phase
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Verify tests fail before implementing (Constitution I)
- Domain methods enforce all business rules (Constitution II)
- Native `<dialog>` and `<input type="date">` — no new dependencies (Research R3, R4)
- coverImageUrl stored at import time to avoid external API dependency (Research R1)
- Commit after each task or logical group
