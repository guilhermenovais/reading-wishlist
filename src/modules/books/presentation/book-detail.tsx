"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RemoveBookDialog } from "./remove-book-dialog";
import { MarkCompletedDialog } from "./mark-completed-dialog";
import styles from "./book-detail.module.css";

interface BookData {
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
  rating: number | null;
  notes: string | null;
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
  const [showMarkCompletedDialog, setShowMarkCompletedDialog] = useState(false);
  const [startingReading, setStartingReading] = useState(false);

  const [notes, setNotes] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [isSavingReview, setIsSavingReview] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

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
        setNotes(data.notes || "");
        setRating(data.rating || null);
      } catch {
        setError("Failed to load book");
      } finally {
        setLoading(false);
      }
    }
    fetchBook();
  }, [bookId]);

  async function handleSaveReview() {
    setIsSavingReview(true);
    setSaveMessage("");
    try {
      const response = await fetch(`/api/books/${bookId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rating, notes }),
      });

      if (!response.ok) {
        throw new Error("Failed to save review");
      }

      const updatedBook = await response.json();
      setBook(updatedBook);
      setSaveMessage("Saved successfully!");
      
      setTimeout(() => setSaveMessage(""), 3000);
    } catch {
      alert("Error saving your review. Please try again.");
    } finally {
      setIsSavingReview(false);
    }
  }

  async function handleStartReading() {
    setStartingReading(true);
    try {
      const response = await fetch(`/api/books/${bookId}/start-reading`, {
        method: "PATCH",
      });
      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to start reading");
        return;
      }
      const data = await response.json();
      setBook(data);
    } catch {
      setError("Failed to start reading");
    } finally {
      setStartingReading(false);
    }
  }

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
      <div className={styles.header}>
        {book.coverImageUrl ? (
          <img
            src={book.coverImageUrl}
            alt={`Cover of ${book.title}`}
            className={styles.coverImage}
          />
        ) : (
          <div className={styles.coverPlaceholder}>No cover</div>
        )}
        <h2>{book.title}</h2>
      </div>
      
      <dl className={styles.metadataGrid}>
        <dt className={styles.metadataKey}>Author</dt>
        <dd className={styles.metadataValue}>{book.author}</dd>
        <dt className={styles.metadataKey}>Status</dt>
        <dd className={styles.metadataValue}>{book.status}</dd>
        {book.readingStartDate && (
          <>
            <dt className={styles.metadataKey}>Reading Since</dt>
            <dd className={styles.metadataValue}>
              {new Date(book.readingStartDate).toLocaleDateString()}
            </dd>
          </>
        )}
        {book.completionDate && (
          <>
            <dt className={styles.metadataKey}>Completed</dt>
            <dd className={styles.metadataValue}>
              {new Date(book.completionDate).toLocaleDateString()}
            </dd>
          </>
        )}
        <dt className={styles.metadataKey}>ISBN</dt>
        <dd className={styles.metadataValue}>{book.isbn ?? "Not available"}</dd>
        <dt className={styles.metadataKey}>Publication Year</dt>
        <dd className={styles.metadataValue}>{book.publicationYear ?? "Not available"}</dd>
        <dt className={styles.metadataKey}>Added</dt>
        <dd className={styles.metadataValue}>{new Date(book.createdAt).toLocaleDateString()}</dd>
        <dt className={styles.metadataKey}>ID</dt>
        <dd className={styles.metadataValue}>{book.id}</dd>
      </dl>

      <div className={styles.actions}>
        {book.status === "WISHLIST" && (
          <button
            className={styles.startReadingButton}
            onClick={handleStartReading}
            disabled={startingReading}
          >
            {startingReading ? "Starting..." : "Start Reading"}
          </button>
        )}
        {book.status === "READING" && (
          <button
            className={styles.markCompletedButton}
            onClick={() => setShowMarkCompletedDialog(true)}
          >
            Mark as Completed
          </button>
        )}
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
      </div>

      {showMarkCompletedDialog && (
        <MarkCompletedDialog
          bookId={book.id}
          readingStartDate={book.readingStartDate}
          onCompleted={(data) => {
            setBook(data as unknown as BookData);
            setShowMarkCompletedDialog(false);
          }}
          onCancel={() => setShowMarkCompletedDialog(false)}
        />
      )}

      <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #eaeaea' }}>
        <h3 style={{ marginBottom: '1rem' }}>Personal Review & Notes</h3>
        
        {book.status === "COMPLETED" && (
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#555' }}>
              Rating
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', fontSize: '1.8rem', cursor: 'pointer' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => setRating(star)}
                  style={{
                    color: (rating && rating >= star) ? '#FFD700' : '#d4d4d4',
                    transition: 'color 0.2s'
                  }}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#555' }}>
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={5}
            placeholder="Write your thoughts, quotes, or a mini review here..."
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '6px',
              border: '1px solid #ccc',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={handleSaveReview}
            disabled={isSavingReview}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#000',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: isSavingReview ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            {isSavingReview ? "Saving..." : "Save Review"}
          </button>
          
          {saveMessage && (
            <span style={{ color: 'green', fontWeight: '500' }}>
              {saveMessage}
            </span>
          )}
        </div>
      </div>

      <Link href="/" className={styles.backLink} style={{ display: 'inline-block', marginTop: '2rem' }}>
        &larr; Back to wishlist
      </Link>
    </div>
  );
}