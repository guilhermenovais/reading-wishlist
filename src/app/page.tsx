"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { AddBookForm } from "@/modules/books/presentation/add-book-form";
import { BookList } from "@/modules/books/presentation/book-list";

export default function WishlistPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  return (
    <>
      <h1>Reading Wishlist</h1>
      <p>
        <Link href="/search">Search &amp; Import Books from Google Books</Link>
      </p>
      <AddBookForm onBookAdded={refresh} />
      <BookList refreshKey={refreshKey} onBookRemoved={refresh} />
    </>
  );
}
