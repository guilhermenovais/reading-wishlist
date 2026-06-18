-- AlterEnum
ALTER TYPE "BookStatus" ADD VALUE 'COMPLETED';

-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "completionDate" TIMESTAMP(3),
ADD COLUMN     "coverImageUrl" TEXT;
