# Data Model: Open Library Integration

**Feature**: 002-open-library-integration | **Date**: 2026-06-17

## Entities

### Book (extended)

The central entity representing a book on the user's reading wishlist. Extended with optional fields for imported book data.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | Integer | Primary key, auto-increment | Unique identifier |
| title | String | Required, non-empty, trimmed | Book title |
| author | String | Required, non-empty, trimmed | Book author |
| status | BookStatus | Required, default: WISHLIST | Current status |
| isbn | String | Optional, nullable | ISBN (preferably ISBN-13) from Open Library |
| publicationYear | Integer | Optional, nullable | First publication year from Open Library |
| createdAt | DateTime | Auto-set on creation | Timestamp of creation |

### BookStatus (Enum) — unchanged

| Value | Description |
|-------|-------------|
| WISHLIST | Book is on the reading wishlist |

### SearchResult (Value Object — transient, not persisted)

Represents a book returned by the Open Library Search API. Used only during the search-and-import flow.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| title | String | Required | Book title from Open Library |
| author | String | Optional (may be empty string) | Author name(s), joined if multiple |
| publicationYear | Number | Optional (may be undefined) | First publication year |
| isbn | String | Optional (may be undefined) | Preferred ISBN (ISBN-13 if available, otherwise first ISBN) |

## Validation Rules

| Rule | Field(s) | Behavior |
|------|----------|----------|
| VR-001 | title | Must not be null, empty, or whitespace-only. Trimmed before storage. |
| VR-002 | author | Must not be null, empty, or whitespace-only. Trimmed before storage. |
| VR-003 | status | Must be a valid BookStatus value. Defaults to WISHLIST on creation. |
| VR-004 | isbn | Optional. When present, stored as-is (string). No format validation — Open Library is the source of truth. |
| VR-005 | publicationYear | Optional. When present, must be a positive integer. |
| VR-006 | isbn (duplicate) | When importing a book with a non-empty ISBN, if a book with the same ISBN already exists, the import MUST be rejected. Duplicate check only applies when both books have a non-empty ISBN (FR-007d). |

## Relationships

None. Book remains a standalone aggregate root. SearchResult is a transient value object with no persistence.

## Prisma Schema (extended)

```prisma
enum BookStatus {
  WISHLIST
}

model Book {
  id              Int        @id @default(autoincrement())
  title           String
  author          String
  status          BookStatus @default(WISHLIST)
  isbn            String?
  publicationYear Int?
  createdAt       DateTime   @default(now())
}
```

**Migration**: Add nullable `isbn` (String?) and `publicationYear` (Int?) columns to the existing Book table. No data migration needed — existing rows get NULL for both fields.

## Domain Entity (TypeScript)

```typescript
interface CreateBookProps {
  title: string;
  author: string;
}

interface ImportBookProps {
  title: string;
  author: string;
  isbn?: string;
  publicationYear?: number;
}

interface ReconstituteBookProps {
  id: number;
  title: string;
  author: string;
  status: BookStatus;
  isbn: string | null;
  publicationYear: number | null;
  createdAt: Date;
}
```

The `Book` entity provides two factory methods:
- `Book.create(props: CreateBookProps)`: For manually added books (feature 001 flow). ISBN and publicationYear are null.
- `Book.createFromImport(props: ImportBookProps)`: For books imported from Open Library. ISBN and publicationYear are optional.
- `Book.reconstitute(props: ReconstituteBookProps)`: For hydrating from persistence (extended with new fields).

## Repository Interface (extended)

```typescript
export interface BookRepository {
  save(book: Book): Promise<Book>;
  findAll(): Promise<Book[]>;
  findById(id: number): Promise<Book | null>;
  findByIsbn(isbn: string): Promise<Book | null>;
  deleteById(id: number): Promise<void>;
}
```

New method: `findByIsbn(isbn: string)` — returns the first book with a matching ISBN, or null. Used for duplicate detection during import.

## Search Provider Interface (new)

```typescript
export interface BookSearchProvider {
  searchByTitle(title: string): Promise<SearchResult[]>;
}
```

Located in the domain layer. The infrastructure layer implements this with the Open Library HTTP client, mapping the external response to `SearchResult` value objects.

## State Transitions

No changes from feature 001. All books are created with status `WISHLIST`.
