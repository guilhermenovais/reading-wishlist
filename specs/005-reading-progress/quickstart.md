# Quickstart: Reading Progress

**Feature**: 005-reading-progress  
**Date**: 2026-06-17

## Prerequisites

- Docker and Docker Compose running (for PostgreSQL)
- Node.js installed
- Dependencies installed (`npm install`)

## Setup

1. Start the database:
   ```bash
   docker compose up -d
   ```

2. Generate Prisma client and run migrations:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

3. Start the dev server:
   ```bash
   npm run dev
   ```

## Testing

### Unit tests
```bash
npm test
```

### Integration tests (requires running database)
```bash
npm run test:integration
```

### E2E tests (requires running dev server)
```bash
npm run test:e2e
```

## Verifying the Feature

1. **Add a book** to the wishlist via the home page form or search/import
2. **View the book detail** by clicking the book title
3. **Start reading** by clicking the "Start Reading" button on the detail page
4. **Verify status changed** to READING with a reading start date displayed
5. **Navigate to reading list** via the "Reading" link in the navigation
6. **Verify the book appears** in the reading list
7. **Return to wishlist** and verify the book still appears there with READING status badge

## API Testing (curl)

```bash
# Start reading a wishlist book
curl -X PATCH http://localhost:3000/api/books/1/start-reading

# List only reading books
curl http://localhost:3000/api/books?status=READING

# View book details (includes readingStartDate)
curl http://localhost:3000/api/books/1
```
