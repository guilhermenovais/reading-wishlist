import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PrismaBookRepository } from "@/modules/books/infrastructure/prisma-book-repository";
import { BookService } from "@/modules/books/application/book-service";

function getBookService() {
  return new BookService(new PrismaBookRepository(prisma));
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const bookId = Number(id);

  if (isNaN(bookId)) {
    return NextResponse.json({ error: "Invalid book ID" }, { status: 400 });
  }

  try {
    const service = getBookService();
    const book = await service.getBook(bookId);

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
      // NOVOS CAMPOS ADICIONADOS AQUI:
      rating: book.rating,
      notes: book.notes,
    });
  } catch {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }
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

  try {
    const body = await request.json();
    
    const { status, readingStartDate, completionDate, rating, notes } = body;

    const service = getBookService();
    
    const updatedBook = await service.updateBook(bookId, {
      status,
      readingStartDate,
      completionDate,
      rating,
      notes,
    });

    return NextResponse.json(updatedBook);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error updating book";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const bookId = Number(id);

  if (isNaN(bookId)) {
    return NextResponse.json({ error: "Invalid book ID" }, { status: 400 });
  }

  try {
    const service = getBookService();
    await service.removeBook(bookId);

    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }
}