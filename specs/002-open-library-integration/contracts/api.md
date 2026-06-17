# API Contract: Open Library Integration

**Feature**: 002-open-library-integration | **Date**: 2026-06-17
**Base Path**: `/api`

## New Endpoints

### GET /api/search — Search Books by Title

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| title | string | Yes | The book title to search for |

**Success Response** (200 OK):
```json
{
  "results": [
    {
      "title": "Clean Code",
      "author": "Robert C. Martin",
      "publicationYear": 2008,
      "isbn": "9780132350884"
    },
    {
      "title": "Clean Code in Python",
      "author": "Mariano Anaya",
      "publicationYear": 2018,
      "isbn": null
    }
  ]
}
```

**Notes**:
- Returns up to 10 results
- `author` may be an empty string if Open Library has no author data
- `publicationYear` may be `null` if not available
- `isbn` may be `null` if not available; when present, prefers ISBN-13

**Error Response — Missing Title** (400 Bad Request):
```json
{
  "error": "Search title is required"
}
```

**Error Response — Open Library Unavailable** (502 Bad Gateway):
```json
{
  "error": "Unable to search books at this time. Please try again later."
}
```

---

## Extended Endpoints (from feature 001)

### POST /api/books — Create a Book (extended)

**Request Body**:
```json
{
  "title": "string (required, non-empty)",
  "author": "string (required, non-empty)",
  "isbn": "string (optional)",
  "publicationYear": "number (optional)"
}
```

**Success Response** (201 Created):
```json
{
  "id": 1,
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "status": "WISHLIST",
  "isbn": "9780132350884",
  "publicationYear": 2008,
  "createdAt": "2026-06-17T10:00:00.000Z"
}
```

**Error Response — Duplicate ISBN** (409 Conflict):
```json
{
  "error": "A book with this ISBN already exists in your wishlist"
}
```

**Error Responses (400 Bad Request)** — unchanged from feature 001:
```json
{ "error": "Title is required" }
```
```json
{ "error": "Author is required" }
```

**Notes**:
- When `isbn` and `publicationYear` are omitted, behavior is identical to feature 001 (backward compatible)
- Duplicate ISBN check only applies when the request includes a non-empty `isbn` AND a book with that ISBN already exists
- Books without an ISBN are always accepted (no duplicate check)

---

### GET /api/books — List All Books (extended response)

**Success Response** (200 OK):
```json
{
  "books": [
    {
      "id": 1,
      "title": "Clean Code",
      "author": "Robert C. Martin",
      "status": "WISHLIST",
      "isbn": "9780132350884",
      "publicationYear": 2008,
      "createdAt": "2026-06-17T10:00:00.000Z"
    },
    {
      "id": 2,
      "title": "The Pragmatic Programmer",
      "author": "David Thomas",
      "status": "WISHLIST",
      "isbn": null,
      "publicationYear": null,
      "createdAt": "2026-06-17T11:00:00.000Z"
    }
  ]
}
```

**Notes**: `isbn` and `publicationYear` are included in every book response. For books added manually (feature 001), these fields are `null`.

---

### GET /api/books/:id — Get Book Details (extended response)

**Success Response** (200 OK):
```json
{
  "id": 1,
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "status": "WISHLIST",
  "isbn": "9780132350884",
  "publicationYear": 2008,
  "createdAt": "2026-06-17T10:00:00.000Z"
}
```

**Notes**: Response now includes `isbn` and `publicationYear`. For books without these fields, values are `null`.

---

### DELETE /api/books/:id — Remove a Book (unchanged)

No changes from feature 001.

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
