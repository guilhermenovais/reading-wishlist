import { BookSearchProvider, SearchResult } from "../domain/book-search-provider";

interface OpenLibraryDoc {
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  isbn?: string[];
}

interface OpenLibraryResponse {
  numFound: number;
  docs: OpenLibraryDoc[];
}

function selectIsbn(isbns: string[] | undefined): string | undefined {
  if (!isbns || isbns.length === 0) {
    return undefined;
  }
  const isbn13 = isbns.find((isbn) => isbn.length === 13);
  return isbn13 ?? isbns[0];
}

export class OpenLibrarySearchProvider implements BookSearchProvider {
  async searchByTitle(title: string): Promise<SearchResult[]> {
    const url = `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&fields=title,author_name,first_publish_year,isbn&limit=10`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Open Library API error: ${response.status}`);
    }

    const data: OpenLibraryResponse = await response.json();

    return data.docs.map((doc) => ({
      title: doc.title,
      author: doc.author_name ? doc.author_name.join(", ") : "",
      publicationYear: doc.first_publish_year,
      isbn: selectIsbn(doc.isbn),
    }));
  }
}
