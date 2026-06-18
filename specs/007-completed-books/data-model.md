# Data Model: Completed Books

**Feature Branch**: `007-completed-books`  
**Date**: 2026-06-18

## Entity Changes

### BookStatus (Enum)

**Change**: Add `COMPLETED` value.

| Value | Existing | Description |
|-------|----------|-------------|
| WISHLIST | Yes | Book is on the wishlist |
| READING | Yes | Book is currently being read |
| COMPLETED | **New** | Book has been finished |

**Valid transitions**:
- WISHLIST → READING (via `startReading()`)
- READING → COMPLETED (via `markAsCompleted(completionDate)`)
- No backward transitions from COMPLETED

### Book (Entity)

**New fields**:

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| completionDate | DateTime | Yes | null | Date the user finished reading the book |
| coverImageUrl | String | Yes | null | Cover image URL from search provider at import time |

**Domain rules for `markAsCompleted(completionDate: Date)`**:
1. Book MUST be in READING status (throw if WISHLIST or COMPLETED)
2. `completionDate` MUST NOT be in the future (throw if after today)
3. `completionDate` MUST NOT be before `readingStartDate` (throw if earlier)
4. Returns a new immutable Book instance with status COMPLETED and the given completion date

**Domain rules for `startReading()`** (existing — unchanged):
1. Book MUST be in WISHLIST status
2. Cannot start reading a COMPLETED book (already handled: only WISHLIST books can be started)

### Book (Database/Prisma)

**Migration changes**:

```prisma
enum BookStatus {
  WISHLIST
  READING
  COMPLETED    // NEW
}

model Book {
  id               Int        @id @default(autoincrement())
  title            String
  author           String
  status           BookStatus @default(WISHLIST)
  isbn             String?
  publicationYear  Int?
  readingStartDate DateTime?
  completionDate   DateTime?  // NEW
  coverImageUrl    String?    // NEW
  createdAt        DateTime   @default(now())
}
```

## Repository Changes

### BookRepository Interface

No new methods needed. Existing methods suffice:
- `findByStatus(BookStatus.COMPLETED)` — lists completed books
- `update(book)` — persists the status change and completion date
- `findById(id)` — fetches book for marking as completed

### PrismaBookRepository

- `update()`: Must include `completionDate` and `coverImageUrl` in the update data
- `toBook()`: Must map `completionDate` and `coverImageUrl` from database record
- `findByStatus(COMPLETED)`: Order by `completionDate` descending (newest first, per spec)

## Application Service Changes

### BookService

**New method**: `markAsCompleted(id: number, completionDate: Date): Promise<Book>`
1. Fetch book by id (throw if not found)
2. Call `book.markAsCompleted(completionDate)`
3. Persist via `bookRepository.update(completedBook)`
4. Return updated book

**Modified method**: `importBook()` — accept optional `coverImageUrl` and pass it to the domain entity.

**New method**: `listCompletedBooks(): Promise<Book[]>`
1. Call `bookRepository.findByStatus(BookStatus.COMPLETED)`

## State Machine

```
WISHLIST ──startReading()──► READING ──markAsCompleted(date)──► COMPLETED
                                                                    │
                                                                    ╳ (terminal state)
```
