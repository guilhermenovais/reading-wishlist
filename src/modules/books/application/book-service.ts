import { Book } from "../domain/book";
import { BookRepository } from "../domain/book-repository";

interface AddBookInput {
  title: string;
  author: string;
}

export class BookService {
  constructor(private readonly bookRepository: BookRepository) {}

  async addBook(input: AddBookInput): Promise<Book> {
    const book = Book.create({ title: input.title, author: input.author });
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

  async removeBook(id: number): Promise<void> {
    await this.bookRepository.deleteById(id);
  }
}
