# Contract: Books API (Updated)

## POST /api/books — Create/Import Book

Updated to accept `coverImageUrl` when importing from search results.

### Request

**Content-Type**: `application/json`

```json
{
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "isbn": "9780132350884",
  "publicationYear": 2008,
  "coverImageUrl": "https://books.google.com/books/content?id=_i6bDeoCQzsC&printsec=frontcover&img=1&zoom=1"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| title | string | yes | Non-empty after trim |
| author | string | yes | Non-empty after trim |
| isbn | string | no | Triggers import flow |
| publicationYear | number | no | Triggers import flow |
| coverImageUrl | string | no | External cover URL from search provider; only relevant for imports |

### Response (201 Created)

```json
{
  "id": 1,
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "status": "WISHLIST",
  "isbn": "9780132350884",
  "publicationYear": 2008,
  "readingStartDate": null,
  "coverImageUrl": "https://books.google.com/books/content?id=_i6bDeoCQzsC&printsec=frontcover&img=1&zoom=1",
  "createdAt": "2026-06-18T10:00:00.000Z"
}
```

### GET /api/books — List Books (Updated Response)

Response now includes `coverImageUrl` for each book.

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
      "readingStartDate": null,
      "coverImageUrl": "https://books.google.com/...",
      "createdAt": "2026-06-18T10:00:00.000Z"
    },
    {
      "id": 2,
      "title": "My Custom Book",
      "author": "Some Author",
      "status": "WISHLIST",
      "isbn": null,
      "publicationYear": null,
      "readingStartDate": null,
      "coverImageUrl": "/uploads/covers/2-1718700000.jpg",
      "createdAt": "2026-06-18T11:00:00.000Z"
    }
  ]
}
```
