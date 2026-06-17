# CLI Contracts: Docker Development Environment

**Feature**: 003-docker-dev-environment  
**Date**: 2026-06-17

## Developer-Facing Commands

This feature exposes no new API endpoints. The interface is a set of Docker Compose CLI commands.

### Start Environment

```
docker compose up
```

**Preconditions**: Docker daemon running, port 3000 available  
**Postconditions**: `app` and `db` containers running, database migrated, application accessible at `http://localhost:3000`  
**Side effects**: Creates `pgdata` named volume if not present

### Stop Environment

```
docker compose down
```

**Preconditions**: Environment is running  
**Postconditions**: All containers stopped and removed, `pgdata` volume preserved  
**Side effects**: None

### Stop and Reset

```
docker compose down -v
```

**Preconditions**: Environment is running (or stopped with orphan volumes)  
**Postconditions**: All containers and volumes removed  
**Side effects**: Database data permanently deleted

### Run Unit Tests

```
docker compose exec app npm test
```

**Preconditions**: Environment is running  
**Postconditions**: Jest unit tests executed, results printed to stdout

### Run Integration Tests

```
docker compose exec app npm run test:integration
```

**Preconditions**: Environment is running  
**Postconditions**: Jest integration tests executed against containerized PostgreSQL

### Run E2E Tests

```
docker compose exec app npx playwright test
```

**Preconditions**: Environment is running, Playwright browsers installed in container  
**Postconditions**: Playwright tests executed against running dev server

### Rebuild After Changes

```
docker compose up --build
```

**Preconditions**: Docker daemon running  
**Postconditions**: Container image rebuilt with current `Dockerfile.dev` and `package.json`

## Exposed Ports

| Host Port | Container | Container Port | Protocol |
|-----------|-----------|----------------|----------|
| 3000 | `app` | 3000 | TCP |

No other ports are exposed to the host.

## File Artifacts

| File | Purpose |
|------|---------|
| `Dockerfile.dev` | Development container image definition |
| `docker-compose.yml` | Service orchestration |
| `docker-entrypoint.sh` | Startup script (migrations + dev server) |
