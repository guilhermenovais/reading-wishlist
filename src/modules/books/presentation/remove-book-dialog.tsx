"use client";

import { useState } from "react";
import styles from "./remove-book-dialog.module.css";

interface RemoveBookDialogProps {
  bookId: number;
  bookTitle: string;
  onRemoved: () => void;
  onCancel: () => void;
}

export function RemoveBookDialog({
  bookId,
  bookTitle,
  onRemoved,
  onCancel,
}: RemoveBookDialogProps) {
  const [removing, setRemoving] = useState(false);

  async function handleConfirm() {
    setRemoving(true);
    try {
      const response = await fetch(`/api/books/${bookId}`, {
        method: "DELETE",
      });

      if (response.ok || response.status === 204) {
        onRemoved();
      }
    } catch {
      setRemoving(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div
        role="dialog"
        aria-label="Confirm removal"
        className={styles.dialog}
        onClick={(e) => e.stopPropagation()}
      >
        <p className={styles.message}>
          Are you sure you want to remove <strong>{bookTitle}</strong> from your
          wishlist?
        </p>
        <div className={styles.actions}>
          <button className={styles.cancelButton} onClick={onCancel} disabled={removing}>
            Cancel
          </button>
          <button className={styles.confirmButton} onClick={handleConfirm} disabled={removing}>
            {removing ? "Removing..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
