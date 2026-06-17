# Research: Open Library Integration

**Feature**: 002-open-library-integration | **Date**: 2026-06-17

## Research Task 1: Open Library Search API

**Question**: How to search books by title via Open Library and what response shape to expect?

**Decision**: Use the Open Library Search API at `https://openlibrary.org/search.json` with the `title` query parameter.

**Rationale**: This is the official, public, no-authentication-required endpoint. The `title` parameter matches the spec requirement (search by title only). The `fields` parameter allows requesting only the needed fields, reducing payload size. The `limit` parameter caps results at 10 as specified.

**Request format**:
```
GET https://openlibrary.org/search.json?title={query}&fields=title,author_name,first_publish_year,isbn&limit=10
```

**Response format**:
```json
{
  "numFound": 1234,
  "start": 0,
  "docs": [
    {
      "title": "Clean Code",
      "author_name": ["Robert C. Martin"],
      "first_publish_year": 2008,
      "isbn": ["9780132350884", "0132350882"]
    }
  ]
}
```

**Key observations**:
- `author_name` is an array (may be empty or missing)
- `first_publish_year` may be missing
- `isbn` is an array of all ISBNs across editions (may be empty or missing)
- Some docs may lack one or more of these fields entirely

**Alternatives considered**:
- Using `q` (general query) parameter: Too broad, matches across all fields. `title` is more precise.
- Using Open Library's Works API (`/works/{id}.json`): Requires knowing the work ID first, adds a second HTTP call. Not needed for search-only flow.

---

## Research Task 2: Extending the Book Entity with Optional Fields

**Question**: How to add ISBN and publication year to the existing Book entity without breaking feature 001?

**Decision**: Add `isbn` (optional string) and `publicationYear` (optional number) to the Book domain entity. Both fields are nullable in the database. The existing `Book.create()` factory continues to work for manually added books (no ISBN/year required). A new `Book.createFromImport()` factory handles imported books with the additional fields.

**Rationale**: 
- The spec states ISBN and publication year are optional (FR-006a, FR-007b)
- Manually created books from feature 001 must continue to work without these fields (Assumptions)
- Two factory methods clearly separate the creation contexts and their validation rules

**Alternatives considered**:
- Single `create()` with optional params: Muddies the intent — manual creation vs. import have different semantics. Rejected for violating constitution principle V (intent-expressing names).
- Separate `ImportedBook` subclass: Over-engineering for two optional fields on the same entity. Rejected.

---

## Research Task 3: Duplicate ISBN Detection

**Question**: How to implement duplicate ISBN detection per FR-007c and FR-007d?

**Decision**: Add `findByIsbn(isbn: string): Promise<Book | null>` to the `BookRepository` interface. The import use case checks for duplicates only when the incoming book has a non-empty ISBN. Books without ISBNs are always allowed (no duplicate check).

**Rationale**:
- FR-007d explicitly states duplicate detection only applies when both books have a non-empty ISBN
- A repository-level query is the cleanest approach — the application service calls `findByIsbn()` before saving
- No unique constraint in the database on ISBN, because: (a) multiple books can have null ISBN, (b) the domain rule is the source of truth per constitution principle II

**Alternatives considered**:
- Database unique constraint on ISBN: PostgreSQL allows multiple NULLs in a unique column, but the spec requires domain-level enforcement. Also, the error message from a DB constraint violation is harder to control. Rejected as primary mechanism (could be added as defense-in-depth later).
- Check in `Book.create()`: Entity creation shouldn't need repository access. Duplicate detection is an application-level concern. Rejected.

---

## Research Task 4: BookSearchProvider Abstraction

**Question**: How to encapsulate Open Library behind an abstraction per constitution principle IV?

**Decision**: Define a `BookSearchProvider` interface in the domain layer with a single method: `searchByTitle(title: string): Promise<SearchResult[]>`. `SearchResult` is a value object in the domain layer with fields: title, author (string, not array), publicationYear (optional), isbn (optional). The infrastructure layer implements this with the Open Library HTTP client.

**Rationale**:
- Constitution principle IV mandates: "Open Library interactions MUST be encapsulated behind an abstraction (e.g., `BookSearchProvider` interface)"
- The domain defines what a search result looks like; infrastructure maps the Open Library response to that shape
- `author_name` array from Open Library is flattened to a single string (first author, or joined with commas) at the infrastructure level
- `isbn` array from Open Library is mapped to the first ISBN-13 (preferred) or first ISBN available

**Alternatives considered**:
- Passing raw Open Library response through: Violates infrastructure isolation. Domain would depend on Open Library's JSON shape. Rejected.
- Generic `ExternalBookProvider` name: Less specific than needed. The constitution explicitly names `BookSearchProvider`. Used that name.

---

## Research Task 5: Search API Route Design

**Question**: What API route to expose for the frontend search page?

**Decision**: `GET /api/search?title={query}` returns search results. This is a read-only proxy to Open Library — it does not persist anything. The import action uses the existing `POST /api/books` endpoint, extended to accept optional `isbn` and `publicationYear` fields.

**Rationale**:
- Separating search (read from external API) from import (write to local DB) follows single responsibility
- The frontend search page calls `/api/search` for results, then `POST /api/books` to import a selected result
- Using the existing POST endpoint for import means the book goes through the same creation pipeline, just with additional optional fields

**Alternatives considered**:
- `POST /api/books/import`: A dedicated import endpoint. Rejected because the operation is fundamentally "create a book with more fields" — reusing POST /api/books with extended schema is simpler and avoids a parallel creation path.
- Client-side direct call to Open Library: Avoids a server-side proxy but exposes the external API dependency to the browser. Rejected — keeping it server-side allows consistent error handling and future caching if needed.
