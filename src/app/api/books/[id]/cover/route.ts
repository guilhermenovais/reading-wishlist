import { NextRequest, NextResponse } from "next/server";
import * as path from "path";
import { prisma } from "@/lib/prisma";
import { PrismaBookRepository } from "@/modules/books/infrastructure/prisma-book-repository";
import { BookService } from "@/modules/books/application/book-service";
import { LocalFileCoverImageStorage } from "@/modules/books/infrastructure/local-file-cover-image-storage";

function getBookService() {
  const uploadDir = path.join(process.cwd(), "public", "uploads", "covers");
  return new BookService(
    new PrismaBookRepository(prisma),
    new LocalFileCoverImageStorage(uploadDir),
  );
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const bookId = Number(id);

  if (isNaN(bookId)) {
    return NextResponse.json({ error: "Invalid book ID" }, { status: 400 });
  }

  const formData = await request.formData();
  const file = formData.get("cover");

  if (!file || !(file instanceof Blob)) {
    return NextResponse.json(
      { error: "Cover image file is required" },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const mimeType = file.type;

  try {
    const service = getBookService();
    const book = await service.uploadCover(bookId, buffer, mimeType);

    return NextResponse.json({
      id: book.id,
      title: book.title,
      author: book.author,
      status: book.status,
      isbn: book.isbn,
      publicationYear: book.publicationYear,
      readingStartDate: book.readingStartDate,
      coverImageUrl: book.coverImageUrl,
      createdAt: book.createdAt,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    if (message === "Book not found") {
      return NextResponse.json({ error: message }, { status: 404 });
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
