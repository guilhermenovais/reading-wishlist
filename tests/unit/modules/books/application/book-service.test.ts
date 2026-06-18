import { BookService } from "@/modules/books/application/book-service";
import { BookStatus } from "@/modules/books/domain/book-status";
import { CoverImageStorage } from "@/modules/books/domain/cover-image-storage";
import { InMemoryBookRepository } from "../../../../helpers/in-memory-book-repository";

class FakeCoverImageStorage implements CoverImageStorage {
  savedFiles: { bookId: number; mimeType: string }[] = [];
  deletedUrls: string[] = [];

  async save(bookId: number, _fileBuffer: Buffer, mimeType: string): Promise<string> {
    this.savedFiles.push({ bookId, mimeType });
    const ext = mimeType.split("/")[1] === "jpeg" ? "jpg" : mimeType.split("/")[1]!;
    return `/uploads/covers/${bookId}-123456.${ext}`;
  }

  async delete(imageUrl: string): Promise<void> {
    this.deletedUrls.push(imageUrl);
  }
}

let service: BookService;
let repository: InMemoryBookRepository;
let coverStorage: FakeCoverImageStorage;

beforeEach(() => {
  repository = new InMemoryBookRepository();
  coverStorage = new FakeCoverImageStorage();
  service = new BookService(repository, coverStorage);
});

describe("BookService.addBook", () => {
  it("creates a book with valid title and author", async () => {
    const book = await service.addBook({ title: "Clean Code", author: "Robert C. Martin" });

    expect(book.id).toBeDefined();
    expect(book.title).toBe("Clean Code");
    expect(book.author).toBe("Robert C. Martin");
    expect(book.status).toBe(BookStatus.WISHLIST);
  });

  it("rejects empty title", async () => {
    await expect(service.addBook({ title: "", author: "Author" })).rejects.toThrow(
      "Title is required"
    );
  });

  it("rejects empty author", async () => {
    await expect(service.addBook({ title: "Title", author: "" })).rejects.toThrow(
      "Author is required"
    );
  });

  it("rejects whitespace-only title", async () => {
    await expect(service.addBook({ title: "   ", author: "Author" })).rejects.toThrow(
      "Title is required"
    );
  });

  it("rejects whitespace-only author", async () => {
    await expect(service.addBook({ title: "Title", author: "   " })).rejects.toThrow(
      "Author is required"
    );
  });
});

describe("BookService.listBooks", () => {
  it("returns all books", async () => {
    await service.addBook({ title: "Book A", author: "Author A" });
    await service.addBook({ title: "Book B", author: "Author B" });

    const books = await service.listBooks();

    expect(books).toHaveLength(2);
    expect(books[0]!.title).toBe("Book A");
    expect(books[1]!.title).toBe("Book B");
  });

  it("returns empty array when no books exist", async () => {
    const books = await service.listBooks();

    expect(books).toEqual([]);
  });
});

describe("BookService.getBook", () => {
  it("returns a book by id", async () => {
    const added = await service.addBook({ title: "Clean Code", author: "Robert C. Martin" });

    const book = await service.getBook(added.id!);

    expect(book.id).toBe(added.id);
    expect(book.title).toBe("Clean Code");
    expect(book.author).toBe("Robert C. Martin");
  });

  it("throws not-found for non-existent id", async () => {
    await expect(service.getBook(999)).rejects.toThrow("Book not found");
  });
});

describe("BookService.removeBook", () => {
  it("removes an existing book", async () => {
    const added = await service.addBook({ title: "Clean Code", author: "Robert C. Martin" });

    await service.removeBook(added.id!);

    const books = await service.listBooks();
    expect(books).toHaveLength(0);
  });

  it("throws not-found for non-existent id", async () => {
    await expect(service.removeBook(999)).rejects.toThrow("Book not found");
  });
});

describe("BookService.startReading", () => {
  it("transitions a wishlist book to reading", async () => {
    const book = await service.addBook({ title: "Clean Code", author: "Robert C. Martin" });

    const reading = await service.startReading(book.id!);

    expect(reading.status).toBe(BookStatus.READING);
    expect(reading.readingStartDate).toBeInstanceOf(Date);
  });

  it("throws for non-existent book", async () => {
    await expect(service.startReading(999)).rejects.toThrow("Book not found");
  });

  it("throws when book is already reading", async () => {
    const book = await service.addBook({ title: "Clean Code", author: "Robert C. Martin" });
    await service.startReading(book.id!);

    await expect(service.startReading(book.id!)).rejects.toThrow(
      "Only wishlist books can be started"
    );
  });
});

describe("BookService.listReadingBooks", () => {
  it("returns only books with READING status", async () => {
    const book1 = await service.addBook({ title: "Book A", author: "Author A" });
    await service.addBook({ title: "Book B", author: "Author B" });
    await service.startReading(book1.id!);

    const readingBooks = await service.listReadingBooks();

    expect(readingBooks).toHaveLength(1);
    expect(readingBooks[0]!.title).toBe("Book A");
    expect(readingBooks[0]!.status).toBe(BookStatus.READING);
  });

  it("returns empty array when no books are being read", async () => {
    await service.addBook({ title: "Book A", author: "Author A" });

    const readingBooks = await service.listReadingBooks();

    expect(readingBooks).toEqual([]);
  });
});

describe("BookService.uploadCover", () => {
  const jpegMagicBytes = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]);
  const pngMagicBytes = Buffer.from([0x89, 0x50, 0x4E, 0x47]);
  const webpMagicBytes = Buffer.from("RIFF\x00\x00\x00\x00WEBP");

  function createValidJpeg(size = 1024): Buffer {
    const buf = Buffer.alloc(size);
    jpegMagicBytes.copy(buf);
    return buf;
  }

  it("uploads a valid JPEG cover image", async () => {
    const book = await service.addBook({ title: "Test", author: "Author" });
    const buffer = createValidJpeg();

    const updated = await service.uploadCover(book.id!, buffer, "image/jpeg");

    expect(updated.coverImageUrl).toBe(`/uploads/covers/${book.id}-123456.jpg`);
    expect(coverStorage.savedFiles).toHaveLength(1);
  });

  it("uploads a valid PNG cover image", async () => {
    const book = await service.addBook({ title: "Test", author: "Author" });
    const buf = Buffer.alloc(1024);
    pngMagicBytes.copy(buf);

    const updated = await service.uploadCover(book.id!, buf, "image/png");

    expect(updated.coverImageUrl).toContain(".png");
  });

  it("uploads a valid WebP cover image", async () => {
    const book = await service.addBook({ title: "Test", author: "Author" });
    const buf = Buffer.alloc(1024);
    webpMagicBytes.copy(buf);

    const updated = await service.uploadCover(book.id!, buf, "image/webp");

    expect(updated.coverImageUrl).toContain(".webp");
  });

  it("rejects invalid MIME type", async () => {
    const book = await service.addBook({ title: "Test", author: "Author" });
    const buffer = Buffer.alloc(1024);

    await expect(
      service.uploadCover(book.id!, buffer, "image/gif")
    ).rejects.toThrow("Invalid file type. Accepted formats: JPEG, PNG, WebP");
  });

  it("rejects file exceeding 5 MB", async () => {
    const book = await service.addBook({ title: "Test", author: "Author" });
    const buffer = Buffer.alloc(5 * 1024 * 1024 + 1);
    jpegMagicBytes.copy(buffer);

    await expect(
      service.uploadCover(book.id!, buffer, "image/jpeg")
    ).rejects.toThrow("File exceeds maximum size of 5 MB");
  });

  it("rejects file with invalid magic bytes", async () => {
    const book = await service.addBook({ title: "Test", author: "Author" });
    const buffer = Buffer.from("not an image");

    await expect(
      service.uploadCover(book.id!, buffer, "image/jpeg")
    ).rejects.toThrow("File is not a valid image");
  });

  it("deletes old cover when uploading a new one", async () => {
    const book = await service.addBook({ title: "Test", author: "Author" });
    const buffer = createValidJpeg();
    await service.uploadCover(book.id!, buffer, "image/jpeg");

    await service.uploadCover(book.id!, buffer, "image/jpeg");

    expect(coverStorage.deletedUrls).toHaveLength(1);
  });

  it("throws for non-existent book", async () => {
    const buffer = createValidJpeg();

    await expect(
      service.uploadCover(999, buffer, "image/jpeg")
    ).rejects.toThrow("Book not found");
  });
});

describe("BookService.importBook", () => {
  it("imports a book with all fields", async () => {
    const book = await service.importBook({
      title: "Clean Code",
      author: "Robert C. Martin",
      isbn: "9780132350884",
      publicationYear: 2008,
    });

    expect(book.title).toBe("Clean Code");
    expect(book.author).toBe("Robert C. Martin");
    expect(book.isbn).toBe("9780132350884");
    expect(book.publicationYear).toBe(2008);
  });

  it("rejects duplicate ISBN", async () => {
    await service.importBook({
      title: "Clean Code",
      author: "Robert C. Martin",
      isbn: "9780132350884",
      publicationYear: 2008,
    });

    await expect(
      service.importBook({
        title: "Clean Code 2nd",
        author: "Robert C. Martin",
        isbn: "9780132350884",
        publicationYear: 2020,
      })
    ).rejects.toThrow("A book with this ISBN already exists in your wishlist");
  });

  it("allows import without ISBN (no duplicate check)", async () => {
    await service.importBook({ title: "Book A", author: "Author A" });
    const bookB = await service.importBook({ title: "Book B", author: "Author B" });

    expect(bookB.title).toBe("Book B");
  });

  it("allows import without publicationYear", async () => {
    const book = await service.importBook({
      title: "Some Book",
      author: "Author",
      isbn: "9781234567890",
    });

    expect(book.publicationYear).toBeNull();
  });

  it("imports a book with coverImageUrl", async () => {
    const book = await service.importBook({
      title: "Clean Code",
      author: "Robert C. Martin",
      isbn: "9780132350884",
      publicationYear: 2008,
      coverImageUrl: "https://books.google.com/cover.jpg",
    });

    expect(book.coverImageUrl).toBe("https://books.google.com/cover.jpg");
  });

  it("imports a book without coverImageUrl (null)", async () => {
    const book = await service.importBook({
      title: "Some Book",
      author: "Author",
    });

    expect(book.coverImageUrl).toBeNull();
  });
});
