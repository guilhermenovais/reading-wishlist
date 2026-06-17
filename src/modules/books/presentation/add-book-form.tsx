"use client";

import { useState } from "react";
import styles from "./add-book-form.module.css";

interface AddBookFormProps {
  onBookAdded: () => void;
}

export function AddBookForm({ onBookAdded }: AddBookFormProps) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, author }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error ?? "Failed to add book");
        return;
      }

      setTitle("");
      setAuthor("");
      onBookAdded();
    } catch {
      setError("Failed to add book");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2>Add a Book</h2>
      {error && <p role="alert" className={styles.alert}>{error}</p>}
      <div className={styles.fieldGroup}>
        <label htmlFor="title" className={styles.label}>Title</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className={styles.input}
        />
      </div>
      <div className={styles.fieldGroup}>
        <label htmlFor="author" className={styles.label}>Author</label>
        <input
          id="author"
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          required
          className={styles.input}
        />
      </div>
      <button type="submit" disabled={submitting} className={styles.submitButton}>
        {submitting ? "Adding..." : "Add Book"}
      </button>
    </form>
  );
}
