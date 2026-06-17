import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PrismaBookRepository } from "@/modules/books/infrastructure/prisma-book-repository";
import { BookService } from "@/modules/books/application/book-service";

function getBookService() {
  return new BookService(new PrismaBookRepository(prisma));
}

export async function GET() {
  const service = getBookService();
  const books = await service.listBooks();

  return NextResponse.json({
    books: books.map((book) => ({
      id: book.id,
      title: book.title,
      author: book.author,
      status: book.status,
      createdAt: book.createdAt,
    })),
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, author } = body as { title?: string; author?: string };

  if (!title || !title.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  if (!author || !author.trim()) {
    return NextResponse.json({ error: "Author is required" }, { status: 400 });
  }

  try {
    const service = getBookService();
    const book = await service.addBook({ title, author });

    return NextResponse.json(
      {
        id: book.id,
        title: book.title,
        author: book.author,
        status: book.status,
        createdAt: book.createdAt,
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
