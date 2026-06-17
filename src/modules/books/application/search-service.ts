import { BookSearchProvider, SearchResult } from "../domain/book-search-provider";

export class SearchService {
  constructor(private readonly searchProvider: BookSearchProvider) {}

  async searchByTitle(title: string): Promise<SearchResult[]> {
    return this.searchProvider.searchByTitle(title);
  }
}
