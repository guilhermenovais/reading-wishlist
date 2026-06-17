import { Book } from "./book";
import { BookStatus } from "./book-status";

export interface BookRepository {
  save(book: Book): Promise<Book>;
  update(book: Book): Promise<Book>;
  findAll(): Promise<Book[]>;
  findById(id: number): Promise<Book | null>;
  findByIsbn(isbn: string): Promise<Book | null>;
  findByStatus(status: BookStatus): Promise<Book[]>;
  deleteById(id: number): Promise<void>;
}
