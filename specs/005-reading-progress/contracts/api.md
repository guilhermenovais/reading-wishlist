# API Contracts: Reading Progress

**Feature**: 005-reading-progress  
**Date**: 2026-06-17

## Modified Endpoints

### GET /api/books

Returns all books. Response now includes `readingStartDate`.

**Response** `200 OK`:
```json
{
  "books": [
    {
      "id": 1,
      "title": "Clean Code",
      "author": "Robert C. Martin",
      "status": "WISHLIST",
      "isbn": "978-0132350884",
      "publicationYear": 2008,
      "readingStartDate": null,
      "createdAt": "2026-06-17T10:00:00.000Z"
    },
    {
      "id": 2,
      "title": "Refactoring",
      "author": "Martin Fowler",
      "status": "READING",
      "isbn": null,
      "publicationYear": null,
      "readingStartDate": "2026-06-17T14:30:00.000Z",
      "createdAt": "2026-06-17T10:00:00.000Z"
    }
  ]
}
```

### GET /api/books/[id]

Returns a single book. Response now includes `readingStartDate`.

**Response** `200 OK`:
```json
{
  "id": 1,
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "status": "READING",
  "isbn": "978-0132350884",
  "publicationYear": 2008,
  "readingStartDate": "2026-06-17T14:30:00.000Z",
  "createdAt": "2026-06-17T10:00:00.000Z"
}
```

## New Endpoints

### PATCH /api/books/[id]/start-reading

Transitions a book from WISHLIST to READING status.

**Request**: No body required.

**Response** `200 OK` (success):
```json
{
  "id": 1,
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "status": "READING",
  "isbn": "978-0132350884",
  "publicationYear": 2008,
  "readingStartDate": "2026-06-17T14:30:00.000Z",
  "createdAt": "2026-06-17T10:00:00.000Z"
}
```

**Response** `400 Bad Request` (invalid ID):
```json
{
  "error": "Invalid book ID"
}
```

**Response** `404 Not Found` (book does not exist):
```json
{
  "error": "Book not found"
}
```

**Response** `409 Conflict` (book is already READING):
```json
{
  "error": "Only wishlist books can be started"
}
```

### GET /api/books?status=READING

Filter books by status. This extends the existing GET /api/books endpoint with an optional query parameter.

**Query Parameters**:
- `status` (optional): Filter by BookStatus value (`WISHLIST`, `READING`)

**Response** `200 OK`:
```json
{
  "books": [
    {
      "id": 2,
      "title": "Refactoring",
      "author": "Martin Fowler",
      "status": "READING",
      "isbn": null,
      "publicationYear": null,
      "readingStartDate": "2026-06-17T14:30:00.000Z",
      "createdAt": "2026-06-17T10:00:00.000Z"
    }
  ]
}
```

## UI Contracts

### Book Detail Page (`/books/[id]`)

- When book status is `WISHLIST`: Show a "Start Reading" button
- When book status is `READING`: Show status as "READING" with reading start date formatted as locale date string
- "Start Reading" button calls `PATCH /api/books/[id]/start-reading` and refreshes the page data on success

### Book List Page (`/`)

- Each book card shows the status badge (WISHLIST or READING)
- Reading books show the reading start date below the metadata

### Reading List Page (`/reading`)

- Displays only books with `READING` status
- Uses the same card layout as the main book list
- Shows empty state message when no books are being read
- Accessible via navigation link
