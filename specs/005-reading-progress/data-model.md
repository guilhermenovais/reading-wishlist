# Data Model: Reading Progress

**Feature**: 005-reading-progress  
**Date**: 2026-06-17

## Entities

### BookStatus (Enum — Modified)

Represents the lifecycle state of a book.

| Value | Description | Transition From |
|-------|-------------|-----------------|
| `WISHLIST` | Book is on the user's wishlist (initial state) | — (set on creation) |
| `READING` | User is actively reading the book | `WISHLIST` only |

**Transition Rules**:
- `WISHLIST → READING`: Allowed. Sets `readingStartDate` to current date.
- `READING → WISHLIST`: Not allowed (one-directional in this stage).
- `READING → READING`: Not allowed (already reading).
- Any status for non-existent book: Returns "not found."

### Book (Entity — Modified)

Extended with `readingStartDate` to support reading progress tracking.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | `number` | Yes (persisted) | Auto-increment | Unique identifier |
| `title` | `string` | Yes | — | Book title |
| `author` | `string` | Yes | — | Book author |
| `status` | `BookStatus` | Yes | `WISHLIST` | Current lifecycle state |
| `isbn` | `string \| null` | No | `null` | ISBN from Open Library import |
| `publicationYear` | `number \| null` | No | `null` | Publication year from import |
| `readingStartDate` | `Date \| null` | No | `null` | Date when user started reading; set automatically on WISHLIST → READING transition |
| `createdAt` | `Date` | Yes (persisted) | `now()` | Record creation timestamp |

**Validation Rules**:
- `title`: Must be non-empty after trimming
- `author`: Must be non-empty after trimming
- `publicationYear`: Must be positive integer if provided
- `readingStartDate`: Cannot be manually set; automatically assigned by `startReading()` domain method
- `startReading()`: Throws if current status is not `WISHLIST`

### Prisma Schema Changes

```prisma
enum BookStatus {
  WISHLIST
  READING    // NEW
}

model Book {
  id               Int        @id @default(autoincrement())
  title            String
  author           String
  status           BookStatus @default(WISHLIST)
  isbn             String?
  publicationYear  Int?
  readingStartDate DateTime?  // NEW
  createdAt        DateTime   @default(now())
}
```

**Migration**: Additive only — adds `READING` to the enum and `readingStartDate` nullable column. No data loss, no table rewrite.

## Repository Interface Changes

```typescript
export interface BookRepository {
  save(book: Book): Promise<Book>;
  update(book: Book): Promise<Book>;           // NEW
  findAll(): Promise<Book[]>;
  findById(id: number): Promise<Book | null>;
  findByIsbn(isbn: string): Promise<Book | null>;
  findByStatus(status: BookStatus): Promise<Book[]>;  // NEW
  deleteById(id: number): Promise<void>;
}
```

## Domain Method

```typescript
// On Book entity
startReading(): Book {
  if (this.status !== BookStatus.WISHLIST) {
    throw new Error("Only wishlist books can be started");
  }
  return Book.reconstitute({
    id: this.id!,
    title: this.title,
    author: this.author,
    status: BookStatus.READING,
    isbn: this.isbn,
    publicationYear: this.publicationYear,
    readingStartDate: new Date(),
    createdAt: this.createdAt!,
  });
}
```
