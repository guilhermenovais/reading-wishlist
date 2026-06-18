# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: books-wishlist.spec.ts >> Reading Wishlist >> lists multiple books
- Location: tests/e2e/books-wishlist.spec.ts:39:7

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  locator('ul > li')
Expected: 2
Received: 0
Timeout:  5000ms

Call log:
  - Expect "toHaveCount" with timeout 5000ms
  - waiting for locator('ul > li')
    14 × locator resolved to 0 elements
       - unexpected value "0"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - navigation [ref=e3]:
      - link "Wishlist" [ref=e4] [cursor=pointer]:
        - /url: /
      - link "Reading" [ref=e5] [cursor=pointer]:
        - /url: /reading
      - link "Search" [ref=e6] [cursor=pointer]:
        - /url: /search
  - main [ref=e7]:
    - heading "Reading Wishlist" [level=1] [ref=e8]
    - paragraph [ref=e9]:
      - link "Search & Import Books from Google Books" [ref=e10] [cursor=pointer]:
        - /url: /search
    - generic [ref=e11]:
      - heading "Add a Book" [level=2] [ref=e12]
      - alert [ref=e13]: "Invalid `prisma.book.create()` invocation: { data: { title: \"Book Two\", author: \"Author Two\", status: \"WISHLIST\", isbn: null, publicationYear: null, coverImageUrl: null, ~~~~~~~~~~~~~ ? readingStartDate?: DateTime | Null, ? createdAt?: DateTime } } Unknown argument `coverImageUrl`. Available options are marked with ?."
      - generic [ref=e14]:
        - generic [ref=e15]: Title
        - textbox "Title" [ref=e16]: Book Two
      - generic [ref=e17]:
        - generic [ref=e18]: Author
        - textbox "Author" [ref=e19]: Author Two
      - generic [ref=e20]:
        - generic [ref=e21]: Cover Image (optional)
        - button "Cover Image (optional)" [ref=e22]
      - button "Add Book" [ref=e23] [cursor=pointer]
    - paragraph [ref=e24]: Your wishlist is empty. Add a book to get started!
  - button "Open Next.js Dev Tools" [ref=e30] [cursor=pointer]:
    - img [ref=e31]
  - alert [ref=e34]
```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | 
  3   | async function clearBooks(baseURL: string) {
  4   |   const res = await fetch(`${baseURL}/api/books`);
  5   |   const data = await res.json();
  6   |   for (const book of data.books) {
  7   |     await fetch(`${baseURL}/api/books/${book.id}`, { method: "DELETE" });
  8   |   }
  9   | }
  10  | 
  11  | test.describe("Reading Wishlist", () => {
  12  |   test.beforeEach(async ({ page, baseURL }) => {
  13  |     await clearBooks(baseURL!);
  14  |     await page.goto("/");
  15  |   });
  16  | 
  17  |   test("shows empty wishlist message initially", async ({ page }) => {
  18  |     await expect(
  19  |       page.getByText("Your wishlist is empty. Add a book to get started!")
  20  |     ).toBeVisible();
  21  |   });
  22  | 
  23  |   test("adds a book to the wishlist", async ({ page }) => {
  24  |     await page.getByLabel("Title").fill("Clean Code");
  25  |     await page.getByLabel("Author").fill("Robert C. Martin");
  26  |     await page.getByRole("button", { name: "Add Book" }).click();
  27  | 
  28  |     await expect(page.getByText("Clean Code")).toBeVisible();
  29  |     await expect(page.getByText("Robert C. Martin")).toBeVisible();
  30  |   });
  31  | 
  32  |   test("rejects adding a book without title", async ({ page }) => {
  33  |     await page.getByLabel("Author").fill("Some Author");
  34  |     await page.getByRole("button", { name: "Add Book" }).click();
  35  | 
  36  |     await expect(page.getByLabel("Title")).toHaveAttribute("required");
  37  |   });
  38  | 
  39  |   test("lists multiple books", async ({ page }) => {
  40  |     await page.getByLabel("Title").fill("Book One");
  41  |     await page.getByLabel("Author").fill("Author One");
  42  |     await page.getByRole("button", { name: "Add Book" }).click();
  43  |     await expect(page.getByText("Book One")).toBeVisible();
  44  | 
  45  |     await page.getByLabel("Title").fill("Book Two");
  46  |     await page.getByLabel("Author").fill("Author Two");
  47  |     await page.getByRole("button", { name: "Add Book" }).click();
  48  |     await expect(page.getByText("Book Two")).toBeVisible();
  49  | 
  50  |     const items = page.locator("ul > li");
> 51  |     await expect(items).toHaveCount(2);
      |                         ^ Error: expect(locator).toHaveCount(expected) failed
  52  |   });
  53  | 
  54  |   test("views book details", async ({ page }) => {
  55  |     await page.getByLabel("Title").fill("Detail Book");
  56  |     await page.getByLabel("Author").fill("Detail Author");
  57  |     await page.getByRole("button", { name: "Add Book" }).click();
  58  |     await expect(page.getByText("Detail Book")).toBeVisible();
  59  | 
  60  |     await page.getByRole("link", { name: /Detail Book/ }).click();
  61  | 
  62  |     await expect(page.getByText("Book Details")).toBeVisible();
  63  |     await expect(page.getByText("Detail Book")).toBeVisible();
  64  |     await expect(page.getByText("Detail Author")).toBeVisible();
  65  |     await expect(page.getByText("WISHLIST", { exact: true })).toBeVisible();
  66  |   });
  67  | 
  68  |   test("removes a book with confirmation", async ({ page }) => {
  69  |     await page.getByLabel("Title").fill("Remove Me");
  70  |     await page.getByLabel("Author").fill("Test Author");
  71  |     await page.getByRole("button", { name: "Add Book" }).click();
  72  |     await expect(page.getByText("Remove Me")).toBeVisible();
  73  | 
  74  |     await page
  75  |       .getByRole("listitem")
  76  |       .filter({ hasText: "Remove Me" })
  77  |       .getByRole("button", { name: "Remove" })
  78  |       .click();
  79  | 
  80  |     await expect(page.getByRole("dialog")).toBeVisible();
  81  |     await expect(
  82  |       page.getByText("Are you sure you want to remove")
  83  |     ).toBeVisible();
  84  | 
  85  |     await page.getByRole("button", { name: "Confirm" }).click();
  86  | 
  87  |     await expect(
  88  |       page.getByText("Your wishlist is empty. Add a book to get started!")
  89  |     ).toBeVisible();
  90  |     await expect(page.getByRole("listitem")).toHaveCount(0);
  91  |   });
  92  | 
  93  |   test("cancels book removal", async ({ page }) => {
  94  |     await page.getByLabel("Title").fill("Keep Me");
  95  |     await page.getByLabel("Author").fill("Test Author");
  96  |     await page.getByRole("button", { name: "Add Book" }).click();
  97  |     await expect(page.getByText("Keep Me")).toBeVisible();
  98  | 
  99  |     await page
  100 |       .getByRole("listitem")
  101 |       .filter({ hasText: "Keep Me" })
  102 |       .getByRole("button", { name: "Remove" })
  103 |       .click();
  104 |     await expect(page.getByRole("dialog")).toBeVisible();
  105 | 
  106 |     await page.getByRole("button", { name: "Cancel" }).click();
  107 | 
  108 |     await expect(page.getByRole("dialog")).not.toBeVisible();
  109 |     await expect(page.getByText("Keep Me")).toBeVisible();
  110 |   });
  111 | 
  112 |   test("shows placeholder when book has no cover image", async ({ page }) => {
  113 |     await page.getByLabel("Title").fill("No Cover Book");
  114 |     await page.getByLabel("Author").fill("Test Author");
  115 |     await page.getByRole("button", { name: "Add Book" }).click();
  116 |     await expect(page.getByText("No Cover Book")).toBeVisible();
  117 | 
  118 |     await expect(page.getByText("No cover").first()).toBeVisible();
  119 |   });
  120 | 
  121 |   test("displays cover image on wishlist for imported book with cover", async ({
  122 |     page,
  123 |     baseURL,
  124 |   }) => {
  125 |     await fetch(`${baseURL}/api/books`, {
  126 |       method: "POST",
  127 |       headers: { "Content-Type": "application/json" },
  128 |       body: JSON.stringify({
  129 |         title: "Cover Book",
  130 |         author: "Cover Author",
  131 |         isbn: "9780132350884",
  132 |         publicationYear: 2008,
  133 |         coverImageUrl: "https://books.google.com/books/content?id=test",
  134 |       }),
  135 |     });
  136 | 
  137 |     await page.reload();
  138 |     const coverImg = page.getByAltText("Cover of Cover Book");
  139 |     await expect(coverImg).toBeVisible();
  140 |     await expect(coverImg).toHaveAttribute(
  141 |       "src",
  142 |       "https://books.google.com/books/content?id=test"
  143 |     );
  144 |   });
  145 | 
  146 |   test("displays cover image on book detail page", async ({ page, baseURL }) => {
  147 |     const res = await fetch(`${baseURL}/api/books`, {
  148 |       method: "POST",
  149 |       headers: { "Content-Type": "application/json" },
  150 |       body: JSON.stringify({
  151 |         title: "Detail Cover Book",
```