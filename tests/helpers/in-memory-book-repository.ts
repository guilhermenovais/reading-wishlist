import { Book } from "@/modules/books/domain/book";
import { BookRepository } from "@/modules/books/domain/book-repository";
import { BookStatus } from "@/modules/books/domain/book-status";

export class InMemoryBookRepository implements BookRepository {
  private books: Book[] = [];
  private nextId = 1;

  async save(book: Book): Promise<Book> {
    const saved = Book.reconstitute({
      id: this.nextId++,
      title: book.title,
      author: book.author,
      status: book.status,
      isbn: book.isbn,
      publicationYear: book.publicationYear,
      readingStartDate: book.readingStartDate,
      completionDate: book.completionDate,
      coverImageUrl: book.coverImageUrl,
      createdAt: new Date(),
      rating: book.rating,
      notes: book.notes,
    });
    this.books.push(saved);
    return saved;
  }

  async update(book: Book): Promise<Book> {
    const index = this.books.findIndex((b) => b.id === book.id);
    if (index === -1) {
      throw new Error("Book not found");
    }
    this.books[index] = book;
    return book;
  }

  async findAll(): Promise<Book[]> {
    return [...this.books];
  }

  async findById(id: number): Promise<Book | null> {
    return this.books.find((book) => book.id === id) ?? null;
  }

  async findByIsbn(isbn: string): Promise<Book | null> {
    return this.books.find((book) => book.isbn === isbn) ?? null;
  }

  async findByStatus(status: BookStatus): Promise<Book[]> {
    return this.books.filter((book) => book.status === status);
  }

  async deleteById(id: number): Promise<void> {
    const index = this.books.findIndex((book) => book.id === id);
    if (index === -1) {
      throw new Error("Book not found");
    }
    this.books.splice(index, 1);
  }
}
