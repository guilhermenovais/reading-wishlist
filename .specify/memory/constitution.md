<!--
Sync Impact Report
==================
Version change: (none) → 1.0.0
Modified principles: N/A (initial constitution)
Added sections:
  - Core Principles (5 principles)
  - Technology Stack & Infrastructure Constraints
  - Development Workflow & Definition of Done
  - Governance
Removed sections: N/A
Templates requiring updates:
  - .specify/templates/plan-template.md ✅ aligned (Constitution Check section present)
  - .specify/templates/spec-template.md ✅ aligned (User Scenarios & Testing section present)
  - .specify/templates/tasks-template.md ✅ aligned (test-first task ordering present)
Follow-up TODOs: None
-->

# Reading Management System Constitution

## Core Principles

### I. Test-First Development (NON-NEGOTIABLE)

Every business rule MUST be represented by automated tests before
it is implemented. This principle takes precedence over all other
technical decisions in the project.

- All business logic MUST follow Test-Driven Development (TDD):
  Red (write a failing test) → Green (minimum code to pass) →
  Refactor (improve design while tests stay green).
- Implementation code MUST NOT be written before the corresponding
  test.
- Every user story MUST begin with tests that define expected
  behavior. Tests serve as executable specifications.
- Features MUST be implemented through small, incremental changes.
  Large feature branches are prohibited.

### II. Domain-First Architecture

The domain model is the source of truth. Database schemas, API
contracts, and UI behavior MUST reflect domain rules rather than
define them.

- Business logic MUST NOT be implemented directly inside React
  components, route handlers, or database models. Business logic
  belongs to dedicated domain/application services.
- Dependencies MUST point inward:
  Presentation → Application → Domain.
- The domain layer MUST NOT depend on Next.js, Prisma, PostgreSQL,
  or external APIs.
- Business rules MUST be represented in code and protected by
  automated tests (e.g., book status transitions: WISHLIST →
  READING → COMPLETED, with no backward transition from COMPLETED).
- Every class, function, and module MUST have one reason to change
  (Single Responsibility).
- Composition MUST be preferred over inheritance. Inheritance is
  allowed only when clearly justified.

**Required module structure:**

```text
src/
├── app/
├── modules/
│   ├── books/
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── presentation/
```

### III. Testing Pyramid Strategy

The project MUST follow the testing pyramid: most tests as unit
tests, fewer integration tests, fewest E2E tests.

- **Unit tests** MUST validate domain entities, domain services,
  business rules, and state transitions. Unit tests MUST NOT
  depend on database, network, or Open Library API.
- **Integration tests** MUST validate database persistence,
  repository implementations, and external API integration.
- **E2E tests** MUST validate complete user flows (e.g., search
  and import book, start reading, complete reading, review book).
- Coverage is a consequence, not a goal. The objective is
  business-rule protection. Minimum: 80% coverage. Target: 90%+
  for domain and application layers.

### IV. Infrastructure Isolation

External dependencies MUST be encapsulated behind abstractions.
Business rules MUST NOT depend on infrastructure details.

- Open Library interactions MUST be encapsulated behind an
  abstraction (e.g., `BookSearchProvider` interface). The
  application MUST NOT depend directly on Open Library-specific
  contracts.
- Tests MUST NOT depend on external network availability. All
  external API interactions MUST be mocked.
- Business rules MUST NOT depend on database constraints. Database
  constraints provide additional safety, not primary validation.
- Every schema modification MUST be performed through migrations.
  Direct database modifications are prohibited.
- Database access MUST occur through repositories. Business
  services MUST NOT execute raw SQL.

### V. Code Quality & Strictness

Code MUST be strict, explicit, and maintainable.

- TypeScript strict mode MUST be enabled (`"strict": true`).
- Usage of `any` is prohibited except for unavoidable third-party
  interoperability. Every occurrence MUST be justified.
- Names MUST express intent (e.g., `markBookAsCompleted()`,
  `calculateGoalProgress()`). Avoid generic names like
  `process()`, `handleData()`, `update()`.
- Functions MUST perform one task, remain small, and avoid deep
  nesting.
- Immutable operations MUST be preferred whenever practical.

## Technology Stack & Infrastructure Constraints

The project MUST exclusively use the following technologies:

| Layer | Technology |
|-------|-----------|
| Framework | Next.js |
| Language | TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Unit/Integration Testing | Jest + React Testing Library |
| E2E Testing | Playwright |

No additional framework SHALL be introduced without explicit
justification and a documented rationale.

## Development Workflow & Definition of Done

### Git Workflow

- The main branch MUST remain deployable and testable at all
  times.
- Commits MUST represent a single logical change using
  conventional prefixes (e.g., `test:`, `feat:`, `refactor:`).
- Code MUST NOT be merged if tests fail, linting fails, or type
  checking fails.

### Definition of Done

A feature is considered complete ONLY if ALL of the following
are satisfied:

- [ ] Requirements are implemented
- [ ] Unit tests exist
- [ ] Integration tests exist where applicable
- [ ] E2E tests are updated when necessary
- [ ] Type checking passes
- [ ] Linting passes
- [ ] Existing tests remain green
- [ ] Documentation is updated

If any item is missing, the feature is NOT done.

## Governance

This constitution supersedes all other development practices in
the project. All code contributions MUST verify compliance with
these principles.

### Amendment Procedure

1. Propose the change with rationale and impact assessment.
2. Document the amendment in this file with version bump.
3. Ensure all dependent templates and artifacts are updated to
   reflect the change.

### Versioning Policy

This constitution follows semantic versioning:
- **MAJOR**: Backward-incompatible governance or principle
  removals/redefinitions.
- **MINOR**: New principle/section added or materially expanded.
- **PATCH**: Clarifications, wording, or non-semantic refinements.

### Compliance Review

Every pull request and code review MUST verify compliance with
these principles. Complexity beyond what these principles allow
MUST be explicitly justified.

**Version**: 1.0.0 | **Ratified**: 2026-06-17 | **Last Amended**: 2026-06-17
