# Data Model: Wishlist Book Covers

## Entities

### Book (extended)

The `Book` entity gains an optional `coverImageUrl` field. This stores either an external URL (from Google Books import) or a relative path to a locally-uploaded file.

| Field | Type | Required | Notes |
|---|---|---|---|
| id | number | auto | Primary key |
| title | string | yes | |
| author | string | yes | |
| status | BookStatus | yes | WISHLIST or READING |
| isbn | string \| null | no | |
| publicationYear | number \| null | no | |
| readingStartDate | Date \| null | no | |
| **coverImageUrl** | **string \| null** | **no** | **NEW — External URL or local path (e.g., `/uploads/covers/42-1718700000.jpg`)** |
| createdAt | Date | auto | |

**Prisma schema change**:

```prisma
model Book {
  id               Int        @id @default(autoincrement())
  title            String
  author           String
  status           BookStatus @default(WISHLIST)
  isbn             String?
  publicationYear  Int?
  readingStartDate DateTime?
  coverImageUrl    String?
  createdAt        DateTime   @default(now())
}
```

**Migration**: Add nullable `coverImageUrl` column. No backfill needed — existing books will have `null` (displayed as placeholder).

### SearchResult (unchanged)

The `SearchResult` interface already has `coverImageUrl` from the Google Books feature. No changes needed.

```typescript
export interface SearchResult {
  title: string;
  author: string;
  publicationYear: number | undefined;
  isbn: string | undefined;
  coverImageUrl: string | undefined;
}
```

## Interfaces

### CoverImageStorage (NEW — domain layer)

Abstraction for storing uploaded cover images. Decouples the domain/application layer from filesystem details.

```typescript
export interface CoverImageStorage {
  save(bookId: number, fileBuffer: Buffer, mimeType: string): Promise<string>;
  delete(imageUrl: string): Promise<void>;
}
```

- `save()` returns the public URL/path for the stored image (e.g., `/uploads/covers/42-1718700000.jpg`)
- `delete()` removes a previously stored image (for re-upload scenarios)
- The `mimeType` parameter is used to determine the file extension

### BookRepository (unchanged signature)

The existing `save()` and `update()` methods will naturally persist the new `coverImageUrl` field since they operate on the full `Book` entity. No interface changes required.

### Book domain entity changes

```typescript
// CreateBookProps — unchanged (manual add without cover)
interface CreateBookProps {
  title: string;
  author: string;
}

// ImportBookProps — extended
interface ImportBookProps {
  title: string;
  author: string;
  isbn?: string;
  publicationYear?: number;
  coverImageUrl?: string;  // NEW — from search provider
}

// ReconstituteBookProps — extended
interface ReconstituteBookProps {
  id: number;
  title: string;
  author: string;
  status: BookStatus;
  isbn: string | null;
  publicationYear: number | null;
  readingStartDate: Date | null;
  coverImageUrl: string | null;  // NEW
  createdAt: Date;
}
```

New method on `Book`:

```typescript
withCoverImage(coverImageUrl: string): Book
```

Returns a new `Book` instance with the cover image URL set. Used after upload to update the entity immutably.

## State Transitions

No changes to book status transitions. Cover image is orthogonal to book status.

Cover image lifecycle:
1. **No cover** → Book created without cover (manual add or import without cover) → `coverImageUrl: null`
2. **Import with cover** → Book created with external URL → `coverImageUrl: "https://..."` 
3. **Upload cover** → After book creation, user uploads image → `coverImageUrl: "/uploads/covers/..."` 
4. **Re-upload** → User uploads new cover → old file deleted, new `coverImageUrl` set

## Validation Rules (domain layer)

| Rule | Enforcement | Spec Reference |
|---|---|---|
| Cover upload accepts JPEG, PNG, WebP only | Application service validates MIME type before passing to storage | FR-004 |
| Cover upload max 5 MB | Application service checks buffer size | FR-005 |
| Cover upload must be a valid image | Application service checks magic bytes | FR-007 |
| Cover is optional | `coverImageUrl` is nullable; `Book.create()` does not require it | FR-009 |
