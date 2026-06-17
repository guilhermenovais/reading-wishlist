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
      createdAt,
    });

    expect(book.id).toBe(1);
    expect(book.title).toBe("Clean Code");
    expect(book.author).toBe("Robert C. Martin");
    expect(book.status).toBe(BookStatus.WISHLIST);
    expect(book.createdAt).toBe(createdAt);
  });
});
