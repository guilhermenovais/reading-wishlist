import * as fs from "fs/promises";
import * as path from "path";
import { CoverImageStorage } from "../domain/cover-image-storage";

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export class LocalFileCoverImageStorage implements CoverImageStorage {
  constructor(private readonly uploadDir: string) {}

  async save(bookId: number, fileBuffer: Buffer, mimeType: string): Promise<string> {
    const ext = MIME_TO_EXT[mimeType] ?? "bin";
    const filename = `${bookId}-${Date.now()}.${ext}`;
    const filePath = path.join(this.uploadDir, filename);
    await fs.writeFile(filePath, fileBuffer);
    return `/uploads/covers/${filename}`;
  }

  async delete(imageUrl: string): Promise<void> {
    const filename = path.basename(imageUrl);
    const filePath = path.join(this.uploadDir, filename);
    try {
      await fs.unlink(filePath);
    } catch {
      // File may not exist
    }
  }
}
