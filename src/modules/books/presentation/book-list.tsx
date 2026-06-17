"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RemoveBookDialog } from "./remove-book-dialog";

interface BookSummary {
  id: number;
  title: string;
  author: string;
  status: string;
  isbn: string | null;
  publicationYear: number | null;
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
    return <p>Your wishlist is empty. Add a book to get started!</p>;
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
      <ul>
        {books.map((book) => (
          <li key={book.id}>
            <Link href={`/books/${book.id}`}>
              <strong>{book.title}</strong> by {book.author}
              {book.publicationYear && ` (${book.publicationYear})`}
            </Link>
            {book.isbn && (
              <span style={{ fontSize: "0.85em", color: "#666" }}>
                {" "}— ISBN: {book.isbn}
              </span>
            )}
            {" "}
            <button onClick={() => setRemovingBook(book)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
