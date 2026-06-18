# Implementation Plan: Completed Books

**Branch**: `007-completed-books` | **Date**: 2026-06-18 | **Spec**: [specs/007-completed-books/spec.md](spec.md)
**Input**: Feature specification from `specs/007-completed-books/spec.md`

## Summary

Add a "Completed" status to the book lifecycle, allowing users to mark books as completed with a selectable completion date, view all completed books on a dedicated page, and see completion dates on book detail pages. Also persists cover image URLs from search imports for display on the Completed page.

## Technical Context

**Language/Version**: TypeScript 6.0 (strict mode)  
**Primary Dependencies**: Next.js 16, React 19, Prisma 6, @prisma/client  
**Storage**: PostgreSQL via Prisma ORM  
**Testing**: Jest 30 + React Testing Library (unit/integration), Playwright 1.61 (E2E)  
**Target Platform**: Web application (server: Node.js, client: browser)  
**Project Type**: Web application (Next.js App Router)  
**Performance Goals**: Completed page loads within 3 seconds (SC-002)  
**Constraints**: No additional frameworks/libraries without justification (Constitution V)  
**Scale/Scope**: Single-user reading tracker; small dataset (personal library)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Test-First Development | PASS | All domain rules (status transition, date validation) will have unit tests written before implementation. Service-level tests before service code. E2E tests for complete flow. |
| II. Domain-First Architecture | PASS | `markAsCompleted()` is a domain method on `Book`. Business rules (date constraints, status validation) live in the domain layer. No business logic in components or routes. |
| III. Testing Pyramid Strategy | PASS | Unit: domain entity + service tests. Integration: repository persistence of new fields. E2E: mark-as-completed flow, completed page navigation. |
| IV. Infrastructure Isolation | PASS | Cover image URL stored at import time avoids runtime dependency on Google Books API for the Completed page. Repository pattern maintained. Migration-based schema changes. |
| V. Code Quality & Strictness | PASS | TypeScript strict mode. Descriptive names (`markAsCompleted`, `completionDate`, `listCompletedBooks`). No `any` usage. Immutable domain operations. |

**Post-Phase 1 Re-check**: All principles remain satisfied. The design adds `coverImageUrl` to the Book entity to avoid coupling page rendering to external APIs (IV). Native `<dialog>` and `<input type="date">` avoid new dependencies (V).

## Project Structure

### Documentation (this feature)

```text
specs/007-completed-books/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── api.md           # Phase 1 output
└── tasks.md             # Phase 2 output (created by /speckit-tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── layout.tsx                          # MODIFY: add Completed nav link
│   ├── completed/
│   │   └── page.tsx                        # NEW: Completed books page
│   ├── books/[id]/page.tsx                 # EXISTING (unchanged)
│   └── api/
│       └── books/
│           ├── route.ts                    # MODIFY: add COMPLETED filter, coverImageUrl in responses
│           ├── [id]/
│           │   ├── route.ts               # MODIFY: add completionDate + coverImageUrl to response
│           │   └── mark-completed/
│           │       └── route.ts           # NEW: PATCH endpoint
│           └── ...
├── modules/
│   └── books/
│       ├── domain/
│       │   ├── book-status.ts             # MODIFY: add COMPLETED enum value
│       │   └── book.ts                    # MODIFY: add completionDate, coverImageUrl, markAsCompleted()
│       ├── application/
│       │   └── book-service.ts            # MODIFY: add markAsCompleted(), listCompletedBooks()
│       ├── infrastructure/
│       │   └── prisma-book-repository.ts  # MODIFY: include new fields in toBook/update/save
│       └── presentation/
│           ├── book-detail.tsx            # MODIFY: add Mark as Completed button + completion date display
│           ├── mark-completed-dialog.tsx  # NEW: modal dialog with date picker
│           └── completed-book-list.tsx    # NEW: completed books list component

prisma/
├── schema.prisma                          # MODIFY: add COMPLETED enum, completionDate, coverImageUrl
└── migrations/
    └── YYYYMMDD_add_completed_status/     # NEW: migration

tests/
├── unit/modules/books/domain/
│   └── book-mark-completed.test.ts        # NEW: domain unit tests
├── unit/modules/books/application/
│   └── book-service.test.ts               # MODIFY: add markAsCompleted + listCompletedBooks tests
├── integration/modules/books/infrastructure/
│   └── prisma-book-repository.test.ts     # MODIFY: test new fields persistence
└── e2e/
    └── completed-books.spec.ts            # NEW: E2E tests for complete flow
```

**Structure Decision**: Follows the existing modular structure (`src/modules/books/{domain,application,infrastructure,presentation}`) with the Next.js App Router for pages and API routes. No structural changes needed.

## Complexity Tracking

No constitution violations. No complexity justifications needed.
