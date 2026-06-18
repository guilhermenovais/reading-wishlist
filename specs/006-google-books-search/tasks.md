# Tasks: Google Books Search

**Input**: Design documents from `/specs/006-google-books-search/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/search-api.md, quickstart.md

**Tests**: Included per project constitution (Principle I: Test-First Development). Tests are written before implementation and must fail before the corresponding implementation task.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Environment configuration for Google Books API integration

- [x] T001 Add GOOGLE_BOOKS_API_KEY to .env.example and .env configuration

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Domain interface extension required by all user stories

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Add coverImageUrl field to SearchResult interface in src/modules/books/domain/book-search-provider.ts
- [x] T003 Update search service unit test fixtures with coverImageUrl in tests/unit/modules/books/application/search-service.test.ts

**Checkpoint**: Foundation ready - SearchResult interface extended, existing tests green with updated fixtures

---

## Phase 3: User Story 1 - Search Books Using Google Books (Priority: P1) MVP

**Goal**: Replace Open Library with Google Books as the search data source so users get results from Google Books API

**Independent Test**: Enter a book title on /search, verify results display title, author, publication year, and ISBN sourced from Google Books

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T004 [P] [US1] Write integration tests for GoogleBooksSearchProvider (success, empty results, missing fields, API error, missing API key, HTTP-to-HTTPS cover URL rewrite) in tests/integration/modules/books/infrastructure/google-books-search-provider.test.ts

### Implementation for User Story 1

- [x] T005 [US1] Implement GoogleBooksSearchProvider with Google Books API mapping in src/modules/books/infrastructure/google-books-search-provider.ts
- [x] T006 [US1] Wire GoogleBooksSearchProvider replacing OpenLibrarySearchProvider in src/app/api/search/route.ts
- [x] T007 [P] [US1] Update search page description text from Open Library to Google Books in src/app/search/page.tsx

**Checkpoint**: Search returns results from Google Books. Integration tests pass. Existing import flow still works.

---

## Phase 4: User Story 2 - Import a Book from Google Books Results (Priority: P1)

**Goal**: Ensure users can import books from Google Books search results into their wishlist with all fields correctly populated

**Independent Test**: Search for a book, select a result, verify it appears in the wishlist with correct title, author, publication year, ISBN, and status WISHLIST

### Tests for User Story 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T008 [US2] Update E2E tests for search-and-import flow with Google Books data (search, import, duplicate detection, missing fields) in tests/e2e/book-search.spec.ts

### Implementation for User Story 2

No new implementation code required. The import flow (POST /api/books, SearchService, BookService) is unchanged from feature 002. This phase validates that the existing import mechanism works correctly with Google Books data through E2E tests.

**Checkpoint**: Full search-and-import flow verified end-to-end with Google Books data. Duplicate ISBN detection works. Import with missing optional fields works.

---

## Phase 5: User Story 3 - Display Book Cover Thumbnails (Priority: P2)

**Goal**: Show cover images alongside search results to help users visually identify books

**Independent Test**: Search for a well-known book and verify a cover image is displayed. For results without a cover image, verify a placeholder is shown.

### Tests for User Story 3

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T009 [US3] Add E2E test cases for cover image display (cover present, placeholder fallback) in tests/e2e/book-search.spec.ts

### Implementation for User Story 3

- [x] T010 [P] [US3] Add cover image and placeholder styles in src/modules/books/presentation/search-results.module.css
- [x] T011 [US3] Add cover thumbnail display with placeholder fallback in src/modules/books/presentation/search-results.tsx

**Checkpoint**: Search results show cover thumbnails when available and placeholders when not. E2E tests pass.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation across all stories

- [x] T012 Run full test suite (unit, integration, E2E) and verify no regressions
- [x] T013 Run quickstart.md validation steps end-to-end

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Foundational phase completion
- **US2 (Phase 4)**: Depends on US1 completion (import requires working Google Books search)
- **US3 (Phase 5)**: Depends on Foundational phase completion (can start in parallel with US1 for CSS/presentation, but E2E tests need US1)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Depends on US1 - the E2E search-and-import flow requires Google Books search to be wired
- **User Story 3 (P2)**: Presentation tasks (T010, T011) can start after Foundational; E2E test (T009) requires US1 wired

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Integration/unit tests before implementation code
- Infrastructure (provider) before wiring (route)
- Implementation before E2E validation

### Parallel Opportunities

- T002 and T003 can run in parallel after Phase 1
- T004 (US1 integration tests) and T007 (search page text) can run in parallel
- T010 (US3 CSS) can run in parallel with T011 preparation or with US1/US2 work
- US3 presentation tasks (T010, T011) can start while US2 E2E tests are being written

---

## Parallel Example: Phase 2 (Foundational)

```
# Launch foundational tasks together:
Task T002: "Add coverImageUrl to SearchResult in src/modules/books/domain/book-search-provider.ts"
Task T003: "Update search-service test fixtures in tests/unit/modules/books/application/search-service.test.ts"
```

## Parallel Example: User Story 1

```
# After T005 is complete, launch in parallel:
Task T006: "Wire GoogleBooksSearchProvider in src/app/api/search/route.ts"
Task T007: "Update search page description in src/app/search/page.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Foundational (T002-T003)
3. Complete Phase 3: User Story 1 (T004-T007)
4. **STOP and VALIDATE**: Search works with Google Books, integration tests pass
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational -> Foundation ready
2. Add User Story 1 -> Search via Google Books works (MVP!)
3. Add User Story 2 -> Full search-and-import flow validated with E2E tests
4. Add User Story 3 -> Cover thumbnails displayed -> Complete feature
5. Polish -> Full regression check

### Single Developer Path (Recommended)

Since US2 depends on US1, the optimal single-developer path is sequential:
1. Phase 1 -> Phase 2 -> Phase 3 (US1) -> Phase 4 (US2) -> Phase 5 (US3) -> Phase 6

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- The Open Library provider is kept but unused (per plan.md) - do NOT delete it
- Google Books image URLs must be rewritten from http:// to https:// (R3 from research.md)
- ISBN mapping prefers ISBN-13 over ISBN-10 (R2 from research.md)
- API key missing should produce a clear error at provider instantiation (R4 from research.md)
- Max 10 results per query (FR-013)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
