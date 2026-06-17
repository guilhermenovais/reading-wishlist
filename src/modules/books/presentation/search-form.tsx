"use client";

import { useState } from "react";
import styles from "./search-form.module.css";

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
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.searchGroup}>
        <label htmlFor="search-title" className="sr-only">
          Search title
        </label>
        <input
          id="search-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter a book title..."
          required
          className={styles.input}
        />
        <button type="submit" disabled={isLoading} className={styles.searchButton}>
          {isLoading ? "Searching..." : "Search"}
        </button>
      </div>
    </form>
  );
}
