"use client";

import { use } from "react";
import { BookDetail } from "@/modules/books/presentation/book-detail";

export default function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const bookId = Number(id);

  return (
    <>
      <h1>Book Details</h1>
      {isNaN(bookId) ? (
        <p>Invalid book ID</p>
      ) : (
        <BookDetail bookId={bookId} />
      )}
    </>
  );
}
