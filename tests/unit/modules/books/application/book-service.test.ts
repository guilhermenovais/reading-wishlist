import { BookService } from "@/modules/books/application/book-service";
import { BookStatus } from "@/modules/books/domain/book-status";
import { InMemoryBookRepository } from "../../../../helpers/in-memory-book-repository";

let service: BookService;
let repository: InMemoryBookRepository;

beforeEach(() => {
  repository = new InMemoryBookRepository();
  service = new BookService(repository);
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
