# Research: Docker Development Environment

**Feature**: 003-docker-dev-environment  
**Date**: 2026-06-17  
**Status**: Complete

## 1. Docker Compose Structure for Next.js + PostgreSQL

**Decision**: Use a simple, single-stage `Dockerfile.dev` dedicated to development, paired with a `docker-compose.yml` (Compose v2 format). Base image: `node:24-alpine`.

**Rationale**: A multi-stage Dockerfile is valuable for production builds (smaller final image, build caching) but adds unnecessary complexity for a dev-only environment. A single `Dockerfile.dev` keeps the setup transparent and fast to iterate on. The `node:24-alpine` image matches the project's Node.js v24.x requirement while keeping the image small (~180MB vs ~1GB for the full Debian image). Alpine includes the essentials; native module compilation (if needed) can be handled by adding `build-base` in the Dockerfile.

**Alternatives considered**:
- `node:24-slim` (Debian-based slim): Larger than Alpine but avoids potential musl/glibc compatibility issues. Rejected because Prisma ships prebuilt binaries for musl/Alpine, and Next.js has no native modules requiring glibc.
- Multi-stage Dockerfile: Overkill for development. The dev container doesn't need a separate build stage since it runs `next dev` directly with source mounted.
- No Dockerfile (use `image: node:24-alpine` directly in Compose): Rejected because we need to install dependencies inside the container and set up the working directory, which requires a Dockerfile.

## 2. Hot/Live Reloading with Next.js in Docker

**Decision**: Bind-mount the project root into the container at `/app`. Use an anonymous volume for `node_modules` to prevent host/container conflicts. Set `WATCHPACK_POLLING=true` as a fallback environment variable for file-watching compatibility.

**Rationale**: Next.js uses Webpack's Watchpack (or Turbopack) for file watching, which relies on filesystem events (inotify on Linux). Bind mounts on Linux propagate inotify events natively, so hot reload works out of the box. On macOS/Windows (Docker Desktop), filesystem events from bind mounts can be unreliable — `WATCHPACK_POLLING=true` enables polling as a fallback, ensuring hot reload works across all platforms. The anonymous volume for `node_modules` ensures that dependencies installed inside the container (compiled for the container's Linux architecture) are not overwritten by the host's `node_modules` (which may be compiled for a different OS/architecture).

**Alternatives considered**:
- Mounting only `src/` and `prisma/` instead of the full project root: Rejected because Next.js needs access to `next.config.ts`, `tsconfig.json`, `package.json`, and other root-level config files. Selective mounting would require enumerating every file and break when new root-level files are added.
- Using `node_modules` from the host (no anonymous volume): Rejected because native binaries (Prisma engine binaries, optional native deps) compiled on macOS/Windows won't work inside a Linux container.
- Docker Compose `develop.watch` (Compose Watch): A newer feature that syncs files and can trigger rebuilds. Rejected as overly complex for this use case — simple bind mounts with polling achieve the same result with less configuration and broader Docker version compatibility.

## 3. Minimal Port Exposure

**Decision**: Expose only port 3000 (Next.js dev server) to the host. PostgreSQL communicates exclusively over the internal Docker network. Use a single custom bridge network defined in `docker-compose.yml`.

**Rationale**: The spec explicitly requires minimal port exposure (FR-002, US3). Docker Compose creates a default network for all services, but defining an explicit network makes the intent clear. The `app` service uses `ports: ["3000:3000"]` to expose the dev server. The `db` service has no `ports` mapping — it is reachable by the `app` service via the internal network using the service name as hostname (e.g., `db:5432`), but is inaccessible from the host. This satisfies SC-002 (only 1 port exposed).

**Alternatives considered**:
- Exposing PostgreSQL on a non-standard host port (e.g., `15432:5432`) for developer convenience: Rejected because the spec explicitly requires the database to be inaccessible from the host. Developers who need direct DB access can use `docker compose exec db psql`.
- Using `network_mode: host`: Rejected because it exposes all container ports to the host, directly violating the minimal exposure requirement.
- Multiple Docker networks (e.g., `frontend` and `backend`): Rejected as unnecessary for a two-service setup. One internal network suffices.

## 4. Database Migration on Startup

**Decision**: Use a custom entrypoint script (`docker-entrypoint.sh`) that waits for PostgreSQL to be ready, runs `npx prisma migrate deploy`, then starts `npm run dev`. Combine with `depends_on` and a PostgreSQL healthcheck in Compose.

**Rationale**: Prisma migrations must run after the database is accepting connections but before the application starts. A custom entrypoint script provides the most control and visibility. `depends_on` with a `condition: service_healthy` ensures Docker won't even start the app container until PostgreSQL passes its healthcheck, eliminating race conditions. The entrypoint then runs migrations (idempotent — safe to run repeatedly) and starts the dev server. This satisfies FR-006.

**Alternatives considered**:
- Using `depends_on` alone (without healthcheck): Rejected because `depends_on` only waits for the container to start, not for PostgreSQL to be ready to accept connections. Migrations would fail intermittently.
- Running migrations in a separate `init` container: More complex and introduces a third service. Rejected because the entrypoint approach is simpler and achieves the same result.
- Using `npx prisma db push` instead of `prisma migrate deploy`: `db push` is for prototyping and can cause data loss. `migrate deploy` applies recorded migrations safely and is the correct choice for a persistent development database.

## 5. Volume Strategy for Persistence

**Decision**: Three volume types:
1. **Named volume** (`pgdata`) for PostgreSQL data directory (`/var/lib/postgresql/data`) — persists across restarts.
2. **Bind mount** (`.:/app`) for project source code — enables live editing from the host.
3. **Anonymous volume** (`/app/node_modules`) for Node.js dependencies — prevents host/container conflicts.

**Rationale**: Named volumes survive `docker compose down` (unless `--volumes` / `-v` flag is used), satisfying FR-005 and US4. The bind mount is essential for hot reloading (US2). The anonymous volume isolates container-specific `node_modules` from the host. This combination gives developers the "clean slate" option via `docker compose down -v` (US4, acceptance scenario 2).

**Alternatives considered**:
- Named volume for `node_modules` instead of anonymous: Would persist `node_modules` across container rebuilds, potentially causing stale dependency issues. Anonymous volumes are recreated on each `docker compose up --build`, which is the desired behavior when dependencies change.
- Docker-managed volume for source code: Rejected because it would prevent live editing from the host.
- No volume for PostgreSQL (ephemeral data): Rejected because the spec requires data persistence (FR-005).

## 6. Running Tests Inside Containers

**Decision**: Tests are executed via `docker compose exec app <command>`:
- Unit tests: `docker compose exec app npm test`
- Integration tests: `docker compose exec app npm run test:integration`
- E2E tests: `docker compose exec app npx playwright test`

For Playwright, install Playwright browsers inside the container via the Dockerfile (`npx playwright install --with-deps chromium`).

**Rationale**: Using `exec` runs commands in the already-running container, sharing the same network, volumes, and environment. This means integration tests automatically connect to the containerized PostgreSQL, and E2E tests hit the running Next.js dev server — no additional configuration needed. Installing Playwright's Chromium inside the container ensures E2E tests work without a host browser. The `--with-deps` flag installs system-level dependencies (fonts, libraries) required by Chromium on Alpine/Debian.

**Alternatives considered**:
- Dedicated test service in Compose: Adds complexity. Since the dev container already has all dependencies, `exec` is simpler.
- Running Playwright tests from the host against the containerized app: Would work but violates the "run tests inside Docker" requirement (US5) and introduces host-dependency on Playwright browser installations.
- Using `mcr.microsoft.com/playwright` as the base image: This is Debian-based and very large (~2GB). Rejected in favor of installing Playwright browsers into the existing `node:24-alpine` image. Note: if Alpine compatibility becomes an issue with Playwright's Chromium, switching to `node:24-slim` (Debian-based) is the fallback.

**Important note on base image**: Playwright does not officially support Alpine Linux. The `npx playwright install --with-deps` command targets Debian/Ubuntu. If Playwright is required inside the container (for E2E tests), the base image should be `node:24-slim` (Debian-based) instead of `node:24-alpine`. This overrides the decision in section 1 — use `node:24-slim` to ensure Playwright compatibility.

## 7. Environment Configuration

**Decision**: Use `docker-compose.yml` `environment` section to override `DATABASE_URL` for the app service. The database connection string points to the Compose service name (`db`) instead of `localhost`. No separate `.env.docker` file needed.

The Docker-specific DATABASE_URL: `postgresql://user:password@db:5432/reading_wishlist?schema=public`

PostgreSQL container configured with matching environment variables:
- `POSTGRES_USER=user`
- `POSTGRES_PASSWORD=password`
- `POSTGRES_DB=reading_wishlist`

**Rationale**: Defining environment variables directly in `docker-compose.yml` keeps all Docker configuration in one place and avoids confusion about which `.env` file applies in which context. The existing `.env` file continues to work for non-Docker local development. This satisfies FR-010 (Docker setup does not alter existing local development configuration).

**Alternatives considered**:
- Separate `.env.docker` file with `env_file` directive: Adds another file to maintain. The DATABASE_URL is the only difference between Docker and local, so inline environment in Compose is simpler.
- Modifying the existing `.env` file: Rejected because it would break non-Docker local development (FR-010).
- Using Docker Compose variable substitution (`${POSTGRES_USER:-user}`): Adds indirection without benefit for a development-only setup.

## 8. Cross-Platform Considerations

**Decision**: Use `WATCHPACK_POLLING=true` for file-watching compatibility. Use `node:24-slim` (Debian) as the base image for Playwright compatibility. Document that Docker and Docker Compose v2 are prerequisites.

**Rationale**: 
- **Linux**: Bind mounts propagate inotify events natively. Hot reload works without polling. Polling is harmless when enabled.
- **macOS**: Docker Desktop uses VirtioFS (or gRPC FUSE) for bind mounts. Filesystem events may be delayed or lost. Polling ensures reliability.
- **Windows**: Docker Desktop with WSL 2 backend handles bind mounts well when the project is on the WSL filesystem. From the Windows filesystem, performance is poor. Polling helps with event reliability.
- `WATCHPACK_POLLING=true` adds minimal CPU overhead (~1-2%) but guarantees hot reload works everywhere.

**Alternatives considered**:
- Not setting `WATCHPACK_POLLING` and relying on native events: Would work on Linux but cause intermittent hot reload failures on macOS/Windows.
- Using Docker Compose `develop.watch`: Platform-dependent behavior and requires Docker Compose v2.22+. Less widely available than basic bind mounts + polling.
- Recommending WSL-only for Windows users: Too restrictive. The polling approach works with both native Windows and WSL setups.

## Summary of Key Decisions

| Area | Decision |
|------|----------|
| Base image | `node:24-slim` (Debian, for Playwright compatibility) |
| Compose format | Compose v2 (`docker-compose.yml`) |
| Port exposure | Only port 3000 to host |
| Source code | Bind mount `.:/app` |
| node_modules | Anonymous volume `/app/node_modules` |
| PostgreSQL data | Named volume `pgdata` |
| Migrations | Entrypoint script + `depends_on` with healthcheck |
| Hot reload | `WATCHPACK_POLLING=true` environment variable |
| Environment | `DATABASE_URL` overridden inline in Compose |
| Tests | `docker compose exec` for all test suites; Playwright browsers installed in image |
| Networking | Single custom bridge network, no DB port exposure |
