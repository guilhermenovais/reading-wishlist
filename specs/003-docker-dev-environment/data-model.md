# Data Model: Docker Development Environment

**Feature**: 003-docker-dev-environment  
**Date**: 2026-06-17

## Overview

This feature introduces no new domain entities or database schema changes. It is purely infrastructure: containerizing the existing application and database for development use.

## Infrastructure Entities

### Docker Compose Services

| Service | Image | Role | Exposed Ports |
|---------|-------|------|---------------|
| `app` | Custom (`Dockerfile.dev` based on `node:24-slim`) | Next.js dev server, Prisma client, test runner | `3000:3000` (host:container) |
| `db` | `postgres:17-alpine` | PostgreSQL database | None (internal only) |

### Volumes

| Volume | Type | Mount Point | Purpose |
|--------|------|-------------|---------|
| `.` (project root) | Bind mount | `/app` | Source code for live editing |
| `node_modules` | Anonymous | `/app/node_modules` | Isolated container dependencies |
| `pgdata` | Named | `/var/lib/postgresql/data` | Persistent database storage |

### Network

| Network | Driver | Services | Purpose |
|---------|--------|----------|---------|
| `app-network` | bridge | `app`, `db` | Internal service communication |

### Environment Variables

| Variable | Service | Value | Purpose |
|----------|---------|-------|---------|
| `DATABASE_URL` | `app` | `postgresql://user:password@db:5432/reading_wishlist?schema=public` | Prisma database connection (points to `db` service) |
| `WATCHPACK_POLLING` | `app` | `true` | Cross-platform file watching for hot reload |
| `POSTGRES_USER` | `db` | `user` | Database user |
| `POSTGRES_PASSWORD` | `db` | `password` | Database password |
| `POSTGRES_DB` | `db` | `reading_wishlist` | Database name |

## State Transitions

### Container Lifecycle

```
Not Running → Starting (docker compose up)
  → DB healthcheck passes
  → Migrations run (entrypoint)
  → Dev server starts
  → Running

Running → Stopped (docker compose down)
  → Data preserved in pgdata volume

Running → Clean Reset (docker compose down -v)
  → All volumes removed
  → Data lost (fresh start)
```

## Relationships to Existing Data Model

No changes to the Prisma schema or database structure. The existing `Book` model, `BookStatus` enum, and all migrations are used as-is inside the containerized PostgreSQL.
