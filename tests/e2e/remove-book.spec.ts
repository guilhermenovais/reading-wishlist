import { test, expect } from "@playwright/test";

test.describe("Remove Book Flow", () => {
  test("deve permitir remover um livro e voltar à página inicial", async ({ page }) => {
    await page.goto("http://localhost:3000");


    const firstBookLink = page.locator('a[href^="/books/"]').first();

    if (await firstBookLink.count() === 0) {
      test.skip();
      return;
    }

    await firstBookLink.click();

    const removeButton = page.locator('button:has-text("Remove")').first();
    await expect(removeButton).toBeVisible();
    await removeButton.click();


    const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Yes, remove"), button:has-text("Remove")').last();
    await confirmButton.click();

    await expect(page).toHaveURL("http://localhost:3000/");
  });
});