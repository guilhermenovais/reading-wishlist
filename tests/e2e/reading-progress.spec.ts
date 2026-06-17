import { test, expect } from "@playwright/test";

async function clearBooks(baseURL: string) {
  const res = await fetch(`${baseURL}/api/books`);
  const data = await res.json();
  for (const book of data.books) {
    await fetch(`${baseURL}/api/books/${book.id}`, { method: "DELETE" });
  }
}

async function addBook(baseURL: string, title: string, author: string) {
  const res = await fetch(`${baseURL}/api/books`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, author }),
  });
  return res.json();
}

test.describe("Reading Progress", () => {
  test.beforeEach(async ({ baseURL }) => {
    await clearBooks(baseURL!);
  });

  test("starts reading a wishlist book from detail page", async ({ page, baseURL }) => {
    const book = await addBook(baseURL!, "Clean Code", "Robert C. Martin");

    await page.goto(`/books/${book.id}`);
    await expect(page.getByText("WISHLIST")).toBeVisible();
    await expect(page.getByRole("button", { name: "Start Reading" })).toBeVisible();

    await page.getByRole("button", { name: "Start Reading" }).click();

    await expect(page.getByText("READING")).toBeVisible();
    await expect(page.getByText("Reading Since")).toBeVisible();
    await expect(page.getByRole("button", { name: "Start Reading" })).not.toBeVisible();
  });

  test("hides start reading button for books already being read", async ({ page, baseURL }) => {
    const book = await addBook(baseURL!, "Clean Code", "Robert C. Martin");
    await fetch(`${baseURL}/api/books/${book.id}/start-reading`, { method: "PATCH" });

    await page.goto(`/books/${book.id}`);

    await expect(page.getByText("READING")).toBeVisible();
    await expect(page.getByRole("button", { name: "Start Reading" })).not.toBeVisible();
  });

  test("shows reading books on the reading list page", async ({ page, baseURL }) => {
    const book = await addBook(baseURL!, "Clean Code", "Robert C. Martin");
    await addBook(baseURL!, "Refactoring", "Martin Fowler");
    await fetch(`${baseURL}/api/books/${book.id}/start-reading`, { method: "PATCH" });

    await page.goto("/reading");

    await expect(page.getByText("Currently Reading")).toBeVisible();
    await expect(page.getByText("Clean Code")).toBeVisible();
    await expect(page.getByText("Refactoring")).not.toBeVisible();
  });

  test("shows empty state on reading list when no books are being read", async ({ page }) => {
    await page.goto("/reading");

    await expect(
      page.getByText("No books being read. Start reading a book from your wishlist!")
    ).toBeVisible();
  });

  test("shows status badge on book list", async ({ page, baseURL }) => {
    const book = await addBook(baseURL!, "Clean Code", "Robert C. Martin");
    await addBook(baseURL!, "Refactoring", "Martin Fowler");
    await fetch(`${baseURL}/api/books/${book.id}/start-reading`, { method: "PATCH" });

    await page.goto("/");

    const cleanCodeItem = page.getByRole("listitem").filter({ hasText: "Clean Code" });
    await expect(cleanCodeItem.getByText("READING", { exact: true })).toBeVisible();

    const refactoringItem = page.getByRole("listitem").filter({ hasText: "Refactoring" });
    await expect(refactoringItem.getByText("WISHLIST")).toBeVisible();
  });

  test("reading link appears in navigation", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("link", { name: "Reading" })).toBeVisible();
  });

  test("complete flow: start reading, verify detail, check reading list", async ({
    page,
    baseURL,
  }) => {
    const book = await addBook(baseURL!, "Clean Code", "Robert C. Martin");

    await page.goto(`/books/${book.id}`);
    await page.getByRole("button", { name: "Start Reading" }).click();
    await expect(page.getByText("READING")).toBeVisible();

    await page.getByRole("link", { name: "Reading" }).click();
    await expect(page.getByText("Clean Code")).toBeVisible();
    await expect(page.getByText("Reading since")).toBeVisible();
  });
});
