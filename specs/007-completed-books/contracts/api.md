# API Contracts: Completed Books

## New Endpoint: Mark Book as Completed

**PATCH** `/api/books/[id]/mark-completed`

### Request Body

```json
{
  "completionDate": "2026-06-18"  // ISO 8601 date string (YYYY-MM-DD)
}
```

### Success Response (200)

```json
{
  "id": 1,
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "status": "COMPLETED",
  "isbn": "978-0132350884",
  "publicationYear": 2008,
  "readingStartDate": "2026-06-01T00:00:00.000Z",
  "completionDate": "2026-06-18T00:00:00.000Z",
  "coverImageUrl": "https://books.google.com/books/content?id=xxx&printsec=frontcover&img=1&zoom=1",
  "createdAt": "2026-05-15T10:00:00.000Z"
}
```

### Error Responses

| Status | Condition | Body |
|--------|-----------|------|
| 400 | Invalid book ID | `{ "error": "Invalid book ID" }` |
| 400 | Missing/invalid completionDate | `{ "error": "Completion date is required" }` |
| 404 | Book not found | `{ "error": "Book not found" }` |
| 409 | Book not in READING status | `{ "error": "Only reading books can be marked as completed" }` |
| 409 | Completion date in the future | `{ "error": "Completion date cannot be in the future" }` |
| 409 | Completion date before reading start | `{ "error": "Completion date cannot be before reading start date" }` |

---

## Modified Endpoint: List Books (Completed filter)

**GET** `/api/books?status=COMPLETED`

### Success Response (200)

```json
{
  "books": [
    {
      "id": 1,
      "title": "Clean Code",
      "author": "Robert C. Martin",
      "status": "COMPLETED",
      "isbn": "978-0132350884",
      "publicationYear": 2008,
      "readingStartDate": "2026-06-01T00:00:00.000Z",
      "completionDate": "2026-06-18T00:00:00.000Z",
      "coverImageUrl": "https://books.google.com/books/content?id=xxx",
      "createdAt": "2026-05-15T10:00:00.000Z"
    }
  ]
}
```

Completed books are sorted by `completionDate` descending (newest first).

---

## Modified Endpoint: Get Book Detail

**GET** `/api/books/[id]`

### Response Changes

Two new fields added to the response:
- `completionDate`: ISO 8601 timestamp or `null`
- `coverImageUrl`: string URL or `null`

---

## Modified Endpoint: Create/Import Book

**POST** `/api/books`

### Request Body Changes

New optional field:
- `coverImageUrl`: string — cover image URL from the search provider

### Response Changes

New field in response:
- `coverImageUrl`: string or `null`
