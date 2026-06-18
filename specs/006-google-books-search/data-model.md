# Data Model: Google Books Search

## Entities

### Book (unchanged)

The `Book` entity remains unchanged. No new fields, no schema migration required. The cover image is transient (search results only) and is not persisted.

| Field | Type | Required | Notes |
|---|---|---|---|
| id | number | auto | Primary key |
| title | string | yes | |
| author | string | yes | |
| status | BookStatus | yes | WISHLIST or READING |
| isbn | string \| null | no | |
| publicationYear | number \| null | no | |
| readingStartDate | Date \| null | no | |
| createdAt | Date | auto | |

### SearchResult (extended)

The `SearchResult` domain interface gains a `coverImageUrl` field. This is a transient type — it exists only during the search-and-import flow and is never persisted.

| Field | Type | Required | Notes |
|---|---|---|---|
| title | string | yes | |
| author | string | yes | May be empty string if no authors |
| publicationYear | number \| undefined | no | Parsed from publishedDate string |
| isbn | string \| undefined | no | Prefer ISBN-13 over ISBN-10 |
| coverImageUrl | string \| undefined | **new** | Thumbnail URL from Google Books |

## Interfaces

### BookSearchProvider (unchanged signature, extended result)

```typescript
export interface SearchResult {
  title: string;
  author: string;
  publicationYear: number | undefined;
  isbn: string | undefined;
  coverImageUrl: string | undefined;  // NEW
}

export interface BookSearchProvider {
  searchByTitle(title: string): Promise<SearchResult[]>;
}
```

### BookRepository (unchanged)

No changes to the repository interface or Prisma schema.

## State Transitions

No changes to book status transitions. The search-and-import flow creates books with status `WISHLIST`, same as before.

## Google Books API Types (infrastructure layer)

These types are internal to the `GoogleBooksSearchProvider` and not exported to the domain.

```typescript
interface GoogleBooksVolume {
  volumeInfo: {
    title: string;
    authors?: string[];
    publishedDate?: string;
    industryIdentifiers?: Array<{
      type: string;      // "ISBN_10", "ISBN_13", "ISSN", "OTHER"
      identifier: string;
    }>;
    imageLinks?: {
      smallThumbnail?: string;
      thumbnail?: string;
    };
  };
}

interface GoogleBooksResponse {
  kind: string;
  totalItems: number;
  items?: GoogleBooksVolume[];
}
```
