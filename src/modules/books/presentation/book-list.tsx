"use client";

import { useEffect, useState, useMemo } from "react";
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
  completionDate: string | null;
  coverImageUrl: string | null;
  createdAt: string;
}

interface BookListProps {
  refreshKey: number;
  onBookRemoved: () => void;
}

export function BookList({ refreshKey, onBookRemoved }: BookListProps) {
  const [books, setBooks] = useState<BookSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingBook, setRemovingBook] = useState<BookSummary | null>(null);

  // ESTADOS PARA OS FILTROS E ORDENAÇÃO
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "title" | "author">("date");

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

  const stats = useMemo(() => {
    const total = books.length;
    const reading = books.filter((b) => b.status === "READING").length;
    const completed = books.filter((b) => b.status === "COMPLETED").length;

    let totalReadingDays = 0;
    let booksWithTime = 0;

    books.forEach((book) => {
      if (book.status === "COMPLETED" && book.readingStartDate && book.completionDate) {
        const start = new Date(book.readingStartDate).getTime();
        const end = new Date(book.completionDate).getTime();
        const diffDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
        totalReadingDays += diffDays;
        booksWithTime++;
      }
    });

    const avgTime = booksWithTime > 0 ? Math.round(totalReadingDays / booksWithTime) : 0;

    return { total, reading, completed, avgTime };
  }, [books]);

  const filteredAndSortedBooks = useMemo(() => {
    return books
      .filter((book) => {
        const term = searchTerm.toLowerCase();
        return (
          book.title.toLowerCase().includes(term) ||
          book.author.toLowerCase().includes(term)
        );
      })
      .sort((a, b) => {
        if (sortBy === "title") return a.title.localeCompare(b.title);
        if (sortBy === "author") return a.author.localeCompare(b.author);
        return b.id - a.id;
      });
  }, [books, searchTerm, sortBy]);

  if (loading) {
    return <p>Loading books...</p>;
  }

  if (books.length === 0) {
    return <p className={styles.emptyState}>Your wishlist is empty. Add a book to get started!</p>;
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '8px', flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: '1rem', color: '#666' }}>Total Books</h3>
          <p style={{ margin: '0.5rem 0 0', fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.total}</p>
        </div>
        <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '8px', flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: '1rem', color: '#666' }}>Reading</h3>
          <p style={{ margin: '0.5rem 0 0', fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.reading}</p>
        </div>
        <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '8px', flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: '1rem', color: '#666' }}>Completed</h3>
          <p style={{ margin: '0.5rem 0 0', fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.completed}</p>
        </div>
        <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '8px', flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: '1rem', color: '#666' }}>Avg. Reading Time</h3>
          <p style={{ margin: '0.5rem 0 0', fontSize: '1.5rem', fontWeight: 'bold' }}>
            {stats.avgTime} {stats.avgTime === 1 ? 'day' : 'days'}
          </p>
        </div>
      </div>

      <h2>Your Wishlist</h2>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search by title or author..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', flex: 1 }}
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "date" | "title" | "author")}
          style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="date">Sort by Date Added</option>
          <option value="title">Sort by Title (A-Z)</option>
          <option value="author">Sort by Author (A-Z)</option>
        </select>
      </div>

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
        {filteredAndSortedBooks.map((book) => (
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
      {filteredAndSortedBooks.length === 0 && books.length > 0 && (
        <p style={{ textAlign: 'center', marginTop: '1rem', color: '#666' }}>No books match your search.</p>
      )}
    </div>
  );
}