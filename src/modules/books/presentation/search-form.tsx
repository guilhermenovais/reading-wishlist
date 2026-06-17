"use client";

import { useState } from "react";

interface SearchFormProps {
  onSearch: (title: string) => void;
  isLoading: boolean;
}

export function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [title, setTitle] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (trimmed) {
      onSearch(trimmed);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <label htmlFor="search-title" style={{ display: "none" }}>
          Search title
        </label>
        <input
          id="search-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter a book title..."
          required
          style={{ flex: 1, padding: "0.5rem" }}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Searching..." : "Search"}
        </button>
      </div>
    </form>
  );
}
