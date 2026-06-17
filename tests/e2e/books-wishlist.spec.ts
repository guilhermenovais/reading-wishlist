import { test, expect } from "@playwright/test";

async function clearBooks(baseURL: string) {
  const res = await fetch(`${baseURL}/api/books`);
  const data = await res.json();
  for (const book of data.books) {
    await fetch(`${baseURL}/api/books/${book.id}`, { method: "DELETE" });
  }
}

test.describe("Reading Wishlist", () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await clearBooks(baseURL!);
    await page.goto("/");
  });

  test("shows empty wishlist message initially", async ({ page }) => {
    await expect(
      page.getByText("Your wishlist is empty. Add a book to get started!")
    ).toBeVisible();
  });

  test("adds a book to the wishlist", async ({ page }) => {
    await page.getByLabel("Title").fill("Clean Code");
    await page.getByLabel("Author").fill("Robert C. Martin");
    await page.getByRole("button", { name: "Add Book" }).click();

    await expect(page.getByText("Clean Code")).toBeVisible();
    await expect(page.getByText("Robert C. Martin")).toBeVisible();
  });

  test("rejects adding a book without title", async ({ page }) => {
    await page.getByLabel("Author").fill("Some Author");
    await page.getByRole("button", { name: "Add Book" }).click();

    await expect(page.getByLabel("Title")).toHaveAttribute("required");
  });

  test("lists multiple books", async ({ page }) => {
    await page.getByLabel("Title").fill("Book One");
    await page.getByLabel("Author").fill("Author One");
    await page.getByRole("button", { name: "Add Book" }).click();
    await expect(page.getByText("Book One")).toBeVisible();

    await page.getByLabel("Title").fill("Book Two");
    await page.getByLabel("Author").fill("Author Two");
    await page.getByRole("button", { name: "Add Book" }).click();
    await expect(page.getByText("Book Two")).toBeVisible();

    const items = page.locator("ul > li");
    await expect(items).toHaveCount(2);
  });

  test("views book details", async ({ page }) => {
    await page.getByLabel("Title").fill("Detail Book");
    await page.getByLabel("Author").fill("Detail Author");
    await page.getByRole("button", { name: "Add Book" }).click();
    await expect(page.getByText("Detail Book")).toBeVisible();

    await page.getByRole("link", { name: /Detail Book/ }).click();

    await expect(page.getByText("Book Details")).toBeVisible();
    await expect(page.getByText("Detail Book")).toBeVisible();
    await expect(page.getByText("Detail Author")).toBeVisible();
    await expect(page.getByText("WISHLIST", { exact: true })).toBeVisible();
  });

  test("removes a book with confirmation", async ({ page }) => {
    await page.getByLabel("Title").fill("Remove Me");
    await page.getByLabel("Author").fill("Test Author");
    await page.getByRole("button", { name: "Add Book" }).click();
    await expect(page.getByText("Remove Me")).toBeVisible();

    await page
      .getByRole("listitem")
      .filter({ hasText: "Remove Me" })
      .getByRole("button", { name: "Remove" })
      .click();

    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(
      page.getByText("Are you sure you want to remove")
    ).toBeVisible();

    await page.getByRole("button", { name: "Confirm" }).click();

    await expect(
      page.getByText("Your wishlist is empty. Add a book to get started!")
    ).toBeVisible();
    await expect(page.getByRole("listitem")).toHaveCount(0);
  });

  test("cancels book removal", async ({ page }) => {
    await page.getByLabel("Title").fill("Keep Me");
    await page.getByLabel("Author").fill("Test Author");
    await page.getByRole("button", { name: "Add Book" }).click();
    await expect(page.getByText("Keep Me")).toBeVisible();

    await page
      .getByRole("listitem")
      .filter({ hasText: "Keep Me" })
      .getByRole("button", { name: "Remove" })
      .click();
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.getByRole("button", { name: "Cancel" }).click();

    await expect(page.getByRole("dialog")).not.toBeVisible();
    await expect(page.getByText("Keep Me")).toBeVisible();
  });
});
