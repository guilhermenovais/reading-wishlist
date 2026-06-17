# Tasks: Reading Progress

**Input**: Design documents from `specs/005-reading-progress/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md

**Tests**: Included per constitution principle I (Test-First Development). Tests are written and must FAIL before implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup

**Purpose**: Database schema changes and migration

- [x] T001 Update Prisma schema to add READING enum value to BookStatus and readingStartDate DateTime? field to Book model, then generate migration in prisma/schema.prisma

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Domain entity changes, repository interface and implementations that ALL user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Add READING value to BookStatus enum in src/modules/books/domain/book-status.ts
- [x] T003 [P] Add readingStartDate field and startReading() method to Book entity in src/modules/books/domain/book.ts
- [x] T004 [P] Add update() and findByStatus() method signatures to BookRepository interface in src/modules/books/domain/book-repository.ts
- [x] T005 [P] Implement update() and findByStatus() methods on PrismaBookRepository in src/modules/books/infrastructure/prisma-book-repository.ts
- [x] T006 [P] Implement update() and findByStatus() methods on InMemoryBookRepository in tests/helpers/in-memory-book-repository.ts

**Checkpoint**: Foundation ready — domain entity supports READING status, repository can update books and query by status. User story implementation can now begin.

---

## Phase 3: User Story 1 — Start Reading a Book (Priority: P1) MVP

**Goal**: Allow users to transition a book from WISHLIST to READING status via a single action on the book detail page.

**Independent Test**: Select a book with WISHLIST status, click "Start Reading", confirm status changes to READING with a reading start date automatically recorded. Verify that attempting to start a book already in READING status is rejected.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T007 [P] [US1] Write unit tests for Book.startReading() domain method (valid transition, reject non-WISHLIST, readingStartDate set) in tests/unit/modules/books/domain/book-start-reading.test.ts
- [x] T008 [P] [US1] Write unit tests for BookService.startReading() (delegates to domain, calls repository update, handles not-found) in tests/unit/modules/books/application/book-service.test.ts
- [x] T009 [P] [US1] Write integration tests for PrismaBookRepository.update() (persists status and readingStartDate) in tests/integration/modules/books/infrastructure/prisma-book-repository.test.ts

### Implementation for User Story 1

- [x] T010 [US1] Implement startReading() method on BookService in src/modules/books/application/book-service.ts
- [x] T011 [US1] Create PATCH /api/books/[id]/start-reading route handler in src/app/api/books/[id]/start-reading/route.ts
- [x] T012 [US1] Add "Start Reading" button (visible when WISHLIST), status display, and readingStartDate to book detail page in src/modules/books/presentation/book-detail.tsx

**Checkpoint**: Users can start reading a wishlist book. Status changes to READING with automatic date. Invalid transitions are rejected. This is the MVP.

---

## Phase 4: User Story 2 — List Books Currently Being Read (Priority: P1)

**Goal**: Allow users to view a dedicated reading list showing only books with READING status.

**Independent Test**: Start one or more books, navigate to the reading list page, verify only READING books appear. Verify empty state when no books are being read.

### Tests for User Story 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T013 [P] [US2] Write unit tests for BookService.listReadingBooks() (returns only READING books, empty list) in tests/unit/modules/books/application/book-service.test.ts
- [x] T014 [P] [US2] Write integration tests for PrismaBookRepository.findByStatus() (filters by READING, returns empty for no matches) in tests/integration/modules/books/infrastructure/prisma-book-repository.test.ts

### Implementation for User Story 2

- [x] T015 [US2] Implement listReadingBooks() method on BookService in src/modules/books/application/book-service.ts
- [x] T016 [US2] Add optional status query parameter filter to GET /api/books route in src/app/api/books/route.ts
- [x] T017 [US2] Create reading list page with empty state at src/app/reading/page.tsx
- [x] T018 [US2] Add "Reading" navigation link to app layout in src/app/layout.tsx

**Checkpoint**: Users can view their reading list filtered to only currently-reading books. Empty state displayed when no books are being read.

---

## Phase 5: User Story 3 — View Book Status (Priority: P2)

**Goal**: Display the current status and reading start date on book detail and book list views for all books regardless of status.

**Independent Test**: View a READING book's details and verify status and readingStartDate are displayed. View a WISHLIST book's details and verify status is shown with no readingStartDate.

### Implementation for User Story 3

- [x] T019 [US3] Add readingStartDate to GET /api/books/[id] response in src/app/api/books/[id]/route.ts
- [x] T020 [US3] Show status badge and readingStartDate on book list cards in src/modules/books/presentation/book-list.tsx

**Checkpoint**: All user stories are independently functional. Status and dates are visible across all book views.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: End-to-end validation and cross-story integration testing

- [x] T021 [P] Write E2E tests for complete reading progress flow (start reading + verify detail + reading list) in tests/e2e/reading-progress.spec.ts
- [x] T022 Run quickstart.md validation to verify the full feature flow end-to-end

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion
- **User Story 2 (Phase 4)**: Depends on Foundational phase completion — can run in parallel with US1
- **User Story 3 (Phase 5)**: Depends on Foundational phase completion — can run in parallel with US1/US2
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) — no dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) — independent of US1
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) — independent of US1/US2, but benefits from US1 being complete (READING books available to view)

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Service methods before API routes
- API routes before UI components
- Story complete before moving to next priority

### Parallel Opportunities

- T003 and T004 can run in parallel (different files, both depend on T002)
- T005 and T006 can run in parallel (different files, both depend on T004)
- All tests within a story marked [P] can run in parallel
- Once Foundational completes, all three user stories can start in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task T007: "Unit tests for Book.startReading() in tests/unit/modules/books/domain/book-start-reading.test.ts"
Task T008: "Unit tests for BookService.startReading() in tests/unit/modules/books/application/book-service.test.ts"
Task T009: "Integration tests for PrismaBookRepository.update() in tests/integration/modules/books/infrastructure/prisma-book-repository.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (Prisma migration)
2. Complete Phase 2: Foundational (domain + repository changes)
3. Complete Phase 3: User Story 1 (start reading action)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational -> Foundation ready
2. Add User Story 1 -> Test independently -> Deploy/Demo (MVP!)
3. Add User Story 2 -> Test independently -> Deploy/Demo
4. Add User Story 3 -> Test independently -> Deploy/Demo
5. Each story adds value without breaking previous stories

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
