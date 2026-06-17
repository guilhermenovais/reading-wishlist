import { BookStatus } from "./book-status";

interface CreateBookProps {
  title: string;
  author: string;
}

interface ReconstituteBookProps {
  id: number;
  title: string;
  author: string;
  status: BookStatus;
  createdAt: Date;
}

export class Book {
  readonly id?: number;
  readonly title: string;
  readonly author: string;
  readonly status: BookStatus;
  readonly createdAt?: Date;

  private constructor(props: {
    id?: number;
    title: string;
    author: string;
    status: BookStatus;
    createdAt?: Date;
  }) {
    this.id = props.id;
    this.title = props.title;
    this.author = props.author;
    this.status = props.status;
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
    });
  }

  static reconstitute(props: ReconstituteBookProps): Book {
    return new Book({
      id: props.id,
      title: props.title,
      author: props.author,
      status: props.status,
      createdAt: props.createdAt,
    });
  }
}
