# Quickstart: Wishlist Book Covers

## Prerequisites

- Node.js and npm installed
- PostgreSQL running with `DATABASE_URL` configured in `.env`
- `GOOGLE_BOOKS_API_KEY` configured in `.env` (for search import with covers)

## Setup

```bash
# Install dependencies (if not already done)
npm install

# Run the new migration to add coverImageUrl column
npx prisma migrate dev

# Create the uploads directory
mkdir -p public/uploads/covers

# Start the development server
npm run dev
```

## Verify

1. **Cover from search import**: Go to `/search`, search for a book with a cover, import it, return to the wishlist — the cover should display.
2. **Cover from manual upload**: On the home page, add a book manually with a cover image file — the cover should display on the wishlist.
3. **Placeholder**: Add a book without a cover — a placeholder should appear instead.

## Run Tests

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```
