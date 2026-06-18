# Research: Wishlist Book Covers

## R1: File Storage Strategy for Uploaded Covers

**Decision**: Store uploaded cover images on the local filesystem at `public/uploads/covers/`, served as static files by Next.js.

**Rationale**: The spec explicitly states this is a single-user application and high-concurrency upload optimization is out of scope. Local filesystem storage is the simplest solution that meets all requirements:
- Next.js serves files from `public/` as static assets automatically
- No additional dependencies or cloud service configuration needed
- Files persist across sessions (FR-008)
- File naming uses a unique identifier (book ID + timestamp) to avoid collisions

**Alternatives considered**:
- Cloud storage (S3, Cloudflare R2): Excessive for a single-user app; adds external dependency and configuration complexity
- Database blob storage: Poor performance for image serving; PostgreSQL is not optimized for binary data
- Next.js `/tmp` storage: Not persistent across deployments; would violate FR-008

**Key detail**: The `public/uploads/covers/` directory must be `.gitignore`d to avoid committing user-uploaded images. Cover images are served at `/uploads/covers/{filename}` relative to the app root.

## R2: Image Validation Approach

**Decision**: Validate both client-side (file input `accept` attribute) and server-side (MIME type check + file size check) before saving.

**Rationale**: Client-side validation provides immediate feedback (FR-004 accepted formats), but cannot be trusted — server-side validation is the enforcement point:
- **File type**: Check `Content-Type` header matches `image/jpeg`, `image/png`, or `image/webp` (FR-004). Additionally verify the file extension matches
- **File size**: Check `Content-Length` / buffer size does not exceed 5 MB (FR-005)
- **Image validity**: Basic check that the file has valid image magic bytes (handles corrupted files — edge case from spec)

**Alternatives considered**:
- Sharp/image processing library for deep validation: Adds a native dependency; magic byte check is sufficient for this scope
- Client-side only validation: Trivially bypassed; not acceptable for data integrity
- No extension check: MIME types can be spoofed; checking both is defense-in-depth

## R3: Cover Image URL Sources and the Book Entity

**Decision**: Add a single `coverImageUrl` field (string | null) to the `Book` entity, storing either an external URL (from Google Books import) or a local relative path (from upload).

**Rationale**: Both sources produce a URL-like reference that the frontend can use directly in an `<img>` tag:
- External imports: store the full HTTPS URL from Google Books (e.g., `https://books.google.com/...`)
- User uploads: store the relative path from public root (e.g., `/uploads/covers/42-1718700000.jpg`)

This avoids a separate `CoverImage` entity or a discriminated union for image source types. The presentation layer treats both identically — an image `src` attribute.

**Alternatives considered**:
- Separate `coverImageType` enum field (EXTERNAL_URL vs UPLOADED): Adds complexity; the URL format itself distinguishes sources if ever needed
- Download and re-host external images: Spec explicitly says "stores the URL rather than downloading"; adds storage and bandwidth burden
- Two fields (`externalCoverUrl` + `uploadedCoverPath`): Mutually exclusive fields are a code smell; one field suffices

## R4: Next.js Image Handling

**Decision**: Use plain `<img>` tags for cover images rather than the Next.js `<Image>` component.

**Rationale**: The Next.js `<Image>` component requires domain configuration in `next.config.ts` for external images and has strict requirements around `width`/`height` props. Given that covers come from two sources (external URLs with unknown dimensions, local uploads with varied dimensions):
- Plain `<img>` with CSS styling (max-width, aspect-ratio, object-fit: cover) provides simpler, more predictable rendering
- No need to configure `remotePatterns` in `next.config.ts` for Google Books domains
- The search results page already uses plain `<img>` for cover images (established pattern)
- Performance optimization via `<Image>` is not a priority for a single-user app

**Alternatives considered**:
- Next.js `<Image>` component: Would require `remotePatterns` config for `books.google.com`; more complex for dynamically-sized images; not the existing pattern in the codebase
- Background CSS images: Less accessible (no `alt` text), harder to handle loading states

## R5: Upload API Design

**Decision**: Use a two-step flow — create the book first (existing POST), then upload the cover via `POST /api/books/[id]/cover` with `multipart/form-data`.

**Rationale**: This separates concerns cleanly:
- Book creation remains a JSON API (existing behavior, no breaking changes)
- Cover upload is a distinct operation that accepts `FormData` with a file
- For imports, the `coverImageUrl` is passed as a JSON field in the existing POST body (no file upload needed)
- This allows re-uploading/updating a cover after initial creation in the future

The manual add form orchestrates both calls: POST book → POST cover (if file selected).

**Alternatives considered**:
- Single multipart POST for book creation + cover: Would require changing the existing POST endpoint to handle both JSON and FormData; breaks the import flow which doesn't upload files
- Base64 encode image in JSON body: Increases payload size by ~33%; not standard practice for file uploads
- Separate `/api/upload` endpoint: Less RESTful; cover is intrinsically tied to a specific book

## R6: Placeholder Image Strategy

**Decision**: Use a CSS-styled div placeholder with a book icon/text, consistent with the existing search results placeholder pattern.

**Rationale**: The search results page already renders a `<div className={styles.coverPlaceholder}>No cover</div>` for books without covers. Reusing this pattern ensures visual consistency. No image asset needed for the placeholder — it's pure CSS.

**Alternatives considered**:
- SVG placeholder image file: Adds an asset to manage; CSS approach is already proven in the codebase
- Third-party placeholder service: External dependency for a cosmetic element; unnecessary
