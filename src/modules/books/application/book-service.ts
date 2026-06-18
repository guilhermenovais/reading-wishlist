import { Book } from "../domain/book";
import { BookRepository } from "../domain/book-repository";
import { BookStatus } from "../domain/book-status";

interface AddBookInput {
  title: string;
  author: string;
}

interface ImportBookInput {
  title: string;
  author: string;
  isbn?: string;
  publicationYear?: number;
  coverImageUrl?: string;
}

export class BookService {
  constructor(private readonly bookRepository: BookRepository) {}

  async addBook(input: AddBookInput): Promise<Book> {
    const book = Book.create({ title: input.title, author: input.author });
    return this.bookRepository.save(book);
  }

  async importBook(input: ImportBookInput): Promise<Book> {
    if (input.isbn) {
      const existing = await this.bookRepository.findByIsbn(input.isbn);
      if (existing) {
        throw new Error("A book with this ISBN already exists in your wishlist");
      }
    }

    const book = Book.createFromImport({
      title: input.title,
      author: input.author,
      isbn: input.isbn,
      publicationYear: input.publicationYear,
      coverImageUrl: input.coverImageUrl,
    });
    return this.bookRepository.save(book);
  }

  async listBooks(): Promise<Book[]> {
    return this.bookRepository.findAll();
  }

  async getBook(id: number): Promise<Book> {
    const book = await this.bookRepository.findById(id);
    if (!book) {
      throw new Error("Book not found");
    }
    return book;
  }

  async listReadingBooks(): Promise<Book[]> {
    return this.bookRepository.findByStatus(BookStatus.READING);
  }

  async startReading(id: number): Promise<Book> {
    const book = await this.bookRepository.findById(id);
    if (!book) {
      throw new Error("Book not found");
    }
    const reading = book.startReading();
    return this.bookRepository.update(reading);
  }

  async markAsCompleted(id: number, completionDate: Date): Promise<Book> {
    const book = await this.bookRepository.findById(id);
    if (!book) {
      throw new Error("Book not found");
    }
    const completed = book.markAsCompleted(completionDate);
    return this.bookRepository.update(completed);
  }

  async listCompletedBooks(): Promise<Book[]> {
    return this.bookRepository.findByStatus(BookStatus.COMPLETED);
  }

  async removeBook(id: number): Promise<void> {
    await this.bookRepository.deleteById(id);
  }
}
