"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RemoveBookDialog } from "./remove-book-dialog";
import styles from "./book-detail.module.css";

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
    <div className={styles.detailContainer}>
      <h2>{book.title}</h2>
      <dl className={styles.metadataGrid}>
        <dt className={styles.metadataKey}>Author</dt>
        <dd className={styles.metadataValue}>{book.author}</dd>
        <dt className={styles.metadataKey}>Status</dt>
        <dd className={styles.metadataValue}>{book.status}</dd>
        <dt className={styles.metadataKey}>ISBN</dt>
        <dd className={styles.metadataValue}>{book.isbn ?? "Not available"}</dd>
        <dt className={styles.metadataKey}>Publication Year</dt>
        <dd className={styles.metadataValue}>{book.publicationYear ?? "Not available"}</dd>
        <dt className={styles.metadataKey}>Added</dt>
        <dd className={styles.metadataValue}>{new Date(book.createdAt).toLocaleDateString()}</dd>
        <dt className={styles.metadataKey}>ID</dt>
        <dd className={styles.metadataValue}>{book.id}</dd>
      </dl>
      {showRemoveDialog ? (
        <RemoveBookDialog
          bookId={book.id}
          bookTitle={book.title}
          onRemoved={() => router.push("/")}
          onCancel={() => setShowRemoveDialog(false)}
        />
      ) : (
        <button className={styles.removeButton} onClick={() => setShowRemoveDialog(true)}>
          Remove
        </button>
      )}
      <Link href="/" className={styles.backLink}>Back to wishlist</Link>
    </div>
  );
}
