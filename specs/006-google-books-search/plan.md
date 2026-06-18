# Implementation Plan: Google Books Search

**Branch**: `006-google-books-search` | **Date**: 2026-06-18 | **Spec**: [spec.md](specs/006-google-books-search/spec.md)
**Input**: Feature specification from `/specs/006-google-books-search/spec.md`

## Summary

Replace the Open Library data source with Google Books API for the book search feature. The existing `BookSearchProvider` abstraction makes this a clean infrastructure swap: implement a new `GoogleBooksSearchProvider`, extend `SearchResult` with `coverImageUrl`, update the presentation layer to display cover thumbnails, and wire the new provider into the API route. No database schema changes required.

## Technical Context

**Language/Version**: TypeScript 6.x (strict mode enabled)
**Primary Dependencies**: Next.js 16, React 19, Prisma 6
**Storage**: PostgreSQL via Prisma (unchanged — no migration needed)
**Testing**: Jest + React Testing Library (unit/integration), Playwright (E2E)
**Target Platform**: Web application (Node.js server)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: Search results in <5 seconds under normal network conditions (SC-001)
**Constraints**: Google Books API key required (free tier: 1,000 req/day); single-user application
**Scale/Scope**: Single-user reading wishlist application

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|---|---|---|
| I. Test-First Development | PASS | All tasks ordered test-first: unit tests → integration tests → implementation → E2E tests |
| II. Domain-First Architecture | PASS | `BookSearchProvider` interface (domain) stays unchanged in signature; new `GoogleBooksSearchProvider` (infrastructure) implements it; `SearchService` (application) is provider-agnostic |
| III. Testing Pyramid | PASS | Unit tests for domain/application, integration tests for `GoogleBooksSearchProvider` with mocked fetch, E2E tests for search-and-import flow |
| IV. Infrastructure Isolation | PASS | Google Books API details fully encapsulated in `GoogleBooksSearchProvider`; domain layer has zero knowledge of Google Books |
| V. Code Quality & Strictness | PASS | TypeScript strict mode; no `any`; descriptive names throughout |

**Post-design re-check**: PASS — the `SearchResult` interface extension (`coverImageUrl`) is a domain-level change but remains infrastructure-agnostic (any provider can supply or omit a cover URL).

## Project Structure

### Documentation (this feature)

```text
specs/006-google-books-search/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── search-api.md    # Updated search API contract
└── tasks.md             # Phase 2 output (via /speckit-tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── api/search/route.ts            # Wire GoogleBooksSearchProvider
│   └── search/page.tsx                # Update description text
├── modules/
│   └── books/
│       ├── domain/
│       │   └── book-search-provider.ts  # Add coverImageUrl to SearchResult
│       ├── application/
│       │   └── search-service.ts        # Unchanged
│       ├── infrastructure/
│       │   ├── open-library-search-provider.ts  # Keep (unused but not deleted)
│       │   └── google-books-search-provider.ts  # NEW
│       └── presentation/
│           ├── search-results.tsx        # Add cover thumbnail display
│           └── search-results.module.css # Add cover image styles

tests/
├── unit/modules/books/
│   ├── application/search-service.test.ts  # Update for coverImageUrl
│   └── domain/                              # Unchanged
├── integration/modules/books/infrastructure/
│   ├── open-library-search-provider.test.ts # Keep existing
│   └── google-books-search-provider.test.ts # NEW
└── e2e/
    └── book-search.spec.ts                  # Update for Google Books + covers
```

**Structure Decision**: Follows the existing modular architecture under `src/modules/books/`. The change is contained within the `infrastructure` layer (new provider) with minimal updates to `domain` (interface extension) and `presentation` (cover thumbnails).

## Complexity Tracking

No constitution violations. The change operates within the existing architectural boundaries:
- The `BookSearchProvider` abstraction already exists (Principle IV)
- Swapping the provider is a single-point change in the API route (Principle II)
- The `SearchResult` interface extension is additive and backward-compatible
