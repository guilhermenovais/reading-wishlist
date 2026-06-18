"use client";

import { useState } from "react";
import styles from "./add-book-form.module.css";

interface AddBookFormProps {
  onBookAdded: () => void;
}

export function AddBookForm({ onBookAdded }: AddBookFormProps) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
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

      const book = await response.json();

      if (coverFile) {
        const formData = new FormData();
        formData.append("cover", coverFile);
        const coverResponse = await fetch(`/api/books/${book.id}/cover`, {
          method: "POST",
          body: formData,
        });
        if (!coverResponse.ok) {
          const coverData = await coverResponse.json();
          setError(coverData.error ?? "Book added but cover upload failed");
          onBookAdded();
          return;
        }
      }

      setTitle("");
      setAuthor("");
      setCoverFile(null);
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
      <div className={styles.fieldGroup}>
        <label htmlFor="cover" className={styles.label}>Cover Image (optional)</label>
        <input
          id="cover"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
          className={styles.input}
        />
      </div>
      <button type="submit" disabled={submitting} className={styles.submitButton}>
        {submitting ? "Adding..." : "Add Book"}
      </button>
    </form>
  );
}
