# Quickstart: Completed Books

## Prerequisites

- Node.js, PostgreSQL running, `.env` with `DATABASE_URL`
- Dependencies installed (`npm install`)

## Database Setup

After pulling this branch:

```bash
npx prisma migrate dev
```

This applies the migration adding `COMPLETED` to `BookStatus`, plus `completionDate` and `coverImageUrl` columns to the `Book` table.

## Running

```bash
npm run dev
```

## Testing

```bash
# Unit tests (domain + application)
npm test

# Integration tests (database)
npm run test:integration

# E2E tests
npm run test:e2e
```

## Feature Walkthrough

1. **Import a book** via Search → book is added to Wishlist
2. **Start reading** from the book detail page → book moves to Reading
3. **Mark as completed** from the book detail page → modal with date picker appears → confirm → book moves to Completed
4. **View completed books** via the "Completed" link in the navigation bar
5. **View completion date** on the book detail page for any completed book
