import { PrismaClient } from "@prisma/client";
import { Book } from "../domain/book";
import { BookRepository } from "../domain/book-repository";
import { BookStatus } from "../domain/book-status";

export class PrismaBookRepository implements BookRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private toBook(record: {
    id: number;
    title: string;
    author: string;
    status: string;
    isbn: string | null;
    publicationYear: number | null;
    readingStartDate: Date | null;
    coverImageUrl: string | null;
    createdAt: Date;
  }): Book {
    return Book.reconstitute({
      id: record.id,
      title: record.title,
      author: record.author,
      status: record.status as BookStatus,
      isbn: record.isbn,
      publicationYear: record.publicationYear,
      readingStartDate: record.readingStartDate,
      coverImageUrl: record.coverImageUrl,
      createdAt: record.createdAt,
    });
  }

  async save(book: Book): Promise<Book> {
    const record = await this.prisma.book.create({
      data: {
        title: book.title,
        author: book.author,
        status: book.status,
        isbn: book.isbn,
        publicationYear: book.publicationYear,
        coverImageUrl: book.coverImageUrl,
      },
    });

    return this.toBook(record);
  }

  async update(book: Book): Promise<Book> {
    const record = await this.prisma.book.update({
      where: { id: book.id! },
      data: {
        title: book.title,
        author: book.author,
        status: book.status,
        isbn: book.isbn,
        publicationYear: book.publicationYear,
        readingStartDate: book.readingStartDate,
        coverImageUrl: book.coverImageUrl,
      },
    });

    return this.toBook(record);
  }

  async findAll(): Promise<Book[]> {
    const records = await this.prisma.book.findMany({
      orderBy: { id: "asc" },
    });

    return records.map((record) => this.toBook(record));
  }

  async findById(id: number): Promise<Book | null> {
    const record = await this.prisma.book.findUnique({
      where: { id },
    });

    if (!record) {
      return null;
    }

    return this.toBook(record);
  }

  async findByIsbn(isbn: string): Promise<Book | null> {
    const record = await this.prisma.book.findFirst({
      where: { isbn },
    });

    if (!record) {
      return null;
    }

    return this.toBook(record);
  }

  async findByStatus(status: BookStatus): Promise<Book[]> {
    const records = await this.prisma.book.findMany({
      where: { status },
      orderBy: { id: "asc" },
    });

    return records.map((record) => this.toBook(record));
  }

  async deleteById(id: number): Promise<void> {
    try {
      await this.prisma.book.delete({
        where: { id },
      });
    } catch {
      throw new Error("Book not found");
    }
  }
}
