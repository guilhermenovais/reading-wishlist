# API Contract: Reading Wishlist MVP

**Feature**: 001-reading-wishlist | **Date**: 2026-06-17  
**Base Path**: `/api/books`

## Endpoints

### POST /api/books — Create a Book

**Request Body**:
```json
{
  "title": "string (required, non-empty)",
  "author": "string (required, non-empty)"
}
```

**Success Response** (201 Created):
```json
{
  "id": 1,
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "status": "WISHLIST",
  "createdAt": "2026-06-17T10:00:00.000Z"
}
```

**Error Response** (400 Bad Request):
```json
{
  "error": "Title is required"
}
```
```json
{
  "error": "Author is required"
}
```

**Validation**: Rejects if title or author is missing, empty, or whitespace-only.

---

### GET /api/books — List All Books

**Request**: No parameters.

**Success Response** (200 OK):
```json
{
  "books": [
    {
      "id": 1,
      "title": "Clean Code",
      "author": "Robert C. Martin",
      "status": "WISHLIST",
      "createdAt": "2026-06-17T10:00:00.000Z"
    }
  ]
}
```

**Empty Wishlist Response** (200 OK):
```json
{
  "books": []
}
```

---

### GET /api/books/:id — Get Book Details

**URL Parameter**: `id` — integer, the book's unique identifier.

**Success Response** (200 OK):
```json
{
  "id": 1,
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "status": "WISHLIST",
  "createdAt": "2026-06-17T10:00:00.000Z"
}
```

**Error Response** (404 Not Found):
```json
{
  "error": "Book not found"
}
```

---

### DELETE /api/books/:id — Remove a Book

**URL Parameter**: `id` — integer, the book's unique identifier.

**Success Response** (204 No Content): No body.

**Error Response** (404 Not Found):
```json
{
  "error": "Book not found"
}
```

**Note**: The confirmation dialog is a client-side concern. The API performs the deletion directly upon receiving the DELETE request.

## Common Error Format

All error responses use a consistent structure:

```json
{
  "error": "Human-readable error message"
}
```

## Content Type

- Request: `application/json`
- Response: `application/json` (except 204 No Content)
