"use client";

import { useRef, useEffect, useState } from "react";
import styles from "./mark-completed-dialog.module.css";

interface MarkCompletedDialogProps {
  bookId: number;
  readingStartDate: string | null;
  onCompleted: (book: Record<string, unknown>) => void;
  onCancel: () => void;
}

function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function MarkCompletedDialog({
  bookId,
  readingStartDate,
  onCompleted,
  onCancel,
}: MarkCompletedDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const today = formatDateForInput(new Date());
  const [completionDate, setCompletionDate] = useState(today);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const minDate = readingStartDate
    ? formatDateForInput(new Date(readingStartDate))
    : undefined;

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/books/${bookId}/mark-completed`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completionDate }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to mark as completed");
        return;
      }

      const data = await response.json();
      dialogRef.current?.close();
      onCompleted(data);
    } catch {
      setError("Failed to mark as completed");
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    dialogRef.current?.close();
    onCancel();
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      onClose={onCancel}
      aria-label="Mark as completed"
    >
      <form onSubmit={handleSubmit}>
        <h3 className={styles.title}>Mark as Completed</h3>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.field}>
          <label htmlFor="completionDate" className={styles.label}>
            Completion Date
          </label>
          <input
            id="completionDate"
            type="date"
            className={styles.dateInput}
            value={completionDate}
            onChange={(e) => setCompletionDate(e.target.value)}
            min={minDate}
            max={today}
            required
          />
        </div>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={handleCancel}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={styles.confirmButton}
            disabled={submitting}
          >
            {submitting ? "Saving..." : "Confirm"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
