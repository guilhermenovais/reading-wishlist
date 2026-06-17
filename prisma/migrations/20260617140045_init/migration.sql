-- CreateEnum
CREATE TYPE "BookStatus" AS ENUM ('WISHLIST');

-- CreateTable
CREATE TABLE "Book" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "status" "BookStatus" NOT NULL DEFAULT 'WISHLIST',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);
