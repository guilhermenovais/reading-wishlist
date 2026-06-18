import { GoogleBooksSearchProvider } from "@/modules/books/infrastructure/google-books-search-provider";

const ORIGINAL_ENV = process.env;

let provider: GoogleBooksSearchProvider;

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV, GOOGLE_BOOKS_API_KEY: "test-api-key" };
  provider = new GoogleBooksSearchProvider();
});

afterEach(() => {
  process.env = ORIGINAL_ENV;
});

describe("GoogleBooksSearchProvider", () => {
  describe("response mapping", () => {
    it("maps volumeInfo fields to SearchResult with ISBN-13 preferred", async () => {
      const mockResponse = {
        kind: "books#volumes",
        totalItems: 1,
        items: [
          {
            volumeInfo: {
              title: "Clean Code",
              authors: ["Robert C. Martin"],
              publishedDate: "2008-08-01",
              industryIdentifiers: [
                { type: "ISBN_10", identifier: "0132350882" },
                { type: "ISBN_13", identifier: "9780132350884" },
              ],
              imageLinks: {
                smallThumbnail: "http://books.google.com/small.jpg",
                thumbnail: "http://books.google.com/thumb.jpg",
              },
            },
          },
        ],
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const results = await provider.searchByTitle("Clean Code");

      expect(results).toHaveLength(1);
      expect(results[0]).toEqual({
        title: "Clean Code",
        author: "Robert C. Martin",
        publicationYear: 2008,
        isbn: "9780132350884",
        coverImageUrl: "https://books.google.com/thumb.jpg",
      });
    });

    it("returns empty array when totalItems is 0", async () => {
      const mockResponse = {
        kind: "books#volumes",
        totalItems: 0,
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const results = await provider.searchByTitle("nonexistent");

      expect(results).toEqual([]);
    });

    it("handles missing optional fields gracefully", async () => {
      const mockResponse = {
        kind: "books#volumes",
        totalItems: 1,
        items: [
          {
            volumeInfo: {
              title: "Minimal Book",
            },
          },
        ],
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const results = await provider.searchByTitle("Minimal");

      expect(results[0]).toEqual({
        title: "Minimal Book",
        author: "",
        publicationYear: undefined,
        isbn: undefined,
        coverImageUrl: undefined,
      });
    });

    it("joins multiple authors with comma", async () => {
      const mockResponse = {
        kind: "books#volumes",
        totalItems: 1,
        items: [
          {
            volumeInfo: {
              title: "Coauthored Book",
              authors: ["Author One", "Author Two", "Author Three"],
            },
          },
        ],
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const results = await provider.searchByTitle("Coauthored");

      expect(results[0]!.author).toBe("Author One, Author Two, Author Three");
    });

    it("parses year-only publishedDate", async () => {
      const mockResponse = {
        kind: "books#volumes",
        totalItems: 1,
        items: [
          {
            volumeInfo: {
              title: "Old Book",
              publishedDate: "1999",
            },
          },
        ],
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const results = await provider.searchByTitle("Old");

      expect(results[0]!.publicationYear).toBe(1999);
    });

    it("falls back to ISBN-10 when no ISBN-13 exists", async () => {
      const mockResponse = {
        kind: "books#volumes",
        totalItems: 1,
        items: [
          {
            volumeInfo: {
              title: "Test Book",
              industryIdentifiers: [
                { type: "ISBN_10", identifier: "0132350882" },
              ],
            },
          },
        ],
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const results = await provider.searchByTitle("Test");

      expect(results[0]!.isbn).toBe("0132350882");
    });

    it("rewrites http cover URLs to https", async () => {
      const mockResponse = {
        kind: "books#volumes",
        totalItems: 1,
        items: [
          {
            volumeInfo: {
              title: "Book With Cover",
              imageLinks: {
                thumbnail: "http://books.google.com/books/content?id=abc",
              },
            },
          },
        ],
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const results = await provider.searchByTitle("Book");

      expect(results[0]!.coverImageUrl).toBe(
        "https://books.google.com/books/content?id=abc"
      );
    });
  });

  describe("error handling", () => {
    it("throws on HTTP error response", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 403,
      });

      await expect(provider.searchByTitle("Clean")).rejects.toThrow(
        "Google Books API error: 403"
      );
    });

    it("throws on network error", async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));

      await expect(provider.searchByTitle("Clean")).rejects.toThrow(
        "Network error"
      );
    });
  });

  describe("API key validation", () => {
    it("throws when GOOGLE_BOOKS_API_KEY is not set", () => {
      delete process.env.GOOGLE_BOOKS_API_KEY;

      expect(() => new GoogleBooksSearchProvider()).toThrow(
        "GOOGLE_BOOKS_API_KEY environment variable is required"
      );
    });
  });
});
