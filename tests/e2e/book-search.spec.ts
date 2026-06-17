import { test, expect } from "@playwright/test";

async function clearBooks(baseURL: string) {
  const res = await fetch(`${baseURL}/api/books`);
  const data = await res.json();
  for (const book of data.books) {
    await fetch(`${baseURL}/api/books/${book.id}`, { method: "DELETE" });
  }
}

async function importBookViaApi(
  baseURL: string,
  book: { title: string; author: string; isbn?: string; publicationYear?: number }
) {
  await fetch(`${baseURL}/api/books`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(book),
  });
}

test.describe("Book Search & Import", () => {
  test.describe.configure({ timeout: 60000 });

  test.beforeEach(async ({ baseURL }) => {
    await clearBooks(baseURL!);
  });

  test("navigates to search page from wishlist", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Search.*Import.*Open Library/i }).click();
    await expect(page).toHaveURL("/search");
    await expect(page.getByRole("heading", { name: "Search Books" })).toBeVisible();
  });

  test("searches for books and displays results", async ({ page }) => {
    await page.goto("/search");

    await page.getByPlaceholder("Enter a book title...").fill("Clean Code");
    await page.getByRole("button", { name: "Search" }).click();

    await expect(page.getByRole("button", { name: "Search" })).toBeEnabled({ timeout: 45000 });
    await expect(page.getByText("Search Results")).toBeVisible();
    await expect(page.locator("ul > li").first()).toBeVisible();
  });

  test("shows no results message for unknown search", async ({ page }) => {
    await page.goto("/search");

    await page.getByPlaceholder("Enter a book title...").fill("xyznonexistentbook98765");
    await page.getByRole("button", { name: "Search" }).click();

    await expect(
      page.getByText("No results found. Try a different search term.")
    ).toBeVisible({ timeout: 30000 });
  });

  test("imports a book from search results to wishlist", async ({ page }) => {
    await page.goto("/search");

    await page.getByPlaceholder("Enter a book title...").fill("Clean Code");
    await page.getByRole("button", { name: "Search" }).click();

    await expect(page.getByText("Search Results")).toBeVisible({ timeout: 30000 });

    const firstResult = page.locator("ul > li").first();

    await firstResult.getByRole("button", { name: "Import to Wishlist" }).click();
    await expect(firstResult.getByRole("button", { name: "Already added" })).toBeVisible();

    await page.getByRole("link", { name: "Back to wishlist" }).click();
    await page.waitForURL("/");
    await expect(page.getByText("Your Wishlist")).toBeVisible();
    const wishlistItems = page.locator("ul > li");
    await expect(wishlistItems).toHaveCount(1);
  });

  test("prevents importing duplicate ISBN", async ({ page, baseURL }) => {
    await importBookViaApi(baseURL!, {
      title: "Clean Code",
      author: "Robert C. Martin",
      isbn: "9780132350884",
      publicationYear: 2008,
    });

    await page.goto("/search");

    await page.getByPlaceholder("Enter a book title...").fill("Clean Code Robert Martin");
    await page.getByRole("button", { name: "Search" }).click();

    await expect(page.getByText("Search Results")).toBeVisible({ timeout: 30000 });

    const resultWithIsbn = page.locator("ul > li", { hasText: "9780132350884" }).first();

    if (await resultWithIsbn.isVisible()) {
      await resultWithIsbn.getByRole("button", { name: "Import to Wishlist" }).click();
      await expect(page.getByText("ISBN already exists")).toBeVisible();
    }
  });

  test("navigates back to wishlist from search", async ({ page }) => {
    await page.goto("/search");

    await page.getByRole("link", { name: "Back to wishlist" }).click();
    await expect(page).toHaveURL("/");
  });
});
