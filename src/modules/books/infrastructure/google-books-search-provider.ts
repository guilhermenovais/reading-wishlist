import {
  BookSearchProvider,
  SearchResult,
} from "../domain/book-search-provider";

interface GoogleBooksVolume {
  volumeInfo: {
    title: string;
    authors?: string[];
    publishedDate?: string;
    industryIdentifiers?: Array<{
      type: string;
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

function parseYear(publishedDate: string | undefined): number | undefined {
  if (!publishedDate) return undefined;
  const year = parseInt(publishedDate.substring(0, 4), 10);
  return isNaN(year) ? undefined : year;
}

function selectIsbn(
  identifiers: Array<{ type: string; identifier: string }> | undefined
): string | undefined {
  if (!identifiers || identifiers.length === 0) return undefined;
  const isbn13 = identifiers.find((id) => id.type === "ISBN_13");
  if (isbn13) return isbn13.identifier;
  const isbn10 = identifiers.find((id) => id.type === "ISBN_10");
  return isbn10?.identifier;
}

function toHttps(url: string | undefined): string | undefined {
  if (!url) return undefined;
  return url.replace(/^http:\/\//, "https://");
}

export class GoogleBooksSearchProvider implements BookSearchProvider {
  private readonly apiKey: string;

  constructor() {
    const key = process.env.GOOGLE_BOOKS_API_KEY;
    if (!key) {
      throw new Error("GOOGLE_BOOKS_API_KEY environment variable is required");
    }
    this.apiKey = key;
  }

  async searchByTitle(title: string): Promise<SearchResult[]> {
    const url = `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(title)}&maxResults=10&key=${encodeURIComponent(this.apiKey)}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Google Books API error: ${response.status}`);
    }

    const data: GoogleBooksResponse = await response.json();

    if (!data.items) return [];

    return data.items.map((item) => ({
      title: item.volumeInfo.title,
      author: item.volumeInfo.authors
        ? item.volumeInfo.authors.join(", ")
        : "",
      publicationYear: parseYear(item.volumeInfo.publishedDate),
      isbn: selectIsbn(item.volumeInfo.industryIdentifiers),
      coverImageUrl: toHttps(item.volumeInfo.imageLinks?.thumbnail),
    }));
  }
}
