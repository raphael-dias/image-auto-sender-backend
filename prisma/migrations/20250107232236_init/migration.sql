-- AlterTable
ALTER TABLE "User" ADD COLUMN     "categories" TEXT[] DEFAULT ARRAY[]::TEXT[];
