# Tasks: Wishlist Book Covers

**Input**: Design documents from `/specs/007-wishlist-book-covers/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Included — constitution requires test-first development (domain unit tests → application service tests → infrastructure/integration tests → presentation → E2E tests).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Database migration and filesystem setup for cover image support

- [X] T001 Add coverImageUrl String? field to Book model in prisma/schema.prisma and run prisma migrate dev to generate migration
- [X] T002 [P] Create public/uploads/covers/ directory and add uploads/ to .gitignore

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Extend the Book domain entity and repository to support coverImageUrl across all stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Tests (write first, verify they fail)

- [X] T003 [P] Add unit tests for Book entity cover image support (reconstitute with coverImageUrl, withCoverImage method, import with coverImageUrl) in tests/unit/modules/books/domain/book.test.ts
- [X] T004 [P] Add integration tests for PrismaBookRepository coverImageUrl persistence (save with cover, save without cover, update cover) in tests/integration/modules/books/infrastructure/prisma-book-repository.test.ts

### Implementation

- [X] T005 Extend Book domain entity with coverImageUrl field: update ImportBookProps and ReconstituteBookProps, add withCoverImage(coverImageUrl: string): Book method in src/modules/books/domain/book.ts
- [X] T006 Update PrismaBookRepository to map coverImageUrl in toDomain and toPersistence methods in src/modules/books/infrastructure/prisma-book-repository.ts

**Checkpoint**: Book entity and repository support coverImageUrl end-to-end. All foundational tests pass.

---

## Phase 3: User Story 1 — View Book Covers on Wishlist (Priority: P1) 🎯 MVP

**Goal**: Display cover images (or placeholders) for every book on the wishlist and book detail pages

**Independent Test**: Add books with coverImageUrl values directly in the database, then verify covers appear on the wishlist page and book detail page. Books without coverImageUrl show a styled placeholder.

### Implementation for User Story 1

- [X] T007 [P] [US1] Update book-list component to render cover image via <img> or CSS placeholder fallback in src/modules/books/presentation/book-list.tsx and src/modules/books/presentation/book-list.module.css
- [X] T008 [P] [US1] Update book-detail component to render cover image via <img> or CSS placeholder fallback in src/modules/books/presentation/book-detail.tsx and src/modules/books/presentation/book-detail.module.css
- [X] T009 [US1] Update book detail page to pass coverImageUrl to book-detail component in src/app/books/[id]/page.tsx

**Checkpoint**: Wishlist and detail pages display covers or placeholders. User Story 1 is fully functional and testable independently.

---

## Phase 4: User Story 2 — Upload Cover When Adding a Book Manually (Priority: P2)

**Goal**: Users can upload a cover image (JPEG/PNG/WebP, max 5 MB) when manually adding a book, with validation and error messages

**Independent Test**: Manually add a book with a cover image upload, verify the uploaded cover appears on the wishlist. Also test: adding without cover (placeholder shown), invalid file type (error), file too large (error).

### Tests for User Story 2 (write first, verify they fail)

- [X] T010 [P] [US2] Add unit tests for BookService uploadCover method (valid upload, invalid MIME type, file too large, invalid magic bytes) in tests/unit/modules/books/application/book-service.test.ts
- [X] T011 [P] [US2] Create integration tests for LocalFileCoverImageStorage (save file, delete file, correct path naming) in tests/integration/modules/books/infrastructure/local-file-cover-image-storage.test.ts

### Implementation for User Story 2

- [X] T012 [P] [US2] Create CoverImageStorage interface with save and delete methods in src/modules/books/domain/cover-image-storage.ts
- [X] T013 [US2] Implement LocalFileCoverImageStorage (save to public/uploads/covers/{bookId}-{timestamp}.{ext}, delete old file) in src/modules/books/infrastructure/local-file-cover-image-storage.ts
- [X] T014 [US2] Add uploadCover method to BookService with validation (MIME type check, 5 MB size limit, magic bytes verification) in src/modules/books/application/book-service.ts
- [X] T015 [US2] Create POST /api/books/[id]/cover route handling multipart/form-data with error responses per upload-api.md contract in src/app/api/books/[id]/cover/route.ts
- [X] T016 [US2] Add file upload input with accept attribute and client-side validation to add-book-form in src/modules/books/presentation/add-book-form.tsx and src/modules/books/presentation/add-book-form.module.css

**Checkpoint**: Users can upload covers when adding books manually. All upload validation works. User Stories 1 AND 2 are both independently functional.

---

## Phase 5: User Story 3 — Persist Cover from Search Import (Priority: P3)

**Goal**: When importing a book from search results, the cover image URL from Google Books is persisted and displayed on the wishlist

**Independent Test**: Search for a book with a cover in Google Books, import it, verify the cover URL is saved and the cover displays on the wishlist. Also test importing a book without a cover (placeholder shown).

### Tests for User Story 3 (write first, verify they fail)

- [X] T017 [US3] Add unit tests for BookService import flow with coverImageUrl (import with cover URL, import without cover URL) in tests/unit/modules/books/application/book-service.test.ts

### Implementation for User Story 3

- [X] T018 [US3] Update BookService addBook/importBook to accept and persist coverImageUrl parameter in src/modules/books/application/book-service.ts
- [X] T019 [P] [US3] Update POST /api/books route to parse coverImageUrl from request body and pass to BookService per books-api.md contract in src/app/api/books/route.ts
- [X] T020 [P] [US3] Update search-results component to include coverImageUrl when calling import API in src/modules/books/presentation/search-results.tsx

**Checkpoint**: All three user stories are independently functional. Import, upload, and display flows all work.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: End-to-end validation across all stories

- [X] T021 [P] Add E2E tests covering cover display on wishlist, manual upload flow, and search import flow in tests/e2e/books-wishlist.spec.ts
- [X] T022 Run quickstart.md validation steps: migrate, create uploads dir, verify search import cover, manual upload cover, and placeholder display

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3–5)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) — No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) — No dependencies on US1 (upload is independent of display, though covers will display via US1 components)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) — No dependencies on US1 or US2 (import flow is independent)

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Domain interfaces before infrastructure implementations
- Infrastructure before application services
- Application services before API routes
- API routes before presentation components
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1**: T001 and T002 can run in parallel
- **Phase 2**: T003 and T004 (tests) can run in parallel; then T005 and T006 are sequential
- **Phase 3**: T007 and T008 can run in parallel (different components/files)
- **Phase 4**: T010, T011, and T012 can run in parallel; T013 depends on T012
- **Phase 5**: T019 and T020 can run in parallel (different files)
- **Cross-story**: Once Phase 2 completes, all three user story phases can start in parallel

---

## Parallel Example: User Story 2

```
# Launch tests and domain interface in parallel:
Task T010: "Unit tests for BookService uploadCover in tests/unit/.../book-service.test.ts"
Task T011: "Integration tests for LocalFileCoverImageStorage in tests/integration/.../local-file-cover-image-storage.test.ts"
Task T012: "CoverImageStorage interface in src/modules/books/domain/cover-image-storage.ts"

# Then sequential implementation:
Task T013: "LocalFileCoverImageStorage" (depends on T012)
Task T014: "BookService.uploadCover" (depends on T012, T013)
Task T015: "Upload API route" (depends on T014)
Task T016: "Add-book-form upload input" (depends on T015)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (migration + uploads directory)
2. Complete Phase 2: Foundational (Book entity + repository cover support)
3. Complete Phase 3: User Story 1 (cover display on wishlist and detail pages)
4. **STOP and VALIDATE**: Verify covers display for books with coverImageUrl, placeholders for books without
5. Deploy/demo if ready — delivers immediate visual value

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP — covers visible!)
3. Add User Story 2 → Test independently → Deploy/Demo (manual upload works)
4. Add User Story 3 → Test independently → Deploy/Demo (import preserves covers)
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (display)
   - Developer B: User Story 2 (upload)
   - Developer C: User Story 3 (import persistence)
3. Stories complete and integrate independently
