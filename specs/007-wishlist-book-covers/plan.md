# Implementation Plan: Wishlist Book Covers

**Branch**: `008-wishlist-book-covers` | **Date**: 2026-06-18 | **Spec**: [spec.md](specs/007-wishlist-book-covers/spec.md)
**Input**: Feature specification from `/specs/007-wishlist-book-covers/spec.md`

## Summary

Add cover image support to the book wishlist. Three cover sources: (1) external URLs from Google Books search imports (persisted as a URL string), (2) user-uploaded images via the manual add form (stored on local filesystem, served from `/uploads/covers/`), and (3) no cover (placeholder displayed). Requires a Prisma schema migration to add `coverImageUrl` to the `Book` model, domain entity extension, a new upload API route, and presentation updates to display covers on the wishlist and book detail pages.

## Technical Context

**Language/Version**: TypeScript 6.x (strict mode enabled)
**Primary Dependencies**: Next.js 16, React 19, Prisma 6
**Storage**: PostgreSQL via Prisma; local filesystem for uploaded cover images (`public/uploads/covers/`)
**Testing**: Jest + React Testing Library (unit/integration), Playwright (E2E)
**Target Platform**: Web application (Node.js server)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: Cover upload completes within 3 seconds for files under 5 MB (SC-004)
**Constraints**: Single-user application; max 5 MB upload; JPEG/PNG/WebP accepted
**Scale/Scope**: Single-user reading wishlist application

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|---|---|---|
| I. Test-First Development | PASS | Tasks ordered test-first: domain unit tests → application service tests → infrastructure/integration tests → presentation → E2E tests |
| II. Domain-First Architecture | PASS | Cover image is a domain concept on `Book` entity. File storage is encapsulated behind a `CoverImageStorage` interface in the domain layer; `LocalFileCoverImageStorage` implements it in infrastructure. Business logic (validation rules, image source type) lives in domain, not in route handlers or components |
| III. Testing Pyramid | PASS | Unit tests for domain entity cover image rules, application service cover handling; integration tests for repository persistence of cover data and file storage; E2E tests for upload flow and wishlist cover display |
| IV. Infrastructure Isolation | PASS | File storage abstracted behind `CoverImageStorage` interface. Domain layer has no knowledge of filesystem paths or Next.js static serving. External cover URLs (Google Books) are just strings — no infrastructure dependency |
| V. Code Quality & Strictness | PASS | TypeScript strict mode; no `any`; descriptive names (`coverImageUrl`, `uploadCoverImage`, `CoverImageStorage`) |

**Post-design re-check**: PASS — The `Book` entity extension is minimal (one optional field). File upload validation rules (type, size) are domain concerns enforced before reaching infrastructure. The `CoverImageStorage` abstraction allows testing without the filesystem.

## Project Structure

### Documentation (this feature)

```text
specs/007-wishlist-book-covers/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── books-api.md     # Updated POST /api/books contract (import with cover)
│   └── upload-api.md    # NEW POST /api/books/[id]/cover upload contract
└── tasks.md             # Phase 2 output (via /speckit-tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── api/
│   │   └── books/
│   │       ├── route.ts                    # Update POST to accept coverImageUrl for imports
│   │       └── [id]/
│   │           └── cover/
│   │               └── route.ts            # NEW — file upload endpoint
│   ├── books/[id]/page.tsx                 # Update to display cover
│   └── page.tsx                            # Unchanged
├── modules/
│   └── books/
│       ├── domain/
│       │   ├── book.ts                     # Add coverImageUrl field
│       │   ├── book-repository.ts          # Unchanged
│       │   ├── book-search-provider.ts     # Unchanged (coverImageUrl already exists)
│       │   └── cover-image-storage.ts      # NEW — storage abstraction interface
│       ├── application/
│       │   └── book-service.ts             # Add uploadCover, update addBook/importBook for cover
│       ├── infrastructure/
│       │   ├── prisma-book-repository.ts   # Update to persist coverImageUrl
│       │   └── local-file-cover-image-storage.ts  # NEW — filesystem implementation
│       └── presentation/
│           ├── add-book-form.tsx            # Add file upload input
│           ├── add-book-form.module.css     # Add cover upload styles
│           ├── book-list.tsx                # Add cover image display
│           ├── book-list.module.css         # Add cover image styles
│           ├── book-detail.tsx              # Add cover image display
│           ├── book-detail.module.css       # Add cover image styles
│           └── search-results.tsx           # Update import to pass coverImageUrl

prisma/
├── schema.prisma                           # Add coverImageUrl field to Book model
└── migrations/                             # NEW migration for coverImageUrl

public/
└── uploads/
    └── covers/                             # Directory for uploaded cover images

tests/
├── unit/modules/books/
│   ├── domain/
│   │   └── book.test.ts                    # Add cover image tests
│   └── application/
│       └── book-service.test.ts            # Add cover upload/import tests
├── integration/modules/books/infrastructure/
│   ├── prisma-book-repository.test.ts      # Add cover persistence tests
│   └── local-file-cover-image-storage.test.ts  # NEW
└── e2e/
    └── books-wishlist.spec.ts              # Add cover display and upload E2E tests
```

**Structure Decision**: Follows the existing modular architecture under `src/modules/books/`. The cover image storage abstraction (`CoverImageStorage`) is added to the domain layer to maintain infrastructure isolation. The local filesystem implementation is in the infrastructure layer. This mirrors the existing `BookSearchProvider`/`GoogleBooksSearchProvider` pattern.

## Complexity Tracking

No constitution violations. The design stays within established patterns:
- `CoverImageStorage` interface follows the same pattern as `BookSearchProvider` (Principle IV)
- File validation (type, size) is a domain concern, not infrastructure (Principle II)
- The single new optional field on `Book` is the minimal change to support cover images
