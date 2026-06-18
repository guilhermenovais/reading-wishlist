"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./completed-book-list.module.css";

interface CompletedBook {
  id: number;
  title: string;
  author: string;
  completionDate: string | null;
  coverImageUrl: string | null;
}

export function CompletedBookList() {
  const [books, setBooks] = useState<CompletedBook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCompletedBooks() {
      try {
        const response = await fetch("/api/books?status=COMPLETED");
        const data = await response.json();
        setBooks(data.books);
      } catch {
        setBooks([]);
      } finally {
        setLoading(false);
      }
    }
    fetchCompletedBooks();
  }, []);

  if (loading) {
    return <p>Loading books...</p>;
  }

  if (books.length === 0) {
    return (
      <p className={styles.emptyState}>
        No completed books yet. Mark a book as completed to see it here!
      </p>
    );
  }

  return (
    <ul className={styles.list}>
      {books.map((book) => (
        <li key={book.id} className={styles.card}>
          {book.coverImageUrl ? (
            <img
              src={book.coverImageUrl}
              alt={`Cover of ${book.title}`}
              className={styles.coverImage}
            />
          ) : (
            <div className={styles.coverPlaceholder}>No cover</div>
          )}
          <div className={styles.bookInfo}>
            <Link href={`/books/${book.id}`} className={styles.bookTitle}>
              {book.title}
            </Link>
            <div className={styles.bookMeta}>by {book.author}</div>
            {book.completionDate && (
              <div className={styles.bookMeta}>
                Completed {new Date(book.completionDate).toLocaleDateString()}
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
