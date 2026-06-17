# Implementation Plan: Reading Wishlist MVP

**Branch**: `001-reading-wishlist` | **Date**: 2026-06-17 | **Spec**: [spec.md](specs/001-reading-wishlist/spec.md)
**Input**: Feature specification from `specs/001-reading-wishlist/spec.md`

## Summary

Build a single-user reading wishlist web application where users can add, list, view details, and remove books. The application uses Next.js with TypeScript for both frontend and backend (API routes), PostgreSQL with Prisma for persistence, and follows a domain-first architecture with strict TDD as mandated by the project constitution.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: Next.js 14+ (App Router), Prisma ORM, React 18+, React Testing Library
**Storage**: PostgreSQL (via Prisma ORM, migrations required)
**Testing**: Jest + React Testing Library (unit/integration), Playwright (E2E)
**Target Platform**: Web (browser) — single-user, local deployment
**Project Type**: Web application (Next.js full-stack)
**Performance Goals**: N/A for MVP (single-user, small dataset)
**Constraints**: Single-user, no authentication, no search/filter/sort, no duplicate detection
**Scale/Scope**: Single feature (CRUD for books), 4 user stories, ~4 pages/views

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Test-First Development | PASS | TDD workflow will be enforced: tests before implementation for all business rules |
| II. Domain-First Architecture | PASS | Module structure follows `src/modules/books/{domain,application,infrastructure,presentation}`. Business logic in domain/application layers only |
| III. Testing Pyramid | PASS | Unit tests for domain entities/services, integration tests for Prisma repositories, E2E tests for full user flows via Playwright |
| IV. Infrastructure Isolation | PASS | Database access via repository abstraction. Prisma encapsulated in infrastructure layer. No Open Library integration in this MVP |
| V. Code Quality & Strictness | PASS | TypeScript strict mode, no `any`, intent-expressing names |

**Gate Result**: PASS — no violations. Proceeding to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/001-reading-wishlist/
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
├── app/                          # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx
│   ├── books/
│   │   └── [id]/
│   │       └── page.tsx          # Book detail view
│   └── api/
│       └── books/
│           ├── route.ts          # GET (list), POST (create)
│           └── [id]/
│               └── route.ts     # GET (detail), DELETE (remove)
├── modules/
│   └── books/
│       ├── domain/
│       │   ├── book.ts           # Book entity
│       │   ├── book-status.ts    # BookStatus enum
│       │   └── book-repository.ts # Repository interface
│       ├── application/
│       │   └── book-service.ts   # Use cases (add, list, view, remove)
│       ├── infrastructure/
│       │   └── prisma-book-repository.ts # Prisma implementation
│       └── presentation/
│           ├── book-list.tsx     # Book list component
│           ├── book-detail.tsx   # Book detail component
│           ├── add-book-form.tsx # Add book form component
│           └── remove-book-dialog.tsx # Confirmation dialog
└── lib/
    └── prisma.ts                 # Prisma client singleton

prisma/
├── schema.prisma
└── migrations/

tests/
├── unit/
│   └── modules/books/
│       ├── domain/
│       │   └── book.test.ts
│       └── application/
│           └── book-service.test.ts
├── integration/
│   └── modules/books/
│       └── infrastructure/
│           └── prisma-book-repository.test.ts
└── e2e/
    └── books-wishlist.spec.ts
```

**Structure Decision**: Next.js App Router with domain-first modular architecture as mandated by the constitution. The `src/modules/books/` directory implements the layered architecture (domain → application → infrastructure → presentation) with dependency inversion via the repository interface.

## Complexity Tracking

No violations detected. No complexity justifications needed.
