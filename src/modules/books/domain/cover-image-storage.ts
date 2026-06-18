export interface CoverImageStorage {
  save(bookId: number, fileBuffer: Buffer, mimeType: string): Promise<string>;
  delete(imageUrl: string): Promise<void>;
}
