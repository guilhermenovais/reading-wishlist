"use client";

import { useCallback, useState } from "react";
import { AddBookForm } from "@/modules/books/presentation/add-book-form";
import { BookList } from "@/modules/books/presentation/book-list";

export default function WishlistPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  return (
    <main style={{ maxWidth: 600, margin: "0 auto", padding: "2rem" }}>
      <h1>Reading Wishlist</h1>
      <AddBookForm onBookAdded={refresh} />
      <BookList refreshKey={refreshKey} onBookRemoved={refresh} />
    </main>
  );
}
