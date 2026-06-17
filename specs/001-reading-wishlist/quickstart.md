# Quickstart: Reading Wishlist MVP

**Feature**: 001-reading-wishlist | **Date**: 2026-06-17

## Prerequisites

- Node.js 18+
- PostgreSQL running locally (or via Docker)
- npm or yarn

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure database**:
   Create a `.env` file at the project root:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/reading_wishlist?schema=public"
   ```

3. **Run database migrations**:
   ```bash
   npx prisma migrate dev
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open the application**:
   Navigate to `http://localhost:3000` in your browser.

## Running Tests

```bash
# Unit tests
npm test

# Unit tests in watch mode (for TDD)
npm test -- --watch

# Integration tests (requires PostgreSQL)
npm run test:integration

# E2E tests (requires dev server running)
npm run test:e2e
```

## Project Structure

```
src/
├── app/                    # Next.js App Router (pages + API routes)
├── modules/books/
│   ├── domain/             # Book entity, status enum, repository interface
│   ├── application/        # BookService (use cases)
│   ├── infrastructure/     # PrismaBookRepository
│   └── presentation/       # React components
└── lib/                    # Shared utilities (Prisma client)

prisma/                     # Schema and migrations
tests/                      # Unit, integration, and E2E tests
```

## Key Development Workflows

### Adding a new business rule (TDD cycle)

1. Write a failing unit test in `tests/unit/`
2. Implement the minimum code to pass in `src/modules/books/domain/` or `application/`
3. Refactor while keeping tests green

### Modifying the database schema

1. Update `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name descriptive-name`
3. Update the repository implementation if needed
