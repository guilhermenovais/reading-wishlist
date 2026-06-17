# Quickstart: Docker Development Environment

**Feature**: 003-docker-dev-environment  
**Date**: 2026-06-17

## Prerequisites

- Docker Engine 24+ and Docker Compose v2
- No other services running on port 3000

## Start the environment

```bash
docker compose up
```

Wait for the "Ready" message from the Next.js dev server. The application is available at `http://localhost:3000`.

## Stop the environment

```bash
docker compose down
```

Database data is preserved for the next startup.

## Clean reset (remove all data)

```bash
docker compose down -v
```

This removes the PostgreSQL data volume, giving a fresh database on next startup.

## Run tests

With the environment running:

```bash
# Unit tests
docker compose exec app npm test

# Integration tests
docker compose exec app npm run test:integration

# E2E tests
docker compose exec app npx playwright test
```

## Install a new dependency

```bash
docker compose exec app npm install <package-name>
```

To persist the change, rebuild after updating `package.json`:

```bash
docker compose up --build
```

## Access the database directly

```bash
docker compose exec db psql -U user -d reading_wishlist
```

## Rebuild after Dockerfile changes

```bash
docker compose up --build
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 3000 already in use | Stop the conflicting process or change the port mapping in `docker-compose.yml` |
| Hot reload not working | Verify `WATCHPACK_POLLING=true` is set in `docker-compose.yml`. On macOS/Windows, restart Docker Desktop |
| Database connection refused | Wait for the healthcheck to pass. Check `docker compose logs db` |
| Stale dependencies | Rebuild with `docker compose up --build` |
