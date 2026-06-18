import { Book } from "../domain/book";
import { BookRepository } from "../domain/book-repository";
import { BookStatus } from "../domain/book-status";
import { CoverImageStorage } from "../domain/cover-image-storage";

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

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const MAGIC_BYTES: Record<string, number[]> = {
  "image/jpeg": [0xFF, 0xD8, 0xFF],
  "image/png": [0x89, 0x50, 0x4E, 0x47],
  "image/webp": [0x52, 0x49, 0x46, 0x46],
};

export class BookService {
  constructor(
    private readonly bookRepository: BookRepository,
    private readonly coverImageStorage?: CoverImageStorage,
  ) {}

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

  async uploadCover(bookId: number, fileBuffer: Buffer, mimeType: string): Promise<Book> {
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      throw new Error("Invalid file type. Accepted formats: JPEG, PNG, WebP");
    }

    if (fileBuffer.length > MAX_FILE_SIZE) {
      throw new Error("File exceeds maximum size of 5 MB");
    }

    const expectedBytes = MAGIC_BYTES[mimeType];
    if (expectedBytes) {
      const matches = expectedBytes.every((byte, i) => fileBuffer[i] === byte);
      if (!matches) {
        throw new Error("File is not a valid image");
      }
    }

    const book = await this.bookRepository.findById(bookId);
    if (!book) {
      throw new Error("Book not found");
    }

    if (book.coverImageUrl && this.coverImageStorage) {
      await this.coverImageStorage.delete(book.coverImageUrl);
    }

    const coverUrl = await this.coverImageStorage!.save(bookId, fileBuffer, mimeType);
    const updated = book.withCoverImage(coverUrl);
    return this.bookRepository.update(updated);
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
