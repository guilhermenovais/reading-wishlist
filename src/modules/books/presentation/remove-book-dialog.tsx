"use client";

import { useState } from "react";

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
    <div role="dialog" aria-label="Confirm removal">
      <p>
        Are you sure you want to remove <strong>{bookTitle}</strong> from your
        wishlist?
      </p>
      <button onClick={handleConfirm} disabled={removing}>
        {removing ? "Removing..." : "Confirm"}
      </button>
      <button onClick={onCancel} disabled={removing}>
        Cancel
      </button>
    </div>
  );
}
