# Quickstart: Google Books Search

## Prerequisites

- Node.js 18+
- PostgreSQL running with `DATABASE_URL` configured
- Google Books API key (see below)

## Google Books API Key Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project (or select an existing one)
3. Enable the **Books API** under APIs & Services → Library
4. Create an API key under APIs & Services → Credentials
5. Add the key to your `.env` file:

```env
GOOGLE_BOOKS_API_KEY=your_api_key_here
```

## Running the Application

```bash
npm install
npx prisma migrate deploy
npm run dev
```

## Running Tests

```bash
# Unit tests (no external dependencies)
npm test

# Integration tests (requires mocked fetch, no API key needed)
npm run test:integration

# E2E tests (requires running app + valid API key)
npm run test:e2e
```

## Verifying the Change

1. Start the dev server: `npm run dev`
2. Navigate to `/search`
3. Search for a book title (e.g., "Clean Code")
4. Verify results show title, author, year, ISBN, and cover thumbnails
5. Import a book and verify it appears in the wishlist at `/`
