# Tasks: Reading Wishlist MVP

**Input**: Design documents from `/specs/001-reading-wishlist/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/api.md, research.md, quickstart.md

**Tests**: Included — TDD is mandated by the project constitution (Principle I: Test-First Development).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, tooling, and configuration

- [ ] T001 Initialize Next.js 14+ project with TypeScript and install dependencies (next, react, react-dom, prisma, @prisma/client)
- [ ] T002 [P] Configure TypeScript strict mode (no `any`, strict null checks) in tsconfig.json
- [ ] T003 [P] Configure Jest with ts-jest and @testing-library/react in jest.config.ts
- [ ] T004 [P] Configure Playwright for E2E tests in playwright.config.ts
- [ ] T005 [P] Create .env.example with DATABASE_URL template and ensure .env is in .gitignore

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Domain model, database schema, repository layer, and shared infrastructure that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T006 Create Prisma schema with Book model and BookStatus enum in prisma/schema.prisma
- [ ] T007 Run initial Prisma migration for Book table
- [ ] T008 [P] Create Prisma client singleton in src/lib/prisma.ts
- [ ] T009 [P] Create BookStatus enum in src/modules/books/domain/book-status.ts
- [ ] T010 [P] Define BookRepository interface (save, findAll, findById, deleteById) in src/modules/books/domain/book-repository.ts
- [ ] T011 Write failing unit tests for Book entity (valid creation, missing title, missing author, whitespace-only rejection, title/author trimming, default WISHLIST status) in tests/unit/modules/books/domain/book.test.ts
- [ ] T012 Implement Book domain entity with validation in src/modules/books/domain/book.ts (make T011 tests pass)
- [ ] T013 [P] Create in-memory BookRepository for unit testing in tests/helpers/in-memory-book-repository.ts
- [ ] T014 Write failing integration tests for PrismaBookRepository (save, findAll, findById, deleteById) in tests/integration/modules/books/infrastructure/prisma-book-repository.test.ts
- [ ] T015 Implement PrismaBookRepository in src/modules/books/infrastructure/prisma-book-repository.ts (make T014 tests pass)
- [ ] T016 Create Next.js root layout in src/app/layout.tsx

**Checkpoint**: Foundation ready — domain entity validated, repository tested against real PostgreSQL, user story implementation can begin

---

## Phase 3: User Story 1 — Add a Book to Wishlist (Priority: P1) 🎯 MVP

**Goal**: Users can add a book by providing title and author; the system assigns status WISHLIST and a unique ID

**Independent Test**: Add a book with valid title/author → confirm it exists with status WISHLIST and an assigned ID. Try adding without title or author → confirm rejection with clear error message.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T017 [US1] Write failing unit tests for BookService.addBook (valid creation, reject empty title, reject empty author, reject whitespace-only inputs) in tests/unit/modules/books/application/book-service.test.ts

### Implementation for User Story 1

- [ ] T018 [US1] Implement BookService.addBook use case in src/modules/books/application/book-service.ts (make T017 tests pass)
- [ ] T019 [US1] Implement POST /api/books route handler with validation and error responses in src/app/api/books/route.ts
- [ ] T020 [US1] Create AddBookForm component with title/author inputs and validation feedback in src/modules/books/presentation/add-book-form.tsx
- [ ] T021 [US1] Create wishlist page with AddBookForm in src/app/page.tsx

**Checkpoint**: User Story 1 fully functional — users can add books via the web UI, invalid inputs are rejected

---

## Phase 4: User Story 2 — List All Books (Priority: P1)

**Goal**: Users can view all books in the wishlist at a glance, with graceful empty state handling

**Independent Test**: List all books → verify each entry shows title and author. List when empty → verify empty wishlist indication.

### Tests for User Story 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T022 [US2] Add failing unit tests for BookService.listBooks (returns all books, returns empty array when no books) to tests/unit/modules/books/application/book-service.test.ts

### Implementation for User Story 2

- [ ] T023 [US2] Implement BookService.listBooks use case in src/modules/books/application/book-service.ts (make T022 tests pass)
- [ ] T024 [US2] Add GET handler to /api/books route returning `{ books: [...] }` in src/app/api/books/route.ts
- [ ] T025 [US2] Create BookList component with empty state message in src/modules/books/presentation/book-list.tsx
- [ ] T026 [US2] Integrate BookList into wishlist page in src/app/page.tsx

**Checkpoint**: User Stories 1 AND 2 functional — users can add books and see them in a list (minimum viable experience)

---

## Phase 5: User Story 3 — View Book Details (Priority: P2)

**Goal**: Users can view all stored information for a specific book (title, author, status, ID)

**Independent Test**: Select a book by ID → verify all fields displayed. Request non-existent ID → verify "not found" message.

### Tests for User Story 3

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T027 [US3] Add failing unit tests for BookService.getBook (returns book by ID, throws not-found for non-existent ID) to tests/unit/modules/books/application/book-service.test.ts

### Implementation for User Story 3

- [ ] T028 [US3] Implement BookService.getBook use case in src/modules/books/application/book-service.ts (make T027 tests pass)
- [ ] T029 [US3] Implement GET /api/books/[id] route handler with 404 handling in src/app/api/books/[id]/route.ts
- [ ] T030 [US3] Create BookDetail component displaying all book fields in src/modules/books/presentation/book-detail.tsx
- [ ] T031 [US3] Create book detail page in src/app/books/[id]/page.tsx

**Checkpoint**: User Story 3 functional — users can click a book to view its full details

---

## Phase 6: User Story 4 — Remove a Book from Wishlist (Priority: P2)

**Goal**: Users can remove a book with confirmation dialog; canceled removal keeps the book intact

**Independent Test**: Remove a book → confirm it no longer appears. Cancel removal → confirm book remains. Try removing non-existent ID → verify "not found" message.

### Tests for User Story 4

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T032 [US4] Add failing unit tests for BookService.removeBook (removes existing book, throws not-found for non-existent ID) to tests/unit/modules/books/application/book-service.test.ts

### Implementation for User Story 4

- [ ] T033 [US4] Implement BookService.removeBook use case in src/modules/books/application/book-service.ts (make T032 tests pass)
- [ ] T034 [US4] Add DELETE handler to /api/books/[id] route with 404 handling in src/app/api/books/[id]/route.ts
- [ ] T035 [US4] Create RemoveBookDialog confirmation component (confirm/cancel actions) in src/modules/books/presentation/remove-book-dialog.tsx
- [ ] T036 [US4] Integrate RemoveBookDialog into BookList and BookDetail components

**Checkpoint**: All user stories functional — full CRUD experience with confirmation on delete

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: E2E validation, cleanup, and final verification

- [ ] T037 [P] Write E2E tests for complete user flows (add book, list books, view details, remove with confirm/cancel) in tests/e2e/books-wishlist.spec.ts
- [ ] T038 Code cleanup and TypeScript strict mode compliance check across all source files
- [ ] T039 Run quickstart.md validation to verify setup and run instructions are accurate

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion
- **User Story 2 (Phase 4)**: Depends on Foundational completion; shares route file and page with US1 so best done after US1
- **User Story 3 (Phase 5)**: Depends on Foundational completion; independent of US1/US2
- **User Story 4 (Phase 6)**: Depends on Foundational completion; shares route file with US3 so best done after US3; integrates with US2/US3 components
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: No dependencies on other stories — creates `src/app/api/books/route.ts` and `src/app/page.tsx`
- **US2 (P1)**: Adds to route file and page created by US1 — independently testable but best sequenced after US1
- **US3 (P2)**: Fully independent of US1/US2 — creates `src/app/api/books/[id]/route.ts` and `src/app/books/[id]/page.tsx`
- **US4 (P2)**: Adds DELETE to route file created by US3 — integrates RemoveBookDialog into US2/US3 components

### Recommended Execution Order

```
Phase 1 → Phase 2 → US1 → US2 → US3 → US4 → Phase 7
```

### Within Each User Story

1. Tests MUST be written and FAIL before implementation (TDD)
2. Service layer before API routes
3. API routes before presentation components
4. Components before page integration

### Parallel Opportunities

- **Phase 1**: T002, T003, T004, T005 can all run in parallel
- **Phase 2**: T008, T009, T010 can run in parallel; T013 can run in parallel with T011-T012
- **Phase 2**: T011 → T012 (test-first), T014 → T015 (test-first) are sequential pairs
- **Phase 3-6**: US3 can start in parallel with US1/US2 if the route file conflict is managed
- **Phase 7**: T037 and T038 can run in parallel

---

## Parallel Example: User Story 1

```text
# Sequential TDD flow:
T017: Write failing tests for BookService.addBook
T018: Implement BookService.addBook (make tests pass)
T019: Implement POST /api/books route
T020: Create AddBookForm component
T021: Wire AddBookForm into page
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (Add a Book)
4. Complete Phase 4: User Story 2 (List All Books)
5. **STOP and VALIDATE**: Users can add and list books — minimum viable experience
6. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 → Test independently → Users can add books
3. Add US2 → Test independently → Users can add AND list books (MVP!)
4. Add US3 → Test independently → Users can view book details
5. Add US4 → Test independently → Users can remove books with confirmation
6. Polish → E2E tests, cleanup → Production-ready

### Parallel Team Strategy

With multiple developers after Foundational is complete:

- **Developer A**: US1 → US2 (share route file and page)
- **Developer B**: US3 → US4 (share route file and detail page)
- Stories integrate independently

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps each task to its user story for traceability
- TDD enforced: write failing tests before every implementation task
- Book entity and repository are foundational — shared by all stories
- BookService grows incrementally: each story adds a method
- Commit after each task or logical TDD pair (test + implementation)
- Stop at any checkpoint to validate the story independently
