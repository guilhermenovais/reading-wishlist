import { OpenLibrarySearchProvider } from "@/modules/books/infrastructure/open-library-search-provider";

let provider: OpenLibrarySearchProvider;

beforeEach(() => {
  provider = new OpenLibrarySearchProvider();
});

describe("OpenLibrarySearchProvider", () => {
  describe("response mapping", () => {
    it("maps title, author array to string, first_publish_year, and isbn array to ISBN-13", async () => {
      const mockResponse = {
        numFound: 1,
        docs: [
          {
            title: "Clean Code",
            author_name: ["Robert C. Martin"],
            first_publish_year: 2008,
            isbn: ["9780132350884", "0132350882"],
          },
        ],
      };

      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });
      global.fetch = mockFetch;

      const results = await provider.searchByTitle("Clean Code");

      expect(results).toHaveLength(1);
      expect(results[0]).toEqual({
        title: "Clean Code",
        author: "Robert C. Martin",
        publicationYear: 2008,
        isbn: "9780132350884",
      });
    });

    it("joins multiple authors with comma", async () => {
      const mockResponse = {
        numFound: 1,
        docs: [
          {
            title: "Some Book",
            author_name: ["Author One", "Author Two"],
            first_publish_year: 2020,
            isbn: ["9781234567890"],
          },
        ],
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const results = await provider.searchByTitle("Some Book");

      expect(results[0]!.author).toBe("Author One, Author Two");
    });

    it("handles missing fields gracefully", async () => {
      const mockResponse = {
        numFound: 1,
        docs: [
          {
            title: "Minimal Book",
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
      });
    });

    it("prefers ISBN-13 over shorter ISBNs", async () => {
      const mockResponse = {
        numFound: 1,
        docs: [
          {
            title: "Test Book",
            author_name: ["Author"],
            isbn: ["0132350882", "9780132350884"],
          },
        ],
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const results = await provider.searchByTitle("Test");

      expect(results[0]!.isbn).toBe("9780132350884");
    });

    it("falls back to first ISBN when no ISBN-13 exists", async () => {
      const mockResponse = {
        numFound: 1,
        docs: [
          {
            title: "Old Book",
            author_name: ["Author"],
            isbn: ["0132350882"],
          },
        ],
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const results = await provider.searchByTitle("Old");

      expect(results[0]!.isbn).toBe("0132350882");
    });
  });

  describe("error handling", () => {
    it("throws on HTTP error response", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
      });

      await expect(provider.searchByTitle("Clean")).rejects.toThrow();
    });

    it("throws on network error", async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));

      await expect(provider.searchByTitle("Clean")).rejects.toThrow("Network error");
    });
  });
});
