"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RemoveBookDialog } from "./remove-book-dialog";
import styles from "./book-list.module.css";

interface BookSummary {
  id: number;
  title: string;
  author: string;
  status: string;
  isbn: string | null;
  publicationYear: number | null;
  readingStartDate: string | null;
}

interface BookListProps {
  refreshKey: number;
  onBookRemoved: () => void;
}

export function BookList({ refreshKey, onBookRemoved }: BookListProps) {
  const [books, setBooks] = useState<BookSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingBook, setRemovingBook] = useState<BookSummary | null>(null);

  useEffect(() => {
    async function fetchBooks() {
      setLoading(true);
      try {
        const response = await fetch("/api/books");
        const data = await response.json();
        setBooks(data.books);
      } catch {
        setBooks([]);
      } finally {
        setLoading(false);
      }
    }
    fetchBooks();
  }, [refreshKey]);

  if (loading) {
    return <p>Loading books...</p>;
  }

  if (books.length === 0) {
    return <p className={styles.emptyState}>Your wishlist is empty. Add a book to get started!</p>;
  }

  return (
    <div>
      <h2>Your Wishlist</h2>
      {removingBook && (
        <RemoveBookDialog
          bookId={removingBook.id}
          bookTitle={removingBook.title}
          onRemoved={() => {
            setRemovingBook(null);
            onBookRemoved();
          }}
          onCancel={() => setRemovingBook(null)}
        />
      )}
      <ul className={styles.list}>
        {books.map((book) => (
          <li key={book.id} className={styles.card}>
            <div className={styles.cardContent}>
              <div>
                <Link href={`/books/${book.id}`} className={styles.bookTitle}>
                  {book.title}
                </Link>
                <div className={styles.bookMeta}>
                  by {book.author}
                  {book.publicationYear && ` (${book.publicationYear})`}
                  {book.isbn && <> — ISBN: {book.isbn}</>}
                </div>
                {book.readingStartDate && (
                  <div className={styles.bookMeta}>
                    Reading since {new Date(book.readingStartDate).toLocaleDateString()}
                  </div>
                )}
                <span className={styles.badge}>{book.status}</span>
              </div>
              <button
                className={styles.removeButton}
                onClick={() => setRemovingBook(book)}
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
