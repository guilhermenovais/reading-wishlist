import { LocalFileCoverImageStorage } from "@/modules/books/infrastructure/local-file-cover-image-storage";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

let storage: LocalFileCoverImageStorage;
let testDir: string;

beforeEach(() => {
  testDir = fs.mkdtempSync(path.join(os.tmpdir(), "cover-test-"));
  storage = new LocalFileCoverImageStorage(testDir);
});

afterEach(() => {
  fs.rmSync(testDir, { recursive: true, force: true });
});

describe("LocalFileCoverImageStorage", () => {
  describe("save", () => {
    it("saves a JPEG file and returns the URL path", async () => {
      const buffer = Buffer.from("fake image data");

      const url = await storage.save(42, buffer, "image/jpeg");

      expect(url).toMatch(/^\/uploads\/covers\/42-\d+\.jpg$/);
      const filename = path.basename(url);
      expect(fs.existsSync(path.join(testDir, filename))).toBe(true);
    });

    it("saves a PNG file with correct extension", async () => {
      const buffer = Buffer.from("fake png data");

      const url = await storage.save(1, buffer, "image/png");

      expect(url).toMatch(/\.png$/);
    });

    it("saves a WebP file with correct extension", async () => {
      const buffer = Buffer.from("fake webp data");

      const url = await storage.save(1, buffer, "image/webp");

      expect(url).toMatch(/\.webp$/);
    });

    it("writes the correct file content", async () => {
      const buffer = Buffer.from("image content here");

      const url = await storage.save(1, buffer, "image/jpeg");

      const filename = path.basename(url);
      const content = fs.readFileSync(path.join(testDir, filename));
      expect(content).toEqual(buffer);
    });
  });

  describe("delete", () => {
    it("deletes an existing file", async () => {
      const buffer = Buffer.from("to delete");
      const url = await storage.save(1, buffer, "image/jpeg");
      const filename = path.basename(url);

      await storage.delete(url);

      expect(fs.existsSync(path.join(testDir, filename))).toBe(false);
    });

    it("does not throw when deleting a non-existent file", async () => {
      await expect(
        storage.delete("/uploads/covers/nonexistent.jpg")
      ).resolves.not.toThrow();
    });
  });
});
