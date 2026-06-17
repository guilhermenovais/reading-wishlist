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
}

interface ReconstituteBookProps {
  id: number;
  title: string;
  author: string;
  status: BookStatus;
  isbn: string | null;
  publicationYear: number | null;
  readingStartDate: Date | null;
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
  readonly createdAt?: Date;

  private constructor(props: {
    id?: number;
    title: string;
    author: string;
    status: BookStatus;
    isbn: string | null;
    publicationYear: number | null;
    readingStartDate: Date | null;
    createdAt?: Date;
  }) {
    this.id = props.id;
    this.title = props.title;
    this.author = props.author;
    this.status = props.status;
    this.isbn = props.isbn;
    this.publicationYear = props.publicationYear;
    this.readingStartDate = props.readingStartDate;
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
      createdAt: this.createdAt!,
    });
  }
}
