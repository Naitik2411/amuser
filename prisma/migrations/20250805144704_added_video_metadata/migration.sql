-- AlterTable
ALTER TABLE "public"."Stream" ADD COLUMN     "bigImg" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "smallImg" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "title" TEXT NOT NULL DEFAULT '';
