# Contract: Cover Image Upload API (New)

## POST /api/books/[id]/cover — Upload Cover Image

Uploads a cover image for an existing book. Replaces any previously uploaded cover.

### Request

**Content-Type**: `multipart/form-data`

| Field | Type | Required | Notes |
|---|---|---|---|
| cover | File | yes | Image file (JPEG, PNG, or WebP) |

**Constraints**:
- Max file size: 5 MB (FR-005)
- Accepted MIME types: `image/jpeg`, `image/png`, `image/webp` (FR-004)
- File must contain valid image data (FR-007)

### Response (200 OK)

```json
{
  "id": 1,
  "title": "My Custom Book",
  "author": "Some Author",
  "status": "WISHLIST",
  "isbn": null,
  "publicationYear": null,
  "readingStartDate": null,
  "coverImageUrl": "/uploads/covers/1-1718700000.jpg",
  "createdAt": "2026-06-18T10:00:00.000Z"
}
```

### Error Responses

**400 Bad Request — No file provided**:
```json
{
  "error": "Cover image file is required"
}
```

**400 Bad Request — Invalid file type** (FR-004):
```json
{
  "error": "Invalid file type. Accepted formats: JPEG, PNG, WebP"
}
```

**400 Bad Request — File too large** (FR-005):
```json
{
  "error": "File exceeds maximum size of 5 MB"
}
```

**400 Bad Request — Invalid image data** (FR-007):
```json
{
  "error": "File is not a valid image"
}
```

**404 Not Found — Book does not exist**:
```json
{
  "error": "Book not found"
}
```
