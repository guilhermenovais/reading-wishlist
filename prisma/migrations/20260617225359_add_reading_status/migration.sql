-- AlterEnum
ALTER TYPE "BookStatus" ADD VALUE 'READING';

-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "readingStartDate" TIMESTAMP(3);
