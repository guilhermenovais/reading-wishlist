"use client";

import { useState } from "react";

interface SearchResultItem {
  title: string;
  author: string;
  publicationYear: number | null;
  isbn: string | null;
}

interface SearchResultsProps {
  results: SearchResultItem[];
  error: string | null;
  hasSearched: boolean;
}

export function SearchResults({ results, error, hasSearched }: SearchResultsProps) {
  const [importingIsbn, setImportingIsbn] = useState<string | null>(null);
  const [importedIsbns, setImportedIsbns] = useState<Set<string>>(new Set());
  const [importError, setImportError] = useState<string | null>(null);
  const [importedIndices, setImportedIndices] = useState<Set<number>>(new Set());

  if (error) {
    return <p role="alert">{error}</p>;
  }

  if (hasSearched && results.length === 0) {
    return <p>No results found. Try a different search term.</p>;
  }

  if (!hasSearched) {
    return null;
  }

  async function handleImport(result: SearchResultItem, index: number) {
    setImportError(null);
    setImportingIsbn(result.isbn ?? `index-${index}`);

    try {
      const response = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: result.title,
          author: result.author || "Unknown Author",
          isbn: result.isbn ?? undefined,
          publicationYear: result.publicationYear ?? undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setImportError(data.error ?? "Failed to import book");
        return;
      }

      if (result.isbn) {
        setImportedIsbns((prev) => new Set(prev).add(result.isbn!));
      }
      setImportedIndices((prev) => new Set(prev).add(index));
    } catch {
      setImportError("Failed to import book. Please try again.");
    } finally {
      setImportingIsbn(null);
    }
  }

  return (
    <div>
      <h2>Search Results ({results.length})</h2>
      {importError && <p role="alert" style={{ color: "red" }}>{importError}</p>}
      <ul>
        {results.map((result, index) => {
          const isImported =
            (result.isbn && importedIsbns.has(result.isbn)) ||
            importedIndices.has(index);
          const isImporting =
            importingIsbn === (result.isbn ?? `index-${index}`);

          return (
            <li key={result.isbn ?? index} style={{ marginBottom: "1rem" }}>
              <strong>{result.title}</strong>
              {result.author && <> by {result.author}</>}
              {result.publicationYear && <> ({result.publicationYear})</>}
              {result.isbn && (
                <span style={{ fontSize: "0.85em", color: "#666" }}>
                  {" "}
                  — ISBN: {result.isbn}
                </span>
              )}
              <br />
              {isImported ? (
                <button disabled>Already added</button>
              ) : (
                <button
                  onClick={() => handleImport(result, index)}
                  disabled={isImporting}
                >
                  {isImporting ? "Importing..." : "Import to Wishlist"}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
