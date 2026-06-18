import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PrismaBookRepository } from "@/modules/books/infrastructure/prisma-book-repository";
import { BookService } from "@/modules/books/application/book-service";

function getBookService() {
  return new BookService(new PrismaBookRepository(prisma));
}

export async function GET(request: NextRequest) {
  const service = getBookService();
  const status = request.nextUrl.searchParams.get("status");

  const books =
    status === "READING"
      ? await service.listReadingBooks()
      : await service.listBooks();

  return NextResponse.json({
    books: books.map((book) => ({
      id: book.id,
      title: book.title,
      author: book.author,
      status: book.status,
      isbn: book.isbn,
      publicationYear: book.publicationYear,
      readingStartDate: book.readingStartDate,
      coverImageUrl: book.coverImageUrl,
      createdAt: book.createdAt,
    })),
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, author, isbn, publicationYear, coverImageUrl } = body as {
    title?: string;
    author?: string;
    isbn?: string;
    publicationYear?: number;
    coverImageUrl?: string;
  };

  if (!title || !title.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  if (!author || !author.trim()) {
    return NextResponse.json({ error: "Author is required" }, { status: 400 });
  }

  try {
    const service = getBookService();
    const isImport = isbn !== undefined || publicationYear !== undefined || coverImageUrl !== undefined;
    const book = isImport
      ? await service.importBook({ title, author, isbn, publicationYear, coverImageUrl })
      : await service.addBook({ title, author });

    return NextResponse.json(
      {
        id: book.id,
        title: book.title,
        author: book.author,
        status: book.status,
        isbn: book.isbn,
        publicationYear: book.publicationYear,
        readingStartDate: book.readingStartDate,
        coverImageUrl: book.coverImageUrl,
        createdAt: book.createdAt,
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("ISBN already exists") ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
