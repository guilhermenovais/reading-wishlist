import { Book } from "@/modules/books/domain/book";
import { BookStatus } from "@/modules/books/domain/book-status";

describe("Book", () => {
  it("creates a valid book with title and author", () => {
    const book = Book.create({ title: "Clean Code", author: "Robert C. Martin" });

    expect(book.title).toBe("Clean Code");
    expect(book.author).toBe("Robert C. Martin");
    expect(book.status).toBe(BookStatus.WISHLIST);
  });

  it("assigns default WISHLIST status", () => {
    const book = Book.create({ title: "Test", author: "Author" });

    expect(book.status).toBe(BookStatus.WISHLIST);
  });

  it("throws when title is missing", () => {
    expect(() => Book.create({ title: "", author: "Author" })).toThrow(
      "Title is required"
    );
  });

  it("throws when author is missing", () => {
    expect(() => Book.create({ title: "Title", author: "" })).toThrow(
      "Author is required"
    );
  });

  it("throws when title is whitespace-only", () => {
    expect(() => Book.create({ title: "   ", author: "Author" })).toThrow(
      "Title is required"
    );
  });

  it("throws when author is whitespace-only", () => {
    expect(() => Book.create({ title: "Title", author: "   " })).toThrow(
      "Author is required"
    );
  });

  it("trims title and author", () => {
    const book = Book.create({ title: "  Clean Code  ", author: "  Robert C. Martin  " });

    expect(book.title).toBe("Clean Code");
    expect(book.author).toBe("Robert C. Martin");
  });

  it("reconstitutes a book with all fields", () => {
    const createdAt = new Date("2026-01-01");
    const book = Book.reconstitute({
      id: 1,
      title: "Clean Code",
      author: "Robert C. Martin",
      status: BookStatus.WISHLIST,
      isbn: null,
      publicationYear: null,
      readingStartDate: null,
      coverImageUrl: null,
      createdAt,
    });

    expect(book.id).toBe(1);
    expect(book.title).toBe("Clean Code");
    expect(book.author).toBe("Robert C. Martin");
    expect(book.status).toBe(BookStatus.WISHLIST);
    expect(book.createdAt).toBe(createdAt);
  });

  it("reconstitutes a book with coverImageUrl", () => {
    const createdAt = new Date("2026-01-01");
    const book = Book.reconstitute({
      id: 1,
      title: "Clean Code",
      author: "Robert C. Martin",
      status: BookStatus.WISHLIST,
      isbn: null,
      publicationYear: null,
      readingStartDate: null,
      coverImageUrl: "https://books.google.com/cover.jpg",
      createdAt,
    });

    expect(book.coverImageUrl).toBe("https://books.google.com/cover.jpg");
  });

  it("creates an imported book with coverImageUrl", () => {
    const book = Book.createFromImport({
      title: "Clean Code",
      author: "Robert C. Martin",
      coverImageUrl: "https://books.google.com/cover.jpg",
    });

    expect(book.coverImageUrl).toBe("https://books.google.com/cover.jpg");
  });

  it("creates an imported book without coverImageUrl", () => {
    const book = Book.createFromImport({
      title: "Clean Code",
      author: "Robert C. Martin",
    });

    expect(book.coverImageUrl).toBeNull();
  });

  it("creates a manually added book with null coverImageUrl", () => {
    const book = Book.create({ title: "My Book", author: "Author" });

    expect(book.coverImageUrl).toBeNull();
  });

  it("returns a new book with coverImageUrl via withCoverImage", () => {
    const book = Book.create({ title: "My Book", author: "Author" });
    const withCover = book.withCoverImage("/uploads/covers/1-123456.jpg");

    expect(withCover.coverImageUrl).toBe("/uploads/covers/1-123456.jpg");
    expect(withCover.title).toBe("My Book");
    expect(book.coverImageUrl).toBeNull();
  });
});
