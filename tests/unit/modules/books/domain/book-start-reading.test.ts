import { Book } from "@/modules/books/domain/book";
import { BookStatus } from "@/modules/books/domain/book-status";

describe("Book.startReading", () => {
  function createWishlistBook(): Book {
    return Book.reconstitute({
      id: 1,
      title: "Clean Code",
      author: "Robert C. Martin",
      status: BookStatus.WISHLIST,
      isbn: "978-0132350884",
      publicationYear: 2008,
      readingStartDate: null,
      completionDate: null,
      coverImageUrl: null,
      createdAt: new Date("2026-01-01"),
    });
  }

  it("transitions a WISHLIST book to READING status", () => {
    const book = createWishlistBook();

    const reading = book.startReading();

    expect(reading.status).toBe(BookStatus.READING);
  });

  it("sets readingStartDate to current date", () => {
    const book = createWishlistBook();
    const before = new Date();

    const reading = book.startReading();

    const after = new Date();
    expect(reading.readingStartDate).toBeInstanceOf(Date);
    expect(reading.readingStartDate!.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(reading.readingStartDate!.getTime()).toBeLessThanOrEqual(after.getTime());
  });

  it("preserves all other fields", () => {
    const book = createWishlistBook();

    const reading = book.startReading();

    expect(reading.id).toBe(1);
    expect(reading.title).toBe("Clean Code");
    expect(reading.author).toBe("Robert C. Martin");
    expect(reading.isbn).toBe("978-0132350884");
    expect(reading.publicationYear).toBe(2008);
    expect(reading.createdAt).toEqual(new Date("2026-01-01"));
  });

  it("returns a new Book instance (immutability)", () => {
    const book = createWishlistBook();

    const reading = book.startReading();

    expect(reading).not.toBe(book);
    expect(book.status).toBe(BookStatus.WISHLIST);
    expect(book.readingStartDate).toBeNull();
  });

  it("rejects starting a book already in READING status", () => {
    const book = Book.reconstitute({
      id: 2,
      title: "Refactoring",
      author: "Martin Fowler",
      status: BookStatus.READING,
      isbn: null,
      publicationYear: null,
      readingStartDate: new Date(),
      completionDate: null,
      coverImageUrl: null,
      createdAt: new Date(),
    });

    expect(() => book.startReading()).toThrow("Only wishlist books can be started");
  });
});
