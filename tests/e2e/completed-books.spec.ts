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

async function startReading(baseURL: string, bookId: number) {
  await fetch(`${baseURL}/api/books/${bookId}/start-reading`, {
    method: "PATCH",
  });
}

async function markCompleted(baseURL: string, bookId: number, date: string) {
  await fetch(`${baseURL}/api/books/${bookId}/mark-completed`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completionDate: date }),
  });
}

test.describe("Completed Books", () => {
  test.beforeEach(async ({ baseURL }) => {
    await clearBooks(baseURL!);
  });

  test("marks a reading book as completed via the detail page", async ({
    page,
    baseURL,
  }) => {
    const book = await addBook(baseURL!, "Clean Code", "Robert C. Martin");
    await startReading(baseURL!, book.id);

    await page.goto(`/books/${book.id}`);
    await expect(page.getByText("READING", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "Mark as Completed" }).click();

    await expect(
      page.getByRole("dialog", { name: "Mark as completed" })
    ).toBeVisible();

    await page.getByRole("button", { name: "Confirm" }).click();

    await expect(page.getByText("COMPLETED", { exact: true })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Mark as Completed" })
    ).not.toBeVisible();
  });

  test("hides Mark as Completed button for non-READING books", async ({
    page,
    baseURL,
  }) => {
    const book = await addBook(baseURL!, "Clean Code", "Robert C. Martin");

    await page.goto(`/books/${book.id}`);
    await expect(page.getByText("WISHLIST")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Mark as Completed" })
    ).not.toBeVisible();
  });

  test("cancels mark as completed dialog", async ({ page, baseURL }) => {
    const book = await addBook(baseURL!, "Clean Code", "Robert C. Martin");
    await startReading(baseURL!, book.id);

    await page.goto(`/books/${book.id}`);
    await page.getByRole("button", { name: "Mark as Completed" }).click();
    await expect(
      page.getByRole("dialog", { name: "Mark as completed" })
    ).toBeVisible();

    await page.getByRole("button", { name: "Cancel" }).click();

    await expect(page.getByText("READING", { exact: true })).toBeVisible();
  });

  test("shows completed books on the completed page", async ({
    page,
    baseURL,
  }) => {
    const book = await addBook(baseURL!, "Clean Code", "Robert C. Martin");
    await startReading(baseURL!, book.id);
    const today = new Date().toISOString().split("T")[0];
    await markCompleted(baseURL!, book.id, today!);

    await page.goto("/completed");

    await expect(page.getByRole("heading", { name: "Completed Books" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Clean Code" })).toBeVisible();
    await expect(page.getByText("Robert C. Martin")).toBeVisible();
  });

  test("shows empty state on completed page when no books are completed", async ({
    page,
  }) => {
    await page.goto("/completed");

    await expect(
      page.getByText(
        "No completed books yet. Mark a book as completed to see it here!"
      )
    ).toBeVisible();
  });

  test("completed link appears in navigation", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("link", { name: "Completed" })
    ).toBeVisible();
  });

  test("shows completion date on book detail page for completed books", async ({
    page,
    baseURL,
  }) => {
    const book = await addBook(baseURL!, "Clean Code", "Robert C. Martin");
    await startReading(baseURL!, book.id);
    const today = new Date().toISOString().split("T")[0];
    await markCompleted(baseURL!, book.id, today!);

    await page.goto(`/books/${book.id}`);

    await expect(page.getByText("COMPLETED", { exact: true })).toBeVisible();
    const completedDt = page.locator("dt", { hasText: /^Completed$/ });
    await expect(completedDt).toBeVisible();
  });

  test("does not show completion date for non-completed books", async ({
    page,
    baseURL,
  }) => {
    const book = await addBook(baseURL!, "Clean Code", "Robert C. Martin");
    await startReading(baseURL!, book.id);

    await page.goto(`/books/${book.id}`);

    await expect(page.getByText("READING", { exact: true })).toBeVisible();
    const completedDt = page.locator("dt", { hasText: /^Completed$/ });
    await expect(completedDt).toHaveCount(0);
  });

  test("complete flow: start reading, mark completed, view in completed list, check detail", async ({
    page,
    baseURL,
  }) => {
    const book = await addBook(baseURL!, "Clean Code", "Robert C. Martin");

    await page.goto(`/books/${book.id}`);
    await page.getByRole("button", { name: "Start Reading" }).click();
    await expect(page.getByText("READING", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "Mark as Completed" }).click();
    await page.getByRole("button", { name: "Confirm" }).click();
    await expect(page.getByText("COMPLETED", { exact: true })).toBeVisible();

    await page.getByRole("link", { name: "Completed" }).first().click();
    await expect(page.getByRole("link", { name: "Clean Code" })).toBeVisible();

    await page.getByRole("link", { name: "Clean Code" }).click();
    await expect(page.getByText("COMPLETED", { exact: true })).toBeVisible();
  });
});
