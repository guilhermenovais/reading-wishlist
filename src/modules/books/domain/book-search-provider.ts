export interface SearchResult {
  title: string;
  author: string;
  publicationYear: number | undefined;
  isbn: string | undefined;
  coverImageUrl: string | undefined;
}

export interface BookSearchProvider {
  searchByTitle(title: string): Promise<SearchResult[]>;
}
