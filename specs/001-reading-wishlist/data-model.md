# Data Model: Reading Wishlist MVP

**Feature**: 001-reading-wishlist | **Date**: 2026-06-17

## Entities

### Book

The central entity representing a book on the user's reading wishlist.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | Integer | Primary key, auto-increment | Unique identifier |
| title | String | Required, non-empty, trimmed | Book title |
| author | String | Required, non-empty, trimmed | Book author |
| status | BookStatus | Required, default: WISHLIST | Current status |
| createdAt | DateTime | Auto-set on creation | Timestamp of creation |

### BookStatus (Enum)

| Value | Description |
|-------|-------------|
| WISHLIST | Book is on the reading wishlist (only status in MVP) |

## Validation Rules

| Rule | Field(s) | Behavior |
|------|----------|----------|
| VR-001 | title | Must not be null, empty, or whitespace-only. Trimmed before storage. |
| VR-002 | author | Must not be null, empty, or whitespace-only. Trimmed before storage. |
| VR-003 | status | Must be a valid BookStatus value. Defaults to WISHLIST on creation. |

## Relationships

None in MVP. Book is a standalone aggregate root.

## Prisma Schema

```prisma
enum BookStatus {
  WISHLIST
}

model Book {
  id        Int        @id @default(autoincrement())
  title     String
  author    String
  status    BookStatus @default(WISHLIST)
  createdAt DateTime   @default(now())
}
```

## Domain Entity (TypeScript)

```typescript
interface BookProps {
  id?: number;
  title: string;
  author: string;
  status?: BookStatus;
  createdAt?: Date;
}
```

The `Book` domain entity enforces VR-001 and VR-002 at construction time. Invalid inputs throw a domain validation error with a descriptive message. The entity trims title and author before storing.

## State Transitions

No state transitions in MVP. All books are created with status `WISHLIST` and remain in that status until removed. The constitution mentions future states (READING, COMPLETED) but these are out of scope.
