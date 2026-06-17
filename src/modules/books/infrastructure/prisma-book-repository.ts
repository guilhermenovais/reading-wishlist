import { PrismaClient } from "@prisma/client";
import { Book } from "../domain/book";
import { BookRepository } from "../domain/book-repository";
import { BookStatus } from "../domain/book-status";

export class PrismaBookRepository implements BookRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(book: Book): Promise<Book> {
    const record = await this.prisma.book.create({
      data: {
        title: book.title,
        author: book.author,
        status: book.status,
      },
    });

    return Book.reconstitute({
      id: record.id,
      title: record.title,
      author: record.author,
      status: record.status as BookStatus,
      createdAt: record.createdAt,
    });
  }

  async findAll(): Promise<Book[]> {
    const records = await this.prisma.book.findMany({
      orderBy: { id: "asc" },
    });

    return records.map((record) =>
      Book.reconstitute({
        id: record.id,
        title: record.title,
        author: record.author,
        status: record.status as BookStatus,
        createdAt: record.createdAt,
      })
    );
  }

  async findById(id: number): Promise<Book | null> {
    const record = await this.prisma.book.findUnique({
      where: { id },
    });

    if (!record) {
      return null;
    }

    return Book.reconstitute({
      id: record.id,
      title: record.title,
      author: record.author,
      status: record.status as BookStatus,
      createdAt: record.createdAt,
    });
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
