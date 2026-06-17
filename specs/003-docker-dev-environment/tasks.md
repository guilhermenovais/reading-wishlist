# Tasks: Docker Development Environment

**Input**: Design documents from `/specs/003-docker-dev-environment/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/cli.md, quickstart.md

**Tests**: Not requested — no test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No setup phase needed — this feature adds infrastructure files to the existing project root. No project structure changes required.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create the base Docker image definition that all services depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T001 Create Dockerfile.dev with node:24-slim base image, WORKDIR /app, COPY package*.json, npm ci, and COPY project files at Dockerfile.dev

**Checkpoint**: Base image definition ready — user story implementation can now begin

---

## Phase 3: User Story 1 — Start Development Environment with a Single Command (Priority: P1) 🎯 MVP

**Goal**: A developer runs `docker compose up` and the full stack (Next.js + PostgreSQL) starts and is accessible at http://localhost:3000

**Independent Test**: Run `docker compose up` on a machine with only Docker installed and verify the application is accessible in a browser at http://localhost:3000

### Implementation for User Story 1

- [x] T002 [US1] Create docker-entrypoint.sh with PostgreSQL readiness wait loop, npx prisma migrate deploy, and exec npm run dev at docker-entrypoint.sh
- [x] T003 [US1] Set executable permission on docker-entrypoint.sh
- [x] T004 [US1] Create docker-compose.yml with app service (build from Dockerfile.dev, entrypoint, depends_on db with service_healthy condition, DATABASE_URL env var) and db service (postgres:17-alpine, POSTGRES_USER/PASSWORD/DB env vars, pg_isready healthcheck) at docker-compose.yml

**Checkpoint**: `docker compose up` starts both services and the application is accessible — core MVP functional

---

## Phase 4: User Story 2 — Live Code Reloading During Development (Priority: P1)

**Goal**: Source file changes on the host are immediately reflected in the running application without container restarts

**Independent Test**: Start the environment, edit a source file on the host, verify the change appears in the browser without manual restart

### Implementation for User Story 2

- [x] T005 [US2] Add source code bind mount (.:/app) and anonymous node_modules volume (/app/node_modules) to app service volumes in docker-compose.yml
- [x] T006 [US2] Add WATCHPACK_POLLING=true environment variable to app service in docker-compose.yml

**Checkpoint**: Editing source files on the host triggers automatic reload in the containerized application

---

## Phase 5: User Story 3 — Minimal Port Exposure (Priority: P1)

**Goal**: Only port 3000 is exposed to the host; the database is accessible only over the internal container network

**Independent Test**: Start the environment, confirm port 3000 is reachable from the host, confirm direct connection to PostgreSQL on port 5432 from the host is refused

### Implementation for User Story 3

- [x] T007 [US3] Add custom bridge network (app-network) definition to docker-compose.yml and assign both app and db services to it
- [x] T008 [US3] Add port mapping 3000:3000 to app service only in docker-compose.yml (db service must have no ports key)

**Checkpoint**: Only port 3000 is reachable from the host; database is isolated on the internal network

---

## Phase 6: User Story 4 — Database Persistence Across Restarts (Priority: P2)

**Goal**: Database data survives stop/start cycles; developers can explicitly reset with `docker compose down -v`

**Independent Test**: Start the environment, add data through the application, stop with `docker compose down`, restart, verify data is still present

### Implementation for User Story 4

- [x] T009 [US4] Add pgdata named volume definition to docker-compose.yml and mount to /var/lib/postgresql/data for db service

**Checkpoint**: Data persists across `docker compose down` / `docker compose up` cycles; `docker compose down -v` resets to clean state

---

## Phase 7: User Story 5 — Run Tests Inside the Docker Environment (Priority: P2)

**Goal**: All three test suites (unit, integration, E2E) execute successfully inside the containerized environment via `docker compose exec`

**Independent Test**: Start the environment, run each test command (`docker compose exec app npm test`, `docker compose exec app npm run test:integration`, `docker compose exec app npx playwright test`) and verify results

### Implementation for User Story 5

- [x] T010 [US5] Add Playwright Chromium browser installation (RUN npx playwright install --with-deps chromium) to Dockerfile.dev

**Checkpoint**: All three test suites run inside the container via `docker compose exec app <command>`

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Validation and verification across all user stories

- [x] T011 Validate all quickstart.md scenarios against the running Docker environment
- [x] T012 Verify all success criteria (SC-001 through SC-006) are met

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: No dependencies — can start immediately. BLOCKS all user stories.
- **US1 (Phase 3)**: Depends on Foundational (Phase 2) — creates core files
- **US2 (Phase 4)**: Depends on US1 (Phase 3) — adds to docker-compose.yml created in US1
- **US3 (Phase 5)**: Depends on US1 (Phase 3) — adds to docker-compose.yml created in US1
- **US4 (Phase 6)**: Depends on US1 (Phase 3) — adds to docker-compose.yml created in US1
- **US5 (Phase 7)**: Depends on Foundational (Phase 2) — modifies Dockerfile.dev
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Depends on Foundational only — creates docker-compose.yml and docker-entrypoint.sh
- **US2 (P1)**: Depends on US1 — modifies docker-compose.yml app service volumes
- **US3 (P1)**: Depends on US1 — modifies docker-compose.yml network and ports
- **US4 (P2)**: Depends on US1 — modifies docker-compose.yml volumes
- **US5 (P2)**: Depends on Foundational only — modifies Dockerfile.dev (can run in parallel with US1-US4)

### Within Each User Story

- Tasks within a story are sequential (same file modifications)
- Core implementation before integration

### Parallel Opportunities

- **US5 (Phase 7) can run in parallel with US2, US3, US4** — US5 modifies Dockerfile.dev while US2-US4 modify docker-compose.yml (different files)
- **US2 and US3 and US4** modify the same file (docker-compose.yml) but different sections — can potentially run in parallel if coordinated carefully, though sequential execution is safer
- **T011 and T012** in Polish phase can run in parallel

---

## Parallel Example: US2 + US3 + US4 (after US1 completes)

```
# These modify different sections of docker-compose.yml — can potentially parallelize:
Task T005: Add bind mount and anonymous volume to app service volumes
Task T007: Add custom bridge network definition
Task T009: Add pgdata named volume for db service

# US5 modifies a different file entirely — safe to parallelize with any of the above:
Task T010: Add Playwright installation to Dockerfile.dev
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (Dockerfile.dev)
2. Complete Phase 3: User Story 1 (docker-compose.yml + docker-entrypoint.sh)
3. **STOP and VALIDATE**: Run `docker compose up` and verify the app starts
4. The environment is usable at this point, even without the polish of US2-US5

### Incremental Delivery

1. Complete Foundational → Dockerfile.dev ready
2. Add US1 → `docker compose up` works → MVP!
3. Add US2 → Live reloading configured
4. Add US3 → Network isolation configured
5. Add US4 → Database persistence configured
6. Add US5 → Test execution inside containers
7. Polish → Full validation against quickstart.md and success criteria

### Notes on This Feature

This is an infrastructure-only feature with 3 new files at the project root:
- `Dockerfile.dev` — Development container image
- `docker-compose.yml` — Service orchestration
- `docker-entrypoint.sh` — Startup script

No existing application code, test suites, or configuration files are modified. The user stories map to different configuration aspects of the same files, which means most tasks modify `docker-compose.yml`. Sequential execution within the compose-related stories (US1 → US2 → US3 → US4) is recommended.

---

## Notes

- No [P] markers used — all tasks modify shared files (docker-compose.yml or Dockerfile.dev) and are best executed sequentially
- [Story] label maps task to specific user story for traceability
- Each user story adds independently verifiable configuration
- Commit after each phase or logical group
- Stop at any checkpoint to validate the environment
