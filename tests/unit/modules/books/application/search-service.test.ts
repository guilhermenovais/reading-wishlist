import { SearchService } from "@/modules/books/application/search-service";
import { BookSearchProvider, SearchResult } from "@/modules/books/domain/book-search-provider";

class FakeSearchProvider implements BookSearchProvider {
  private results: SearchResult[] = [];
  private error: Error | null = null;

  setResults(results: SearchResult[]) {
    this.results = results;
  }

  setError(error: Error) {
    this.error = error;
  }

  async searchByTitle(_title: string): Promise<SearchResult[]> {
    if (this.error) {
      throw this.error;
    }
    return this.results;
  }
}

let service: SearchService;
let provider: FakeSearchProvider;

beforeEach(() => {
  provider = new FakeSearchProvider();
  service = new SearchService(provider);
});

describe("SearchService.searchByTitle", () => {
  it("returns results from the search provider", async () => {
    provider.setResults([
      { title: "Clean Code", author: "Robert C. Martin", publicationYear: 2008, isbn: "9780132350884" },
      { title: "Clean Architecture", author: "Robert C. Martin", publicationYear: 2017, isbn: "9780134494166" },
    ]);

    const results = await service.searchByTitle("Clean");

    expect(results).toHaveLength(2);
    expect(results[0]!.title).toBe("Clean Code");
    expect(results[1]!.title).toBe("Clean Architecture");
  });

  it("returns empty array when no results found", async () => {
    provider.setResults([]);

    const results = await service.searchByTitle("NonexistentBook12345");

    expect(results).toEqual([]);
  });

  it("propagates provider errors", async () => {
    provider.setError(new Error("Service unavailable"));

    await expect(service.searchByTitle("Clean")).rejects.toThrow("Service unavailable");
  });
});
