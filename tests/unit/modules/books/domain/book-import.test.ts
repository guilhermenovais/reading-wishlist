import { Book } from "@/modules/books/domain/book";
import { BookStatus } from "@/modules/books/domain/book-status";

describe("Book.createFromImport", () => {
  it("creates a book with all fields", () => {
    const book = Book.createFromImport({
      title: "Clean Code",
      author: "Robert C. Martin",
      isbn: "9780132350884",
      publicationYear: 2008,
    });

    expect(book.title).toBe("Clean Code");
    expect(book.author).toBe("Robert C. Martin");
    expect(book.isbn).toBe("9780132350884");
    expect(book.publicationYear).toBe(2008);
    expect(book.status).toBe(BookStatus.WISHLIST);
  });

  it("creates a book without isbn", () => {
    const book = Book.createFromImport({
      title: "Some Book",
      author: "Author",
    });

    expect(book.isbn).toBeNull();
    expect(book.title).toBe("Some Book");
  });

  it("creates a book without publicationYear", () => {
    const book = Book.createFromImport({
      title: "Some Book",
      author: "Author",
      isbn: "9780132350884",
    });

    expect(book.publicationYear).toBeNull();
  });

  it("trims title and author", () => {
    const book = Book.createFromImport({
      title: "  Clean Code  ",
      author: "  Robert C. Martin  ",
    });

    expect(book.title).toBe("Clean Code");
    expect(book.author).toBe("Robert C. Martin");
  });

  it("throws when title is empty", () => {
    expect(() =>
      Book.createFromImport({ title: "", author: "Author" })
    ).toThrow("Title is required");
  });

  it("throws when author is empty", () => {
    expect(() =>
      Book.createFromImport({ title: "Title", author: "" })
    ).toThrow("Author is required");
  });

  it("throws when publicationYear is not positive (VR-005)", () => {
    expect(() =>
      Book.createFromImport({
        title: "Title",
        author: "Author",
        publicationYear: 0,
      })
    ).toThrow("Publication year must be a positive integer");

    expect(() =>
      Book.createFromImport({
        title: "Title",
        author: "Author",
        publicationYear: -1,
      })
    ).toThrow("Publication year must be a positive integer");
  });
});
