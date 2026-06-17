# Tasks: Open Library Integration

**Input**: Design documents from `/specs/002-open-library-integration/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/api.md

**Tests**: Included — TDD workflow enforced by constitution principle I (Test-First Development).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Database migration and shared domain extensions needed before any user story

- [X] T001 Extend Prisma schema with nullable `isbn` (String?) and `publicationYear` (Int?) columns in `prisma/schema.prisma`
- [X] T002 Run `npx prisma migrate dev` to generate and apply the migration for the new columns
- [X] T003 Extend the Book domain entity with optional `isbn` and `publicationYear` fields and add `Book.createFromImport()` factory method in `src/modules/books/domain/book.ts`
- [X] T004 Extend the `BookRepository` interface with `findByIsbn(isbn: string): Promise<Book | null>` in `src/modules/books/domain/book-repository.ts`
- [X] T005 [P] Define `SearchResult` value object and `BookSearchProvider` interface with `searchByTitle(title: string): Promise<SearchResult[]>` in `src/modules/books/domain/book-search-provider.ts`
- [X] T006 Extend `Book.reconstitute()` to accept `isbn` and `publicationYear` in `src/modules/books/domain/book.ts`

**Checkpoint**: Schema migrated, domain layer extended — ready for user story implementation.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Infrastructure implementations that MUST be complete before user stories can work end-to-end

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T007 Extend `PrismaBookRepository` to persist and hydrate `isbn` and `publicationYear` fields, and implement `findByIsbn()` in `src/modules/books/infrastructure/prisma-book-repository.ts`
- [X] T008 Extend the in-memory book repository test helper with `isbn`, `publicationYear` support and `findByIsbn()` in `tests/helpers/in-memory-book-repository.ts`

**Checkpoint**: Foundation ready — user story implementation can now begin.

---

## Phase 3: User Story 1 — Search Books by Title (Priority: P1) 🎯 MVP

**Goal**: Users can search for books by title via the Open Library API and see up to 10 results with title, author, publication year, and ISBN.

**Independent Test**: Navigate to `/search`, enter a title, verify matching results display with all fields. Verify empty results message. Verify error message when API is unavailable.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T009 [P] [US1] Write unit tests for `SearchService.searchByTitle()` in `tests/unit/modules/books/application/search-service.test.ts` — test successful search, empty results, and provider error propagation
- [X] T010 [P] [US1] Write integration tests for `OpenLibrarySearchProvider` in `tests/integration/modules/books/infrastructure/open-library-search-provider.test.ts` — test response mapping (title, author array→string, first_publish_year, isbn array→ISBN-13), missing fields, and HTTP error handling

### Implementation for User Story 1

- [X] T011 [US1] Implement `OpenLibrarySearchProvider` HTTP client in `src/modules/books/infrastructure/open-library-search-provider.ts` — call `https://openlibrary.org/search.json?title={query}&fields=title,author_name,first_publish_year,isbn&limit=10`, map response to `SearchResult[]`
- [X] T012 [US1] Implement `SearchService` with `searchByTitle(title: string)` use case in `src/modules/books/application/search-service.ts` — delegates to `BookSearchProvider`
- [X] T013 [US1] Implement `GET /api/search?title=...` route in `src/app/api/search/route.ts` — validate title param (400 if missing), call `SearchService`, return results (200) or error (502 if provider fails)
- [X] T014 [P] [US1] Create `SearchForm` component in `src/modules/books/presentation/search-form.tsx` — text input, submit button, empty-input validation
- [X] T015 [P] [US1] Create `SearchResults` component in `src/modules/books/presentation/search-results.tsx` — display results list with title, author, publicationYear, isbn; show "no results" message; show error message
- [X] T016 [US1] Create `/search` page in `src/app/search/page.tsx` — compose `SearchForm` and `SearchResults`, wire fetch to `/api/search`, handle loading/error/empty states
- [X] T017 [US1] Add navigation link from the wishlist page to `/search` in `src/app/page.tsx`

**Checkpoint**: User Story 1 fully functional — users can search books and see results.

---

## Phase 4: User Story 2 — Import a Book to Wishlist (Priority: P1)

**Goal**: Users can select a search result and add it to their wishlist with all fields populated. Duplicate ISBN detection prevents re-importing the same book.

**Independent Test**: Search for a book, click import, verify it appears in the wishlist with correct fields and status "WISHLIST". Try importing the same ISBN again — verify duplicate is prevented. Import a book without ISBN — verify it succeeds.

### Tests for User Story 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T018 [P] [US2] Write unit tests for `BookService.importBook()` in `tests/unit/modules/books/application/book-service.test.ts` — test successful import, duplicate ISBN rejection, import without ISBN allowed, import without publicationYear allowed
- [X] T019 [P] [US2] Write unit tests for `Book.createFromImport()` in `tests/unit/modules/books/domain/book-import.test.ts` — test creation with all fields, with optional fields missing, validation rules (VR-004, VR-005)
- [X] T020 [P] [US2] Write integration tests for `PrismaBookRepository.findByIsbn()` in `tests/integration/modules/books/infrastructure/prisma-book-repository.test.ts` — test find existing ISBN, find non-existent ISBN, persist and retrieve isbn/publicationYear fields

### Implementation for User Story 2

- [X] T021 [US2] Implement `BookService.importBook()` with duplicate ISBN check in `src/modules/books/application/book-service.ts` — call `findByIsbn()`, reject if duplicate, otherwise `Book.createFromImport()` and save
- [X] T022 [US2] Extend `POST /api/books` route to accept optional `isbn` and `publicationYear` fields and return 409 on duplicate ISBN in `src/app/api/books/route.ts`
- [X] T023 [US2] Add import button to each search result in `src/modules/books/presentation/search-results.tsx` — call `POST /api/books`, mark imported books as "already added", show duplicate ISBN error message
- [X] T024 [US2] Extend `GET /api/books` response to include `isbn` and `publicationYear` in `src/app/api/books/route.ts`
- [X] T025 [US2] Extend book list display to show isbn and publicationYear if present in `src/modules/books/presentation/book-list.tsx`

**Checkpoint**: User Stories 1 AND 2 fully functional — users can search and import books into their wishlist with duplicate protection.

---

## Phase 5: User Story 3 — View Imported Book Details (Priority: P2)

**Goal**: Users can view full details of an imported book including ISBN and publication year.

**Independent Test**: View details of a previously imported book — verify ISBN and publication year are displayed. View a book with missing fields — verify graceful "not available" indication.

### Tests for User Story 3

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T026 [P] [US3] Write unit/component tests for extended `BookDetail` in `tests/unit/modules/books/presentation/book-detail.test.ts` (if presentation tests exist) — test display with all fields, display with missing isbn/publicationYear

### Implementation for User Story 3

- [X] T027 [US3] Extend `BookDetail` component to display ISBN and publication year (with "Not available" for missing fields) in `src/modules/books/presentation/book-detail.tsx`
- [X] T028 [US3] Extend `GET /api/books/:id` response to include `isbn` and `publicationYear` in `src/app/api/books/[id]/route.ts`

**Checkpoint**: All user stories independently functional — full search, import, and detail view flow complete.

---

## Phase 6: E2E & Polish

**Purpose**: End-to-end validation and cross-cutting concerns

- [X] T029 Write E2E test for search-and-import flow in `tests/e2e/book-search.spec.ts` — search for a book, import it, verify it appears in wishlist, verify duplicate detection
- [X] T030 Verify existing E2E tests in `tests/e2e/books-wishlist.spec.ts` still pass (no regression from schema changes)
- [X] T031 Run quickstart.md validation — follow all steps and verify the feature works end-to-end

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Phase 2 completion
- **User Story 2 (Phase 4)**: Depends on Phase 2 completion. Can start in parallel with US1 but import UI (T023) integrates with search results (T015)
- **User Story 3 (Phase 5)**: Depends on Phase 2 completion. Fully independent of US1/US2
- **E2E & Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (Search)**: Independent after Phase 2. No dependencies on other stories.
- **US2 (Import)**: Logically follows US1 (import button lives in search results). Can be developed in parallel but integration requires US1's search page.
- **US3 (Details)**: Fully independent. Only requires the extended domain model from Phase 1/2.

### Within Each User Story

1. Tests MUST be written and FAIL before implementation
2. Domain/infrastructure before application services
3. Application services before API routes
4. API routes before presentation components
5. Story complete before moving to next priority

### Parallel Opportunities

- T005 (BookSearchProvider interface) can run in parallel with T003/T004
- T009 and T010 (US1 tests) can run in parallel
- T014 and T015 (US1 presentation components) can run in parallel
- T018, T019, and T020 (US2 tests) can run in parallel
- US3 can be implemented entirely in parallel with US1/US2 (after Phase 2)

---

## Parallel Example: User Story 1

```bash
# Launch US1 tests in parallel:
Task T009: "Unit tests for SearchService in tests/unit/modules/books/application/search-service.test.ts"
Task T010: "Integration tests for OpenLibrarySearchProvider in tests/integration/modules/books/infrastructure/open-library-search-provider.test.ts"

# Launch US1 presentation components in parallel (after API route is done):
Task T014: "SearchForm component in src/modules/books/presentation/search-form.tsx"
Task T015: "SearchResults component in src/modules/books/presentation/search-results.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup (schema migration + domain extensions)
2. Complete Phase 2: Foundational (repository implementation)
3. Complete Phase 3: User Story 1 — Search
4. Complete Phase 4: User Story 2 — Import
5. **STOP and VALIDATE**: Test search-and-import flow end-to-end
6. Deploy/demo if ready — core value proposition delivered

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Search works
3. Add User Story 2 → Test independently → Import works (MVP!)
4. Add User Story 3 → Test independently → Details enhanced
5. E2E & Polish → Full validation
6. Each story adds value without breaking previous stories

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (TDD — constitution principle I)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
