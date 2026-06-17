import { PrismaClient } from "@prisma/client";
import { PrismaBookRepository } from "@/modules/books/infrastructure/prisma-book-repository";
import { Book } from "@/modules/books/domain/book";
import { BookStatus } from "@/modules/books/domain/book-status";

const prisma = new PrismaClient();

let repository: PrismaBookRepository;

beforeAll(async () => {
  repository = new PrismaBookRepository(prisma);
});

beforeEach(async () => {
  await prisma.book.deleteMany();
});

afterAll(async () => {
  await prisma.book.deleteMany();
  await prisma.$disconnect();
});

describe("PrismaBookRepository", () => {
  describe("save", () => {
    it("persists a book and returns it with an id", async () => {
      const book = Book.create({ title: "Clean Code", author: "Robert C. Martin" });
      const saved = await repository.save(book);

      expect(saved.id).toBeDefined();
      expect(saved.title).toBe("Clean Code");
      expect(saved.author).toBe("Robert C. Martin");
      expect(saved.status).toBe(BookStatus.WISHLIST);
      expect(saved.createdAt).toBeInstanceOf(Date);
    });
  });

  describe("findAll", () => {
    it("returns all saved books", async () => {
      await repository.save(Book.create({ title: "Book A", author: "Author A" }));
      await repository.save(Book.create({ title: "Book B", author: "Author B" }));

      const books = await repository.findAll();

      expect(books).toHaveLength(2);
      expect(books[0]!.title).toBe("Book A");
      expect(books[1]!.title).toBe("Book B");
    });

    it("returns empty array when no books exist", async () => {
      const books = await repository.findAll();

      expect(books).toEqual([]);
    });
  });

  describe("findById", () => {
    it("returns book by id", async () => {
      const saved = await repository.save(
        Book.create({ title: "Clean Code", author: "Robert C. Martin" })
      );

      const found = await repository.findById(saved.id!);

      expect(found).not.toBeNull();
      expect(found!.id).toBe(saved.id);
      expect(found!.title).toBe("Clean Code");
    });

    it("returns null for non-existent id", async () => {
      const found = await repository.findById(999);

      expect(found).toBeNull();
    });
  });

  describe("deleteById", () => {
    it("removes an existing book", async () => {
      const saved = await repository.save(
        Book.create({ title: "Clean Code", author: "Robert C. Martin" })
      );

      await repository.deleteById(saved.id!);

      const found = await repository.findById(saved.id!);
      expect(found).toBeNull();
    });

    it("throws when deleting non-existent book", async () => {
      await expect(repository.deleteById(999)).rejects.toThrow("Book not found");
    });
  });

  describe("findByIsbn", () => {
    it("finds a book by ISBN", async () => {
      const book = Book.createFromImport({
        title: "Clean Code",
        author: "Robert C. Martin",
        isbn: "9780132350884",
        publicationYear: 2008,
      });
      await repository.save(book);

      const found = await repository.findByIsbn("9780132350884");

      expect(found).not.toBeNull();
      expect(found!.title).toBe("Clean Code");
      expect(found!.isbn).toBe("9780132350884");
      expect(found!.publicationYear).toBe(2008);
    });

    it("returns null for non-existent ISBN", async () => {
      const found = await repository.findByIsbn("0000000000000");

      expect(found).toBeNull();
    });
  });

  describe("persist and retrieve isbn/publicationYear", () => {
    it("persists and retrieves isbn and publicationYear", async () => {
      const book = Book.createFromImport({
        title: "Test Book",
        author: "Test Author",
        isbn: "9781234567890",
        publicationYear: 2020,
      });
      const saved = await repository.save(book);

      const found = await repository.findById(saved.id!);

      expect(found!.isbn).toBe("9781234567890");
      expect(found!.publicationYear).toBe(2020);
    });

    it("persists null isbn and publicationYear for manually added books", async () => {
      const book = Book.create({ title: "Manual Book", author: "Author" });
      const saved = await repository.save(book);

      const found = await repository.findById(saved.id!);

      expect(found!.isbn).toBeNull();
      expect(found!.publicationYear).toBeNull();
    });
  });
});
