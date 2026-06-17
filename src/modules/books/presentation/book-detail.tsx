"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RemoveBookDialog } from "./remove-book-dialog";

interface BookData {
  id: number;
  title: string;
  author: string;
  status: string;
  isbn: string | null;
  publicationYear: number | null;
  createdAt: string;
}

interface BookDetailProps {
  bookId: number;
}

export function BookDetail({ bookId }: BookDetailProps) {
  const router = useRouter();
  const [book, setBook] = useState<BookData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);

  useEffect(() => {
    async function fetchBook() {
      try {
        const response = await fetch(`/api/books/${bookId}`);
        if (!response.ok) {
          setError("Book not found");
          return;
        }
        const data = await response.json();
        setBook(data);
      } catch {
        setError("Failed to load book");
      } finally {
        setLoading(false);
      }
    }
    fetchBook();
  }, [bookId]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return (
      <div>
        <p>{error}</p>
        <Link href="/">Back to wishlist</Link>
      </div>
    );
  }

  if (!book) {
    return null;
  }

  return (
    <div>
      <h2>{book.title}</h2>
      <dl>
        <dt>Author</dt>
        <dd>{book.author}</dd>
        <dt>Status</dt>
        <dd>{book.status}</dd>
        <dt>ISBN</dt>
        <dd>{book.isbn ?? "Not available"}</dd>
        <dt>Publication Year</dt>
        <dd>{book.publicationYear ?? "Not available"}</dd>
        <dt>Added</dt>
        <dd>{new Date(book.createdAt).toLocaleDateString()}</dd>
        <dt>ID</dt>
        <dd>{book.id}</dd>
      </dl>
      {showRemoveDialog ? (
        <RemoveBookDialog
          bookId={book.id}
          bookTitle={book.title}
          onRemoved={() => router.push("/")}
          onCancel={() => setShowRemoveDialog(false)}
        />
      ) : (
        <button onClick={() => setShowRemoveDialog(true)}>Remove</button>
      )}
      <br />
      <Link href="/">Back to wishlist</Link>
    </div>
  );
}
