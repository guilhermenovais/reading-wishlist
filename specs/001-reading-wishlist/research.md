# Research: Reading Wishlist MVP

**Feature**: 001-reading-wishlist | **Date**: 2026-06-17

## R1: Next.js App Router with Domain-First Architecture

**Decision**: Use Next.js App Router (`app/` directory) with a separate `src/modules/` directory for domain-first layered architecture.

**Rationale**: The App Router is the current recommended approach for Next.js. Keeping domain logic in `src/modules/books/` outside of `app/` ensures the domain layer has no dependency on Next.js, satisfying Constitution Principle II (Domain-First Architecture). API routes in `app/api/` act as thin adapters that delegate to the application service.

**Alternatives considered**:
- Pages Router: Legacy approach, no longer recommended for new projects.
- Domain logic inside API routes: Violates Constitution Principle II — business logic would depend on Next.js.
- Monorepo with separate packages: Overengineered for a single-feature MVP.

## R2: Prisma with Repository Pattern

**Decision**: Use Prisma as the ORM, encapsulated behind a `BookRepository` interface defined in the domain layer. The `PrismaBookRepository` implements this interface in the infrastructure layer.

**Rationale**: Constitution Principle IV (Infrastructure Isolation) requires database access through repository abstractions. Prisma provides type-safe database access and migration management. The repository interface allows unit tests to run without a database by using in-memory implementations.

**Alternatives considered**:
- Direct Prisma usage in services: Violates Constitution Principle IV — business logic would depend on Prisma.
- TypeORM: Less ecosystem alignment with Next.js/TypeScript; Prisma is the constitution-mandated ORM.
- Raw SQL via `pg`: No migration management, no type safety, more boilerplate.

## R3: Testing Strategy for TDD

**Decision**: Three-layer testing approach following the testing pyramid:
1. **Unit tests** (Jest): Test `Book` entity validation and `BookService` use cases with an in-memory repository. No database dependency.
2. **Integration tests** (Jest): Test `PrismaBookRepository` against a real PostgreSQL test database.
3. **E2E tests** (Playwright): Test full user flows through the browser.

**Rationale**: Constitution Principle I (Test-First) requires tests before implementation. Constitution Principle III (Testing Pyramid) requires most tests at the unit level. The in-memory repository makes unit tests fast and independent of infrastructure.

**Alternatives considered**:
- Mocking Prisma in unit tests: Unnecessarily couples tests to Prisma internals; an in-memory repository is simpler and more robust.
- Only E2E tests: Violates the testing pyramid; too slow for TDD cycles.
- Testing Library for API routes: Integration tests on the repository layer provide better isolation and faster feedback than testing through HTTP.

## R4: Book Identifier Strategy

**Decision**: Use auto-incrementing integer identifiers, managed by PostgreSQL via Prisma's `@id @default(autoincrement())`.

**Rationale**: Spec clarification explicitly states auto-incrementing integer. Simple, sequential, human-readable. Suitable for a single-user application with no distributed concerns.

**Alternatives considered**:
- UUID: Overkill for single-user; less readable in URLs.
- CUID/NanoID: No benefit over auto-increment for this use case.

## R5: Confirmation Dialog for Book Removal

**Decision**: Implement a client-side confirmation dialog using a React component (not `window.confirm()`). The dialog appears when the user clicks "Remove" and requires explicit confirmation before the DELETE request is sent.

**Rationale**: The spec requires a confirmation dialog (FR-009) that allows cancellation (FR-009a). A custom React component provides better UX control and testability with React Testing Library compared to `window.confirm()`.

**Alternatives considered**:
- `window.confirm()`: Not testable with React Testing Library; poor UX customization.
- Server-side confirmation: Adds unnecessary round-trips for a client-side concern.

## R6: Input Validation Strategy

**Decision**: Validate book title and author in the domain entity (`Book` class/factory) and also at the API route level. Validation rejects empty strings, whitespace-only strings, and missing fields.

**Rationale**: Constitution Principle II requires business rules in the domain layer. API-level validation provides fail-fast behavior and clear error messages at the system boundary. Domain-level validation ensures rules are enforced regardless of entry point.

**Alternatives considered**:
- Validation only in API routes: Violates domain-first principle.
- Validation library (Zod/Yup): Acceptable for API-level parsing but domain validation should be in plain TypeScript to avoid domain-layer dependencies.
