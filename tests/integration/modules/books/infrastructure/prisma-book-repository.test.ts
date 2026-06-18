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

  describe("update", () => {
    it("persists status and readingStartDate changes", async () => {
      const book = Book.create({ title: "Clean Code", author: "Robert C. Martin" });
      const saved = await repository.save(book);

      const reading = saved.startReading();
      const updated = await repository.update(reading);

      expect(updated.status).toBe(BookStatus.READING);
      expect(updated.readingStartDate).toBeInstanceOf(Date);
    });

    it("persists all fields correctly after update", async () => {
      const book = Book.createFromImport({
        title: "Refactoring",
        author: "Martin Fowler",
        isbn: "9780201485677",
        publicationYear: 1999,
      });
      const saved = await repository.save(book);
      const reading = saved.startReading();
      const updated = await repository.update(reading);

      const found = await repository.findById(updated.id!);

      expect(found!.title).toBe("Refactoring");
      expect(found!.author).toBe("Martin Fowler");
      expect(found!.status).toBe(BookStatus.READING);
      expect(found!.isbn).toBe("9780201485677");
      expect(found!.publicationYear).toBe(1999);
      expect(found!.readingStartDate).toBeInstanceOf(Date);
    });
  });

  describe("findByStatus", () => {
    it("returns only books with matching status", async () => {
      const book1 = await repository.save(
        Book.create({ title: "Book A", author: "Author A" })
      );
      await repository.save(Book.create({ title: "Book B", author: "Author B" }));
      const reading = book1.startReading();
      await repository.update(reading);

      const readingBooks = await repository.findByStatus(BookStatus.READING);

      expect(readingBooks).toHaveLength(1);
      expect(readingBooks[0]!.title).toBe("Book A");
      expect(readingBooks[0]!.status).toBe(BookStatus.READING);
    });

    it("returns empty array when no books match status", async () => {
      await repository.save(Book.create({ title: "Book A", author: "Author A" }));

      const readingBooks = await repository.findByStatus(BookStatus.READING);

      expect(readingBooks).toEqual([]);
    });
  });

  describe("completionDate persistence", () => {
    it("persists completionDate after marking as completed", async () => {
      const book = Book.create({ title: "Clean Code", author: "Robert C. Martin" });
      const saved = await repository.save(book);
      const reading = saved.startReading();
      const updated = await repository.update(reading);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const completed = updated.markAsCompleted(today);
      const completedSaved = await repository.update(completed);

      const found = await repository.findById(completedSaved.id!);

      expect(found!.status).toBe(BookStatus.COMPLETED);
      expect(found!.completionDate).toBeInstanceOf(Date);
    });

    it("returns null completionDate for non-completed books", async () => {
      const book = Book.create({ title: "Manual Book", author: "Author" });
      const saved = await repository.save(book);

      const found = await repository.findById(saved.id!);

      expect(found!.completionDate).toBeNull();
    });
  });

  describe("coverImageUrl persistence", () => {
    it("persists a book with coverImageUrl", async () => {
      const book = Book.createFromImport({
        title: "Clean Code",
        author: "Robert C. Martin",
        isbn: "9780132350884",
        publicationYear: 2008,
        coverImageUrl: "https://books.google.com/cover.jpg",
      });
      const saved = await repository.save(book);

      const found = await repository.findById(saved.id!);

      expect(found!.coverImageUrl).toBe("https://books.google.com/cover.jpg");
    });

    it("persists a book without coverImageUrl as null", async () => {
      const book = Book.create({ title: "My Book", author: "Author" });
      const saved = await repository.save(book);

      const found = await repository.findById(saved.id!);

      expect(found!.coverImageUrl).toBeNull();
    });

    it("persists updated coverImageUrl", async () => {
      const book = Book.create({ title: "My Book", author: "Author" });
      const saved = await repository.save(book);

      const withCover = saved.withCoverImage("/uploads/covers/1-123456.jpg");
      await repository.update(withCover);

      const found = await repository.findById(saved.id!);

      expect(found!.coverImageUrl).toBe("/uploads/covers/1-123456.jpg");
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
