import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PrismaBookRepository } from "@/modules/books/infrastructure/prisma-book-repository";
import { BookService } from "@/modules/books/application/book-service";

function getBookService() {
  return new BookService(new PrismaBookRepository(prisma));
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const bookId = Number(id);

  if (isNaN(bookId)) {
    return NextResponse.json({ error: "Invalid book ID" }, { status: 400 });
  }

  const body = await request.json();
  const { completionDate } = body as { completionDate?: string };

  if (!completionDate) {
    return NextResponse.json(
      { error: "Completion date is required" },
      { status: 400 }
    );
  }

  const parsed = new Date(completionDate);
  if (isNaN(parsed.getTime())) {
    return NextResponse.json(
      { error: "Completion date is required" },
      { status: 400 }
    );
  }

  try {
    const service = getBookService();
    const book = await service.markAsCompleted(bookId, parsed);

    return NextResponse.json({
      id: book.id,
      title: book.title,
      author: book.author,
      status: book.status,
      isbn: book.isbn,
      publicationYear: book.publicationYear,
      readingStartDate: book.readingStartDate,
      completionDate: book.completionDate,
      coverImageUrl: book.coverImageUrl,
      createdAt: book.createdAt,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    if (message === "Book not found") {
      return NextResponse.json({ error: message }, { status: 404 });
    }
    if (
      message === "Only reading books can be marked as completed" ||
      message === "Completion date cannot be in the future" ||
      message === "Completion date cannot be before reading start date"
    ) {
      return NextResponse.json({ error: message }, { status: 409 });
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
