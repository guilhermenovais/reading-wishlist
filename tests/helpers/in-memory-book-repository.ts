import { Book } from "@/modules/books/domain/book";
import { BookRepository } from "@/modules/books/domain/book-repository";

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
      createdAt: new Date(),
    });
    this.books.push(saved);
    return saved;
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

  async deleteById(id: number): Promise<void> {
    const index = this.books.findIndex((book) => book.id === id);
    if (index === -1) {
      throw new Error("Book not found");
    }
    this.books.splice(index, 1);
  }
}
