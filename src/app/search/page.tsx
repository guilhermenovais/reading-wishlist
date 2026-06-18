"use client";

import { useState } from "react";
import Link from "next/link";
import { SearchForm } from "@/modules/books/presentation/search-form";
import { SearchResults } from "@/modules/books/presentation/search-results";

interface SearchResultItem {
  title: string;
  author: string;
  publicationYear: number | null;
  isbn: string | null;
  coverImageUrl: string | null;
}

export default function SearchPage() {
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  async function handleSearch(title: string) {
    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await fetch(
        `/api/search?title=${encodeURIComponent(title)}`
      );

      if (!response.ok) {
        const data = await response.json();
        setError(data.error ?? "Search failed. Please try again.");
        setResults([]);
        return;
      }

      const data = await response.json();
      setResults(data.results);
    } catch {
      setError("Unable to search books at this time. Please try again later.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1>Search Books</h1>
      <p>
        Search for books using Google Books and import them to your wishlist.
      </p>
      <SearchForm onSearch={handleSearch} isLoading={loading} />
      <SearchResults results={results} error={error} hasSearched={hasSearched} />
      <br />
      <Link href="/">Back to wishlist</Link>
    </>
  );
}
