import { BookStatus } from "./book-status";

interface CreateBookProps {
  title: string;
  author: string;
}

interface ImportBookProps {
  title: string;
  author: string;
  isbn?: string;
  publicationYear?: number;
  coverImageUrl?: string;
}

interface ReconstituteBookProps {
  id: number;
  title: string;
  author: string;
  status: BookStatus;
  isbn: string | null;
  publicationYear: number | null;
  readingStartDate: Date | null;
  completionDate: Date | null;
  coverImageUrl: string | null;
  createdAt: Date;
}

export class Book {
  readonly id?: number;
  readonly title: string;
  readonly author: string;
  readonly status: BookStatus;
  readonly isbn: string | null;
  readonly publicationYear: number | null;
  readonly readingStartDate: Date | null;
  readonly completionDate: Date | null;
  readonly coverImageUrl: string | null;
  readonly createdAt?: Date;

  private constructor(props: {
    id?: number;
    title: string;
    author: string;
    status: BookStatus;
    isbn: string | null;
    publicationYear: number | null;
    readingStartDate: Date | null;
    completionDate: Date | null;
    coverImageUrl: string | null;
    createdAt?: Date;
  }) {
    this.id = props.id;
    this.title = props.title;
    this.author = props.author;
    this.status = props.status;
    this.isbn = props.isbn;
    this.publicationYear = props.publicationYear;
    this.readingStartDate = props.readingStartDate;
    this.completionDate = props.completionDate;
    this.coverImageUrl = props.coverImageUrl;
    this.createdAt = props.createdAt;
  }

  static create(props: CreateBookProps): Book {
    const title = props.title.trim();
    const author = props.author.trim();

    if (!title) {
      throw new Error("Title is required");
    }

    if (!author) {
      throw new Error("Author is required");
    }

    return new Book({
      title,
      author,
      status: BookStatus.WISHLIST,
      isbn: null,
      publicationYear: null,
      readingStartDate: null,
      completionDate: null,
      coverImageUrl: null,
    });
  }

  static createFromImport(props: ImportBookProps): Book {
    const title = props.title.trim();
    const author = props.author.trim();

    if (!title) {
      throw new Error("Title is required");
    }

    if (!author) {
      throw new Error("Author is required");
    }

    if (props.publicationYear !== undefined && props.publicationYear <= 0) {
      throw new Error("Publication year must be a positive integer");
    }

    return new Book({
      title,
      author,
      status: BookStatus.WISHLIST,
      isbn: props.isbn ?? null,
      publicationYear: props.publicationYear ?? null,
      readingStartDate: null,
      completionDate: null,
      coverImageUrl: props.coverImageUrl ?? null,
    });
  }

  static reconstitute(props: ReconstituteBookProps): Book {
    return new Book({
      id: props.id,
      title: props.title,
      author: props.author,
      status: props.status,
      isbn: props.isbn,
      publicationYear: props.publicationYear,
      readingStartDate: props.readingStartDate,
      completionDate: props.completionDate,
      coverImageUrl: props.coverImageUrl,
      createdAt: props.createdAt,
    });
  }

  startReading(): Book {
    if (this.status !== BookStatus.WISHLIST) {
      throw new Error("Only wishlist books can be started");
    }
    return Book.reconstitute({
      id: this.id!,
      title: this.title,
      author: this.author,
      status: BookStatus.READING,
      isbn: this.isbn,
      publicationYear: this.publicationYear,
      readingStartDate: new Date(),
      completionDate: null,
      coverImageUrl: this.coverImageUrl,
      createdAt: this.createdAt!,
    });
  }

  markAsCompleted(completionDate: Date): Book {
    if (this.status !== BookStatus.READING) {
      throw new Error("Only reading books can be marked as completed");
    }

    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (completionDate.getTime() > today.getTime()) {
      throw new Error("Completion date cannot be in the future");
    }

    if (this.readingStartDate) {
      const completionDay = new Date(completionDate);
      completionDay.setHours(0, 0, 0, 0);
      const startDay = new Date(this.readingStartDate);
      startDay.setHours(0, 0, 0, 0);
      if (completionDay < startDay) {
        throw new Error("Completion date cannot be before reading start date");
      }
    }

    return Book.reconstitute({
      id: this.id!,
      title: this.title,
      author: this.author,
      status: BookStatus.COMPLETED,
      isbn: this.isbn,
      publicationYear: this.publicationYear,
      readingStartDate: this.readingStartDate,
      completionDate,
      coverImageUrl: this.coverImageUrl,
      createdAt: this.createdAt!,
    });
  }

  withCoverImage(coverImageUrl: string): Book {
    return Book.reconstitute({
      id: this.id!,
      title: this.title,
      author: this.author,
      status: this.status,
      isbn: this.isbn,
      publicationYear: this.publicationYear,
      readingStartDate: this.readingStartDate,
      completionDate: this.completionDate,
      coverImageUrl,
      createdAt: this.createdAt!,
    });
  }
}
