# Implementation Plan: Open Library Integration

**Branch**: `002-open-library-integration` | **Date**: 2026-06-17 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/002-open-library-integration/spec.md`

## Summary

Extend the existing Reading Wishlist application to allow users to search for books via the Open Library Search API and import them into their wishlist. This requires: extending the Book entity with optional ISBN and publication year fields, creating a `BookSearchProvider` abstraction for external search, adding a search service and API route, building a `/search` page, and enforcing duplicate ISBN detection. The domain-first architecture and TDD workflow from feature 001 are preserved and extended.

## Technical Context

**Language/Version**: TypeScript 6.x (strict mode enabled)
**Primary Dependencies**: Next.js 16+ (App Router), Prisma 6.x, React 19+, React Testing Library
**Storage**: PostgreSQL (via Prisma ORM, new migration for ISBN + publicationYear columns)
**Testing**: Jest + React Testing Library (unit/integration), Playwright (E2E)
**Target Platform**: Web (browser) — single-user, local deployment
**Project Type**: Web application (Next.js full-stack)
**Performance Goals**: Search results displayed in under 5 seconds under normal network conditions (SC-001)
**Constraints**: Single-user, no authentication, search by title only, max 10 results per query, no offline caching
**Scale/Scope**: Extends feature 001 with 3 user stories, 1 new page (/search), 1 external API integration

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Test-First Development | PASS | TDD workflow enforced: tests for search provider abstraction, import service, duplicate ISBN detection, and Book entity extension all written before implementation |
| II. Domain-First Architecture | PASS | Search abstraction (`BookSearchProvider`) lives in domain layer. Import logic in application layer. Open Library HTTP client in infrastructure layer. New presentation components for search page. Dependencies point inward |
| III. Testing Pyramid | PASS | Unit tests: Book entity (new fields, validation), search/import service, duplicate ISBN logic. Integration tests: Prisma repository (new fields, findByIsbn), Open Library HTTP client. E2E: search-and-import flow |
| IV. Infrastructure Isolation | PASS | Open Library interactions encapsulated behind `BookSearchProvider` interface per constitution mandate. Tests mock the provider, no external network dependency in unit/integration tests |
| V. Code Quality & Strictness | PASS | TypeScript strict mode, no `any`, intent-expressing names (e.g., `importBookFromSearch()`, `searchBooksByTitle()`, `findByIsbn()`) |

**Gate Result**: PASS — no violations. Proceeding to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/002-open-library-integration/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── api.md           # New and extended API endpoints
└── tasks.md             # Phase 2 output (/speckit-tasks command)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                          # Wishlist page (add nav link to /search)
│   ├── search/
│   │   └── page.tsx                      # NEW: Search page
│   ├── books/
│   │   └── [id]/
│   │       └── page.tsx                  # Updated: display ISBN + publicationYear
│   └── api/
│       ├── books/
│       │   ├── route.ts                  # Extended: POST accepts isbn/publicationYear
│       │   └── [id]/
│       │       └── route.ts             # Extended: GET returns isbn/publicationYear
│       └── search/
│           └── route.ts                 # NEW: GET /api/search?title=...
├── modules/
│   └── books/
│       ├── domain/
│       │   ├── book.ts                  # Extended: isbn, publicationYear fields
│       │   ├── book-status.ts
│       │   ├── book-repository.ts       # Extended: findByIsbn()
│       │   └── book-search-provider.ts  # NEW: BookSearchProvider interface
│       ├── application/
│       │   ├── book-service.ts          # Extended: importBook() with duplicate check
│       │   └── search-service.ts        # NEW: searchByTitle() use case
│       ├── infrastructure/
│       │   ├── prisma-book-repository.ts # Extended: new fields + findByIsbn
│       │   └── open-library-search-provider.ts # NEW: HTTP client
│       └── presentation/
│           ├── book-list.tsx
│           ├── book-detail.tsx          # Extended: ISBN + publicationYear display
│           ├── add-book-form.tsx
│           ├── remove-book-dialog.tsx
│           ├── search-form.tsx          # NEW: Search input + submit
│           └── search-results.tsx       # NEW: Results list with import buttons
└── lib/
    └── prisma.ts

prisma/
├── schema.prisma                        # Extended: isbn, publicationYear columns
└── migrations/
    ├── 20260617140045_init/
    └── [NEW]_add_isbn_publication_year/

tests/
├── unit/
│   └── modules/books/
│       ├── domain/
│       │   └── book.test.ts             # Extended: new fields, ISBN validation
│       └── application/
│           ├── book-service.test.ts     # Extended: importBook, duplicate ISBN
│           └── search-service.test.ts   # NEW
├── integration/
│   └── modules/books/
│       └── infrastructure/
│           ├── prisma-book-repository.test.ts  # Extended: new fields, findByIsbn
│           └── open-library-search-provider.test.ts # NEW
├── helpers/
│   └── in-memory-book-repository.ts     # Extended: new fields + findByIsbn
└── e2e/
    ├── books-wishlist.spec.ts           # Existing (verify no regression)
    └── book-search.spec.ts              # NEW: search + import E2E flow
```

**Structure Decision**: Extends the existing Next.js App Router domain-first modular architecture. New search capability follows the same layered pattern: domain interface (`BookSearchProvider`) → infrastructure implementation (`OpenLibrarySearchProvider`) → application service (`SearchService`) → presentation components + API route.

## Complexity Tracking

No violations detected. No complexity justifications needed.
