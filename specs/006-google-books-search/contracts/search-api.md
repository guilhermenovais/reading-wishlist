# API Contract: Search Endpoint

## GET /api/search

Searches for books by title using Google Books API.

### Request

| Parameter | Location | Type | Required | Description |
|---|---|---|---|---|
| title | query | string | yes | Book title to search for |

### Response: 200 OK

```json
{
  "results": [
    {
      "title": "Clean Code",
      "author": "Robert C. Martin",
      "publicationYear": 2008,
      "isbn": "9780132350884",
      "coverImageUrl": "https://books.google.com/books/content?id=...&printsec=frontcover&img=1&zoom=1"
    },
    {
      "title": "Minimal Book",
      "author": "",
      "publicationYear": null,
      "isbn": null,
      "coverImageUrl": null
    }
  ]
}
```

**Field rules**:
- `title`: Always present (string)
- `author`: Always present; empty string if no authors provided by Google Books
- `publicationYear`: Integer or `null` if not available
- `isbn`: String (ISBN-13 preferred) or `null` if not available
- `coverImageUrl`: HTTPS URL string or `null` if no cover image available

**Result limit**: Maximum 10 results per query.

### Response: 400 Bad Request

```json
{
  "error": "Search title is required"
}
```

Returned when `title` parameter is missing or empty.

### Response: 502 Bad Gateway

```json
{
  "error": "Unable to search books at this time. Please try again later."
}
```

Returned when Google Books API is unreachable or returns an error.

---

## Breaking Changes from Open Library

| Aspect | Before (Open Library) | After (Google Books) |
|---|---|---|
| Data source | Open Library API | Google Books API |
| Response fields | title, author, publicationYear, isbn | title, author, publicationYear, isbn, **coverImageUrl** |
| Error message | "Open Library API error: {status}" (internal) | "Google Books API error: {status}" (internal) |

The `POST /api/books` endpoint and import flow remain unchanged.
