import { Book } from "@/modules/books/domain/book";
import { BookStatus } from "@/modules/books/domain/book-status";

describe("Book.markAsCompleted", () => {
  function createReadingBook(overrides?: {
    readingStartDate?: Date;
    coverImageUrl?: string | null;
  }): Book {
    return Book.reconstitute({
      id: 1,
      title: "Clean Code",
      author: "Robert C. Martin",
      status: BookStatus.READING,
      isbn: "978-0132350884",
      publicationYear: 2008,
      readingStartDate: overrides?.readingStartDate ?? new Date("2026-06-01"),
      completionDate: null,
      coverImageUrl: overrides?.coverImageUrl ?? null,
      createdAt: new Date("2026-01-01"),
    });
  }

  it("transitions a READING book to COMPLETED status", () => {
    const book = createReadingBook();

    const completed = book.markAsCompleted(new Date("2026-06-15"));

    expect(completed.status).toBe(BookStatus.COMPLETED);
  });

  it("sets the completion date", () => {
    const book = createReadingBook();
    const completionDate = new Date("2026-06-15");

    const completed = book.markAsCompleted(completionDate);

    expect(completed.completionDate).toEqual(completionDate);
  });

  it("preserves all other fields", () => {
    const book = createReadingBook({ coverImageUrl: "https://example.com/cover.jpg" });

    const completed = book.markAsCompleted(new Date("2026-06-15"));

    expect(completed.id).toBe(1);
    expect(completed.title).toBe("Clean Code");
    expect(completed.author).toBe("Robert C. Martin");
    expect(completed.isbn).toBe("978-0132350884");
    expect(completed.publicationYear).toBe(2008);
    expect(completed.readingStartDate).toEqual(new Date("2026-06-01"));
    expect(completed.coverImageUrl).toBe("https://example.com/cover.jpg");
    expect(completed.createdAt).toEqual(new Date("2026-01-01"));
  });

  it("returns a new Book instance (immutability)", () => {
    const book = createReadingBook();

    const completed = book.markAsCompleted(new Date("2026-06-15"));

    expect(completed).not.toBe(book);
    expect(book.status).toBe(BookStatus.READING);
    expect(book.completionDate).toBeNull();
  });

  it("rejects marking a WISHLIST book as completed", () => {
    const book = Book.reconstitute({
      id: 2,
      title: "Refactoring",
      author: "Martin Fowler",
      status: BookStatus.WISHLIST,
      isbn: null,
      publicationYear: null,
      readingStartDate: null,
      completionDate: null,
      coverImageUrl: null,
      createdAt: new Date(),
    });

    expect(() => book.markAsCompleted(new Date("2026-06-15"))).toThrow(
      "Only reading books can be marked as completed"
    );
  });

  it("rejects marking an already COMPLETED book as completed", () => {
    const book = Book.reconstitute({
      id: 3,
      title: "Refactoring",
      author: "Martin Fowler",
      status: BookStatus.COMPLETED,
      isbn: null,
      publicationYear: null,
      readingStartDate: new Date("2026-06-01"),
      completionDate: new Date("2026-06-10"),
      coverImageUrl: null,
      createdAt: new Date(),
    });

    expect(() => book.markAsCompleted(new Date("2026-06-15"))).toThrow(
      "Only reading books can be marked as completed"
    );
  });

  it("rejects a completion date in the future", () => {
    const book = createReadingBook();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);

    expect(() => book.markAsCompleted(futureDate)).toThrow(
      "Completion date cannot be in the future"
    );
  });

  it("rejects a completion date before the reading start date", () => {
    const book = createReadingBook({ readingStartDate: new Date("2026-06-10") });

    expect(() => book.markAsCompleted(new Date("2026-06-05"))).toThrow(
      "Completion date cannot be before reading start date"
    );
  });

  it("accepts a completion date equal to the reading start date", () => {
    const book = createReadingBook({ readingStartDate: new Date("2026-06-15") });

    const completed = book.markAsCompleted(new Date("2026-06-15"));

    expect(completed.status).toBe(BookStatus.COMPLETED);
    expect(completed.completionDate).toEqual(new Date("2026-06-15"));
  });

  it("accepts today as the completion date", () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const book = createReadingBook({ readingStartDate: new Date("2020-01-01") });

    const completed = book.markAsCompleted(today);

    expect(completed.status).toBe(BookStatus.COMPLETED);
  });
});
