"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "@/modules/books/presentation/book-list.module.css";

interface BookSummary {
  id: number;
  title: string;
  author: string;
  status: string;
  isbn: string | null;
  publicationYear: number | null;
  readingStartDate: string | null;
  coverImageUrl: string | null;
}

export default function ReadingPage() {
  const [books, setBooks] = useState<BookSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReadingBooks() {
      try {
        const response = await fetch("/api/books?status=READING");
        const data = await response.json();
        setBooks(data.books);
      } catch {
        setBooks([]);
      } finally {
        setLoading(false);
      }
    }
    fetchReadingBooks();
  }, []);

  if (loading) {
    return <p>Loading books...</p>;
  }

  return (
    <>
      <h1>Currently Reading</h1>
      {books.length === 0 ? (
        <p className={styles.emptyState}>
          No books being read. Start reading a book from your wishlist!
        </p>
      ) : (
        <ul className={styles.list}>
          {books.map((book) => (
            <li key={book.id} className={styles.card}>
              <div className={styles.cardContent}>
                {book.coverImageUrl ? (
                  <img
                    src={book.coverImageUrl}
                    alt={`Cover of ${book.title}`}
                    className={styles.coverImage}
                  />
                ) : (
                  <div className={styles.coverPlaceholder}>No cover</div>
                )}
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
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
