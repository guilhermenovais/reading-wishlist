# Implementation Plan: Docker Development Environment

**Branch**: `003-docker-dev-environment` | **Date**: 2026-06-17 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/003-docker-dev-environment/spec.md`

## Summary

Containerize the existing Reading Wishlist development environment using Docker Compose so that developers can start the full stack (Next.js + PostgreSQL) with a single command. Only port 3000 is exposed to the host; PostgreSQL communicates exclusively over the internal container network. Source code is bind-mounted for live reloading, database data is persisted via named volumes, and all test suites (unit, integration, E2E) can run inside the container. No application code or database schema changes are required — this is purely infrastructure.

## Technical Context

**Language/Version**: TypeScript 6.x (strict mode enabled), Node.js 24.x  
**Primary Dependencies**: Next.js 16+ (App Router), Prisma 6.x, React 19+, React Testing Library  
**Storage**: PostgreSQL 17 (via Prisma ORM, no schema changes)  
**Testing**: Jest + React Testing Library (unit/integration), Playwright (E2E with Chromium)  
**Target Platform**: Docker (Linux containers), developer hosts on Linux, macOS, or Windows  
**Project Type**: Web application (Next.js full-stack), infrastructure/DevOps feature  
**Performance Goals**: Environment ready in under 5 minutes from fresh clone (SC-001), hot reload with no additional delay vs. native (SC-003)  
**Constraints**: Only 1 port exposed (SC-002), database persists across stop/start cycles (SC-004), all three test suites run inside containers (SC-005)  
**Scale/Scope**: 2 Docker services (app + db), 3 new files (Dockerfile.dev, docker-compose.yml, docker-entrypoint.sh), 0 application code changes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Test-First Development | PASS | This feature adds infrastructure configuration (Dockerfile, Compose, entrypoint script), not business logic. TDD applies to business rules; Docker config is validated by acceptance scenarios (start env, verify connectivity, check port exposure, data persistence, test execution). No new domain code → no new unit tests required by this principle. |
| II. Domain-First Architecture | PASS | No changes to domain, application, infrastructure, or presentation layers. Docker wraps the existing architecture without altering it. |
| III. Testing Pyramid | PASS | Existing test suites remain unchanged. This feature enables running all existing tests inside the containerized environment (US5). No new application tests needed. |
| IV. Infrastructure Isolation | PASS | Docker configuration encapsulates the development environment setup. The application code remains unaware of whether it runs in Docker or natively — only `DATABASE_URL` changes, which is already externalized via environment variable. |
| V. Code Quality & Strictness | PASS | No TypeScript code changes. Docker artifacts (Dockerfile, Compose YAML, shell script) follow standard conventions. |

**Gate Result**: PASS — no violations. Feature is infrastructure-only and does not introduce or modify business logic.

**Post-Phase 1 Re-check**: PASS — design artifacts confirm no domain/application layer changes. All Docker configuration is external to the application codebase.

## Project Structure

### Documentation (this feature)

```text
specs/003-docker-dev-environment/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (infrastructure entities)
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── cli.md           # Developer-facing Docker Compose commands
└── tasks.md             # Phase 2 output (/speckit-tasks command)
```

### Source Code (repository root)

```text
# New files (project root)
Dockerfile.dev           # Development container image (node:24-slim)
docker-compose.yml       # Service orchestration (app + db)
docker-entrypoint.sh     # Startup script: wait for DB, migrate, start dev server

# Existing files (NO changes)
src/                     # Application source — unchanged
├── app/
├── modules/
└── lib/

prisma/
├── schema.prisma        # Unchanged
└── migrations/          # Unchanged (applied inside container)

tests/                   # Test suites — unchanged
├── unit/
├── integration/
├── helpers/
└── e2e/

package.json             # Unchanged
.env                     # Unchanged (Docker overrides DATABASE_URL via Compose)
.env.example             # Unchanged
```

**Structure Decision**: Three new root-level files (`Dockerfile.dev`, `docker-compose.yml`, `docker-entrypoint.sh`) are added. No existing application, test, or configuration files are modified. The Docker environment overrides `DATABASE_URL` inline in the Compose file, preserving the existing local development setup (FR-010).

## Complexity Tracking

No violations detected. No complexity justifications needed.
