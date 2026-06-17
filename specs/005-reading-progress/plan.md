# Implementation Plan: Reading Progress

**Branch**: `005-reading-progress` | **Date**: 2026-06-17 | **Spec**: `specs/005-reading-progress/spec.md`
**Input**: Feature specification from `specs/005-reading-progress/spec.md`

## Summary

Add reading progress tracking to the Reading Wishlist app by introducing a WISHLIST → READING status transition for books. This extends the domain `Book` entity with a `readingStartDate` field, adds a `startReading()` domain method enforcing transition rules (only WISHLIST → READING, reject duplicates), adds a `READING` value to the `BookStatus` enum, and provides a filtered reading list endpoint. Changes span all four architectural layers: domain (entity + enum), application (service method), infrastructure (Prisma schema migration + repository update), and presentation (API route + UI "Start Reading" button and reading list view).

## Technical Context

**Language/Version**: TypeScript 6.0 on Node.js  
**Primary Dependencies**: Next.js 16, React 19, Prisma 6  
**Storage**: PostgreSQL via Prisma ORM  
**Testing**: Jest 30 + React Testing Library 16 (unit/integration), Playwright 1.61 (E2E)  
**Target Platform**: Web browser (Next.js App Router)  
**Project Type**: Web application  
**Performance Goals**: N/A (single-user app, no performance-critical changes)  
**Constraints**: Single-user application; status transition is one-directional (WISHLIST → READING only); no page/percentage tracking in this stage  
**Scale/Scope**: 1 domain entity update, 1 enum update, 1 new migration, 1 service method, 1 new API route, UI changes to book-detail and book-list components

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Assessment |
|-----------|--------|------------|
| **I. Test-First Development** | PASS | Status transition is a business rule requiring TDD. Tests for `Book.startReading()`, `BookService.startReading()`, repository persistence of READING status, and E2E user flow will be written before implementation. |
| **II. Domain-First Architecture** | PASS | Status transition logic lives in the `Book` domain entity. The service orchestrates. The API route delegates. No business logic in components or route handlers. |
| **III. Testing Pyramid** | PASS | Unit: domain entity transition rules, service method. Integration: Prisma repository persisting READING status and readingStartDate. E2E: complete flow of starting a book and viewing reading list. |
| **IV. Infrastructure Isolation** | PASS | New Prisma migration adds READING enum value and readingStartDate column. Repository handles persistence. Domain is unaware of Prisma. |
| **V. Code Quality & Strictness** | PASS | Method name `startReading()` expresses intent. The `BookStatus` enum is extended, not replaced. Immutable pattern maintained — `startReading()` returns a new `Book` instance. |
| **Technology Stack** | PASS | No new dependencies introduced. Uses existing Prisma, Next.js, Jest, Playwright stack. |

**Gate result**: PASS — proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/005-reading-progress/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks command)
```

### Source Code (repository root)

```text
src/
├── modules/
│   └── books/
│       ├── domain/
│       │   ├── book.ts              # MODIFIED: add readingStartDate field, startReading() method
│       │   └── book-status.ts       # MODIFIED: add READING enum value
│       ├── application/
│       │   └── book-service.ts      # MODIFIED: add startReading() and listReadingBooks() methods
│       ├── infrastructure/
│       │   └── prisma-book-repository.ts  # MODIFIED: add update() and findByStatus() methods
│       └── presentation/
│           ├── book-detail.tsx       # MODIFIED: add "Start Reading" button, show readingStartDate
│           └── book-list.tsx         # MODIFIED: show status badge, filter reading books
├── app/
│   ├── api/
│   │   └── books/
│   │       └── [id]/
│   │           ├── route.ts          # MODIFIED: add readingStartDate to GET response
│   │           └── start-reading/
│   │               └── route.ts      # NEW: PATCH endpoint for starting reading
│   └── reading/
│       └── page.tsx                  # NEW: reading list page

prisma/
└── schema.prisma                     # MODIFIED: add READING enum value, readingStartDate field

tests/
├── unit/
│   └── modules/books/
│       ├── domain/
│       │   └── book-start-reading.test.ts  # NEW: domain transition tests
│       └── application/
│           └── book-service.test.ts        # MODIFIED: add startReading/listReadingBooks tests
├── integration/
│   └── modules/books/infrastructure/
│       └── prisma-book-repository.test.ts  # MODIFIED: add update/findByStatus tests
├── helpers/
│   └── in-memory-book-repository.ts        # MODIFIED: add update() and findByStatus() methods
└── e2e/
    └── reading-progress.spec.ts            # NEW: E2E flow for start reading + reading list
```

**Structure Decision**: Follows the established modular architecture (`src/modules/books/{domain,application,infrastructure,presentation}`). New API route uses Next.js nested route convention (`/api/books/[id]/start-reading`). New reading list page at `/reading`.

## Complexity Tracking

No constitution violations to justify — all changes follow established domain-first architecture with test-first development.
