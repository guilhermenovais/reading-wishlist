# Research: Google Books Search

## R1: Google Books API Endpoint & Authentication

**Decision**: Use the Google Books Volumes API at `GET https://www.googleapis.com/books/v1/volumes`

**Rationale**: This is the official, well-documented API for searching books by title. It supports title-specific search via the `intitle:` keyword in the `q` parameter, pagination via `maxResults` (default 10, max 40), and returns comprehensive book metadata including ISBNs and cover images.

**Alternatives considered**:
- Google Books API with OAuth: Overkill for public data read-only access; API key is sufficient.
- Scraping Google Books website: Fragile, violates ToS.

**Key detail**: An API key is required for all requests. The free tier provides 1,000 requests/day (default quota). The key must be stored as an environment variable (`GOOGLE_BOOKS_API_KEY`) and appended to requests as the `key` query parameter.

## R2: Response Mapping (Google Books → SearchResult)

**Decision**: Map Google Books `volumeInfo` fields to the existing `SearchResult` interface, adding `coverImageUrl`.

**Rationale**: The Google Books response structure differs significantly from Open Library:

| SearchResult field | Google Books source | Notes |
|---|---|---|
| `title` | `volumeInfo.title` | Direct mapping |
| `author` | `volumeInfo.authors` | Array of strings → join with ", " |
| `publicationYear` | `volumeInfo.publishedDate` | String ("2005-11-15" or "2005") → parse year as integer |
| `isbn` | `volumeInfo.industryIdentifiers` | Array of `{type, identifier}` → prefer ISBN_13, fallback to ISBN_10 |
| `coverImageUrl` | `volumeInfo.imageLinks.thumbnail` | New field; may be absent |

**Alternatives considered**:
- Store cover URLs in the database: Out of scope per spec — cover images are display-only in search results.
- Use `smallThumbnail` instead of `thumbnail`: `thumbnail` provides better quality at minimal size cost.

## R3: Cover Image URL Protocol

**Decision**: Replace `http://` with `https://` in Google Books image URLs.

**Rationale**: Google Books historically returns `http://` URLs for image links. Since the application is served over HTTPS, mixed content will be blocked by browsers. The Google Books image servers support HTTPS, so a simple protocol replacement is safe and necessary.

**Alternatives considered**:
- Proxy images through the application server: Unnecessary complexity; direct HTTPS links work.
- Accept mixed content: Blocked by modern browsers; not viable.

## R4: API Key Configuration

**Decision**: Use `GOOGLE_BOOKS_API_KEY` environment variable, required at runtime.

**Rationale**: The Google Books API requires an API key for all requests. Storing it as an environment variable follows the project's existing pattern (similar to `DATABASE_URL` in `.env`). The provider should throw a clear error if the key is missing.

**Alternatives considered**:
- Hardcode API key: Security risk, prohibited by best practices.
- Make API key optional: API calls will fail without it; better to fail fast with a clear message.

## R5: Error Handling Strategy

**Decision**: Throw descriptive errors from the provider, let the API route return user-friendly messages.

**Rationale**: Follows the existing pattern in `OpenLibrarySearchProvider` — the provider throws on HTTP errors, and the API route catches and returns a 502 with a generic message. No change needed in the error handling architecture.

**Alternatives considered**:
- Return empty results on error: Hides failures from users, violates FR-009.
- Expose API error details to users: Leaks implementation details.
