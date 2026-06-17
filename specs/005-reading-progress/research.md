# Research: Reading Progress

**Feature**: 005-reading-progress  
**Date**: 2026-06-17

## Research Topics

### 1. Prisma Enum Migration Strategy

**Context**: The `BookStatus` Prisma enum currently has only `WISHLIST`. Adding `READING` requires a PostgreSQL migration that alters the enum type.

**Decision**: Use `prisma migrate dev` to generate a migration that adds the `READING` value to the existing `BookStatus` enum.

**Rationale**: Prisma handles PostgreSQL enum extension via `ALTER TYPE BookStatus ADD VALUE 'READING'`. This is a non-destructive, additive change — no data loss, no table rewrite. Existing rows remain `WISHLIST`. The migration is backward-compatible.

**Alternatives considered**:
- Manual SQL migration: Unnecessary complexity; Prisma's generated migration handles this correctly.
- Replacing enum with a string column: Violates type safety and the existing pattern. The enum provides compile-time validation through the Prisma client.

### 2. Domain Entity Immutability Pattern for State Transitions

**Context**: The `Book` entity uses an immutable pattern — all fields are `readonly`, construction goes through static factory methods. The `startReading()` method needs to return a new `Book` instance rather than mutating the existing one.

**Decision**: Implement `startReading()` as an instance method that validates the transition (must be WISHLIST status) and returns a new `Book` via `Book.reconstitute()` with `status: READING` and `readingStartDate: new Date()`.

**Rationale**: Follows the established immutability pattern in the codebase. The `reconstitute()` method already handles reconstructing `Book` instances with all fields. The transition validation belongs in the domain entity per the constitution's domain-first architecture principle.

**Alternatives considered**:
- Mutable setter: Violates the existing immutability pattern and constitution principle V (immutable operations preferred).
- Service-level validation only: Violates constitution principle II (business logic must not be in application services — it belongs in domain entities).

### 3. Repository Update Method

**Context**: The existing `BookRepository` interface has `save()` for creation but no `update()` method. Starting reading requires updating an existing book's status and readingStartDate.

**Decision**: Add an `update(book: Book): Promise<Book>` method to the `BookRepository` interface. The Prisma implementation uses `prisma.book.update()` with the book's ID.

**Rationale**: The current `save()` method uses `prisma.book.create()` and is semantically for new books. Adding a separate `update()` method maintains clear semantics and avoids introducing upsert complexity.

**Alternatives considered**:
- Upsert in `save()`: Overloads the method's semantics. The distinction between create and update is meaningful for business operations.
- Direct Prisma update in service: Violates infrastructure isolation principle.

### 4. Filtered Query — findByStatus

**Context**: The reading list feature requires querying books by status (READING only). The existing `findAll()` returns all books regardless of status.

**Decision**: Add `findByStatus(status: BookStatus): Promise<Book[]>` to the `BookRepository` interface. The Prisma implementation filters with `where: { status }`.

**Rationale**: Filtering at the database level is more efficient than fetching all books and filtering in memory. The method signature uses the domain `BookStatus` enum, keeping the interface domain-centric.

**Alternatives considered**:
- Filter in application service after `findAll()`: Works but unnecessarily loads all books. Not a scaling concern for a single-user app, but violates the principle of asking the database for exactly what you need.
- Generic query builder: Over-engineered for this use case.

### 5. API Route Design for Start Reading

**Context**: Need an endpoint to trigger the WISHLIST → READING transition for a specific book.

**Decision**: Create a `PATCH /api/books/[id]/start-reading` route. PATCH is appropriate because it partially updates the book (status and readingStartDate only). The nested route under `[id]` follows REST conventions.

**Rationale**: PATCH semantics align with a partial update. A dedicated `/start-reading` sub-resource makes the intent explicit and avoids overloading a generic PATCH on the book resource.

**Alternatives considered**:
- `PUT /api/books/[id]` with status in body: Generic update endpoint; doesn't enforce domain transition rules at the API level and would need more complex request validation.
- `POST /api/books/[id]/actions`: Too generic; the action-based pattern is overkill for a single transition.

### 6. readingStartDate Field — Nullable Date

**Context**: The `readingStartDate` is only set when a book transitions to READING. Books in WISHLIST status should not have this field set.

**Decision**: Add `readingStartDate` as a nullable `DateTime?` in the Prisma schema and `readingStartDate: Date | null` in the domain entity. The field is `null` for WISHLIST books and automatically set to `new Date()` by the domain entity during the `startReading()` transition.

**Rationale**: Nullability correctly models the domain — a wishlist book has no reading start date. The domain entity controls when the date is set (during transition), not the API or the database.

**Alternatives considered**:
- Separate `ReadingSession` entity: Over-engineered for a single date field. Appropriate if future stages add reading sessions or multiple dates, but YAGNI for this stage.
- Default to epoch date: Semantically incorrect; null clearly communicates "not started."
